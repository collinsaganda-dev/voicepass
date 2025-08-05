import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { CreateSessionPage } from './pages/CreateSessionPage'
import { OrganizerPage } from './pages/OrganizerPage'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/create" element={<CreateSessionPage />} />
          <Route path="/organizer/:roomCode" element={<OrganizerPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
