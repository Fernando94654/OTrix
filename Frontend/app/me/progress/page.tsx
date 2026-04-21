import { getPlayerStats } from '@/lib/stats';
import PlayerDashboard from './PlayerDashboard';

interface PageProps {
  searchParams?: Promise<{ demo?: string }>;
}

export default async function PlayerProgressPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const forceDemo = params.demo === '1';
  const stats = await getPlayerStats({ forceDemo });

  return (
    <div className='container app-page stats-page'>
      <PlayerDashboard stats={stats} />
    </div>
  );
}
