import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-kanyo-bg">
      {/* Header */}
      <header>
        <div className="max-w-5xl mx-auto px-6">
          <div className="py-4 bg-kanyo-card rounded-lg border-b border-kanyo-gray-500">
            {/* Mobile layout */}
            <div className="flex items-center justify-between gap-3 px-4 lg:hidden">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-kanyo-orange flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 500 548.5" className="w-7 h-7 fill-white">
                    <path d="M113.7,335.9h37.4l.9.9v13.7l-.9.9h-22.6l-7.4,11.4h31.4c0,3.3-.1,6.7,0,10s1.2,2.8-.3,3.7h-38.3l-10.6,14.3h13.4c6.2-8.7,19.7-10.4,28.3-4.2s4,4.2,4.3,4.2h10v-54.8h60.3l.9,93.1h-61.1v-26.9l-8.8-.5c-.8.3-1.8,3.6-2.7,4.8-7.9,11-28.6,9.1-32.6-4.3h-12v25.1h49.1v13.7h-19.4v10.9h21.1l-1.1,13.1h-21.1c-1.7,8.3-4.9,16.3-10.3,22.8,14.1-3.8,32.3-12.6,37.7-27.1s2.9-16.1,3.4-24.3h17.1c-.7,9-.7,17.5-3.1,26.3-10.9,39.4-64.6,50.9-99.7,55.4v-21.7c17.5-2.8,33.7-13.4,37.7-31.4h-28l.6-13.1h28.6v-10.9h-28.6v-34.3c-1.9.3-6.3,5.5-7.9,4.5l-9.8-12.2c5.7-4.3,11.4-8.7,16.6-13.7s5.9-5.4,7.4-8.9h-18c-1.4,0-.3-3.8-.3-4.8,0-2.7.2-5.4-.5-8l.8-.9h27.7l6.3-11.4h-8.3c-.7,0-7.3,9.2-10.4,10.2-4.5,1.3-10.5-3.5-15-3.9,5.7-4.6,10-8.9,13.2-15.7,1-2.3,2.8-9.5,3.7-10.6,3.4-4,19.1-2.7,23.1,1.4l-2.3,3.1ZM203.4,350.8h-26.9v12.6h26.9v-12.6ZM203.4,376.5h-26.9v12h26l.9-.9v-11.1ZM131.8,393.8c-4.9,1.1-3.3,9.6,3,7.6s3.1-9-3-7.6ZM203.4,401.1h-26.9v14.3h26.9v-14.3Z"/>
                    <path d="M404,62.6c1.2,1.3,9.1,3.4,11.9,4.9,9.9,5.7,10.3,15.2,7,25.3-2.5.2-2.4-2.4-4.6-4-8.9-6.6-28.5-2.3-38.2,1.8s-12.5,8.7-15.2,9.3c-4.4,1-15.8-1-21.7-.8-18.9.7-37.4,6-55.9,9.1,4.8-5.5,9.3-11.2,13.1-17.4,11.2-18,12.2-34.9,34.9-42.5,15.8-5.3,49.3-7.1,62.6,4.4,4.1,3.5,4.3,7.8,6.2,9.8Z"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <h1 className="text-base font-bold text-kanyo-text truncate">The Kanyō Project</h1>
                  <p className="text-kanyo-orange italic text-xs">Contemplating Falcons</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <ThemeToggle />
                <Link to="/" className="text-kanyo-gray-100 hover:text-kanyo-orange transition-colors text-sm">
                  Streams
                </Link>
              </div>
            </div>

            {/* Desktop layout */}
            <div className="hidden lg:flex items-center justify-between gap-8 px-4">
              <div className="flex items-center gap-8">
                <div className="w-24 h-24 rounded-full bg-kanyo-orange flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 500 548.5" className="w-20 h-20 fill-white">
                    <path d="M113.7,335.9h37.4l.9.9v13.7l-.9.9h-22.6l-7.4,11.4h31.4c0,3.3-.1,6.7,0,10s1.2,2.8-.3,3.7h-38.3l-10.6,14.3h13.4c6.2-8.7,19.7-10.4,28.3-4.2s4,4.2,4.3,4.2h10v-54.8h60.3l.9,93.1h-61.1v-26.9l-8.8-.5c-.8.3-1.8,3.6-2.7,4.8-7.9,11-28.6,9.1-32.6-4.3h-12v25.1h49.1v13.7h-19.4v10.9h21.1l-1.1,13.1h-21.1c-1.7,8.3-4.9,16.3-10.3,22.8,14.1-3.8,32.3-12.6,37.7-27.1s2.9-16.1,3.4-24.3h17.1c-.7,9-.7,17.5-3.1,26.3-10.9,39.4-64.6,50.9-99.7,55.4v-21.7c17.5-2.8,33.7-13.4,37.7-31.4h-28l.6-13.1h28.6v-10.9h-28.6v-34.3c-1.9.3-6.3,5.5-7.9,4.5l-9.8-12.2c5.7-4.3,11.4-8.7,16.6-13.7s5.9-5.4,7.4-8.9h-18c-1.4,0-.3-3.8-.3-4.8,0-2.7.2-5.4-.5-8l.8-.9h27.7l6.3-11.4h-8.3c-.7,0-7.3,9.2-10.4,10.2-4.5,1.3-10.5-3.5-15-3.9,5.7-4.6,10-8.9,13.2-15.7,1-2.3,2.8-9.5,3.7-10.6,3.4-4,19.1-2.7,23.1,1.4l-2.3,3.1ZM203.4,350.8h-26.9v12.6h26.9v-12.6ZM203.4,376.5h-26.9v12h26l.9-.9v-11.1ZM131.8,393.8c-4.9,1.1-3.3,9.6,3,7.6s3.1-9-3-7.6ZM203.4,401.1h-26.9v14.3h26.9v-14.3Z"/>
                    <path d="M404,62.6c1.2,1.3,9.1,3.4,11.9,4.9,9.9,5.7,10.3,15.2,7,25.3-2.5.2-2.4-2.4-4.6-4-8.9-6.6-28.5-2.3-38.2,1.8s-12.5,8.7-15.2,9.3c-4.4,1-15.8-1-21.7-.8-18.9.7-37.4,6-55.9,9.1,4.8-5.5,9.3-11.2,13.1-17.4,11.2-18,12.2-34.9,34.9-42.5,15.8-5.3,49.3-7.1,62.6,4.4,4.1,3.5,4.3,7.8,6.2,9.8Z"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-kanyo-text">The Kanyō Project</h1>
                  <p className="text-kanyo-orange italic text-lg">Contemplating Falcons</p>
                  <p className="text-kanyo-gray-100 text-sm">An open source peregrine falcon monitoring and event archive</p>
                </div>
              </div>
              <div className="flex items-center gap-4 mr-4">
                <ThemeToggle />
                <Link to="/" className="text-kanyo-gray-100 hover:text-kanyo-orange transition-colors text-base font-medium whitespace-nowrap">
                  Streams
                </Link>
                <Link to="/about" className="text-kanyo-gray-100 hover:text-kanyo-orange transition-colors text-base font-medium whitespace-nowrap">
                  About
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-kanyo-text mb-2">How It Works</h1>
        <p className="text-kanyo-gray-100 text-lg mb-10 leading-relaxed">
          A technical overview of how Kanyō turns a 24/7 video stream into a clean archive of falcon visits.
        </p>

        <div className="space-y-12 text-kanyo-gray-100">

          {/* 1. The detection problem */}
          <section>
            <h2 className="text-2xl font-semibold text-kanyo-text mb-3">The Detection Problem</h2>
            <p className="leading-relaxed mb-4">
              Running YOLO on every frame produces noise, not signal. A bird moves slightly and you get:
            </p>
            <pre className="bg-kanyo-card border border-kanyo-gray-500 rounded-lg p-4 text-sm font-mono text-kanyo-orange overflow-x-auto mb-4">
{`10:00:01 DETECTED
10:00:02 not detected
10:00:03 DETECTED
10:00:04 DETECTED
10:00:05 not detected   ← bird just moved`}
            </pre>
            <p className="leading-relaxed">
              That's not useful. Kanyō uses a state machine with configurable timeouts to filter the noise
              and produce meaningful events: one arrival, one departure, visit duration — regardless of
              how much the bird fidgets or the detection confidence fluctuates.
            </p>
          </section>

          {/* 2. State machine */}
          <section>
            <h2 className="text-2xl font-semibold text-kanyo-text mb-3">State Machine</h2>
            <p className="leading-relaxed mb-4">
              Three states. Two configurable timeouts. The logic is simple by design.
            </p>
            <pre className="bg-kanyo-card border border-kanyo-gray-500 rounded-lg p-4 text-sm font-mono text-kanyo-text overflow-x-auto mb-6">
{`ABSENT ──(confirmed arrival)──► VISITING ──(> roosting_threshold)──► ROOSTING
  ▲                                  │                                      │
  └──(absent > exit_timeout)─────────┘                                      │
  ▲                                                                          │
  └──────────────(absent > exit_timeout)────────────────────────────────────┘`}
            </pre>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-kanyo-gray-500">
                    <th className="text-left py-2 pr-4 text-kanyo-text font-semibold">State</th>
                    <th className="text-left py-2 pr-4 text-kanyo-text font-semibold">Meaning</th>
                    <th className="text-left py-2 text-kanyo-text font-semibold">Trigger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-kanyo-gray-500">
                  <tr>
                    <td className="py-2 pr-4 font-mono text-kanyo-orange">ABSENT</td>
                    <td className="py-2 pr-4">No bird present</td>
                    <td className="py-2">Initial state; or absent &gt; <code className="text-kanyo-orange">exit_timeout</code></td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-kanyo-orange">VISITING</td>
                    <td className="py-2 pr-4">Bird confirmed present</td>
                    <td className="py-2">Arrival confirmed after confirmation window</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-kanyo-orange">ROOSTING</td>
                    <td className="py-2 pr-4">Bird settled in for a long stay</td>
                    <td className="py-2">Continuously present &gt; <code className="text-kanyo-orange">roosting_threshold</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 3. What gets recorded */}
          <section>
            <h2 className="text-2xl font-semibold text-kanyo-text mb-3">What Gets Recorded</h2>
            <p className="leading-relaxed mb-4">
              Every confirmed visit produces up to three video files:
            </p>
            <div className="space-y-4">
              <div className="bg-kanyo-card border border-kanyo-gray-500 rounded-lg p-4">
                <h3 className="font-semibold text-kanyo-text mb-1">Arrival clip</h3>
                <p className="text-sm leading-relaxed">
                  ~45 seconds centred on the moment the bird lands. Pulled from an in-memory rolling
                  buffer so the pre-arrival frames are always captured — even though recording
                  confirmation happens a few seconds later.
                </p>
              </div>
              <div className="bg-kanyo-card border border-kanyo-gray-500 rounded-lg p-4">
                <h3 className="font-semibold text-kanyo-text mb-1">Full visit recording</h3>
                <p className="text-sm leading-relaxed">
                  The complete visit from arrival to departure. Viewable in the timeline player.
                  In <code className="text-kanyo-orange">continuous</code> roosting mode this captures the entire
                  stay regardless of duration. In <code className="text-kanyo-orange">stop</code> mode it is
                  finalized at the roosting threshold to save disk.
                </p>
              </div>
              <div className="bg-kanyo-card border border-kanyo-gray-500 rounded-lg p-4">
                <h3 className="font-semibold text-kanyo-text mb-1">Departure clip</h3>
                <p className="text-sm leading-relaxed">
                  ~45 seconds ending shortly after the bird leaves. In normal visits this is extracted
                  from the visit file. After a roost in <code className="text-kanyo-orange">stop</code> mode it
                  is extracted from the rolling buffer instead.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Roosting */}
          <section>
            <h2 className="text-2xl font-semibold text-kanyo-text mb-3">Roosting Behaviour</h2>
            <p className="leading-relaxed mb-4">
              When a bird has been present continuously for longer than <code className="text-kanyo-orange">roosting_threshold</code>{' '}
              (default: 30 minutes), the system transitions to ROOSTING state and sends a notification.
              What happens next depends on the configured recording mode:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-kanyo-gray-500">
                    <th className="text-left py-2 pr-6 text-kanyo-text font-semibold">Mode</th>
                    <th className="text-left py-2 pr-6 text-kanyo-text font-semibold">Recording</th>
                    <th className="text-left py-2 pr-6 text-kanyo-text font-semibold">YOLO rate</th>
                    <th className="text-left py-2 text-kanyo-text font-semibold">Best for</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-kanyo-gray-500">
                  <tr>
                    <td className="py-2 pr-6 font-mono text-kanyo-orange">continuous</td>
                    <td className="py-2 pr-6">Records entire visit</td>
                    <td className="py-2 pr-6">Unchanged</td>
                    <td className="py-2">Research archiving</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-6 font-mono text-kanyo-orange">stop</td>
                    <td className="py-2 pr-6">Finalizes at threshold; departure from buffer</td>
                    <td className="py-2 pr-6">1 check / 30s</td>
                    <td className="py-2">Disk-constrained cams</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 5. Settings reference */}
          <section>
            <h2 className="text-2xl font-semibold text-kanyo-text mb-3">Settings Reference</h2>
            <p className="leading-relaxed mb-4">
              All behaviour is controlled through a single YAML config file per camera.
              Key settings grouped by category:
            </p>

            {[
              {
                group: 'Detection',
                rows: [
                  ['detection_confidence', '0.3', 'YOLO confidence threshold. Lower = more sensitive.'],
                  ['frame_interval', '3', 'Process 1 in every N frames. Higher = less CPU.'],
                  ['model_path', 'yolov8n.pt', 'YOLO model. nano is fast; small is more accurate.'],
                ],
              },
              {
                group: 'State Machine',
                rows: [
                  ['exit_timeout', '90s', 'Seconds absent before DEPARTED fires.'],
                  ['roosting_threshold', '1800s', 'Seconds present before ROOSTING state.'],
                  ['arrival_confirmation_seconds', '10s', 'Confirmation window length.'],
                  ['arrival_confirmation_ratio', '0.3', 'Fraction of window frames that must detect.'],
                ],
              },
              {
                group: 'Recording',
                rows: [
                  ['roosting_recording_mode', 'continuous', 'continuous or stop.'],
                  ['roosting_detection_interval', '30s', 'YOLO poll interval during roost (stop mode).'],
                  ['clip_arrival_before', '15s', 'Pre-arrival seconds in arrival clip.'],
                  ['clip_departure_after', '15s', 'Post-departure seconds in departure clip.'],
                  ['short_visit_threshold', '600s', 'Visits shorter than this are not archived.'],
                ],
              },
              {
                group: 'Notifications',
                rows: [
                  ['telegram_enabled', 'false', 'Public arrival/departure alerts to Telegram.'],
                  ['ntfy_admin_enabled', 'false', 'Admin-only push alerts for errors and outages.'],
                  ['notification_cooldown_minutes', '5', 'Minimum gap between Telegram messages.'],
                ],
              },
            ].map(({ group, rows }) => (
              <div key={group} className="mb-6">
                <h3 className="text-sm font-semibold text-kanyo-orange uppercase tracking-wide mb-2">{group}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <tbody className="divide-y divide-kanyo-gray-500">
                      {rows.map(([key, def, desc]) => (
                        <tr key={key}>
                          <td className="py-2 pr-4 font-mono text-kanyo-text w-56">{key}</td>
                          <td className="py-2 pr-4 font-mono text-kanyo-orange w-24">{def}</td>
                          <td className="py-2 leading-relaxed">{desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </section>

          {/* 6. Hobby vs research */}
          <section>
            <h2 className="text-2xl font-semibold text-kanyo-text mb-3">Hobby vs Research</h2>
            <p className="leading-relaxed mb-4">
              The default settings are tuned for a hobby monitoring setup: low disk usage, generous
              detection thresholds, minimal configuration required.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-kanyo-card border border-kanyo-gray-500 rounded-lg p-4">
                <h3 className="font-semibold text-kanyo-text mb-3">Hobby defaults</h3>
                <ul className="text-sm space-y-1 leading-relaxed">
                  <li><code className="text-kanyo-orange">roosting_recording_mode: continuous</code></li>
                  <li><code className="text-kanyo-orange">detection_confidence: 0.3</code></li>
                  <li><code className="text-kanyo-orange">model: yolov8n.pt</code> (fast nano)</li>
                  <li><code className="text-kanyo-orange">short_visit_threshold: 600s</code></li>
                </ul>
              </div>
              <div className="bg-kanyo-card border border-kanyo-gray-500 rounded-lg p-4">
                <h3 className="font-semibold text-kanyo-text mb-3">Research considerations</h3>
                <ul className="text-sm space-y-1 leading-relaxed">
                  <li><code className="text-kanyo-orange">roosting_recording_mode: continuous</code> (always)</li>
                  <li>Lower confidence threshold for maximum recall</li>
                  <li><code className="text-kanyo-orange">model: yolov8s.pt</code> (better accuracy)</li>
                  <li><code className="text-kanyo-orange">short_visit_threshold: 60s</code> (capture all landings)</li>
                  <li>No clip retention limits</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 7. Researcher invitation */}
          <section>
            <h2 className="text-2xl font-semibold text-kanyo-text mb-3">For Researchers</h2>
            <p className="leading-relaxed mb-4">
              The detection engine is open source and designed to be reusable. It can run on any YouTube
              live stream — not just falcons. Potential research applications include breeding phenology,
              nest attendance patterns, prey delivery frequency, and multi-site behaviour comparison.
            </p>
            <p className="leading-relaxed">
              If you're working on raptor ecology or wildlife monitoring and want to discuss what this
              platform could support at research scale,{' '}
              <a
                href="https://github.com/sageframe-no-kaji/kanyo-contemplating-falcons-dev/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-kanyo-orange hover:text-white transition-colors"
              >
                open an issue on GitHub
              </a>
              .
            </p>
          </section>

        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-kanyo-gray-500 flex flex-wrap gap-6">
          <Link to="/" className="text-kanyo-orange hover:text-white transition-colors">
            ← Back to Streams
          </Link>
          <Link to="/about" className="text-kanyo-orange hover:text-white transition-colors">
            About Kanyō
          </Link>
        </div>
      </main>
    </div>
  );
}
