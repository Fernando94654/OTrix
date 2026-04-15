'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { saveToken, signIn } from '@/lib/auth';
import { notifyError, notifyInfo, notifySuccess } from '@/lib/notifications';

function isEmailValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email || !password || !isEmailValid(email) || isSubmitting) {
      notifyInfo('Please complete the required fields before signing in.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await signIn({ email, password });
      saveToken(response.refresh_token);
      notifySuccess('Welcome back! You are now signed in.');
      router.push('/videogame');
    } catch {
      const message = 'Login error. Verify your email and password.';
      setErrorMessage(message);
      notifyError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className='container app-page d-flex justify-content-center align-items-center'>
      <div className='panel-card login-card p-5 bg-white shadow-lg rounded'>
        <div className='text-center mb-4'>
          <h2 className='login-title'>Welcome Back</h2>
          <p className='text-muted'>Please sign in to continue</p>
        </div>

        <form onSubmit={onSubmit}>
          <div className='form-floating mb-3'>
            <input
              id='idEmail'
              type='email'
              className='form-control input-control'
              placeholder='name@example.com'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <label htmlFor='idEmail'>Email Address</label>
          </div>

          <div className='form-floating mb-4 password-field'>
            <input
              id='idPassword'
              type={isPasswordVisible ? 'text' : 'password'}
              className='form-control input-control password-input'
              placeholder='Password'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <label htmlFor='idPassword'>Password</label>
            <button
              className='password-toggle'
              type='button'
              aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
              onClick={() => setIsPasswordVisible((prev) => !prev)}
            >
              {isPasswordVisible ? (
                <svg viewBox='0 0 16 16' aria-hidden='true' focusable='false'>
                  <path d='M13.359 11.238C14.408 10.36 15.12 9.235 15.515 8c-1.204-3.293-4.102-5.5-7.515-5.5a7.51 7.51 0 0 0-3.442.832l1.163 1.163A5.96 5.96 0 0 1 8 4c2.484 0 4.63 1.525 5.62 4-0.273.682-0.64 1.295-1.09 1.825z' />
                  <path d='M11.297 9.176a3.5 3.5 0 0 0-4.473-4.473l1.08 1.08a2 2 0 0 1 2.313 2.313z' />
                  <path d='M3.35 5.228C2.307 6.104 1.598 7.225 1.204 8.456c1.205 3.293 4.102 5.5 7.515 5.5a7.52 7.52 0 0 0 3.43-.826l-1.163-1.163a5.97 5.97 0 0 1-2.267.489c-2.485 0-4.63-1.525-5.62-4 .272-.68.637-1.291 1.084-1.819z' />
                  <path d='M10.379 7.056a2 2 0 0 0-2.435-2.435z' />
                  <path d='m13.646 14.354-12-12 .708-.708 12 12z' />
                </svg>
              ) : (
                <svg viewBox='0 0 16 16' aria-hidden='true' focusable='false'>
                  <path d='M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13.1 13.1 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13.1 13.1 0 0 1 14.828 8q-.087.164-.195.347c-.335.57-.804 1.234-1.465 1.896C11.879 11.532 10.119 12.7 8 12.7s-3.879-1.168-5.168-2.457A13.1 13.1 0 0 1 1.172 8z' />
                  <path d='M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0' />
                </svg>
              )}
            </button>
          </div>

          {errorMessage ? (
            <div className='alert alert-danger' role='alert'>
              {errorMessage}
            </div>
          ) : null}

          <div className='d-grid gap-2 mt-4'>
            <button className='btn btn-custom auth-submit-btn py-2' type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
            <Link href='/' className='btn btn-outline-secondary w-100 py-2'>
              Go back
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
