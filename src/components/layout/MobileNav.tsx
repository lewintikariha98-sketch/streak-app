'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CheckSquare, BarChart3, Trophy, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV = [
  { href: '/', icon: LayoutDashboard, label: 'Home' },
  { href: '/habits', icon: CheckSquare, label: 'Habits' },
  { href: '/analytics', icon: BarChart3, label: 'Stats' },
  { href: '/achievements', icon: Trophy, label: 'Awards' },
  { href: '/journal', icon: BookOpen, label: 'Journal' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex lg:hidden z-30"
      style={{
        background: 'rgba(11,20,38,0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        paddingBottom: 'var(--safe-bottom)',
      }}
    >
      {NAV.map(({ href, icon: Icon, label }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 pt-2 pb-1 relative tap-scale"
            style={{ minHeight: 'var(--nav-height)' }}
          >
            {active && (
              <motion.div
                layoutId="activeNavPill"
                className="absolute top-1 left-1/2 -translate-x-1/2 rounded-full"
                style={{ width: 32, height: 3, background: '#818cf8' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <motion.div
              animate={{ scale: active ? 1.1 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.8}
                style={{ color: active ? '#818cf8' : 'rgba(255,255,255,0.38)' }}
              />
            </motion.div>
            <span
              className="text-[10px] font-semibold tracking-wide"
              style={{ color: active ? '#818cf8' : 'rgba(255,255,255,0.38)' }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
