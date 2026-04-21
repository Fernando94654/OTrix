import { getAdminStats } from '@/lib/stats';
import AdminDashboard from './AdminDashboard';
import AdminGuard from './AdminGuard';

interface PageProps {
  searchParams?: Promise<{ demo?: string }>;
}

export default async function AdminStatsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const forceDemo = params.demo === '1';
  const stats = await getAdminStats({ forceDemo });

  return (
    <div className='container app-page stats-page'>
      <AdminGuard>
        <AdminDashboard stats={stats} />
      </AdminGuard>
    </div>
  );
}
