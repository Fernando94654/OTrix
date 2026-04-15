import Link from 'next/link';

export default function StatsPage() {
  return (
    <div className='container app-page d-flex justify-content-center align-items-center'>
      <div className='panel-card stats-card p-4 bg-white shadow-lg rounded text-center'>
        <h2 className='stats-title mb-3'>Stats</h2>
        <p className='text-muted mb-4'>This view is ready to connect your gameplay metrics.</p>
        <Link href='/' className='btn btn-custom px-5'>
          Back to menu
        </Link>
      </div>
    </div>
  );
}
