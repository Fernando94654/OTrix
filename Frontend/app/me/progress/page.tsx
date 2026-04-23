'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PlayerDashboard from './PlayerDashboard';
import StatsLoader from '@/app/components/stats-loader';
import StatsError from '@/app/components/stats-error';
import { clearSession, getToken } from '@/lib/auth';
import { getPlayerStats, StatsFetchError } from '@/lib/stats';
import { notifyError } from '@/lib/notifications';
import type { PlayerStatsPayload } from '@/types/stats';

type Status =
  | { state: 'loading' }
  | { state: 'ok'; stats: PlayerStatsPayload }
  | { state: 'error'; kind: 'server' | 'network' };

export default function PlayerProgressPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const forceDemo = searchParams.get('demo') === '1';
  const [status, setStatus] = useState<Status>({ state: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setStatus({ state: 'loading' });
    getPlayerStats({ forceDemo, token: getToken() })
      .then((stats) => setStatus({ state: 'ok', stats }))
      .catch((err: unknown) => {
        if (err instanceof StatsFetchError && err.kind === 'auth') {
          clearSession();
          notifyError('Session expired. Please sign in again.');
          router.push('/login');
          return;
        }
        const kind = err instanceof StatsFetchError ? err.kind : 'server';
        setStatus({ state: 'error', kind: kind as 'server' | 'network' });
      });
  }, [forceDemo, attempt, router]);

  return (
    <div className='container app-page stats-page'>
      {status.state === 'loading' && (
        <StatsLoader label='Loading your progress' sublabel='Pulling your session history and performance trends' />
      )}
      {status.state === 'error' && (
        <StatsError kind={status.kind} onRetry={() => setAttempt((n) => n + 1)} />
      )}
      {status.state === 'ok' && <PlayerDashboard stats={status.stats} />}
    </div>
  );
}
