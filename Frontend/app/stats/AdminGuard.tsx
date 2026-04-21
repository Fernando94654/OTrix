'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getRole, saveRole } from '@/lib/auth';

type State = 'checking' | 'allowed' | 'denied';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>('checking');
  const searchParams = useSearchParams();
  const previewBypass = searchParams.get('demo') === '1';

  useEffect(() => {
    if (previewBypass) {
      setState('allowed');
      return;
    }
    setState(getRole() === 'ADMIN' ? 'allowed' : 'denied');
  }, [previewBypass]);

  if (state === 'checking') {
    return (
      <div className='stats-guard'>
        <div className='stats-guard-spinner' aria-hidden />
        <p>Checking permissions…</p>
      </div>
    );
  }

  if (state === 'denied') {
    return (
      <div className='stats-guard stats-guard--denied'>
        <h2>Admin access required</h2>
        <p>
          This dashboard is restricted to Rockwell administrators. Sign in with an admin account or open the demo preview below.
        </p>
        <div className='stats-guard-actions'>
          <Link href='/login' className='btn btn-custom px-4'>Sign in</Link>
          <Link href='/stats?demo=1' className='btn btn-outline-light px-4'>Preview demo</Link>
          <button
            type='button'
            className='btn btn-link stats-guard-dev'
            onClick={() => {
              saveRole('ADMIN');
              window.location.reload();
            }}
          >
            Grant admin (dev only)
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
