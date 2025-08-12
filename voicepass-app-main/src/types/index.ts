// Database types
export interface Session {
  id: string;
  room_code: string;
  session_name: string;
  description?: string;
  organizer_name: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  max_speaking_time: number;
  auto_approve: boolean;
  settings: Record<string, any>;
}

export interface Participant {
  id: string;
  session_id: string;
  participant_name: string;
  is_organizer: boolean;
  joined_at: string;
  last_seen: string;
  connection_id?: string;
  is_connected: boolean;
}

export interface SpeakerQueue {
  id: string;
  session_id: string;
  participant_id: string;
  participant?: Participant;
  request_message?: string;
  requested_at: string;
  status: 'pending' | 'approved' | 'denied' | 'completed';
  queue_position?: number;
  approved_at?: string;
  speaking_started_at?: string;
  speaking_ended_at?: string;
}

// App state types
export interface AppState {
  currentSession: Session | null;
  currentParticipant: Participant | null;
  isOrganizer: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  audioPermission: boolean;
  isSpeaking: boolean;
  isRequestingToSpeak: boolean;
}

// Form types
export interface CreateSessionForm {
  session_name: string;
  description?: string;
  organizer_name: string;
  max_speaking_time: number;
  auto_approve: boolean;
}

export interface JoinSessionForm {
  room_code: string;
  participant_name: string;
}