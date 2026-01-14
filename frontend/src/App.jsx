import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import StreamView from './pages/StreamView'
import About from './pages/About'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/stream/:streamId" element={<StreamView />} />
      <Route path="/about" element={<About />} />
    </Routes>
  )
}

export default App
