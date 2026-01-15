import { api } from '../utils/api';

export default function VideoPlayer({ stream, selectedEvent, selectedDate, isLive }) {
  if (isLive) {
    return (
      <div className="bg-kanyo-card rounded-lg overflow-hidden">
        <div className="relative" style={{ paddingBottom: '56.25%' }}>
          <iframe
            key={`live-${stream.id}`}
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${stream.youtube_id}?autoplay=1&mute=0&controls=1&rel=0&enablejsapi=1`}
            title="Live Stream"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <div className="p-4 border-t border-kanyo-gray-500">
          <div className="flex items-center justify-between text-xs">
            <span className="text-kanyo-green font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 bg-kanyo-green rounded-full animate-pulse"></span>
              LIVE
            </span>
            <span className="text-kanyo-gray-100">
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
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-kanyo-red font-semibold">
                <span className="w-2 h-2 bg-kanyo-red rounded-full"></span>
                Visit
              </span>
              <span className="text-kanyo-gray-100">Arrived: {formatTimestamp(selectedEvent.timestamp)}</span>
              <span className="text-kanyo-gray-300">•</span>
              <span className="text-kanyo-gray-100">Departed: {formatDepartureTime(selectedEvent)}</span>
              <span className="text-kanyo-gray-300">•</span>
              <span className="text-kanyo-gray-100">Duration: {formatDuration(selectedEvent.duration)}</span>
            </div>
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
      <div className="p-4 border-t border-kanyo-gray-500">
        <div className="flex items-center justify-center text-xs">
          <span className="text-kanyo-gray-100 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 bg-white rounded-full"></span>
            Select a clip
          </span>
        </div>
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
    hour12: true
  });
}

function formatDepartureTime(event) {
  if (!event.timestamp || !event.duration) return 'Unknown';
  const arrival = new Date(event.timestamp);
  const departure = new Date(arrival.getTime() + event.duration * 1000);
  return departure.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

function formatDuration(seconds) {
  if (!seconds) return '0s';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}
