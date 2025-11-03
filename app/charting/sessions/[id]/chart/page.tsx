'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter, useParams } from 'next/navigation';
import { chartingService } from '@/lib/database';
import { Session, ChartingEntry, YesNoResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

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

  // Form state - we'll expand this with all fields
  const [formData, setFormData] = useState({
    preGame: {
      gameReadiness: {
        wellRested: { value: false, comments: '' } as YesNoResponse,
        fueledForGame: { value: false, comments: '' } as YesNoResponse,
      },
      mindSet: {
        mindCleared: { value: false, comments: '' } as YesNoResponse,
        mentalImagery: { value: false, comments: '' } as YesNoResponse,
      },
      preGameRoutine: {
        ballExercises: { value: false, comments: '' } as YesNoResponse,
        stretching: { value: false, comments: '' } as YesNoResponse,
        other: { value: false, comments: '' } as YesNoResponse,
      },
      warmUp: {
        lookedEngaged: { value: false, comments: '' } as YesNoResponse,
        lackedFocus: { value: false, comments: '' } as YesNoResponse,
        teamWarmUpNeedsAdjustment: { value: false, comments: '' } as YesNoResponse,
      },
    },
  });

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
        // Find user's existing entry
        const myEntry = entriesResult.data.find((e) => e.submittedBy === user.id);
        if (myEntry) {
          setExistingEntry(myEntry);
          // Load existing data into form
          if (myEntry.preGame) {
            setFormData((prev) => ({
              ...prev,
              preGame: myEntry.preGame!,
            }));
          }
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
        preGame: formData.preGame,
        // Will add more sections here
      };

      if (existingEntry) {
        // Update existing entry
        await chartingService.updateChartingEntry(existingEntry.id, entryData);
        alert('Charting entry updated successfully!');
      } else {
        // Create new entry
        const result = await chartingService.createChartingEntry(entryData);
        if (result.success && result.data) {
          setExistingEntry({ ...entryData, id: result.data.id } as ChartingEntry);
          alert('Charting entry created successfully!');
        }
      }

      // Optionally redirect back to session detail
      // router.push(`/charting/sessions/${sessionId}`);
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Failed to save charting entry');
    } finally {
      setSaving(false);
    }
  };

  const updateYesNoField = (
    section: keyof typeof formData.preGame,
    field: string,
    key: 'value' | 'comments',
    newValue: boolean | string
  ) => {
    setFormData((prev) => ({
      ...prev,
      preGame: {
        ...prev.preGame,
        [section]: {
          ...prev.preGame[section],
          [field]: {
            ...prev.preGame[section][field as keyof typeof prev.preGame[typeof section]],
            [key]: newValue,
          },
        },
      },
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <p>Loading session...</p>
      </div>
    );
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
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Progress
              </>
            )}
          </Button>
        </div>

        {/* Form Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pre-game">Pre-Game</TabsTrigger>
            <TabsTrigger value="overview">Game Overview</TabsTrigger>
            <TabsTrigger value="periods">Periods</TabsTrigger>
            <TabsTrigger value="overtime">Overtime/Shootout</TabsTrigger>
            <TabsTrigger value="post-game">Post-Game</TabsTrigger>
          </TabsList>

          {/* Pre-Game Tab */}
          <TabsContent value="pre-game" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Game Readiness</h2>
              <div className="space-y-4">
                {/* Well Rested */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="wellRested"
                      checked={formData.preGame.gameReadiness.wellRested.value}
                      onChange={(e) =>
                        updateYesNoField('gameReadiness', 'wellRested', 'value', e.target.checked)
                      }
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <label htmlFor="wellRested" className="font-medium text-gray-900">
                      Well Rested
                    </label>
                  </div>
                  <textarea
                    placeholder="Add comments..."
                    value={formData.preGame.gameReadiness.wellRested.comments}
                    onChange={(e) =>
                      updateYesNoField('gameReadiness', 'wellRested', 'comments', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                  />
                </div>

                {/* Fueled for Game */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="fueledForGame"
                      checked={formData.preGame.gameReadiness.fueledForGame.value}
                      onChange={(e) =>
                        updateYesNoField('gameReadiness', 'fueledForGame', 'value', e.target.checked)
                      }
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <label htmlFor="fueledForGame" className="font-medium text-gray-900">
                      Fueled for Game (Proper Nutrition)
                    </label>
                  </div>
                  <textarea
                    placeholder="Add comments..."
                    value={formData.preGame.gameReadiness.fueledForGame.comments}
                    onChange={(e) =>
                      updateYesNoField('gameReadiness', 'fueledForGame', 'comments', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Mind-Set</h2>
              <div className="space-y-4">
                {/* Mind Cleared */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="mindCleared"
                      checked={formData.preGame.mindSet.mindCleared.value}
                      onChange={(e) =>
                        updateYesNoField('mindSet', 'mindCleared', 'value', e.target.checked)
                      }
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <label htmlFor="mindCleared" className="font-medium text-gray-900">
                      Mind Cleared
                    </label>
                  </div>
                  <textarea
                    placeholder="Add comments..."
                    value={formData.preGame.mindSet.mindCleared.comments}
                    onChange={(e) =>
                      updateYesNoField('mindSet', 'mindCleared', 'comments', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                  />
                </div>

                {/* Mental Imagery */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="mentalImagery"
                      checked={formData.preGame.mindSet.mentalImagery.value}
                      onChange={(e) =>
                        updateYesNoField('mindSet', 'mentalImagery', 'value', e.target.checked)
                      }
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <label htmlFor="mentalImagery" className="font-medium text-gray-900">
                      Mental Imagery Completed
                    </label>
                  </div>
                  <textarea
                    placeholder="Add comments..."
                    value={formData.preGame.mindSet.mentalImagery.comments}
                    onChange={(e) =>
                      updateYesNoField('mindSet', 'mentalImagery', 'comments', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Pre-Game Routine</h2>
              <div className="space-y-4">
                {/* Ball Exercises */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="ballExercises"
                      checked={formData.preGame.preGameRoutine.ballExercises.value}
                      onChange={(e) =>
                        updateYesNoField('preGameRoutine', 'ballExercises', 'value', e.target.checked)
                      }
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <label htmlFor="ballExercises" className="font-medium text-gray-900">
                      Ball Exercises Completed
                    </label>
                  </div>
                  <textarea
                    placeholder="Add comments..."
                    value={formData.preGame.preGameRoutine.ballExercises.comments}
                    onChange={(e) =>
                      updateYesNoField('preGameRoutine', 'ballExercises', 'comments', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                  />
                </div>

                {/* Stretching */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="stretching"
                      checked={formData.preGame.preGameRoutine.stretching.value}
                      onChange={(e) =>
                        updateYesNoField('preGameRoutine', 'stretching', 'value', e.target.checked)
                      }
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <label htmlFor="stretching" className="font-medium text-gray-900">
                      Stretching Completed
                    </label>
                  </div>
                  <textarea
                    placeholder="Add comments..."
                    value={formData.preGame.preGameRoutine.stretching.comments}
                    onChange={(e) =>
                      updateYesNoField('preGameRoutine', 'stretching', 'comments', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                  />
                </div>

                {/* Other */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="other"
                      checked={formData.preGame.preGameRoutine.other.value}
                      onChange={(e) =>
                        updateYesNoField('preGameRoutine', 'other', 'value', e.target.checked)
                      }
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <label htmlFor="other" className="font-medium text-gray-900">
                      Other Preparation
                    </label>
                  </div>
                  <textarea
                    placeholder="Describe other preparation activities..."
                    value={formData.preGame.preGameRoutine.other.comments}
                    onChange={(e) =>
                      updateYesNoField('preGameRoutine', 'other', 'comments', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Warm-Up</h2>
              <div className="space-y-4">
                {/* Looked Engaged */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="lookedEngaged"
                      checked={formData.preGame.warmUp.lookedEngaged.value}
                      onChange={(e) =>
                        updateYesNoField('warmUp', 'lookedEngaged', 'value', e.target.checked)
                      }
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <label htmlFor="lookedEngaged" className="font-medium text-gray-900">
                      Looked Engaged During Warm-Up
                    </label>
                  </div>
                  <textarea
                    placeholder="Add comments..."
                    value={formData.preGame.warmUp.lookedEngaged.comments}
                    onChange={(e) =>
                      updateYesNoField('warmUp', 'lookedEngaged', 'comments', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                  />
                </div>

                {/* Lacked Focus */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="lackedFocus"
                      checked={formData.preGame.warmUp.lackedFocus.value}
                      onChange={(e) =>
                        updateYesNoField('warmUp', 'lackedFocus', 'value', e.target.checked)
                      }
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <label htmlFor="lackedFocus" className="font-medium text-gray-900">
                      Lacked Focus During Warm-Up
                    </label>
                  </div>
                  <textarea
                    placeholder="Add comments..."
                    value={formData.preGame.warmUp.lackedFocus.comments}
                    onChange={(e) =>
                      updateYesNoField('warmUp', 'lackedFocus', 'comments', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                  />
                </div>

                {/* Team Warm-Up Needs Adjustment */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="teamWarmUpNeedsAdjustment"
                      checked={formData.preGame.warmUp.teamWarmUpNeedsAdjustment.value}
                      onChange={(e) =>
                        updateYesNoField('warmUp', 'teamWarmUpNeedsAdjustment', 'value', e.target.checked)
                      }
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <label htmlFor="teamWarmUpNeedsAdjustment" className="font-medium text-gray-900">
                      Team Warm-Up Needs Adjustment
                    </label>
                  </div>
                  <textarea
                    placeholder="Describe what adjustments are needed..."
                    value={formData.preGame.warmUp.teamWarmUpNeedsAdjustment.comments}
                    onChange={(e) =>
                      updateYesNoField('warmUp', 'teamWarmUpNeedsAdjustment', 'comments', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                  />
                </div>
              </div>
            </Card>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <div className="flex gap-3">
                <Button onClick={handleSave} disabled={saving} variant="outline">
                  Save Draft
                </Button>
                <Button onClick={() => setActiveTab('overview')}>
                  Next: Game Overview →
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Other Tabs - Placeholders for now */}
          <TabsContent value="overview">
            <Card className="p-12 text-center">
              <h2 className="text-xl font-bold mb-2">Game Overview</h2>
              <p className="text-gray-600 mb-4">Coming soon - Track good goals, bad goals, and degree of challenge by period</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setActiveTab('pre-game')}>
                  ← Back
                </Button>
                <Button onClick={() => setActiveTab('periods')}>
                  Next: Periods →
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="periods">
            <Card className="p-12 text-center">
              <h2 className="text-xl font-bold mb-2">Period-by-Period Tracking</h2>
              <p className="text-gray-600 mb-4">Coming soon - Track performance for each period</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setActiveTab('overview')}>
                  ← Back
                </Button>
                <Button onClick={() => setActiveTab('overtime')}>
                  Next: Overtime/Shootout →
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="overtime">
            <Card className="p-12 text-center">
              <h2 className="text-xl font-bold mb-2">Overtime & Shootout</h2>
              <p className="text-gray-600 mb-4">Coming soon - Track overtime and shootout performance</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setActiveTab('periods')}>
                  ← Back
                </Button>
                <Button onClick={() => setActiveTab('post-game')}>
                  Next: Post-Game →
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="post-game">
            <Card className="p-12 text-center">
              <h2 className="text-xl font-bold mb-2">Post-Game Review</h2>
              <p className="text-gray-600 mb-4">Coming soon - Complete post-game review</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setActiveTab('overtime')}>
                  ← Back
                </Button>
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Complete & Save
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
