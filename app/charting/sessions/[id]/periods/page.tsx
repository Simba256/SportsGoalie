'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter, useParams } from 'next/navigation';
import { chartingService } from '@/lib/database';
import { Session, ChartingEntry, PeriodData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import { YesNoField, createEmptyYesNo } from '@/components/charting/YesNoField';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const createEmptyPeriodData = (): PeriodData => ({
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
    angleIssue: {
      selectedAngles: [],
      comments: '',
    },
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
});

export default function PeriodsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [existingEntry, setExistingEntry] = useState<ChartingEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activePeriod, setActivePeriod] = useState('period1');

  const [period1Data, setPeriod1Data] = useState<PeriodData>(createEmptyPeriodData());
  const [period2Data, setPeriod2Data] = useState<PeriodData>(createEmptyPeriodData());
  const [period3Data, setPeriod3Data] = useState<PeriodData>({
    ...createEmptyPeriodData(),
    teamPlay: {
      settingUpDefense: {
        poor: createEmptyYesNo(),
        improving: createEmptyYesNo(),
        good: createEmptyYesNo(),
      },
      settingUpForwards: {
        poor: createEmptyYesNo(),
        improving: createEmptyYesNo(),
        good: createEmptyYesNo(),
      },
    },
  });

  useEffect(() => {
    loadData();
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
          if (myEntry.period1) setPeriod1Data(myEntry.period1);
          if (myEntry.period2) setPeriod2Data(myEntry.period2);
          if (myEntry.period3) setPeriod3Data(myEntry.period3);
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Failed to load session data');
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
        period1: period1Data,
        period2: period2Data,
        period3: period3Data,
      };

      if (existingEntry) {
        await chartingService.updateChartingEntry(existingEntry.id, entryData);
        alert('Periods data saved successfully!');
        router.push(`/charting/sessions/${sessionId}`);
      } else {
        const result = await chartingService.createChartingEntry(entryData);
        if (result.success && result.data) {
          const newEntryResult = await chartingService.getChartingEntry(result.data.id);
          if (newEntryResult.success && newEntryResult.data) {
            setExistingEntry(newEntryResult.data);
          }
        }
        alert('Periods data created successfully!');
        router.push(`/charting/sessions/${sessionId}`);
      }
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save data');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (
    period: 'period1' | 'period2' | 'period3',
    section: string,
    field: string,
    key: 'value' | 'comments',
    value: any
  ) => {
    const setPeriodData = period === 'period1' ? setPeriod1Data : period === 'period2' ? setPeriod2Data : setPeriod3Data;

    setPeriodData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: {
          ...prev[section][field],
          [key]: value,
        },
      },
    }));
  };

  const renderPeriodForm = (period: 'period1' | 'period2' | 'period3') => {
    const data = period === 'period1' ? period1Data : period === 'period2' ? period2Data : period3Data;
    const isPeriod3 = period === 'period3';

    return (
      <div className="space-y-6">
        {/* Mind-Set */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Mind-Set</h3>
          <div className="space-y-4">
            <YesNoField
              label="Focus - Consistent"
              value={data.mindSet.focusConsistent.value}
              comments={data.mindSet.focusConsistent.comments}
              onChange={(k, v) => updateField(period, 'mindSet', 'focusConsistent', k, v)}
            />
            <YesNoField
              label="Focus - Inconsistent"
              value={data.mindSet.focusInconsistent.value}
              comments={data.mindSet.focusInconsistent.comments}
              onChange={(k, v) => updateField(period, 'mindSet', 'focusInconsistent', k, v)}
            />
            <YesNoField
              label="Decision Making - Strong"
              value={data.mindSet.decisionMakingStrong.value}
              comments={data.mindSet.decisionMakingStrong.comments}
              onChange={(k, v) => updateField(period, 'mindSet', 'decisionMakingStrong', k, v)}
            />
            <YesNoField
              label="Decision Making - Improving"
              value={data.mindSet.decisionMakingImproving.value}
              comments={data.mindSet.decisionMakingImproving.comments}
              onChange={(k, v) => updateField(period, 'mindSet', 'decisionMakingImproving', k, v)}
            />
            <YesNoField
              label="Decision Making - Needs Work"
              value={data.mindSet.decisionMakingNeedsWork.value}
              comments={data.mindSet.decisionMakingNeedsWork.comments}
              onChange={(k, v) => updateField(period, 'mindSet', 'decisionMakingNeedsWork', k, v)}
            />
            <YesNoField
              label="Body Language - Consistent"
              value={data.mindSet.bodyLanguageConsistent.value}
              comments={data.mindSet.bodyLanguageConsistent.comments}
              onChange={(k, v) => updateField(period, 'mindSet', 'bodyLanguageConsistent', k, v)}
            />
            <YesNoField
              label="Body Language - Inconsistent"
              value={data.mindSet.bodyLanguageInconsistent.value}
              comments={data.mindSet.bodyLanguageInconsistent.comments}
              onChange={(k, v) => updateField(period, 'mindSet', 'bodyLanguageInconsistent', k, v)}
            />
          </div>
        </Card>

        {/* Skating */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Skating Performance</h3>
          <div className="space-y-4">
            <YesNoField
              label="In Sync With Puck"
              value={data.skating.inSyncWithPuck.value}
              comments={data.skating.inSyncWithPuck.comments}
              onChange={(k, v) => updateField(period, 'skating', 'inSyncWithPuck', k, v)}
            />
            <YesNoField
              label="Improving"
              value={data.skating.improving.value}
              comments={data.skating.improving.comments}
              onChange={(k, v) => updateField(period, 'skating', 'improving', k, v)}
            />
            <YesNoField
              label="Weak"
              value={data.skating.weak.value}
              comments={data.skating.weak.comments}
              onChange={(k, v) => updateField(period, 'skating', 'weak', k, v)}
            />
            <YesNoField
              label="Not In Sync"
              value={data.skating.notInSync.value}
              comments={data.skating.notInSync.comments}
              onChange={(k, v) => updateField(period, 'skating', 'notInSync', k, v)}
            />
          </div>
        </Card>

        {/* Positional - Above Icing Line */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Positional - Above Icing Line</h3>
          <div className="space-y-4">
            <YesNoField
              label="Poor"
              value={data.positionalAboveIcing.poor.value}
              comments={data.positionalAboveIcing.poor.comments}
              onChange={(k, v) => updateField(period, 'positionalAboveIcing', 'poor', k, v)}
            />
            <YesNoField
              label="Improving"
              value={data.positionalAboveIcing.improving.value}
              comments={data.positionalAboveIcing.improving.comments}
              onChange={(k, v) => updateField(period, 'positionalAboveIcing', 'improving', k, v)}
            />
            <YesNoField
              label="Good"
              value={data.positionalAboveIcing.good.value}
              comments={data.positionalAboveIcing.good.comments}
              onChange={(k, v) => updateField(period, 'positionalAboveIcing', 'good', k, v)}
            />
          </div>
        </Card>

        {/* Positional - Below Icing Line */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Positional - Below Icing Line</h3>
          <div className="space-y-4">
            <YesNoField
              label="Poor"
              value={data.positionalBelowIcing.poor.value}
              comments={data.positionalBelowIcing.poor.comments}
              onChange={(k, v) => updateField(period, 'positionalBelowIcing', 'poor', k, v)}
            />
            <YesNoField
              label="Improving"
              value={data.positionalBelowIcing.improving.value}
              comments={data.positionalBelowIcing.improving.comments}
              onChange={(k, v) => updateField(period, 'positionalBelowIcing', 'improving', k, v)}
            />
            <YesNoField
              label="Good"
              value={data.positionalBelowIcing.good.value}
              comments={data.positionalBelowIcing.good.comments}
              onChange={(k, v) => updateField(period, 'positionalBelowIcing', 'good', k, v)}
            />
            <YesNoField
              label="Strong"
              value={data.positionalBelowIcing.strong.value}
              comments={data.positionalBelowIcing.strong.comments}
              onChange={(k, v) => updateField(period, 'positionalBelowIcing', 'strong', k, v)}
            />
          </div>
        </Card>

        {/* Rebound Control */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Rebound Control</h3>
          <div className="space-y-4">
            <YesNoField
              label="Poor"
              value={data.reboundControl.poor.value}
              comments={data.reboundControl.poor.comments}
              onChange={(k, v) => updateField(period, 'reboundControl', 'poor', k, v)}
            />
            <YesNoField
              label="Improving"
              value={data.reboundControl.improving.value}
              comments={data.reboundControl.improving.comments}
              onChange={(k, v) => updateField(period, 'reboundControl', 'improving', k, v)}
            />
            <YesNoField
              label="Good"
              value={data.reboundControl.good.value}
              comments={data.reboundControl.good.comments}
              onChange={(k, v) => updateField(period, 'reboundControl', 'good', k, v)}
            />
            <YesNoField
              label="Consistent"
              value={data.reboundControl.consistent.value}
              comments={data.reboundControl.consistent.comments}
              onChange={(k, v) => updateField(period, 'reboundControl', 'consistent', k, v)}
            />
            <YesNoField
              label="Inconsistent"
              value={data.reboundControl.inconsistent.value}
              comments={data.reboundControl.inconsistent.comments}
              onChange={(k, v) => updateField(period, 'reboundControl', 'inconsistent', k, v)}
            />
          </div>
        </Card>

        {/* Freezing Puck */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Freezing Puck</h3>
          <div className="space-y-4">
            <YesNoField
              label="Poor"
              value={data.freezingPuck.poor.value}
              comments={data.freezingPuck.poor.comments}
              onChange={(k, v) => updateField(period, 'freezingPuck', 'poor', k, v)}
            />
            <YesNoField
              label="Improving"
              value={data.freezingPuck.improving.value}
              comments={data.freezingPuck.improving.comments}
              onChange={(k, v) => updateField(period, 'freezingPuck', 'improving', k, v)}
            />
            <YesNoField
              label="Good"
              value={data.freezingPuck.good.value}
              comments={data.freezingPuck.good.comments}
              onChange={(k, v) => updateField(period, 'freezingPuck', 'good', k, v)}
            />
            <YesNoField
              label="Consistent"
              value={data.freezingPuck.consistent.value}
              comments={data.freezingPuck.consistent.comments}
              onChange={(k, v) => updateField(period, 'freezingPuck', 'consistent', k, v)}
            />
            <YesNoField
              label="Inconsistent"
              value={data.freezingPuck.inconsistent.value}
              comments={data.freezingPuck.inconsistent.comments}
              onChange={(k, v) => updateField(period, 'freezingPuck', 'inconsistent', k, v)}
            />
          </div>
        </Card>

        {/* Team Play - Only for Period 3 */}
        {isPeriod3 && data.teamPlay && (
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Team Play</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Setting Up Defense</h4>
                <div className="space-y-4">
                  <YesNoField
                    label="Poor"
                    value={data.teamPlay.settingUpDefense.poor.value}
                    comments={data.teamPlay.settingUpDefense.poor.comments}
                    onChange={(k, v) => updateField(period, 'teamPlay', 'settingUpDefense', k, v)}
                  />
                  <YesNoField
                    label="Improving"
                    value={data.teamPlay.settingUpDefense.improving.value}
                    comments={data.teamPlay.settingUpDefense.improving.comments}
                    onChange={(k, v) => updateField(period, 'teamPlay', 'settingUpDefense', k, v)}
                  />
                  <YesNoField
                    label="Good"
                    value={data.teamPlay.settingUpDefense.good.value}
                    comments={data.teamPlay.settingUpDefense.good.comments}
                    onChange={(k, v) => updateField(period, 'teamPlay', 'settingUpDefense', k, v)}
                  />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Setting Up Forwards</h4>
                <div className="space-y-4">
                  <YesNoField
                    label="Poor"
                    value={data.teamPlay.settingUpForwards.poor.value}
                    comments={data.teamPlay.settingUpForwards.poor.comments}
                    onChange={(k, v) => updateField(period, 'teamPlay', 'settingUpForwards', k, v)}
                  />
                  <YesNoField
                    label="Improving"
                    value={data.teamPlay.settingUpForwards.improving.value}
                    comments={data.teamPlay.settingUpForwards.improving.comments}
                    onChange={(k, v) => updateField(period, 'teamPlay', 'settingUpForwards', k, v)}
                  />
                  <YesNoField
                    label="Good"
                    value={data.teamPlay.settingUpForwards.good.value}
                    comments={data.teamPlay.settingUpForwards.good.comments}
                    onChange={(k, v) => updateField(period, 'teamPlay', 'settingUpForwards', k, v)}
                  />
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <p>Session not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Period Performance</h1>
              <p className="text-gray-600">
                {session.type === 'game' ? '🥅 Game' : '🏒 Practice'}
                {session.opponent && ` vs ${session.opponent}`}
              </p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save All Periods
              </>
            )}
          </Button>
        </div>

        {/* Tabs for Each Period */}
        <Tabs value={activePeriod} onValueChange={setActivePeriod}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="period1">Period 1</TabsTrigger>
            <TabsTrigger value="period2">Period 2</TabsTrigger>
            <TabsTrigger value="period3">Period 3</TabsTrigger>
          </TabsList>

          <TabsContent value="period1" className="space-y-4 mt-6">
            {renderPeriodForm('period1')}
          </TabsContent>

          <TabsContent value="period2" className="space-y-4 mt-6">
            {renderPeriodForm('period2')}
          </TabsContent>

          <TabsContent value="period3" className="space-y-4 mt-6">
            {renderPeriodForm('period3')}
          </TabsContent>
        </Tabs>

        {/* Save Button Footer */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Save All Periods
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
