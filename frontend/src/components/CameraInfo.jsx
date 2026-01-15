import { useState, useEffect } from 'react';
import { formatTimeInTimezone, setVisitorTimezone as saveVisitorTimezone } from '../utils/timezone';
import TimezoneSelector from './TimezoneSelector';

export default function CameraInfo({ stream, visitorTimezone, onTimezoneChange, className = '' }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showTimezoneSelector, setShowTimezoneSelector] = useState(false);

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const display = stream?.display || {};

  function handleTimezoneChange(newTimezone) {
    saveVisitorTimezone(newTimezone);
    onTimezoneChange(newTimezone);
    setShowTimezoneSelector(false);
  }

  return (
    <div className={`bg-kanyo-card rounded-lg p-6 space-y-3 flex flex-col ${className}`}>
      <h2 className="text-lg font-semibold text-white mb-3">Stream Info</h2>

      {/* Location */}
      <div>
        <div className="text-kanyo-gray-100 text-xs mb-1">Location</div>
        <div className="text-white text-sm">{display.location}</div>
      </div>

      {/* Maintainer */}
      {display.maintainer && (
        <div>
          <div className="text-kanyo-gray-100 text-xs mb-1">Maintained by</div>
          {display.maintainer_url ? (
            <a
              href={display.maintainer_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-kanyo-orange hover:text-white transition-colors text-sm"
            >
              {display.maintainer}
            </a>
          ) : (
            <div className="text-white text-sm">{display.maintainer}</div>
          )}
        </div>
      )}

      {/* Description */}
      {display.description && (
        <div>
          <div className="text-kanyo-gray-100 text-xs mb-1">About</div>
          <div className="text-white text-xs leading-relaxed">{display.description}</div>
        </div>
      )}

      {/* Single Clock with Toggle */}
      <div className="border-t border-kanyo-gray-500 pt-3 mt-3">
        <div className="space-y-2">
          <div>
            <div className="text-kanyo-gray-100 text-[10px] mb-1">
              {showTimezoneSelector ? 'Your Local Time' : 'Stream Local Time'}
            </div>
            <div className="text-white text-sm font-mono">
              {formatTimeInTimezone(currentTime, showTimezoneSelector && visitorTimezone ? visitorTimezone : stream.timezone)}
            </div>
            <div className="text-kanyo-gray-100 text-[9px] mt-0.5">
              {showTimezoneSelector && visitorTimezone ? visitorTimezone : stream.timezone}
            </div>
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setShowTimezoneSelector(!showTimezoneSelector)}
            className="text-kanyo-orange hover:text-white text-xs transition-colors"
          >
            {showTimezoneSelector ? '← Stream Time' : 'Your Time →'}
          </button>
        </div>
      </div>
    </div>
  );
}
