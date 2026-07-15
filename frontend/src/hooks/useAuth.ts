'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

interface User {
  id: string;
  username: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

export function useAuth(): AuthState & {
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
} {
  const [state, setState] = useState<AuthState>({ user: null, token: null, loading: true });

  useEffect(() => {
    const token = localStorage.getItem('osk_token');
    const savedUser = localStorage.getItem('osk_user');
    if (token && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setState({ user: parsed, token, loading: false });
        api.get('/api/auth/me').catch(() => {
          localStorage.removeItem('osk_token');
          localStorage.removeItem('osk_user');
          setState({ user: null, token: null, loading: false });
        });
      } catch {
        localStorage.removeItem('osk_token');
        localStorage.removeItem('osk_user');
        setState({ user: null, token: null, loading: false });
      }
    } else {
      setState({ user: null, token: null, loading: false });
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const { data } = await api.post('/api/auth/login', { username, password });
    localStorage.setItem('osk_token', data.token);
    localStorage.setItem('osk_user', JSON.stringify(data.user));
    setState({ user: data.user, token: data.token, loading: false });
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    const { data } = await api.post('/api/auth/register', { username, password });
    localStorage.setItem('osk_token', data.token);
    localStorage.setItem('osk_user', JSON.stringify(data.user));
    setState({ user: data.user, token: data.token, loading: false });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('osk_token');
    localStorage.removeItem('osk_user');
    setState({ user: null, token: null, loading: false });
  }, []);

  return { ...state, login, register, logout };
}
