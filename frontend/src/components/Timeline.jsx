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

  return (
    <div className="bg-kanyo-card rounded-t-lg px-4 pt-4 pb-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-sm">Timeline</h3>
        <button
          onClick={onLiveClick}
          className={`
            px-3 py-1.5 rounded-lg font-semibold text-xs transition-all
            ${isLive
              ? 'bg-kanyo-red text-white'
              : 'bg-kanyo-gray-600 text-white hover:bg-kanyo-gray-500'
            }
          `}
        >
          <span className="flex items-center">
            {isLive && <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse"></span>}
            LIVE
          </span>
        </button>
      </div>

      {/* Compact 24-hour timeline with hour markers */}
      <div className="relative h-20">
        {/* Hour grid lines */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: 25 }).map((_, hour) => (
            <div
              key={hour}
              className="flex-1 border-l border-kanyo-gray-600 first:border-l-0"
            >
              {hour % 6 === 0 && hour < 24 && (
                <div className="text-xs text-kanyo-gray-100 -translate-x-1/2 mt-16">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Event clips with proportional widths */}
        <div
          ref={scrollContainerRef}
          className="absolute inset-0 overflow-x-auto scrollbar-thin"
          onScroll={handleScroll}
        >
          <div className="relative h-full" style={{ minWidth: '100%' }}>
            {events.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src="/falcon-silhouette.svg"
                  alt=""
                  className="w-12 h-12 opacity-20"
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            )}

            {events.map((event) => {
              const { left, width } = calculateEventPosition(event);
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
                      ? 'ring-2 ring-kanyo-orange z-10 scale-y-110'
                      : 'hover:scale-y-105 ring-1 ring-kanyo-gray-500'
                    }
                  `}
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                  }}
                >
                  {/* Thumbnail */}
                  <img
                    src={api.getClipUrl(streamId, selectedDate, event.thumbnail)}
                    alt=""
                    className="w-full h-full object-cover"
                  />

                  {/* Falcon icon at start */}
                  <div className="absolute top-0.5 left-0.5 w-3 h-3 bg-kanyo-orange rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 text-white text-[8px] font-bold">▶</div>
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
      </div>
    </div>
  );
}

/**
 * Calculate event position and width on 24-hour timeline
 */
function calculateEventPosition(event) {
  if (!event.timestamp || !event.duration) return { left: 0, width: 0 };

  const date = new Date(event.timestamp);
  const startMinutes = date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
  const durationMinutes = event.duration / 60;

  // Position as percentage of 24 hours (1440 minutes)
  const left = (startMinutes / 1440) * 100;
  const width = (durationMinutes / 1440) * 100;

  // Minimum width for visibility (0.5% = ~7 minutes)
  return {
    left,
    width: Math.max(width, 0.5)
  };
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
