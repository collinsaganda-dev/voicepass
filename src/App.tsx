import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import CreateSessionPage from './pages/CreateSessionPage';
import OrganizerPage from './pages/OrganizerPage';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route 
            path="/create" 
            element={
              <ProtectedRoute>
                <CreateSessionPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/organizer/:roomCode" 
            element={
              <ProtectedRoute>
                <OrganizerPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
