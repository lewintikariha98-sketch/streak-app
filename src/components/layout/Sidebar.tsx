'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, CheckSquare, BarChart3, Trophy,
  Flower2, Zap,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { getTotalXP, getLevel } from '@/lib/stats';
import { format } from 'date-fns';

const NAV = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/habits', icon: CheckSquare, label: 'Habits' },
  { href: '/garden', icon: Flower2, label: 'Garden' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/achievements', icon: Trophy, label: 'Achievements' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data } = useApp();

  const activeHabits = data.habits.filter(h => !h.archived);
  const xp = getTotalXP(activeHabits);
  const { level, current, required, title } = getLevel(xp);
  const pct = required > 0 ? Math.round((current / required) * 100) : 0;

  return (
    <aside
      className="fixed left-0 top-0 h-full w-[220px] hidden lg:flex flex-col z-30"
      style={{ background: '#0B1426', borderRight: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Logo */}
      <div
        className="px-5 h-[60px] flex items-center"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-2.5">
          {/* S-mark logo */}
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
            <rect width="30" height="30" rx="8" fill="url(#logoGrad)" />
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3B82F6" />
                <stop offset="1" stopColor="#1D4ED8" />
              </linearGradient>
            </defs>
            {/* S lettermark */}
            <path
              d="M20 10.5C20 10.5 18 8 15 8C12 8 10 10 10 12.5C10 15 12.5 15.8 15 16.2C17.5 16.6 20 17.5 20 20C20 22.5 17.5 22 15 22C12 22 10 19.5 10 19.5"
              stroke="white"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <span className="font-bold text-white text-[15px] tracking-tight">Streak</span>
        </div>
      </div>

      {/* Section label */}
      <div className="px-5 pt-5 pb-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.22)' }}>
          Menu
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150"
              style={{
                background: active ? 'rgba(59,130,246,0.14)' : 'transparent',
                color: active ? '#93c5fd' : 'rgba(255,255,255,0.42)',
              }}
            >
              <Icon
                size={16}
                style={{ color: active ? '#60a5fa' : 'rgba(255,255,255,0.32)' }}
              />
              {label}
              {href === '/habits' && activeHabits.length > 0 && (
                <span
                  className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: active ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.07)',
                    color: active ? '#93c5fd' : 'rgba(255,255,255,0.35)',
                  }}
                >
                  {activeHabits.length}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Level + XP widget */}
      <div className="px-3 pb-5 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="rounded-xl p-3.5" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.15)' }}>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.2)' }}>
                <Zap size={12} className="text-blue-400" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-white leading-none">Lv. {level}</p>
                <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{title}</p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-blue-400">{xp} XP</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }}
            />
          </div>
          <p className="text-[9px] mt-1.5" style={{ color: 'rgba(255,255,255,0.28)' }}>
            {current} / {required} XP to Level {level + 1}
          </p>
        </div>
        <div className="mt-3 px-1">
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.28)' }}>
            {format(new Date(), 'EEE, MMM d')}
          </p>
        </div>
      </div>
    </aside>
  );
}
