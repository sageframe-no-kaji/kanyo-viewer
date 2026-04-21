import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import StreamView from './pages/StreamView'
import About from './pages/About'
import Help from './pages/Help'
import HowItWorks from './pages/HowItWorks'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/stream/:streamId" element={<StreamView />} />
        <Route path="/about" element={<About />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/help/telegram" element={<Help />} />
      </Routes>
    </>
  )
}

export default App
