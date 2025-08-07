import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { supabase, validateConnection } from './lib/supabase';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ErrorFallback from './components/ui/ErrorFallback';
import { generateRoomCode, isValidRoomCode, formatRoomCode } from './utils/roomCode';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load pages
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const CreateSessionPage = React.lazy(() => import('./pages/CreateSessionPage'));
const OrganizerPage = React.lazy(() => import('./pages/OrganizerPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const SignUpPage = React.lazy(() => import('./pages/SignUpPage'));

function App() {
  const [dbStatus, setDbStatus] = useState('Checking...');

  useEffect(() => {
    // Test Supabase connection
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from('sessions').select('count', { count: 'exact' });
        if (error) {
          setDbStatus(`❌ Database connection failed: ${error.message}`);
        } else {
          setDbStatus('✅ Database connected successfully');
        }
      } catch (err) {
        setDbStatus('❌ Supabase not configured');
      }
    };

    testConnection();
  }, []);

  useEffect(() => {
    validateConnection().then(isValid => {
      if (!isValid) {
        console.error('Database connection failed');
      }
    });
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AuthProvider>
        <Router>
          <Suspense fallback={<LoadingSpinner />}>
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
          </Suspense>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
