import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { detectVisitorTimezone, getDateInTimezone } from '../utils/timezone';
import VideoPlayer from '../components/VideoPlayer';
import WeekCalendar from '../components/WeekCalendar';
import Timeline from '../components/Timeline';
import CameraInfo from '../components/CameraInfo';
import StatsPanel from '../components/StatsPanel';

export default function StreamView() {
  const { streamId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [stream, setStream] = useState(null);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [statsRange, setStatsRange] = useState('24h');
  const [isLive, setIsLive] = useState(true);
  const [visitorTimezone, setVisitorTimezone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize timezone
  useEffect(() => {
    detectVisitorTimezone().then(setVisitorTimezone);
  }, []);

  // Load stream detail
  useEffect(() => {
    if (!streamId) return;
    loadStreamDetail();
  }, [streamId]);

  // Load events when date changes
  useEffect(() => {
    if (!streamId || !selectedDate) return;
    loadEvents();
  }, [streamId, selectedDate]);

  // Load stats when range changes
  useEffect(() => {
    if (!streamId) return;
    loadStats();
  }, [streamId, statsRange]);

  // Handle URL params for deep linking
  useEffect(() => {
    const dateParam = searchParams.get('date');
    const eventParam = searchParams.get('event');

    if (dateParam) {
      setSelectedDate(dateParam);
    }

    if (eventParam && events.length > 0) {
      const event = events.find(e => e.event_id === eventParam);
      if (event) {
        setSelectedEvent(event);
        setIsLive(false);
      }
    }
  }, [searchParams, events]);

  async function loadStreamDetail() {
    try {
      setLoading(true);
      const data = await api.getStreamDetail(streamId);
      setStream(data);

      // Set initial date to today in stream's timezone
      const today = getDateInTimezone(new Date(), data.timezone);
      setSelectedDate(today);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadEvents() {
    try {
      const data = await api.getStreamEvents(streamId, selectedDate);
      setEvents(data.events || []);

      // Update selected date if backend returned different date (auto-select most recent)
      if (data.date && data.date !== selectedDate) {
        setSelectedDate(data.date);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
      setEvents([]);
    }
  }

  async function loadStats() {
    try {
      const data = await api.getStreamStats(streamId, statsRange);
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }

  function handleDateChange(date) {
    setSelectedDate(date);
    setSelectedEvent(null);
    setIsLive(false);
    // Update URL
    setSearchParams({ date });
  }

  function handleEventSelect(event) {
    setSelectedEvent(event);
    setIsLive(false);
    // Update URL
    setSearchParams({ date: selectedDate, event: event.event_id });
  }

  function handleLiveClick() {
    setIsLive(true);
    setSelectedEvent(null);
    // Clear URL params
    setSearchParams({});
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-kanyo-bg flex items-center justify-center">
        <div className="text-white text-xl">Loading stream...</div>
      </div>
    );
  }

  if (error || !stream) {
    return (
      <div className="min-h-screen bg-kanyo-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-kanyo-red text-xl mb-4">
            {error || 'Stream not found'}
          </div>
          <Link to="/" className="text-kanyo-orange hover:text-white transition-colors">
            ← Back to Streams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kanyo-bg">
      {/* Header */}
      <header className="border-b border-kanyo-gray-500 bg-kanyo-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-kanyo-orange hover:text-white transition-colors">
              ← Streams
            </Link>
            <h1 className="text-xl font-semibold text-white">
              {stream.name}
            </h1>
            <Link to="/about" className="text-kanyo-gray-100 hover:text-white transition-colors text-sm">
              About
            </Link>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Video Section - 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Camera Info - Left - Fixed Height */}
          <div className="lg:col-span-3">
            <CameraInfo
              stream={stream}
              visitorTimezone={visitorTimezone}
              onTimezoneChange={setVisitorTimezone}
              className="h-[600px] overflow-y-auto"
            />
          </div>

          {/* Video Player - Center */}
          <div className="lg:col-span-7 space-y-6">
            {/* Week Calendar */}
            <WeekCalendar
              streamId={streamId}
              streamTimezone={stream.timezone}
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
            />
            <VideoPlayer
              stream={stream}
              selectedEvent={selectedEvent}
              selectedDate={selectedDate}
              isLive={isLive}
            />
            {/* Timeline - Constrained to video width */}
            <div>
              <Timeline
                events={events}
                selectedEvent={selectedEvent}
                onEventSelect={handleEventSelect}
                onLiveClick={handleLiveClick}
                isLive={isLive}
                streamId={streamId}
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
              />
            </div>
          </div>

          {/* Stats Panel - Right - Fixed Height */}
          <div className="lg:col-span-2">
            <StatsPanel
              stream={stream}
              stats={stats}
              statsRange={statsRange}
              onRangeChange={setStatsRange}
              className="h-[600px] overflow-y-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
