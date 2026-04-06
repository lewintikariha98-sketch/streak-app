'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Habit, HabitCategory, HabitColor } from '@/types';
import { colorMap } from '@/lib/colors';

const ICONS = ['🏃', '🧘', '📚', '💧', '🥗', '💪', '🎯', '✍️', '🎨', '🎵', '🛌', '💰', '🧠', '🌿', '❤️', '🔥', '⚡', '🏋️', '🚴', '🥤', '🌅', '🌙', '🎧', '🧹'];
const COLORS: HabitColor[] = ['violet', 'blue', 'emerald', 'amber', 'rose', 'cyan', 'orange', 'indigo', 'teal'];
const CATEGORIES: { value: HabitCategory; label: string }[] = [
  { value: 'health', label: '🏥 Health' },
  { value: 'fitness', label: '💪 Fitness' },
  { value: 'nutrition', label: '🥗 Nutrition' },
  { value: 'mindfulness', label: '🧘 Mindfulness' },
  { value: 'productivity', label: '⚡ Productivity' },
  { value: 'learning', label: '📚 Learning' },
  { value: 'social', label: '👥 Social' },
  { value: 'finance', label: '💰 Finance' },
  { value: 'custom', label: '✨ Custom' },
];

interface HabitModalProps {
  open: boolean;
  initial?: Habit;
  onClose: () => void;
  onSave: (data: Omit<Habit, 'id' | 'completions' | 'notes' | 'createdAt' | 'archived'>) => void;
}

export default function HabitModal({ open, initial, onClose, onSave }: HabitModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>('health');
  const [color, setColor] = useState<HabitColor>('violet');
  const [icon, setIcon] = useState('🏃');
  const [targetDays, setTargetDays] = useState(7);

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? '');
      setDescription(initial?.description ?? '');
      setCategory(initial?.category ?? 'health');
      setColor(initial?.color ?? 'violet');
      setIcon(initial?.icon ?? '🏃');
      setTargetDays(initial?.targetDays ?? 7);
    }
  }, [open, initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave({ name: trimmed, description: description.trim() || undefined, category, color, icon, targetDays });
    onClose();
  };

  const colors = colorMap[color];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="relative bg-white w-full sm:max-w-md sm:mx-4 sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden"
            style={{ maxHeight: '92dvh' }}
          >
            {/* Brand top accent */}
            <div className={`h-1 bg-gradient-to-r ${colors.gradient}`} />

            {/* Drag handle (mobile) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(92dvh - 4px)' }}>
              <div className="px-5 pt-3 pb-6 sm:pt-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-[17px] font-black text-gray-900">
                      {initial ? 'Edit habit' : 'New habit'}
                    </h2>
                    <p className="text-[12px] text-gray-400 mt-0.5">
                      {initial ? 'Update your habit details' : 'What do you want to build?'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Icon picker */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">
                      Choose icon
                    </label>
                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                      {ICONS.map(i => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setIcon(i)}
                          className="aspect-square rounded-xl text-xl flex items-center justify-center transition-all duration-150"
                          style={{
                            background: icon === i ? `${colors.hexLight}` : '#F8FAFC',
                            border: icon === i ? `2px solid ${colors.hex}` : '2px solid transparent',
                            transform: icon === i ? 'scale(1.1)' : 'scale(1)',
                          }}
                        >
                          {i}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Name <span className="text-rose-400 normal-case tracking-normal">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Morning run"
                      autoFocus
                      className="w-full px-4 py-3 rounded-xl border text-[14px] text-gray-900 placeholder-gray-300 outline-none transition-all"
                      style={{ borderColor: '#E2E8F0' }}
                      onFocus={e => { e.target.style.borderColor = colors.hex; e.target.style.boxShadow = `0 0 0 3px ${colors.hex}20`; }}
                      onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Description <span className="text-gray-300 font-normal normal-case tracking-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="What's the goal?"
                      className="w-full px-4 py-3 rounded-xl border text-[14px] text-gray-900 placeholder-gray-300 outline-none transition-all"
                      style={{ borderColor: '#E2E8F0' }}
                      onFocus={e => { e.target.style.borderColor = colors.hex; e.target.style.boxShadow = `0 0 0 3px ${colors.hex}20`; }}
                      onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>

                  {/* Color picker */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">
                      Color
                    </label>
                    <div className="flex gap-3 flex-wrap">
                      {COLORS.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className="w-9 h-9 rounded-full transition-all duration-150"
                          style={{
                            background: colorMap[c].hex,
                            transform: color === c ? 'scale(1.25)' : 'scale(1)',
                            boxShadow: color === c ? `0 0 0 3px white, 0 0 0 5px ${colorMap[c].hex}` : 'none',
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Category + Frequency */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={e => setCategory(e.target.value as HabitCategory)}
                        className="w-full px-3 py-3 rounded-xl border border-gray-200 text-[13px] text-gray-800 outline-none bg-white focus:ring-2 focus:ring-violet-400"
                      >
                        {CATEGORIES.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                        Frequency
                      </label>
                      <select
                        value={targetDays}
                        onChange={e => setTargetDays(Number(e.target.value))}
                        className="w-full px-3 py-3 rounded-xl border border-gray-200 text-[13px] text-gray-800 outline-none bg-white focus:ring-2 focus:ring-violet-400"
                      >
                        <option value={1}>1× / week</option>
                        <option value={2}>2× / week</option>
                        <option value={3}>3× / week</option>
                        <option value={4}>4× / week</option>
                        <option value={5}>5× / week</option>
                        <option value={6}>6× / week</option>
                        <option value={7}>Every day</option>
                      </select>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={!name.trim()}
                    className="w-full py-4 rounded-2xl text-white font-black text-[15px] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: name.trim()
                        ? `linear-gradient(135deg, ${colors.hex}, ${colors.hex}cc)`
                        : '#94A3B8',
                      boxShadow: name.trim() ? `0 8px 24px ${colors.hex}40` : 'none',
                    }}
                  >
                    {initial ? 'Save changes' : `Create "${name.trim() || 'habit'}"`}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
