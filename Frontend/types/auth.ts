export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  name: string;
  last_name: string;
  email: string;
  password: string;
  birthday: string;
  gender: 'FEMALE' | 'MALE' | 'OTHER';
  company?: string;
}

export interface AuthResponse {
  refresh_token: string;
  role?: 'USER' | 'ADMIN';
  user_id?: string;
  name?: string;
  last_name?: string;
}
