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
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link to="/about" className="text-kanyo-gray-100 hover:text-white transition-colors text-sm">
              About
            </Link>
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 183.3 183.3" className="h-8 text-kanyo-orange" style={{filter: 'invert(60%) sepia(80%) saturate(600%) hue-rotate(350deg)'}}>
                <path d="M143.8,4.7c-1.1-1-2.7-1.4-4.2-1.1l-12.8,2.7c-8.5,1.8-16.8,4.7-24.5,8.6l-13.3,6.7c-4.4,2.2-8.5,4.9-12.3,8.1l-12.9,10.8c-3.7,3.1-6.9,6.7-9.6,10.7-5.1,7.5-8.4,16-9.8,24.9l-.9,5.8c-.4,2.4-.5,4.8-.5,7.2v41.5c0,2.4.2,4.8.5,7.2l.9,5.8c1.4,8.9,4.7,17.4,9.8,24.9,2.7,4,5.9,7.6,9.6,10.7l12.9,10.8c3.8,3.2,7.9,5.9,12.3,8.1l13.3,6.7c7.7,3.9,16,6.8,24.5,8.6l12.8,2.7c1.5.3,3.1-.1,4.2-1.1,1.1-1,1.7-2.4,1.7-3.9V8.6c0-1.5-.6-2.9-1.7-3.9h0Z"/>
                <path d="M177.5,40.5c-1.2-1.3-3-2-4.7-1.8l-13.3,1.2c-8.8.8-17.4,3.3-25.1,7.3l-13.8,7.2c-4.5,2.3-8.7,5.2-12.4,8.6l-13.1,11.4c-3.8,3.3-7,7.1-9.6,11.3-5,7.9-8,16.8-9,26l-.6,6c-.3,2.5-.3,5-.1,7.5l.6,6c1,9.2,4,18.1,9,26,2.6,4.2,5.8,8,9.6,11.3l13.1,11.4c3.7,3.4,7.9,6.3,12.4,8.6l13.8,7.2c7.7,4,16.3,6.5,25.1,7.3l13.3,1.2c1.7.2,3.5-.5,4.7-1.8,1.2-1.3,1.9-3.1,1.7-4.9l-2.4-29.6c-.8-10.1-3.3-20-7.3-29.2l-7.3-16.6c-2.4-5.4-5.2-10.5-8.6-15.2l-11.5-16c-3.3-4.6-7.1-8.6-11.3-12.2-7.9-6.6-16.9-11.4-26.5-14.2l-6-1.8c-2.5-.7-5.1-1.2-7.7-1.5l-6-.6c-9.3-.9-18.8.1-27.7,2.9-4.7,1.5-9.3,3.5-13.6,6-3.9,2.2-7.6,4.8-11,7.8l4.8-5.1c3.1-3.3,6.5-6.3,10.2-8.9,4.3-3,8.9-5.5,13.8-7.5,9.3-3.8,19.3-5.7,29.4-5.4l6,.1c2.6,0,5.1.3,7.7.6l6,1c9.5,1.6,18.7,4.7,27.2,9.3,4.5,2.4,8.8,5.2,12.8,8.5,3.6,2.9,6.9,6.2,9.9,9.7l10.3,12.5c2.8,3.4,5.3,7,7.5,10.8l6.7,11.5c3.4,5.9,6.2,12.1,8.2,18.6l6,19.5c2.6,8.7,4.3,17.7,4.9,26.8l2.4,29.6c.2,1.8-.5,3.6-1.7,4.9-1.2,1.3-3,2-4.7,1.8l-13.3-1.2c-8.8-.8-17.4-3.3-25.1-7.3l-13.8-7.2c-4.5-2.3-8.7-5.2-12.4-8.6l-13.1-11.4c-3.8-3.3-7-7.1-9.6-11.3-5-7.9-8-16.8-9-26l-.6-6c-.3-2.5-.3-5-.1-7.5l.6-6c1-9.2,4-18.1,9-26,2.6-4.2,5.8-8,9.6-11.3l13.1-11.4c3.7-3.4,7.9-6.3,12.4-8.6l13.8-7.2c7.7-4,16.3-6.5,25.1-7.3l13.3-1.2c1.7-.2,3.5.5,4.7,1.8,1.2,1.3,1.9,3.1,1.7,4.9l-2.4,29.6c-.8,10.1-3.3,20-7.3,29.2l-7.3,16.6c-2.4,5.4-5.2,10.5-8.6,15.2l-11.5,16c-3.3,4.6-7.1,8.6-11.3,12.2-7.9,6.6-16.9,11.4-26.5,14.2l-6,1.8c-2.5.7-5.1,1.2-7.7,1.5l-6,.6c-9.3.9-18.8-.1-27.7-2.9-4.7-1.5-9.3-3.5-13.6-6-3.9-2.2-7.6-4.8-11-7.8l-4.8-5.1c3.4,3,7.1,5.6,11,7.8,4.3,2.5,8.9,4.5,13.6,6,8.9,2.8,18.4,3.8,27.7,2.9l6-.6c2.6-.3,5.2-.8,7.7-1.5l6-1.8c9.6-2.8,18.6-7.6,26.5-14.2,4.2-3.6,8-7.6,11.3-12.2l11.5-16c3.4-4.7,6.2-9.8,8.6-15.2l7.3-16.6c4-9.2,6.5-19.1,7.3-29.2l2.4-29.6c.2-1.8-.5-3.6-1.7-4.9h0Z"/>
                <path d="M6.4,71.5c-1.7-.5-3.5.1-4.7,1.6-1.2,1.5-1.5,3.4-.9,5.1l8.5,24.3c3.6,10.3,9.4,19.6,17,27.3l13.8,14c4.5,4.6,9.6,8.7,15.1,12.1l15.4,9.6c5.5,3.4,11.4,6.1,17.5,8l18.3,5.7c10.2,3.2,20.9,4.5,31.5,3.8l16.1-1.1c5.4-.4,10.7-1.2,15.9-2.5,4.7-1.1,9.3-2.6,13.7-4.5l-7.6,3.2c-4.2,1.8-8.6,3.3-13,4.3-5.3,1.2-10.7,2-16.1,2.3l-16.1.9c-10.8.6-21.6-.8-31.9-4.1l-18.3-5.9c-6.1-2-11.9-4.8-17.4-8.3l-15.4-10c-5.5-3.5-10.5-7.7-14.9-12.4l-13.8-14.4c-7.5-7.9-13.2-17.2-16.6-27.5l-8.5-24.3c-.6-1.7-.1-3.6.9-5.1,1.2-1.5,3-2.1,4.7-1.6l24.9,7.7c10.4,3.2,19.9,8.8,27.8,16.4l14.3,13.7c4.7,4.5,8.8,9.5,12.3,14.9l10,15.3c3.5,5.4,6.3,11.2,8.3,17.3l6,18.2c3.3,10.1,4.7,20.8,4.1,31.5l-1.1,16c-.4,5.4-1.2,10.7-2.5,15.9-1.1,4.7-2.6,9.3-4.5,13.7l3.2-7.6c1.8-4.2,3.3-8.6,4.3-13,1.2-5.3,2-10.7,2.3-16.1l.9-16.1c.6-10.8-.8-21.6-4.1-31.9l-5.9-18.3c-2-6.1-4.8-11.9-8.3-17.4l-10-15.4c-3.5-5.5-7.7-10.5-12.4-14.9l-14.4-13.8c-7.9-7.5-17.2-13.2-27.5-16.6l-24.3-8.5Z"/>
              </svg>
              <h1 className="text-xl font-semibold text-white">
                {stream.name}
              </h1>
            </div>
            <Link to="/" className="text-kanyo-orange hover:text-white transition-colors">
              Streams →
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
      <div className="max-w-7xl mx-auto px-6 py-6">
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
