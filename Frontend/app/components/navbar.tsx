'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/stats', label: 'Stats' },
  { href: '/videogame', label: 'Game' },
  { href: '/login', label: 'Login' },
  { href: '/signin', label: 'Sign Up', cta: true }
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className='app-navbar'>
      <div className='app-shell-container app-navbar__inner'>
        <Link href='/' className='app-brand' aria-label='Go to home'>
          <img src='/img/Rockwell_Automation_Logo.png' alt='Rockwell Automation' className='app-brand__logo' />
        </Link>

        <nav className='app-nav' aria-label='Primary'>
          {navItems.map((item) => {
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
