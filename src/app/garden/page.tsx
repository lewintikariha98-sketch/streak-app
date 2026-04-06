'use client';

import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Heart, CheckCircle2, Circle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { getHabitStats, getTotalXP, getLevel } from '@/lib/stats';
import { colorMap } from '@/lib/colors';
import { HabitCategory } from '@/types';

// ── Pet evolution based on total XP ────────────────────────
function getPetForm(xp: number) {
  if (xp < 50)   return { emoji: '🥚', name: 'Egg',         desc: 'Feed it to hatch!',              bg: 'from-amber-50 to-yellow-100',  glow: '#F59E0B' };
  if (xp < 200)  return { emoji: '🐣', name: 'Hatchling',   desc: 'Freshly hatched!',               bg: 'from-yellow-50 to-amber-100',  glow: '#FCD34D' };
  if (xp < 500)  return { emoji: '🐥', name: 'Baby Chick',  desc: 'Getting bigger every day!',      bg: 'from-amber-50 to-orange-100',  glow: '#FB923C' };
  if (xp < 1000) return { emoji: '🦊', name: 'Fox Cub',     desc: 'Sharp and playful!',             bg: 'from-orange-50 to-red-100',    glow: '#F97316' };
  if (xp < 3000) return { emoji: '🐲', name: 'Dragon',      desc: 'A force of nature!',             bg: 'from-violet-50 to-purple-100', glow: '#7C3AED' };
  return           { emoji: '🐉', name: 'Ancient Dragon', desc: 'Legendary. Unstoppable.',        bg: 'from-fuchsia-50 to-pink-100',  glow: '#EC4899' };
}

// ── Mood based on today's completion ───────────────────────
function getMood(pct: number, noneYet: boolean) {
  if (noneYet)   return { emoji: '😴', label: 'Sleeping',   color: '#94A3B8', anim: 'sleep' };
  if (pct >= 100) return { emoji: '🤩', label: 'Ecstatic!', color: '#F97316', anim: 'jump' };
  if (pct >= 66)  return { emoji: '😊', label: 'Happy',     color: '#10B981', anim: 'bounce' };
  if (pct >= 33)  return { emoji: '😐', label: 'Hungry',    color: '#F59E0B', anim: 'sway' };
  return           { emoji: '😟', label: 'Starving!',   color: '#EF4444', anim: 'shake' };
}

// ── Food per habit category ─────────────────────────────────
const CATEGORY_FOOD: Record<HabitCategory, string> = {
  health:       '🍎',
  fitness:      '🥩',
  nutrition:    '🥗',
  mindfulness:  '🫧',
  productivity: '⚡',
  learning:     '📖',
  social:       '🤝',
  finance:      '💰',
  custom:       '🎁',
};

interface FoodPop { id: string; emoji: string }

// ── Pet animation variants ──────────────────────────────────
const petVariants = {
  jump:   { y: [0, -30, 0, -15, 0], transition: { duration: 0.8, ease: 'easeOut', repeat: Infinity, repeatDelay: 1.5 } },
  bounce: { y: [0, -10, 0], transition: { duration: 1.2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.5 } },
  sway:   { rotate: [-3, 3, -3], transition: { duration: 2, ease: 'easeInOut', repeat: Infinity } },
  shake:  { x: [-4, 4, -4, 4, 0], transition: { duration: 0.6, repeat: Infinity, repeatDelay: 2 } },
  sleep:  { y: [0, -3, 0], scale: [1, 1.02, 1], transition: { duration: 3, ease: 'easeInOut', repeat: Infinity } },
};

export default function PetPage() {
  const { data, loaded, toggleCompletion } = useApp();
  const [foodPops, setFoodPops] = useState<FoodPop[]>([]);

  const today = format(new Date(), 'yyyy-MM-dd');

  const triggerFeed = useCallback((emoji: string) => {
    const id = Math.random().toString(36).slice(2);
    setFoodPops(p => [...p, { id, emoji }]);
    setTimeout(() => setFoodPops(p => p.filter(f => f.id !== id)), 1000);
  }, []);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeHabits = data.habits.filter(h => !h.archived);
  const totalXP = getTotalXP(activeHabits);
  const { level, current, required, title } = getLevel(totalXP);
  const xpPct = required > 0 ? Math.round((current / required) * 100) : 0;

  const doneToday = activeHabits.filter(h => h.completions[today]).length;
  const completionPct = activeHabits.length > 0 ? Math.round((doneToday / activeHabits.length) * 100) : 0;
  const noneYet = activeHabits.length === 0 || doneToday === 0;

  const pet = getPetForm(totalXP);
  const mood = getMood(completionPct, noneYet);
  const moodAnim = petVariants[mood.anim as keyof typeof petVariants];

  // Total meals ever eaten = total completions across all habits
  const totalMeals = activeHabits.reduce((sum, h) => sum + getHabitStats(h).totalCompletions, 0);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Your Pet</h1>
        <p className="text-gray-400 text-sm mt-0.5">Complete habits to feed and evolve your companion</p>
      </div>

      {/* Pet card */}
      <div
        className="rounded-3xl overflow-hidden mb-5 relative"
        style={{ boxShadow: `0 8px 40px ${pet.glow}30` }}
      >
        {/* Background */}
        <div className={`bg-gradient-to-br ${pet.bg} p-8 flex flex-col items-center`}>
          {/* Glow ring */}
          <div
            className="absolute w-48 h-48 rounded-full opacity-20 blur-3xl"
            style={{ background: pet.glow, top: '50%', left: '50%', transform: 'translate(-50%, -60%)' }}
          />

          {/* Food pops — animated food flying up */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <AnimatePresence>
              {foodPops.map(f => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 1, y: 80, x: Math.random() * 60 - 30, scale: 0.6 }}
                  animate={{ opacity: 0, y: -20, scale: 1.4 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute text-3xl"
                  style={{ left: '50%', bottom: 60, transform: 'translateX(-50%)' }}
                >
                  {f.emoji}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pet name + stage */}
          <div className="text-center mb-2 relative z-10">
            <span
              className="inline-block text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-2"
              style={{ background: `${pet.glow}20`, color: pet.glow }}
            >
              {pet.name}
            </span>
          </div>

          {/* The pet character */}
          <motion.div
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            animate={moodAnim as any}
            className="relative z-10 select-none cursor-default"
            style={{ fontSize: 96, lineHeight: 1 }}
          >
            {pet.emoji}
          </motion.div>

          {/* Mood badge */}
          <div className="mt-3 flex items-center gap-2 relative z-10">
            <span className="text-lg">{mood.emoji}</span>
            <span className="font-bold text-[13px]" style={{ color: mood.color }}>{mood.label}</span>
          </div>

          <p className="text-[12px] text-gray-500 mt-1 relative z-10">{pet.desc}</p>
        </div>

        {/* Fullness bar */}
        <div className="bg-white px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-base">🍖</span>
              <span className="text-[12px] font-bold text-gray-600">Fullness</span>
            </div>
            <span className="text-[12px] font-black" style={{ color: mood.color }}>
              {completionPct}%
            </span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{
                background: completionPct >= 100
                  ? 'linear-gradient(90deg, #F97316, #EF4444)'
                  : completionPct >= 66
                  ? 'linear-gradient(90deg, #10B981, #34D399)'
                  : completionPct >= 33
                  ? 'linear-gradient(90deg, #F59E0B, #FCD34D)'
                  : 'linear-gradient(90deg, #EF4444, #F87171)',
              }}
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">
            {doneToday}/{activeHabits.length} habits completed today
            {completionPct === 100 ? ' · 🎉 Your pet is thriving!' : ' · Keep feeding!'}
          </p>
        </div>
      </div>

      {/* XP + Level */}
      <div
        className="rounded-2xl p-4 mb-5 flex items-center gap-4"
        style={{
          background: 'linear-gradient(135deg, #1E1B4B, #312E81)',
          boxShadow: '0 8px 32px rgba(79,70,229,0.25)',
        }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}
        >
          {level}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-white text-[13px]">{title}</span>
            <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1">
              <Zap size={11} /> {totalXP.toLocaleString()} XP
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${xpPct}%`,
                background: 'linear-gradient(90deg, #7C3AED, #A78BFA, #EC4899)',
              }}
            />
          </div>
          <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {current.toLocaleString()} / {required.toLocaleString()} XP → Level {level + 1}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: '🍽️', label: 'Total meals', value: totalMeals },
          { icon: '❤️', label: 'Habits tracked', value: activeHabits.length },
          { icon: '⚡', label: 'Total XP', value: totalXP.toLocaleString() },
        ].map(s => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-3 text-center"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #F1F5F9' }}
          >
            <p className="text-xl mb-0.5">{s.icon}</p>
            <p className="text-[15px] font-black text-gray-900">{s.value}</p>
            <p className="text-[10px] text-gray-400 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Feed section — today's habits */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🍽️</span>
          <h2 className="font-black text-gray-900">Feed your pet</h2>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#F4F3FF', color: '#7C3AED' }}>
            {doneToday}/{activeHabits.length}
          </span>
        </div>

        {activeHabits.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: 'white', border: '2px dashed #E2E8F0' }}
          >
            <p className="text-4xl mb-2">🐾</p>
            <p className="font-bold text-gray-600">No habits yet</p>
            <p className="text-[13px] text-gray-400 mt-1">Add habits to feed your pet</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeHabits.map(habit => {
              const done = !!habit.completions[today];
              const colors = colorMap[habit.color];
              const foodEmoji = CATEGORY_FOOD[habit.category];
              const stats = getHabitStats(habit);

              return (
                <motion.button
                  key={habit.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    toggleCompletion(habit.id, today);
                    if (!done) triggerFeed(foodEmoji);
                  }}
                  className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl text-left transition-all"
                  style={{
                    background: done
                      ? `linear-gradient(135deg, ${colors.hexLight}, ${colors.hexLight}80)`
                      : 'white',
                    border: done ? `1.5px solid ${colors.hex}30` : '1.5px solid #F1F5F9',
                    boxShadow: done ? `0 4px 16px ${colors.hex}15` : '0 1px 4px rgba(0,0,0,0.06)',
                  }}
                >
                  {/* Food icon */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: done ? `${colors.hex}20` : '#F8FAFC' }}
                  >
                    {done ? habit.icon : foodEmoji}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-[14px] ${done ? '' : 'text-gray-800'}`} style={{ color: done ? colors.hex : undefined }}>
                      {habit.name}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {done ? `Fed! ${foodEmoji} ·` : `${foodEmoji} ready ·`} {stats.currentStreak}d streak
                    </p>
                  </div>

                  {/* Check */}
                  <div className="flex-shrink-0">
                    {done ? (
                      <CheckCircle2 size={22} style={{ color: colors.hex }} />
                    ) : (
                      <Circle size={22} style={{ color: '#CBD5E1' }} />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Evolution roadmap */}
      <div className="mt-8">
        <h2 className="font-black text-gray-900 mb-3">Evolution path</h2>
        <div className="space-y-2">
          {[
            { emoji: '🥚', name: 'Egg',           xpReq: 0,    glow: '#F59E0B' },
            { emoji: '🐣', name: 'Hatchling',      xpReq: 50,   glow: '#FCD34D' },
            { emoji: '🐥', name: 'Baby Chick',     xpReq: 200,  glow: '#FB923C' },
            { emoji: '🦊', name: 'Fox Cub',        xpReq: 500,  glow: '#F97316' },
            { emoji: '🐲', name: 'Dragon',         xpReq: 1000, glow: '#7C3AED' },
            { emoji: '🐉', name: 'Ancient Dragon', xpReq: 3000, glow: '#EC4899' },
          ].map((stage, i, arr) => {
            const unlocked = totalXP >= stage.xpReq;
            const current = totalXP >= stage.xpReq && (i === arr.length - 1 || totalXP < arr[i + 1].xpReq);
            return (
              <div
                key={stage.name}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{
                  background: current
                    ? `linear-gradient(135deg, ${stage.glow}15, ${stage.glow}08)`
                    : unlocked ? '#F8FAFC' : '#FAFAFA',
                  border: current ? `1.5px solid ${stage.glow}30` : '1.5px solid transparent',
                  opacity: !unlocked && !current ? 0.5 : 1,
                }}
              >
                <span className="text-2xl">{stage.emoji}</span>
                <div className="flex-1">
                  <p className="font-bold text-[13px] text-gray-800">{stage.name}</p>
                  <p className="text-[11px] text-gray-400">{stage.xpReq.toLocaleString()} XP</p>
                </div>
                {current && (
                  <span
                    className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full"
                    style={{ background: `${stage.glow}20`, color: stage.glow }}
                  >
                    Current
                  </span>
                )}
                {unlocked && !current && (
                  <Heart size={14} style={{ color: stage.glow }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
