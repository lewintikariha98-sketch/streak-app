'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useApp } from '@/contexts/AppContext';
import { getHabitStats, getTotalXP, getLevel } from '@/lib/stats';
import { colorMap } from '@/lib/colors';
import { Zap, Lock } from 'lucide-react';

interface BadgeDef {
  id: string;
  icon: string;
  label: string;
  description: string;
  xp: number;
  check: (data: ReturnType<typeof useApp>['data']) => { earned: boolean; habitName?: string; progress?: number; max?: number };
}

const BADGES: BadgeDef[] = [
  {
    id: 'first_habit',
    icon: '🌱',
    label: 'First Habit',
    description: 'Create your very first habit',
    xp: 50,
    check: ({ habits }) => ({ earned: habits.length > 0 }),
  },
  {
    id: 'streak_3',
    icon: '🔥',
    label: '3-Day Streak',
    description: 'Complete any habit 3 days in a row',
    xp: 75,
    check: ({ habits }) => {
      const best = habits.find(h => getHabitStats(h).currentStreak >= 3);
      return { earned: !!best, habitName: best?.name, progress: Math.min(habits.reduce((a, h) => Math.max(a, getHabitStats(h).currentStreak), 0), 3), max: 3 };
    },
  },
  {
    id: 'streak_7',
    icon: '⚡',
    label: 'Week Warrior',
    description: 'Keep a streak for 7 days',
    xp: 150,
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
    check: ({ habits }) => {
      const best = habits.find(h => getHabitStats(h).currentStreak >= 14);
      return { earned: !!best, habitName: best?.name, progress: Math.min(habits.reduce((a, h) => Math.max(a, getHabitStats(h).currentStreak), 0), 14), max: 14 };
    },
  },
  {
    id: 'streak_30',
    icon: '🏆',
    label: 'Monthly Master',
    description: 'Sustain a 30-day streak — elite territory',
    xp: 750,
    check: ({ habits }) => {
      const best = habits.find(h => getHabitStats(h).currentStreak >= 30);
      return { earned: !!best, habitName: best?.name, progress: Math.min(habits.reduce((a, h) => Math.max(a, getHabitStats(h).currentStreak), 0), 30), max: 30 };
    },
  },
  {
    id: 'streak_100',
    icon: '💎',
    label: 'Century Club',
    description: '100-day streak. Legendary.',
    xp: 2000,
    check: ({ habits }) => {
      const best = habits.find(h => getHabitStats(h).longestStreak >= 100);
      return { earned: !!best, habitName: best?.name, progress: Math.min(habits.reduce((a, h) => Math.max(a, getHabitStats(h).longestStreak), 0), 100), max: 100 };
    },
  },
  {
    id: 'total_10',
    icon: '✅',
    label: 'Getting Started',
    description: 'Log 10 total habit completions',
    xp: 100,
    check: ({ habits }) => {
      const total = habits.reduce((a, h) => a + getHabitStats(h).totalCompletions, 0);
      return { earned: total >= 10, progress: Math.min(total, 10), max: 10 };
    },
  },
  {
    id: 'total_50',
    icon: '🎯',
    label: 'Consistent',
    description: '50 total completions across all habits',
    xp: 250,
    check: ({ habits }) => {
      const total = habits.reduce((a, h) => a + getHabitStats(h).totalCompletions, 0);
      return { earned: total >= 50, progress: Math.min(total, 50), max: 50 };
    },
  },
  {
    id: 'total_100',
    icon: '🌟',
    label: 'Century of Wins',
    description: '100 total completions',
    xp: 500,
    check: ({ habits }) => {
      const total = habits.reduce((a, h) => a + getHabitStats(h).totalCompletions, 0);
      return { earned: total >= 100, progress: Math.min(total, 100), max: 100 };
    },
  },
  {
    id: 'total_500',
    icon: '🦅',
    label: 'Elite',
    description: '500 total completions — you\'re unstoppable',
    xp: 2500,
    check: ({ habits }) => {
      const total = habits.reduce((a, h) => a + getHabitStats(h).totalCompletions, 0);
      return { earned: total >= 500, progress: Math.min(total, 500), max: 500 };
    },
  },
  {
    id: 'multi_habits',
    icon: '🎪',
    label: 'Multitasker',
    description: 'Track 5 or more habits at once',
    xp: 200,
    check: ({ habits }) => ({
      earned: habits.filter(h => !h.archived).length >= 5,
      progress: Math.min(habits.filter(h => !h.archived).length, 5),
      max: 5,
    }),
  },
  {
    id: 'perfect_day',
    icon: '☀️',
    label: 'Perfect Day',
    description: 'Complete all habits in a single day',
    xp: 150,
    check: ({ habits }) => {
      const active = habits.filter(h => !h.archived);
      if (active.length === 0) return { earned: false };
      const today = format(new Date(), 'yyyy-MM-dd');
      const earned = active.every(h => h.completions[today]);
      return { earned };
    },
  },
];

export default function AchievementsPage() {
  const { data, loaded } = useApp();

  if (!loaded) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  const activeHabits = data.habits.filter(h => !h.archived);
  const xp = getTotalXP(activeHabits);
  const { level, current, required } = getLevel(xp);
  const pct = required > 0 ? Math.round((current / required) * 100) : 0;

  const results = BADGES.map(b => ({ ...b, result: b.check(data) }));
  const earned = results.filter(b => b.result.earned);
  const locked = results.filter(b => !b.result.earned);
  const totalXP = earned.reduce((a, b) => a + b.xp, 0);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Achievements</h1>
        <p className="text-gray-400 text-sm mt-1">{earned.length} of {BADGES.length} badges earned · {totalXP} XP</p>
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
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <Zap size={16} className="text-yellow-300" />
              <span className="text-xl font-bold">{xp}</span>
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
          <div
            className="h-full bg-white/80 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-violet-200 text-xs mt-2">{required - current} XP to next level</p>
      </motion.div>

      {/* Earned badges */}
      {earned.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-gray-900 mb-3">Earned ({earned.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {earned.map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-violet-100 shadow-sm p-4 flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-sm">
                  {badge.icon}
                </div>
                <p className="font-semibold text-gray-900 text-sm mb-0.5">{badge.label}</p>
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
      )}

      {/* Locked badges */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-3">Locked ({locked.length})</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {locked.map((badge, i) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-gray-50 rounded-2xl border border-gray-100 p-4 flex flex-col items-center text-center"
            >
              <div className="relative w-14 h-14 bg-gray-200 rounded-2xl flex items-center justify-center text-3xl mb-3 grayscale opacity-50">
                {badge.icon}
                <div className="absolute inset-0 bg-gray-100/60 rounded-2xl flex items-center justify-center">
                  <Lock size={16} className="text-gray-400" />
                </div>
              </div>
              <p className="font-semibold text-gray-500 text-sm mb-0.5">{badge.label}</p>
              <p className="text-[11px] text-gray-400 leading-snug mb-2">{badge.description}</p>

              {/* Progress bar if applicable */}
              {badge.result.max && badge.result.progress !== undefined && (
                <div className="w-full mt-1">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-300 rounded-full transition-all"
                      style={{ width: `${(badge.result.progress / badge.result.max) * 100}%` }}
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
          ))}
        </div>
      </div>
    </div>
  );
}
