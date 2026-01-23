import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { api } from "../utils/api";
import { detectVisitorTimezone, getDateInTimezone } from "../utils/timezone";
import VideoPlayer from "../components/VideoPlayer";
import WeekCalendar from "../components/WeekCalendar";
import Timeline from "../components/Timeline";
import CameraInfo from "../components/CameraInfo";
import StatsPanel from "../components/StatsPanel";
import ThemeToggle from "../components/ThemeToggle";

export default function StreamView() {
  const { streamId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [stream, setStream] = useState(null);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [statsRange, setStatsRange] = useState("24h");
  const [isLive, setIsLive] = useState(true);
  const [visitorTimezone, setVisitorTimezone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileTab, setMobileTab] = useState("cam"); // 'cam', 'info', 'stats'

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
    const dateParam = searchParams.get("date");
    const eventParam = searchParams.get("event");

    if (dateParam) {
      setSelectedDate(dateParam);
    }

    if (eventParam && events.length > 0) {
      const event = events.find((e) => e.event_id === eventParam);
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
      console.error("Failed to load events:", err);
      setEvents([]);
    }
  }

  async function loadStats() {
    try {
      const data = await api.getStreamStats(streamId, statsRange);
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats:", err);
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
        <div className="text-kanyo-text text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-kanyo-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-kanyo-red text-xl mb-4">
            {error || "Stream not found"}
          </div>
          <Link
            to="/"
            className="text-kanyo-orange hover:text-white transition-colors"
          >
            ← Back to Streams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:min-h-0 h-screen lg:h-auto overflow-hidden lg:overflow-visible bg-kanyo-bg">
      {/* Header */}
      <header>
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-kanyo-card border-b border-kanyo-gray-500 rounded-t-lg lg:rounded-none overflow-hidden">
            {/* Mobile: Title on top, nav below */}
            <div className="lg:hidden">
              <div className="py-3 px-4 border-b border-kanyo-gray-500">
                <h1 className="text-base font-semibold text-kanyo-text text-center truncate">
                  {stream.display?.short_name || stream.name}
                </h1>
              </div>
              <div className="flex items-center justify-between py-2 px-4">
                <Link
                  to="/"
                  className="text-kanyo-orange hover:text-white transition-colors text-sm font-medium"
                >
                  Streams觀鷹
                </Link>
                <div className="flex items-center gap-3">
                  <ThemeToggle />
                  <Link
                    to="/about"
                    className="text-kanyo-gray-100 hover:text-white transition-colors text-sm"
                  >
                    About
                  </Link>
                </div>
              </div>
            </div>

            {/* Desktop: Original single row */}
            <div className="hidden lg:block py-6 px-6">
              <div className="flex items-center justify-between">
                <Link
                  to="/"
                  className="text-kanyo-orange hover:text-white transition-colors"
                >
                  Streams
                </Link>
                <div className="flex items-center gap-3">
                  <svg
                    viewBox="0 0 360.6 198.2"
                    className="h-8 fill-kanyo-orange"
                  >
                    <path d="M44,16h37.4l.9.9v13.7l-.9.9h-22.6l-7.4,11.4h31.4c0,3.3-.1,6.7,0,10s1.2,2.8-.3,3.7h-38.3l-10.6,14.3h13.4c6.2-8.7,19.7-10.4,28.3-4.2s4,4.2,4.3,4.2h10V16h60.3l.9,93.1h-61.1v-26.9l-8.8-.5c-.8.3-1.8,3.6-2.7,4.8-7.9,11-28.6,9.1-32.6-4.3h-12v25.1h49.1v13.7h-19.4v10.9h21.1l-1.1,13.1h-21.1c-1.7,8.3-4.9,16.3-10.3,22.8,14.1-3.8,32.3-12.6,37.7-27.1s2.9-16.1,3.4-24.3h17.1c-.7,9-.7,17.5-3.1,26.3-10.9,39.4-64.6,50.9-99.7,55.4v-21.7c17.5-2.8,33.7-13.4,37.7-31.4h-28l.6-13.1h28.6v-10.9h-28.6v-34.3c-1.9.3-6.3,5.5-7.9,4.5L0,79.1c5.7-4.3,11.4-8.7,16.6-13.7s5.9-5.4,7.4-8.9H6c-1.4,0-.3-3.8-.3-4.8,0-2.7.2-5.4-.5-8l.8-.9h27.7l6.3-11.4h-8.3c-.7,0-7.3,9.2-10.4,10.2-4.5,1.3-10.5-3.5-15-3.9,5.7-4.6,10-8.9,13.2-15.7,1-2.3,2.8-9.5,3.7-10.6,3.4-4,19.1-2.7,23.1,1.4l-2.3,3.1ZM133.7,30.9h-26.9v12.6h26.9v-12.6ZM133.7,56.6h-26.9v12h26l.9-.9v-11.1ZM62.1,73.8c-4.9,1.1-3.3,9.6,3,7.6s3.1-9-3-7.6ZM133.7,81.1h-26.9v14.3h26.9v-14.3Z" />
                    <path d="M216.6,62.8l-18.8,10.7c-.6,22.6,1.1,45.3-1.9,67.8-2.5,18.9-7.7,37.5-17.1,54l-12-4c7.8-17,11.7-35.9,13.1-54.6,1.6-19.8.6-39.1.5-58.8,0-20.7.1-41.3,0-62h66.3s-.6-16-.6-16c10.1.7,20.4.7,30.2,3.5,1.2,1.7-3.6,6.6-4,8.5h49.4c.5,0,4.6,1.2,5.4,1.4,5.6,2,9.5,6.5,10.9,12.2,7.5.4,16.1,1.6,20.2,8.7s2,4.5,2,4.8v8.9c-8.1-4.2-15.7-5.5-24.7-3.8s-16.5,4.9-18.7,11.3h-47.4v11.4h45.1v10.3h-43.7c-.2,0-.6-1-1.4.3v10h45.1v10.3h-45.1v10.3h62.3v9.4l-.9.9h-114.6v-55.4ZM300.6,24.6c5.5,7.5,22.2,13.9,26.1,2,0-.4-1.7-2-1.8-2h-24.3ZM225.7,30.9h-27.1l-.9.9v26.6c1.8-.5,3.6-2.1,5.1-3.2,5.7-4.3,10.8-9.4,15.8-14.5l7.1-9.7ZM260.6,31.4h-14l-9.4,12h14.6l1.4-1,7.4-11ZM290.3,31.4h-10l-8.9,11.4h11.7c1.1-.9,7.8-10.8,7.1-11.4ZM252,55.4h-18.9v11.4h18.9v-11.4ZM252,87.4v-10.9c-.4-.2-.7.6-.9.6h-18v10.3h18.9ZM252,96.5c-6.1.6-12.8,1.2-18.9,0v11.4h18.9v-11.4Z" />
                    <path d="M325.7,124.5v42.8h-100.9l-.8,1c-.5,6.8-3.1,13.8-6.8,19.5s-5.9,7.6-6.4,7.9c-1.9,1-11.8-4.7-14.9-4.3,2.4-3.5,5.4-6.9,7.2-10.8,3-6.6,4-15.3,4.3-22.6.5-11-.4-22.4,0-33.4h118.3ZM224,140.5h85.1v-7.4c-21-.2-42.1.2-63.2,0s-11.5-.5-17.2-.6-2.9.3-4.3.3l-.6,7.8ZM309.2,148h-85.1v8h85.1v-8Z" />
                    <path d="M134.3,116.5v52.8c0,4.9,7.7,6.7,9.5.9s1.4-7.8,1.4-9.5v-12.9l14.3,3.2c-.2,8.4-.2,17.3-1.2,25.6s-1.5,12.7-6.4,15.3-20.3,2.2-25.3,1.6-8.3-3.1-8.3-7.1v-70h16Z" />
                    <path d="M270.9,191.4l-18.9,3.2c-2-8-7.1-14.1-14.6-17.4l-7.6-2.9c12.6-4.3,29.4-7.2,37.6,6.1s3.7,7.4,3.5,11Z" />
                    <path d="M319.4,191.4l-19.4,2.8c-1.4-7.4-5.9-14.4-13-17.6-2.4-1.1-4.7-1.3-7.1-2.1s-1.3,0-1.1-.8c17.3-6.5,38-3.7,40.6,17.7Z" />
                    <path d="M348,180.8c-.7,5.6-5.2,12.1-9.5,15.6l-14.5-5.1c3.8-6.3,5.9-13.8,4-21.1,5.1-.2,10.6-1.5,15.7-1.7s4.3-.2,4.3.9c-.3,3.6.4,7.9,0,11.4Z" />
                  </svg>
                  <h1 className="text-xl font-semibold text-kanyo-text">
                    {stream.name}
                  </h1>
                </div>
                <div className="flex items-center gap-4 mr-4">
                  <ThemeToggle />
                  <Link
                    to="/about"
                    className="text-kanyo-gray-100 hover:text-white transition-colors text-sm"
                  >
                    About
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Tab Navigation - Only visible on mobile */}
      <div className="lg:hidden max-w-5xl mx-auto px-6">
        <div className="bg-kanyo-card border-b border-kanyo-gray-500">
          <div className="flex">
            <button
              onClick={() => setMobileTab("cam")}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                mobileTab === "cam"
                  ? "text-white bg-kanyo-gray-600 border-b-2 border-kanyo-orange"
                  : "text-kanyo-gray-300 hover:text-white"
              }`}
            >
              CAM
            </button>
            <button
              onClick={() => setMobileTab("info")}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                mobileTab === "info"
                  ? "text-white bg-kanyo-gray-600 border-b-2 border-kanyo-orange"
                  : "text-kanyo-gray-300 hover:text-white"
              }`}
            >
              Cam Info
            </button>
            <button
              onClick={() => setMobileTab("stats")}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                mobileTab === "stats"
                  ? "text-white bg-kanyo-gray-600 border-b-2 border-kanyo-orange"
                  : "text-kanyo-gray-300 hover:text-white"
              }`}
            >
              Statistics
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout - Mobile: Fixed height viewport, Desktop: Normal flow */}
      <div className="max-w-5xl mx-auto px-6 py-4 lg:py-6">
        {/* Mobile: Fixed height container to prevent scrolling between tabs */}
        <div
          className="lg:hidden"
          style={{ height: "calc(100vh - 200px)", overflow: "hidden" }}
        >
          {/* Camera Info - Mobile */}
          {mobileTab === "info" && (
            <div className="h-full overflow-y-auto">
              <CameraInfo
                stream={stream}
                visitorTimezone={visitorTimezone}
                onTimezoneChange={setVisitorTimezone}
                className="h-full"
              />
            </div>
          )}

          {/* Video Section - Mobile */}
          {mobileTab === "cam" && (
            <div className="flex flex-col h-full">
              <div className="flex-shrink-0">
                <WeekCalendar
                  streamId={streamId}
                  streamTimezone={stream.timezone}
                  selectedDate={selectedDate}
                  onDateChange={handleDateChange}
                />
              </div>
              <div className="flex-shrink-0">
                <VideoPlayer
                  stream={stream}
                  selectedEvent={selectedEvent}
                  selectedDate={selectedDate}
                  isLive={isLive}
                />
              </div>
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
              {stream?.telegram_channel && (
                <div className="flex-1 flex items-end pt-4 gap-2">
                  <a
                    href={`https://t.me/${stream.telegram_channel.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 flex-[13] bg-kanyo-blue hover:bg-opacity-80 text-white font-medium py-3 px-4 rounded-lg transition-all h-14"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="m12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12c0-6.627-5.373-12-12-12zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
                    </svg>
                    <span>Subscribe to Alerts</span>
                  </a>
                  <Link
                    to="/help/telegram"
                    className="flex items-center justify-center flex-[7] bg-kanyo-orange hover:bg-opacity-80 text-white font-medium py-3 px-4 rounded-lg transition-all text-sm h-14"
                  >
                    How do alerts work?
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Stats Panel - Mobile */}
          {mobileTab === "stats" && (
            <div className="h-full">
              <StatsPanel
                stream={stream}
                stats={stats}
                statsRange={statsRange}
                onRangeChange={setStatsRange}
                className="h-full"
              />
            </div>
          )}
        </div>

        {/* Desktop: Original 3-column grid */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-6 mb-6 items-stretch">
          {/* Camera Info - Left */}
          <div className="lg:col-span-3 h-full">
            <CameraInfo
              stream={stream}
              visitorTimezone={visitorTimezone}
              onTimezoneChange={setVisitorTimezone}
            />
          </div>

          {/* Video Section - Center */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="flex-shrink-0">
              <WeekCalendar
                streamId={streamId}
                streamTimezone={stream.timezone}
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
              />
            </div>
            <div className="flex-shrink-0">
              <VideoPlayer
                stream={stream}
                selectedEvent={selectedEvent}
                selectedDate={selectedDate}
                isLive={isLive}
              />
            </div>
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

          {/* Stats Panel - Right */}
          <div className="lg:col-span-2">
            <StatsPanel
              stream={stream}
              stats={stats}
              statsRange={statsRange}
              onRangeChange={setStatsRange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
