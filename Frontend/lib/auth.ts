import type { AuthResponse, SignInPayload, SignUpPayload } from '@/types/auth';

const defaultApiUrl = 'https://otrix-dev.up.railway.app';

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

export function clearSession() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('role');
  }
}
