import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { generateRoomCode } from '../utils/roomCode';

export default function CreateSessionPage() {
  const [sessionName, setSessionName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to create a session');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const roomCode = generateRoomCode();
      
      const { data: session, error: insertError } = await supabase
        .from('sessions')
        .insert({
          user_id: user.id,
          title: sessionName,
          description: description,
          room_code: roomCode,
          status: 'active',
          organizer_name: user.email?.split('@')[0] || 'Organizer'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      navigate(`/organizer/${roomCode}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Session</h1>
        <form onSubmit={handleCreateSession} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Name
            </label>
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter session name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter session description"
              rows={3}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Session'}
          </button>
          {error && <div className="text-red-500 text-sm">{error}</div>}
        </form>
      </div>
    </div>
  );
}
