'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Info, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { getHabitStats, getHabitXP, getTotalXP, getLevel, getFlowerStage, getStreakMultiplier } from '@/lib/stats';
import { colorMap } from '@/lib/colors';
import FlowerPlant from '@/components/garden/FlowerPlant';
import { Habit } from '@/types';

const STAGE_LABELS = ['🌱 Seed', '🌿 Sprout', '🪴 Seedling', '🌸 Budding', '🌺 Blooming', '🌹 Full Bloom'];
const STAGE_DESCS = [
  'Start completing this habit to plant your seed.',
  '1–2 days in a row. Growing nicely!',
  '3–6 days. Your plant is taking shape.',
  '7–13 days. A bud is forming. Keep going!',
  '14–29 days. Your flower is in full bloom!',
  '30+ days. Legendary. Your flower is magnificent ✨',
];

function SkyBackground({ completionPct }: { completionPct: number }) {
  if (completionPct >= 80) {
    return (
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-200 to-emerald-100">
        {/* Sun */}
        <div className="absolute top-6 right-12 w-14 h-14 bg-yellow-300 rounded-full shadow-lg shadow-yellow-200 animate-pulse" />
        <div className="absolute top-4 right-10 w-18 h-18 bg-yellow-100 rounded-full opacity-40" style={{ width: 72, height: 72 }} />
        {/* Birds */}
        <div className="absolute top-8 left-20 text-xs opacity-60" style={{ animation: 'float 4s ease-in-out infinite' }}>🕊️</div>
        <div className="absolute top-14 left-40 text-xs opacity-50" style={{ animation: 'float 5s ease-in-out infinite 1s' }}>🦋</div>
      </div>
    );
  }
  if (completionPct >= 40) {
    return (
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-100 to-emerald-50">
        <div className="absolute top-8 right-16 w-12 h-12 bg-yellow-200 rounded-full opacity-80" />
        <div className="absolute top-5 left-20 w-16 h-6 bg-white rounded-full opacity-60" />
        <div className="absolute top-10 left-40 w-12 h-5 bg-white rounded-full opacity-50" />
        <div className="absolute top-12 left-32 text-xs opacity-40" style={{ animation: 'float 4s ease-in-out infinite' }}>🦋</div>
      </div>
    );
  }
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-slate-300 via-slate-100 to-gray-50">
      <div className="absolute top-6 left-16 w-20 h-7 bg-white rounded-full opacity-70" />
      <div className="absolute top-10 left-36 w-16 h-6 bg-white rounded-full opacity-60" />
      <div className="absolute top-5 right-24 w-24 h-8 bg-white rounded-full opacity-50" />
    </div>
  );
}

export default function GardenPage() {
  const { data, loaded, toggleCompletion } = useApp();
  const [selected, setSelected] = useState<Habit | null>(null);

  if (!loaded) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  const activeHabits = data.habits.filter(h => !h.archived);
  const today = format(new Date(), 'yyyy-MM-dd');
  const doneToday = activeHabits.filter(h => h.completions[today]).length;
  const completionPct = activeHabits.length > 0 ? Math.round((doneToday / activeHabits.length) * 100) : 0;
  const totalXP = getTotalXP(activeHabits);
  const { level, current, required, title } = getLevel(totalXP);
  const pct = required > 0 ? Math.round((current / required) * 100) : 0;

  const selectedStats = selected ? getHabitStats(selected) : null;
  const selectedXP = selected ? getHabitXP(selected) : null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Garden scene */}
      <div className="relative h-64 sm:h-80 overflow-hidden flex-shrink-0">
        <SkyBackground completionPct={completionPct} />

        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-emerald-800 to-emerald-600 rounded-t-[40%]" />
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-emerald-900 to-emerald-700" />

        {/* Grass texture dots */}
        <div className="absolute bottom-10 left-0 right-0 flex justify-around px-8">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-1 bg-emerald-400 rounded-full" style={{ height: 8 + (i % 3) * 4 }} />
          ))}
        </div>

        {/* Flowers on the ground */}
        {activeHabits.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl px-6 py-4">
              <p className="text-2xl mb-1">🌱</p>
              <p className="font-semibold text-gray-700 text-sm">Your garden is empty</p>
              <p className="text-xs text-gray-500">Add habits to plant flowers</p>
            </div>
          </div>
        ) : (
          <div className="absolute bottom-8 left-0 right-0 flex items-end justify-start sm:justify-center gap-3 sm:gap-4 px-4 overflow-x-auto scrollbar-none" style={{ WebkitOverflowScrolling: 'touch' }}>
            {activeHabits.map((habit, i) => {
              const stats = getHabitStats(habit);
              const stage = getFlowerStage(stats.currentStreak);
              const colors = colorMap[habit.color];
              const habitXP = getHabitXP(habit).total;
              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => setSelected(habit)}
                  className="flex-shrink-0"
                >
                  <FlowerPlant
                    stage={stage}
                    color={colors.hex}
                    lightColor={colors.hexLight}
                    name={habit.name}
                    streak={stats.currentStreak}
                    xp={habitXP}
                    completedToday={!!habit.completions[today]}
                  />
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Weather label */}
        <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm rounded-xl px-3 py-1.5 text-xs font-medium text-gray-700">
          {completionPct >= 80 ? '☀️ Thriving' : completionPct >= 40 ? '⛅ Growing' : '🌧️ Needs care'}
        </div>
      </div>

      {/* Stats + XP panel */}
      <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto lg:mx-0">
          {/* Level bar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-md shadow-violet-200 flex-shrink-0">
              <span className="text-white font-black text-sm">{level}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-gray-900">{title}</span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Zap size={12} className="text-violet-500" /> {totalXP} XP total
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">{current}/{required} XP to Level {level + 1}</p>
            </div>
          </div>

          {/* Stage legend */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Flower growth stages</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {STAGE_LABELS.map((label, i) => (
                <div
                  key={i}
                  className="bg-gray-50 rounded-xl px-3 py-2.5 text-center border border-gray-100"
                >
                  <p className="text-sm mb-0.5">{label}</p>
                  <p className="text-[10px] text-gray-500 leading-snug">{
                    i === 0 ? '0 days' :
                    i === 1 ? '1–2 days' :
                    i === 2 ? '3–6 days' :
                    i === 3 ? '7–13 days' :
                    i === 4 ? '14–29 days' :
                    '30+ days'
                  }</p>
                </div>
              ))}
            </div>
          </div>

          {/* Habit XP cards */}
          <div className="mt-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Your flowers</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeHabits.map(habit => {
                const stats = getHabitStats(habit);
                const stage = getFlowerStage(stats.currentStreak);
                const { total, breakdown } = getHabitXP(habit);
                const colors = colorMap[habit.color];
                const multiplier = getStreakMultiplier(stats.currentStreak);
                return (
                  <motion.div
                    key={habit.id}
                    layout
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelected(habit)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 ${colors.bgLight} rounded-xl flex items-center justify-center text-xl`}>
                        {habit.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-900">{habit.name}</p>
                        <p className="text-[11px] text-gray-400">{STAGE_LABELS[stage]}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <Zap size={12} className="text-violet-500" />
                          <span className="text-sm font-bold text-violet-600">{total}</span>
                        </div>
                        <span className={`text-[11px] font-bold ${multiplier.color}`}>{multiplier.label} multiplier</span>
                      </div>
                    </div>

                    {/* XP breakdown mini */}
                    <div className="space-y-1">
                      {breakdown.slice(0, 3).map((b, i) => (
                        <div key={i} className="flex justify-between text-[11px]">
                          <span className="text-gray-500 truncate">{b.label}</span>
                          <span className="text-violet-600 font-medium ml-2">+{b.xp}</span>
                        </div>
                      ))}
                      {breakdown.length > 3 && (
                        <p className="text-[11px] text-gray-400">+{breakdown.length - 3} more bonuses</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Habit detail drawer */}
      <AnimatePresence>
        {selected && selectedStats && selectedXP && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setSelected(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-50 overflow-y-auto"
            >
              <div className={`h-1.5 bg-gradient-to-r ${colorMap[selected.color].gradient}`} />
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 ${colorMap[selected.color].bgLight} rounded-xl flex items-center justify-center text-2xl`}>
                      {selected.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{selected.name}</h3>
                      <p className="text-xs text-gray-400">{STAGE_LABELS[getFlowerStage(selectedStats.currentStreak)]}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <X size={18} className="text-gray-400" />
                  </button>
                </div>

                {/* Mini flower */}
                <div className="flex justify-center mb-5">
                  <FlowerPlant
                    stage={getFlowerStage(selectedStats.currentStreak)}
                    color={colorMap[selected.color].hex}
                    lightColor={colorMap[selected.color].hexLight}
                    name=""
                    streak={selectedStats.currentStreak}
                    xp={selectedXP.total}
                    completedToday={!!selected.completions[today]}
                  />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {[
                    { label: 'Current streak', value: `${selectedStats.currentStreak}d` },
                    { label: 'Best streak', value: `${selectedStats.longestStreak}d` },
                    { label: '30-day rate', value: `${selectedStats.completionRate30}%` },
                    { label: 'Total done', value: String(selectedStats.totalCompletions) },
                  ].map(s => (
                    <div key={s.label} className={`${colorMap[selected.color].bgLighter} rounded-xl p-3`}>
                      <p className={`text-xl font-bold ${colorMap[selected.color].text}`}>{s.value}</p>
                      <p className="text-xs text-gray-500">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* XP breakdown */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-gray-900 text-sm">XP Breakdown</p>
                    <div className="flex items-center gap-1">
                      <Zap size={14} className="text-violet-500" />
                      <span className="font-bold text-violet-600">{selectedXP.total} XP</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {selectedXP.breakdown.map((b, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                        <span className="text-sm text-gray-600">{b.label}</span>
                        <span className="text-sm font-semibold text-violet-600">+{b.xp} XP</span>
                      </div>
                    ))}
                    {selectedXP.breakdown.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">Complete this habit to earn XP</p>
                    )}
                  </div>
                </div>

                {/* What's next */}
                {selectedStats.currentStreak < 30 && (
                  <div className="mt-4 bg-violet-50 rounded-xl p-3.5">
                    <p className="text-xs font-semibold text-violet-700 mb-1">🎯 Next milestone</p>
                    {selectedStats.currentStreak < 3 && <p className="text-xs text-violet-600">Reach a 3-day streak → +30 XP + Seedling stage</p>}
                    {selectedStats.currentStreak >= 3 && selectedStats.currentStreak < 7 && <p className="text-xs text-violet-600">Reach a 7-day streak → +75 XP + Budding stage</p>}
                    {selectedStats.currentStreak >= 7 && selectedStats.currentStreak < 14 && <p className="text-xs text-violet-600">Reach a 14-day streak → +150 XP + Blooming stage + 2× multiplier</p>}
                    {selectedStats.currentStreak >= 14 && <p className="text-xs text-violet-600">Reach a 30-day streak → +400 XP + Full Bloom + 3× multiplier</p>}
                  </div>
                )}

                {/* Complete today */}
                <button
                  onClick={() => toggleCompletion(selected.id, today)}
                  className={`w-full mt-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                    selected.completions[today]
                      ? 'bg-gray-100 text-gray-500'
                      : `bg-gradient-to-r ${colorMap[selected.color].gradient} text-white shadow-sm hover:opacity-90`
                  }`}
                >
                  {selected.completions[today] ? '✓ Done today' : 'Mark done today'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
