export type HabitCategory =
  | 'health' | 'mindfulness' | 'productivity' | 'learning'
  | 'fitness' | 'nutrition' | 'social' | 'finance' | 'custom';

export type HabitColor =
  | 'violet' | 'blue' | 'emerald' | 'amber'
  | 'rose' | 'cyan' | 'orange' | 'indigo' | 'teal';

export type ExpenseCategory =
  | 'food' | 'transport' | 'shopping' | 'health'
  | 'entertainment' | 'bills' | 'other';

export interface Expense {
  id: string;
  date: string;        // yyyy-MM-dd
  amount: number;
  category: ExpenseCategory;
  note?: string;
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: HabitCategory;
  color: HabitColor;
  icon: string;
  targetDays: number;
  completions: Record<string, boolean>;
  notes: Record<string, string>;
  createdAt: string;
  archived: boolean;
}

export interface DailyNote {
  id: string;
  date: string;
  content: string;
  mood: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
}

export interface AppData {
  habits: Habit[];
  notes: DailyNote[];
  expenses: Expense[];
  dailyBudget: number;
  userName: string;
  joinedAt: string;
}

export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  completionRate30: number;
  totalCompletions: number;
  weeklyRate: number;
}

export type AchievementType =
  | 'streak_3' | 'streak_7' | 'streak_14' | 'streak_30' | 'streak_100'
  | 'total_10' | 'total_50' | 'total_100' | 'total_500'
  | 'perfect_week' | 'perfect_month' | 'all_done' | 'first_habit';

export interface Achievement {
  type: AchievementType;
  label: string;
  description: string;
  icon: string;
  xp: number;
  habitId?: string;
  earnedAt?: string;
}
