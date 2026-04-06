'use client';

import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, ChevronDown, BookOpen, RefreshCw } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const NAVAL_QUOTES = [
  { text: "You will get rich by giving society what it wants but does not yet know how to get. At scale.", cat: "Wealth" },
  { text: "Seek wealth, not money or status. Wealth is having assets that earn while you sleep.", cat: "Wealth" },
  { text: "Play long-term games with long-term people.", cat: "Thinking" },
  { text: "Read what you love until you love to read.", cat: "Learning" },
  { text: "The secret to doing good research is always to be a little underemployed. You waste years by not being able to waste hours.", cat: "Productivity" },
  { text: "All the real benefits in life come from compound interest.", cat: "Wealth" },
  { text: "Specific knowledge is knowledge you cannot be trained for. If society can train you, it can train someone else and replace you.", cat: "Career" },
  { text: "Arm yourself with specific knowledge, accountability, and leverage.", cat: "Career" },
  { text: "A busy mind accelerates the perceived passage of time. Meditation slows it down.", cat: "Mind" },
  { text: "To make money, you must have equity — a piece of a business. Give society what it wants but cannot get elsewhere.", cat: "Wealth" },
  { text: "Free time is the enemy of the young.", cat: "Productivity" },
  { text: "The greatest superpower is the ability to change yourself.", cat: "Growth" },
  { text: "Courage isn't the absence of fear. It's acting in the face of fear.", cat: "Mind" },
  { text: "If you can't decide, the answer is no.", cat: "Decisions" },
  { text: "Be present above all else.", cat: "Mind" },
  { text: "Judge yourself by your internal scorecard, not an external one.", cat: "Mind" },
  { text: "What you do, who you do it with, and how you do it — these are the important decisions.", cat: "Life" },
  { text: "The modern mind is overstimulated and the modern body is understimulated.", cat: "Health" },
  { text: "My one measure of success is: how long does it take me to get what I want?", cat: "Success" },
  { text: "Desire is a contract you make with yourself to be unhappy until you get what you want.", cat: "Mind" },
  { text: "Earn with your mind, not your time.", cat: "Wealth" },
  { text: "Set and enforce an aspirational personal hourly rate.", cat: "Productivity" },
  { text: "If you're not willing to own a stock for ten years, don't even think about owning it for ten minutes.", cat: "Investing" },
  { text: "The best relationships are where you forget to keep score.", cat: "Relationships" },
  { text: "Peace of mind is the reward for a life lived in alignment with your values.", cat: "Life" },
  { text: "Working hard is not enough. You also have to work on the right things.", cat: "Productivity" },
  { text: "A fit body, a calm mind, a house full of love. These things cannot be bought — they must be earned.", cat: "Life" },
  { text: "Most of our suffering comes from avoidance.", cat: "Mind" },
  { text: "To be honest with the world, first be honest with yourself.", cat: "Values" },
  { text: "Nailing 'when to work on what' is more important than nailing any task.", cat: "Productivity" },
];

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
  const [quoteIdx, setQuoteIdx] = useState(() => {
    const start = new Date(new Date().getFullYear(), 0, 0);
    const diff = new Date().getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24)) % NAVAL_QUOTES.length;
  });
  const [showAllQuotes, setShowAllQuotes] = useState(false);

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

      {/* Naval Ravikant Wisdom */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-slate-900 text-lg">Naval's Wisdom</h2>
            <p className="text-[12px] text-slate-400">Daily quote from Naval Ravikant</p>
          </div>
          <button
            onClick={() => setQuoteIdx(i => (i + 1) % NAVAL_QUOTES.length)}
            className="p-2 rounded-xl bg-violet-50 text-violet-500 hover:bg-violet-100 transition-colors"
            title="Next quote"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Featured quote */}
        <AnimatePresence mode="wait">
          <motion.div
            key={quoteIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl p-5 mb-4 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
              boxShadow: '0 8px 32px rgba(99,102,241,0.25)',
            }}
          >
            {/* Decorative quote mark */}
            <div className="absolute top-3 right-4 text-6xl font-serif text-indigo-400 opacity-20 leading-none select-none">"</div>

            <span
              className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-3"
              style={{ background: 'rgba(167,139,250,0.2)', color: '#a78bfa' }}
            >
              {NAVAL_QUOTES[quoteIdx].cat}
            </span>

            <p className="text-white font-medium text-[15px] leading-relaxed mb-4 relative z-10">
              "{NAVAL_QUOTES[quoteIdx].text}"
            </p>

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">N</div>
              <p className="text-indigo-300 text-[12px] font-semibold">Naval Ravikant</p>
              <span className="text-indigo-500 text-[11px] ml-auto">{quoteIdx + 1} / {NAVAL_QUOTES.length}</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Browse all quotes */}
        <button
          onClick={() => setShowAllQuotes(v => !v)}
          className="w-full py-3 rounded-xl text-[13px] font-semibold text-slate-500 bg-white border border-gray-100 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 mb-3"
        >
          {showAllQuotes ? 'Hide all quotes' : `Browse all ${NAVAL_QUOTES.length} quotes`}
          <ChevronDown size={14} style={{ transform: showAllQuotes ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        <AnimatePresence>
          {showAllQuotes && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 pb-4">
                {NAVAL_QUOTES.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => { setQuoteIdx(i); setShowAllQuotes(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="w-full text-left bg-white rounded-xl p-3.5 transition-all hover:shadow-sm"
                    style={{ border: quoteIdx === i ? '1.5px solid #818cf8' : '1px solid #f1f5f9' }}
                  >
                    <span
                      className="inline-block text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-1.5"
                      style={{ background: '#f5f3ff', color: '#7c3aed' }}
                    >
                      {q.cat}
                    </span>
                    <p className="text-[13px] text-slate-700 leading-snug line-clamp-2">"{q.text}"</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
