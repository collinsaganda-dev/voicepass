import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function CreateSessionPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    session_name: '',
    description: '',
    organizer_name: '',
    max_speaking_time: 300,
    auto_approve: false,
  })

  // Client-side room code generator (bypasses Supabase RPC)
  const generateRoomCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const validateName = (name: string): boolean => {
    return name.length >= 2 && name.length <= 50
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate inputs
      if (!validateName(formData.session_name)) {
        setError('Session name must be 2-50 characters')
        return
      }

      if (!validateName(formData.organizer_name)) {
        setError('Organizer name must be 2-50 characters')
        return
      }

      // Generate room code locally
      let roomCode = generateRoomCode()
      
      // Check if room code exists (with retry logic)
      let attempts = 0
      while (attempts < 5) {
        const { data: existingSession, error: checkError } = await supabase
          .from('sessions')
          .select('room_code')
          .eq('room_code', roomCode)
          .single()

        if (checkError && checkError.code === 'PGRST116') {
          // No existing session found, good to use this code
          break
        } else if (existingSession) {
          // Code exists, generate a new one
          roomCode = generateRoomCode()
          attempts++
        } else if (checkError) {
          console.error('Error checking room code:', checkError)
          break
        }
      }

      // Create session
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          room_code: roomCode,
          session_name: formData.session_name,
          description: formData.description,
          organizer_name: formData.organizer_name,
          max_speaking_time: formData.max_speaking_time,
          auto_approve: formData.auto_approve,
          is_active: true,
          settings: {}
        })
        .select()
        .single()

      if (error) throw error

      console.log('Session created successfully:', data)
      navigate(`/organizer/${roomCode}`)
    } catch (err) {
      console.error('Error creating session:', err)
      setError(err instanceof Error ? err.message : 'Failed to create session')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Create New Session</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="session_name" className="block text-sm font-medium text-gray-700 mb-1">
              Session Name
            </label>
            <input
              type="text"
              id="session_name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.session_name}
              onChange={(e) => setFormData(prev => ({ ...prev, session_name: e.target.value }))}
              placeholder="Enter session name"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your session"
            />
          </div>

          <div>
            <label htmlFor="organizer_name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name (Organizer)
            </label>
            <input
              type="text"
              id="organizer_name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.organizer_name}
              onChange={(e) => setFormData(prev => ({ ...prev, organizer_name: e.target.value }))}
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label htmlFor="max_speaking_time" className="block text-sm font-medium text-gray-700 mb-1">
              Max Speaking Time (seconds)
            </label>
            <input
              type="number"
              id="max_speaking_time"
              min="30"
              max="1800"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.max_speaking_time}
              onChange={(e) => setFormData(prev => ({ ...prev, max_speaking_time: Number(e.target.value) }))}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="auto_approve"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={formData.auto_approve}
              onChange={(e) => setFormData(prev => ({ ...prev, auto_approve: e.target.checked }))}
            />
            <label htmlFor="auto_approve" className="ml-2 text-sm text-gray-700">
              Auto-approve speaking requests
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Creating Session...' : 'Create Session'}
          </button>
        </form>
      </div>
    </div>
  )
}