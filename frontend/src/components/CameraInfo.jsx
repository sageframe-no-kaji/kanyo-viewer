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
    <div className={`bg-kanyo-card rounded-lg p-6 space-y-4 flex flex-col ${className}`}>
      <h2 className="text-xl font-semibold text-white mb-4">Camera Info</h2>

      {/* Location */}
      <div>
        <div className="text-kanyo-gray-100 text-sm mb-1">Location</div>
        <div className="text-white">{display.location}</div>
      </div>

      {/* Species */}
      <div>
        <div className="text-kanyo-gray-100 text-sm mb-1">Species</div>
        <div className="text-white">{display.species}</div>
      </div>

      {/* Maintainer */}
      {display.maintainer && (
        <div>
          <div className="text-kanyo-gray-100 text-sm mb-1">Maintained by</div>
          {display.maintainer_url ? (
            <a
              href={display.maintainer_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-kanyo-orange hover:text-white transition-colors"
            >
              {display.maintainer}
            </a>
          ) : (
            <div className="text-white">{display.maintainer}</div>
          )}
        </div>
      )}

      {/* Description */}
      {display.description && (
        <div>
          <div className="text-kanyo-gray-100 text-sm mb-1">About</div>
          <div className="text-white text-sm">{display.description}</div>
        </div>
      )}

      {/* Dual Timezone Clocks */}
      <div className="border-t border-kanyo-gray-500 pt-4 mt-4">
        <div className="space-y-3">
          {/* Stream Local Time */}
          <div>
            <div className="text-kanyo-gray-100 text-xs mb-1">Stream Local Time</div>
            <div className="text-white text-lg font-mono">
              {formatTimeInTimezone(currentTime, stream.timezone)}
            </div>
            <div className="text-kanyo-gray-100 text-[10px] mt-1">
              {stream.timezone}
            </div>
          </div>

          {/* Visitor Time */}
          {visitorTimezone && visitorTimezone !== stream.timezone && (
            <div>
              <div className="text-kanyo-gray-100 text-xs mb-1">Your Local Time</div>
              <div className="text-white text-lg font-mono">
                {formatTimeInTimezone(currentTime, visitorTimezone)}
              </div>
              <div className="text-kanyo-gray-100 text-[10px] mt-1">
                {visitorTimezone}
              </div>
            </div>
          )}

          {/* Timezone Selector Toggle */}
          <button
            onClick={() => setShowTimezoneSelector(!showTimezoneSelector)}
            className="text-kanyo-orange hover:text-white text-sm transition-colors"
          >
            {showTimezoneSelector ? '✕ Close' : '⚙ Change timezone'}
          </button>

          {/* Timezone Selector */}
          {showTimezoneSelector && (
            <TimezoneSelector
              currentTimezone={visitorTimezone}
              onSelect={handleTimezoneChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
