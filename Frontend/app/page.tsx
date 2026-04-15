import Link from 'next/link';

export default function HomePage() {
  return (
    <div className='container app-page d-flex justify-content-center align-items-center'>
      <div className='panel-card home-card mx-auto'>
        <div className='row'>
          <div className='col-12 text-center mt-4 mb-2'>
            <img src='/img/Rockwell_Automation_Logo.png' alt='Company logo' className='home-brand-logo' />
          </div>
        </div>

        <div className='row justify-content-center home-menu-buttons'>
          <div className='col-12 text-center mt-4 mb-2'>
            <Link className='btn btn-custom' href='/login'>
              Login
            </Link>
          </div>

          <div className='col-12 text-center mt-2 mb-2'>
            <Link className='btn btn-custom' href='/signin'>
              Signin
            </Link>
          </div>

          <div className='col-12 text-center mt-2 mb-2'>
            <Link className='btn btn-custom' href='/stats'>
              Stats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
