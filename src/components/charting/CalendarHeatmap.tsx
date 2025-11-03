'use client';

import { useState } from 'react';
import { Session } from '@/types';
import { format, startOfDay, differenceInDays, addDays, startOfWeek, endOfWeek } from 'date-fns';

interface CalendarHeatmapProps {
  sessions: Session[];
  onDayClick: (date: Date, sessions: Session[]) => void;
  daysToShow?: number;
}

export const CalendarHeatmap = ({ sessions, onDayClick, daysToShow = 90 }: CalendarHeatmapProps) => {
  const today = startOfDay(new Date());
  const startDate = addDays(today, -daysToShow);

  // Group sessions by date
  const sessionsByDate = sessions.reduce((acc, session) => {
    const dateKey = format(startOfDay(session.date.toDate()), 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(session);
    return acc;
  }, {} as Record<string, Session[]>);

  // Calculate completion level for a date
  const getCompletionLevel = (date: Date): number => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const daySessions = sessionsByDate[dateKey];

    if (!daySessions || daySessions.length === 0) return 0;

    const completedCount = daySessions.filter(s => s.status === 'completed').length;
    const totalCount = daySessions.length;

    if (completedCount === 0) return 1; // Scheduled
    if (completedCount === totalCount) return 3; // All completed
    return 2; // Partially completed
  };

  // Get background color based on completion level
  const getBackgroundColor = (level: number): string => {
    switch (level) {
      case 0: return 'bg-gray-100 hover:bg-gray-200'; // No session
      case 1: return 'bg-blue-200 hover:bg-blue-300'; // Scheduled
      case 2: return 'bg-blue-400 hover:bg-blue-500'; // Partial
      case 3: return 'bg-blue-600 hover:bg-blue-700'; // Complete
      default: return 'bg-gray-100';
    }
  };

  // Build grid of days
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  for (let i = 0; i < daysToShow; i++) {
    const date = addDays(startDate, i);
    currentWeek.push(date);

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span className="font-medium">Activity:</span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
          <span>None</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-200 rounded"></div>
          <span>Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-400 rounded"></div>
          <span>Partial</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-600 rounded"></div>
          <span>Complete</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1">
          {/* Day labels */}
          <div className="flex gap-1 mb-1">
            <div className="w-8"></div> {/* Spacer for month labels */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="w-3 text-xs text-gray-500 text-center">
                {day[0]}
              </div>
            ))}
          </div>

          {/* Weeks grid */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex gap-1">
              {/* Month label (only on first day of month) */}
              <div className="w-8 text-xs text-gray-500 flex items-center">
                {week[0] && format(week[0], 'd') === '1' && format(week[0], 'MMM')}
              </div>

              {/* Days */}
              {week.map((date, dayIndex) => {
                const level = getCompletionLevel(date);
                const dateKey = format(date, 'yyyy-MM-dd');
                const daySessions = sessionsByDate[dateKey] || [];
                const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

                return (
                  <button
                    key={dayIndex}
                    onClick={() => onDayClick(date, daySessions)}
                    className={`
                      w-3 h-3 rounded-sm transition-all
                      ${getBackgroundColor(level)}
                      ${isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                    `}
                    title={`${format(date, 'MMM d, yyyy')}: ${daySessions.length} session${daySessions.length !== 1 ? 's' : ''}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="text-sm text-gray-600">
        <p>Last {daysToShow} days • {sessions.length} sessions • Click any day for details</p>
      </div>
    </div>
  );
};
