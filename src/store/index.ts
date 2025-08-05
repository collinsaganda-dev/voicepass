import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Session, Participant, AppState } from '../types'

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

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      currentSession: null,
      currentParticipant: null,
      isOrganizer: false,
      connectionStatus: 'disconnected',
      audioPermission: false,
      isSpeaking: false,
      isRequestingToSpeak: false,

      setCurrentSession: (session) => set({ 
        currentSession: session,
        isOrganizer: session?.organizer_name === useAppStore.getState().currentParticipant?.participant_name 
      }),
      
      setCurrentParticipant: (participant) => set((state) => ({ 
        currentParticipant: participant,
        isOrganizer: state.currentSession?.organizer_name === participant?.participant_name 
      })),
      
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
      }, true) // true forces state reset
    }),
    {
      name: 'voicepass-storage',
      partialize: (state) => ({
        currentSession: state.currentSession,
        currentParticipant: state.currentParticipant
      })
    }
  )
)