// React import is not needed for JSX in React 17+
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            VoicePass App
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create and manage voice-enabled sessions with ease. Connect with your audience through interactive voice experiences.
          </p>
          <div className="space-x-4">
            <Link
              to="/login"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Get Started
            </Link>
            <Link
              to="/signup"
              className="inline-block bg-gray-200 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-300 transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
