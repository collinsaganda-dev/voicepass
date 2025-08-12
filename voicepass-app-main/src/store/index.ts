import { create } from 'zustand'
import { Session, Participant, AppState } from '../types'

interface AppStore extends AppState {
  setCurrentSession: (session: Session | null) => void
  setCurrentParticipant: (participant: Participant | null) => void
  setIsOrganizer: (isOrganizer: boolean) => void
  setConnectionStatus: (status: 'connected' | 'connecting' | 'disconnected') => void
  setAudioPermission: (permission: boolean) => void
  setIsSpeaking: (speaking: boolean) => void
  setIsRequestingToSpeak: (requesting: boolean) => void
  reset: () => void
}

export const useAppStore = create<AppStore>((set) => ({
  currentSession: null,
  currentParticipant: null,
  isOrganizer: false,
  connectionStatus: 'disconnected',
  audioPermission: false,
  isSpeaking: false,
  isRequestingToSpeak: false,

  setCurrentSession: (session) => set({ currentSession: session }),
  setCurrentParticipant: (participant) => set({ currentParticipant: participant }),
  setIsOrganizer: (isOrganizer) => set({ isOrganizer }),
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
  setAudioPermission: (audioPermission) => set({ audioPermission }),
  setIsSpeaking: (isSpeaking) => set({ isSpeaking }),
  setIsRequestingToSpeak: (isRequestingToSpeak) => set({ isRequestingToSpeak }),

  reset: () => set({
    currentSession: null,
    currentParticipant: null,
    isOrganizer: false,
    connectionStatus: 'disconnected',
    audioPermission: false,
    isSpeaking: false,
    isRequestingToSpeak: false,
  }),
}))
