'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2, Archive, Edit3, Flame, CheckCircle2, Circle, Wand2, X, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { getHabitStats, getLast7Days } from '@/lib/stats';
import { colorMap } from '@/lib/colors';
import HabitModal from '@/components/habits/HabitModal';
import { Habit, HabitCategory, HabitColor } from '@/types';

const CATEGORY_LABELS: Record<HabitCategory, string> = {
  health: '🏥 Health', fitness: '💪 Fitness', nutrition: '🥗 Nutrition',
  mindfulness: '🧘 Mind', productivity: '⚡ Productivity', learning: '📚 Learning',
  social: '👥 Social', finance: '💰 Finance', custom: '✨ Custom',
};

interface Template { name: string; description: string; icon: string; color: HabitColor; category: HabitCategory; targetDays: number; }

const TEMPLATES: Template[] = [
  { name: 'Morning Meditation', description: 'Clear your mind before the day begins', icon: '🧘', color: 'violet', category: 'mindfulness', targetDays: 7 },
  { name: 'Read 30 Minutes', description: 'Expand your knowledge daily', icon: '📚', color: 'blue', category: 'learning', targetDays: 5 },
  { name: 'Strength Training', description: 'Build strength and endurance', icon: '💪', color: 'orange', category: 'fitness', targetDays: 4 },
  { name: 'Drink 8 Glasses of Water', description: 'Stay hydrated throughout the day', icon: '💧', color: 'cyan', category: 'health', targetDays: 7 },
  { name: 'Daily Journaling', description: 'Reflect and capture your thoughts', icon: '✍️', color: 'amber', category: 'productivity', targetDays: 7 },
  { name: 'Eat Healthy', description: 'Choose nutritious foods each day', icon: '🥗', color: 'emerald', category: 'nutrition', targetDays: 7 },
  { name: 'Cold Shower', description: 'Build mental toughness daily', icon: '🚿', color: 'teal', category: 'health', targetDays: 5 },
  { name: 'Gratitude Practice', description: "Write 3 things you're grateful for", icon: '❤️', color: 'rose', category: 'mindfulness', targetDays: 7 },
  { name: 'No Social Media', description: 'Focus and reclaim your attention', icon: '🔕', color: 'rose', category: 'productivity', targetDays: 7 },
  { name: 'Evening Walk', description: 'Wind down with a 20-min walk', icon: '🌅', color: 'amber', category: 'fitness', targetDays: 5 },
  { name: 'Save Money', description: 'Track and save a little each day', icon: '💰', color: 'emerald', category: 'finance', targetDays: 7 },
  { name: 'Learn Something New', description: 'Dedicate time to a new skill', icon: '🎯', color: 'indigo', category: 'learning', targetDays: 5 },
];

export default function HabitsPage() {
  const { data, loaded, toggleCompletion, addHabit, updateHabit, deleteHabit, archiveHabit } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>();
  const [menuId, setMenuId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterCat, setFilterCat] = useState<HabitCategory | 'all'>('all');

  const days = getLast7Days();
  const today = format(new Date(), 'yyyy-MM-dd');

  const activeHabits = data.habits.filter(h => !h.archived);
  const archivedHabits = data.habits.filter(h => h.archived);

  let visibleHabits = (showArchived ? archivedHabits : activeHabits).filter(h =>
    filterCat === 'all' || h.category === filterCat
  );

  const handleEdit = (habit: Habit) => { setEditingHabit(habit); setModalOpen(true); setMenuId(null); };
  const handleSave = (d: Omit<Habit, 'id' | 'completions' | 'notes' | 'createdAt' | 'archived'>) => {
    if (editingHabit) { updateHabit(editingHabit.id, d); setEditingHabit(undefined); }
    else addHabit(d);
  };
  const handleAddTemplate = (t: Template) => {
    addHabit({ name: t.name, description: t.description, icon: t.icon, color: t.color, category: t.category, targetDays: t.targetDays });
    setShowTemplates(false);
  };

  if (!loaded) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const categories = [...new Set(activeHabits.map(h => h.category))];
  const doneToday = activeHabits.filter(h => h.completions[today]).length;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-2xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {showArchived ? 'Archived' : 'Habits'}
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {showArchived
              ? `${archivedHabits.length} archived`
              : `${doneToday} of ${activeHabits.length} done today`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold border transition-colors"
            style={{ border: '1px solid #e2e8f0', color: '#7c3aed', background: showTemplates ? '#ede9fe' : '#f5f3ff' }}
          >
            <Wand2 size={14} />
            <span className="hidden sm:inline">Templates</span>
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2.5 rounded-xl border transition-colors"
            style={{ border: '1px solid #e2e8f0', background: showFilters ? '#f1f5f9' : 'white', color: '#64748b' }}
          >
            <SlidersHorizontal size={16} />
          </button>
          <button
            onClick={() => { setEditingHabit(undefined); setModalOpen(true); }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold rounded-xl shadow-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>

      {/* Filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
              {/* Active / Archived toggle */}
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-semibold text-slate-500 w-14">View</span>
                <div className="flex items-center bg-gray-100 rounded-xl p-1">
                  {([false, true] as const).map(archived => (
                    <button
                      key={String(archived)}
                      onClick={() => setShowArchived(archived)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${showArchived === archived ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
                    >
                      {archived ? `Archived (${archivedHabits.length})` : `Active (${activeHabits.length})`}
                    </button>
                  ))}
                </div>
              </div>
              {/* Category filter */}
              {categories.length > 1 && (
                <div className="flex items-start gap-2">
                  <span className="text-[12px] font-semibold text-slate-500 w-14 pt-1">Filter</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setFilterCat('all')}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filterCat === 'all' ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >All</button>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setFilterCat(cat === filterCat ? 'all' : cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filterCat === cat ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {CATEGORY_LABELS[cat]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Templates panel */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5 overflow-hidden"
          >
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">Quick-Start Templates</h3>
                  <p className="text-[12px] text-gray-500 mt-0.5">Tap any to add instantly</p>
                </div>
                <button onClick={() => setShowTemplates(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TEMPLATES.map((t, i) => {
                  const colors = colorMap[t.color];
                  const alreadyAdded = data.habits.some(h => h.name === t.name && !h.archived);
                  return (
                    <button
                      key={i}
                      onClick={() => !alreadyAdded && handleAddTemplate(t)}
                      disabled={alreadyAdded}
                      className="flex items-center gap-2.5 p-3 rounded-xl text-left transition-all hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: alreadyAdded ? '#f9fafb' : 'white', border: `1px solid ${alreadyAdded ? '#e5e7eb' : colors.hexLight}` }}
                    >
                      <span className="text-xl flex-shrink-0">{t.icon}</span>
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-gray-800 truncate">{t.name}</p>
                        <p className="text-[10px] text-gray-400">{t.targetDays}× /week</p>
                      </div>
                      {alreadyAdded && <span className="text-[10px] text-green-500 font-semibold ml-auto">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Habit list */}
      {visibleHabits.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-14 text-center">
          <p className="text-4xl mb-3">{showArchived ? '📦' : '✨'}</p>
          <p className="font-semibold text-gray-700 mb-1">
            {showArchived ? 'No archived habits' : 'No habits yet'}
          </p>
          {!showArchived && (
            <>
              <p className="text-sm text-gray-400 mb-5">Start with a template or create your own</p>
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => setShowTemplates(true)} className="px-5 py-2.5 bg-violet-50 text-violet-700 text-sm font-semibold rounded-xl border border-violet-200">
                  Browse templates
                </button>
                <button onClick={() => { setEditingHabit(undefined); setModalOpen(true); }} className="px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl">
                  Create custom
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {visibleHabits.map((habit, i) => {
              const stats = getHabitStats(habit);
              const colors = colorMap[habit.color];
              const done = !!habit.completions[today];
              const isOnFire = stats.currentStreak >= 7;
              const atRisk = stats.currentStreak > 0 && !done;
              return (
                <motion.div
                  key={habit.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-2xl overflow-hidden"
                  style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}
                >
                  {/* Color top stripe */}
                  <div className={`h-1 bg-gradient-to-r ${colors.gradient}`} />

                  <div className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      {/* Check */}
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => toggleCompletion(habit.id, today)}
                        style={{ color: done ? colors.hex : '#d1d5db', flexShrink: 0 }}
                      >
                        {done ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                      </motion.button>

                      {/* Icon */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-all"
                        style={{
                          background: done ? colors.hex : colors.hexLight,
                          boxShadow: isOnFire ? `0 0 0 2px ${colors.hex}40` : undefined,
                        }}
                      >
                        <span style={{ filter: done ? 'brightness(10)' : undefined }}>{habit.icon}</span>
                      </div>

                      {/* Name + streak */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold leading-tight truncate" style={{ color: done ? '#94a3b8' : '#1e293b', textDecoration: done ? 'line-through' : 'none' }}>
                          {habit.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {stats.currentStreak >= 7 ? (
                            <span className="text-[11px] font-bold text-orange-500 flex items-center gap-0.5">🔥 {stats.currentStreak}d streak</span>
                          ) : stats.currentStreak >= 3 ? (
                            <span className="text-[11px] text-orange-400 flex items-center gap-0.5"><Flame size={10} /> {stats.currentStreak}d streak</span>
                          ) : stats.currentStreak >= 1 ? (
                            <span className="text-[11px] text-slate-400">{stats.currentStreak}d streak</span>
                          ) : (
                            <span className="text-[11px] text-slate-300">Start your streak</span>
                          )}
                          {atRisk && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#FEF3C7', color: '#D97706' }}>at risk ⚠️</span>
                          )}
                        </div>
                      </div>

                      {/* Completion % */}
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                        style={{ background: done ? colors.hex : colors.hexLight, color: done ? 'white' : colors.hex }}
                      >
                        {stats.completionRate30}%
                      </div>

                      {/* Menu */}
                      <div className="relative flex-shrink-0">
                        <button
                          onClick={() => setMenuId(menuId === habit.id ? null : habit.id)}
                          className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-gray-500 rounded-lg transition-colors"
                        >
                          ···
                        </button>
                        <AnimatePresence>
                          {menuId === habit.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -4 }}
                              className="absolute right-0 top-9 z-10 bg-white border border-gray-100 rounded-2xl shadow-xl py-1.5 w-40"
                            >
                              <button onClick={() => handleEdit(habit)} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-600 hover:bg-gray-50">
                                <Edit3 size={14} /> Edit
                              </button>
                              <button onClick={() => { archiveHabit(habit.id); setMenuId(null); }} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-600 hover:bg-gray-50">
                                <Archive size={14} /> Archive
                              </button>
                              <div className="mx-3 my-1 border-t border-gray-100" />
                              <button onClick={() => { deleteHabit(habit.id); setMenuId(null); }} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-rose-500 hover:bg-rose-50">
                                <Trash2 size={14} /> Delete
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Week dots — compact */}
                    <div className="flex items-center gap-1.5 mt-3 pl-[52px]">
                      {days.map(day => (
                        <button
                          key={day.date}
                          onClick={() => toggleCompletion(habit.id, day.date)}
                          title={day.date}
                          className={`flex flex-col items-center gap-0.5 flex-1 py-1 rounded-lg text-[9px] font-medium transition-all ${
                            habit.completions[day.date] ? `${colors.bg} text-white` :
                            day.isToday ? `${colors.bgLighter} ${colors.text} ring-1 ${colors.ring}` :
                            'bg-gray-50 text-gray-400'
                          }`}
                        >
                          <span>{day.label[0]}</span>
                          <span className="font-bold">{day.dayNum}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <HabitModal
        open={modalOpen}
        initial={editingHabit}
        onClose={() => { setModalOpen(false); setEditingHabit(undefined); }}
        onSave={handleSave}
      />

      {/* Bottom padding */}
      <div className="h-24" />
    </div>
  );
}
