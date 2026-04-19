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
      lineHeight: '1.6',
    }}>
      <p style={{ margin: '0 auto', maxWidth: '1100px' }}>
        <strong>🦅 Kanyō is temporarily offline</strong> (2026-04-19)
        {' — '}
        YouTube rate-limited our home IP. Relocating detection to an enterprise-grade network.
        {' '}
        <strong>Expected back: Monday evening.</strong>
        {' '}
        Archive clips still available. Watch live on the{' '}
        <a href="https://www.youtube.com/live/glczTFRRAK4" target="_blank" rel="noopener noreferrer" style={link}>Memorial Hall Cam</a>.
        {' '}
        <a href="https://github.com/sageframe-no-kaji/kanyo-contemplating-falcons-dev/issues" target="_blank" rel="noopener noreferrer" style={link}>GitHub Issues</a>
        {' · '}
        <a href="/about" style={link}>About</a>
        {' · '}
        <a href="mailto:tyro@sageframe.net" style={link}>tyro@sageframe.net</a>
        {' — Andrew'}
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
