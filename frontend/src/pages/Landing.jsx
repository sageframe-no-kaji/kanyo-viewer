import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';

export default function Landing() {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStreams();
  }, []);

  async function loadStreams() {
    try {
      setLoading(true);
      const data = await api.getStreams();
      setStreams(data.streams || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-kanyo-bg flex items-center justify-center">
        <div className="text-white text-xl">Loading streams...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-kanyo-bg flex items-center justify-center">
        <div className="text-kanyo-red text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kanyo-bg">
      {/* Header */}
      <header className="border-b border-kanyo-gray-500 bg-kanyo-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-white">Kanyo Falcon Viewer</h1>
          <p className="text-kanyo-gray-100 mt-2">Live falcon monitoring and event archives</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {streams.map((stream) => (
            <StreamCard key={stream.id} stream={stream} />
          ))}
        </div>

        {streams.length === 0 && (
          <div className="text-center text-kanyo-gray-100 mt-12">
            <p className="text-xl">No streams available</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-kanyo-gray-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-kanyo-gray-100">
          <Link to="/about" className="hover:text-kanyo-orange transition-colors">
            About Kanyo
          </Link>
        </div>
      </footer>
    </div>
  );
}

function StreamCard({ stream }) {
  const stats = stream.stats || {};
  const display = stream.display || {};

  return (
    <Link
      to={`/stream/${stream.id}`}
      className="block bg-kanyo-card rounded-lg overflow-hidden hover:ring-2 hover:ring-kanyo-orange transition-all"
    >
      {/* Thumbnail Placeholder */}
      <div className="aspect-video bg-kanyo-gray-600 flex items-center justify-center">
        <div className="text-6xl">🦅</div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-xl font-semibold text-white">{display.short_name || stream.name}</h2>
          <span className="flex items-center text-kanyo-green text-sm">
            <span className="w-2 h-2 bg-kanyo-green rounded-full mr-1"></span>
            LIVE
          </span>
        </div>

        <p className="text-kanyo-gray-100 text-sm mb-3">{display.location}</p>

        <div className="text-sm text-kanyo-gray-100 space-y-1">
          <div className="flex justify-between">
            <span>Visits (24h):</span>
            <span className="text-white font-medium">{stats.visits || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>Last event:</span>
            <span className="text-white font-medium">
              {stats.last_event ? formatTimestamp(stats.last_event.timestamp) : 'None'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function formatTimestamp(isoString) {
  if (!isoString) return 'Unknown';
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}
