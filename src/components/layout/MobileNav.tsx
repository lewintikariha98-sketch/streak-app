'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CheckSquare, Flower2, BarChart3, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

// 5 core screens — thumb-reachable, iconic
const NAV = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/habits', icon: CheckSquare, label: 'Habits' },
  { href: '/garden', icon: Flower2, label: 'Garden' },
  { href: '/analytics', icon: BarChart3, label: 'Stats' },
  { href: '/journal', icon: BookOpen, label: 'Journal' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex lg:hidden z-30"
      style={{
        background: 'rgba(15,13,42,0.96)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        borderTop: '1px solid rgba(124,58,237,0.15)',
        paddingBottom: 'var(--safe-bottom)',
      }}
    >
      {NAV.map(({ href, icon: Icon, label }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-3 relative"
            style={{ minHeight: 'var(--nav-height)' }}
          >
            {active && (
              <motion.div
                layoutId="activePill"
                className="absolute top-0 rounded-b-full"
                style={{
                  width: 32,
                  height: 3,
                  background: 'linear-gradient(90deg, #7C3AED, #A78BFA, #EC4899)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            {active && (
              <motion.div
                layoutId="activeGlow"
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at center top, rgba(124,58,237,0.12) 0%, transparent 70%)',
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <motion.div
              animate={{ scale: active ? 1.15 : 1, y: active ? -1 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.8}
                style={{ color: active ? '#A78BFA' : 'rgba(255,255,255,0.32)' }}
              />
            </motion.div>
            <span
              className="text-[10px] font-bold tracking-wide"
              style={{ color: active ? '#C4B5FD' : 'rgba(255,255,255,0.3)' }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
