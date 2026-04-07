'use client';

import { useState, useEffect, useRef } from 'react';
import { format, subDays, differenceInDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Download, Sparkles, Flame, ChevronDown } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const DAILY_PROMPTS = [
  "What's one thing you're genuinely proud of today? Big or small.",
  "What drained your energy today — and how can you protect yourself from it tomorrow?",
  "Describe your mood in 3 words. What caused it?",
  "What would make tomorrow 10% better than today?",
  "Name someone who helped you recently. What did they do?",
  "What's one thing you've been avoiding that you know you should do?",
  "If today had a title, what would it be?",
  "What habit are you most happy you stuck to this week?",
  "What's a small win you almost forgot to appreciate?",
  "Write one thing you're grateful for that you usually take for granted.",
  "What did you learn today — about the world, yourself, or someone else?",
  "If your future self could leave you a note right now, what would it say?",
  "What's been on your mind that you haven't talked about yet?",
  "Describe your perfect tomorrow. What would it look like?",
];

const MOOD_OPTIONS = [
  { v: 1 as const, emoji: '😞', label: 'Rough',   color: '#dc2626', bg: '#fee2e2' },
  { v: 2 as const, emoji: '😕', label: 'Meh',     color: '#ea580c', bg: '#ffedd5' },
  { v: 3 as const, emoji: '😐', label: 'Okay',    color: '#ca8a04', bg: '#fef9c3' },
  { v: 4 as const, emoji: '😊', label: 'Good',    color: '#16a34a', bg: '#dcfce7' },
  { v: 5 as const, emoji: '🤩', label: 'Amazing', color: '#7c3aed', bg: '#f5f3ff' },
];

function getJournalStreak(notes: { date: string }[]): number {
  const today = format(new Date(), 'yyyy-MM-dd');
  const dates = new Set(notes.map(n => n.date));
  let streak = 0;
  const startOffset = dates.has(today) ? 0 : 1;
  let i = 0;
  while (true) {
    const date = format(subDays(new Date(), startOffset + i), 'yyyy-MM-dd');
    if (!dates.has(date)) break;
    streak++;
    i++;
  }
  return streak;
}

function MoodDot({ mood }: { mood: number }) {
  const m = MOOD_OPTIONS.find(o => o.v === mood);
  if (!m) return <span className="text-base">😐</span>;
  return <span className="text-lg">{m.emoji}</span>;
}

export default function JournalPage() {
  const { data, loaded, addNote } = useApp();
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayNote = data.notes.find(n => n.date === today);

  const [mood, setMood] = useState<1|2|3|4|5>(todayNote?.mood ?? 3);
  const [content, setContent] = useState(todayNote?.content ?? '');
  const [autoSaved, setAutoSaved] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [moodFilter, setMoodFilter] = useState<number | null>(null);
  const [showPrompt, setShowPrompt] = useState(!todayNote?.content);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync when todayNote loads/changes
  useEffect(() => {
    if (todayNote) {
      setMood(todayNote.mood);
      setContent(todayNote.content);
    }
  }, [todayNote?.mood, todayNote?.content]);

  // Auto-save 1.5s after user stops typing
  useEffect(() => {
    if (!content && !mood) return;
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      addNote({ date: today, mood, content: content.trim() });
      setAutoSaved(true);
      setTimeout(() => setAutoSaved(false), 2000);
    }, 1500);
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current); };
  }, [content, mood]);

  const journalStreak = getJournalStreak(data.notes);

  // Daily prompt — rotates by day of year
  const dayOfYear = differenceInDays(new Date(), new Date(new Date().getFullYear(), 0, 0));
  const todayPrompt = DAILY_PROMPTS[dayOfYear % DAILY_PROMPTS.length];

  // Memory snippet — what user wrote 7 days ago
  const weekAgoDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');
  const weekAgoNote = data.notes.find(n => n.date === weekAgoDate);

  // 30 days ago memory
  const monthAgoDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
  const monthAgoNote = data.notes.find(n => n.date === monthAgoDate);

  const pastNotes = data.notes
    .filter(n => n.date !== today)
    .sort((a, b) => b.date.localeCompare(a.date));
  const filteredNotes = moodFilter !== null ? pastNotes.filter(n => n.mood === moodFilter) : pastNotes;
  const recentNotes = showAll ? filteredNotes : filteredNotes.slice(0, 7);

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
    const note = data.notes.find(n => n.date === date);
    return { date, label: format(subDays(new Date(), 6 - i), 'EEE'), mood: note?.mood };
  });

  const selectedMoodObj = MOOD_OPTIONS.find(o => o.v === mood)!;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  if (!loaded) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-2xl">

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-violet-500" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Journal</h1>
            {journalStreak >= 2 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-bold"
                style={{ background: journalStreak >= 7 ? 'linear-gradient(135deg,#f97316,#ef4444)' : '#FEF3C7', color: journalStreak >= 7 ? 'white' : '#D97706' }}
              >
                <Flame size={12} /> {journalStreak}d streak
              </motion.span>
            )}
          </div>
          {data.notes.length > 0 && (
            <button
              onClick={() => {
                const MOOD_LABELS: Record<number, string> = { 1: 'Rough 😞', 2: 'Meh 😕', 3: 'Okay 😐', 4: 'Good 😊', 5: 'Amazing 🤩' };
                const sorted = [...data.notes].sort((a, b) => b.date.localeCompare(a.date));
                const text = ['# Streak Journal', `Exported: ${format(new Date(), 'MMMM d, yyyy')}`, `${sorted.length} entries`, '', '---', '',
                  ...sorted.flatMap(n => [`## ${format(new Date(n.date + 'T12:00:00'), 'EEEE, MMMM d, yyyy')}`, `Mood: ${MOOD_LABELS[n.mood] ?? n.mood}`, '', n.content || '_No reflection written._', '', '---', '']),
                ].join('\n');
                const blob = new Blob([text], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `streak-journal-${format(new Date(), 'yyyy-MM-dd')}.md`; a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all"
              style={{ background: '#F5F3FF', color: '#7C3AED', border: '1.5px solid #DDD6FE' }}
            >
              <Download size={13} /> Export
            </button>
          )}
        </div>
        <p className="text-gray-400 text-sm">Reflect daily. Build self-awareness.</p>
      </div>

      {/* 7-day mood strip */}
      <div className="bg-white rounded-2xl p-5 mb-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider">This week</p>
          {journalStreak >= 1 && (
            <span className="text-[11px] font-semibold text-slate-400">{data.notes.length} total entries</span>
          )}
        </div>
        <div className="flex items-end gap-2">
          {last7.map(day => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
              {day.mood ? <MoodDot mood={day.mood} /> : <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-200" />}
              <span className="text-[10px] text-gray-400 font-medium">{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Memory snippets */}
      <AnimatePresence>
        {(weekAgoNote?.content || monthAgoNote?.content) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 space-y-2"
          >
            {weekAgoNote?.content && (
              <div
                className="rounded-2xl p-4 flex gap-3 items-start"
                style={{ background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', border: '1px solid #ddd6fe' }}
              >
                <span className="text-xl flex-shrink-0">🧠</span>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-violet-500 uppercase tracking-wide mb-1">7 days ago you wrote</p>
                  <p className="text-[13px] text-slate-700 leading-relaxed line-clamp-2">"{weekAgoNote.content}"</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    You felt {MOOD_OPTIONS.find(m => m.v === weekAgoNote.mood)?.emoji} {MOOD_OPTIONS.find(m => m.v === weekAgoNote.mood)?.label}
                  </p>
                </div>
              </div>
            )}
            {monthAgoNote?.content && (
              <div
                className="rounded-2xl p-4 flex gap-3 items-start"
                style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '1px solid #bbf7d0' }}
              >
                <span className="text-xl flex-shrink-0">📅</span>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide mb-1">30 days ago you wrote</p>
                  <p className="text-[13px] text-slate-700 leading-relaxed line-clamp-2">"{monthAgoNote.content}"</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    You felt {MOOD_OPTIONS.find(m => m.v === monthAgoNote.mood)?.emoji} {MOOD_OPTIONS.find(m => m.v === monthAgoNote.mood)?.label}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Today's entry */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl overflow-hidden mb-6"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9' }}
      >
        <div className="h-1.5 transition-colors duration-300" style={{ background: selectedMoodObj.color }} />

        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-900">Today's Entry</h2>
              <p className="text-[12px] text-slate-400">{format(new Date(), 'EEEE, MMMM d')}</p>
            </div>
            <div className="flex items-center gap-2">
              {autoSaved && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: '#dcfce7', color: '#16a34a' }}
                >
                  ✓ Saved
                </motion.span>
              )}
              {todayNote && !autoSaved && (
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: '#f1f5f9', color: '#94a3b8' }}>
                  Saved
                </span>
              )}
            </div>
          </div>

          {/* Mood picker */}
          <div className="mb-4">
            <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide mb-2.5">How are you feeling?</p>
            <div className="flex gap-2">
              {MOOD_OPTIONS.map(m => (
                <button
                  key={m.v}
                  onClick={() => setMood(m.v)}
                  className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all duration-150"
                  style={{
                    background: mood === m.v ? m.bg : '#f8fafc',
                    border: mood === m.v ? `2px solid ${m.color}40` : '2px solid transparent',
                    transform: mood === m.v ? 'scale(1.08)' : 'scale(1)',
                  }}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-[10px] font-semibold" style={{ color: mood === m.v ? m.color : '#94a3b8' }}>
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Daily prompt */}
          <AnimatePresence>
            {showPrompt && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 overflow-hidden"
              >
                <button
                  onClick={() => {
                    setContent(prev => prev ? prev : '');
                    setShowPrompt(false);
                  }}
                  className="w-full text-left rounded-xl px-4 py-3 group transition-all"
                  style={{ background: 'linear-gradient(135deg,#1e1b4b,#312e81)' }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Sparkles size={12} style={{ color: '#a78bfa' }} />
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#a78bfa' }}>Today's prompt</span>
                      </div>
                      <p className="text-white text-[13px] font-medium leading-snug">{todayPrompt}</p>
                    </div>
                    <span className="text-[11px] text-indigo-400 flex-shrink-0 mt-0.5 group-hover:text-white transition-colors">use →</span>
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reflection textarea */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Reflection</p>
              <div className="flex items-center gap-2">
                {wordCount > 0 && (
                  <span className="text-[11px] text-slate-300">{wordCount} words</span>
                )}
                {!showPrompt && (
                  <button
                    onClick={() => setShowPrompt(true)}
                    className="text-[11px] font-semibold text-violet-400 hover:text-violet-600 transition-colors"
                  >
                    + prompt
                  </button>
                )}
              </div>
            </div>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={`${todayPrompt}\n\nOr write anything on your mind...`}
              rows={5}
              className="w-full px-4 py-3 rounded-xl border text-[14px] text-slate-700 placeholder-slate-300 resize-none outline-none transition-all"
              style={{ borderColor: '#e2e8f0', lineHeight: '1.7' }}
              onFocus={e => { e.target.style.borderColor = selectedMoodObj.color; e.target.style.boxShadow = `0 0 0 3px ${selectedMoodObj.color}15`; setShowPrompt(false); }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          <p className="text-[11px] text-slate-300 text-center">Auto-saves as you type ✦</p>
        </div>
      </motion.div>

      {/* Past entries */}
      {pastNotes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Past Entries <span className="text-slate-400 font-normal text-sm">({pastNotes.length})</span></h2>
          </div>
          <div className="flex gap-2 mb-3 flex-wrap">
            <button
              onClick={() => setMoodFilter(null)}
              className="px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all"
              style={{ background: moodFilter === null ? '#7C3AED' : '#F4F3FF', color: moodFilter === null ? 'white' : '#7C3AED' }}
            >All</button>
            {MOOD_OPTIONS.map(m => (
              <button
                key={m.v}
                onClick={() => setMoodFilter(moodFilter === m.v ? null : m.v)}
                className="px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all flex items-center gap-1"
                style={{
                  background: moodFilter === m.v ? m.color : '#F8FAFC',
                  color: moodFilter === m.v ? 'white' : '#64748B',
                  border: `1.5px solid ${moodFilter === m.v ? m.color : 'transparent'}`,
                }}
              >
                {m.emoji} {m.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {recentNotes.map((note, i) => {
                const m = MOOD_OPTIONS.find(o => o.v === note.mood)!;
                const daysAgo = differenceInDays(new Date(), new Date(note.date + 'T12:00:00'));
                return (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-white rounded-2xl p-4"
                    style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: m.bg }}>
                        {m.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[13px] font-semibold text-slate-700">
                            {format(new Date(note.date + 'T12:00:00'), 'EEE, MMM d')}
                          </p>
                          <span className="text-[11px] text-slate-400">
                            {daysAgo === 1 ? 'Yesterday' : daysAgo === 7 ? '1 week ago' : daysAgo === 30 ? '1 month ago' : `${daysAgo}d ago`}
                          </span>
                        </div>
                        {note.content ? (
                          <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-2">{note.content}</p>
                        ) : (
                          <p className="text-[12px] text-slate-300 italic">No reflection written</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {filteredNotes.length === 0 && moodFilter !== null && (
            <p className="text-center text-slate-400 text-[13px] py-6">No entries with this mood yet</p>
          )}
          {filteredNotes.length > 7 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full mt-3 py-3 rounded-xl text-[13px] font-semibold text-slate-500 bg-white border border-gray-100 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              {showAll ? 'Show less' : `Show ${filteredNotes.length - 7} more`}
              <ChevronDown size={14} style={{ transform: showAll ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
          )}
        </div>
      )}

      {data.notes.length === 0 && (
        <div className="text-center py-10">
          <p className="text-4xl mb-3">📖</p>
          <p className="text-slate-500 font-semibold">Your journal is empty</p>
          <p className="text-sm text-slate-400 mt-1">Start writing above — it auto-saves as you go</p>
        </div>
      )}

      {/* Bottom padding for mobile nav */}
      <div className="h-6" />
    </div>
  );
}
