'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminDashboard from './AdminDashboard';
import AdminGuard from './AdminGuard';
import StatsLoader from '@/app/components/stats-loader';
import { getAdminStats } from '@/lib/stats';
import { getToken } from '@/lib/auth';
import type { AdminStatsPayload } from '@/types/stats';

export default function AdminStatsPage() {
  const searchParams = useSearchParams();
  const forceDemo = searchParams.get('demo') === '1';
  const [stats, setStats] = useState<AdminStatsPayload | null>(null);

  useEffect(() => {
    getAdminStats({ forceDemo, token: getToken() }).then(setStats);
  }, [forceDemo]);

  return (
    <div className='container app-page stats-page'>
      <AdminGuard>
        {stats ? (
          <AdminDashboard stats={stats} />
        ) : (
          <StatsLoader
            label='Loading analytics'
            sublabel='Aggregating platform metrics across companies'
          />
        )}
      </AdminGuard>
    </div>
  );
}
