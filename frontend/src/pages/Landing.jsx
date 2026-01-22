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
      <header>
        <div className="max-w-5xl mx-auto px-6">
          <div className="py-4 bg-kanyo-card rounded-lg border-b border-kanyo-gray-500">
            <div className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-8">
              {/* Logo Circle - bigger, aligned with text */}
              <div className="w-24 h-24 rounded-full bg-kanyo-orange flex items-center justify-center flex-shrink-0 ml-4">
                <svg viewBox="0 0 500 548.5" className="w-20 h-20 fill-white">
                <path d="M113.7,335.9h37.4l.9.9v13.7l-.9.9h-22.6l-7.4,11.4h31.4c0,3.3-.1,6.7,0,10s1.2,2.8-.3,3.7h-38.3l-10.6,14.3h13.4c6.2-8.7,19.7-10.4,28.3-4.2s4,4.2,4.3,4.2h10v-54.8h60.3l.9,93.1h-61.1v-26.9l-8.8-.5c-.8.3-1.8,3.6-2.7,4.8-7.9,11-28.6,9.1-32.6-4.3h-12v25.1h49.1v13.7h-19.4v10.9h21.1l-1.1,13.1h-21.1c-1.7,8.3-4.9,16.3-10.3,22.8,14.1-3.8,32.3-12.6,37.7-27.1s2.9-16.1,3.4-24.3h17.1c-.7,9-.7,17.5-3.1,26.3-10.9,39.4-64.6,50.9-99.7,55.4v-21.7c17.5-2.8,33.7-13.4,37.7-31.4h-28l.6-13.1h28.6v-10.9h-28.6v-34.3c-1.9.3-6.3,5.5-7.9,4.5l-9.8-12.2c5.7-4.3,11.4-8.7,16.6-13.7s5.9-5.4,7.4-8.9h-18c-1.4,0-.3-3.8-.3-4.8,0-2.7.2-5.4-.5-8l.8-.9h27.7l6.3-11.4h-8.3c-.7,0-7.3,9.2-10.4,10.2-4.5,1.3-10.5-3.5-15-3.9,5.7-4.6,10-8.9,13.2-15.7,1-2.3,2.8-9.5,3.7-10.6,3.4-4,19.1-2.7,23.1,1.4l-2.3,3.1ZM203.4,350.8h-26.9v12.6h26.9v-12.6ZM203.4,376.5h-26.9v12h26l.9-.9v-11.1ZM131.8,393.8c-4.9,1.1-3.3,9.6,3,7.6s3.1-9-3-7.6ZM203.4,401.1h-26.9v14.3h26.9v-14.3Z"/>
                <path d="M286.3,382.8l-18.8,10.7c-.6,22.6,1.1,45.3-1.9,67.8-2.5,18.9-7.7,37.5-17.1,54l-12-4c7.8-17,11.7-35.9,13.1-54.6,1.6-19.8.6-39.1.5-58.8,0-20.7.1-41.3,0-62h66.3s-.6-16-.6-16c10.1.7,20.4.7,30.2,3.5,1.2,1.7-3.6,6.6-4,8.5h49.4c.5,0,4.6,1.2,5.4,1.4,5.6,2,9.5,6.5,10.9,12.2,7.5.4,16.1,1.6,20.2,8.7s2,4.5,2,4.8v8.9c-8.1-4.2-15.7-5.5-24.7-3.8s-16.5,4.9-18.7,11.3h-47.4v11.4h45.1v10.3h-43.7c-.2,0-.6-1-1.4.3v10h45.1v10.3h-45.1v10.3h62.3v9.4l-.9.9h-114.6v-55.4ZM370.3,344.5c5.5,7.5,22.2,13.9,26.1,2,0-.4-1.7-2-1.8-2h-24.3ZM295.4,350.8h-27.1l-.9.9v26.6c1.8-.5,3.6-2.1,5.1-3.2,5.7-4.3,10.8-9.4,15.8-14.5l7.1-9.7ZM330.3,351.4h-14l-9.4,12h14.6l1.4-1,7.4-11ZM360,351.4h-10l-8.9,11.4h11.7c1.1-.9,7.8-10.8,7.1-11.4ZM321.7,375.4h-18.9v11.4h18.9v-11.4ZM321.7,407.3v-10.9c-.4-.2-.7.6-.9.6h-18v10.3h18.9ZM321.7,416.5c-6.1.6-12.8,1.2-18.9,0v11.4h18.9v-11.4Z"/>
                <path d="M106.6,305.8c-.7-.2-1.9-1.5-.5-2.3,12.8-9.3,24.3-20.3,35.5-31.4l-39.4,26.6c-10.3,5.7-20.3,2.1-30.7-1.6s-2.1-.1-1.8-1.3c13.6-4.6,26.5-13.1,38.1-21.5,4.3-3.1,14.6-13.3,18.8-14,6-1,14.4-.3,20.8-1.1,52.9-6.5,136.4-44.4,171.2-85.4.9-1.1,3.7-3.9,2.7-5.5-33.9,31.1-77.6,54.2-121,69.2-30.4,10.5-65.8,17.8-97.9,12.7,8.9-6.2,18.6-11.3,27.8-17.3,11.6-7.5,30.5-23.7,41.5-28.6s12.5-2.4,18.4-4.4c6.5-2.2,14-7.3,18.9-12.1-1.1-1.3-3,1.1-4.5,1.9-10.4,5-23.2,6.1-34.6,5.4,32.1-24.5,61.1-56,98.9-72.2,21.3-9.2,56.7-12.7,75.4,3.5,26.7,23-8.8,58.9-27.8,73.7,19-7.6,37.7-20,47.8-38.2,4,6.9,1.7,15.3,1.8,22.7,12.1-12,19-28.2,17.8-45.5l5.9,11.8,1.8,15.5c5.6-10.1,5.7-20.8,3.7-31.9-.9-4.9-3.5-10.3-4-15.1-1.3-10.8,0-25,10.8-30.4-1,5.8-2.2,11.8-1.8,17.7.8,13.2,8.1,26.7,9.1,40.1,3,40.5-34.4,66.5-64.1,86-8.8,5.7-19,9.6-26,17.7.7,1.4,2.2-.3,3-.6,4.9-2.1,9.3-5.3,14.3-7.1-4.7,12.2-15.2,21.5-5.9,34.5,6.1,8.5,14.1,3.2,22.7,3.7,21.8,1.2,16.8,25.5-.4,30,4-6.9,4.3-17.8-4.6-20,4.9,7.1.3,14.3-7.8,15.4-3.2.4-18.5-.3-20-2.7s.8-11.1.4-14c-1.9-14-19.2-25.8-28.9-34.8l10.8-25.8c-11.1,9.2-24.6,28-16.7,42.7s16.7-3.6,26.3,7.4,4.3,29.4-10.5,31.9c4.8-10.2,1.5-19.9-10.5-20.9-3,.2-2,0,0,1,7.1,3.8,11,13.3,1,15.3l-104.2-.9c12.8-12.8,30.3-10.6,46.8-12.8,13.6-1.8,27.1-4.1,40.6-6.3l-10-19.6c-9.7-2.3-19.4-1.1-29.1-.5l8.6-11.8,16.4-17.3-68.7,34.6c-.2,1.7,1.8.6,2.8.5,8.5-1.3,18.2-6.3,26.6-9,.9-.3,2.9-1.3,3.5-.2-11,12.1-22.6,25-37.4,32.6s-32.7,10.5-48.1,8.8c-.4-1.7.6-1.8,1.5-2.6,7-6.3,14.1-12.7,19.8-20.2s2.5-1.7.9-2.7c-5.7,5.5-27.7,26.4-34.6,26.4s-17.1.9-20.9,0ZM296.4,170.2c-11.3,4.3-22.8,8.4-34.6,11.4-12.2,3.1-26.3,2.6-35.5,12.3,25-1.8,50.9-6.6,70.1-23.6ZM259.1,200.2c-4.7,1.3-9.4,2.8-14.2,3.5-17.8,2.7-30.7-.2-46.2,13l-14.2,6.2c21.3-1.4,42.2-6.4,61.6-15.3,4.3-2,9.7-4.3,13-7.4Z"/>
                <path d="M395.4,444.5v42.8h-100.9l-.8,1c-.5,6.8-3.1,13.8-6.8,19.5s-5.9,7.6-6.4,7.9c-1.9,1-11.8-4.7-14.9-4.3,2.4-3.5,5.4-6.9,7.2-10.8,3-6.6,4-15.3,4.3-22.6.5-11-.4-22.4,0-33.4h118.3ZM293.7,460.5h85.1v-7.4c-21-.2-42.1.2-63.2,0s-11.5-.5-17.2-.6-2.9.3-4.3.3l-.6,7.8ZM378.9,467.9h-85.1v8h85.1v-8Z"/>
                <path d="M204,436.5v52.8c0,4.9,7.7,6.7,9.5.9s1.4-7.8,1.4-9.5v-12.9l14.3,3.2c-.2,8.4-.2,17.3-1.2,25.6s-1.5,12.7-6.4,15.3-20.3,2.2-25.3,1.6-8.3-3.1-8.3-7.1v-70h16Z"/>
                <path d="M404,62.6c1.2,1.3,9.1,3.4,11.9,4.9,9.9,5.7,10.3,15.2,7,25.3-2.5.2-2.4-2.4-4.6-4-8.9-6.6-28.5-2.3-38.2,1.8s-12.5,8.7-15.2,9.3c-4.4,1-15.8-1-21.7-.8-18.9.7-37.4,6-55.9,9.1,4.8-5.5,9.3-11.2,13.1-17.4,11.2-18,12.2-34.9,34.9-42.5,15.8-5.3,49.3-7.1,62.6,4.4,4.1,3.5,4.3,7.8,6.2,9.8ZM354.2,62.8c-6.5-.9-14.7.6-21.4,0l13.7,4c4.2,2,6.8,7.1,10.6,9.4,10.3,6.3,27.2.4,30.3-11.7-5.4.9-9.5,7.6-15,7.3s-10.2-8.1-18.2-9.2Z"/>
                <path d="M340.6,511.3l-18.9,3.2c-2-8-7.1-14.1-14.6-17.4l-7.6-2.9c12.6-4.3,29.4-7.2,37.6,6.1s3.7,7.4,3.5,11Z"/>
                <path d="M389.2,511.3l-19.4,2.8c-1.4-7.4-5.9-14.4-13-17.6-2.4-1.1-4.7-1.3-7.1-2.1s-1.3,0-1.1-.8c17.3-6.5,38-3.7,40.6,17.7Z"/>
                <path d="M417.7,500.8c-.7,5.6-5.2,12.1-9.5,15.6l-14.5-5.1c3.8-6.3,5.9-13.8,4-21.1,5.1-.2,10.6-1.5,15.7-1.7s4.3-.2,4.3.9c-.3,3.6.4,7.9,0,11.4Z"/>
              </svg>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold text-white">The Kanyo Project</h1>
              <p className="text-kanyo-orange italic text-lg">Contemplating Falcons</p>
              <p className="text-kanyo-gray-100 text-sm">An open source peregrine falcon monitoring and event archive</p>
            </div>
            </div>

            {/* About Link */}
            <Link to="/about" className="text-kanyo-gray-100 hover:text-kanyo-orange transition-colors text-base font-medium whitespace-nowrap mr-4">
              About
            </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
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
      <footer className="max-w-5xl mx-auto px-6 pb-8">
        <div className="py-6 bg-kanyo-gray-600 rounded-lg text-center">
          <Link to="/about" className="text-kanyo-gray-100 hover:text-kanyo-orange transition-colors">
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
      className="block bg-kanyo-card rounded-xl overflow-hidden hover:ring-2 hover:ring-kanyo-orange transition-all"
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-kanyo-gray-600 flex items-center justify-center relative overflow-hidden">
        {/* Try static image first, then display.thumbnail_url, then snapshot from most recent arrival */}
        <img
          src={`/thumbnails/${stream.id}.jpg`}
          alt={display.short_name || stream.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Try display.thumbnail_url
            if (display.thumbnail_url && e.target.src !== display.thumbnail_url) {
              e.target.src = display.thumbnail_url;
            }
            // Final fallback: snapshot from API (most recent arrival)
            else if (!e.target.src.includes('/api/')) {
              e.target.src = `/api/streams/${stream.id}/snapshot`;
            }
          }}
        />
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
