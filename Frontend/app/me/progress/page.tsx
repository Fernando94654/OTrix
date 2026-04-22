'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PlayerDashboard from './PlayerDashboard';
import StatsLoader from '@/app/components/stats-loader';
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
        <StatsLoader
          label='Loading your progress'
          sublabel='Pulling your session history and performance trends'
        />
      </div>
    );
  }

  return (
    <div className='container app-page stats-page'>
      <PlayerDashboard stats={stats} />
    </div>
  );
}
