export default function StatsPanel({ stream, stats, statsRange, onRangeChange, className = '' }) {
  const ranges = ['24h', '2d', '3d'];
  const display = stream?.display || {};

  return (
    <div className={`bg-kanyo-card rounded-lg p-4 flex flex-col ${className}`}>
      <h3 className="text-base font-semibold text-white mb-3">Statistics</h3>

      {/* Range Selector */}
      <div className="flex gap-1.5 mb-4">
        {ranges.map(range => (
          <button
            key={range}
            onClick={() => onRangeChange(range)}
            className={`
              px-2 py-1 rounded text-xs font-medium whitespace-nowrap transition-all
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
        <div className="space-y-3 flex-1">
          <StatItem label="Visits" value={stats.visits || 0} />

          {/* Latest Alerts */}
          {stats.last_events && stats.last_events.length > 0 && (
            <div className="border-t border-kanyo-gray-500 pt-3 mt-3">
              <div className="text-kanyo-gray-100 text-xs mb-2">Latest Alerts</div>
              <div className="space-y-2">
                {stats.last_events.slice(0, 6).map((event, idx) => (
                  <div key={idx} className="flex flex-col gap-0.5">
                    <span className={`text-[10px] font-medium flex items-center gap-1 ${
                      event.type === 'arrival' ? 'text-kanyo-blue' : 'text-kanyo-red'
                    }`}>
                      <span className="inline-block w-1.5 h-1.5 rounded-full ${
                        event.type === 'arrival' ? 'bg-kanyo-blue' : 'bg-kanyo-red'
                      }"></span>
                      {event.type === 'arrival' ? 'Arrival' : 'Departure'}
                    </span>
                    <span className="text-white text-[10px]">
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
        <div className="border-t border-kanyo-gray-500 pt-3 mt-auto">
          <a
            href={`https://t.me/${display.telegram_channel.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 w-full bg-kanyo-blue hover:bg-opacity-80 text-white font-medium py-2 px-3 rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="m12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12c0-6.627-5.373-12-12-12zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
            </svg>
            <span className="text-sm">Subscribe</span>
          </a>
        </div>
      )}
    </div>
  );
}

function StatItem({ label, value, color = 'text-white' }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-kanyo-gray-100 text-xs">{label}</span>
      <span className={`text-lg font-bold ${color}`}>{value}</span>
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
