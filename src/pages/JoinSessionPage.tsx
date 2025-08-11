import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function JoinSessionPage() {
  const [roomCode, setRoomCode] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if session exists
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('room_code', roomCode.toUpperCase())
        .eq('status', 'active')
        .single();

      if (sessionError || !session) {
        setError('Session not found or has ended');
        setLoading(false);
        return;
      }

      // Create or update participant
      const { data: participant, error: participantError } = await supabase
        .from('participants')
        .insert({
          session_id: session.id,
          participant_name: participantName,
          is_speaking: false,
          is_moderator: false
        })
        .select()
        .single();

      if (participantError) throw participantError;

      // Navigate to participant view
      navigate(`/session/${roomCode.toUpperCase()}`, {
        state: { participant, session }
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to join session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Join Session</h1>
        <form onSubmit={handleJoinSession} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Code
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter room code"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Joining...' : 'Join Session'}
          </button>
          {error && <div className="text-red-500 text-sm">{error}</div>}
        </form>
      </div>
    </div>
  );
}
