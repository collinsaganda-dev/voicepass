import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function OrganizerPage() {
  const { roomCode } = useParams();
  const [session, setSession] = useState<any>(null);
  const [participants, setParticipants] = useState([]);
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
      .from(`sessions:room_code=eq.${roomCode}`)
      .on('*', payload => {
        setSession(payload.new);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [roomCode]);

  const handleEndSession = async () => {
    try {
      await supabase
        .from('sessions')
        .update({ status: 'expired' })
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
                <h2 className="text-xl font-semibold text-gray-700The current Supabase client version uses a different API for real-time subscriptions. Let me fix the subscription code in OrganizerPage.tsx to use the correct Supabase real-time API.

<edit_file>
<path>src/pages/OrganizerPage.tsx</path>
<content>
<<<<<<< SEARCH
    // Subscribe to real-time updates
    const subscription = supabase
      .from(`sessions:room_code=eq.${roomCode}`)
      .on('*', payload => {
        setSession(payload.new);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
=======
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('public:sessions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sessions', filter: `room_code=eq.${roomCode}` },
        (payload) => {
          setSession(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
