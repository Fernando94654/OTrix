'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearSession, getDisplayName, getRole, getToken } from '@/lib/auth';
import { notifySuccess } from '@/lib/notifications';

interface NavItem {
  href: string;
  label: string;
  adminOnly?: boolean;
}

const primaryItems: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/me/progress', label: 'My progress' },
  { href: '/stats', label: 'Admin', adminOnly: true },
  { href: '/videogame', label: 'Game' }
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(Boolean(token));
    setIsAdmin(getRole() === 'ADMIN');
    setDisplayName(getDisplayName() ?? '');
  }, [pathname]);

  function handleSignOut() {
    clearSession();
    setIsLoggedIn(false);
    setIsAdmin(false);
    setDisplayName('');
    notifySuccess('Signed out');
    router.push('/');
  }

  return (
    <header className='app-navbar'>
      <div className='app-shell-container app-navbar__inner'>
        <Link href='/' className='app-brand' aria-label='Go to home'>
          <Image
            src='/img/Rockwell_Automation_Logo.png'
            alt='Rockwell Automation'
            className='app-brand__logo'
            width={160}
            height={36}
            priority
          />
        </Link>

        <nav className='app-nav' aria-label='Primary'>
          {primaryItems
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => {
              const isActive = item.href === '/' ? pathname === '/' : pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={isActive ? 'is-active' : ''}>
                  {item.label}
                </Link>
              );
            })}

          {isLoggedIn ? (
            <div className='app-user'>
              <span className='app-user__pill'>
                <span className='app-user__dot' aria-hidden='true' />
                {displayName || 'Account'}
              </span>
              <button
                type='button'
                className='app-user__logout'
                onClick={handleSignOut}
                aria-label='Sign out'
              >
                <svg viewBox='0 0 24 24' aria-hidden='true'>
                  <path d='M15 12H3m0 0l4-4m-4 4l4 4' stroke='currentColor' strokeWidth='2' fill='none' strokeLinecap='round' strokeLinejoin='round'/>
                  <path d='M10 4h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7' stroke='currentColor' strokeWidth='2' fill='none' strokeLinecap='round' strokeLinejoin='round'/>
                </svg>
                <span>Sign out</span>
              </button>
            </div>
          ) : (
            <>
              <Link href='/login' className={pathname === '/login' ? 'is-active' : ''}>
                Login
              </Link>
              <Link
                href='/signin'
                className={`app-nav__cta ${pathname === '/signin' ? 'is-active' : ''}`.trim()}
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
