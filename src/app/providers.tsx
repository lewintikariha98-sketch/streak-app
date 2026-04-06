'use client';

import { AppProvider } from '@/contexts/AppContext';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
      className="min-h-full"
    >
      {children}
    </motion.div>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <Sidebar />
      <MobileNav />
      <main
        className="lg:ml-[220px] min-h-screen"
        style={{ paddingBottom: 'calc(var(--nav-height) + var(--safe-bottom) + 8px)' }}
      >
        <div className="lg:pb-8">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
    </AppProvider>
  );
}
