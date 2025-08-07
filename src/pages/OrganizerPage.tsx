import React from 'react';
import { useParams } from 'react-router-dom';

export default function OrganizerPage() {
  const { roomCode } = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Organizer Dashboard</h1>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700">Room Code</h2>
            <p className="text-2xl font-mono bg-gray-100 p-2 rounded">{roomCode}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Active Participants</h3>
              <p className="text-2xl font-bold text-blue-600">0</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Session Status</h3>
              <p className="text-lg font-medium text-green-600">Active</p>
            </div>
          </div>
          <div className="mt-6">
            <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
              End Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
