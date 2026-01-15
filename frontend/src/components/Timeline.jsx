import { useRef, useEffect, useState } from 'react';
import { api } from '../utils/api';

export default function Timeline({
  events,
  selectedEvent,
  onEventSelect,
  onLiveClick,
  isLive,
  streamId,
  selectedDate,
  onDateChange
}) {
  const scrollContainerRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState('none');
  const [startHour, setStartHour] = useState(0); // 0 for 12 AM, 12 for 12 PM

  // Auto-scroll to selected event
  useEffect(() => {
    if (selectedEvent && scrollContainerRef.current) {
      const eventEl = scrollContainerRef.current.querySelector(`[data-event-id="${selectedEvent.event_id}"]`);
      if (eventEl) {
        eventEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedEvent]);

  // Handle scroll for continuous timeline
  const handleScroll = (e) => {
    const container = e.target;
    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;

    // If scrolled near the left edge, load previous day
    if (scrollLeft < 100) {
      // TODO: Load previous day's events and prepend
      const prevDate = getPreviousDate(selectedDate);
      if (prevDate && onDateChange) {
        onDateChange(prevDate);
      }
    }
  };

  // Handle 12-hour window change with animation
  const handleTimeWindowChange = (direction) => {
    setSlideDirection(direction);
    setIsTransitioning(true);

    setTimeout(() => {
      if (direction === 'right') {
        // Go back 12 hours
        if (startHour === 0) {
          // Currently showing 12 AM - 12 PM, go to previous day 12 PM - 12 AM
          const prevDate = getPreviousDate(selectedDate);
          if (prevDate) {
            onDateChange(prevDate);
            setStartHour(12);
          }
        } else {
          // Currently showing 12 PM - 12 AM, go to 12 AM - 12 PM same day
          setStartHour(0);
        }
      } else {
        // Go forward 12 hours
        if (startHour === 0) {
          // Currently showing 12 AM - 12 PM, go to 12 PM - 12 AM same day
          setStartHour(12);
        } else {
          // Currently showing 12 PM - 12 AM, go to next day 12 AM - 12 PM
          const nextDate = getNextDate(selectedDate);
          if (nextDate) {
            onDateChange(nextDate);
            setStartHour(0);
          }
        }
      }

      setTimeout(() => {
        setIsTransitioning(false);
        setSlideDirection('none');
      }, 100);
    }, 250);
  };

  // Format date and time range for display
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    const dateText = date.toLocaleDateString('en-US', options);
    const timeRange = startHour === 0 ? '12 AM - 12 PM' : '12 PM - 12 AM';
    return `${dateText} (${timeRange})`;
  };

  // Get filtered events for current 12-hour window
  const getVisibleEvents = () => {
    return events.filter(event => {
      const date = new Date(event.timestamp);
      const hour = date.getHours();
      if (startHour === 0) {
        return hour >= 0 && hour < 12;
      } else {
        return hour >= 12 && hour < 24;
      }
    });
  };

  return (
    <div className="bg-kanyo-card rounded-lg px-4 pt-3 pb-2">
      {/* Date Indicator */}
      <div className="flex items-center justify-center mb-2 pb-2 border-b border-kanyo-gray-600 overflow-hidden">
        <div className={`text-sm font-semibold text-kanyo-gray-100 transition-all duration-300 ease-in-out ${
          isTransitioning
            ? slideDirection === 'left'
              ? 'opacity-0 -translate-x-12'
              : slideDirection === 'right'
              ? 'opacity-0 translate-x-12'
              : 'opacity-0'
            : 'opacity-100 translate-x-0'
        }`}>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-kanyo-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDateDisplay(selectedDate)}</span>
          </div>
        </div>
      </div>

      {/* Visit Info Bar (when event selected) - single line to match LIVE bar height */}
      {selectedEvent && (
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-kanyo-gray-500">
          {/* Left: Combined visit indicator and timing on single line */}
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-kanyo-red font-semibold">
              <span className="w-2 h-2 bg-kanyo-red rounded-full"></span>
              Visit
            </span>
            <span className="text-kanyo-gray-100">Arrived: {formatTime(selectedEvent.timestamp)}</span>
            <span className="text-kanyo-gray-300">•</span>
            <span className="text-kanyo-gray-100">Departed: {formatDepartureTime(selectedEvent)}</span>
            <span className="text-kanyo-gray-300">•</span>
            <span className="text-kanyo-gray-100">Duration: {formatDuration(selectedEvent.duration)}</span>
          </div>

          {/* Right: Action icons */}
          <div className="flex items-center gap-2">
            <a
              href={api.getClipUrl(streamId, selectedDate, selectedEvent.clip)}
              download
              className="p-2 hover:bg-kanyo-gray-600 rounded transition-all"
              title="Download clip"
            >
              <svg className="w-5 h-5 text-kanyo-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>
            <button
              onClick={() => handleShare(selectedEvent)}
              className="p-2 hover:bg-kanyo-gray-600 rounded transition-all"
              title="Share clip"
            >
              <svg className="w-5 h-5 text-kanyo-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 12-hour timeline - no header, LIVE button inline */}
      <div className="relative h-24">
        {/* Left scroll arrow - go back 12 hours */}
        <button
          onClick={() => handleTimeWindowChange('right')}
          disabled={isTransitioning}
          className="absolute left-0 top-0 bottom-0 z-50 w-10 bg-gradient-to-r from-kanyo-card to-transparent hover:from-kanyo-gray-700/80 transition-all flex items-center justify-start pl-2 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Previous 12 hours"
        >
          <svg className="w-5 h-5 text-white opacity-70 hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Right scroll arrow - go forward 12 hours */}
        <button
          onClick={() => handleTimeWindowChange('left')}
          disabled={isTransitioning}
          className="absolute right-0 top-0 bottom-0 z-50 w-10 bg-gradient-to-l from-kanyo-card to-transparent hover:from-kanyo-gray-700/80 transition-all flex items-center justify-end pr-2 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Next 12 hours"
        >
          <svg className="w-5 h-5 text-white opacity-70 hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        {/* Hour grid lines */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: 13 }).map((_, index) => {
            const hour = startHour + index;
            const displayHour = hour % 24;
            const isPM = displayHour >= 12;
            const display12Hour = displayHour === 0 ? 12 : displayHour > 12 ? displayHour - 12 : displayHour;

            return (
              <div
                key={index}
                className="flex-1 border-l border-kanyo-gray-600 first:border-l-0"
              >
                {index % 3 === 0 && index < 12 && (
                  <div className={`absolute text-xs text-kanyo-gray-100 -translate-x-1/2 top-[72px] transition-all duration-300 ease-in-out ${
                    isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                  }`}>
                    {display12Hour} {isPM ? 'PM' : 'AM'}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Event clips with proportional widths */}
        <div
          ref={scrollContainerRef}
          className={`absolute inset-0 overflow-x-auto scrollbar-thin transition-all duration-300 ease-in-out ${
            isTransitioning ? 'opacity-20' : 'opacity-100'
          }`}
          onScroll={handleScroll}
        >
          <div className={`relative h-full transition-all duration-300 ease-in-out ${
            isTransitioning
              ? slideDirection === 'left'
                ? '-translate-x-16 scale-95'
                : slideDirection === 'right'
                ? 'translate-x-16 scale-95'
                : ''
              : 'translate-x-0 scale-100'
          }`} style={{ minWidth: '100%' }}>
            {getVisibleEvents().length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 83.5 98.3" className="w-12 h-12 opacity-20" style={{filter: 'invert(60%) sepia(80%) saturate(600%) hue-rotate(350deg)'}}>
                  <path d="M73.2,11.4c-1.3-1.8-2.9-3.3-4.8-4.5-4.4-2.8-9.3-4.6-14.4-5.4-6.1-1.2-12.5-1.1-18.6.3-3.9.9-7.6,2.7-10.8,5.2-3.2,2.6-5.7,5.9-7.4,9.7-1,2.2-1.9,4.5-2.9,6.7-1.3,3.2-2.8,6.3-4.3,9.4-1.4,2.8-2.8,5.6-4,8.5-.8,1.9-1.8,3.7-3.1,5.4-.8.9-1.7,1.6-2.7,2.1-.3.1-.2.5-.2.8,0,8.5,0,17,0,25.5,2.3-6.3,5.4-12.3,9.2-17.9,2.5-3.6,5.4-6.9,8.8-9.7-3.9,5.4-7.1,11.2-9.8,17.2-2.2,4.9-4.1,9.9-5.5,15.1-1.6,5.6-2.4,11.4-2.3,17.2,1.8-1.8,3.5-3.6,5.2-5.3,10.3-10.4,20.6-20.7,30.8-31.2.6-.7,1.2-1.4,1.9-2-3.1,4.3-6,8.8-9,13.2-3.1,4.7-6.1,9.4-9,14.1-2.5,4.2-4.9,8.3-7.3,12.5,2.4.1,4.9.2,7.3.4.6-.6,1.2-1.2,1.8-1.8,3.5-3.6,6.9-7.2,10.4-10.9,3.5-3.7,7.1-7.4,10.6-11.1,0,.3-.4.5-.5.8-1.6,3.3-3.2,6.5-4.8,9.7-2.1,4.3-4.3,8.5-6.3,12.8,2,0,4,.2,6,.2.2,0,.4,0,.6,0,.7-.6,1.3-1.2,1.9-1.8h0c5.9-5.7,11.1-12,15.6-18.8-.5,2.3-.9,4.7-1.3,7-.7,3.7-1.4,7.3-2.1,11,0,.3-.2.7,0,1h0c.2.2.4.2.6.2.2,0,.4,0,.6-.3.8-.8,1.5-1.8,2.2-2.7,2.1-3.1,3.7-6.5,4.9-10,1.2-3.5,2.1-7,2.5-10.7,1-6.6.8-13.4-.5-20-.2-.9-.4-1.9-.7-2.8-.7-1.8-1.1-3.7-1-5.6.1-2.3.9-4.6,2.2-6.5,1.3-1.9,3-3.7,4.9-5-1.4.3-2.9,0-4.3-.6-1-.7-1.5-1.9-2.5-2.7h0c-.4-.3-.9-.4-1.4-.4-2.2,0-4.5,0-6.7,0h0c-1,0-1.8-.8-1.8-1.8s.7-1.8,1.7-1.9c1.4,0,2.8,0,4.2,0,.9,0,1.7-.2,2.5-.7,1.9-1,3.4-2.5,4.2-4.5.5-1.3.6-2.7.3-4,.6,0,1.3,0,1.9,0,.9-.5,1.7-1.2,2.4-1.9.8-.7,1.4-1.6,2.4-1.8,1.5-.2,2.9.3,4,1.3-.4-1.1-1-2.2-1.7-3.1h0ZM54.3,20.4c-1.4,1.7-3.3,2.8-5.4,3.1-2.1,0-4.1-.5-6-1.4-3-1.2-6.2-1.8-9.5-1.5-2.9.3-5.7,1.4-8.1,3.2-2.9,2.1-5.4,4.8-7.3,7.8-1.7,2.5-3.1,5.2-4.2,8-.7,1.8-1.3,3.7-1.7,5.6.2-1.6.5-3.2,1-4.8.9-3.6,2.2-7.2,4.1-10.4,1.5-2.8,3.4-5.3,5.8-7.4,2.1-1.9,4.6-3.2,7.3-3.9-1.7-.7-3.2-1.7-4.4-3,2.3.9,4.7,1.3,7.1,1.2,1.6,0,3.2-.3,4.8-.7,1.2-.3,2.4-.7,3.7-1h0c1.3-.3,2.6-.6,3.9-.7-1.1.7-1.9,1.8-2.1,3.1-.2,1.3.2,2.6,1.1,3.6,1.5,1.7,3.9,2.1,5.8.9,1.9-1.2,2.6-3.6,1.8-5.6-.3-.8-.9-1.5-1.7-1.9,2.2.3,4.4.7,6.6,1.3-.4,1.8-1.3,3.4-2.6,4.7h0Z"/>
                  <path d="M83.3,25.9c-.6-4-3-7.4-6.6-9.3-.5-.1-1.1,0-1.5.5-3.2,3-6.4,6.1-9.6,9.1-.4.4-.8.7-1.1,1.1h0c-.2.3-.3.6-.2.9,0,.3.3.6.6.7.3.2.8.2,1.1.5.5.6.9,1.3,1.4,1.8,1,1.1,2.2,1.8,3.6,2.2,2.3.6,4.7.3,6.7-1,.4,2.1.8,4.2,1.2,6.4,3.6-3.2,5.3-8.1,4.5-12.8h0Z"/>
                </svg>
              </div>
            )}

            {getVisibleEvents().map((event, index) => {
              const { left, width } = calculateEventPosition(event, startHour);
              const isSelected = selectedEvent?.event_id === event.event_id;

              return (
                <button
                  key={event.event_id}
                  data-event-id={event.event_id}
                  onClick={() => onEventSelect(event)}
                  className={`
                    absolute top-0 h-14 rounded overflow-hidden
                    transition-all group
                    ${isSelected
                      ? 'ring-2 ring-kanyo-orange scale-y-110'
                      : 'hover:scale-y-105 ring-1 ring-kanyo-gray-500'
                    }
                  `}
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    zIndex: isSelected ? 20 : index + 1,
                  }}
                >
                  {/* Thumbnail with fallback */}
                  {event.thumbnail ? (
                    <img
                      src={api.getClipUrl(streamId, selectedDate, event.thumbnail)}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}

                  {/* Fallback placeholder when thumbnail missing */}
                  <div
                    className="w-full h-full bg-kanyo-orange/20 items-center justify-center"
                    style={{ display: event.thumbnail ? 'none' : 'flex' }}
                  >
                    <svg viewBox="0 0 83.5 98.3" className="w-8 h-8 opacity-40" style={{filter: 'invert(60%) sepia(80%) saturate(600%) hue-rotate(350deg)'}}>
                      <path d="M73.2,11.4c-1.3-1.8-2.9-3.3-4.8-4.5-4.4-2.8-9.3-4.6-14.4-5.4-6.1-1.2-12.5-1.1-18.6.3-3.9.9-7.6,2.7-10.8,5.2-3.2,2.6-5.7,5.9-7.4,9.7-1,2.2-1.9,4.5-2.9,6.7-1.3,3.2-2.8,6.3-4.3,9.4-1.4,2.8-2.8,5.6-4,8.5-.8,1.9-1.8,3.7-3.1,5.4-.8.9-1.7,1.6-2.7,2.1-.3.1-.2.5-.2.8,0,8.5,0,17,0,25.5,2.3-6.3,5.4-12.3,9.2-17.9,2.5-3.6,5.4-6.9,8.8-9.7-3.9,5.4-7.1,11.2-9.8,17.2-2.2,4.9-4.1,9.9-5.5,15.1-1.6,5.6-2.4,11.4-2.3,17.2,1.8-1.8,3.5-3.6,5.2-5.3,10.3-10.4,20.6-20.7,30.8-31.2.6-.7,1.2-1.4,1.9-2-3.1,4.3-6,8.8-9,13.2-3.1,4.7-6.1,9.4-9,14.1-2.5,4.2-4.9,8.3-7.3,12.5,2.4.1,4.9.2,7.3.4.6-.6,1.2-1.2,1.8-1.8,3.5-3.6,6.9-7.2,10.4-10.9,3.5-3.7,7.1-7.4,10.6-11.1,0,.3-.4.5-.5.8-1.6,3.3-3.2,6.5-4.8,9.7-2.1,4.3-4.3,8.5-6.3,12.8,2,0,4,.2,6,.2.2,0,.4,0,.6,0,.7-.6,1.3-1.2,1.9-1.8h0c5.9-5.7,11.1-12,15.6-18.8-.5,2.3-.9,4.7-1.3,7-.7,3.7-1.4,7.3-2.1,11,0,.3-.2.7,0,1h0c.2.2.4.2.6.2.2,0,.4,0,.6-.3.8-.8,1.5-1.8,2.2-2.7,2.1-3.1,3.7-6.5,4.9-10,1.2-3.5,2.1-7,2.5-10.7,1-6.6.8-13.4-.5-20-.2-.9-.4-1.9-.7-2.8-.7-1.8-1.1-3.7-1-5.6.1-2.3.9-4.6,2.2-6.5,1.3-1.9,3-3.7,4.9-5-1.4.3-2.9,0-4.3-.6-1-.7-1.5-1.9-2.5-2.7h0c-.4-.3-.9-.4-1.4-.4-2.2,0-4.5,0-6.7,0h0c-1,0-1.8-.8-1.8-1.8s.7-1.8,1.7-1.9c1.4,0,2.8,0,4.2,0,.9,0,1.7-.2,2.5-.7,1.9-1,3.4-2.5,4.2-4.5.5-1.3.6-2.7.3-4,.6,0,1.3,0,1.9,0,.9-.5,1.7-1.2,2.4-1.9.8-.7,1.4-1.6,2.4-1.8,1.5-.2,2.9.3,4,1.3-.4-1.1-1-2.2-1.7-3.1h0ZM54.3,20.4c-1.4,1.7-3.3,2.8-5.4,3.1-2.1,0-4.1-.5-6-1.4-3-1.2-6.2-1.8-9.5-1.5-2.9.3-5.7,1.4-8.1,3.2-2.9,2.1-5.4,4.8-7.3,7.8-1.7,2.5-3.1,5.2-4.2,8-.7,1.8-1.3,3.7-1.7,5.6.2-1.6.5-3.2,1-4.8.9-3.6,2.2-7.2,4.1-10.4,1.5-2.8,3.4-5.3,5.8-7.4,2.1-1.9,4.6-3.2,7.3-3.9-1.7-.7-3.2-1.7-4.4-3,2.3.9,4.7,1.3,7.1,1.2,1.6,0,3.2-.3,4.8-.7,1.2-.3,2.4-.7,3.7-1h0c1.3-.3,2.6-.6,3.9-.7-1.1.7-1.9,1.8-2.1,3.1-.2,1.3.2,2.6,1.1,3.6,1.5,1.7,3.9,2.1,5.8.9,1.9-1.2,2.6-3.6,1.8-5.6-.3-.8-.9-1.5-1.7-1.9,2.2.3,4.4.7,6.6,1.3-.4,1.8-1.3,3.4-2.6,4.7h0Z"/>
                      <path d="M83.3,25.9c-.6-4-3-7.4-6.6-9.3-.5-.1-1.1,0-1.5.5-3.2,3-6.4,6.1-9.6,9.1-.4.4-.8.7-1.1,1.1h0c-.2.3-.3.6-.2.9,0,.3.3.6.6.7.3.2.8.2,1.1.5.5.6.9,1.3,1.4,1.8,1,1.1,2.2,1.8,3.6,2.2,2.3.6,4.7.3,6.7-1,.4,2.1.8,4.2,1.2,6.4,3.6-3.2,5.3-8.1,4.5-12.8h0Z"/>
                    </svg>
                  </div>

                  {/* Falcon SVG icon at start */}
                  <div className="absolute top-0.5 left-0.5 w-4 h-4">
                    <svg viewBox="0 0 83.5 98.3" className="w-full h-full" style={{filter: 'invert(60%) sepia(80%) saturate(600%) hue-rotate(350deg) brightness(1.2)'}}>
                      <path d="M73.2,11.4c-1.3-1.8-2.9-3.3-4.8-4.5-4.4-2.8-9.3-4.6-14.4-5.4-6.1-1.2-12.5-1.1-18.6.3-3.9.9-7.6,2.7-10.8,5.2-3.2,2.6-5.7,5.9-7.4,9.7-1,2.2-1.9,4.5-2.9,6.7-1.3,3.2-2.8,6.3-4.3,9.4-1.4,2.8-2.8,5.6-4,8.5-.8,1.9-1.8,3.7-3.1,5.4-.8.9-1.7,1.6-2.7,2.1-.3.1-.2.5-.2.8,0,8.5,0,17,0,25.5,2.3-6.3,5.4-12.3,9.2-17.9,2.5-3.6,5.4-6.9,8.8-9.7-3.9,5.4-7.1,11.2-9.8,17.2-2.2,4.9-4.1,9.9-5.5,15.1-1.6,5.6-2.4,11.4-2.3,17.2,1.8-1.8,3.5-3.6,5.2-5.3,10.3-10.4,20.6-20.7,30.8-31.2.6-.7,1.2-1.4,1.9-2-3.1,4.3-6,8.8-9,13.2-3.1,4.7-6.1,9.4-9,14.1-2.5,4.2-4.9,8.3-7.3,12.5,2.4.1,4.9.2,7.3.4.6-.6,1.2-1.2,1.8-1.8,3.5-3.6,6.9-7.2,10.4-10.9,3.5-3.7,7.1-7.4,10.6-11.1,0,.3-.4.5-.5.8-1.6,3.3-3.2,6.5-4.8,9.7-2.1,4.3-4.3,8.5-6.3,12.8,2,0,4,.2,6,.2.2,0,.4,0,.6,0,.7-.6,1.3-1.2,1.9-1.8h0c5.9-5.7,11.1-12,15.6-18.8-.5,2.3-.9,4.7-1.3,7-.7,3.7-1.4,7.3-2.1,11,0,.3-.2.7,0,1h0c.2.2.4.2.6.2.2,0,.4,0,.6-.3.8-.8,1.5-1.8,2.2-2.7,2.1-3.1,3.7-6.5,4.9-10,1.2-3.5,2.1-7,2.5-10.7,1-6.6.8-13.4-.5-20-.2-.9-.4-1.9-.7-2.8-.7-1.8-1.1-3.7-1-5.6.1-2.3.9-4.6,2.2-6.5,1.3-1.9,3-3.7,4.9-5-1.4.3-2.9,0-4.3-.6-1-.7-1.5-1.9-2.5-2.7h0c-.4-.3-.9-.4-1.4-.4-2.2,0-4.5,0-6.7,0h0c-1,0-1.8-.8-1.8-1.8s.7-1.8,1.7-1.9c1.4,0,2.8,0,4.2,0,.9,0,1.7-.2,2.5-.7,1.9-1,3.4-2.5,4.2-4.5.5-1.3.6-2.7.3-4,.6,0,1.3,0,1.9,0,.9-.5,1.7-1.2,2.4-1.9.8-.7,1.4-1.6,2.4-1.8,1.5-.2,2.9.3,4,1.3-.4-1.1-1-2.2-1.7-3.1h0ZM54.3,20.4c-1.4,1.7-3.3,2.8-5.4,3.1-2.1,0-4.1-.5-6-1.4-3-1.2-6.2-1.8-9.5-1.5-2.9.3-5.7,1.4-8.1,3.2-2.9,2.1-5.4,4.8-7.3,7.8-1.7,2.5-3.1,5.2-4.2,8-.7,1.8-1.3,3.7-1.7,5.6.2-1.6.5-3.2,1-4.8.9-3.6,2.2-7.2,4.1-10.4,1.5-2.8,3.4-5.3,5.8-7.4,2.1-1.9,4.6-3.2,7.3-3.9-1.7-.7-3.2-1.7-4.4-3,2.3.9,4.7,1.3,7.1,1.2,1.6,0,3.2-.3,4.8-.7,1.2-.3,2.4-.7,3.7-1h0c1.3-.3,2.6-.6,3.9-.7-1.1.7-1.9,1.8-2.1,3.1-.2,1.3.2,2.6,1.1,3.6,1.5,1.7,3.9,2.1,5.8.9,1.9-1.2,2.6-3.6,1.8-5.6-.3-.8-.9-1.5-1.7-1.9,2.2.3,4.4.7,6.6,1.3-.4,1.8-1.3,3.4-2.6,4.7h0Z"/>
                      <path d="M83.3,25.9c-.6-4-3-7.4-6.6-9.3-.5-.1-1.1,0-1.5.5-3.2,3-6.4,6.1-9.6,9.1-.4.4-.8.7-1.1,1.1h0c-.2.3-.3.6-.2.9,0,.3.3.6.6.7.3.2.8.2,1.1.5.5.6.9,1.3,1.4,1.8,1,1.1,2.2,1.8,3.6,2.2,2.3.6,4.7.3,6.7-1,.4,2.1.8,4.2,1.2,6.4,3.6-3.2,5.3-8.1,4.5-12.8h0Z"/>
                    </svg>
                  </div>

                  {/* Duration on hover */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatDuration(event.duration)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* LIVE button - fixed position, doesn't scroll */}
        <button
          onClick={onLiveClick}
          className={`
            absolute top-1 right-2 px-3 py-1.5 rounded font-semibold text-xs transition-all z-50
            ${isLive
              ? 'bg-kanyo-red text-white'
              : 'bg-kanyo-gray-600/90 text-white hover:bg-kanyo-gray-500'
            }
          `}
        >
          <span className="flex items-center gap-1">
            {isLive && <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>}
            LIVE
          </span>
        </button>
      </div>
    </div>
  );
}

/**
 * Calculate event position and width on 12-hour timeline
 */
function calculateEventPosition(event, startHour) {
  if (!event.timestamp || !event.duration) return { left: 0, width: 0 };

  const date = new Date(event.timestamp);
  const hour = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  // Calculate minutes from start of current 12-hour window
  const eventMinutesFromDayStart = hour * 60 + minutes + seconds / 60;
  const windowStartMinutes = startHour * 60;
  const minutesFromWindowStart = eventMinutesFromDayStart - windowStartMinutes;

  // If event is outside the window, don't show it
  if (minutesFromWindowStart < 0 || minutesFromWindowStart >= 720) {
    return { left: 0, width: 0 };
  }

  let durationMinutes = event.duration / 60;

  // Scale clips shorter than 30 minutes to appear as 30 minutes
  if (durationMinutes < 30) {
    durationMinutes = 30;
  }

  // Position as percentage of 12 hours (720 minutes)
  const left = (minutesFromWindowStart / 720) * 100;
  const width = (durationMinutes / 720) * 100;

  // Ensure clips don't overflow timeline
  return {
    left,
    width: Math.min(width, 100 - left)
  };
}

/**
 * Format timestamp to time only
 */
function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Format departure time (arrival + duration)
 */
function formatDepartureTime(event) {
  if (!event.timestamp || !event.duration) return '';
  const arrival = new Date(event.timestamp);
  const departure = new Date(arrival.getTime() + event.duration * 1000);
  return departure.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Handle share functionality
 */
function handleShare(event) {
  const shareUrl = `${window.location.origin}${window.location.pathname}?date=${event.timestamp.split('T')[0]}&event=${event.event_id}`;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(shareUrl)
      .then(() => alert('Link copied to clipboard!'))
      .catch(() => fallbackCopy(shareUrl));
  } else {
    fallbackCopy(shareUrl);
  }
}

function fallbackCopy(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
  alert('Link copied to clipboard!');
}

/**
 * Format duration in seconds to readable string
 */
function formatDuration(seconds) {
  if (!seconds) return '0s';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Get previous date
 */
function getPreviousDate(dateStr) {
  const date = new Date(dateStr + 'T12:00:00');
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

/**
 * Get next date
 */
function getNextDate(dateStr) {
  const date = new Date(dateStr + 'T12:00:00');
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
}
