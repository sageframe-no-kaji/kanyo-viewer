import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import StreamView from './pages/StreamView'
import About from './pages/About'
import Help from './pages/Help'

function OutageBanner() {
  return (
    <div style={{
      backgroundColor: '#dc2626',
      color: 'white',
      padding: '1.5rem 2rem',
      textAlign: 'center',
      fontSize: '0.95rem',
      lineHeight: '1.6',
    }}>
      <p style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
        🦅 Kanyō is temporarily offline
      </p>
      <p style={{ maxWidth: '640px', margin: '0 auto 0.75rem' }}>
        YouTube recently changed how third-party tools can access live streams,
        and my home IP got rate-limited in the process. I'm relocating the detection
        system to a new home with an enterprise-grade IP.
      </p>
      <p style={{ fontWeight: '600', marginBottom: '0.75rem' }}>
        New stream monitoring and recording are expected back: Monday evening
      </p>
      <p style={{ maxWidth: '640px', margin: '0 auto 0.75rem' }}>
        In the meantime: enjoy archive clips, read about the project at{' '}
        <a href="/about" style={{ color: 'white', textDecoration: 'underline' }}>kanyo.sageframe.net/about</a>,
        or watch the falcons directly on the{' '}
        <a href="https://www.youtube.com/live/glczTFRRAK4" target="_blank" rel="noopener noreferrer"
           style={{ color: 'white', textDecoration: 'underline' }}>Memorial Hall Cam</a>.
      </p>
      <p style={{ maxWidth: '640px', margin: '0 auto 0.75rem', fontSize: '0.875rem' }}>
        Follow progress on{' '}
        <a href="https://github.com/sageframe-no-kaji/kanyo-contemplating-falcons-dev/issues"
           target="_blank" rel="noopener noreferrer"
           style={{ color: 'white', textDecoration: 'underline' }}>GitHub Issues</a>.
        If you happen to have GPU-enabled cloud compute to donate to this project,
        I'd love to hear from you — <a href="mailto:tyro@sageframe.net"
          style={{ color: 'white', textDecoration: 'underline' }}>tyro@sageframe.net</a>.
      </p>
      <p style={{ marginTop: '0.5rem' }}>
        Otherwise: see you Monday. 🦅
      </p>
      <p style={{ marginTop: '0.5rem', fontStyle: 'italic', fontSize: '0.875rem' }}>
        — Andrew
      </p>
    </div>
  )
}

function App() {
  return (
    <>
      <OutageBanner />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/stream/:streamId" element={<StreamView />} />
        <Route path="/about" element={<About />} />
        <Route path="/help/telegram" element={<Help />} />
      </Routes>
    </>
  )
}

export default App
