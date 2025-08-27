'use client';

import { useSession } from 'next-auth/react';
import { Navbar } from './navbar';

export function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  
  return (
    <div className="relative flex min-h-screen flex-col">
      {session && <Navbar />}
      <main className="flex-1" role="main" aria-label="Main content">
        {children}
      </main>
    </div>
  );
}