import { useState, useMemo } from 'react';

// Common IANA timezones grouped by region
const TIMEZONES = [
  // North America
  { value: 'America/New_York', label: 'Eastern Time (US)' },
  { value: 'America/Chicago', label: 'Central Time (US)' },
  { value: 'America/Denver', label: 'Mountain Time (US)' },
  { value: 'America/Phoenix', label: 'Arizona' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
  { value: 'America/Anchorage', label: 'Alaska' },
  { value: 'Pacific/Honolulu', label: 'Hawaii' },
  { value: 'America/Toronto', label: 'Toronto' },
  { value: 'America/Vancouver', label: 'Vancouver' },

  // Europe
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Europe/Rome', label: 'Rome (CET)' },
  { value: 'Europe/Madrid', label: 'Madrid (CET)' },
  { value: 'Europe/Moscow', label: 'Moscow' },

  // Asia
  { value: 'Asia/Dubai', label: 'Dubai' },
  { value: 'Asia/Kolkata', label: 'India' },
  { value: 'Asia/Shanghai', label: 'China' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Asia/Seoul', label: 'Seoul' },
  { value: 'Asia/Singapore', label: 'Singapore' },

  // Australia
  { value: 'Australia/Sydney', label: 'Sydney' },
  { value: 'Australia/Melbourne', label: 'Melbourne' },
  { value: 'Australia/Perth', label: 'Perth' },

  // Other
  { value: 'Pacific/Auckland', label: 'New Zealand' },
  { value: 'UTC', label: 'UTC' },
];

export default function TimezoneSelector({ currentTimezone, onSelect }) {
  const [search, setSearch] = useState('');

  const filteredTimezones = useMemo(() => {
    if (!search) return TIMEZONES;

    const searchLower = search.toLowerCase();
    return TIMEZONES.filter(tz =>
      tz.label.toLowerCase().includes(searchLower) ||
      tz.value.toLowerCase().includes(searchLower)
    );
  }, [search]);

  return (
    <div className="bg-kanyo-gray-600 rounded-lg p-3 mt-2">
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search timezones..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-kanyo-gray-500 text-white placeholder-kanyo-gray-100 px-3 py-2 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-kanyo-orange"
      />

      {/* Timezone List */}
      <div className="max-h-64 overflow-y-auto space-y-1">
        {filteredTimezones.length > 0 ? (
          filteredTimezones.map(tz => (
            <button
              key={tz.value}
              onClick={() => onSelect(tz.value)}
              className={`
                w-full text-left px-3 py-2 rounded transition-colors
                ${tz.value === currentTimezone
                  ? 'bg-kanyo-orange text-white'
                  : 'text-kanyo-gray-100 hover:bg-kanyo-gray-500'
                }
              `}
            >
              <div className="font-medium">{tz.label}</div>
              <div className="text-xs opacity-75">{tz.value}</div>
            </button>
          ))
        ) : (
          <div className="text-kanyo-gray-100 text-center py-4">
            No timezones found
          </div>
        )}
      </div>
    </div>
  );
}
