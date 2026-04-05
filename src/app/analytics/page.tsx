'use client';

import { useState } from 'react';
import { format, subDays } from 'date-fns';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { getHabitStats, getMonthlyData, getLast52Weeks } from '@/lib/stats';
import { colorMap } from '@/lib/colors';
import { Habit } from '@/types';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts';

function HeatmapCalendar({ habit }: { habit: Habit }) {
  const weeks = getLast52Weeks();
  const colors = colorMap[habit.color];

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex gap-1 min-w-max">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map(({ date }) => {
              const done = !!habit.completions[date];
              return (
                <div
                  key={date}
                  title={date}
                  className={`w-3 h-3 rounded-sm transition-colors ${
                    done ? colors.bg : 'bg-gray-100'
                  }`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1 text-[10px] text-gray-400 min-w-max">
        <span>{format(subDays(new Date(), 364), 'MMM yyyy')}</span>
        <span>{format(new Date(), 'MMM yyyy')}</span>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data, loaded } = useApp();
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);

  if (!loaded) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  const activeHabits = data.habits.filter(h => !h.archived);
  const monthlyData = getMonthlyData(activeHabits);

  const habit = selectedHabit
    ? activeHabits.find(h => h.id === selectedHabit) ?? activeHabits[0]
    : activeHabits[0];

  const radarData = activeHabits.map(h => ({
    habit: h.name.length > 10 ? h.name.slice(0, 10) + '…' : h.name,
    rate: getHabitStats(h).completionRate30,
  }));

  const dayOfWeekData = (() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, di) => {
      let total = 0, done = 0;
      for (let w = 0; w < 12; w++) {
        const date = format(subDays(new Date(), (11 - w) * 7 + (6 - di)), 'yyyy-MM-dd');
        total++;
        if (activeHabits.some(h => h.completions[date])) done++;
      }
      return { day, rate: total > 0 ? Math.round((done / total) * 100) : 0 };
    });
  })();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">Insights across your habit journey</p>
      </div>

      {activeHabits.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-14 text-center">
          <p className="text-4xl mb-3">📊</p>
          <p className="font-semibold text-gray-700">No data yet</p>
          <p className="text-sm text-gray-400 mt-1">Add habits and start tracking to see analytics</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 30-day overview */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
          >
            <h2 className="font-semibold text-gray-900 mb-1">30-Day Completion Rate</h2>
            <p className="text-xs text-gray-400 mb-4">Overall % of habits completed each day</p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis hide domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: 'white', border: '1px solid #f3f4f6', borderRadius: '12px', fontSize: 12 }}
                  formatter={(v) => [`${v}%`, 'Completion']}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#7c3aed"
                  strokeWidth={2.5}
                  fill="url(#grad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Best days of week */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <h2 className="font-semibold text-gray-900 mb-1">Best Days</h2>
              <p className="text-xs text-gray-400 mb-4">Which days you complete most habits</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={dayOfWeekData} barSize={24}>
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ background: 'white', border: '1px solid #f3f4f6', borderRadius: '12px', fontSize: 12 }}
                    formatter={(v) => [`${v}%`, 'Rate']}
                  />
                  <Bar dataKey="rate" radius={[8, 8, 0, 0]}>
                    {dayOfWeekData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.rate === Math.max(...dayOfWeekData.map(d => d.rate)) ? '#7c3aed' : '#ede9fe'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Habit radar */}
            {activeHabits.length >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
              >
                <h2 className="font-semibold text-gray-900 mb-1">Habit Balance</h2>
                <p className="text-xs text-gray-400 mb-2">30-day completion across habits</p>
                <ResponsiveContainer width="100%" height={180}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#f3f4f6" />
                    <PolarAngleAxis dataKey="habit" tick={{ fontSize: 10, fill: '#6b7280' }} />
                    <Radar dataKey="rate" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </div>

          {/* Per-habit stats */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
          >
            <h2 className="font-semibold text-gray-900 mb-4">Per-Habit Breakdown</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {activeHabits.map(h => {
                const colors = colorMap[h.color];
                return (
                  <button
                    key={h.id}
                    onClick={() => setSelectedHabit(h.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all text-left ${
                      (habit?.id === h.id)
                        ? `${colors.bg} text-white`
                        : `${colors.bgLighter} ${colors.text} hover:${colors.bgLight}`
                    }`}
                  >
                    <span>{h.icon}</span>
                    <span className="truncate text-xs">{h.name}</span>
                  </button>
                );
              })}
            </div>

            {habit && (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Current Streak', value: `${getHabitStats(habit).currentStreak}d` },
                    { label: 'Best Streak', value: `${getHabitStats(habit).longestStreak}d` },
                    { label: '30-day Rate', value: `${getHabitStats(habit).completionRate30}%` },
                    { label: 'Total Done', value: String(getHabitStats(habit).totalCompletions) },
                  ].map(s => (
                    <div key={s.label} className={`${colorMap[habit.color].bgLighter} rounded-xl p-3`}>
                      <p className={`text-2xl font-bold ${colorMap[habit.color].text}`}>{s.value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Activity heatmap — past year</h3>
                <HeatmapCalendar habit={habit} />
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
