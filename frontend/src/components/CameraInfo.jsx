import { useState, useEffect, useRef } from 'react';
import { formatTimeInTimezone, setVisitorTimezone as saveVisitorTimezone } from '../utils/timezone';
import TimezoneSelector from './TimezoneSelector';

export default function CameraInfo({ stream, visitorTimezone, onTimezoneChange, className = '' }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showLocalTime, setShowLocalTime] = useState(false);
  const [isDescriptionTruncated, setIsDescriptionTruncated] = useState(false);
  const descriptionRef = useRef(null);

  // Get browser's actual timezone
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const display = stream?.display || {};

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check if description is truncated
  useEffect(() => {
    if (descriptionRef.current) {
      const isOverflowing = descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight;
      setIsDescriptionTruncated(isOverflowing);
    }
  }, [display.description]);

  return (
    <div className={`bg-kanyo-card rounded-lg p-6 space-y-3 flex flex-col ${className}`}>
      <h2 className="text-lg font-semibold text-kanyo-text mb-3">Stream Info</h2>

      {/* Location */}
      <div>
        <div className="text-kanyo-secondary-text text-xs mb-1">Location</div>
        <div className="text-kanyo-text text-sm">{display.location}</div>
        {display.coordinates && display.coordinates.length === 2 && (
          <a
            href={`https://www.google.com/maps?q=${display.coordinates[0]},${display.coordinates[1]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-kanyo-orange hover:text-kanyo-text transition-colors text-xs"
          >
            View on Map →
          </a>
        )}
      </div>

      {/* Species */}
      {display.species && (
        <div>
          <div className="text-kanyo-secondary-text text-xs mb-1">Species</div>
          <div className="text-kanyo-text text-sm">{display.species}</div>
        </div>
      )}

      {/* Maintainer */}
      {display.maintainer && (
        <div>
          <div className="text-kanyo-secondary-text text-xs mb-1">Maintained by</div>
          {display.maintainer_url ? (
            <a
              href={display.maintainer_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-kanyo-orange hover:text-kanyo-text transition-colors text-sm"
            >
              {display.maintainer}
            </a>
          ) : (
            <div className="text-kanyo-text text-sm">{display.maintainer}</div>
          )}
        </div>
      )}

      {/* Description */}
      {display.description && (
        <div>
          <div className="text-kanyo-secondary-text text-xs mb-1">About</div>
          <div
            ref={descriptionRef}
            className="text-kanyo-text text-xs leading-relaxed max-h-[5lh] overflow-y-auto"
          >
            {display.description}
          </div>
        </div>
      )}

      {/* Spacer to push clock to bottom */}
      <div className="flex-1"></div>

      {/* Single Clock with Toggle - at bottom */}
      <div className="border-t border-kanyo-gray-500 pt-3 mt-auto">
        <div className="space-y-2">
          <div>
            <div className="text-kanyo-secondary-text text-[10px] mb-1">
              {showLocalTime ? 'Your Local Time' : 'Stream Local Time'}
            </div>
            <div className="text-kanyo-text text-sm font-mono">
              {formatTimeInTimezone(currentTime, showLocalTime ? browserTimezone : stream.timezone)}
            </div>
            <div className="text-kanyo-secondary-text text-[9px] mt-0.5">
              {showLocalTime ? browserTimezone : stream.timezone}
            </div>
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setShowLocalTime(!showLocalTime)}
            className="text-kanyo-orange hover:text-kanyo-text text-xs transition-colors"
          >
            {showLocalTime ? '← Stream Time' : 'Your Time →'}
          </button>
        </div>
      </div>
    </div>
  );
}
