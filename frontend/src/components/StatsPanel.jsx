export default function StatsPanel({ stream, stats, statsRange, onRangeChange, className = '' }) {
  const ranges = ['24h', '2d', '3d'];
  const display = stream?.display || {};

  return (
    <div className={`bg-kanyo-card rounded-lg p-4 flex flex-col h-full ${className}`}>
      <h3 className="text-base font-semibold text-kanyo-text mb-3">Statistics</h3>

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
                : 'bg-kanyo-button-bg text-kanyo-text hover:bg-kanyo-button-hover border border-kanyo-gray-500'
              }
            `}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Stats Display */}
      <div className="flex-1 overflow-y-auto">
      {stats ? (
        <div className="space-y-3">
          <StatItem label="Visits" value={stats.visits || 0} />

          {/* Latest Alerts */}
          {stats.last_events && stats.last_events.length > 0 ? (
            <div className="border-t border-kanyo-gray-500 pt-3 mt-3">
              <div className="text-kanyo-gray-100 text-xs mb-2">Latest Alerts</div>
              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-kanyo-gray-500 scrollbar-track-kanyo-gray-700">
                {stats.last_events.map((event, idx) => (
                  <div key={idx} className="flex flex-col gap-0.5">
                    <span className={`text-[10px] font-medium flex items-center gap-1 ${
                      event.type === 'arrival' ? 'text-kanyo-blue' : 'text-kanyo-red'
                    }`}>
                      <span className="inline-block w-1.5 h-1.5 rounded-full ${
                        event.type === 'arrival' ? 'bg-kanyo-blue' : 'bg-kanyo-red'
                      }"></span>
                      {event.type === 'arrival' ? 'Arrival' : 'Departure'}
                    </span>
                    <span className="text-kanyo-secondary-text text-[10px]">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="border-t border-kanyo-gray-500 pt-3 mt-3 flex-1 flex flex-col items-center justify-center gap-2 py-8">
              <svg viewBox="0 0 83.5 98.3" className="w-8 h-8 opacity-15" style={{filter: 'invert(60%) sepia(80%) saturate(600%) hue-rotate(350deg)'}}>
                <path d="M73.2,11.4c-1.3-1.8-2.9-3.3-4.8-4.5-4.4-2.8-9.3-4.6-14.4-5.4-6.1-1.2-12.5-1.1-18.6.3-3.9.9-7.6,2.7-10.8,5.2-3.2,2.6-5.7,5.9-7.4,9.7-1,2.2-1.9,4.5-2.9,6.7-1.3,3.2-2.8,6.3-4.3,9.4-1.4,2.8-2.8,5.6-4,8.5-.8,1.9-1.8,3.7-3.1,5.4-.8.9-1.7,1.6-2.7,2.1-.3.1-.2.5-.2.8,0,8.5,0,17,0,25.5,2.3-6.3,5.4-12.3,9.2-17.9,2.5-3.6,5.4-6.9,8.8-9.7-3.9,5.4-7.1,11.2-9.8,17.2-2.2,4.9-4.1,9.9-5.5,15.1-1.6,5.6-2.4,11.4-2.3,17.2,1.8-1.8,3.5-3.6,5.2-5.3,10.3-10.4,20.6-20.7,30.8-31.2.6-.7,1.2-1.4,1.9-2-3.1,4.3-6,8.8-9,13.2-3.1,4.7-6.1,9.4-9,14.1-2.5,4.2-4.9,8.3-7.3,12.5,2.4.1,4.9.2,7.3.4.6-.6,1.2-1.2,1.8-1.8,3.5-3.6,6.9-7.2,10.4-10.9,3.5-3.7,7.1-7.4,10.6-11.1,0,.3-.4.5-.5.8-1.6,3.3-3.2,6.5-4.8,9.7-2.1,4.3-4.3,8.5-6.3,12.8,2,0,4,.2,6,.2.2,0,.4,0,.6,0,.7-.6,1.3-1.2,1.9-1.8h0c5.9-5.7,11.1-12,15.6-18.8-.5,2.3-.9,4.7-1.3,7-.7,3.7-1.4,7.3-2.1,11,0,.3-.2.7,0,1h0c.2.2.4.2.6.2.2,0,.4,0,.6-.3.8-.8,1.5-1.8,2.2-2.7,2.1-3.1,3.7-6.5,4.9-10,1.2-3.5,2.1-7,2.5-10.7,1-6.6.8-13.4-.5-20-.2-.9-.4-1.9-.7-2.8-.7-1.8-1.1-3.7-1-5.6.1-2.3.9-4.6,2.2-6.5,1.3-1.9,3-3.7,4.9-5-1.4.3-2.9,0-4.3-.6-1-.7-1.5-1.9-2.5-2.7h0c-.4-.3-.9-.4-1.4-.4-2.2,0-4.5,0-6.7,0h0c-1,0-1.8-.8-1.8-1.8s.7-1.8,1.7-1.9c1.4,0,2.8,0,4.2,0,.9,0,1.7-.2,2.5-.7,1.9-1,3.4-2.5,4.2-4.5.5-1.3.6-2.7.3-4,.6,0,1.3,0,1.9,0,.9-.5,1.7-1.2,2.4-1.9.8-.7,1.4-1.6,2.4-1.8,1.5-.2,2.9.3,4,1.3-.4-1.1-1-2.2-1.7-3.1h0ZM54.3,20.4c-1.4,1.7-3.3,2.8-5.4,3.1-2.1,0-4.1-.5-6-1.4-3-1.2-6.2-1.8-9.5-1.5-2.9.3-5.7,1.4-8.1,3.2-2.9,2.1-5.4,4.8-7.3,7.8-1.7,2.5-3.1,5.2-4.2,8-.7,1.8-1.3,3.7-1.7,5.6.2-1.6.5-3.2,1-4.8.9-3.6,2.2-7.2,4.1-10.4,1.5-2.8,3.4-5.3,5.8-7.4,2.1-1.9,4.6-3.2,7.3-3.9-1.7-.7-3.2-1.7-4.4-3,2.3.9,4.7,1.3,7.1,1.2,1.6,0,3.2-.3,4.8-.7,1.2-.3,2.4-.7,3.7-1h0c1.3-.3,2.6-.6,3.9-.7-1.1.7-1.9,1.8-2.1,3.1-.2,1.3.2,2.6,1.1,3.6,1.5,1.7,3.9,2.1,5.8.9,1.9-1.2,2.6-3.6,1.8-5.6-.3-.8-.9-1.5-1.7-1.9,2.2.3,4.4.7,6.6,1.3-.4,1.8-1.3,3.4-2.6,4.7h0Z"/>
                <path d="M83.3,25.9c-.6-4-3-7.4-6.6-9.3-.5-.1-1.1,0-1.5.5-3.2,3-6.4,6.1-9.6,9.1-.4.4-.8.7-1.1,1.1h0c-.2.3-.3.6-.2.9,0,.3.3.6.6.7.3.2.8.2,1.1.5.5.6.9,1.3,1.4,1.8,1,1.1,2.2,1.8,3.6,2.2,2.3.6,4.7.3,6.7-1,.4,2.1.8,4.2,1.2,6.4,3.6-3.2,5.3-8.1,4.5-12.8h0Z"/>
              </svg>
              <span className="text-kanyo-gray-300 text-[10px] text-center px-2">No falcon activity recorded</span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-kanyo-gray-100 text-center py-4">
          Loading stats...
        </div>
      )}
      </div>

      {/* Subscribe Button - aligned with clock at bottom */}
      {stream && stream.telegram_channel && (
        <div className="border-t border-kanyo-gray-500 pt-3">
          <a
            href={`https://t.me/${stream.telegram_channel.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-2 w-full bg-kanyo-blue hover:bg-opacity-80 text-white font-medium py-4 px-4 rounded-lg transition-all"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="m12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12c0-6.627-5.373-12-12-12zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
            </svg>
            <span className="text-xs">Subscribe</span>
          </a>
        </div>
      )}
    </div>
  );
}

function StatItem({ label, value, color = 'text-kanyo-text' }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-kanyo-secondary-text text-xs">{label}</span>
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
