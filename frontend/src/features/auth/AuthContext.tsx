import { createContext } from 'react';

// Assuming basic UserResponse structure from typical implementation
export interface UserResponse {
  id: string;
  username: string;
  setupComplete: boolean;
  trackedHandle?: string | null;
}

interface AuthContextType {
  user: UserResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isDemoMode: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
