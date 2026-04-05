'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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

  // Reset state whenever modal opens/closes or initial changes
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

  if (!open) return null;

  const colors = colorMap[color];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl overflow-hidden">
        {/* Color accent */}
        <div className={`h-1.5 bg-gradient-to-r ${colors.gradient}`} />

        {/* Scrollable content */}
        <div className="max-h-[85vh] overflow-y-auto">
          <div className="px-6 pt-5 pb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                {initial ? 'Edit habit' : 'New habit'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Icon grid */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Icon</label>
                <div className="grid grid-cols-8 gap-1.5">
                  {ICONS.map(i => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIcon(i)}
                      className={`h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                        icon === i
                          ? `${colors.bgLight} ring-2 ${colors.ring} scale-110`
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Morning run"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Description <span className="text-gray-400 font-normal normal-case">(optional)</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="What's the goal?"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Color</label>
                <div className="flex gap-2.5 flex-wrap">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full ${colorMap[c].bg} transition-all shadow-sm ${
                        color === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-400 shadow-md' : 'hover:scale-110'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Category + Target */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as HabitCategory)}
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Frequency</label>
                  <select
                    value={targetDays}
                    onChange={e => setTargetDays(Number(e.target.value))}
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
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
                className={`w-full py-3.5 rounded-xl text-white font-semibold text-sm bg-gradient-to-r ${colors.gradient} hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm`}
              >
                {initial ? 'Save changes' : 'Create habit'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
