import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../store'

export function OrganizerPage() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentSession, setCurrentSession } = useAppStore()

  useEffect(() => {
    async function fetchSessionData() {
      try {
        setLoading(true)
        
        if (!roomCode) {
          setError('Invalid room code')
          return
        }
        
        // Fetch session data
        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .select('*')
          .eq('room_code', roomCode)
          .single()
          
        if (sessionError) {
          throw sessionError
        }
        
        if (!sessionData) {
          setError('Session not found')
          return
        }
        
        setCurrentSession(sessionData)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching session:', err)
        setError('Failed to load session data')
        setLoading(false)
      }
    }
    
    fetchSessionData()
  }, [roomCode, setCurrentSession])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading session...</h2>
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Organizer View</h1>
        <p className="text-gray-600">Room Code: {roomCode}</p>
      </header>
      
      {currentSession && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">{currentSession.session_name}</h2>
          <p className="mb-4">{currentSession.description}</p>
          
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Session Controls</h3>
            {/* Add organizer controls here */}
            <p className="text-gray-600">Organizer controls will appear here.</p>
          </div>
        </div>
      )}
    </div>
  )
}
