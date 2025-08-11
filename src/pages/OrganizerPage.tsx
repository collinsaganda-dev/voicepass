import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function OrganizerPage() {
  const { roomCode } = useParams();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomCode) return;

    const fetchSession = async () => {
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('room_code', roomCode)
          .single();

        if (error) throw error;
        setSession(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching session:', error);
        setLoading(false);
      }
    };

    fetchSession();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('public:sessions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sessions', filter: `room_code=eq.${roomCode}` },
        (payload: any) => {
          setSession(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [roomCode]);

  const handleEndSession = async () => {
    try {
      await supabase
        .from('sessions')
        .update({ status: 'ended' })
        .eq('room_code', roomCode);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Organizer Dashboard</h1>
          
          {session ? (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Session Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Room Code</p>
                    <p className="font-medium">{session.room_code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Session Name</p>
                    <p className="font-medium">{session.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium">{session.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-medium">{new Date(session.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={handleEndSession}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
                >
                  End Session
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No session found with room code: {roomCode}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
