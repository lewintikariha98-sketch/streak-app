'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Search, MoreHorizontal, Trash2, Archive, Edit3, Flame, Trophy, CheckCircle2, Circle, Wand2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { getHabitStats, getLast7Days } from '@/lib/stats';
import { colorMap } from '@/lib/colors';
import HabitModal from '@/components/habits/HabitModal';
import { Habit, HabitCategory, HabitColor } from '@/types';

const CATEGORY_LABELS: Record<HabitCategory, string> = {
  health: '🏥 Health',
  fitness: '💪 Fitness',
  nutrition: '🥗 Nutrition',
  mindfulness: '🧘 Mindfulness',
  productivity: '⚡ Productivity',
  learning: '📚 Learning',
  social: '👥 Social',
  finance: '💰 Finance',
  custom: '✨ Custom',
};

interface Template {
  name: string;
  description: string;
  icon: string;
  color: HabitColor;
  category: HabitCategory;
  targetDays: number;
}

const TEMPLATES: Template[] = [
  { name: 'Morning Meditation', description: 'Clear your mind before the day begins', icon: '🧘', color: 'violet', category: 'mindfulness', targetDays: 7 },
  { name: 'Read 30 Minutes', description: 'Expand your knowledge daily', icon: '📚', color: 'blue', category: 'learning', targetDays: 5 },
  { name: 'Strength Training', description: 'Build strength and endurance', icon: '💪', color: 'orange', category: 'fitness', targetDays: 4 },
  { name: 'Drink 8 Glasses of Water', description: 'Stay hydrated throughout the day', icon: '💧', color: 'cyan', category: 'health', targetDays: 7 },
  { name: 'Daily Journaling', description: 'Reflect and capture your thoughts', icon: '✍️', color: 'amber', category: 'productivity', targetDays: 7 },
  { name: 'Eat Healthy', description: 'Choose nutritious foods each day', icon: '🥗', color: 'emerald', category: 'nutrition', targetDays: 7 },
  { name: 'Cold Shower', description: 'Build mental toughness daily', icon: '🚿', color: 'teal', category: 'health', targetDays: 5 },
  { name: 'Gratitude Practice', description: "Write 3 things you're grateful for", icon: '❤️', color: 'rose', category: 'mindfulness', targetDays: 7 },
  { name: 'Learn Something New', description: 'Dedicate time to a new skill', icon: '🎯', color: 'indigo', category: 'learning', targetDays: 5 },
  { name: 'No Social Media', description: 'Focus and reclaim your attention', icon: '🔕', color: 'rose', category: 'productivity', targetDays: 7 },
  { name: 'Evening Walk', description: 'Wind down with a 20-min walk', icon: '🌅', color: 'amber', category: 'fitness', targetDays: 5 },
  { name: 'Save Money', description: 'Track and save a little each day', icon: '💰', color: 'emerald', category: 'finance', targetDays: 7 },
];

type SortKey = 'name' | 'streak' | 'rate' | 'added';

export default function HabitsPage() {
  const { data, loaded, toggleCompletion, addHabit, updateHabit, deleteHabit, archiveHabit } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<HabitCategory | 'all'>('all');
  const [menuId, setMenuId] = useState<string | null>(null);
  const [view, setView] = useState<'active' | 'archived'>('active');
  const [sortKey, setSortKey] = useState<SortKey>('added');
  const [showTemplates, setShowTemplates] = useState(false);

  const days = getLast7Days();
  const today = format(new Date(), 'yyyy-MM-dd');

  let habits = data.habits.filter(h => {
    if (view === 'active' && h.archived) return false;
    if (view === 'archived' && !h.archived) return false;
    if (filterCat !== 'all' && h.category !== filterCat) return false;
    if (search && !h.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Sort
  habits = [...habits].sort((a, b) => {
    if (sortKey === 'name') return a.name.localeCompare(b.name);
    if (sortKey === 'streak') return getHabitStats(b).currentStreak - getHabitStats(a).currentStreak;
    if (sortKey === 'rate') return getHabitStats(b).completionRate30 - getHabitStats(a).completionRate30;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setModalOpen(true);
    setMenuId(null);
  };

  const handleSave = (d: Omit<Habit, 'id' | 'completions' | 'notes' | 'createdAt' | 'archived'>) => {
    if (editingHabit) {
      updateHabit(editingHabit.id, d);
      setEditingHabit(undefined);
    } else {
      addHabit(d);
    }
  };

  const handleAddTemplate = (t: Template) => {
    addHabit({ name: t.name, description: t.description, icon: t.icon, color: t.color, category: t.category, targetDays: t.targetDays });
    setShowTemplates(false);
  };

  if (!loaded) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  const categories = [...new Set(data.habits.map(h => h.category))];
  const activeCount = data.habits.filter(h => !h.archived).length;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-5 sm:mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Habits</h1>
          <p className="text-gray-400 text-sm mt-1">
            {data.habits.filter(h => !h.archived).length} active · {data.habits.filter(h => h.archived).length} archived
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-1.5 px-3 py-2.5 min-h-[44px] rounded-xl text-[13px] font-semibold border transition-colors hover:bg-white"
            style={{ border: '1px solid #e2e8f0', color: '#7c3aed', background: '#f5f3ff' }}
          >
            <Wand2 size={14} /> Templates
          </button>
          <button
            onClick={() => { setEditingHabit(undefined); setModalOpen(true); }}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 min-h-[44px] bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus size={16} /> <span className="hidden sm:inline">New habit</span><span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

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
                  <p className="text-[12px] text-gray-500 mt-0.5">Click any to add it instantly</p>
                </div>
                <button onClick={() => setShowTemplates(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
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

      {/* Filters row */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search habits..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
          />
        </div>
        <div className="flex items-center bg-gray-100 rounded-xl p-1">
          {(['active', 'archived'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                view === v ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        {/* Sort */}
        <select
          value={sortKey}
          onChange={e => setSortKey(e.target.value as SortKey)}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-[12px] text-gray-600 outline-none focus:ring-2 focus:ring-violet-400"
        >
          <option value="added">Sort: Recently added</option>
          <option value="streak">Sort: Streak</option>
          <option value="rate">Sort: Completion rate</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>

      {/* Category pills */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          <button
            onClick={() => setFilterCat('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filterCat === 'all' ? 'bg-violet-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat === filterCat ? 'all' : cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterCat === cat ? 'bg-violet-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      )}

      {/* Habit list */}
      {habits.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-14 text-center">
          <p className="text-4xl mb-3">{view === 'archived' ? '📦' : '✨'}</p>
          <p className="font-semibold text-gray-700 mb-1">
            {view === 'archived' ? 'No archived habits' : search ? 'No habits found' : 'No habits yet'}
          </p>
          <p className="text-sm text-gray-400 mb-5">
            {view === 'active' && !search && 'Start with a template or create your own'}
          </p>
          {view === 'active' && !search && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowTemplates(true)}
                className="px-5 py-2.5 bg-violet-50 text-violet-700 text-sm font-semibold rounded-xl hover:bg-violet-100 transition-colors border border-violet-200"
              >
                Browse templates
              </button>
              <button
                onClick={() => { setEditingHabit(undefined); setModalOpen(true); }}
                className="px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors"
              >
                Create custom
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {habits.map((habit, i) => {
              const stats = getHabitStats(habit);
              const colors = colorMap[habit.color];
              const done = !!habit.completions[today];
              const isOnFire = stats.currentStreak >= 7;
              return (
                <motion.div
                  key={habit.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className={`h-1 bg-gradient-to-r ${colors.gradient}`} />
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        <button
                          onClick={() => toggleCompletion(habit.id, today)}
                          className={`transition-all ${done ? colors.text : 'text-gray-200 hover:text-gray-400'}`}
                        >
                          {done ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                        </button>
                        <div
                          className={`w-11 h-11 ${colors.bgLight} rounded-2xl flex items-center justify-center text-2xl`}
                          style={isOnFire ? { boxShadow: `0 0 0 2px ${colors.hex}30, 0 0 16px ${colors.hex}20` } : {}}
                        >
                          {habit.icon}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className={`font-semibold text-[15px] ${done ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                              {habit.name}
                            </h3>
                            {habit.description && (
                              <p className="text-xs text-gray-400 mt-0.5">{habit.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${colors.bgLight} ${colors.text}`}>
                                {CATEGORY_LABELS[habit.category]}
                              </span>
                              <span className="text-[11px] text-gray-400">{habit.targetDays}× /week</span>
                            </div>
                          </div>

                          <div className="relative flex-shrink-0">
                            <button
                              onClick={() => setMenuId(menuId === habit.id ? null : habit.id)}
                              className="p-1.5 text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <MoreHorizontal size={16} />
                            </button>
                            <AnimatePresence>
                              {menuId === habit.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                  className="absolute right-0 top-8 z-10 bg-white border border-gray-100 rounded-2xl shadow-xl py-1.5 w-44"
                                >
                                  <button
                                    onClick={() => handleEdit(habit)}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                                  >
                                    <Edit3 size={14} /> Edit habit
                                  </button>
                                  <button
                                    onClick={() => { archiveHabit(habit.id); setMenuId(null); }}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                                  >
                                    <Archive size={14} /> Archive
                                  </button>
                                  <div className="mx-3 my-1 border-t border-gray-100" />
                                  <button
                                    onClick={() => { deleteHabit(habit.id); setMenuId(null); }}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-rose-500 hover:bg-rose-50"
                                  >
                                    <Trash2 size={14} /> Delete
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        {/* Week dots */}
                        <div className="flex items-center gap-1.5 mt-3">
                          {days.map(day => (
                            <button
                              key={day.date}
                              onClick={() => toggleCompletion(habit.id, day.date)}
                              title={day.date}
                              className={`flex flex-col items-center gap-0.5 w-9 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                                habit.completions[day.date]
                                  ? `${colors.bg} text-white`
                                  : day.isToday
                                  ? `${colors.bgLighter} ${colors.text} ring-1 ${colors.ring}`
                                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                              }`}
                            >
                              <span>{day.label[0]}</span>
                              <span className="font-semibold">{day.dayNum}</span>
                            </button>
                          ))}
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
                          <div className="flex items-center gap-1">
                            {stats.currentStreak >= 7 ? (
                              <span className="text-sm">🔥</span>
                            ) : (
                              <Flame size={12} className="text-orange-400" />
                            )}
                            <span className="text-xs text-gray-600 font-medium">{stats.currentStreak}</span>
                            <span className="text-xs text-gray-400">streak</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Trophy size={12} className="text-amber-400" />
                            <span className="text-xs text-gray-600 font-medium">{stats.longestStreak}</span>
                            <span className="text-xs text-gray-400">best</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-600 font-medium">{stats.totalCompletions}</span>
                            <span className="text-xs text-gray-400">total</span>
                          </div>
                          <div className="ml-auto flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full ${colors.bg} rounded-full`} style={{ width: `${stats.completionRate30}%` }} />
                            </div>
                            <span className={`text-xs font-semibold ${colors.text}`}>{stats.completionRate30}%</span>
                          </div>
                        </div>
                      </div>
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
    </div>
  );
}
