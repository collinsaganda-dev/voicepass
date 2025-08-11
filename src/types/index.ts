export interface Session {
  id: string;
  created_at: string;
  user_id: string;
  status: 'active' | 'expired';
  organizer_name?: string;
  room_code?: string;
  title?: string;
  description?: string;
}

export interface Participant {
  id?: string;
  participant_name?: string;
  participant_email?: string;
  is_speaking?: boolean;
  is_moderator?: boolean;
  joined_at?: string;
}

export interface AppState {
  currentSession: Session | null;
  currentParticipant: Participant | null;
  isOrganizer: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  audioPermission: boolean;
  isSpeaking: boolean;
  isRequestingToSpeak: boolean;
}
