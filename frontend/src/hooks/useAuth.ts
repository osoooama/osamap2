'use client';

import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  username: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function useAuth(): AuthState & {
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
} {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('osk_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setState({ user: parsed, loading: false });
      } else {
        setState({ user: null, loading: false });
      }
    } catch {
      setState({ user: null, loading: false });
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const users = JSON.parse(localStorage.getItem('osk_users') || '[]');
    const found = users.find((u: any) => u.username === username && u.password === password);
    if (!found) {
      throw { response: { data: { error: 'اسم المستخدم أو كلمة المرور خاطئة' } } };
    }
    const user = { id: found.id, username: found.username };
    localStorage.setItem('osk_user', JSON.stringify(user));
    setState({ user, loading: false });
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    const users = JSON.parse(localStorage.getItem('osk_users') || '[]');
    if (users.find((u: any) => u.username === username)) {
      throw { response: { data: { error: 'اسم المستخدم محجوز' } } };
    }
    const newUser = { id: generateId(), username, password };
    users.push(newUser);
    localStorage.setItem('osk_users', JSON.stringify(users));
    const user = { id: newUser.id, username: newUser.username };
    localStorage.setItem('osk_user', JSON.stringify(user));
    setState({ user, loading: false });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('osk_user');
    setState({ user: null, loading: false });
  }, []);

  return { ...state, login, register, logout };
}
