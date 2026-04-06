'use client';

import { useState } from 'react';
import { format, subDays } from 'date-fns';
import {
  Plus, Flame, CheckCircle2, Circle, TrendingUp, TrendingDown,
  Zap, ArrowUpRight, Wallet, X, Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { getHabitStats, getLast7Days, getWeeklyData, getTotalXP, getLevel } from '@/lib/stats';
import { colorMap } from '@/lib/colors';
import HabitModal from '@/components/habits/HabitModal';
import { AreaChart, Area, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Expense, ExpenseCategory } from '@/types';

const EXPENSE_CATS: { value: ExpenseCategory; label: string; icon: string }[] = [
  { value: 'food', label: 'Food', icon: '🍜' },
  { value: 'transport', label: 'Transport', icon: '🚗' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'health', label: 'Health', icon: '💊' },
  { value: 'entertainment', label: 'Fun', icon: '🎮' },
  { value: 'bills', label: 'Bills', icon: '📄' },
  { value: 'other', label: 'Other', icon: '💸' },
];

const MOODS = [
  { v: 1 as const, emoji: '😞', label: 'Rough', color: '#dc2626' },
  { v: 2 as const, emoji: '😕', label: 'Meh', color: '#ea580c' },
  { v: 3 as const, emoji: '😐', label: 'Okay', color: '#ca8a04' },
  { v: 4 as const, emoji: '😊', label: 'Good', color: '#16a34a' },
  { v: 5 as const, emoji: '🤩', label: 'Amazing', color: '#7c3aed' },
];

function ProgressRing({ pct, done, total }: { pct: number; done: number; total: number }) {
  const size = 140;
  const strokeW = 11;
  const r = (size - strokeW) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const isComplete = pct === 100 && total > 0;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#f1f5f9" strokeWidth={strokeW} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={`url(#ringGrad${isComplete ? 'Gold' : 'Green'})`}
          strokeWidth={strokeW} fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circ}`}
          strokeDashoffset={`${offset}`}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
        />
        <defs>
          <linearGradient id="ringGradGreen" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <linearGradient id="ringGradGold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {isComplete ? (
          <span className="text-3xl">🎉</span>
        ) : (
          <>
            <span className="text-[28px] font-black text-slate-900 leading-none">{pct}%</span>
            <span className="text-[11px] text-slate-400 mt-0.5">{done}/{total}</span>
          </>
        )}
      </div>
    </div>
  );
}

function MoodWidget({ currentMood, onSave }: { currentMood?: number; onSave: (mood: 1 | 2 | 3 | 4 | 5) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const selected = MOODS.find(m => m.v === currentMood);

  if (selected) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-2xl">{selected.emoji}</span>
        <div>
          <p className="text-[13px] font-semibold text-slate-700">{selected.label}</p>
          <p className="text-[11px] text-slate-400">Today's mood</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-2">How are you feeling?</p>
      <div className="flex items-center gap-1.5">
        {MOODS.map(m => (
          <button
            key={m.v}
            onClick={() => onSave(m.v)}
            onMouseEnter={() => setHovered(m.v)}
            onMouseLeave={() => setHovered(null)}
            title={m.label}
            className="text-2xl transition-all duration-150"
            style={{ transform: hovered === m.v ? 'scale(1.35)' : 'scale(1)' }}
          >
            {m.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  label, value, sub, icon, trend, trendUp, accentColor,
}: {
  label: string; value: string; sub?: string; icon: React.ReactNode;
  trend?: string; trendUp?: boolean; accentColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${accentColor}18` }}>
          <span style={{ color: accentColor }}>{icon}</span>
        </div>
        {trend && (
          <span
            className="flex items-center gap-0.5 text-[11px] font-semibold px-2 py-1 rounded-lg"
            style={{ background: trendUp ? '#ecfdf5' : '#fff1f2', color: trendUp ? '#059669' : '#dc2626' }}
          >
            {trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {trend}
          </span>
        )}
      </div>
      <p className="text-[24px] font-black text-slate-900 tracking-tight leading-none">{value}</p>
      <p className="text-[11px] font-semibold text-slate-500 mt-1.5 uppercase tracking-wide">{label}</p>
      {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function AddExpenseRow({ onAdd }: { onAdd: (e: Omit<Expense, 'id' | 'createdAt'>) => void }) {
  const [amount, setAmount] = useState('');
  const [cat, setCat] = useState<ExpenseCategory>('food');
  const [note, setNote] = useState('');
  const today = format(new Date(), 'yyyy-MM-dd');

  const submit = () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) return;
    onAdd({ date: today, amount: num, category: cat, note: note.trim() || undefined });
    setAmount('');
    setNote('');
  };

  return (
    <div className="px-4 sm:px-5 py-3.5 space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-2" style={{ borderTop: '1px solid #f1f5f9' }}>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-slate-50 rounded-xl px-3 py-2.5 flex-shrink-0">
          <span className="text-sm">₹</span>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="0.00"
            className="w-20 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder-slate-300"
          />
        </div>
        <select
          value={cat}
          onChange={e => setCat(e.target.value as ExpenseCategory)}
          className="bg-slate-50 rounded-xl px-2 py-2.5 text-[12px] text-slate-600 outline-none border-0 flex-shrink-0"
        >
          {EXPENSE_CATS.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={note}
          onChange={e => setNote(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Note (optional)"
          className="flex-1 bg-slate-50 rounded-xl px-3 py-2.5 text-[12px] text-slate-600 outline-none placeholder-slate-400 min-w-0"
        />
        <button
          onClick={submit}
          disabled={!amount || parseFloat(amount) <= 0}
          className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white transition-opacity disabled:opacity-40"
          style={{ background: '#2563eb' }}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

function BudgetSetupModal({ onSave, initial }: { onSave: (n: number) => void; initial: number }) {
  const [val, setVal] = useState(String(initial === 50 ? '' : initial));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #2563eb, #60a5fa)' }} />
        <div className="p-6">
          <div className="text-3xl mb-3">💰</div>
          <h2 className="text-xl font-black text-slate-900 mb-1">Set your daily budget</h2>
          <p className="text-[13px] text-slate-500 mb-5">We'll track your spending against this limit each day.</p>
          <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-3 mb-4">
            <span className="text-xl font-bold text-slate-400">₹</span>
            <input
              type="number"
              value={val}
              onChange={e => setVal(e.target.value)}
              placeholder="e.g. 500"
              autoFocus
              className="flex-1 bg-transparent text-2xl font-black text-slate-900 outline-none placeholder-slate-300"
            />
            <span className="text-[12px] text-slate-400 font-medium">/day</span>
          </div>
          <div className="flex gap-2">
            {[200, 500, 1000, 2000].map(preset => (
              <button
                key={preset}
                onClick={() => setVal(String(preset))}
                className="flex-1 py-2 rounded-xl text-[12px] font-semibold border transition-all"
                style={{
                  background: val === String(preset) ? '#eff6ff' : 'white',
                  borderColor: val === String(preset) ? '#2563eb' : '#e2e8f0',
                  color: val === String(preset) ? '#2563eb' : '#64748b',
                }}
              >
                ₹{preset}
              </button>
            ))}
          </div>
          <button
            onClick={() => { const n = parseFloat(val); if (n > 0) onSave(n); }}
            disabled={!val || parseFloat(val) <= 0}
            className="w-full mt-4 py-3 rounded-xl text-white font-bold text-[14px] disabled:opacity-40 transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
          >
            Set budget & continue
          </button>
        </div>
      </div>
    </div>
  );
}

function StreakFire({ streak }: { streak: number }) {
  if (streak >= 14) return (
    <span className="flex items-center gap-0.5">
      <span className="text-[13px]">🔥🔥</span>
      <span className="text-[11px] font-bold text-orange-500">{streak}d</span>
    </span>
  );
  if (streak >= 7) return (
    <span className="flex items-center gap-0.5">
      <span className="text-[12px]">🔥</span>
      <span className="text-[11px] font-bold text-orange-500">{streak}d</span>
    </span>
  );
  if (streak >= 3) return (
    <span className="flex items-center gap-0.5">
      <Flame size={10} className="text-orange-400" />
      <span className="text-[11px] text-slate-400">{streak}d</span>
    </span>
  );
  if (streak >= 1) return (
    <span className="text-[11px] text-slate-400">{streak}d streak</span>
  );
  return <span className="text-[11px] text-slate-300">No streak</span>;
}

export default function Dashboard() {
  const { data, loaded, toggleCompletion, addHabit, addExpense, deleteExpense, updateDailyBudget, addNote } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);

  if (!loaded) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const budgetNotSet = data.dailyBudget === 50 && data.expenses.length === 0;

  const activeHabits = data.habits.filter(h => !h.archived);
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  const doneToday = activeHabits.filter(h => h.completions[today]).length;
  const doneYesterday = activeHabits.filter(h => h.completions[yesterday]).length;
  const total = activeHabits.length;
  const pctToday = total > 0 ? Math.round((doneToday / total) * 100) : 0;
  const pctYesterday = total > 0 ? Math.round((doneYesterday / total) * 100) : 0;
  const deltaCompletion = pctToday - pctYesterday;

  const days = getLast7Days();
  const weeklyData = getWeeklyData(activeHabits);
  const xp = getTotalXP(activeHabits);
  const { level, title, current, required } = getLevel(xp);
  const xpPct = required > 0 ? Math.round((current / required) * 100) : 0;
  const totalStreak = activeHabits.reduce((acc, h) => acc + getHabitStats(h).currentStreak, 0);

  const todayExpenses = data.expenses.filter(e => e.date === today);
  const todaySpend = todayExpenses.reduce((s, e) => s + e.amount, 0);
  const budgetLeft = data.dailyBudget - todaySpend;
  const overBudget = todaySpend > data.dailyBudget;

  const spendData = days.map(d => ({
    day: d.label,
    spend: data.expenses.filter(e => e.date === d.date).reduce((s, e) => s + e.amount, 0),
    isToday: d.isToday,
  }));

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const todayNote = data.notes.find(n => n.date === today);
  const handleSaveMood = (mood: 1 | 2 | 3 | 4 | 5) => {
    addNote({ date: today, mood, content: todayNote?.content ?? '' });
  };

  const perfectDay = doneToday === total && total > 0;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[13px] font-semibold text-blue-600 mb-0.5">{greeting} 👋</p>
          <h1 className="text-[22px] sm:text-[28px] font-black text-slate-900 tracking-tight leading-tight">
            {perfectDay ? 'Perfect day! 🎉' : 'Dashboard'}
          </h1>
          <p className="text-[12px] text-slate-400 mt-1">{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBudgetModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 min-h-[44px] rounded-xl text-[13px] font-semibold border transition-colors hover:bg-white"
            style={{ border: '1px solid #e2e8f0', color: '#475569', background: 'transparent' }}
          >
            <Wallet size={14} /> ₹{data.dailyBudget}
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 min-h-[44px] rounded-xl text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
          >
            <Plus size={15} /> <span className="hidden sm:inline">New habit</span><span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Hero: Progress Ring + Stats */}
      <div className="bg-white rounded-2xl p-5 mb-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9' }}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Ring */}
          <div className="flex flex-col items-center gap-4 sm:pr-6" style={{ borderRight: '0', }}>
            <ProgressRing pct={pctToday} done={doneToday} total={total} />
            <div className="text-center">
              <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">Today's Progress</p>
              {deltaCompletion !== 0 && (
                <span
                  className="inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full mt-1"
                  style={{ background: deltaCompletion >= 0 ? '#ecfdf5' : '#fff1f2', color: deltaCompletion >= 0 ? '#059669' : '#dc2626' }}
                >
                  {deltaCompletion >= 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                  {Math.abs(deltaCompletion)}% vs yesterday
                </span>
              )}
            </div>
          </div>

          {/* Vertical divider */}
          <div className="hidden sm:block w-px self-stretch bg-slate-100 mx-2" />

          {/* Stats grid + Mood */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Streak', value: `${totalStreak}d`, icon: '🔥', color: '#f97316' },
                { label: 'Level', value: `Lv.${level}`, icon: '⚡', color: '#7c3aed', sub: title },
                { label: 'XP', value: xp.toLocaleString(), icon: '✨', color: '#0891b2' },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: `${s.color}0d`, border: `1px solid ${s.color}20` }}>
                  <span className="text-lg">{s.icon}</span>
                  <p className="text-[18px] font-black mt-0.5" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{s.label}</p>
                  {s.sub && <p className="text-[10px] text-slate-400">{s.sub}</p>}
                </div>
              ))}
            </div>

            {/* XP bar */}
            <div className="mb-4">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                <span>Level {level} — {title}</span>
                <span>{current}/{required} XP</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPct}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #7c3aed, #a78bfa)' }}
                />
              </div>
            </div>

            {/* Mood */}
            <MoodWidget currentMood={todayNote?.mood} onSave={handleSaveMood} />
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard
          label="Today's spend"
          value={`₹${todaySpend.toFixed(0)}`}
          sub={overBudget ? `₹${Math.abs(budgetLeft).toFixed(0)} over budget` : `₹${budgetLeft.toFixed(0)} left`}
          icon={<Wallet size={18} />}
          trend={overBudget ? 'Over' : 'On track'}
          trendUp={!overBudget}
          accentColor="#0891b2"
        />
        <StatCard
          label="Habits done today"
          value={`${doneToday}/${total}`}
          sub={total === 0 ? 'Add habits to start' : perfectDay ? 'All done! 🎉' : `${total - doneToday} remaining`}
          icon={<CheckCircle2 size={18} />}
          accentColor="#059669"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Habits list */}
        <div className="lg:col-span-2 bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9' }}>
          <div className="px-4 sm:px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f8fafc' }}>
            <div>
              <h2 className="font-bold text-slate-900 text-[15px]">Today's habits</h2>
              <p className="text-[12px] text-slate-400">{format(new Date(), 'EEE, MMM d')}</p>
            </div>
            <a href="/habits" className="flex items-center gap-1 text-[12px] font-semibold text-blue-600 hover:text-blue-700 py-2 px-1">
              View all <ArrowUpRight size={13} />
            </a>
          </div>

          {activeHabits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl mb-3">✨</div>
              <p className="font-semibold text-slate-700 mb-1">No habits yet</p>
              <p className="text-[13px] text-slate-400 mb-4">Start building your routine</p>
              <button
                onClick={() => setModalOpen(true)}
                className="px-4 py-2 text-white text-[13px] font-semibold rounded-xl hover:opacity-90 transition-opacity"
                style={{ background: '#2563eb' }}
              >
                Create first habit
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              <AnimatePresence>
                {activeHabits.map((habit, i) => {
                  const done = !!habit.completions[today];
                  const stats = getHabitStats(habit);
                  const colors = colorMap[habit.color];
                  const isOnFire = stats.currentStreak >= 14;
                  return (
                    <motion.div
                      key={habit.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-3 px-4 sm:px-5 py-3.5 hover:bg-slate-50/70 transition-colors"
                    >
                      <button
                        onClick={() => toggleCompletion(habit.id, today)}
                        className="flex-shrink-0 transition-all duration-200 p-1 -m-1 active:scale-90"
                        style={{ color: done ? colors.hex : '#e2e8f0' }}
                      >
                        {done
                          ? <motion.span initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}><CheckCircle2 size={22} /></motion.span>
                          : <Circle size={22} />
                        }
                      </button>
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                        style={{
                          background: colors.hexLight,
                          boxShadow: isOnFire ? `0 0 0 2px ${colors.hex}40, 0 0 12px ${colors.hex}30` : undefined,
                        }}
                      >
                        {habit.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[14px] font-semibold ${done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {habit.name}
                        </p>
                        <div className="mt-0.5">
                          <StreakFire streak={stats.currentStreak} />
                        </div>
                      </div>
                      <div className="hidden sm:flex gap-0.5">
                        {days.map(d => (
                          <div key={d.date} className="w-1.5 h-5 rounded-full" style={{ background: habit.completions[d.date] ? colors.hex : '#f1f5f9' }} />
                        ))}
                      </div>
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                        style={{ background: done ? colors.hex : colors.hexLight, color: done ? 'white' : colors.hex }}
                      >
                        {stats.completionRate30}%
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Weekly chart */}
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9' }}>
            <h3 className="font-bold text-slate-900 text-[14px] mb-0.5">Weekly completion</h3>
            <p className="text-[11px] text-slate-400 mb-3">% of habits done per day</p>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={weeklyData} barSize={14}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0B1426', border: 'none', borderRadius: 10, fontSize: 11, color: 'white' }}
                  formatter={(v) => [`${v}%`, 'Done']}
                />
                <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                  {weeklyData.map((entry, i) => (
                    <Cell key={i} fill={entry.date === today ? '#2563eb' : '#dbeafe'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Spending chart */}
          <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9' }}>
            <h3 className="font-bold text-slate-900 text-[14px] mb-0.5">Daily spend</h3>
            <p className="text-[11px] text-slate-400 mb-3">Budget: ₹{data.dailyBudget}/day</p>
            <ResponsiveContainer width="100%" height={80}>
              <AreaChart data={spendData}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0891b2" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0B1426', border: 'none', borderRadius: 10, fontSize: 11, color: 'white' }}
                  formatter={(v) => [`₹${Number(v).toFixed(0)}`, 'Spend']}
                />
                <Area type="monotone" dataKey="spend" stroke="#0891b2" strokeWidth={2} fill="url(#spendGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Quick journal link */}
          <a
            href="/journal"
            className="block bg-white rounded-2xl p-4 hover:shadow-md transition-shadow group"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#f5f3ff' }}>
                  <Sparkles size={16} style={{ color: '#7c3aed' }} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-slate-800">Daily Journal</p>
                  <p className="text-[11px] text-slate-400">{todayNote ? `Mood logged · ${todayNote.content ? 'Note added' : 'Add a note'}` : 'Log your mood & thoughts'}</p>
                </div>
              </div>
              <ArrowUpRight size={14} className="text-slate-400 group-hover:text-violet-500 transition-colors" />
            </div>
          </a>
        </div>
      </div>

      {/* Spending card */}
      <div className="bg-white rounded-2xl overflow-hidden mb-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9' }}>
        <div className="px-4 sm:px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f8fafc' }}>
          <div>
            <h2 className="font-bold text-slate-900 text-[15px]">Today's spending</h2>
            <p className="text-[12px] text-slate-400">{format(new Date(), 'MMM d')} · ₹{todaySpend.toFixed(0)} of ₹{data.dailyBudget}</p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min((todaySpend / data.dailyBudget) * 100, 100)}%`,
                  background: overBudget ? '#dc2626' : '#0891b2',
                }}
              />
            </div>
            <span className={`text-[12px] font-semibold ${overBudget ? 'text-red-500' : 'text-cyan-600'}`}>
              {overBudget ? 'Over' : `${Math.round((todaySpend / data.dailyBudget) * 100)}%`}
            </span>
          </div>
        </div>
        <AddExpenseRow onAdd={addExpense} />
        {todayExpenses.length > 0 && (
          <div className="divide-y divide-slate-50">
            {todayExpenses.slice().reverse().map(expense => {
              const cat = EXPENSE_CATS.find(c => c.value === expense.category);
              return (
                <div key={expense.id} className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-slate-50/60 transition-colors group">
                  <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-base flex-shrink-0">
                    {cat?.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-700">{expense.note || cat?.label}</p>
                    <p className="text-[11px] text-slate-400">{cat?.label}</p>
                  </div>
                  <span className="font-bold text-[15px] text-slate-900">₹{expense.amount.toFixed(0)}</span>
                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-400 ml-1 p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
        {todayExpenses.length === 0 && (
          <div className="py-8 text-center text-[13px] text-slate-400">No expenses logged today — add one above</div>
        )}
      </div>

      {/* Habit breakdown table */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9' }}>
        <div className="px-4 sm:px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f8fafc' }}>
          <h2 className="font-bold text-slate-900 text-[15px]">Habit breakdown</h2>
          <a href="/analytics" className="flex items-center gap-1 text-[12px] font-semibold text-blue-600 hover:text-blue-700 py-2 px-1">
            Analytics <ArrowUpRight size={13} />
          </a>
        </div>
        {activeHabits.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-slate-400">No habits to show</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {activeHabits.map((habit, i) => {
              const stats = getHabitStats(habit);
              const colors = colorMap[habit.color];
              const done = !!habit.completions[today];
              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="px-4 sm:px-5 py-4 flex items-center gap-3 sm:gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: colors.hexLight }}>
                    {habit.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[14px] text-slate-800 truncate">{habit.name}</p>
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0"
                        style={{ background: done ? '#dcfce7' : '#f8fafc', color: done ? '#16a34a' : '#94a3b8' }}
                      >
                        {done ? '✓ Done' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${stats.completionRate30}%`, background: colors.hex }} />
                      </div>
                      <span className="text-[11px] font-semibold flex-shrink-0" style={{ color: colors.hex }}>{stats.completionRate30}%</span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-5 flex-shrink-0">
                    {[
                      { val: stats.currentStreak, lbl: 'streak' },
                      { val: stats.longestStreak, lbl: 'best' },
                      { val: stats.totalCompletions, lbl: 'total' },
                    ].map(s => (
                      <div key={s.lbl} className="text-center">
                        <p className="text-[16px] font-black text-slate-900">{s.val}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide">{s.lbl}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <HabitModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={addHabit} />

      {(budgetNotSet || budgetModalOpen) && (
        <BudgetSetupModal
          initial={data.dailyBudget}
          onSave={n => { updateDailyBudget(n); setBudgetModalOpen(false); }}
        />
      )}
    </div>
  );
}
