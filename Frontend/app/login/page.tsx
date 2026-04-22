'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { saveName, saveRole, saveToken, signIn } from '@/lib/auth';
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
      if (response.role) saveRole(response.role);
      if (response.name) saveName(response.name, response.last_name);
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
    <div className='auth'>
      <div className='auth__inner'>
        <section className='auth__panel'>
          <header className='auth__header'>
            <span className='home-chip'>
              <span className='home-chip__dot' />
              Secure access
            </span>
            <h1 className='auth__title'>Welcome back.</h1>
            <p className='auth__sub'>Sign in to resume your training and pick up where you left off.</p>
          </header>

          <form className='auth__form' onSubmit={onSubmit} noValidate>
            <div className='auth-field'>
              <label htmlFor='idEmail' className='auth-field__label'>Email</label>
              <input
                id='idEmail'
                type='email'
                className='auth-field__input'
                placeholder='name@rockwell.com'
                autoComplete='email'
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className='auth-field auth-field--password'>
              <label htmlFor='idPassword' className='auth-field__label'>Password</label>
              <input
                id='idPassword'
                type={isPasswordVisible ? 'text' : 'password'}
                className='auth-field__input'
                placeholder='Enter your password'
                autoComplete='current-password'
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                className='auth-field__toggle'
                type='button'
                aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                onClick={() => setIsPasswordVisible((prev) => !prev)}
              >
                <EyeIcon visible={isPasswordVisible} />
              </button>
            </div>

            {errorMessage ? <div className='auth__error' role='alert'>{errorMessage}</div> : null}

            <button
              className='home-btn home-btn--primary home-btn--large auth__submit'
              type='submit'
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? 'Signing in…' : 'Sign in'}</span>
              {!isSubmitting && (
                <svg viewBox='0 0 24 24' aria-hidden='true'>
                  <path d='M5 12h14M13 6l6 6-6 6' stroke='currentColor' strokeWidth='2' fill='none' strokeLinecap='round' strokeLinejoin='round'/>
                </svg>
              )}
            </button>
          </form>

          <div className='auth__footer'>
            New to OTrix? <Link href='/signin'>Create an account</Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function EyeIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <svg viewBox='0 0 16 16' aria-hidden='true' focusable='false'>
        <path d='M13.359 11.238C14.408 10.36 15.12 9.235 15.515 8c-1.204-3.293-4.102-5.5-7.515-5.5a7.51 7.51 0 0 0-3.442.832l1.163 1.163A5.96 5.96 0 0 1 8 4c2.484 0 4.63 1.525 5.62 4-0.273.682-0.64 1.295-1.09 1.825z'/>
        <path d='M11.297 9.176a3.5 3.5 0 0 0-4.473-4.473l1.08 1.08a2 2 0 0 1 2.313 2.313z'/>
        <path d='M3.35 5.228C2.307 6.104 1.598 7.225 1.204 8.456c1.205 3.293 4.102 5.5 7.515 5.5a7.52 7.52 0 0 0 3.43-.826l-1.163-1.163a5.97 5.97 0 0 1-2.267.489c-2.485 0-4.63-1.525-5.62-4 .272-.68.637-1.291 1.084-1.819z'/>
        <path d='m13.646 14.354-12-12 .708-.708 12 12z'/>
      </svg>
    );
  }
  return (
    <svg viewBox='0 0 16 16' aria-hidden='true' focusable='false'>
      <path d='M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13.1 13.1 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13.1 13.1 0 0 1 14.828 8q-.087.164-.195.347c-.335.57-.804 1.234-1.465 1.896C11.879 11.532 10.119 12.7 8 12.7s-3.879-1.168-5.168-2.457A13.1 13.1 0 0 1 1.172 8z'/>
      <path d='M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0'/>
    </svg>
  );
}
