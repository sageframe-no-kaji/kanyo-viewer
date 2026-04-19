import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import StreamView from './pages/StreamView'
import About from './pages/About'
import Help from './pages/Help'

function OutageBanner() {
  const link = { color: 'white', textDecoration: 'underline' }
  return (
    <div style={{
      backgroundColor: '#dc2626',
      color: 'white',
      padding: '0.75rem 2rem',
      textAlign: 'center',
      fontSize: '0.8125rem',
      lineHeight: '1.4',
    }}>
      <p style={{ margin: '0 auto 0.5rem', maxWidth: '1100px', lineHeight: '1.4' }}>
        <strong>🦅 Kanyō is temporarily offline</strong> (2026-04-19)
        {' — '}
        YouTube recently changed how third-party tools can access live streams,
        and my home IP got rate-limited in the process.
        I'm relocating the detection system to a new network with an enterprise-grade IP.
        {' '}
        <strong>New stream monitoring and recording are expected back Monday evening.</strong>
      </p>
      <p style={{ margin: '0 auto', maxWidth: '1100px', lineHeight: '1.4' }}>
        In the meantime: enjoy the archive clips, read about the project on the{' '}
        <a href="/about" style={link}>About</a> page,
        or watch the falcons directly on the{' '}
        <a href="https://www.youtube.com/live/glczTFRRAK4" target="_blank" rel="noopener noreferrer" style={link}>Memorial Hall Cam</a>.
        {' '}
        Follow progress on{' '}
        <a href="https://github.com/sageframe-no-kaji/kanyo-contemplating-falcons-dev/issues" target="_blank" rel="noopener noreferrer" style={link}>GitHub Issues</a>.
        {' '}
        If you have GPU-enabled cloud compute to spare, I'd love to hear from you
        {' — '}
        <a href="mailto:tyro@sageframe.net" style={link}>tyro@sageframe.net</a>.
        {' '}
        Otherwise: see you Monday. 🦅 — Andrew
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
