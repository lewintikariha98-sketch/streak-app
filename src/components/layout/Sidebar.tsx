'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, CheckSquare, BarChart3, Trophy,
  Flower2, BookOpen,
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
  { href: '/journal', icon: BookOpen, label: 'Journal' },
];

// Brand logo mark — stylized lightning bolt in gradient pill
function LogoMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="10" fill="url(#lg1)" />
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7C3AED" />
          <stop offset="0.5" stopColor="#4F46E5" />
          <stop offset="1" stopColor="#2563EB" />
        </linearGradient>
      </defs>
      {/* Stylized S-bolt */}
      <path
        d="M19 8H13L11 16H15.5L13 24L22 14H17L19 8Z"
        fill="white"
        opacity="0.95"
      />
    </svg>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { data } = useApp();

  const activeHabits = data.habits.filter(h => !h.archived);
  const xp = getTotalXP(activeHabits);
  const { level, current, required, title } = getLevel(xp);
  const pct = required > 0 ? Math.round((current / required) * 100) : 0;

  const today = format(new Date(), 'yyyy-MM-dd');
  const doneToday = activeHabits.filter(h => h.completions[today]).length;
  const total = activeHabits.length;
  const allDone = total > 0 && doneToday === total;

  return (
    <aside
      className="fixed left-0 top-0 h-full w-[220px] hidden lg:flex flex-col z-30"
      style={{
        background: 'linear-gradient(180deg, #0F0D2A 0%, #1A1040 60%, #0D1A3A 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div
        className="px-5 h-[64px] flex items-center"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <LogoMark />
          <div>
            <span className="font-black text-white text-[16px] tracking-tight leading-none">Streak</span>
            <p className="text-[9px] mt-0.5 font-semibold tracking-widest uppercase" style={{ color: 'rgba(167,139,250,0.6)' }}>
              Build · Earn · Level Up
            </p>
          </div>
        </div>
      </div>

      {/* Today's progress */}
      {total > 0 && (
        <div
          className="mx-3 mt-3 rounded-xl px-3 py-2.5"
          style={{
            background: allDone
              ? 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(239,68,68,0.1))'
              : 'rgba(255,255,255,0.04)',
            border: allDone ? '1px solid rgba(249,115,22,0.25)' : '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {allDone ? '🔥 Today — Crushed it!' : 'Today'}
            </p>
            <p className="text-[11px] font-bold" style={{ color: allDone ? '#FB923C' : 'white' }}>
              {doneToday}/{total}
            </p>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${total > 0 ? Math.round((doneToday / total) * 100) : 0}%`,
                background: allDone
                  ? 'linear-gradient(90deg, #F97316, #EF4444)'
                  : 'linear-gradient(90deg, #7C3AED, #A78BFA)',
              }}
            />
          </div>
        </div>
      )}

      {/* Menu label */}
      <div className="px-5 pt-4 pb-1.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: 'rgba(255,255,255,0.18)' }}>
          Navigate
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
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150 relative overflow-hidden group"
              style={{
                background: active
                  ? 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(79,70,229,0.15))'
                  : 'transparent',
                color: active ? '#C4B5FD' : 'rgba(255,255,255,0.42)',
              }}
            >
              {active && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                  style={{ background: 'linear-gradient(180deg, #7C3AED, #A78BFA)' }}
                />
              )}
              <Icon
                size={16}
                strokeWidth={active ? 2.5 : 2}
                style={{ color: active ? '#A78BFA' : 'rgba(255,255,255,0.32)' }}
              />
              {label}
              {href === '/habits' && activeHabits.length > 0 && (
                <span
                  className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: active ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.07)',
                    color: active ? '#C4B5FD' : 'rgba(255,255,255,0.35)',
                  }}
                >
                  {activeHabits.length}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* XP + Level widget */}
      <div className="px-3 pb-5 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div
          className="rounded-xl p-3.5"
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(79,70,229,0.12))',
            border: '1px solid rgba(124,58,237,0.25)',
          }}
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}
              >
                {level}
              </div>
              <div>
                <p className="text-[11px] font-bold text-white leading-none">{title}</p>
                <p className="text-[9px] mt-0.5 font-semibold" style={{ color: 'rgba(167,139,250,0.6)' }}>
                  Level {level}
                </p>
              </div>
            </div>
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(124,58,237,0.2)', color: '#A78BFA' }}
            >
              {xp.toLocaleString()} XP
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: 'linear-gradient(90deg, #7C3AED, #A78BFA, #EC4899)',
              }}
            />
          </div>
          <p className="text-[9px] mt-1.5 font-medium" style={{ color: 'rgba(255,255,255,0.28)' }}>
            {current.toLocaleString()} / {required.toLocaleString()} XP → Level {level + 1}
          </p>
        </div>

        <div className="mt-3 px-1 flex items-center justify-between">
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.28)' }}>
            {format(new Date(), 'EEE, MMM d')}
          </p>
          <p className="text-[10px] font-bold" style={{ color: 'rgba(167,139,250,0.5)' }}>streak.app</p>
        </div>
      </div>
    </aside>
  );
}
