import type { AuthResponse, SignInPayload, SignUpPayload } from '@/types/auth';

// const defaultApiUrl = 'https://otrix-dev.up.railway.app';
const defaultApiUrl = 'http://localhost:3000';

function getBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  const baseUrl = configured && configured.length > 0 ? configured : defaultApiUrl;
  return baseUrl.replace(/\/+$/, '');
}

async function postJson<TResponse>(path: string, payload: unknown): Promise<TResponse> {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as TResponse;
}

export function signIn(payload: SignInPayload) {
  return postJson<AuthResponse>('/auth/signIn', payload);
}

export function signUp(payload: SignUpPayload) {
  return postJson<AuthResponse>('/auth/signUp', payload);
}

export function saveToken(token: string) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('token', token);
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('token');
}

export type UserRole = 'USER' | 'ADMIN';

export function saveRole(role: UserRole) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('role', role);
  }
}

export function getRole(): UserRole | null {
  if (typeof window === 'undefined') return null;
  const role = window.localStorage.getItem('role');
  return role === 'ADMIN' || role === 'USER' ? role : null;
}

export function saveName(name: string, lastName?: string) {
  if (typeof window === 'undefined') return;
  if (name) window.localStorage.setItem('name', name);
  if (lastName) window.localStorage.setItem('last_name', lastName);
}

function formatName(name: string, lastName?: string | null) {
  const initial = lastName && lastName.length > 0 ? ` ${lastName.charAt(0).toUpperCase()}.` : '';
  return `${name}${initial}`;
}

export function getDisplayName(): string | null {
  if (typeof window === 'undefined') return null;

  const storedName = window.localStorage.getItem('name');
  if (storedName) {
    return formatName(storedName, window.localStorage.getItem('last_name'));
  }

  const token = window.localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const data = JSON.parse(atob(normalized)) as { name?: unknown; last_name?: unknown; email?: unknown };

    if (typeof data.name === 'string' && data.name.length > 0) {
      const last = typeof data.last_name === 'string' ? data.last_name : null;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('name', data.name);
        if (last) window.localStorage.setItem('last_name', last);
      }
      return formatName(data.name, last);
    }

    if (typeof data.email === 'string') {
      return data.email.split('@')[0];
    }
  } catch {
    return null;
  }

  return null;
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('role');
    window.localStorage.removeItem('name');
    window.localStorage.removeItem('last_name');
  }
}
