'use client';

import { useEffect, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { getHabitStats, getTotalXP, getLevel } from '@/lib/stats';
import { useNotifications } from '@/contexts/NotificationContext';
import { format } from 'date-fns';

// Milestones to notify about (streak days)
const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

function getMilestoneLabel(days: number): { icon: string; title: string; subtitle: string; xp: number } {
  if (days >= 100) return { icon: '💎', title: `${days}-Day Streak!`, subtitle: 'Elite territory. Absolutely legendary.', xp: 1500 };
  if (days >= 60)  return { icon: '👑', title: `${days}-Day Streak!`, subtitle: 'Two months of discipline. Incredible.', xp: 800 };
  if (days >= 30)  return { icon: '🏆', title: `${days}-Day Streak!`, subtitle: 'A full month. You are a master now.', xp: 400 };
  if (days >= 14)  return { icon: '🚀', title: `${days}-Day Streak!`, subtitle: 'Two weeks strong. You are in a flow.', xp: 150 };
  if (days >= 7)   return { icon: '⚡', title: '7-Day Streak!', subtitle: 'A full week. The habit is forming.', xp: 75 };
  return { icon: '🔥', title: '3-Day Streak!', subtitle: 'Great start. Keep it going tomorrow!', xp: 30 };
}

function getShownKey(type: string, id: string, date: string) {
  return `notif_${type}_${id}_${date}`;
}

function wasShown(key: string): boolean {
  try { return localStorage.getItem(key) === '1'; } catch { return false; }
}

function markShown(key: string) {
  try { localStorage.setItem(key, '1'); } catch { /* */ }
}

export default function NotificationDetector() {
  const { data, loaded } = useApp();
  const { showLevelUp, triggerConfetti, pushToast } = useNotifications();

  const prevLevelRef = useRef<number | null>(null);
  const prevStreaksRef = useRef<Record<string, number>>({});
  const prevPerfectRef = useRef(false);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (!loaded) return;

    const activeHabits = data.habits.filter(h => !h.archived);
    const xp = getTotalXP(activeHabits);
    const { level, title } = getLevel(xp);

    // ── Level up detection ─────────────────────────────
    if (prevLevelRef.current !== null && level > prevLevelRef.current) {
      const key = getShownKey('level', String(level), today);
      if (!wasShown(key)) {
        markShown(key);
        showLevelUp(level, title);
        triggerConfetti();
        pushToast({
          type: 'level',
          icon: '⚡',
          title: `Level ${level} unlocked!`,
          subtitle: title,
        });
      }
    }
    prevLevelRef.current = level;

    // ── Streak milestone detection ──────────────────────
    activeHabits.forEach(habit => {
      const stats = getHabitStats(habit);
      const streak = stats.currentStreak;
      const prev = prevStreaksRef.current[habit.id] ?? 0;

      if (streak > prev) {
        for (const milestone of STREAK_MILESTONES) {
          if (streak >= milestone && prev < milestone) {
            const key = getShownKey('streak', `${habit.id}_${milestone}`, today);
            if (!wasShown(key)) {
              markShown(key);
              const info = getMilestoneLabel(milestone);
              pushToast({
                type: 'streak',
                icon: info.icon,
                title: info.title,
                subtitle: `${habit.name} · ${info.subtitle}`,
                xp: info.xp,
              });
              if (milestone >= 7) triggerConfetti();
            }
          }
        }
      }
    });

    // Update prev streaks
    activeHabits.forEach(h => {
      prevStreaksRef.current[h.id] = getHabitStats(h).currentStreak;
    });

    // ── Perfect day detection ───────────────────────────
    const doneToday = activeHabits.filter(h => h.completions[today]).length;
    const perfect = doneToday === activeHabits.length && activeHabits.length > 0;

    if (perfect && !prevPerfectRef.current) {
      const key = getShownKey('perfect', 'day', today);
      if (!wasShown(key)) {
        markShown(key);
        triggerConfetti();
        pushToast({
          type: 'perfect',
          icon: '🎉',
          title: 'Perfect Day!',
          subtitle: `All ${activeHabits.length} habits completed. You crushed it!`,
        });
      }
    }
    prevPerfectRef.current = perfect;

    // ── First habit completion ──────────────────────────
    const totalCompletions = activeHabits.reduce((a, h) => a + getHabitStats(h).totalCompletions, 0);
    if (totalCompletions === 1) {
      const key = getShownKey('first', 'completion', today);
      if (!wasShown(key)) {
        markShown(key);
        pushToast({
          type: 'achievement',
          icon: '🌱',
          title: 'First completion!',
          subtitle: 'Your streak journey begins. Come back tomorrow!',
          xp: 10,
        });
      }
    }

  }, [data.habits, loaded]);

  return null;
}
