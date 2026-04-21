'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getRole } from '@/lib/auth';

interface NavItem {
  href: string;
  label: string;
  cta?: boolean;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/me/progress', label: 'My progress' },
  { href: '/stats', label: 'Admin', adminOnly: true },
  { href: '/videogame', label: 'Game' },
  { href: '/login', label: 'Login' },
  { href: '/signin', label: 'Sign Up', cta: true }
];

export default function Navbar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(getRole() === 'ADMIN');
  }, [pathname]);

  return (
    <header className='app-navbar'>
      <div className='app-shell-container app-navbar__inner'>
        <Link href='/' className='app-brand' aria-label='Go to home'>
          <img src='/img/Rockwell_Automation_Logo.png' alt='Rockwell Automation' className='app-brand__logo' />
        </Link>

        <nav className='app-nav' aria-label='Primary'>
          {navItems
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => {
              const isActive = item.href === '/' ? pathname === '/' : pathname === item.href;
              const classes = `${item.cta ? 'app-nav__cta ' : ''}${isActive ? 'is-active' : ''}`.trim();

              return (
                <Link key={item.href} href={item.href} className={classes}>
                  {item.label}
                </Link>
              );
            })}
        </nav>
      </div>
    </header>
  );
}
