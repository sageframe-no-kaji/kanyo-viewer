import { useRef, useEffect } from 'react';
import { api } from '../utils/api';
import { isTouchDevice } from '../utils/timezone';

export default function Timeline({
  events,
  selectedEvent,
  onEventSelect,
  onLiveClick,
  isLive,
  streamId,
  selectedDate
}) {
  const scrollContainerRef = useRef(null);

  // Auto-scroll to selected event
  useEffect(() => {
    if (selectedEvent && scrollContainerRef.current) {
      const thumbnail = scrollContainerRef.current.querySelector(`[data-event-id="${selectedEvent.event_id}"]`);
      if (thumbnail) {
        thumbnail.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedEvent]);

  const touchDevice = isTouchDevice();

  return (
    <div className="bg-kanyo-card rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Timeline</h3>
        <button
          onClick={onLiveClick}
          className={`
            px-4 py-2 rounded-lg font-semibold transition-all
            ${isLive
              ? 'bg-kanyo-green text-white'
              : 'bg-kanyo-gray-600 text-white hover:bg-kanyo-gray-500'
            }
          `}
        >
          <span className="flex items-center">
            {isLive && <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>}
            LIVE
          </span>
        </button>
      </div>

      {/* 24-hour timeline bar */}
      <div className="relative h-2 bg-kanyo-gray-600 rounded-full mb-6">
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Hour markers */}
          {[0, 6, 12, 18, 24].map(hour => (
            <div
              key={hour}
              className="absolute top-0 bottom-0 w-px bg-kanyo-gray-400"
              style={{ left: `${(hour / 24) * 100}%` }}
            />
          ))}
        </div>
      </div>

      {/* Hour labels */}
      <div className="relative h-6 mb-4">
        {[0, 6, 12, 18].map(hour => (
          <div
            key={hour}
            className="absolute text-xs text-kanyo-gray-100"
            style={{ left: `${(hour / 24) * 100}%`, transform: 'translateX(-50%)' }}
          >
            {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
          </div>
        ))}
      </div>

      {/* Thumbnail scroll container */}
      <div
        ref={scrollContainerRef}
        className={`
          relative overflow-x-auto pb-4 timeline-scroll
          ${touchDevice ? 'snap-x snap-mandatory' : ''}
        `}
        style={{ scrollbarWidth: 'thin' }}
      >
        <div className="relative h-24" style={{ minWidth: '100%', width: 'max-content' }}>
          {events.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-kanyo-gray-100">
              No events for this date
            </div>
          )}

          {events.map((event) => {
            const position = calculateTimelinePosition(event.timestamp);
            const isSelected = selectedEvent?.event_id === event.event_id;

            return (
              <button
                key={event.event_id}
                data-event-id={event.event_id}
                onClick={() => onEventSelect(event)}
                className={`
                  absolute top-0 w-16 md:w-20 lg:w-24 h-full rounded-lg overflow-hidden
                  transition-all timeline-thumbnail
                  ${isSelected
                    ? 'ring-2 ring-kanyo-orange scale-110'
                    : 'hover:scale-105 ring-1 ring-kanyo-gray-500'
                  }
                `}
                style={{
                  left: `${position}%`,
                  transform: `translateX(-50%) ${isSelected ? 'scale(1.1)' : ''}`,
                }}
              >
                <img
                  src={api.getClipUrl(streamId, selectedDate, event.thumbnail)}
                  alt={`${event.type} event`}
                  className="w-full h-full object-cover"
                />
                {/* Event type indicator */}
                <div className={`
                  absolute bottom-0 left-0 right-0 px-1 py-0.5 text-xs font-medium text-center
                  ${event.type === 'arrival' ? 'bg-kanyo-blue' : 'bg-kanyo-red'}
                `}>
                  {event.type === 'arrival' ? 'Arrival' : 'Departure'}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Calculate position on 24-hour timeline (0-100%)
 */
function calculateTimelinePosition(isoTimestamp) {
  if (!isoTimestamp) return 0;

  const date = new Date(isoTimestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  return (totalMinutes / 1440) * 100; // 1440 minutes in a day
}
