'use client';

import { useEffect, useState } from 'react';
import { chartingService } from '@/lib/database';
import { Session, ChartingEntry, YesNoResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, CheckCircle } from 'lucide-react';

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

interface LegacyChartingFormProps {
  session: Session;
  user: any;
}

export default function LegacyChartingForm({ session, user }: LegacyChartingFormProps) {
  const [existingEntry, setExistingEntry] = useState<ChartingEntry | null>(null);
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
    if (session.id && user) {
      loadExistingEntry();
    }
  }, [session.id, user]);

  const loadExistingEntry = async () => {
    try {
      const entriesResult = await chartingService.getChartingEntriesBySession(session.id);

      if (entriesResult.success && entriesResult.data) {
        const myEntry = entriesResult.data.find((e) => e.submittedBy === user.id);
        if (myEntry) {
          setExistingEntry(myEntry);
          setFormData((prev: any) => ({
            ...prev,
            ...myEntry,
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load existing entry:', error);
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

  return (
    <div className="space-y-6">
      {/* Save Button (top) */}
      <div className="flex justify-end">
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

          <div className="flex justify-end pt-4">
            <Button onClick={() => setActiveTab('overview')}>Next: Game Overview →</Button>
          </div>
        </TabsContent>

        {/* Other tabs would continue here - abbreviated for brevity */}
        {/* Game Overview, Periods, Overtime/Shootout, Post-Game */}
        {/* The full implementation is in page.legacy.tsx */}

        {/* For now, show placeholder for other tabs */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="p-6">
            <p className="text-muted-foreground">Game Overview section - Full legacy form available in page.legacy.tsx</p>
          </Card>
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setActiveTab('pre-game')}>← Back</Button>
            <Button onClick={() => setActiveTab('periods')}>Next: Periods →</Button>
          </div>
        </TabsContent>

        <TabsContent value="periods" className="space-y-4">
          <Card className="p-6">
            <p className="text-muted-foreground">Periods section - Full legacy form available in page.legacy.tsx</p>
          </Card>
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setActiveTab('overview')}>← Back</Button>
            <Button onClick={() => setActiveTab('overtime')}>Next: OT/Shootout →</Button>
          </div>
        </TabsContent>

        <TabsContent value="overtime" className="space-y-4">
          <Card className="p-6">
            <p className="text-muted-foreground">Overtime/Shootout section - Full legacy form available in page.legacy.tsx</p>
          </Card>
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setActiveTab('periods')}>← Back</Button>
            <Button onClick={() => setActiveTab('post-game')}>Next: Post-Game →</Button>
          </div>
        </TabsContent>

        <TabsContent value="post-game" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Post-Game Review</h2>
            <div className="space-y-3">
              <YesNoField
                label="Game Review Completed"
                value={formData.postGame.reviewCompleted.value}
                comments={formData.postGame.reviewCompleted.comments}
                onChange={(k, v) => updateField('postGame', 'reviewCompleted', 'reviewCompleted', k, v)}
              />
              <YesNoField
                label="Game Review NOT Completed"
                value={formData.postGame.reviewNotCompleted.value}
                comments={formData.postGame.reviewNotCompleted.comments}
                onChange={(k, v) => updateField('postGame', 'reviewNotCompleted', 'reviewNotCompleted', k, v)}
              />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Additional Comments</h2>
            <textarea
              value={formData.additionalComments}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, additionalComments: e.target.value }))}
              placeholder="Any additional observations or notes about the session..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={5}
            />
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

      {/* Save Button (bottom) */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="w-4 w-4 mr-2" />
              Save Progress
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
