'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter, useParams } from 'next/navigation';
import { chartingService } from '@/lib/database';
import { Session, ChartingEntry, YesNoResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';

// Reusable Yes/No Field Component
const YesNoField = ({
  label,
  value,
  comments,
  onChange
}: {
  label: string;
  value: boolean;
  comments: string;
  onChange: (key: 'value' | 'comments', val: boolean | string) => void;
}) => (
  <div className="space-y-2 p-4 border border-gray-200 rounded-lg">
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange('value', e.target.checked)}
        className="w-5 h-5 rounded border-gray-300"
      />
      <label className="font-medium text-gray-900">{label}</label>
    </div>
    <textarea
      placeholder="Add comments..."
      value={comments}
      onChange={(e) => onChange('comments', e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
      rows={2}
    />
  </div>
);

export default function ChartingFormPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [existingEntry, setExistingEntry] = useState<ChartingEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('pre-game');

  // Initialize form with empty data structure
  const createEmptyYesNo = (): YesNoResponse => ({ value: false, comments: '' });

  const [formData, setFormData] = useState<any>({
    preGame: {
      gameReadiness: {
        wellRested: createEmptyYesNo(),
        fueledForGame: createEmptyYesNo(),
      },
      mindSet: {
        mindCleared: createEmptyYesNo(),
        mentalImagery: createEmptyYesNo(),
      },
      preGameRoutine: {
        ballExercises: createEmptyYesNo(),
        stretching: createEmptyYesNo(),
        other: createEmptyYesNo(),
      },
      warmUp: {
        lookedEngaged: createEmptyYesNo(),
        lackedFocus: createEmptyYesNo(),
        teamWarmUpNeedsAdjustment: createEmptyYesNo(),
      },
    },
    gameOverview: {
      goodGoals: { period1: 0, period2: 0, period3: 0 },
      badGoals: { period1: 0, period2: 0, period3: 0 },
      degreeOfChallenge: { period1: 5, period2: 5, period3: 5 },
    },
    period1: createPeriodData(),
    period2: createPeriodData(),
    period3: createPeriodDataWithTeamPlay(),
    overtime: {
      mindSetFocus: { poor: createEmptyYesNo(), needsWork: createEmptyYesNo(), good: createEmptyYesNo() },
      mindSetDecisionMaking: { strong: createEmptyYesNo(), improving: createEmptyYesNo(), needsWork: createEmptyYesNo() },
      skatingPerformance: { poor: createEmptyYesNo(), needsWork: createEmptyYesNo(), good: createEmptyYesNo() },
      positionalGame: { poor: createEmptyYesNo(), needsWork: createEmptyYesNo(), good: createEmptyYesNo() },
      reboundControl: { poor: createEmptyYesNo(), needsWork: createEmptyYesNo(), good: createEmptyYesNo() },
      freezingPuck: { poor: createEmptyYesNo(), needsWork: createEmptyYesNo(), good: createEmptyYesNo() },
    },
    shootout: {
      result: 'won' as 'won' | 'lost',
      shotsSaved: 0,
      shotsScored: 0,
      dekesSaved: 0,
      dekesScored: 0,
      comments: '',
    },
    postGame: {
      reviewCompleted: createEmptyYesNo(),
      reviewNotCompleted: createEmptyYesNo(),
    },
    additionalComments: '',
  });

  function createPeriodData() {
    return {
      mindSet: {
        focusConsistent: createEmptyYesNo(),
        focusInconsistent: createEmptyYesNo(),
        decisionMakingStrong: createEmptyYesNo(),
        decisionMakingImproving: createEmptyYesNo(),
        decisionMakingNeedsWork: createEmptyYesNo(),
        bodyLanguageConsistent: createEmptyYesNo(),
        bodyLanguageInconsistent: createEmptyYesNo(),
      },
      skating: {
        inSyncWithPuck: createEmptyYesNo(),
        improving: createEmptyYesNo(),
        weak: createEmptyYesNo(),
        notInSync: createEmptyYesNo(),
      },
      positionalAboveIcing: {
        poor: createEmptyYesNo(),
        improving: createEmptyYesNo(),
        good: createEmptyYesNo(),
        angleIssue: { selectedAngles: [] as number[], comments: '' },
      },
      positionalBelowIcing: {
        poor: createEmptyYesNo(),
        improving: createEmptyYesNo(),
        good: createEmptyYesNo(),
        strong: createEmptyYesNo(),
      },
      reboundControl: {
        poor: createEmptyYesNo(),
        improving: createEmptyYesNo(),
        good: createEmptyYesNo(),
        consistent: createEmptyYesNo(),
        inconsistent: createEmptyYesNo(),
      },
      freezingPuck: {
        poor: createEmptyYesNo(),
        improving: createEmptyYesNo(),
        good: createEmptyYesNo(),
        consistent: createEmptyYesNo(),
        inconsistent: createEmptyYesNo(),
      },
    };
  }

  function createPeriodDataWithTeamPlay() {
    return {
      ...createPeriodData(),
      teamPlay: {
        settingUpDefense: { poor: createEmptyYesNo(), improving: createEmptyYesNo(), good: createEmptyYesNo() },
        settingUpForwards: { poor: createEmptyYesNo(), improving: createEmptyYesNo(), good: createEmptyYesNo() },
      },
    };
  }

  useEffect(() => {
    if (sessionId && user) {
      loadData();
    }
  }, [sessionId, user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [sessionResult, entriesResult] = await Promise.all([
        chartingService.getSession(sessionId),
        chartingService.getChartingEntriesBySession(sessionId),
      ]);

      if (sessionResult.success && sessionResult.data) {
        setSession(sessionResult.data);
      }

      if (entriesResult.success && entriesResult.data) {
        const myEntry = entriesResult.data.find((e) => e.submittedBy === user.id);
        if (myEntry) {
          setExistingEntry(myEntry);
          // Load existing data into form
          setFormData((prev: any) => ({
            ...prev,
            ...myEntry,
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !session) return;

    try {
      setSaving(true);

      const entryData = {
        sessionId: session.id,
        studentId: session.studentId,
        submittedBy: user.id,
        submitterRole: (user.role || 'student') as 'student' | 'admin',
        ...formData,
      };

      if (existingEntry) {
        await chartingService.updateChartingEntry(existingEntry.id, entryData);
        alert('✅ Charting entry updated successfully!');
      } else {
        const result = await chartingService.createChartingEntry(entryData);
        if (result.success && result.data) {
          setExistingEntry({ ...entryData, id: result.data.id } as any);
          alert('✅ Charting entry created successfully!');
        }
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('❌ Failed to save charting entry');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (section: string, subsection: string, field: string, key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: {
            ...prev[section][subsection][field],
            [key]: value,
          },
        },
      },
    }));
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center"><p>Loading...</p></div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Session not found</p>
          <Button onClick={() => router.push('/charting')}>Back to Sessions</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Chart Performance</h1>
              <p className="text-gray-600 mt-1">
                {session.type === 'game' ? '🥅 Game' : '🏒 Practice'}
                {session.opponent && ` vs ${session.opponent}`}
              </p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <>Saving...</> : <><Save className="w-4 h-4" />Save Progress</>}
          </Button>
        </div>

        {/* Form Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pre-game">Pre-Game</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="periods">Periods</TabsTrigger>
            <TabsTrigger value="overtime">OT/Shootout</TabsTrigger>
            <TabsTrigger value="post-game">Post-Game</TabsTrigger>
          </TabsList>

          {/* Pre-Game Tab */}
          <TabsContent value="pre-game" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Game Readiness</h2>
              <div className="space-y-3">
                <YesNoField
                  label="Well Rested"
                  value={formData.preGame.gameReadiness.wellRested.value}
                  comments={formData.preGame.gameReadiness.wellRested.comments}
                  onChange={(k, v) => updateField('preGame', 'gameReadiness', 'wellRested', k, v)}
                />
                <YesNoField
                  label="Fueled for Game (Proper Nutrition)"
                  value={formData.preGame.gameReadiness.fueledForGame.value}
                  comments={formData.preGame.gameReadiness.fueledForGame.comments}
                  onChange={(k, v) => updateField('preGame', 'gameReadiness', 'fueledForGame', k, v)}
                />
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Mind-Set</h2>
              <div className="space-y-3">
                <YesNoField
                  label="Mind Cleared"
                  value={formData.preGame.mindSet.mindCleared.value}
                  comments={formData.preGame.mindSet.mindCleared.comments}
                  onChange={(k, v) => updateField('preGame', 'mindSet', 'mindCleared', k, v)}
                />
                <YesNoField
                  label="Mental Imagery Completed"
                  value={formData.preGame.mindSet.mentalImagery.value}
                  comments={formData.preGame.mindSet.mentalImagery.comments}
                  onChange={(k, v) => updateField('preGame', 'mindSet', 'mentalImagery', k, v)}
                />
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Pre-Game Routine</h2>
              <div className="space-y-3">
                <YesNoField
                  label="Ball Exercises Completed"
                  value={formData.preGame.preGameRoutine.ballExercises.value}
                  comments={formData.preGame.preGameRoutine.ballExercises.comments}
                  onChange={(k, v) => updateField('preGame', 'preGameRoutine', 'ballExercises', k, v)}
                />
                <YesNoField
                  label="Stretching Completed"
                  value={formData.preGame.preGameRoutine.stretching.value}
                  comments={formData.preGame.preGameRoutine.stretching.comments}
                  onChange={(k, v) => updateField('preGame', 'preGameRoutine', 'stretching', k, v)}
                />
                <YesNoField
                  label="Other Preparation"
                  value={formData.preGame.preGameRoutine.other.value}
                  comments={formData.preGame.preGameRoutine.other.comments}
                  onChange={(k, v) => updateField('preGame', 'preGameRoutine', 'other', k, v)}
                />
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Warm-Up</h2>
              <div className="space-y-3">
                <YesNoField
                  label="Looked Engaged During Warm-Up"
                  value={formData.preGame.warmUp.lookedEngaged.value}
                  comments={formData.preGame.warmUp.lookedEngaged.comments}
                  onChange={(k, v) => updateField('preGame', 'warmUp', 'lookedEngaged', k, v)}
                />
                <YesNoField
                  label="Lacked Focus During Warm-Up"
                  value={formData.preGame.warmUp.lackedFocus.value}
                  comments={formData.preGame.warmUp.lackedFocus.comments}
                  onChange={(k, v) => updateField('preGame', 'warmUp', 'lackedFocus', k, v)}
                />
                <YesNoField
                  label="Team Warm-Up Needs Adjustment"
                  value={formData.preGame.warmUp.teamWarmUpNeedsAdjustment.value}
                  comments={formData.preGame.warmUp.teamWarmUpNeedsAdjustment.comments}
                  onChange={(k, v) => updateField('preGame', 'warmUp', 'teamWarmUpNeedsAdjustment', k, v)}
                />
              </div>
            </Card>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button onClick={() => setActiveTab('overview')}>Next: Game Overview →</Button>
            </div>
          </TabsContent>

          {/* Game Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Good Goals & Bad Goals</h2>
              <div className="grid grid-cols-2 gap-6">
                {/* Good Goals */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-green-600">Good Goals</h3>
                  {['period1', 'period2', 'period3'].map((period, idx) => (
                    <div key={period}>
                      <Label>Period {idx + 1}</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.gameOverview.goodGoals[period]}
                        onChange={(e) => setFormData((prev: any) => ({
                          ...prev,
                          gameOverview: {
                            ...prev.gameOverview,
                            goodGoals: { ...prev.gameOverview.goodGoals, [period]: parseInt(e.target.value) || 0 }
                          }
                        }))}
                      />
                    </div>
                  ))}
                </div>

                {/* Bad Goals */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-red-600">Bad Goals</h3>
                  {['period1', 'period2', 'period3'].map((period, idx) => (
                    <div key={period}>
                      <Label>Period {idx + 1}</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.gameOverview.badGoals[period]}
                        onChange={(e) => setFormData((prev: any) => ({
                          ...prev,
                          gameOverview: {
                            ...prev.gameOverview,
                            badGoals: { ...prev.gameOverview.badGoals, [period]: parseInt(e.target.value) || 0 }
                          }
                        }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Degree of Challenge (1-10 scale)</h2>
              <div className="space-y-3">
                {['period1', 'period2', 'period3'].map((period, idx) => (
                  <div key={period}>
                    <Label>Period {idx + 1}: {formData.gameOverview.degreeOfChallenge[period]}/10</Label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.gameOverview.degreeOfChallenge[period]}
                      onChange={(e) => setFormData((prev: any) => ({
                        ...prev,
                        gameOverview: {
                          ...prev.gameOverview,
                          degreeOfChallenge: { ...prev.gameOverview.degreeOfChallenge, [period]: parseInt(e.target.value) }
                        }
                      }))}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setActiveTab('pre-game')}>← Back</Button>
              <Button onClick={() => setActiveTab('periods')}>Next: Periods →</Button>
            </div>
          </TabsContent>

          {/* Periods Tab (Simplified - shows Period 1, 2, 3 with tabs) */}
          <TabsContent value="periods" className="space-y-4">
            <Tabs defaultValue="period1">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="period1">Period 1</TabsTrigger>
                <TabsTrigger value="period2">Period 2</TabsTrigger>
                <TabsTrigger value="period3">Period 3</TabsTrigger>
              </TabsList>

              {['period1', 'period2', 'period3'].map((period) => (
                <TabsContent key={period} value={period} className="space-y-4">
                  {/* Mind-Set */}
                  <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Mind-Set</h2>
                    <div className="grid grid-cols-2 gap-3">
                      <YesNoField label="Focus: Consistent" value={formData[period].mindSet.focusConsistent.value} comments={formData[period].mindSet.focusConsistent.comments} onChange={(k, v) => updateField(period, 'mindSet', 'focusConsistent', k, v)} />
                      <YesNoField label="Focus: Inconsistent" value={formData[period].mindSet.focusInconsistent.value} comments={formData[period].mindSet.focusInconsistent.comments} onChange={(k, v) => updateField(period, 'mindSet', 'focusInconsistent', k, v)} />
                      <YesNoField label="Decision Making: Strong" value={formData[period].mindSet.decisionMakingStrong.value} comments={formData[period].mindSet.decisionMakingStrong.comments} onChange={(k, v) => updateField(period, 'mindSet', 'decisionMakingStrong', k, v)} />
                      <YesNoField label="Decision Making: Improving" value={formData[period].mindSet.decisionMakingImproving.value} comments={formData[period].mindSet.decisionMakingImproving.comments} onChange={(k, v) => updateField(period, 'mindSet', 'decisionMakingImproving', k, v)} />
                      <YesNoField label="Decision Making: Needs Work" value={formData[period].mindSet.decisionMakingNeedsWork.value} comments={formData[period].mindSet.decisionMakingNeedsWork.comments} onChange={(k, v) => updateField(period, 'mindSet', 'decisionMakingNeedsWork', k, v)} />
                      <YesNoField label="Body Language: Consistent" value={formData[period].mindSet.bodyLanguageConsistent.value} comments={formData[period].mindSet.bodyLanguageConsistent.comments} onChange={(k, v) => updateField(period, 'mindSet', 'bodyLanguageConsistent', k, v)} />
                      <YesNoField label="Body Language: Inconsistent" value={formData[period].mindSet.bodyLanguageInconsistent.value} comments={formData[period].mindSet.bodyLanguageInconsistent.comments} onChange={(k, v) => updateField(period, 'mindSet', 'bodyLanguageInconsistent', k, v)} />
                    </div>
                  </Card>

                  {/* Skating */}
                  <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Skating Performance</h2>
                    <div className="grid grid-cols-2 gap-3">
                      <YesNoField label="In Sync with Puck" value={formData[period].skating.inSyncWithPuck.value} comments={formData[period].skating.inSyncWithPuck.comments} onChange={(k, v) => updateField(period, 'skating', 'inSyncWithPuck', k, v)} />
                      <YesNoField label="Improving" value={formData[period].skating.improving.value} comments={formData[period].skating.improving.comments} onChange={(k, v) => updateField(period, 'skating', 'improving', k, v)} />
                      <YesNoField label="Weak" value={formData[period].skating.weak.value} comments={formData[period].skating.weak.comments} onChange={(k, v) => updateField(period, 'skating', 'weak', k, v)} />
                      <YesNoField label="Not In-Sync" value={formData[period].skating.notInSync.value} comments={formData[period].skating.notInSync.comments} onChange={(k, v) => updateField(period, 'skating', 'notInSync', k, v)} />
                    </div>
                  </Card>

                  {/* Positional Above Icing */}
                  <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Positional Game: Above Icing Line</h2>
                    <div className="space-y-3">
                      <YesNoField label="Poor" value={formData[period].positionalAboveIcing.poor.value} comments={formData[period].positionalAboveIcing.poor.comments} onChange={(k, v) => updateField(period, 'positionalAboveIcing', 'poor', k, v)} />
                      <YesNoField label="Improving" value={formData[period].positionalAboveIcing.improving.value} comments={formData[period].positionalAboveIcing.improving.comments} onChange={(k, v) => updateField(period, 'positionalAboveIcing', 'improving', k, v)} />
                      <YesNoField label="Good" value={formData[period].positionalAboveIcing.good.value} comments={formData[period].positionalAboveIcing.good.comments} onChange={(k, v) => updateField(period, 'positionalAboveIcing', 'good', k, v)} />
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <Label>Angle Issues (Select 1-7)</Label>
                        <div className="flex gap-2 mt-2">
                          {[1,2,3,4,5,6,7].map(num => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => {
                                const angles = formData[period].positionalAboveIcing.angleIssue.selectedAngles;
                                setFormData((prev: any) => ({
                                  ...prev,
                                  [period]: {
                                    ...prev[period],
                                    positionalAboveIcing: {
                                      ...prev[period].positionalAboveIcing,
                                      angleIssue: {
                                        ...prev[period].positionalAboveIcing.angleIssue,
                                        selectedAngles: angles.includes(num) ? angles.filter((n: number) => n !== num) : [...angles, num]
                                      }
                                    }
                                  }
                                }));
                              }}
                              className={`px-4 py-2 rounded ${formData[period].positionalAboveIcing.angleIssue.selectedAngles.includes(num) ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                        <textarea
                          placeholder="Angle issue comments..."
                          value={formData[period].positionalAboveIcing.angleIssue.comments}
                          onChange={(e) => setFormData((prev: any) => ({
                            ...prev,
                            [period]: {
                              ...prev[period],
                              positionalAboveIcing: {
                                ...prev[period].positionalAboveIcing,
                                angleIssue: { ...prev[period].positionalAboveIcing.angleIssue, comments: e.target.value }
                              }
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-2"
                          rows={2}
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Positional Below Icing */}
                  <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Positional Game: Below Icing Line</h2>
                    <div className="space-y-3">
                      <YesNoField label="Poor" value={formData[period].positionalBelowIcing.poor.value} comments={formData[period].positionalBelowIcing.poor.comments} onChange={(k, v) => updateField(period, 'positionalBelowIcing', 'poor', k, v)} />
                      <YesNoField label="Improving" value={formData[period].positionalBelowIcing.improving.value} comments={formData[period].positionalBelowIcing.improving.comments} onChange={(k, v) => updateField(period, 'positionalBelowIcing', 'improving', k, v)} />
                      <YesNoField label="Good" value={formData[period].positionalBelowIcing.good.value} comments={formData[period].positionalBelowIcing.good.comments} onChange={(k, v) => updateField(period, 'positionalBelowIcing', 'good', k, v)} />
                      <YesNoField label="Strong" value={formData[period].positionalBelowIcing.strong.value} comments={formData[period].positionalBelowIcing.strong.comments} onChange={(k, v) => updateField(period, 'positionalBelowIcing', 'strong', k, v)} />
                    </div>
                  </Card>

                  {/* Rebound Control */}
                  <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Rebound Control</h2>
                    <div className="grid grid-cols-2 gap-3">
                      <YesNoField label="Poor" value={formData[period].reboundControl.poor.value} comments={formData[period].reboundControl.poor.comments} onChange={(k, v) => updateField(period, 'reboundControl', 'poor', k, v)} />
                      <YesNoField label="Improving" value={formData[period].reboundControl.improving.value} comments={formData[period].reboundControl.improving.comments} onChange={(k, v) => updateField(period, 'reboundControl', 'improving', k, v)} />
                      <YesNoField label="Good" value={formData[period].reboundControl.good.value} comments={formData[period].reboundControl.good.comments} onChange={(k, v) => updateField(period, 'reboundControl', 'good', k, v)} />
                      <YesNoField label="Consistent" value={formData[period].reboundControl.consistent.value} comments={formData[period].reboundControl.consistent.comments} onChange={(k, v) => updateField(period, 'reboundControl', 'consistent', k, v)} />
                      <YesNoField label="Inconsistent" value={formData[period].reboundControl.inconsistent.value} comments={formData[period].reboundControl.inconsistent.comments} onChange={(k, v) => updateField(period, 'reboundControl', 'inconsistent', k, v)} />
                    </div>
                  </Card>

                  {/* Freezing Puck */}
                  <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Freezing the Puck</h2>
                    <div className="grid grid-cols-2 gap-3">
                      <YesNoField label="Poor" value={formData[period].freezingPuck.poor.value} comments={formData[period].freezingPuck.poor.comments} onChange={(k, v) => updateField(period, 'freezingPuck', 'poor', k, v)} />
                      <YesNoField label="Improving" value={formData[period].freezingPuck.improving.value} comments={formData[period].freezingPuck.improving.comments} onChange={(k, v) => updateField(period, 'freezingPuck', 'improving', k, v)} />
                      <YesNoField label="Good" value={formData[period].freezingPuck.good.value} comments={formData[period].freezingPuck.good.comments} onChange={(k, v) => updateField(period, 'freezingPuck', 'good', k, v)} />
                      <YesNoField label="Consistent" value={formData[period].freezingPuck.consistent.value} comments={formData[period].freezingPuck.consistent.comments} onChange={(k, v) => updateField(period, 'freezingPuck', 'consistent', k, v)} />
                      <YesNoField label="Inconsistent" value={formData[period].freezingPuck.inconsistent.value} comments={formData[period].freezingPuck.inconsistent.comments} onChange={(k, v) => updateField(period, 'freezingPuck', 'inconsistent', k, v)} />
                    </div>
                  </Card>

                  {/* Team Play (Period 3 only) */}
                  {period === 'period3' && (
                    <>
                      <Card className="p-6">
                        <h2 className="text-xl font-bold mb-4">Setting Up Defense</h2>
                        <div className="space-y-3">
                          <YesNoField label="Poor" value={formData.period3.teamPlay.settingUpDefense.poor.value} comments={formData.period3.teamPlay.settingUpDefense.poor.comments} onChange={(k, v) => updateField('period3', 'teamPlay', 'settingUpDefense', k, v)} />
                          <YesNoField label="Improving" value={formData.period3.teamPlay.settingUpDefense.improving.value} comments={formData.period3.teamPlay.settingUpDefense.improving.comments} onChange={(k, v) => updateField('period3', 'teamPlay', 'settingUpDefense', k, v)} />
                          <YesNoField label="Good" value={formData.period3.teamPlay.settingUpDefense.good.value} comments={formData.period3.teamPlay.settingUpDefense.good.comments} onChange={(k, v) => updateField('period3', 'teamPlay', 'settingUpDefense', k, v)} />
                        </div>
                      </Card>

                      <Card className="p-6">
                        <h2 className="text-xl font-bold mb-4">Setting Up Forwards</h2>
                        <div className="space-y-3">
                          <YesNoField label="Poor" value={formData.period3.teamPlay.settingUpForwards.poor.value} comments={formData.period3.teamPlay.settingUpForwards.poor.comments} onChange={(k, v) => updateField('period3', 'teamPlay', 'settingUpForwards', k, v)} />
                          <YesNoField label="Improving" value={formData.period3.teamPlay.settingUpForwards.improving.value} comments={formData.period3.teamPlay.settingUpForwards.improving.comments} onChange={(k, v) => updateField('period3', 'teamPlay', 'settingUpForwards', k, v)} />
                          <YesNoField label="Good" value={formData.period3.teamPlay.settingUpForwards.good.value} comments={formData.period3.teamPlay.settingUpForwards.good.comments} onChange={(k, v) => updateField('period3', 'teamPlay', 'settingUpForwards', k, v)} />
                        </div>
                      </Card>
                    </>
                  )}
                </TabsContent>
              ))}
            </Tabs>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setActiveTab('overview')}>← Back</Button>
              <Button onClick={() => setActiveTab('overtime')}>Next: OT/Shootout →</Button>
            </div>
          </TabsContent>

          {/* Overtime & Shootout Tab */}
          <TabsContent value="overtime" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Overtime Performance</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Mind-Set Focus</h3>
                  <div className="space-y-2">
                    <YesNoField label="Poor" value={formData.overtime.mindSetFocus.poor.value} comments={formData.overtime.mindSetFocus.poor.comments} onChange={(k, v) => updateField('overtime', 'mindSetFocus', 'poor', k, v)} />
                    <YesNoField label="Needs Work" value={formData.overtime.mindSetFocus.needsWork.value} comments={formData.overtime.mindSetFocus.needsWork.comments} onChange={(k, v) => updateField('overtime', 'mindSetFocus', 'needsWork', k, v)} />
                    <YesNoField label="Good" value={formData.overtime.mindSetFocus.good.value} comments={formData.overtime.mindSetFocus.good.comments} onChange={(k, v) => updateField('overtime', 'mindSetFocus', 'good', k, v)} />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Decision Making</h3>
                  <div className="space-y-2">
                    <YesNoField label="Strong" value={formData.overtime.mindSetDecisionMaking.strong.value} comments={formData.overtime.mindSetDecisionMaking.strong.comments} onChange={(k, v) => updateField('overtime', 'mindSetDecisionMaking', 'strong', k, v)} />
                    <YesNoField label="Improving" value={formData.overtime.mindSetDecisionMaking.improving.value} comments={formData.overtime.mindSetDecisionMaking.improving.comments} onChange={(k, v) => updateField('overtime', 'mindSetDecisionMaking', 'improving', k, v)} />
                    <YesNoField label="Needs Work" value={formData.overtime.mindSetDecisionMaking.needsWork.value} comments={formData.overtime.mindSetDecisionMaking.needsWork.comments} onChange={(k, v) => updateField('overtime', 'mindSetDecisionMaking', 'needsWork', k, v)} />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Skating Performance</h3>
                  <div className="space-y-2">
                    <YesNoField label="Poor" value={formData.overtime.skatingPerformance.poor.value} comments={formData.overtime.skatingPerformance.poor.comments} onChange={(k, v) => updateField('overtime', 'skatingPerformance', 'poor', k, v)} />
                    <YesNoField label="Needs Work" value={formData.overtime.skatingPerformance.needsWork.value} comments={formData.overtime.skatingPerformance.needsWork.comments} onChange={(k, v) => updateField('overtime', 'skatingPerformance', 'needsWork', k, v)} />
                    <YesNoField label="Good" value={formData.overtime.skatingPerformance.good.value} comments={formData.overtime.skatingPerformance.good.comments} onChange={(k, v) => updateField('overtime', 'skatingPerformance', 'good', k, v)} />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Shootout</h2>
              <div className="space-y-4">
                <div>
                  <Label>Result</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2">
                      <input type="radio" checked={formData.shootout.result === 'won'} onChange={() => setFormData((prev: any) => ({ ...prev, shootout: { ...prev.shootout, result: 'won' }}))} />
                      <span>Won</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" checked={formData.shootout.result === 'lost'} onChange={() => setFormData((prev: any) => ({ ...prev, shootout: { ...prev.shootout, result: 'lost' }}))} />
                      <span>Lost</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Shots Saved (0-10)</Label>
                    <Input type="number" min="0" max="10" value={formData.shootout.shotsSaved} onChange={(e) => setFormData((prev: any) => ({ ...prev, shootout: { ...prev.shootout, shotsSaved: parseInt(e.target.value) || 0 }}))} />
                  </div>
                  <div>
                    <Label>Shots Scored (0-10)</Label>
                    <Input type="number" min="0" max="10" value={formData.shootout.shotsScored} onChange={(e) => setFormData((prev: any) => ({ ...prev, shootout: { ...prev.shootout, shotsScored: parseInt(e.target.value) || 0 }}))} />
                  </div>
                  <div>
                    <Label>Dekes Saved (0-10)</Label>
                    <Input type="number" min="0" max="10" value={formData.shootout.dekesSaved} onChange={(e) => setFormData((prev: any) => ({ ...prev, shootout: { ...prev.shootout, dekesSaved: parseInt(e.target.value) || 0 }}))} />
                  </div>
                  <div>
                    <Label>Dekes Scored (0-10)</Label>
                    <Input type="number" min="0" max="10" value={formData.shootout.dekesScored} onChange={(e) => setFormData((prev: any) => ({ ...prev, shootout: { ...prev.shootout, dekesScored: parseInt(e.target.value) || 0 }}))} />
                  </div>
                </div>

                <div>
                  <Label>Comments</Label>
                  <textarea value={formData.shootout.comments} onChange={(e) => setFormData((prev: any) => ({ ...prev, shootout: { ...prev.shootout, comments: e.target.value }}))} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={3} />
                </div>
              </div>
            </Card>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setActiveTab('periods')}>← Back</Button>
              <Button onClick={() => setActiveTab('post-game')}>Next: Post-Game →</Button>
            </div>
          </TabsContent>

          {/* Post-Game Tab */}
          <TabsContent value="post-game" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Post-Game Review</h2>
              <div className="space-y-3">
                <YesNoField label="Game Review Completed" value={formData.postGame.reviewCompleted.value} comments={formData.postGame.reviewCompleted.comments} onChange={(k, v) => updateField('postGame', 'reviewCompleted', 'reviewCompleted', k, v)} />
                <YesNoField label="Game Review NOT Completed" value={formData.postGame.reviewNotCompleted.value} comments={formData.postGame.reviewNotCompleted.comments} onChange={(k, v) => updateField('postGame', 'reviewNotCompleted', 'reviewNotCompleted', k, v)} />
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Additional Comments</h2>
              <textarea value={formData.additionalComments} onChange={(e) => setFormData((prev: any) => ({ ...prev, additionalComments: e.target.value }))} placeholder="Any additional observations or notes about the session..." className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={5} />
            </Card>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setActiveTab('overtime')}>← Back</Button>
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                <CheckCircle className="w-4 h-4" />
                Complete & Save
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
