'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminDashboard from './AdminDashboard';
import AdminGuard from './AdminGuard';
import StatsLoader from '@/app/components/stats-loader';
import StatsError from '@/app/components/stats-error';
import { clearSession, getToken } from '@/lib/auth';
import { getAdminStats, StatsFetchError } from '@/lib/stats';
import { notifyError } from '@/lib/notifications';
import type { AdminStatsPayload } from '@/types/stats';

type Status =
  | { state: 'loading' }
  | { state: 'ok'; stats: AdminStatsPayload }
  | { state: 'error'; kind: 'server' | 'network' };

function AdminStatsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const forceDemo = searchParams.get('demo') === '1';
  const [status, setStatus] = useState<Status>({ state: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setStatus({ state: 'loading' });
    getAdminStats({ forceDemo, token: getToken() })
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
    <AdminGuard>
      {status.state === 'loading' && (
        <StatsLoader label='Loading analytics' sublabel='Aggregating platform metrics across companies' />
      )}
      {status.state === 'error' && (
        <StatsError kind={status.kind} onRetry={() => setAttempt((n) => n + 1)} />
      )}
      {status.state === 'ok' && <AdminDashboard stats={status.stats} />}
    </AdminGuard>
  );
}

export default function AdminStatsPage() {
  return (
    <div className='container app-page stats-page'>
      <Suspense fallback={<StatsLoader label='Loading analytics' />}>
        <AdminStatsContent />
      </Suspense>
    </div>
  );
}
