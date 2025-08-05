// Code adapted from:
// https://github.com/danialnoaein/filter-app-front/blob/ba608c8693d22cea121f31d45d6df64d3bdedec0/src/context/AuthContext.tsx
// https://github.com/1barada/sauda/blob/8cc30a861d68960006fa037cf2dd84f8ac5681eb/hooks/useAuth.tsx

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // ...existing implementation...
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
