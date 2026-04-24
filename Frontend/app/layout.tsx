import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import AppShell from './components/app-shell';
import ToasterProvider from './components/toaster-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'OTrix',
  description: 'Learning, security awareness and game simulation platform.'
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang='en'>
      <body>
        <ToasterProvider />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
