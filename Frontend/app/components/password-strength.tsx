'use client';

import { useMemo } from 'react';

interface PasswordRule {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { id: 'lower', label: 'Lowercase letter', test: (p) => /[a-z]/.test(p) },
  { id: 'upper', label: 'Uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { id: 'number', label: 'Number', test: (p) => /\d/.test(p) },
  { id: 'special', label: 'Special character', test: (p) => /[^A-Za-z0-9]/.test(p) }
];

const STRENGTH_LABELS = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];

export function getPasswordScore(password: string) {
  return PASSWORD_RULES.filter((r) => r.test(password)).length;
}

export function isPasswordStrong(password: string) {
  return PASSWORD_RULES.every((r) => r.test(password));
}

interface Props {
  password: string;
}

export default function PasswordStrength({ password }: Props) {
  const results = useMemo(
    () => PASSWORD_RULES.map((r) => ({ ...r, passed: r.test(password) })),
    [password]
  );

  if (!password) return null;

  const score = results.filter((r) => r.passed).length;
  const level = Math.max(1, score);
  const label = STRENGTH_LABELS[Math.max(0, score - 1)];

  return (
    <div className='password-strength' aria-live='polite'>
      <div className='password-strength__row'>
        <div className='password-strength__bar'>
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              className={`password-strength__segment ${n <= score ? 'is-on' : ''}`}
              data-level={level}
            />
          ))}
        </div>
        <span className='password-strength__label' data-level={level}>
          {label}
        </span>
      </div>

      <ul className='password-strength__rules'>
        {results.map((r) => (
          <li key={r.id} className={r.passed ? 'is-passed' : ''}>
            <svg viewBox='0 0 16 16' aria-hidden='true'>
              {r.passed ? (
                <path
                  d='M3 8l3 3 7-7'
                  stroke='currentColor'
                  strokeWidth='2'
                  fill='none'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              ) : (
                <circle cx='8' cy='8' r='2' fill='currentColor' />
              )}
            </svg>
            {r.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
