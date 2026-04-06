'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';

const TYPE_STYLES = {
  achievement: { bg: '#1e1b4b', border: '#4f46e5', accent: '#818cf8' },
  streak:      { bg: '#1c1917', border: '#f97316', accent: '#fb923c' },
  level:       { bg: '#0f172a', border: '#8b5cf6', accent: '#a78bfa' },
  perfect:     { bg: '#052e16', border: '#16a34a', accent: '#4ade80' },
  info:        { bg: '#0f172a', border: '#334155', accent: '#94a3b8' },
};

export default function ToastStack() {
  const { toasts, dismissToast } = useNotifications();

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[95] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none"
      style={{ top: 'max(16px, env(safe-area-inset-top, 16px))' }}
    >
      <AnimatePresence>
        {toasts.map((toast, i) => {
          const s = TYPE_STYLES[toast.type] ?? TYPE_STYLES.info;
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="pointer-events-auto rounded-2xl flex items-center gap-3 px-4 py-3.5 shadow-2xl"
              style={{
                background: s.bg,
                border: `1px solid ${s.border}`,
                boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${s.border}20`,
              }}
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: `${s.accent}20` }}
              >
                {toast.icon}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-[13px] leading-tight">{toast.title}</p>
                <p className="text-[11px] mt-0.5" style={{ color: s.accent + 'cc' }}>{toast.subtitle}</p>
              </div>

              {/* XP chip */}
              {toast.xp && (
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded-lg flex-shrink-0"
                  style={{ background: `${s.accent}20` }}
                >
                  <Zap size={10} style={{ color: s.accent }} />
                  <span className="text-[11px] font-bold" style={{ color: s.accent }}>+{toast.xp}</span>
                </div>
              )}

              {/* Dismiss */}
              <button
                onClick={() => dismissToast(toast.id)}
                className="flex-shrink-0 p-1 rounded-lg transition-colors"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
