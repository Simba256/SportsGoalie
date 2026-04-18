'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartingEntry } from '@/types';

interface ChartingEntryDetailsProps {
  entry: ChartingEntry;
}

function renderYesNoField(label: string, field: any) {
  if (!field) return null;
  return (
    <div className="py-3 border-b border-border last:border-0">
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-foreground">{label}</span>
        <Badge variant={field.value ? 'default' : 'secondary'}>
          {field.value ? 'Yes' : 'No'}
        </Badge>
      </div>
      {field.comments && (
        <p className="text-sm text-muted-foreground mt-2">📝 {field.comments}</p>
      )}
    </div>
  );
}

function renderRadioField(label: string, options: Record<string, any>) {
  const selected = Object.entries(options).find(([_, value]) => value?.value);
  return (
    <div className="py-3 border-b border-border last:border-0">
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-foreground">{label}</span>
        {selected && (
          <Badge>
            {selected[0].replace(/([A-Z])/g, ' $1').trim()}
          </Badge>
        )}
      </div>
      {selected && selected[1]?.comments && (
        <p className="text-sm text-muted-foreground mt-2">📝 {selected[1].comments}</p>
      )}
    </div>
  );
}

export function ChartingEntryDetails({ entry }: ChartingEntryDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Game Overview */}
      {entry.gameOverview && (
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-bold text-foreground mb-4 sm:text-xl">Game Overview</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 dark:bg-emerald-500/10 dark:border-emerald-500/20">
              <p className="text-sm text-muted-foreground mb-2">Good Goals</p>
              <p className="text-3xl font-bold text-emerald-700 mb-2 sm:text-4xl dark:text-emerald-400">
                {(entry.gameOverview.goodGoals.period1 || 0) +
                  (entry.gameOverview.goodGoals.period2 || 0) +
                  (entry.gameOverview.goodGoals.period3 || 0)}
              </p>
              <div className="text-xs text-muted-foreground">
                <div>P1: {entry.gameOverview.goodGoals.period1 || 0}</div>
                <div>P2: {entry.gameOverview.goodGoals.period2 || 0}</div>
                <div>P3: {entry.gameOverview.goodGoals.period3 || 0}</div>
              </div>
            </div>

            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Bad Goals</p>
              <p className="text-3xl font-bold text-destructive mb-2 sm:text-4xl">
                {(entry.gameOverview.badGoals.period1 || 0) +
                  (entry.gameOverview.badGoals.period2 || 0) +
                  (entry.gameOverview.badGoals.period3 || 0)}
              </p>
              <div className="text-xs text-muted-foreground">
                <div>P1: {entry.gameOverview.badGoals.period1 || 0}</div>
                <div>P2: {entry.gameOverview.badGoals.period2 || 0}</div>
                <div>P3: {entry.gameOverview.badGoals.period3 || 0}</div>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Challenge Rating</p>
              <p className="text-3xl font-bold text-primary mb-2 sm:text-4xl">
                {(
                  ((entry.gameOverview.degreeOfChallenge.period1 || 0) +
                    (entry.gameOverview.degreeOfChallenge.period2 || 0) +
                    (entry.gameOverview.degreeOfChallenge.period3 || 0)) / 3
                ).toFixed(1)}
                <span className="text-lg">/10</span>
              </p>
              <div className="text-xs text-muted-foreground">
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
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-bold text-foreground mb-4 sm:text-xl">Pre-Game Checklist</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-base font-semibold text-foreground mb-3 sm:text-lg">Game Readiness</h3>
              {renderYesNoField('Well Rested', entry.preGame.gameReadiness?.wellRested)}
              {renderYesNoField('Fueled for Game', entry.preGame.gameReadiness?.fueledForGame)}
            </div>

            <div>
              <h3 className="text-base font-semibold text-foreground mb-3 sm:text-lg">Mind-Set</h3>
              {renderYesNoField('Mind Cleared', entry.preGame.mindSet?.mindCleared)}
              {renderYesNoField('Mental Imagery', entry.preGame.mindSet?.mentalImagery)}
            </div>

            <div>
              <h3 className="text-base font-semibold text-foreground mb-3 sm:text-lg">Pre-Game Routine</h3>
              {renderYesNoField('Ball Exercises', entry.preGame.preGameRoutine?.ballExercises)}
              {renderYesNoField('Stretching', entry.preGame.preGameRoutine?.stretching)}
              {renderYesNoField('Other', entry.preGame.preGameRoutine?.other)}
            </div>

            <div>
              <h3 className="text-base font-semibold text-foreground mb-3 sm:text-lg">Warm-Up</h3>
              {renderYesNoField('Looked Engaged', entry.preGame.warmUp?.lookedEngaged)}
              {renderYesNoField('Lacked Focus', entry.preGame.warmUp?.lackedFocus)}
              {renderYesNoField('Team Warm-Up Needs Adjustment', entry.preGame.warmUp?.teamWarmUpNeedsAdjustment)}
            </div>
          </div>
        </Card>
      )}

      {/* Periods */}
      {[1, 2, 3].map((periodNum) => {
        const periodKey = `period${periodNum}` as 'period1' | 'period2' | 'period3';
        const periodData = entry[periodKey] as any;
        if (!periodData) return null;

        return (
          <Card key={periodKey} className="p-4 sm:p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 sm:text-xl">Period {periodNum}</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-base font-semibold text-foreground mb-3 sm:text-lg">Mind-Set</h3>
                {renderRadioField('Focus', {
                  focusConsistent: periodData.mindSet?.focusConsistent,
                  focusInconsistent: periodData.mindSet?.focusInconsistent,
                })}
                {renderRadioField('Decision Making', {
                  decisionMakingStrong: periodData.mindSet?.decisionMakingStrong,
                  decisionMakingImproving: periodData.mindSet?.decisionMakingImproving,
                  decisionMakingNeedsWork: periodData.mindSet?.decisionMakingNeedsWork,
                })}
                {renderRadioField('Body Language', {
                  bodyLanguageConsistent: periodData.mindSet?.bodyLanguageConsistent,
                  bodyLanguageInconsistent: periodData.mindSet?.bodyLanguageInconsistent,
                })}
              </div>

              <div>
                <h3 className="text-base font-semibold text-foreground mb-3 sm:text-lg">Skating</h3>
                {renderRadioField('Skating Performance', {
                  inSyncWithPuck: periodData.skating?.inSyncWithPuck,
                  improving: periodData.skating?.improving,
                  weak: periodData.skating?.weak,
                  notInSync: periodData.skating?.notInSync,
                })}
              </div>

              <div>
                <h3 className="text-base font-semibold text-foreground mb-3 sm:text-lg">Positional — Above Icing</h3>
                {renderRadioField('Performance Level', {
                  poor: periodData.positionalAboveIcing?.poor,
                  improving: periodData.positionalAboveIcing?.improving,
                  good: periodData.positionalAboveIcing?.good,
                })}
              </div>

              <div>
                <h3 className="text-base font-semibold text-foreground mb-3 sm:text-lg">Positional — Below Icing</h3>
                {renderRadioField('Performance Level', {
                  poor: periodData.positionalBelowIcing?.poor,
                  improving: periodData.positionalBelowIcing?.improving,
                  good: periodData.positionalBelowIcing?.good,
                  strong: periodData.positionalBelowIcing?.strong,
                })}
              </div>

              <div>
                <h3 className="text-base font-semibold text-foreground mb-3 sm:text-lg">Rebound Control</h3>
                {renderRadioField('Quality', {
                  poor: periodData.reboundControl?.poor,
                  improving: periodData.reboundControl?.improving,
                  good: periodData.reboundControl?.good,
                })}
                {renderRadioField('Consistency', {
                  consistent: periodData.reboundControl?.consistent,
                  inconsistent: periodData.reboundControl?.inconsistent,
                })}
              </div>

              <div>
                <h3 className="text-base font-semibold text-foreground mb-3 sm:text-lg">Freezing Puck</h3>
                {renderRadioField('Quality', {
                  poor: periodData.freezingPuck?.poor,
                  improving: periodData.freezingPuck?.improving,
                  good: periodData.freezingPuck?.good,
                })}
                {renderRadioField('Consistency', {
                  consistent: periodData.freezingPuck?.consistent,
                  inconsistent: periodData.freezingPuck?.inconsistent,
                })}
              </div>

              {periodNum === 3 && periodData.teamPlay && (
                <div className="md:col-span-2">
                  <h3 className="text-base font-semibold text-foreground mb-3 sm:text-lg">Team Play (Period 3)</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      {renderRadioField('Setting Up Defense', {
                        poor: periodData.teamPlay.settingUpDefense?.poor,
                        improving: periodData.teamPlay.settingUpDefense?.improving,
                        good: periodData.teamPlay.settingUpDefense?.good,
                      })}
                    </div>
                    <div>
                      {renderRadioField('Setting Up Forwards', {
                        poor: periodData.teamPlay.settingUpForwards?.poor,
                        improving: periodData.teamPlay.settingUpForwards?.improving,
                        good: periodData.teamPlay.settingUpForwards?.good,
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
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-bold text-foreground mb-4 sm:text-xl">Overtime & Shootout</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {entry.overtime && (
              <div>
                <h3 className="text-base font-semibold text-foreground mb-3 sm:text-lg">Overtime</h3>
                {renderRadioField('Mind-Set Focus', {
                  good: entry.overtime.mindSetFocus?.good,
                  needsWork: entry.overtime.mindSetFocus?.needsWork,
                })}
                {renderRadioField('Skating Performance', {
                  good: entry.overtime.skatingPerformance?.good,
                  needsWork: entry.overtime.skatingPerformance?.needsWork,
                })}
                {renderRadioField('Positional Game', {
                  good: entry.overtime.positionalGame?.good,
                  needsWork: entry.overtime.positionalGame?.needsWork,
                })}
              </div>
            )}

            {entry.shootout && (
              <div>
                <h3 className="text-base font-semibold text-foreground mb-3 sm:text-lg">Shootout</h3>
                <div className="space-y-3">
                  <div className="py-3 border-b border-border">
                    <span className="font-medium text-foreground">Result</span>
                    <p className="text-2xl font-bold mt-1">
                      <Badge variant={entry.shootout.result === 'won' ? 'default' : 'secondary'}>
                        {entry.shootout.result?.toUpperCase()}
                      </Badge>
                    </p>
                  </div>
                  <div className="py-3 border-b border-border">
                    <span className="font-medium text-foreground">Shots Saved</span>
                    <p className="text-2xl font-bold mt-1">{entry.shootout.shotsSaved || 0}</p>
                  </div>
                  <div className="py-3 border-b border-border">
                    <span className="font-medium text-foreground">Shots Scored</span>
                    <p className="text-2xl font-bold mt-1">{entry.shootout.shotsScored || 0}</p>
                  </div>
                  <div className="py-3">
                    <span className="font-medium text-foreground">Save Percentage</span>
                    <p className="text-2xl font-bold mt-1">
                      {entry.shootout.shotsSaved &&
                      (entry.shootout.shotsSaved + entry.shootout.shotsScored) > 0
                        ? (
                            (entry.shootout.shotsSaved /
                              (entry.shootout.shotsSaved + entry.shootout.shotsScored)) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
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
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-bold text-foreground mb-4 sm:text-xl">Post-Game Review</h2>
          {renderYesNoField('Review Completed', entry.postGame.reviewCompleted)}
          {renderYesNoField('Review Not Completed', entry.postGame.reviewNotCompleted)}
        </Card>
      )}

      {/* Additional Comments */}
      {entry.additionalComments && (
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-bold text-foreground mb-4 sm:text-xl">Additional Comments</h2>
          <div className="bg-muted border border-border rounded-lg p-4">
            <p className="text-foreground whitespace-pre-wrap">{entry.additionalComments}</p>
          </div>
        </Card>
      )}
    </div>
  );
}
