import { api } from '../utils/api';

export default function EventDetails({ event, streamId, selectedDate }) {
  const clipUrl = api.getClipUrl(streamId, selectedDate, event.clip);
  const shareUrl = `${window.location.origin}/stream/${streamId}?date=${selectedDate}&event=${event.event_id}`;

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link copied to clipboard!');
    }
  }

  return (
    <div className="bg-kanyo-card rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Event Details</h3>

      <div className="space-y-4">
        {/* Event Type */}
        <div className="flex items-center justify-between">
          <span className="text-kanyo-gray-100">Type</span>
          <span className={`font-medium ${
            event.type === 'arrival' ? 'text-kanyo-blue' : 'text-kanyo-red'
          }`}>
            {event.type === 'arrival' ? '🔵 Arrival' : '🔴 Departure'}
          </span>
        </div>

        {/* Time */}
        <div className="flex items-center justify-between">
          <span className="text-kanyo-gray-100">Time</span>
          <span className="text-white">{formatTimestamp(event.timestamp)}</span>
        </div>

        {/* Confidence */}
        {event.confidence && (
          <div className="flex items-center justify-between">
            <span className="text-kanyo-gray-100">Confidence</span>
            <span className="text-white">{Math.round(event.confidence * 100)}%</span>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-kanyo-gray-500">
          {/* Download Button */}
          <a
            href={clipUrl}
            download
            className="flex items-center justify-center gap-2 bg-kanyo-gray-600 hover:bg-kanyo-gray-500 text-white font-medium py-3 px-4 rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </a>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 bg-kanyo-orange hover:bg-opacity-80 text-white font-medium py-3 px-4 rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
        </div>
      </div>
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
    second: '2-digit',
    hour12: true
  });
}
