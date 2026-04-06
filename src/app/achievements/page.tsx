'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useApp } from '@/contexts/AppContext';
import { getHabitStats, getTotalXP, getLevel } from '@/lib/stats';
import { Zap, Lock, Star } from 'lucide-react';

type Rarity = 'bronze' | 'silver' | 'gold' | 'platinum';

interface BadgeDef {
  id: string;
  icon: string;
  label: string;
  description: string;
  xp: number;
  rarity: Rarity;
  check: (data: ReturnType<typeof useApp>['data']) => { earned: boolean; habitName?: string; progress?: number; max?: number };
}

const RARITY_CONFIG: Record<Rarity, { label: string; color: string; bg: string; border: string; glow: string }> = {
  bronze:   { label: 'Bronze',   color: '#92400e', bg: '#fef3c7', border: '#fde68a', glow: '#f59e0b' },
  silver:   { label: 'Silver',   color: '#374151', bg: '#f3f4f6', border: '#d1d5db', glow: '#9ca3af' },
  gold:     { label: 'Gold',     color: '#92400e', bg: '#fef9c3', border: '#fde047', glow: '#eab308' },
  platinum: { label: 'Platinum', color: '#5b21b6', bg: '#f5f3ff', border: '#c4b5fd', glow: '#8b5cf6' },
};

const BADGES: BadgeDef[] = [
  // ── Bronze ──────────────────────────────────────────────────────────
  {
    id: 'first_habit',
    icon: '🌱',
    label: 'First Habit',
    description: 'Create your very first habit',
    xp: 50,
    rarity: 'bronze',
    check: ({ habits }) => ({ earned: habits.length > 0 }),
  },
  {
    id: 'streak_3',
    icon: '🔥',
    label: '3-Day Streak',
    description: 'Complete any habit 3 days in a row',
    xp: 75,
    rarity: 'bronze',
    check: ({ habits }) => {
      const best = habits.find(h => getHabitStats(h).currentStreak >= 3);
      return { earned: !!best, habitName: best?.name, progress: Math.min(habits.reduce((a, h) => Math.max(a, getHabitStats(h).currentStreak), 0), 3), max: 3 };
    },
  },
  {
    id: 'total_10',
    icon: '✅',
    label: 'Getting Started',
    description: 'Log 10 total habit completions',
    xp: 100,
    rarity: 'bronze',
    check: ({ habits }) => {
      const total = habits.reduce((a, h) => a + getHabitStats(h).totalCompletions, 0);
      return { earned: total >= 10, progress: Math.min(total, 10), max: 10 };
    },
  },
  {
    id: 'perfect_day',
    icon: '☀️',
    label: 'Perfect Day',
    description: 'Complete all habits in a single day',
    xp: 150,
    rarity: 'bronze',
    check: ({ habits }) => {
      const active = habits.filter(h => !h.archived);
      if (active.length === 0) return { earned: false };
      const today = format(new Date(), 'yyyy-MM-dd');
      const earned = active.every(h => h.completions[today]);
      return { earned };
    },
  },
  {
    id: 'multi_habits',
    icon: '🎪',
    label: 'Multitasker',
    description: 'Track 5 or more habits at once',
    xp: 100,
    rarity: 'bronze',
    check: ({ habits }) => ({
      earned: habits.filter(h => !h.archived).length >= 5,
      progress: Math.min(habits.filter(h => !h.archived).length, 5),
      max: 5,
    }),
  },
  {
    id: 'level_3',
    icon: '⭐',
    label: 'Rising Star',
    description: 'Reach Level 3',
    xp: 100,
    rarity: 'bronze',
    check: ({ habits }) => {
      const xp = getTotalXP(habits.filter(h => !h.archived));
      const { level } = getLevel(xp);
      return { earned: level >= 3 };
    },
  },
  {
    id: 'xp_500',
    icon: '💡',
    label: 'XP Collector',
    description: 'Earn 500 total XP',
    xp: 100,
    rarity: 'bronze',
    check: ({ habits }) => {
      const xp = getTotalXP(habits.filter(h => !h.archived));
      return { earned: xp >= 500, progress: Math.min(xp, 500), max: 500 };
    },
  },
  {
    id: 'expense_track',
    icon: '💰',
    label: 'Budget Pro',
    description: 'Log expenses on 7 different days',
    xp: 100,
    rarity: 'bronze',
    check: ({ expenses }) => {
      const days = new Set(expenses.map(e => e.date)).size;
      return { earned: days >= 7, progress: Math.min(days, 7), max: 7 };
    },
  },

  // ── Silver ──────────────────────────────────────────────────────────
  {
    id: 'streak_7',
    icon: '⚡',
    label: 'Week Warrior',
    description: 'Keep a streak for 7 days',
    xp: 150,
    rarity: 'silver',
    check: ({ habits }) => {
      const best = habits.find(h => getHabitStats(h).currentStreak >= 7);
      return { earned: !!best, habitName: best?.name, progress: Math.min(habits.reduce((a, h) => Math.max(a, getHabitStats(h).currentStreak), 0), 7), max: 7 };
    },
  },
  {
    id: 'streak_14',
    icon: '🚀',
    label: 'Two Weeks Strong',
    description: 'Maintain a habit for 14 consecutive days',
    xp: 300,
    rarity: 'silver',
    check: ({ habits }) => {
      const best = habits.find(h => getHabitStats(h).currentStreak >= 14);
      return { earned: !!best, habitName: best?.name, progress: Math.min(habits.reduce((a, h) => Math.max(a, getHabitStats(h).currentStreak), 0), 14), max: 14 };
    },
  },
  {
    id: 'total_50',
    icon: '🎯',
    label: 'Consistent',
    description: '50 total completions across all habits',
    xp: 250,
    rarity: 'silver',
    check: ({ habits }) => {
      const total = habits.reduce((a, h) => a + getHabitStats(h).totalCompletions, 0);
      return { earned: total >= 50, progress: Math.min(total, 50), max: 50 };
    },
  },
  {
    id: 'variety',
    icon: '🎨',
    label: 'Variety Pack',
    description: 'Track habits in 4+ different categories',
    xp: 200,
    rarity: 'silver',
    check: ({ habits }) => {
      const cats = new Set(habits.filter(h => !h.archived).map(h => h.category)).size;
      return { earned: cats >= 4, progress: Math.min(cats, 4), max: 4 };
    },
  },
  {
    id: 'level_6',
    icon: '🌟',
    label: 'Veteran',
    description: 'Reach Level 6',
    xp: 300,
    rarity: 'silver',
    check: ({ habits }) => {
      const xp = getTotalXP(habits.filter(h => !h.archived));
      const { level } = getLevel(xp);
      return { earned: level >= 6 };
    },
  },
  {
    id: 'habit_10',
    icon: '🏟️',
    label: 'Habit Hoarder',
    description: 'Track 10 habits at once',
    xp: 300,
    rarity: 'silver',
    check: ({ habits }) => ({
      earned: habits.filter(h => !h.archived).length >= 10,
      progress: Math.min(habits.filter(h => !h.archived).length, 10),
      max: 10,
    }),
  },
  {
    id: 'xp_2000',
    icon: '🔋',
    label: 'Powered Up',
    description: 'Earn 2,000 total XP',
    xp: 250,
    rarity: 'silver',
    check: ({ habits }) => {
      const xp = getTotalXP(habits.filter(h => !h.archived));
      return { earned: xp >= 2000, progress: Math.min(xp, 2000), max: 2000 };
    },
  },

  // ── Gold ────────────────────────────────────────────────────────────
  {
    id: 'streak_30',
    icon: '🏆',
    label: 'Monthly Master',
    description: 'Sustain a 30-day streak — elite territory',
    xp: 750,
    rarity: 'gold',
    check: ({ habits }) => {
      const best = habits.find(h => getHabitStats(h).currentStreak >= 30);
      return { earned: !!best, habitName: best?.name, progress: Math.min(habits.reduce((a, h) => Math.max(a, getHabitStats(h).currentStreak), 0), 30), max: 30 };
    },
  },
  {
    id: 'streak_50',
    icon: '🦁',
    label: 'Marathon Runner',
    description: '50-day streak. Iron will.',
    xp: 1000,
    rarity: 'gold',
    check: ({ habits }) => {
      const best = habits.find(h => getHabitStats(h).longestStreak >= 50);
      return { earned: !!best, habitName: best?.name, progress: Math.min(habits.reduce((a, h) => Math.max(a, getHabitStats(h).longestStreak), 0), 50), max: 50 };
    },
  },
  {
    id: 'total_100',
    icon: '🌟',
    label: 'Century of Wins',
    description: '100 total completions',
    xp: 500,
    rarity: 'gold',
    check: ({ habits }) => {
      const total = habits.reduce((a, h) => a + getHabitStats(h).totalCompletions, 0);
      return { earned: total >= 100, progress: Math.min(total, 100), max: 100 };
    },
  },
  {
    id: 'perfect_week',
    icon: '🌈',
    label: 'Perfect Week',
    description: 'All habits done every day for 7 days straight',
    xp: 500,
    rarity: 'gold',
    check: ({ habits }) => {
      const active = habits.filter(h => !h.archived);
      if (active.length === 0) return { earned: false };
      const today = new Date();
      let perfectDays = 0;
      for (let i = 0; i < 7; i++) {
        const d = format(new Date(today.getTime() - i * 86400000), 'yyyy-MM-dd');
        if (active.every(h => h.completions[d])) perfectDays++;
      }
      return { earned: perfectDays >= 7, progress: perfectDays, max: 7 };
    },
  },
  {
    id: 'all_streaks',
    icon: '⚡',
    label: 'All In',
    description: 'Every active habit has a streak of 3+ days',
    xp: 400,
    rarity: 'gold',
    check: ({ habits }) => {
      const active = habits.filter(h => !h.archived);
      if (active.length < 2) return { earned: false };
      return { earned: active.every(h => getHabitStats(h).currentStreak >= 3) };
    },
  },
  {
    id: 'xp_5000',
    icon: '💎',
    label: 'XP Hoarder',
    description: 'Earn 5,000 total XP',
    xp: 500,
    rarity: 'gold',
    check: ({ habits }) => {
      const xp = getTotalXP(habits.filter(h => !h.archived));
      return { earned: xp >= 5000, progress: Math.min(xp, 5000), max: 5000 };
    },
  },
  {
    id: 'level_10',
    icon: '👑',
    label: 'Level 10',
    description: 'Reach Level 10 — elite tier',
    xp: 1000,
    rarity: 'gold',
    check: ({ habits }) => {
      const xp = getTotalXP(habits.filter(h => !h.archived));
      const { level } = getLevel(xp);
      return { earned: level >= 10 };
    },
  },

  // ── Platinum ─────────────────────────────────────────────────────────
  {
    id: 'streak_100',
    icon: '💎',
    label: 'Century Club',
    description: '100-day streak. Legendary.',
    xp: 2000,
    rarity: 'platinum',
    check: ({ habits }) => {
      const best = habits.find(h => getHabitStats(h).longestStreak >= 100);
      return { earned: !!best, habitName: best?.name, progress: Math.min(habits.reduce((a, h) => Math.max(a, getHabitStats(h).longestStreak), 0), 100), max: 100 };
    },
  },
  {
    id: 'total_500',
    icon: '🦅',
    label: 'Elite',
    description: '500 total completions — unstoppable',
    xp: 2500,
    rarity: 'platinum',
    check: ({ habits }) => {
      const total = habits.reduce((a, h) => a + getHabitStats(h).totalCompletions, 0);
      return { earned: total >= 500, progress: Math.min(total, 500), max: 500 };
    },
  },
  {
    id: 'legend',
    icon: '🌌',
    label: 'Legend',
    description: 'Reach Level 12 — the absolute peak',
    xp: 3000,
    rarity: 'platinum',
    check: ({ habits }) => {
      const xp = getTotalXP(habits.filter(h => !h.archived));
      const { level } = getLevel(xp);
      return { earned: level >= 12 };
    },
  },
];

function RarityBadge({ rarity }: { rarity: Rarity }) {
  const cfg = RARITY_CONFIG[rarity];
  return (
    <span
      className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
    >
      <Star size={7} />
      {cfg.label}
    </span>
  );
}

const RARITY_ORDER: Rarity[] = ['bronze', 'silver', 'gold', 'platinum'];

export default function AchievementsPage() {
  const { data, loaded } = useApp();

  if (!loaded) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  const activeHabits = data.habits.filter(h => !h.archived);
  const xp = getTotalXP(activeHabits);
  const { level, current, required, title } = getLevel(xp);
  const pct = required > 0 ? Math.round((current / required) * 100) : 0;

  const results = BADGES.map(b => ({ ...b, result: b.check(data) }));
  const earned = results.filter(b => b.result.earned);
  const locked = results.filter(b => !b.result.earned);
  const badgeXP = earned.reduce((a, b) => a + b.xp, 0);

  // Group earned badges by rarity
  const earnedByRarity = RARITY_ORDER.map(r => ({
    rarity: r,
    badges: earned.filter(b => b.rarity === r),
  })).filter(g => g.badges.length > 0);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Achievements</h1>
        <p className="text-gray-400 text-sm mt-1">
          {earned.length} of {BADGES.length} unlocked · {badgeXP.toLocaleString()} badge XP
        </p>
      </div>

      {/* Level card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-3xl p-6 mb-8 text-white shadow-lg shadow-violet-200"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-violet-200 text-sm font-medium">Your level</p>
            <p className="text-5xl font-black mt-0.5">{level}</p>
            <p className="text-violet-300 text-sm mt-0.5">{title}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <Zap size={16} className="text-yellow-300" />
              <span className="text-xl font-bold">{xp.toLocaleString()}</span>
            </div>
            <p className="text-violet-200 text-xs mt-0.5">Total XP</p>
          </div>
        </div>
        <div className="mb-1.5 flex justify-between text-xs text-violet-200">
          <span>Level {level}</span>
          <span>{current}/{required} XP</span>
          <span>Level {level + 1}</span>
        </div>
        <div className="h-2.5 bg-violet-500/40 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-white/80 rounded-full"
          />
        </div>
        <p className="text-violet-200 text-xs mt-2">{required - current} XP to next level</p>

        {/* Rarity summary */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-violet-500/30">
          {RARITY_ORDER.map(r => {
            const count = earned.filter(b => b.rarity === r).length;
            const cfg = RARITY_CONFIG[r];
            return (
              <div key={r} className="text-center">
                <p className="text-lg font-black text-white">{count}</p>
                <p className="text-[10px] font-semibold" style={{ color: cfg.glow }}>{cfg.label}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Earned badges by rarity */}
      {earned.length > 0 && earnedByRarity.map(({ rarity, badges }) => {
        const cfg = RARITY_CONFIG[rarity];
        return (
          <div key={rarity} className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="font-semibold text-gray-900">{cfg.label} ({badges.length})</h2>
              <div className="h-px flex-1 bg-gray-100" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {badges.map((badge, i) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-2xl p-4 flex flex-col items-center text-center relative overflow-hidden"
                  style={{
                    border: `1px solid ${cfg.border}`,
                    boxShadow: `0 2px 12px ${cfg.glow}20`,
                  }}
                >
                  {/* Glow top bar */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: cfg.glow }} />
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-sm"
                    style={{ background: cfg.bg }}
                  >
                    {badge.icon}
                  </div>
                  <RarityBadge rarity={badge.rarity} />
                  <p className="font-semibold text-gray-900 text-sm mt-1.5 mb-0.5">{badge.label}</p>
                  <p className="text-[11px] text-gray-400 leading-snug mb-2">{badge.description}</p>
                  {badge.result.habitName && (
                    <p className="text-[10px] text-violet-500 font-medium">{badge.result.habitName}</p>
                  )}
                  <div className="mt-auto pt-2">
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-violet-600">
                      <Zap size={10} /> +{badge.xp} XP
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}

      {earned.length === 0 && (
        <div className="text-center py-10 text-gray-400 mb-8">
          <p className="text-4xl mb-3">🏅</p>
          <p className="font-semibold text-gray-600">No badges yet</p>
          <p className="text-sm">Start completing habits to unlock achievements</p>
        </div>
      )}

      {/* Locked badges */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="font-semibold text-gray-900">Locked ({locked.length})</h2>
          <div className="h-px flex-1 bg-gray-100" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {locked.map((badge, i) => {
            const cfg = RARITY_CONFIG[badge.rarity];
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="bg-gray-50 rounded-2xl border border-gray-100 p-4 flex flex-col items-center text-center"
              >
                <div className="relative w-14 h-14 bg-gray-200 rounded-2xl flex items-center justify-center text-3xl mb-3 grayscale opacity-40">
                  {badge.icon}
                  <div className="absolute inset-0 bg-gray-100/60 rounded-2xl flex items-center justify-center">
                    <Lock size={14} className="text-gray-400" />
                  </div>
                </div>
                <RarityBadge rarity={badge.rarity} />
                <p className="font-semibold text-gray-500 text-sm mt-1.5 mb-0.5">{badge.label}</p>
                <p className="text-[11px] text-gray-400 leading-snug mb-2">{badge.description}</p>
                {badge.result.max && badge.result.progress !== undefined && (
                  <div className="w-full mt-1">
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${(badge.result.progress / badge.result.max) * 100}%`, background: cfg.glow }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">{badge.result.progress}/{badge.result.max}</p>
                  </div>
                )}
                <div className="mt-auto pt-2">
                  <span className="flex items-center gap-1 text-[11px] font-medium text-gray-400">
                    <Zap size={10} /> {badge.xp} XP
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
