'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { saveRole, saveToken, signUp } from '@/lib/auth';
import { notifyError, notifyInfo, notifySuccess } from '@/lib/notifications';
import type { SignUpPayload } from '@/types/auth';

function isEmailValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [birthday, setBirthday] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name || !lastName || !gender || !birthday || !email || !password || !confirmPassword || isSubmitting) {
      notifyInfo('Please complete all required fields to create your account.');
      return;
    }

    if (!isEmailValid(email)) {
      notifyInfo('Please provide a valid email.');
      return;
    }

    if (password !== confirmPassword) {
      const message = 'Passwords do not match.';
      setErrorMessage(message);
      notifyError(message);
      return;
    }

    const payload: SignUpPayload = {
      name,
      last_name: lastName,
      email,
      password,
      birthday: new Date(birthday).toISOString(),
      gender: gender as SignUpPayload['gender']
    };

    const trimmedCompany = company.trim();
    if (trimmedCompany) {
      payload.company = trimmedCompany;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await signUp(payload);
      saveToken(response.refresh_token);
      if (response.role) saveRole(response.role);
      notifySuccess('Account created successfully. Welcome to Otrix!');
      router.push('/videogame');
    } catch {
      const message = 'Signup error. Please verify your data and try again.';
      setErrorMessage(message);
      notifyError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className='container app-page d-flex justify-content-center align-items-center py-4'>
      <div className='panel-card signup-card p-5 bg-white shadow-lg rounded'>
        <div className='text-center mb-4'>
          <h2 className='signup-title'>Create Account</h2>
          <p className='text-muted'>Join us by creating a new account</p>
        </div>

        <form onSubmit={onSubmit}>
          <div className='row g-3'>
            <div className='col-md-6 form-floating'>
              <input
                id='idName'
                type='text'
                className='form-control input-control'
                placeholder='John'
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <label htmlFor='idName' className='ms-2'>
                First Name
              </label>
            </div>

            <div className='col-md-6 form-floating'>
              <input
                id='idLastName'
                type='text'
                className='form-control input-control'
                placeholder='Doe'
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
              <label htmlFor='idLastName' className='ms-2'>
                Last Name
              </label>
            </div>

            <div className='col-md-6 form-floating'>
              <select
                id='idGender'
                className='form-select input-control'
                value={gender}
                onChange={(event) => setGender(event.target.value)}
              >
                <option value='' disabled>
                  Select gender
                </option>
                <option value='FEMALE'>Female</option>
                <option value='MALE'>Male</option>
                <option value='OTHER'>Other / Prefer not to say</option>
              </select>
              <label htmlFor='idGender' className='ms-2'>
                Gender
              </label>
            </div>

            <div className='col-md-6 form-floating'>
              <input
                id='idDateOfBirth'
                type='date'
                className='form-control input-control'
                value={birthday}
                onChange={(event) => setBirthday(event.target.value)}
              />
              <label htmlFor='idDateOfBirth' className='ms-2'>
                Date of Birth
              </label>
            </div>

            <div className='col-md-12 form-floating'>
              <input
                id='idEmail'
                type='email'
                className='form-control input-control'
                placeholder='johndoe@gmail.com'
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <label htmlFor='idEmail' className='ms-2'>
                Email
              </label>
            </div>

            <div className='col-md-12 form-floating'>
              <input
                id='idCompany'
                type='text'
                className='form-control input-control'
                placeholder='Company Name'
                value={company}
                onChange={(event) => setCompany(event.target.value)}
              />
              <label htmlFor='idCompany' className='ms-2'>
                Company (Optional)
              </label>
            </div>

            <div className='col-md-6 form-floating password-field'>
              <input
                id='idPassword'
                type={isPasswordVisible ? 'text' : 'password'}
                className='form-control input-control password-input'
                placeholder='Password'
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <label htmlFor='idPassword' className='ms-2'>
                Password
              </label>
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

            <div className='col-md-6 form-floating password-field'>
              <input
                id='idConfirmPassword'
                type={isConfirmPasswordVisible ? 'text' : 'password'}
                className='form-control input-control password-input'
                placeholder='Confirm Password'
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
              <label htmlFor='idConfirmPassword' className='ms-2'>
                Confirm Password
              </label>
              <button
                className='password-toggle'
                type='button'
                aria-label={isConfirmPasswordVisible ? 'Hide confirm password' : 'Show confirm password'}
                onClick={() => setIsConfirmPasswordVisible((prev) => !prev)}
              >
                {isConfirmPasswordVisible ? (
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
          </div>

          {errorMessage ? (
            <div className='alert alert-danger mt-4' role='alert'>
              {errorMessage}
            </div>
          ) : null}

          <div className='d-grid gap-2 mt-5'>
            <button className='btn btn-custom auth-submit-btn py-2' type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
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
