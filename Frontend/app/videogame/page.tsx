import Link from 'next/link';

export default function VideogamePage() {
  return (
    <div className='container app-page d-flex justify-content-center align-items-center'>
      <div className='panel-card videogame-card p-4 bg-white shadow-lg rounded text-center'>
        <h2 className='videogame-title mb-3'>Videogame</h2>
        <p className='text-muted mb-4'>
          Login and signup are now migrated to Angular. You can integrate the Unity game or a web launcher here.
        </p>
        <div className='d-grid gap-2 d-md-flex justify-content-md-center'>
          <Link href='/stats' className='btn btn-outline-secondary px-4'>
            View stats
          </Link>
          <Link href='/' className='btn btn-custom px-5'>
            Back to menu
          </Link>
        </div>
      </div>
    </div>
  );
}
