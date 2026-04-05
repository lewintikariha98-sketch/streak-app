import { format, subDays, parseISO, differenceInDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { Habit, HabitStats } from '@/types';

export function getHabitStats(habit: Habit): HabitStats {
  const today = new Date();

  let currentStreak = 0;
  for (let i = 0; i < 365; i++) {
    const date = format(subDays(today, i), 'yyyy-MM-dd');
    if (habit.completions[date]) {
      currentStreak++;
    } else if (i > 0) {
      break;
    }
  }

  const completedDates = Object.keys(habit.completions)
    .filter(d => habit.completions[d])
    .sort();

  let longestStreak = 0;
  let tempStreak = 0;
  for (let i = 0; i < completedDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const diff = differenceInDays(parseISO(completedDates[i]), parseISO(completedDates[i - 1]));
      tempStreak = diff === 1 ? tempStreak + 1 : 1;
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }
  longestStreak = Math.max(longestStreak, currentStreak);

  let done30 = 0;
  for (let i = 0; i < 30; i++) {
    const date = format(subDays(today, i), 'yyyy-MM-dd');
    if (habit.completions[date]) done30++;
  }

  const weekDays = eachDayOfInterval({
    start: startOfWeek(today, { weekStartsOn: 1 }),
    end: endOfWeek(today, { weekStartsOn: 1 }),
  });
  const weekDone = weekDays.filter(d => habit.completions[format(d, 'yyyy-MM-dd')]).length;

  return {
    currentStreak,
    longestStreak,
    completionRate30: Math.round((done30 / 30) * 100),
    totalCompletions: completedDates.length,
    weeklyRate: Math.round((weekDone / 7) * 100),
  };
}

export function getHabitXP(habit: Habit): { total: number; breakdown: { label: string; xp: number }[] } {
  const stats = getHabitStats(habit);
  const breakdown: { label: string; xp: number }[] = [];

  const base = stats.totalCompletions * 10;
  if (base > 0) breakdown.push({ label: `${stats.totalCompletions} completions ×10`, xp: base });

  const streakBonus = stats.currentStreak * 5;
  if (streakBonus > 0) breakdown.push({ label: `${stats.currentStreak}d active streak`, xp: streakBonus });

  const streakMilestones: [number, string, number][] = [
    [3, '🔥 3-day streak', 30],
    [7, '⚡ 7-day streak', 75],
    [14, '🚀 14-day streak', 150],
    [30, '🏆 30-day streak', 400],
    [60, '💎 60-day streak', 800],
    [100, '👑 100-day streak', 1500],
  ];
  for (const [threshold, label, bonus] of streakMilestones) {
    if (stats.longestStreak >= threshold) breakdown.push({ label, xp: bonus });
  }

  const completionMilestones: [number, string, number][] = [
    [10, '✅ 10 completions', 50],
    [25, '✅ 25 completions', 100],
    [50, '🎯 50 completions', 200],
    [100, '🌟 100 completions', 400],
    [200, '🦅 200 completions', 800],
    [500, '🔮 500 completions', 2000],
  ];
  for (const [threshold, label, bonus] of completionMilestones) {
    if (stats.totalCompletions >= threshold) breakdown.push({ label, xp: bonus });
  }

  return { total: breakdown.reduce((a, b) => a + b.xp, 0), breakdown };
}

export function getTotalXP(habits: Habit[]): number {
  return habits.reduce((sum, h) => sum + getHabitXP(h).total, 0);
}

export function getStreakMultiplier(streak: number): { label: string; color: string } {
  if (streak >= 30) return { label: '3×', color: 'text-amber-500' };
  if (streak >= 14) return { label: '2×', color: 'text-orange-500' };
  if (streak >= 7) return { label: '1.5×', color: 'text-violet-500' };
  return { label: '1×', color: 'text-gray-400' };
}

export function getFlowerStage(streak: number): 0 | 1 | 2 | 3 | 4 | 5 {
  if (streak >= 30) return 5;
  if (streak >= 14) return 4;
  if (streak >= 7) return 3;
  if (streak >= 3) return 2;
  if (streak >= 1) return 1;
  return 0;
}

export function getLevel(xp: number): { level: number; current: number; required: number; title: string } {
  const tiers: [number, string][] = [
    [0, 'Seedling'],
    [150, 'Sprout'],
    [400, 'Grower'],
    [800, 'Bloomer'],
    [1400, 'Gardener'],
    [2200, 'Cultivator'],
    [3200, 'Botanist'],
    [4500, 'Naturalist'],
    [6000, 'Sage'],
    [8000, 'Luminary'],
    [10500, 'Transcendent'],
    [14000, 'Legend'],
  ];
  let level = 1;
  let title = tiers[0][1];
  for (let i = 1; i < tiers.length; i++) {
    if (xp >= tiers[i][0]) { level = i + 1; title = tiers[i][1]; }
    else break;
  }
  const current = xp - tiers[level - 1][0];
  const nextThreshold = tiers[level]?.[0] ?? tiers[tiers.length - 1][0];
  const required = nextThreshold - tiers[level - 1][0];
  return { level, current, required, title };
}

export function getLast7Days() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i);
    return { date: format(date, 'yyyy-MM-dd'), label: format(date, 'EEE'), dayNum: format(date, 'd'), isToday: i === 6 };
  });
}

export function getLast52Weeks() {
  const today = new Date();
  const weeks: Array<Array<{ date: string; week: number }>> = [];
  for (let w = 51; w >= 0; w--) {
    const week = [];
    for (let d = 6; d >= 0; d--) {
      const date = subDays(today, w * 7 + d);
      week.push({ date: format(date, 'yyyy-MM-dd'), week: w });
    }
    weeks.push(week);
  }
  return weeks;
}

export function getWeeklyData(habits: Habit[]) {
  return getLast7Days().map(day => {
    const total = habits.length;
    const done = habits.filter(h => h.completions[day.date]).length;
    return { day: day.label, date: day.date, done, total, rate: total > 0 ? Math.round((done / total) * 100) : 0 };
  });
}

export function getMonthlyData(habits: Habit[]) {
  const today = new Date();
  return Array.from({ length: 30 }, (_, i) => {
    const date = format(subDays(today, 29 - i), 'yyyy-MM-dd');
    const total = habits.length;
    const done = habits.filter(h => h.completions[date]).length;
    return { date, label: format(subDays(today, 29 - i), 'MMM d'), done, total, rate: total > 0 ? Math.round((done / total) * 100) : 0 };
  });
}
