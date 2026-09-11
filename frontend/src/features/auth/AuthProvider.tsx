import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { AuthContext, type UserResponse } from './AuthContext';
import { api } from '@/shared/api/client';
import { useQueryClient } from '@tanstack/react-query';

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await api.get<UserResponse>('/auth/me');
        setUser(data);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const refreshUser = useCallback(async () => {
    setUser(await api.get<UserResponse>('/auth/me'));
    await queryClient.invalidateQueries();
  }, [queryClient]);

  useEffect(() => {
    const expired = () => { setUser(null); queryClient.clear(); };
    window.addEventListener('auth-expired', expired);
    return () => window.removeEventListener('auth-expired', expired);
  }, [queryClient]);

  const login = useCallback(async (username: string, password: string) => {
    const data = await api.post<UserResponse>('/auth/login', { username, password });
    queryClient.clear();
    setUser(data);
  }, [queryClient]);

  const register = useCallback(async (username: string, password: string) => {
    await api.post('/auth/register', { username, password });
  }, []);

  const logout = useCallback(async () => {
    await api.post('/auth/logout');
    queryClient.clear();
    setUser(null);
  }, [queryClient]);

  const isAuthenticated = !!user;

  const isDemoMode = user?.id === 'a0000000-0000-0000-0000-000000000001';

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, register, logout, refreshUser, isDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
}
