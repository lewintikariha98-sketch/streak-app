'use client';

import { AppProvider } from '@/contexts/AppContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import Confetti from '@/components/ui/Confetti';
import LevelUpModal from '@/components/ui/LevelUpModal';
import ToastStack from '@/components/ui/ToastStack';
import NotificationDetector from '@/components/ui/NotificationDetector';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useNotifications } from '@/contexts/NotificationContext';

function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

function NotificationLayer() {
  const { confetti } = useNotifications();
  return (
    <>
      {confetti && <Confetti />}
      <LevelUpModal />
      <ToastStack />
      <NotificationDetector />
    </>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <NotificationProvider>
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
        <NotificationLayer />
      </NotificationProvider>
    </AppProvider>
  );
}
