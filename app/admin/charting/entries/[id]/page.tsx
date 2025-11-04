'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { chartingService } from '@/lib/database';
import { ChartingEntry, Session } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminRoute } from '@/components/auth/protected-route';
import { ArrowLeft, Calendar, User, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminChartingEntryDetailPage() {
  return (
    <AdminRoute>
      <EntryDetailContent />
    </AdminRoute>
  );
}

function EntryDetailContent() {
  const router = useRouter();
  const params = useParams();
  const entryId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState<ChartingEntry | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    loadData();
  }, [entryId]);

  const loadData = async () => {
    try {
      setLoading(true);

      const entryResult = await chartingService.getChartingEntry(entryId);

      if (entryResult.success && entryResult.data) {
        setEntry(entryResult.data);

        // Load the session
        const sessionResult = await chartingService.getSession(entryResult.data.sessionId);
        if (sessionResult.success && sessionResult.data) {
          setSession(sessionResult.data);
        }
      } else {
        toast.error('Entry not found');
        router.push('/admin/charting');
      }
    } catch (error) {
      console.error('Failed to load entry:', error);
      toast.error('Failed to load entry details');
    } finally {
      setLoading(false);
    }
  };

  const renderYesNoField = (label: string, field: any) => {
    if (!field) return null;

    return (
      <div className="py-3 border-b border-gray-200 last:border-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium text-gray-900">{label}</span>
          <Badge variant={field.value ? 'default' : 'secondary'}>
            {field.value ? 'Yes' : 'No'}
          </Badge>
        </div>
        {field.comments && (
          <p className="text-sm text-gray-600 mt-2">📝 {field.comments}</p>
        )}
      </div>
    );
  };

  const renderRadioField = (label: string, options: Record<string, any>) => {
    const selected = Object.entries(options).find(([_, value]) => value?.value);

    return (
      <div className="py-3 border-b border-gray-200 last:border-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium text-gray-900">{label}</span>
          {selected && (
            <Badge>
              {selected[0].replace(/([A-Z])/g, ' $1').trim()}
            </Badge>
          )}
        </div>
        {selected && selected[1]?.comments && (
          <p className="text-sm text-gray-600 mt-2">📝 {selected[1].comments}</p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <p>Loading entry details...</p>
      </div>
    );
  }

  if (!entry || !session) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <p>Entry not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/admin/charting')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              Charting Entry Details (Admin)
            </h1>
            <p className="text-gray-600">Complete charting data for this session</p>
          </div>
          <Badge variant={entry.submitterRole === 'admin' ? 'default' : 'secondary'}>
            {entry.submitterRole === 'admin' ? 'Admin Entry' : 'Student Entry'}
          </Badge>
        </div>

        {/* Session Info */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Session Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">
                  {session.date.toDate().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-medium">
                  {session.date.toDate().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Type & Opponent</p>
                <p className="font-medium">
                  {session.type === 'game' ? '🥅' : '🏒'} {session.opponent || 'Practice Session'}
                </p>
              </div>
            </div>

            {session.location && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{session.location}</p>
                </div>
              </div>
            )}
          </div>

          {entry.submittedAt && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Submitted on{' '}
                {entry.submittedAt.toDate().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}
        </Card>

        {/* Game Overview */}
        {entry.gameOverview && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Game Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Good Goals</p>
                <p className="text-4xl font-bold text-green-700 mb-2">
                  {(entry.gameOverview.goodGoals.period1 || 0) +
                    (entry.gameOverview.goodGoals.period2 || 0) +
                    (entry.gameOverview.goodGoals.period3 || 0)}
                </p>
                <div className="text-xs text-gray-600">
                  <div>P1: {entry.gameOverview.goodGoals.period1 || 0}</div>
                  <div>P2: {entry.gameOverview.goodGoals.period2 || 0}</div>
                  <div>P3: {entry.gameOverview.goodGoals.period3 || 0}</div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Bad Goals</p>
                <p className="text-4xl font-bold text-red-700 mb-2">
                  {(entry.gameOverview.badGoals.period1 || 0) +
                    (entry.gameOverview.badGoals.period2 || 0) +
                    (entry.gameOverview.badGoals.period3 || 0)}
                </p>
                <div className="text-xs text-gray-600">
                  <div>P1: {entry.gameOverview.badGoals.period1 || 0}</div>
                  <div>P2: {entry.gameOverview.badGoals.period2 || 0}</div>
                  <div>P3: {entry.gameOverview.badGoals.period3 || 0}</div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Challenge Rating</p>
                <p className="text-4xl font-bold text-blue-700 mb-2">
                  {(
                    ((entry.gameOverview.degreeOfChallenge.period1 || 0) +
                      (entry.gameOverview.degreeOfChallenge.period2 || 0) +
                      (entry.gameOverview.degreeOfChallenge.period3 || 0)) / 3
                  ).toFixed(1)}
                  <span className="text-lg">/10</span>
                </p>
                <div className="text-xs text-gray-600">
                  <div>P1: {entry.gameOverview.degreeOfChallenge.period1 || 0}/10</div>
                  <div>P2: {entry.gameOverview.degreeOfChallenge.period2 || 0}/10</div>
                  <div>P3: {entry.gameOverview.degreeOfChallenge.period3 || 0}/10</div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Pre-Game */}
        {entry.preGame && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pre-Game Checklist</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Game Readiness</h3>
                {renderYesNoField('Well Rested', entry.preGame.gameReadiness.wellRested)}
                {renderYesNoField('Fueled for Game', entry.preGame.gameReadiness.fueledForGame)}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Mind-Set</h3>
                {renderYesNoField('Mind Cleared', entry.preGame.mindSet.mindCleared)}
                {renderYesNoField('Mental Imagery', entry.preGame.mindSet.mentalImagery)}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Pre-Game Routine</h3>
                {renderYesNoField('Ball Exercises', entry.preGame.preGameRoutine.ballExercises)}
                {renderYesNoField('Stretching', entry.preGame.preGameRoutine.stretching)}
                {renderYesNoField('Other', entry.preGame.preGameRoutine.other)}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Warm-Up</h3>
                {renderYesNoField('Looked Engaged', entry.preGame.warmUp.lookedEngaged)}
                {renderYesNoField('Lacked Focus', entry.preGame.warmUp.lackedFocus)}
                {renderYesNoField('Team Warm-Up Needs Adjustment', entry.preGame.warmUp.teamWarmUpNeedsAdjustment)}
              </div>
            </div>
          </Card>
        )}

        {/* Periods */}
        {[1, 2, 3].map((periodNum) => {
          const periodKey = `period${periodNum}` as 'period1' | 'period2' | 'period3';
          const periodData = entry[periodKey];

          if (!periodData) return null;

          return (
            <Card key={periodKey} className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Period {periodNum}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Mind-Set</h3>
                  {renderRadioField('Focus', {
                    focusConsistent: periodData.mindSet.focusConsistent,
                    focusInconsistent: periodData.mindSet.focusInconsistent,
                  })}
                  {renderRadioField('Decision Making', {
                    decisionMakingStrong: periodData.mindSet.decisionMakingStrong,
                    decisionMakingImproving: periodData.mindSet.decisionMakingImproving,
                    decisionMakingNeedsWork: periodData.mindSet.decisionMakingNeedsWork,
                  })}
                  {renderRadioField('Body Language', {
                    bodyLanguageConsistent: periodData.mindSet.bodyLanguageConsistent,
                    bodyLanguageInconsistent: periodData.mindSet.bodyLanguageInconsistent,
                  })}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Skating</h3>
                  {renderRadioField('Skating Performance', {
                    inSyncWithPuck: periodData.skating.inSyncWithPuck,
                    improving: periodData.skating.improving,
                    weak: periodData.skating.weak,
                    notInSync: periodData.skating.notInSync,
                  })}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Positional - Above Icing</h3>
                  {renderRadioField('Performance Level', {
                    poor: periodData.positionalAboveIcing.poor,
                    improving: periodData.positionalAboveIcing.improving,
                    good: periodData.positionalAboveIcing.good,
                  })}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Positional - Below Icing</h3>
                  {renderRadioField('Performance Level', {
                    poor: periodData.positionalBelowIcing.poor,
                    improving: periodData.positionalBelowIcing.improving,
                    good: periodData.positionalBelowIcing.good,
                    strong: periodData.positionalBelowIcing.strong,
                  })}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Rebound Control</h3>
                  {renderRadioField('Quality', {
                    poor: periodData.reboundControl.poor,
                    improving: periodData.reboundControl.improving,
                    good: periodData.reboundControl.good,
                  })}
                  {renderRadioField('Consistency', {
                    consistent: periodData.reboundControl.consistent,
                    inconsistent: periodData.reboundControl.inconsistent,
                  })}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Freezing Puck</h3>
                  {renderRadioField('Quality', {
                    poor: periodData.freezingPuck.poor,
                    improving: periodData.freezingPuck.improving,
                    good: periodData.freezingPuck.good,
                  })}
                  {renderRadioField('Consistency', {
                    consistent: periodData.freezingPuck.consistent,
                    inconsistent: periodData.freezingPuck.inconsistent,
                  })}
                </div>

                {periodNum === 3 && periodData.teamPlay && (
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Team Play (Period 3)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        {renderRadioField('Setting Up Defense', {
                          poor: periodData.teamPlay.settingUpDefense.poor,
                          improving: periodData.teamPlay.settingUpDefense.improving,
                          good: periodData.teamPlay.settingUpDefense.good,
                        })}
                      </div>
                      <div>
                        {renderRadioField('Setting Up Forwards', {
                          poor: periodData.teamPlay.settingUpForwards.poor,
                          improving: periodData.teamPlay.settingUpForwards.improving,
                          good: periodData.teamPlay.settingUpForwards.good,
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}

        {/* Overtime & Shootout */}
        {(entry.overtime || entry.shootout) && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Overtime & Shootout</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {entry.overtime && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Overtime</h3>
                  {renderRadioField('Mind-Set Focus', {
                    good: entry.overtime.mindSetFocus.good,
                    needsWork: entry.overtime.mindSetFocus.needsWork,
                  })}
                  {renderRadioField('Skating Performance', {
                    good: entry.overtime.skatingPerformance.good,
                    needsWork: entry.overtime.skatingPerformance.needsWork,
                  })}
                  {renderRadioField('Positional Game', {
                    good: entry.overtime.positionalGame.good,
                    needsWork: entry.overtime.positionalGame.needsWork,
                  })}
                </div>
              )}

              {entry.shootout && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Shootout</h3>
                  <div className="space-y-3">
                    <div className="py-3 border-b border-gray-200">
                      <span className="font-medium text-gray-900">Result</span>
                      <p className="text-2xl font-bold mt-1">
                        <Badge variant={entry.shootout.result === 'won' ? 'default' : 'secondary'}>
                          {entry.shootout.result?.toUpperCase()}
                        </Badge>
                      </p>
                    </div>
                    <div className="py-3 border-b border-gray-200">
                      <span className="font-medium text-gray-900">Shots Saved</span>
                      <p className="text-2xl font-bold mt-1">{entry.shootout.shotsSaved || 0}</p>
                    </div>
                    <div className="py-3 border-b border-gray-200">
                      <span className="font-medium text-gray-900">Shots Scored</span>
                      <p className="text-2xl font-bold mt-1">{entry.shootout.shotsScored || 0}</p>
                    </div>
                    <div className="py-3">
                      <span className="font-medium text-gray-900">Save Percentage</span>
                      <p className="text-2xl font-bold mt-1">
                        {entry.shootout.shotsSaved && (entry.shootout.shotsSaved + entry.shootout.shotsScored) > 0
                          ? ((entry.shootout.shotsSaved / (entry.shootout.shotsSaved + entry.shootout.shotsScored)) * 100).toFixed(1)
                          : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Post-Game */}
        {entry.postGame && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Post-Game Review</h2>
            {renderYesNoField('Review Completed', entry.postGame.reviewCompleted)}
            {renderYesNoField('Review Not Completed', entry.postGame.reviewNotCompleted)}
          </Card>
        )}

        {/* Additional Comments */}
        {entry.additionalComments && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Comments</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{entry.additionalComments}</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
