'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CheckSquare, Flower2, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

// 4 core screens — clean, focused, easy to reach with one thumb
const NAV = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/habits', icon: CheckSquare, label: 'Habits' },
  { href: '/garden', icon: Flower2, label: 'Garden' },
  { href: '/analytics', icon: BarChart3, label: 'Stats' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex lg:hidden z-30"
      style={{
        background: 'rgba(11,20,38,0.97)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
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
                className="absolute top-2 rounded-full"
                style={{ width: 36, height: 3, background: 'linear-gradient(90deg,#818cf8,#a78bfa)', left: '50%', transform: 'translateX(-50%)' }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <motion.div
              animate={{ scale: active ? 1.15 : 1, y: active ? -1 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <Icon
                size={23}
                strokeWidth={active ? 2.5 : 1.8}
                style={{ color: active ? '#a78bfa' : 'rgba(255,255,255,0.35)' }}
              />
            </motion.div>
            <span
              className="text-[10px] font-semibold"
              style={{ color: active ? '#a78bfa' : 'rgba(255,255,255,0.35)' }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
