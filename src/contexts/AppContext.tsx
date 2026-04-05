'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Habit, DailyNote, Expense, ExpenseCategory, AppData } from '@/types';

const STORAGE_KEY = 'streak-app-v3';

const DEFAULT_DATA: AppData = {
  habits: [
    {
      id: '1',
      name: 'Morning Meditation',
      description: 'Clear your mind before the day begins',
      category: 'mindfulness',
      color: 'violet',
      icon: '🧘',
      targetDays: 7,
      completions: {},
      notes: {},
      createdAt: new Date().toISOString(),
      archived: false,
    },
    {
      id: '2',
      name: 'Read 30 Minutes',
      description: 'Expand knowledge daily',
      category: 'learning',
      color: 'blue',
      icon: '📚',
      targetDays: 5,
      completions: {},
      notes: {},
      createdAt: new Date().toISOString(),
      archived: false,
    },
    {
      id: '3',
      name: 'Strength Training',
      description: 'Build strength and endurance',
      category: 'fitness',
      color: 'orange',
      icon: '💪',
      targetDays: 4,
      completions: {},
      notes: {},
      createdAt: new Date().toISOString(),
      archived: false,
    },
    {
      id: '4',
      name: 'Drink 8 Glasses of Water',
      description: 'Stay hydrated all day',
      category: 'health',
      color: 'cyan',
      icon: '💧',
      targetDays: 7,
      completions: {},
      notes: {},
      createdAt: new Date().toISOString(),
      archived: false,
    },
  ],
  notes: [],
  expenses: [],
  dailyBudget: 50,
  userName: 'You',
  joinedAt: new Date().toISOString(),
};

interface AppContextType {
  data: AppData;
  loaded: boolean;
  toggleCompletion: (habitId: string, date: string) => void;
  addHabit: (habit: Omit<Habit, 'id' | 'completions' | 'notes' | 'createdAt' | 'archived'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  archiveHabit: (id: string) => void;
  addNote: (note: Omit<DailyNote, 'id' | 'createdAt'>) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  deleteExpense: (id: string) => void;
  updateDailyBudget: (budget: number) => void;
  updateUserName: (name: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(DEFAULT_DATA);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.habits) {
          parsed.habits = parsed.habits.map((h: Habit) => ({
            ...h,
            notes: h.notes ?? {},
            archived: h.archived ?? false,
          }));
        }
        setData({
          ...DEFAULT_DATA,
          ...parsed,
          expenses: parsed.expenses ?? [],
          dailyBudget: parsed.dailyBudget ?? 50,
        });
      }
    } catch { /* keep defaults */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, loaded]);

  const toggleCompletion = useCallback((habitId: string, date: string) => {
    setData(prev => ({
      ...prev,
      habits: prev.habits.map(h =>
        h.id === habitId
          ? { ...h, completions: { ...h.completions, [date]: !h.completions[date] } }
          : h
      ),
    }));
  }, []);

  const addHabit = useCallback((habit: Omit<Habit, 'id' | 'completions' | 'notes' | 'createdAt' | 'archived'>) => {
    setData(prev => ({
      ...prev,
      habits: [...prev.habits, {
        ...habit,
        id: Math.random().toString(36).slice(2),
        completions: {},
        notes: {},
        createdAt: new Date().toISOString(),
        archived: false,
      }],
    }));
  }, []);

  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    setData(prev => ({ ...prev, habits: prev.habits.map(h => h.id === id ? { ...h, ...updates } : h) }));
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setData(prev => ({ ...prev, habits: prev.habits.filter(h => h.id !== id) }));
  }, []);

  const archiveHabit = useCallback((id: string) => {
    setData(prev => ({ ...prev, habits: prev.habits.map(h => h.id === id ? { ...h, archived: true } : h) }));
  }, []);

  const addNote = useCallback((note: Omit<DailyNote, 'id' | 'createdAt'>) => {
    setData(prev => ({
      ...prev,
      notes: [...prev.notes.filter(n => n.date !== note.date), {
        ...note,
        id: Math.random().toString(36).slice(2),
        createdAt: new Date().toISOString(),
      }],
    }));
  }, []);

  const addExpense = useCallback((expense: Omit<Expense, 'id' | 'createdAt'>) => {
    setData(prev => ({
      ...prev,
      expenses: [...prev.expenses, {
        ...expense,
        id: Math.random().toString(36).slice(2),
        createdAt: new Date().toISOString(),
      }],
    }));
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setData(prev => ({ ...prev, expenses: prev.expenses.filter(e => e.id !== id) }));
  }, []);

  const updateDailyBudget = useCallback((budget: number) => {
    setData(prev => ({ ...prev, dailyBudget: budget }));
  }, []);

  const updateUserName = useCallback((name: string) => {
    setData(prev => ({ ...prev, userName: name }));
  }, []);

  return (
    <AppContext.Provider value={{
      data, loaded,
      toggleCompletion, addHabit, updateHabit, deleteHabit, archiveHabit,
      addNote, addExpense, deleteExpense, updateDailyBudget, updateUserName,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
