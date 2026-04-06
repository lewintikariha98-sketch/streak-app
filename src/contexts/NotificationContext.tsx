'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface AppToast {
  id: string;
  type: 'achievement' | 'streak' | 'level' | 'info' | 'perfect';
  icon: string;
  title: string;
  subtitle: string;
  xp?: number;
  color?: string;
}

interface NotifCtx {
  confetti: boolean;
  levelUpData: { level: number; title: string } | null;
  toasts: AppToast[];
  triggerConfetti: () => void;
  showLevelUp: (level: number, title: string) => void;
  dismissLevelUp: () => void;
  pushToast: (t: Omit<AppToast, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const Ctx = createContext<NotifCtx | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [confetti, setConfetti] = useState(false);
  const [levelUpData, setLevelUpData] = useState<NotifCtx['levelUpData']>(null);
  const [toasts, setToasts] = useState<AppToast[]>([]);

  const triggerConfetti = useCallback(() => {
    setConfetti(true);
    setTimeout(() => setConfetti(false), 4000);
  }, []);

  const showLevelUp = useCallback((level: number, title: string) => {
    setLevelUpData({ level, title });
  }, []);

  const dismissLevelUp = useCallback(() => setLevelUpData(null), []);

  const pushToast = useCallback((t: Omit<AppToast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [{ ...t, id }, ...prev].slice(0, 3)); // max 3 stacked
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(x => x.id !== id));
  }, []);

  return (
    <Ctx.Provider value={{ confetti, levelUpData, toasts, triggerConfetti, showLevelUp, dismissLevelUp, pushToast, dismissToast }}>
      {children}
    </Ctx.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useNotifications outside NotificationProvider');
  return ctx;
}
