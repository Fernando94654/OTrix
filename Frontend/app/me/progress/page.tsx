'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PlayerDashboard from './PlayerDashboard';
import { getPlayerStats } from '@/lib/stats';
import { getToken } from '@/lib/auth';
import type { PlayerStatsPayload } from '@/types/stats';

export default function PlayerProgressPage() {
  const searchParams = useSearchParams();
  const forceDemo = searchParams.get('demo') === '1';
  const [stats, setStats] = useState<PlayerStatsPayload | null>(null);

  useEffect(() => {
    getPlayerStats({ forceDemo, token: getToken() }).then(setStats);
  }, [forceDemo]);

  if (!stats) {
    return (
      <div className='container app-page stats-page'>
        <div className='stats-guard'>
          <div className='stats-guard-spinner' aria-hidden />
          <p>Loading your progress…</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container app-page stats-page'>
      <PlayerDashboard stats={stats} />
    </div>
  );
}
