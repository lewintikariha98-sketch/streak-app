'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CheckSquare, Flower2, BarChart3, Trophy, BookOpen } from 'lucide-react';

const NAV = [
  { href: '/', icon: LayoutDashboard, label: 'Home' },
  { href: '/habits', icon: CheckSquare, label: 'Habits' },
  { href: '/garden', icon: Flower2, label: 'Garden' },
  { href: '/analytics', icon: BarChart3, label: 'Stats' },
  { href: '/achievements', icon: Trophy, label: 'Awards' },
  { href: '/journal', icon: BookOpen, label: 'Journal' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex lg:hidden z-30 border-t" style={{ background: '#0D0D1A', borderColor: 'rgba(255,255,255,0.08)' }}>
      {NAV.map(({ href, icon: Icon, label }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[9px] font-medium transition-colors"
            style={{ color: active ? '#a78bfa' : 'rgba(255,255,255,0.35)' }}
          >
            <Icon size={18} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
