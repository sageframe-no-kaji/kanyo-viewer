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
  const [mobileTab, setMobileTab] = useState('cam'); // 'cam', 'info', 'stats'

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

      {/* Mobile Tab Navigation - Only visible on mobile */}
      <div className="lg:hidden bg-kanyo-card border-b border-kanyo-gray-500">
        <div className="flex">
          <button
            onClick={() => setMobileTab('cam')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              mobileTab === 'cam'
                ? 'text-white bg-kanyo-gray-600 border-b-2 border-kanyo-orange'
                : 'text-kanyo-gray-300 hover:text-white'
            }`}
          >
            CAM
          </button>
          <button
            onClick={() => setMobileTab('info')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              mobileTab === 'info'
                ? 'text-white bg-kanyo-gray-600 border-b-2 border-kanyo-orange'
                : 'text-kanyo-gray-300 hover:text-white'
            }`}
          >
            Cam Info
          </button>
          <button
            onClick={() => setMobileTab('stats')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              mobileTab === 'stats'
                ? 'text-white bg-kanyo-gray-600 border-b-2 border-kanyo-orange'
                : 'text-kanyo-gray-300 hover:text-white'
            }`}
          >
            Statistics
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Unified Rectangle Layout - 3 Columns with Fixed Height */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 lg:h-[600px]">
          {/* Camera Info - Left - Fixed Height on Desktop, Mobile Tab Content */}
          <div className={`lg:col-span-3 lg:h-full ${mobileTab === 'info' ? 'block' : 'hidden lg:block'}`}>
            <CameraInfo
              stream={stream}
              visitorTimezone={visitorTimezone}
              onTimezoneChange={setVisitorTimezone}
              className="h-full overflow-y-auto"
            />
          </div>

          {/* Video Section - Center - Unified Rectangle - Always First on Mobile */}
          <div className={`lg:col-span-7 lg:h-full flex flex-col ${mobileTab === 'cam' ? 'block' : 'hidden lg:flex'}`}>
            {/* Week Calendar */}
            <div className="flex-shrink-0">
              <WeekCalendar
                streamId={streamId}
                streamTimezone={stream.timezone}
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
              />
            </div>
            {/* Video Player */}
            <div className="flex-1 min-h-0">
              <VideoPlayer
                stream={stream}
                selectedEvent={selectedEvent}
                selectedDate={selectedDate}
                isLive={isLive}
              />
            </div>
            {/* Timeline */}
            <div className="flex-shrink-0 mt-3">
              <Timeline
                events={events}
                selectedEvent={selectedEvent}
                onEventSelect={handleEventSelect}
                onLiveClick={handleLiveClick}
                isLive={isLive}
                streamId={streamId}
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                streamTimezone={stream.timezone}
              />
            </div>
          </div>

          {/* Stats Panel - Right - Fixed Height on Desktop, Mobile Tab Content */}
          <div className={`lg:col-span-2 lg:h-full ${mobileTab === 'stats' ? 'block' : 'hidden lg:block'}`}>
            <StatsPanel
              stream={stream}
              stats={stats}
              statsRange={statsRange}
              onRangeChange={setStatsRange}
              className="h-full overflow-y-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
