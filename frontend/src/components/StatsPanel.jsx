export default function StatsPanel({ stream, stats, statsRange, onRangeChange, className = '' }) {
  const ranges = ['24h', '2d', '3d', '4d', '5d'];
  const display = stream?.display || {};

  return (
    <div className={`bg-kanyo-card rounded-lg p-6 flex flex-col ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>

      {/* Range Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {ranges.map(range => (
          <button
            key={range}
            onClick={() => onRangeChange(range)}
            className={`
              px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap transition-all
              ${range === statsRange
                ? 'bg-kanyo-orange text-white'
                : 'bg-kanyo-gray-600 text-kanyo-gray-100 hover:bg-kanyo-gray-500'
              }
            `}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Stats Display */}
      {stats ? (
        <div className="space-y-4 flex-1">
          <StatItem label="Visits" value={stats.visits || 0} />

          {/* Last Events */}
          {stats.last_events && stats.last_events.length > 0 && (
            <div className="border-t border-kanyo-gray-500 pt-4 mt-4">
              <div className="text-kanyo-gray-100 text-sm mb-3">Last Events</div>
              <div className="space-y-3">
                {stats.last_events.slice(0, 6).map((event, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <span className={`text-xs font-medium ${
                      event.type === 'arrival' ? 'text-kanyo-blue' : 'text-kanyo-red'
                    }`}>
                      {event.type === 'arrival' ? '🔵 Arrival' : '🔴 Departure'}
                    </span>
                    <span className="text-white text-xs">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-kanyo-gray-100 text-center py-4">
          Loading stats...
        </div>
      )}

      {/* Subscribe Button - pushed to bottom */}
      {display.telegram_channel && (
        <div className="border-t border-kanyo-gray-500 pt-4 mt-auto">
          <a
            href={`https://t.me/${display.telegram_channel.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-kanyo-blue hover:bg-opacity-80 text-white font-semibold py-3 px-4 rounded-lg text-center transition-all"
          >
            📢 Subscribe on Telegram
          </a>
        </div>
      )}
    </div>
  );
}

function StatItem({ label, value, color = 'text-white' }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-kanyo-gray-100">{label}</span>
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
    </div>
  );
}

function formatTimestamp(isoString) {
  if (!isoString) return 'Unknown';
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}
