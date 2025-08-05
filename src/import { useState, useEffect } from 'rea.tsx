import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function OrganizerPage() {
  const { roomCode } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    loadSession();
    subscribeToParticipants();
  }, [roomCode, user]);

  const loadSession = async () => {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('room_code', roomCode)
      .single();

    if (error || !data) {
      navigate('/create');
      return;
    }

    if (data.organizer_id !== user.id) {
      navigate('/');
      return;
    }

    setSession(data);
  };

  const subscribeToParticipants = () => {
    const subscription = supabase
      .from('participants')
      .on('*', (payload) => {
        loadParticipants();
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
    };
  };

  const loadParticipants = async () => {
    const { data } = await supabase
      .from('participants')
      .select('*')
      .eq('session_id', session?.id);
    
    setParticipants(data || []);
  };

  const endSession = async () => {
    await supabase
      .from('sessions')
      .update({ status: 'ended' })
      .eq('id', session?.id);
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Session Control Panel</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl mb-4">Room Code: {roomCode}</h2>
        <div className="mb-6">
          <h3 className="font-medium mb-2">Participants ({participants.length})</h3>
          <ul className="space-y-2">
            {participants.map((participant) => (
              <li key={participant.id} className="flex justify-between items-center">
                <span>{participant.name}</span>
                <button 
                  onClick={() => removeParticipant(participant.id)}
                  className="text-red-500"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={endSession}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          End Session
        </button>
      </div>
    </div>
  );
}
