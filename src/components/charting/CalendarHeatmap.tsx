'use client';

import { Session } from '@/types';
import { format, startOfDay, addDays, getDay, startOfYear, endOfYear, differenceInDays } from 'date-fns';

interface CalendarHeatmapProps {
  sessions: Session[];
  chartingEntries: any[];
  onDayClick: (date: Date, sessions: Session[]) => void;
}

export const CalendarHeatmap = ({ sessions, chartingEntries, onDayClick }: CalendarHeatmapProps) => {
  const today = startOfDay(new Date());
  // Show 1 year back + 3 months forward (365 + 90 = 455 days)
  const yearStart = addDays(today, -365);
  const yearEnd = addDays(today, 90);
  const totalDays = 455;

  // Group sessions by date
  const sessionsByDate = sessions.reduce((acc, session) => {
    const dateKey = format(startOfDay(session.date.toDate()), 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(session);
    return acc;
  }, {} as Record<string, Session[]>);

  // Create a set of session IDs that have charting entries
  const sessionIdsWithEntries = new Set(chartingEntries.map(entry => entry.sessionId));

  // Calculate completion level for a date
  const getCompletionLevel = (date: Date): number => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const daySessions = sessionsByDate[dateKey];

    if (!daySessions || daySessions.length === 0) return 0;

    // Count how many sessions have charting entries
    const chartedCount = daySessions.filter(s => sessionIdsWithEntries.has(s.id)).length;
    const totalCount = daySessions.length;

    if (chartedCount === 0) return 1; // Scheduled but not charted
    if (chartedCount === totalCount) return 3; // All charted
    return 2; // Partially charted
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

  // Build grid: weeks as columns, days (Sun-Sat) as rows
  // Start from the first Sunday on or before Jan 1
  const firstDate = addDays(yearStart, -getDay(yearStart));
  const weeksNeeded = Math.ceil((totalDays + getDay(yearStart)) / 7);

  const grid: Date[][] = Array.from({ length: 7 }, () => []);

  for (let week = 0; week < weeksNeeded; week++) {
    for (let day = 0; day < 7; day++) {
      const date = addDays(firstDate, week * 7 + day);
      grid[day].push(date);
    }
  }

  // Get month labels
  const monthLabels: { label: string; weekIndex: number }[] = [];
  let lastMonth = -1;

  for (let week = 0; week < weeksNeeded; week++) {
    const date = addDays(firstDate, week * 7);
    const month = date.getMonth();

    // Show label if within our date range and month changed
    if (month !== lastMonth && date >= yearStart && date <= yearEnd) {
      monthLabels.push({
        label: format(date, 'MMM'),
        weekIndex: week,
      });
      lastMonth = month;
    }
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span className="font-medium">Activity:</span>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 bg-gray-100 border border-gray-300 rounded"></div>
          <span>None</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 bg-blue-200 rounded"></div>
          <span>Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 bg-blue-400 rounded"></div>
          <span>Partial</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 bg-blue-600 rounded"></div>
          <span>Complete</span>
        </div>
      </div>

      {/* Heatmap Grid - Horizontal Layout */}
      <div className="overflow-x-auto pb-4">
        <div className="inline-flex flex-col gap-1 min-w-max">
          {/* Month labels - positioned relative to weeks */}
          <div className="relative h-5 ml-10 mb-1">
            {monthLabels.map((month) => (
              <div
                key={month.weekIndex}
                className="absolute text-xs text-gray-500"
                style={{ left: `${month.weekIndex * 18}px` }}
              >
                {month.label}
              </div>
            ))}
          </div>

          {/* Grid container with day labels */}
          <div className="flex gap-1">
            {/* Day labels (Sun-Sat) */}
            <div className="flex flex-col gap-1 pr-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                <div key={day} className="h-3.5 flex items-center text-xs text-gray-500">
                  {idx % 2 === 1 ? day[0] : ''} {/* Only show Mon, Wed, Fri */}
                </div>
              ))}
            </div>

            {/* Weeks (columns) */}
            <div className="flex gap-1">
              {grid[0].map((_, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {grid.map((row, dayIndex) => {
                    const date = row[weekIndex];
                    const isInRange = date >= yearStart && date <= yearEnd;

                    if (!isInRange) {
                      return <div key={dayIndex} className="w-3.5 h-3.5" />; // Empty placeholder
                    }

                    const level = getCompletionLevel(date);
                    const dateKey = format(date, 'yyyy-MM-dd');
                    const daySessions = sessionsByDate[dateKey] || [];
                    const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

                    return (
                      <button
                        key={dayIndex}
                        onClick={() => onDayClick(date, daySessions)}
                        className={`
                          w-3.5 h-3.5 rounded-sm transition-all
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
        </div>
      </div>

      {/* Summary */}
      <div className="text-sm text-gray-600">
        <p>{format(yearStart, 'MMM d, yyyy')} - {format(yearEnd, 'MMM d, yyyy')} • {sessions.length} sessions • 1 year past + 3 months future • Click any day for details</p>
      </div>
    </div>
  );
};
