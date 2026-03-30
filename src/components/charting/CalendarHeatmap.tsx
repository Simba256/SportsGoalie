'use client';

import { Session, DynamicChartingEntry } from '@/types';
import { format, startOfDay, addDays, getDay } from 'date-fns';

interface CalendarHeatmapProps {
  sessions: Session[];
  chartingEntries: any[];
  dynamicEntries?: DynamicChartingEntry[];
  onDayClick: (date: Date, sessions: Session[]) => void;
}

export const CalendarHeatmap = ({ sessions, chartingEntries, dynamicEntries = [], onDayClick }: CalendarHeatmapProps) => {
  const today = startOfDay(new Date());
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

  const isLegacyEntryComplete = (entry: any): boolean => {
    if (!entry) return false;
    const hasPreGame = !!entry.preGame;
    const hasGameOverview = !!entry.gameOverview;
    const hasPeriods = !!entry.period1 && !!entry.period2 && !!entry.period3;
    const hasPostGame = !!entry.postGame;
    return hasPreGame && hasGameOverview && hasPeriods && hasPostGame;
  };

  const isDynamicEntryComplete = (entry: DynamicChartingEntry): boolean => {
    if (!entry) return false;
    return entry.isComplete === true;
  };

  const isDynamicEntryPartial = (entry: DynamicChartingEntry): boolean => {
    if (!entry) return false;
    return entry.completionPercentage > 0 && !entry.isComplete;
  };

  const legacyEntriesBySession = chartingEntries.reduce((acc, entry) => {
    acc[entry.sessionId] = entry;
    return acc;
  }, {} as Record<string, any>);

  const dynamicEntriesBySession = dynamicEntries.reduce((acc, entry) => {
    acc[entry.sessionId] = entry;
    return acc;
  }, {} as Record<string, DynamicChartingEntry>);

  const getCompletionLevel = (date: Date): number => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const daySessions = sessionsByDate[dateKey];

    if (!daySessions || daySessions.length === 0) return 0;

    let fullyCompleteCount = 0;
    let partiallyCompleteCount = 0;

    daySessions.forEach(session => {
      const dynamicEntry = dynamicEntriesBySession[session.id];
      if (dynamicEntry) {
        if (isDynamicEntryComplete(dynamicEntry)) {
          fullyCompleteCount++;
        } else if (isDynamicEntryPartial(dynamicEntry)) {
          partiallyCompleteCount++;
        }
        return;
      }

      const legacyEntry = legacyEntriesBySession[session.id];
      if (legacyEntry) {
        if (isLegacyEntryComplete(legacyEntry)) {
          fullyCompleteCount++;
        } else {
          partiallyCompleteCount++;
        }
      }
    });

    const totalCount = daySessions.length;

    if (fullyCompleteCount === 0 && partiallyCompleteCount === 0) {
      return 1; // Scheduled but not charted
    }

    if (fullyCompleteCount === totalCount) {
      return 3; // Complete
    }

    return 2; // Partial
  };

  const getBackgroundColor = (level: number): string => {
    switch (level) {
      case 0: return 'bg-muted/50 hover:bg-muted'; // No session
      case 1: return 'bg-primary/20 hover:bg-primary/30'; // Scheduled
      case 2: return 'bg-primary/50 hover:bg-primary/60'; // Partial
      case 3: return 'bg-primary hover:bg-primary/90'; // Complete
      default: return 'bg-muted/50';
    }
  };

  // Build grid
  const firstDate = addDays(yearStart, -getDay(yearStart));
  const weeksNeeded = Math.ceil((totalDays + getDay(yearStart)) / 7);

  const grid: Date[][] = Array.from({ length: 7 }, () => []);

  for (let week = 0; week < weeksNeeded; week++) {
    for (let day = 0; day < 7; day++) {
      const date = addDays(firstDate, week * 7 + day);
      grid[day].push(date);
    }
  }

  const monthLabels: { label: string; weekIndex: number }[] = [];
  let lastMonth = -1;

  for (let week = 0; week < weeksNeeded; week++) {
    const date = addDays(firstDate, week * 7);
    const month = date.getMonth();

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
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="font-medium">Activity:</span>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 bg-muted/50 border border-border rounded-sm"></div>
          <span>None</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 bg-primary/20 rounded-sm"></div>
          <span>Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 bg-primary/50 rounded-sm"></div>
          <span>Partial</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 bg-primary rounded-sm"></div>
          <span>Complete</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-4">
        <div className="inline-flex flex-col gap-1 min-w-max">
          {/* Month labels */}
          <div className="relative h-5 ml-10 mb-1">
            {monthLabels.map((month) => (
              <div
                key={month.weekIndex}
                className="absolute text-xs text-muted-foreground font-medium"
                style={{ left: `${month.weekIndex * 18}px` }}
              >
                {month.label}
              </div>
            ))}
          </div>

          {/* Grid container with day labels */}
          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-1 pr-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                <div key={day} className="h-3.5 flex items-center text-xs text-muted-foreground">
                  {idx % 2 === 1 ? day[0] : ''}
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
                      return <div key={dayIndex} className="w-3.5 h-3.5" />;
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
                          ${isToday ? 'ring-2 ring-accent ring-offset-1 ring-offset-background' : ''}
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
      <div className="text-sm text-muted-foreground">
        <p>{format(yearStart, 'MMM d, yyyy')} - {format(yearEnd, 'MMM d, yyyy')} &bull; {sessions.length} sessions &bull; 1 year past + 3 months future &bull; Click any day for details</p>
      </div>
    </div>
  );
};
