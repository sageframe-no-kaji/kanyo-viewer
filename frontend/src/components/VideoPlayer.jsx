import { api } from '../utils/api';

export default function VideoPlayer({ stream, selectedEvent, selectedDate, isLive }) {
  if (isLive) {
    return (
      <div className="bg-kanyo-card rounded-lg overflow-hidden">
        <div className="relative" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${stream.youtube_id}?autoplay=1&mute=0&rel=0`}
            title="Live Stream"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <div className="p-4 border-t border-kanyo-gray-500">
          <div className="flex items-center justify-between">
            <span className="text-kanyo-green font-medium flex items-center">
              <span className="w-2 h-2 bg-kanyo-green rounded-full mr-2 animate-pulse"></span>
              LIVE
            </span>
            <span className="text-kanyo-gray-100 text-sm">
              Viewing live stream
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (selectedEvent) {
    const clipUrl = api.getClipUrl(stream.id, selectedDate, selectedEvent.clip);

    return (
      <div className="bg-kanyo-card rounded-lg overflow-hidden">
        <video
          key={clipUrl}
          className="w-full aspect-video bg-black"
          controls
          autoPlay
        >
          <source src={clipUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="p-4 border-t border-kanyo-gray-500">
          <div className="flex items-center justify-between">
            <span className={`font-medium ${
              selectedEvent.type === 'arrival' ? 'text-kanyo-blue' : 'text-kanyo-red'
            }`}>
              {selectedEvent.type === 'arrival' ? '🔵 Arrival' : '🔴 Departure'}
            </span>
            <span className="text-kanyo-gray-100 text-sm">
              {formatTimestamp(selectedEvent.timestamp)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Default: Show placeholder
  return (
    <div className="bg-kanyo-card rounded-lg overflow-hidden">
      <div className="aspect-video bg-kanyo-gray-600 flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">🦅</div>
        <p className="text-kanyo-gray-100 text-lg">Select an event or click LIVE</p>
      </div>
    </div>
  );
}

function formatTimestamp(isoString) {
  if (!isoString) return 'Unknown';
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}
