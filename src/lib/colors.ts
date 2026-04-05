import { HabitColor } from '@/types';

export const colorMap: Record<HabitColor, {
  bg: string;
  bgLight: string;
  bgLighter: string;
  border: string;
  text: string;
  ring: string;
  gradient: string;
  hex: string;
  hexLight: string;
}> = {
  violet: {
    bg: 'bg-violet-600',
    bgLight: 'bg-violet-100',
    bgLighter: 'bg-violet-50',
    border: 'border-violet-200',
    text: 'text-violet-600',
    ring: 'ring-violet-500',
    gradient: 'from-violet-500 to-purple-600',
    hex: '#7c3aed',
    hexLight: '#ede9fe',
  },
  blue: {
    bg: 'bg-blue-600',
    bgLight: 'bg-blue-100',
    bgLighter: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-600',
    ring: 'ring-blue-500',
    gradient: 'from-blue-500 to-indigo-600',
    hex: '#2563eb',
    hexLight: '#dbeafe',
  },
  emerald: {
    bg: 'bg-emerald-600',
    bgLight: 'bg-emerald-100',
    bgLighter: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-600',
    ring: 'ring-emerald-500',
    gradient: 'from-emerald-500 to-teal-600',
    hex: '#059669',
    hexLight: '#d1fae5',
  },
  amber: {
    bg: 'bg-amber-500',
    bgLight: 'bg-amber-100',
    bgLighter: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-600',
    ring: 'ring-amber-500',
    gradient: 'from-amber-400 to-orange-500',
    hex: '#d97706',
    hexLight: '#fef3c7',
  },
  rose: {
    bg: 'bg-rose-600',
    bgLight: 'bg-rose-100',
    bgLighter: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-600',
    ring: 'ring-rose-500',
    gradient: 'from-rose-500 to-pink-600',
    hex: '#e11d48',
    hexLight: '#ffe4e6',
  },
  cyan: {
    bg: 'bg-cyan-600',
    bgLight: 'bg-cyan-100',
    bgLighter: 'bg-cyan-50',
    border: 'border-cyan-200',
    text: 'text-cyan-600',
    ring: 'ring-cyan-500',
    gradient: 'from-cyan-500 to-sky-600',
    hex: '#0891b2',
    hexLight: '#cffafe',
  },
  orange: {
    bg: 'bg-orange-600',
    bgLight: 'bg-orange-100',
    bgLighter: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-600',
    ring: 'ring-orange-500',
    gradient: 'from-orange-500 to-red-500',
    hex: '#ea580c',
    hexLight: '#ffedd5',
  },
  indigo: {
    bg: 'bg-indigo-600',
    bgLight: 'bg-indigo-100',
    bgLighter: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-600',
    ring: 'ring-indigo-500',
    gradient: 'from-indigo-500 to-violet-600',
    hex: '#4f46e5',
    hexLight: '#e0e7ff',
  },
  teal: {
    bg: 'bg-teal-600',
    bgLight: 'bg-teal-100',
    bgLighter: 'bg-teal-50',
    border: 'border-teal-200',
    text: 'text-teal-600',
    ring: 'ring-teal-500',
    gradient: 'from-teal-500 to-emerald-600',
    hex: '#0d9488',
    hexLight: '#ccfbf1',
  },
};
