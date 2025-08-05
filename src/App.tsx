import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { generateRoomCode, isValidRoomCode, formatRoomCode } from './utils/roomCode';

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

  const testRoomCode = () => {
    const code = generateRoomCode();
    const isValid = isValidRoomCode(code);
    const formatted = formatRoomCode(code);
    
    alert(`Generated: ${code}\nValid: ${isValid}\nFormatted: ${formatted}`);
  };

  const testDatabase = async () => {
    try {
      const testCode = generateRoomCode();
      const { data, error } = await supabase
        .from('sessions')
        .insert([{
          name: 'Test Session',
          room_code: testCode,
          organizer_id: crypto.randomUUID() // Generate a proper UUID
        }])
        .select();

      if (error) {
        alert(`Database test failed: ${error.message}`);
        console.error('Database error details:', error);
      } else {
        alert(`✅ Database test successful!\nCreated session: ${data[0].name}\nRoom code: ${data[0].room_code}`);
      }
    } catch (err) {
      alert(`Database error: ${err.message}`);
      console.error('Catch error:', err);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f3f4f6'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <h1 style={{ color: '#2563eb', marginBottom: '1rem' }}>
          🎉 VoicePass Works!
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          Room code fix applied + Supabase integration!
        </p>
        
        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
          <strong>Database Status:</strong><br />
          <span style={{ fontSize: '0.9em' }}>{dbStatus}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button 
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            onClick={testRoomCode}
          >
            Test 8-Char Room Code
          </button>
          
          <button 
            style={{
              backgroundColor: '#059669',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            onClick={testDatabase}
          >
            Test Database Connection
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
