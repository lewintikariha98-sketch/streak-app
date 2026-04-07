'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, CheckCircle2, Circle, Zap, ArrowRight, Wallet, X, Clock } from 'lucide-react';
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { getHabitStats, getTotalXP, getLevel } from '@/lib/stats';
import { colorMap } from '@/lib/colors';
import HabitModal from '@/components/habits/HabitModal';
import { Expense, ExpenseCategory } from '@/types';

const MOODS = [
  { v: 1 as const, emoji: '😞', label: 'Rough' },
  { v: 2 as const, emoji: '😕', label: 'Meh' },
  { v: 3 as const, emoji: '😐', label: 'Okay' },
  { v: 4 as const, emoji: '😊', label: 'Good' },
  { v: 5 as const, emoji: '🤩', label: 'Amazing' },
];

const EXPENSE_CATS: { value: ExpenseCategory; label: string; icon: string }[] = [
  { value: 'food', label: 'Food', icon: '🍜' },
  { value: 'transport', label: 'Transport', icon: '🚗' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'health', label: 'Health', icon: '💊' },
  { value: 'entertainment', label: 'Fun', icon: '🎮' },
  { value: 'bills', label: 'Bills', icon: '📄' },
  { value: 'other', label: 'Other', icon: '💸' },
];

/** Floating +XP chip that flies upward and fades */
function XPPop({ xp, onDone }: { xp: number; onDone: () => void }) {
  return (
    <motion.div
      className="pointer-events-none absolute right-3 top-1 z-20 text-[12px] font-black rounded-full px-2.5 py-1"
      style={{ background: 'linear-gradient(135deg,#6366f1,#a78bfa)', color: 'white', boxShadow: '0 2px 12px rgba(99,102,241,0.5)' }}
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -40, scale: 1.1 }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={onDone}
    >
      +{xp} XP ⚡
    </motion.div>
  );
}

/** Ring showing today's completion % */
function ProgressRing({ pct, done, total }: { pct: number; done: number; total: number }) {
  const size = 120;
  const strokeW = 10;
  const r = (size - strokeW) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const perfect = pct === 100 && total > 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#f1f5f9" strokeWidth={strokeW} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={perfect ? 'url(#ringGold)' : 'url(#ringGreen)'}
          strokeWidth={strokeW} fill="none" strokeLinecap="round"
          strokeDasharray={`${circ}`} strokeDashoffset={`${offset}`}
          style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)' }}
        />
        <defs>
          <linearGradient id="ringGreen" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id="ringGold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {perfect ? (
          <motion.span
            key="party"
            initial={{ scale: 0.2, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="text-[38px]"
          >🎉</motion.span>
        ) : (
          <>
            <span className="text-[24px] font-black text-slate-900 leading-none">{pct}%</span>
            <span className="text-[10px] text-slate-400">{done}/{total}</span>
          </>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data, loaded, toggleCompletion, addHabit, addExpense, deleteExpense, updateDailyBudget, addNote, updateUserName } = useApp();
  const { pushToast, triggerConfetti } = useNotifications();
  const [modalOpen, setModalOpen] = useState(false);
  const [showSpend, setShowSpend] = useState(false);
  const [spendAmount, setSpendAmount] = useState('');
  const [spendCat, setSpendCat] = useState<ExpenseCategory>('food');
  const [xpPops, setXpPops] = useState<{ id: string; xp: number; habitId: string }[]>([]);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  if (!loaded) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const today = format(new Date(), 'yyyy-MM-dd');
  const displayName = data.userName && data.userName !== 'You' ? data.userName : null;
  const activeHabits = data.habits.filter(h => !h.archived);
  const done = activeHabits.filter(h => h.completions[today]).length;
  const total = activeHabits.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const perfect = done === total && total > 0;

  const xp = getTotalXP(activeHabits);
  const { level, title, current, required } = getLevel(xp);
  const xpPct = required > 0 ? Math.round((current / required) * 100) : 0;

  const todayNote = data.notes.find(n => n.date === today);
  const totalStreak = activeHabits.reduce((a, h) => a + getHabitStats(h).currentStreak, 0);

  const todayExpenses = data.expenses.filter(e => e.date === today);
  const todaySpend = todayExpenses.reduce((s, e) => s + e.amount, 0);
  const overBudget = todaySpend > data.dailyBudget;

  const greeting = new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening';

  // Urgency: hours left today
  const hoursLeft = 24 - new Date().getHours();
  const isUrgent = hoursLeft <= 4 && done < total && total > 0;
  const isMidUrgent = hoursLeft <= 8 && hoursLeft > 4 && done < total && total > 0;

  const handleCheck = (habitId: string) => {
    const habit = activeHabits.find(h => h.id === habitId)!;
    const wasUnchecked = !habit.completions[today];
    toggleCompletion(habitId, today);
    if (wasUnchecked) {
      const stats = getHabitStats(habit);
      const earnedXP = 10 + Math.min(stats.currentStreak, 20);
      setXpPops(prev => [...prev, { id: Math.random().toString(36), xp: earnedXP, habitId }]);
      // After this toggle, check if now all done
      const willBePerfect = activeHabits.filter(h => h.id === habitId ? true : !!h.completions[today]).length === activeHabits.length;
      if (willBePerfect) {
        setTimeout(() => triggerConfetti(), 300);
      }
    }
  };

  const handleSaveMood = (mood: 1 | 2 | 3 | 4 | 5) => {
    addNote({ date: today, mood, content: todayNote?.content ?? '' });
  };

  const addQuickExpense = () => {
    const n = parseFloat(spendAmount);
    if (!n || n <= 0) return;
    addExpense({ date: today, amount: n, category: spendCat });
    setSpendAmount('');
    setShowSpend(false);
  };

  return (
    <div className="px-4 sm:px-6 pt-6 pb-2 max-w-xl mx-auto lg:max-w-2xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: '#7C3AED' }}>
            {greeting} 👋
          </p>
          {editingName ? (
            <input
              autoFocus
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onBlur={() => { const n = nameInput.trim(); if (n) updateUserName(n); setEditingName(false); }}
              onKeyDown={e => { if (e.key === 'Enter') { const n = nameInput.trim(); if (n) updateUserName(n); setEditingName(false); } }}
              placeholder="Your name..."
              className="text-[22px] font-black text-slate-900 tracking-tight mt-0.5 bg-transparent border-b-2 outline-none w-40"
              style={{ borderColor: '#7C3AED' }}
            />
          ) : (
            <button
              onClick={() => { setNameInput(data.userName === 'You' ? '' : data.userName); setEditingName(true); }}
              className="flex items-center gap-1.5 mt-0.5 group"
            >
              <h1 className="text-[22px] font-black text-slate-900 tracking-tight">
                {perfect ? '🎉 Perfect!' : displayName ? `Hey, ${displayName}` : 'Today'}
              </h1>
              {!displayName && (
                <span className="text-[11px] text-violet-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">set name</span>
              )}
            </button>
          )}
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setModalOpen(true)}
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg"
          style={{ background: 'linear-gradient(135deg,#7C3AED,#4f46e5)', boxShadow: '0 4px 14px rgba(124,58,237,0.4)' }}
        >
          <Plus size={20} />
        </motion.button>
      </div>

      {/* Urgency banner */}
      <AnimatePresence>
        {(isUrgent || isMidUrgent) && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="mb-4 rounded-2xl overflow-hidden"
            style={{
              background: isUrgent ? 'linear-gradient(135deg,#7f1d1d,#991b1b)' : 'linear-gradient(135deg,#78350f,#92400e)',
              border: `1px solid ${isUrgent ? '#ef4444' : '#f59e0b'}30`,
            }}
          >
            <div className="flex items-center gap-3 px-4 py-3">
              <motion.span
                animate={isUrgent ? { scale: [1, 1.2, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-xl flex-shrink-0"
              >
                {isUrgent ? '⚠️' : '⏰'}
              </motion.span>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-[13px]">
                  {isUrgent ? `${total - done} habits left — only ${hoursLeft}h remaining!` : `${total - done} habits left today`}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: isUrgent ? '#fca5a5' : '#fde68a' }}>
                  {isUrgent ? "Don't break your streak now — you're so close!" : `Complete before midnight to keep your streak 🔥`}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Clock size={12} style={{ color: isUrgent ? '#fca5a5' : '#fde68a' }} />
                <span className="text-[12px] font-bold" style={{ color: isUrgent ? '#fca5a5' : '#fde68a' }}>{hoursLeft}h</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress card */}
      <div
        className="bg-white rounded-3xl p-5 mb-4 relative overflow-hidden"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.04)' }}
      >
        {perfect && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(251,191,36,0.08) 0%, transparent 70%)' }}
          />
        )}
        <div className="flex items-center gap-5">
          <ProgressRing pct={pct} done={done} total={total} />
          <div className="flex-1 min-w-0">
            {/* Stats */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1">
                <span className="text-base">{totalStreak >= 7 ? '🔥' : '⚡'}</span>
                <span className="text-[15px] font-black text-slate-900">{totalStreak}d</span>
                <span className="text-[11px] text-slate-400">streak</span>
              </div>
              <div className="w-px h-4 bg-slate-200" />
              <div className="flex items-center gap-1">
                <Zap size={12} className="text-violet-500" />
                <span className="text-[15px] font-black text-violet-600">{xp.toLocaleString()}</span>
                <span className="text-[11px] text-slate-400">XP</span>
              </div>
            </div>

            {/* Level bar */}
            <div className="mb-3">
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-slate-500 font-semibold">Lv.{level} {title}</span>
                <span className="text-violet-500 font-semibold">{required - current} XP to go</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPct}%` }}
                  transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg,#6366f1,#a78bfa)' }}
                />
              </div>
            </div>

            {/* Mood */}
            {!todayNote?.mood ? (
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">How are you feeling?</p>
                <div className="flex gap-1.5">
                  {MOODS.map(m => (
                    <motion.button
                      key={m.v}
                      whileTap={{ scale: 1.4 }}
                      onClick={() => handleSaveMood(m.v)}
                      className="text-[22px] leading-none"
                    >
                      {m.emoji}
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xl">{MOODS.find(m => m.v === todayNote.mood)?.emoji}</span>
                <span className="text-[12px] text-slate-500 font-medium">{MOODS.find(m => m.v === todayNote.mood)?.label} today</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── HABITS ─────────────────────────────────── */}
      {activeHabits.length === 0 ? (
        /* Empty state */
        <div
          className="bg-white rounded-3xl p-8 text-center mb-4"
          style={{ border: '2px dashed #e2e8f0' }}
        >
          <div className="text-5xl mb-3">🌱</div>
          <p className="font-bold text-slate-700 text-[16px] mb-1">No habits yet</p>
          <p className="text-[13px] text-slate-400 mb-5">Build your first streak today</p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setModalOpen(true)}
            className="px-6 py-3 text-white text-[14px] font-bold rounded-2xl"
            style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}
          >
            Create a habit
          </motion.button>
          <div className="mt-3">
            <a href="/habits" className="text-[12px] text-indigo-500 font-semibold">Or pick from templates →</a>
          </div>
        </div>
      ) : perfect ? (
        /* Perfect day celebration */
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 text-center mb-4"
          style={{ border: '2px solid rgba(251,191,36,0.3)', boxShadow: '0 4px 24px rgba(251,146,60,0.12)' }}
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-6xl mb-3"
          >🏆</motion.div>
          <p className="text-[22px] font-black text-slate-900 mb-1">All done!</p>
          <p className="text-[14px] text-slate-500 mb-1">{total} of {total} habits complete</p>
          <p className="text-[13px] text-amber-600 font-semibold mb-5">
            🔥 {Math.max(...activeHabits.map(h => getHabitStats(h).currentStreak))} day best streak
          </p>
          <a href="/garden">
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3 text-white font-bold text-[14px] rounded-2xl"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)' }}
            >
              See Pet 🐾 <ArrowRight size={16} />
            </motion.div>
          </a>
          {/* Tap any habit to uncheck */}
          <div className="mt-5 space-y-1">
            {activeHabits.map(h => {
              const colors = colorMap[h.color];
              return (
                <motion.button
                  key={h.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => toggleCompletion(h.id, today)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl"
                  style={{ background: `${colors.hex}12` }}
                >
                  <CheckCircle2 size={16} style={{ color: colors.hex }} />
                  <span className="text-[12px] font-medium text-slate-600 truncate">{h.name}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      ) : (
        /* Habit list */
        <div
          className="bg-white rounded-3xl overflow-hidden mb-4"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.04)' }}
        >
          {/* Section header */}
          <div className="px-4 pt-4 pb-3 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 text-[15px]">Habits</p>
              <p className="text-[11px] text-slate-400">{done} of {total} done today</p>
            </div>
            <a href="/habits" className="text-[12px] font-semibold text-indigo-500 py-1 px-1">Manage</a>
          </div>

          <div className="divide-y divide-slate-50">
            {activeHabits.map((habit, i) => {
              const isDone = !!habit.completions[today];
              const stats = getHabitStats(habit);
              const colors = colorMap[habit.color];
              const onFire = stats.currentStreak >= 7;
              const atRisk = stats.currentStreak > 0 && !isDone;
              return (
                <div key={habit.id} className="relative">
                  {/* XP pops for this specific habit */}
                  <AnimatePresence>
                    {xpPops.filter(p => p.habitId === habit.id).map(pop => (
                      <XPPop key={pop.id} xp={pop.xp} onDone={() => setXpPops(p => p.filter(x => x.id !== pop.id))} />
                    ))}
                  </AnimatePresence>

                  <motion.button
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileTap={{ scale: 0.985, backgroundColor: '#f8fafc' }}
                    onClick={() => handleCheck(habit.id)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    {/* Check icon */}
                    <motion.div
                      animate={{ scale: isDone ? [1, 1.3, 1] : 1 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                      style={{ color: isDone ? colors.hex : '#d1d5db', flexShrink: 0 }}
                    >
                      {isDone ? <CheckCircle2 size={26} /> : <Circle size={26} />}
                    </motion.div>

                    {/* Icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-[18px] flex-shrink-0"
                      style={{
                        background: isDone ? colors.hex : colors.hexLight,
                        boxShadow: onFire ? `0 0 0 2px ${colors.hex}50` : undefined,
                        transition: 'background 0.25s ease',
                      }}
                    >
                      <span style={{ filter: isDone ? 'brightness(10)' : undefined }}>{habit.icon}</span>
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[14px] font-semibold leading-tight"
                        style={{
                          color: isDone ? '#94a3b8' : '#1e293b',
                          textDecoration: isDone ? 'line-through' : 'none',
                        }}
                      >
                        {habit.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {stats.currentStreak >= 7 ? (
                          <span className="text-[11px] font-bold text-orange-500">🔥🔥 {stats.currentStreak}d streak</span>
                        ) : stats.currentStreak >= 3 ? (
                          <span className="text-[11px] text-orange-400">🔥 {stats.currentStreak}d streak</span>
                        ) : stats.currentStreak >= 1 ? (
                          <span className="text-[11px] text-slate-400">{stats.currentStreak}d streak</span>
                        ) : (
                          <span className="text-[11px] text-slate-300">Start your streak</span>
                        )}
                        {atRisk && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full" style={{ background: '#FEF3C7', color: '#D97706' }}>
                            at risk ⚠️
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Rate badge */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                      style={{
                        background: isDone ? colors.hex : colors.hexLight,
                        color: isDone ? 'white' : colors.hex,
                        transition: 'all 0.25s ease',
                      }}
                    >
                      {stats.completionRate30}%
                    </div>
                  </motion.button>
                </div>
              );
            })}
          </div>

          {/* Remaining count banner */}
          {done < total && (
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}
            >
              <span className="text-[12px] text-slate-500">{total - done} remaining today</span>
              <div className="flex gap-0.5">
                {activeHabits.map(h => (
                  <div
                    key={h.id}
                    className="w-5 h-1.5 rounded-full transition-all duration-300"
                    style={{ background: h.completions[today] ? colorMap[h.color].hex : '#e2e8f0' }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Spend quick-add */}
      <div
        className="bg-white rounded-3xl overflow-hidden mb-4"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.04)' }}
      >
        <motion.button
          whileTap={{ scale: 0.99 }}
          onClick={() => setShowSpend(!showSpend)}
          className="w-full flex items-center justify-between px-4 py-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#f0fdf4' }}>
              <Wallet size={16} style={{ color: '#059669' }} />
            </div>
            <div className="text-left">
              <p className="text-[13px] font-bold text-slate-800">Spending</p>
              <p className="text-[11px]" style={{ color: overBudget ? '#dc2626' : '#64748b' }}>
                ${todaySpend.toFixed(0)} of ${data.dailyBudget} {overBudget ? '· over budget ⚠️' : ''}
              </p>
            </div>
          </div>
          <span className="text-[12px] text-slate-400">{showSpend ? '▲' : '▼'}</span>
        </motion.button>

        <AnimatePresence>
          {showSpend && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {/* Budget bar */}
              <div className="px-4 pb-2">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((todaySpend / data.dailyBudget) * 100, 100)}%`,
                      background: overBudget ? '#dc2626' : '#059669',
                    }}
                  />
                </div>
              </div>
              {/* Add expense */}
              <div className="px-4 pb-4 flex gap-2" style={{ borderTop: '1px solid #f8fafc', paddingTop: 12 }}>
                <div className="flex items-center gap-1 bg-slate-50 rounded-xl px-3 py-3 flex-1">
                  <span className="text-sm text-slate-400">$</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={spendAmount}
                    onChange={e => setSpendAmount(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addQuickExpense()}
                    placeholder="Amount"
                    className="flex-1 bg-transparent text-[14px] font-semibold text-slate-800 outline-none placeholder-slate-300 w-0"
                  />
                </div>
                <select
                  value={spendCat}
                  onChange={e => setSpendCat(e.target.value as ExpenseCategory)}
                  className="bg-slate-50 rounded-xl px-2 py-3 text-[12px] text-slate-600 outline-none border-0"
                >
                  {EXPENSE_CATS.map(c => <option key={c.value} value={c.value}>{c.icon}</option>)}
                </select>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={addQuickExpense}
                  disabled={!spendAmount || parseFloat(spendAmount) <= 0}
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white disabled:opacity-40"
                  style={{ background: '#059669' }}
                >
                  <Plus size={16} />
                </motion.button>
              </div>
              {/* Recent expenses */}
              {todayExpenses.length > 0 && (
                <div className="divide-y divide-slate-50">
                  {todayExpenses.slice(-3).reverse().map(exp => {
                    const cat = EXPENSE_CATS.find(c => c.value === exp.category);
                    return (
                      <div key={exp.id} className="flex items-center gap-3 px-4 py-2.5">
                        <span className="text-lg">{cat?.icon}</span>
                        <span className="flex-1 text-[13px] text-slate-600 truncate">{exp.note || cat?.label}</span>
                        <span className="font-bold text-[13px] text-slate-800">${exp.amount.toFixed(0)}</span>
                        <motion.button whileTap={{ scale: 0.85 }} onClick={() => deleteExpense(exp.id)} className="text-slate-300 hover:text-red-400 p-1">
                          <X size={13} />
                        </motion.button>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Journal quick-entry CTA — only if not yet journaled today */}
      {!todayNote?.content && (
        <motion.a
          href="/journal"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="block rounded-3xl overflow-hidden mb-4"
          style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)', boxShadow: '0 4px 20px rgba(99,102,241,0.2)' }}
        >
          <div className="px-5 py-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: 'rgba(167,139,250,0.15)' }}>
              📖
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-[14px] leading-tight">Write today's reflection</p>
              <p className="text-[12px] mt-0.5" style={{ color: 'rgba(167,139,250,0.7)' }}>Journal not done yet — takes 1 min</p>
            </div>
            <ArrowRight size={16} style={{ color: 'rgba(167,139,250,0.6)', flexShrink: 0 }} />
          </div>
        </motion.a>
      )}

      {/* Version badge */}
      <div className="flex justify-center pb-6">
        <span className="text-[11px] font-semibold px-3 py-1 rounded-full" style={{ background: 'rgba(124,58,237,0.08)', color: 'rgba(124,58,237,0.5)' }}>
          Streak v30
        </span>
      </div>

      <HabitModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={addHabit} />
    </div>
  );
}
