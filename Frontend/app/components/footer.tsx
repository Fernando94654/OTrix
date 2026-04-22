'use client';

import { usePathname } from 'next/navigation';

const HIDDEN_ROUTES = ['/videogame'];

export default function Footer() {
  const pathname = usePathname();
  if (HIDDEN_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return null;
  }

  return (
    <footer className='app-footer'>
      <div className='app-shell-container app-footer__inner'>
        <div>
          <h2 className='app-footer__title'>Otrix</h2>
          <p className='app-footer__text'>Learning, security awareness and game simulation platform.</p>
        </div>
        <p className='app-footer__copyright'>{new Date().getFullYear()} Rockwell Automation Team</p>
      </div>
    </footer>
  );
}
