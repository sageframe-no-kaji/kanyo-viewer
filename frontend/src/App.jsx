import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import StreamView from './pages/StreamView'
import About from './pages/About'
import Help from './pages/Help'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/stream/:streamId" element={<StreamView />} />
      <Route path="/about" element={<About />} />
      <Route path="/help/telegram" element={<Help />} />
    </Routes>
  )
}

export default App
