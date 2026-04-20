'use client';

import { useEffect, useMemo, useState } from 'react';
import { chartingService } from '@/lib/database';
import { ChartingEntry, Session } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  MapPin,
  Trophy,
  Dumbbell,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  ClipboardList,
  Filter,
} from 'lucide-react';
import { format } from 'date-fns';
import { V2ChartReadOnlyView } from './V2ChartReadOnlyView';

type V2Fields = {
  v2PreGame?: unknown;
  v2Periods?: unknown;
  v2PostGame?: unknown;
  v2Practice?: unknown;
};

type TypeFilter = 'all' | 'game' | 'practice';

interface GoalieChartingHistoryProps {
  studentId: string;
  /** Called when a session card's "Open" button is clicked (optional). */
  onOpenSession?: (sessionId: string) => void;
}

const hasV2Data = (entry: ChartingEntry | undefined): boolean => {
  if (!entry) return false;
  const v2 = entry as unknown as V2Fields;
  return !!(v2.v2PreGame || v2.v2Periods || v2.v2PostGame || v2.v2Practice);
};

const isComplete = (entry: ChartingEntry | undefined, sessionType: string): boolean => {
  if (!entry) return false;
  const v2 = entry as unknown as V2Fields;
  if (sessionType === 'practice') return !!v2.v2Practice;
  return !!v2.v2PreGame && !!v2.v2Periods && !!v2.v2PostGame;
};

export function GoalieChartingHistory({
  studentId,
  onOpenSession,
}: GoalieChartingHistoryProps) {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [entries, setEntries] = useState<ChartingEntry[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [sessionsResult, entriesResult] = await Promise.all([
          chartingService.getSessionsByStudent(studentId, {
            limit: 200,
            orderBy: 'date',
            orderDirection: 'desc',
          }),
          chartingService.getChartingEntriesByStudent(studentId),
        ]);
        if (cancelled) return;
        setSessions(sessionsResult.success ? sessionsResult.data || [] : []);
        setEntries(entriesResult.success ? entriesResult.data || [] : []);
      } catch (err) {
        console.error('Failed to load charting history', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  const entriesBySession = useMemo(() => {
    const map = new Map<string, ChartingEntry>();
    entries.forEach((e) => {
      const existing = map.get(e.sessionId);
      // Prefer student-submitted entries with v2 data
      if (!existing || (hasV2Data(e) && !hasV2Data(existing))) {
        map.set(e.sessionId, e);
      }
    });
    return map;
  }, [entries]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (typeFilter !== 'all' && s.type !== typeFilter) return false;
      return hasV2Data(entriesBySession.get(s.id));
    });
  }, [sessions, entriesBySession, typeFilter]);

  const counts = useMemo(() => {
    const all = sessions.filter((s) => hasV2Data(entriesBySession.get(s.id)));
    return {
      all: all.length,
      game: all.filter((s) => s.type === 'game').length,
      practice: all.filter((s) => s.type === 'practice').length,
    };
  }, [sessions, entriesBySession]);

  if (loading) {
    return (
      <Card className="p-12 text-center">
        <Loader2 className="w-6 h-6 mx-auto text-slate-400 animate-spin mb-2" />
        <p className="text-sm text-slate-500">Loading charting history…</p>
      </Card>
    );
  }

  if (counts.all === 0) {
    return (
      <Card className="p-12 text-center border-dashed bg-slate-50/50">
        <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-700">No charting history yet</p>
        <p className="text-xs text-slate-500 mt-1">
          Once the goalie charts a game or practice session, it will appear here.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex items-center gap-2 text-xs">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        {(
          [
            { key: 'all', label: 'All', count: counts.all },
            { key: 'game', label: 'Games', count: counts.game },
            { key: 'practice', label: 'Practices', count: counts.practice },
          ] as const
        ).map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setTypeFilter(opt.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              typeFilter === opt.key
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {opt.label} · {opt.count}
          </button>
        ))}
      </div>

      {/* Session list */}
      {filteredSessions.length === 0 ? (
        <Card className="p-8 text-center border-dashed bg-slate-50/50">
          <p className="text-sm text-slate-500">No {typeFilter === 'all' ? '' : typeFilter + ' '}sessions in history.</p>
        </Card>
      ) : (
        filteredSessions.map((session) => {
          const entry = entriesBySession.get(session.id);
          const expanded = expandedId === session.id;
          const complete = isComplete(entry, session.type);
          const TypeIcon = session.type === 'game' ? Trophy : Dumbbell;
          const dateStr = session.date?.toDate
            ? format(session.date.toDate(), 'EEE, MMM d, yyyy')
            : '';

          return (
            <Card key={session.id} className="overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : session.id)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    session.type === 'game'
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-emerald-50 text-emerald-600'
                  }`}
                >
                  <TypeIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-slate-900 capitalize">
                      {session.type}
                      {session.opponent && (
                        <span className="font-normal text-slate-600"> vs {session.opponent}</span>
                      )}
                    </p>
                    {complete ? (
                      <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white text-[10px]">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Complete
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-amber-100 text-amber-700 text-[10px]"
                      >
                        Partial
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {dateStr}
                    </span>
                    {session.location && (
                      <span className="inline-flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3" />
                        {session.location}
                      </span>
                    )}
                  </div>
                </div>
                {expanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                )}
              </button>

              {expanded && entry && (
                <div className="border-t border-slate-100 bg-slate-50/40 p-4 space-y-3">
                  <V2ChartReadOnlyView entry={entry} session={session} />
                  {onOpenSession && (
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onOpenSession(session.id)}
                      >
                        Open full session →
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
}
