'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';

const LEVEL_COLORS: Record<number, { from: string; to: string; glow: string }> = {
  1:  { from: '#6b7280', to: '#9ca3af', glow: '#9ca3af' },
  2:  { from: '#3b82f6', to: '#60a5fa', glow: '#3b82f6' },
  3:  { from: '#8b5cf6', to: '#a78bfa', glow: '#8b5cf6' },
  4:  { from: '#06b6d4', to: '#22d3ee', glow: '#06b6d4' },
  5:  { from: '#10b981', to: '#34d399', glow: '#10b981' },
  6:  { from: '#f59e0b', to: '#fbbf24', glow: '#f59e0b' },
  7:  { from: '#f97316', to: '#fb923c', glow: '#f97316' },
  8:  { from: '#ef4444', to: '#f87171', glow: '#ef4444' },
  9:  { from: '#ec4899', to: '#f472b6', glow: '#ec4899' },
  10: { from: '#8b5cf6', to: '#f59e0b', glow: '#f59e0b' },
  11: { from: '#6366f1', to: '#ec4899', glow: '#ec4899' },
  12: { from: '#fbbf24', to: '#f59e0b', glow: '#fbbf24' },
};

const LEVEL_EMOJIS: Record<number, string> = {
  1: '🌱', 2: '🌿', 3: '⭐', 4: '💫', 5: '🌟',
  6: '🔥', 7: '⚡', 8: '🚀', 9: '💎', 10: '👑', 11: '🌌', 12: '🏆',
};

export default function LevelUpModal() {
  const { levelUpData, dismissLevelUp } = useNotifications();
  const colors = levelUpData ? (LEVEL_COLORS[levelUpData.level] ?? LEVEL_COLORS[12]) : LEVEL_COLORS[1];

  return (
    <AnimatePresence>
      {levelUpData && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-md"
            onClick={dismissLevelUp}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="fixed inset-0 z-[91] flex items-center justify-center p-6 pointer-events-none"
          >
            <div
              className="relative bg-[#0d1117] rounded-[32px] p-8 w-full max-w-[340px] text-center pointer-events-auto overflow-hidden"
              style={{ border: `1px solid ${colors.glow}30`, boxShadow: `0 0 60px ${colors.glow}40` }}
            >
              {/* Glow blob behind */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 50% 0%, ${colors.glow} 0%, transparent 70%)` }}
              />

              {/* Close */}
              <button
                onClick={dismissLevelUp}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
              >
                <X size={16} />
              </button>

              {/* Label */}
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: colors.glow }}>
                Level Up!
              </p>

              {/* Big emoji */}
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-[72px] mb-4 leading-none"
              >
                {LEVEL_EMOJIS[levelUpData.level] ?? '🏆'}
              </motion.div>

              {/* Level number */}
              <motion.p
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, delay: 0.1 }}
                className="text-[72px] font-black leading-none mb-1"
                style={{
                  background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {levelUpData.level}
              </motion.p>

              {/* Title */}
              <p className="text-white/80 text-[18px] font-bold mb-1">{levelUpData.title}</p>
              <p className="text-white/40 text-[13px] mb-6">You've leveled up. Keep going!</p>

              {/* Zap */}
              <div className="flex items-center justify-center gap-1.5 mb-6">
                <Zap size={14} style={{ color: colors.glow }} />
                <span className="text-[13px] font-semibold" style={{ color: colors.glow }}>New level unlocked</span>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={dismissLevelUp}
                className="w-full py-3.5 rounded-2xl font-bold text-[14px] text-black"
                style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}
              >
                Let's keep going! 🚀
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
