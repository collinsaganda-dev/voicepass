import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QrCode, Users, Mic, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { validateRoomCode, validateName } from '../lib/utils'

export const LandingPage: React.FC = () => {
  const navigate = useNavigate()
  const [roomCode, setRoomCode] = useState('')
  const [participantName, setParticipantName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateRoomCode(roomCode)) {
      setError('Please enter a valid 8-character room code')
      return
    }

    if (!validateName(participantName)) {
      setError('Please enter your name (2-50 characters)')
      return
    }

    setLoading(true)
    try {
      navigate(`/session/${roomCode.toUpperCase()}?name=${encodeURIComponent(participantName)}`)
    } catch (err: any) {
      setError(err.message || 'Failed to join session')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSession = () => {
    navigate('/create')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <Mic className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Voice<span className="text-primary-600">Pass</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your phone into a wireless microphone for events. 
            No more passing mics around—just speak and be heard.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="fade-in">
            <CardTitle className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary-600" />
              Join Session
            </CardTitle>
            <CardContent>
              <form onSubmit={handleJoinSession} className="space-y-4">
                <Input
                  label="Room Code"
                  placeholder="Enter 8-character code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={8}
                  className="font-mono text-center text-lg"
                />
                <Input
                  label="Your Name"
                  placeholder="Enter your name"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  maxLength={50}
                />
                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                  size="lg"
                >
                  {loading ? 'Joining...' : 'Join Session'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="fade-in">
            <CardTitle className="flex items-center gap-2 mb-4">
              <QrCode className="w-5 h-5 text-primary-600" />
              Create Session
            </CardTitle>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Start a new VoicePass session for your event. 
                  Get a QR code and room code that participants can use to join.
                </p>
                <Button 
                  onClick={handleCreateSession}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  Create New Session
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mx-auto">
              <Mic className="w-6 h-6 text-success-600" />
            </div>
            <h3 className="font-semibold">Wireless Audio</h3>
            <p className="text-sm text-gray-600">
              Turn any smartphone into a wireless microphone
            </p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="font-semibold">Queue Management</h3>
            <p className="text-sm text-gray-600">
              Organized speaker queue with approval system
            </p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6 text-warning-600" />
            </div>
            <h3 className="font-semibold">Easy Joining</h3>
            <p className="text-sm text-gray-600">
              Join with QR code scan or simple room code
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
