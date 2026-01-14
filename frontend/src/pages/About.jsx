import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-kanyo-bg">
      {/* Header */}
      <header className="border-b border-kanyo-gray-500 bg-kanyo-card">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link to="/" className="text-kanyo-orange hover:text-white transition-colors">
            ← Back to Streams
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-6">About Kanyo</h1>

        <div className="space-y-6 text-kanyo-gray-100">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">What is Kanyo?</h2>
            <p className="leading-relaxed">
              Kanyo is an automated falcon monitoring system that uses computer vision to detect
              falcon arrivals, departures, and visits from live camera streams. The system automatically
              creates video clips and thumbnails of significant events, making it easy to watch and
              share falcon activity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">Features</h2>
            <ul className="list-disc list-inside space-y-2 leading-relaxed">
              <li>Real-time falcon detection with confidence scoring</li>
              <li>Automatic clip generation for arrivals and departures</li>
              <li>Timeline view showing all events throughout the day</li>
              <li>Live stream viewing and archived clip playback</li>
              <li>Multi-stream support across different geographic locations</li>
              <li>Dual timezone display (stream local time + visitor timezone)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">Technology</h2>
            <p className="leading-relaxed">
              Kanyo is built with FastAPI (Python) for the detection pipeline and backend API,
              React + Vite for the frontend viewer, and Docker for deployment. The system is
              designed to be reusable by others monitoring falcon nests.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">Open Source</h2>
            <p className="leading-relaxed">
              The Kanyo detection tool is available as open source software. The viewer is a
              separate deployment-specific frontend for presenting the data to the public.
            </p>
          </section>

          <div className="mt-12 p-6 bg-kanyo-card rounded-lg">
            <p className="text-sm text-kanyo-gray-100">
              For questions or more information, please visit the project repository or contact
              the stream maintainers directly.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
