'use client';

import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, ChevronDown, BookOpen } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { DailyNote } from '@/types';

const MOOD_OPTIONS = [
  { v: 1 as const, emoji: '😞', label: 'Rough',   color: '#dc2626', bg: '#fee2e2' },
  { v: 2 as const, emoji: '😕', label: 'Meh',     color: '#ea580c', bg: '#ffedd5' },
  { v: 3 as const, emoji: '😐', label: 'Okay',    color: '#ca8a04', bg: '#fef9c3' },
  { v: 4 as const, emoji: '😊', label: 'Good',    color: '#16a34a', bg: '#dcfce7' },
  { v: 5 as const, emoji: '🤩', label: 'Amazing', color: '#7c3aed', bg: '#f5f3ff' },
];

function MoodDot({ mood }: { mood: number }) {
  const m = MOOD_OPTIONS.find(o => o.v === mood);
  if (!m) return <span className="text-base">😐</span>;
  return <span className="text-lg">{m.emoji}</span>;
}

export default function JournalPage() {
  const { data, loaded, addNote } = useApp();
  const today = format(new Date(), 'yyyy-MM-dd');

  const todayNote = data.notes.find(n => n.date === today);
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(todayNote?.mood ?? 3);
  const [content, setContent] = useState(todayNote?.content ?? '');
  const [saved, setSaved] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (todayNote) {
      setMood(todayNote.mood);
      setContent(todayNote.content);
    }
  }, [todayNote?.mood, todayNote?.content]);

  const handleSave = () => {
    addNote({ date: today, mood, content: content.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const pastNotes = data.notes
    .filter(n => n.date !== today)
    .sort((a, b) => b.date.localeCompare(a.date));

  const recentNotes = showAll ? pastNotes : pastNotes.slice(0, 7);

  // 7-day mood trend
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
    const note = data.notes.find(n => n.date === date);
    return { date, label: format(subDays(new Date(), 6 - i), 'EEE'), mood: note?.mood };
  });

  if (!loaded) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  const selectedMoodObj = MOOD_OPTIONS.find(o => o.v === mood)!;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={20} className="text-violet-500" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Journal</h1>
        </div>
        <p className="text-gray-400 text-sm">Daily mood tracking & reflections</p>
      </div>

      {/* 7-day mood trend */}
      <div className="bg-white rounded-2xl p-5 mb-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9' }}>
        <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-3">This week's mood</p>
        <div className="flex items-end gap-2">
          {last7.map(day => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
              {day.mood ? (
                <MoodDot mood={day.mood} />
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-200" />
              )}
              <span className="text-[10px] text-gray-400 font-medium">{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Today's entry */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl overflow-hidden mb-6"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9' }}
      >
        {/* Top accent based on mood */}
        <div className="h-1.5 transition-colors duration-300" style={{ background: selectedMoodObj.color }} />

        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-900">Today's Entry</h2>
              <p className="text-[12px] text-slate-400">{format(new Date(), 'EEEE, MMMM d')}</p>
            </div>
            {todayNote && (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: '#dcfce7', color: '#16a34a' }}>
                ✓ Saved
              </span>
            )}
          </div>

          {/* Mood picker */}
          <div className="mb-4">
            <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide mb-2.5">Mood</p>
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

          {/* Reflection */}
          <div className="mb-4">
            <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Reflection</p>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="What's on your mind? Any wins today? What could be better?..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border text-[14px] text-slate-700 placeholder-slate-300 resize-none outline-none transition-all"
              style={{ borderColor: '#e2e8f0', lineHeight: '1.6' }}
              onFocus={e => { e.target.style.borderColor = selectedMoodObj.color; e.target.style.boxShadow = `0 0 0 3px ${selectedMoodObj.color}15`; }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl text-white font-semibold text-[14px] transition-all flex items-center justify-center gap-2"
            style={{
              background: saved
                ? 'linear-gradient(135deg, #059669, #10b981)'
                : `linear-gradient(135deg, ${selectedMoodObj.color}, ${selectedMoodObj.color}cc)`,
              boxShadow: saved ? '0 4px 14px rgba(5,150,105,0.3)' : `0 4px 14px ${selectedMoodObj.color}30`,
            }}
          >
            {saved ? (
              <>✓ Saved!</>
            ) : (
              <><Save size={16} /> Save today's entry</>
            )}
          </button>
        </div>
      </motion.div>

      {/* Past entries */}
      {pastNotes.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-900 mb-3">Past Entries ({pastNotes.length})</h2>
          <div className="space-y-3">
            <AnimatePresence>
              {recentNotes.map((note, i) => {
                const m = MOOD_OPTIONS.find(o => o.v === note.mood)!;
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
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: m.bg }}
                      >
                        {m.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[13px] font-semibold text-slate-700">
                            {format(new Date(note.date + 'T12:00:00'), 'EEE, MMM d')}
                          </p>
                          <span className="text-[11px] font-semibold" style={{ color: m.color }}>{m.label}</span>
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

          {pastNotes.length > 7 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full mt-3 py-3 rounded-xl text-[13px] font-semibold text-slate-500 bg-white border border-gray-100 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              {showAll ? 'Show less' : `Show ${pastNotes.length - 7} more`}
              <ChevronDown size={14} style={{ transform: showAll ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
          )}
        </div>
      )}

      {data.notes.length === 0 && (
        <div className="text-center py-10">
          <p className="text-4xl mb-3">📖</p>
          <p className="text-slate-500 font-semibold">Your journal is empty</p>
          <p className="text-sm text-slate-400 mt-1">Save today's entry above to get started</p>
        </div>
      )}
    </div>
  );
}
