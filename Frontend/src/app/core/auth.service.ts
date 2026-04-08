import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

interface AuthResponse {
  refresh_token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = 'https://otrix-dev.up.railway.app';

  constructor(private readonly http: HttpClient) {}

  signIn(payload: SignInPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/signIn`, payload);
  }

  signUp(payload: SignUpPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/signUp`, payload);
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }
}
