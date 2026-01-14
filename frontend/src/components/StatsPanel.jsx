export default function StatsPanel({ stats, statsRange, onRangeChange }) {
  const ranges = ['24h', '2d', '3d', '4d', '5d'];

  return (
    <div className="bg-kanyo-card rounded-lg p-6">
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
        <div className="space-y-4">
          <StatItem label="Visits" value={stats.visits || 0} />
          <StatItem label="Arrivals" value={stats.arrivals || 0} color="text-kanyo-blue" />
          <StatItem label="Departures" value={stats.departures || 0} color="text-kanyo-red" />

          {stats.last_event && (
            <div className="border-t border-kanyo-gray-500 pt-4 mt-4">
              <div className="text-kanyo-gray-100 text-sm mb-1">Last Event</div>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${
                  stats.last_event.type === 'arrival' ? 'text-kanyo-blue' : 'text-kanyo-red'
                }`}>
                  {stats.last_event.type === 'arrival' ? '🔵 Arrival' : '🔴 Departure'}
                </span>
                <span className="text-white text-sm">
                  {formatTimestamp(stats.last_event.timestamp)}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-kanyo-gray-100 text-center py-4">
          Loading stats...
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
