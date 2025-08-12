# VoicePass - Virtual Microphone System

Transform smartphones into wireless microphones for public events.

## Features

- 📱 **Wireless Audio**: Turn any smartphone into a wireless microphone
- 🎯 **Queue Management**: Organized speaker queue with approval system  
- 📋 **QR Code Joining**: Easy participation via QR code or room code
- 🎛️ **Organizer Controls**: Full control over speaking permissions and timing
- ⚡ **Real-time**: Live audio streaming and instant updates
- 🔒 **Secure**: End-to-end encryption and session-based access

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Set up database:**
   - Create a new Supabase project
   - Run the migration script in `supabase/migrations/`
   - Update your .env file with Supabase credentials

## Usage

### For Event Organizers
1. Click "Create Session"
2. Fill in event details
3. Share the QR code or room code with participants
4. Manage speaking queue and approve requests

### For Participants  
1. Scan QR code or enter room code
2. Enter your name to join
3. Request to speak when ready
4. Wait for approval and speak when called

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Audio**: Web Audio API + WebRTC
- **State**: Zustand
- **UI**: Custom components with Lucide icons

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── ui/            # Basic UI components
│   └── ...            # Feature components
├── hooks/             # Custom React hooks
├── lib/               # Utilities and configurations
├── pages/             # Page components
├── store/             # State management
└── types/             # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.