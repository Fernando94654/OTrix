import type { ReactNode } from 'react';
import Footer from './footer';
import Navbar from './navbar';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className='app-shell'>
      <Navbar />
      <main className='app-shell__content' aria-label='Main content'>
        {children}
      </main>
      <Footer />
    </div>
  );
}
