'use client';

import { AppProvider } from '@/contexts/AppContext';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <Sidebar />
      <MobileNav />
      <main className="lg:ml-[220px] min-h-screen pb-20 lg:pb-0">
        {children}
      </main>
    </AppProvider>
  );
}
