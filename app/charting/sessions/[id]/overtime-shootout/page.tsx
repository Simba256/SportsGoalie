'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter, useParams } from 'next/navigation';
import { chartingService } from '@/lib/database';
import { Session, ChartingEntry, OvertimeData, ShootoutData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import { YesNoField, createEmptyYesNo } from '@/components/charting/YesNoField';

const createEmptyOvertimeData = (): OvertimeData => ({
  mindSetFocus: {
    poor: createEmptyYesNo(),
    needsWork: createEmptyYesNo(),
    good: createEmptyYesNo(),
  },
  mindSetDecisionMaking: {
    strong: createEmptyYesNo(),
    improving: createEmptyYesNo(),
    needsWork: createEmptyYesNo(),
  },
  skatingPerformance: {
    poor: createEmptyYesNo(),
    needsWork: createEmptyYesNo(),
    good: createEmptyYesNo(),
  },
  positionalGame: {
    poor: createEmptyYesNo(),
    needsWork: createEmptyYesNo(),
    good: createEmptyYesNo(),
  },
  reboundControl: {
    poor: createEmptyYesNo(),
    needsWork: createEmptyYesNo(),
    good: createEmptyYesNo(),
  },
  freezingPuck: {
    poor: createEmptyYesNo(),
    needsWork: createEmptyYesNo(),
    good: createEmptyYesNo(),
  },
});

const createEmptyShootoutData = (): ShootoutData => ({
  result: 'won',
  shotsSaved: 0,
  shotsScored: 0,
  dekesSaved: 0,
  dekesScored: 0,
  comments: '',
});

export default function OvertimeShootoutPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [existingEntry, setExistingEntry] = useState<ChartingEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [overtimeData, setOvertimeData] = useState<OvertimeData>(createEmptyOvertimeData());
  const [shootoutData, setShootoutData] = useState<ShootoutData>(createEmptyShootoutData());
  const [hasOvertime, setHasOvertime] = useState(false);
  const [hasShootout, setHasShootout] = useState(false);

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
          if (myEntry.overtime) {
            setOvertimeData(myEntry.overtime);
            setHasOvertime(true);
          }
          if (myEntry.shootout) {
            setShootoutData(myEntry.shootout);
            setHasShootout(true);
          }
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

      const entryData: any = {
        sessionId: session.id,
        studentId: session.studentId,
        submittedBy: user.id,
        submitterRole: (user.role || 'student') as 'student' | 'admin',
      };

      if (hasOvertime) {
        entryData.overtime = overtimeData;
      }
      if (hasShootout) {
        entryData.shootout = shootoutData;
      }

      if (existingEntry) {
        await chartingService.updateChartingEntry(existingEntry.id, entryData);
        alert('Overtime/Shootout data saved successfully!');
        router.push(`/charting/sessions/${sessionId}`);
      } else {
        const result = await chartingService.createChartingEntry(entryData);
        if (result.success && result.data) {
          const newEntryResult = await chartingService.getChartingEntry(result.data.id);
          if (newEntryResult.success && newEntryResult.data) {
            setExistingEntry(newEntryResult.data);
          }
        }
        alert('Overtime/Shootout data created successfully!');
        router.push(`/charting/sessions/${sessionId}`);
      }
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save data');
    } finally {
      setSaving(false);
    }
  };

  const updateOvertimeField = (section: string, field: string, key: 'value' | 'comments', value: any) => {
    setOvertimeData((prev: any) => ({
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
              <h1 className="text-3xl font-bold text-gray-900">Overtime & Shootout</h1>
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
                Save Data
              </>
            )}
          </Button>
        </div>

        {/* Selection */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Which occurred in this game?</h2>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasOvertime}
                onChange={(e) => setHasOvertime(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="font-medium">Overtime</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasShootout}
                onChange={(e) => setHasShootout(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="font-medium">Shootout</span>
            </label>
          </div>
        </Card>

        {/* Overtime Section */}
        {hasOvertime && (
          <>
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Overtime - Mind-Set Focus</h2>
              <div className="space-y-4">
                <YesNoField
                  label="Poor"
                  value={overtimeData.mindSetFocus.poor.value}
                  comments={overtimeData.mindSetFocus.poor.comments}
                  onChange={(k, v) => updateOvertimeField('mindSetFocus', 'poor', k, v)}
                />
                <YesNoField
                  label="Needs Work"
                  value={overtimeData.mindSetFocus.needsWork.value}
                  comments={overtimeData.mindSetFocus.needsWork.comments}
                  onChange={(k, v) => updateOvertimeField('mindSetFocus', 'needsWork', k, v)}
                />
                <YesNoField
                  label="Good"
                  value={overtimeData.mindSetFocus.good.value}
                  comments={overtimeData.mindSetFocus.good.comments}
                  onChange={(k, v) => updateOvertimeField('mindSetFocus', 'good', k, v)}
                />
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Overtime - Decision Making</h2>
              <div className="space-y-4">
                <YesNoField
                  label="Strong"
                  value={overtimeData.mindSetDecisionMaking.strong.value}
                  comments={overtimeData.mindSetDecisionMaking.strong.comments}
                  onChange={(k, v) => updateOvertimeField('mindSetDecisionMaking', 'strong', k, v)}
                />
                <YesNoField
                  label="Improving"
                  value={overtimeData.mindSetDecisionMaking.improving.value}
                  comments={overtimeData.mindSetDecisionMaking.improving.comments}
                  onChange={(k, v) => updateOvertimeField('mindSetDecisionMaking', 'improving', k, v)}
                />
                <YesNoField
                  label="Needs Work"
                  value={overtimeData.mindSetDecisionMaking.needsWork.value}
                  comments={overtimeData.mindSetDecisionMaking.needsWork.comments}
                  onChange={(k, v) => updateOvertimeField('mindSetDecisionMaking', 'needsWork', k, v)}
                />
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Overtime - Skating Performance</h2>
              <div className="space-y-4">
                <YesNoField
                  label="Poor"
                  value={overtimeData.skatingPerformance.poor.value}
                  comments={overtimeData.skatingPerformance.poor.comments}
                  onChange={(k, v) => updateOvertimeField('skatingPerformance', 'poor', k, v)}
                />
                <YesNoField
                  label="Needs Work"
                  value={overtimeData.skatingPerformance.needsWork.value}
                  comments={overtimeData.skatingPerformance.needsWork.comments}
                  onChange={(k, v) => updateOvertimeField('skatingPerformance', 'needsWork', k, v)}
                />
                <YesNoField
                  label="Good"
                  value={overtimeData.skatingPerformance.good.value}
                  comments={overtimeData.skatingPerformance.good.comments}
                  onChange={(k, v) => updateOvertimeField('skatingPerformance', 'good', k, v)}
                />
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Overtime - Positional Game</h2>
              <div className="space-y-4">
                <YesNoField
                  label="Poor"
                  value={overtimeData.positionalGame.poor.value}
                  comments={overtimeData.positionalGame.poor.comments}
                  onChange={(k, v) => updateOvertimeField('positionalGame', 'poor', k, v)}
                />
                <YesNoField
                  label="Needs Work"
                  value={overtimeData.positionalGame.needsWork.value}
                  comments={overtimeData.positionalGame.needsWork.comments}
                  onChange={(k, v) => updateOvertimeField('positionalGame', 'needsWork', k, v)}
                />
                <YesNoField
                  label="Good"
                  value={overtimeData.positionalGame.good.value}
                  comments={overtimeData.positionalGame.good.comments}
                  onChange={(k, v) => updateOvertimeField('positionalGame', 'good', k, v)}
                />
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Overtime - Rebound Control</h2>
              <div className="space-y-4">
                <YesNoField
                  label="Poor"
                  value={overtimeData.reboundControl.poor.value}
                  comments={overtimeData.reboundControl.poor.comments}
                  onChange={(k, v) => updateOvertimeField('reboundControl', 'poor', k, v)}
                />
                <YesNoField
                  label="Needs Work"
                  value={overtimeData.reboundControl.needsWork.value}
                  comments={overtimeData.reboundControl.needsWork.comments}
                  onChange={(k, v) => updateOvertimeField('reboundControl', 'needsWork', k, v)}
                />
                <YesNoField
                  label="Good"
                  value={overtimeData.reboundControl.good.value}
                  comments={overtimeData.reboundControl.good.comments}
                  onChange={(k, v) => updateOvertimeField('reboundControl', 'good', k, v)}
                />
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Overtime - Freezing Puck</h2>
              <div className="space-y-4">
                <YesNoField
                  label="Poor"
                  value={overtimeData.freezingPuck.poor.value}
                  comments={overtimeData.freezingPuck.poor.comments}
                  onChange={(k, v) => updateOvertimeField('freezingPuck', 'poor', k, v)}
                />
                <YesNoField
                  label="Needs Work"
                  value={overtimeData.freezingPuck.needsWork.value}
                  comments={overtimeData.freezingPuck.needsWork.comments}
                  onChange={(k, v) => updateOvertimeField('freezingPuck', 'needsWork', k, v)}
                />
                <YesNoField
                  label="Good"
                  value={overtimeData.freezingPuck.good.value}
                  comments={overtimeData.freezingPuck.good.comments}
                  onChange={(k, v) => updateOvertimeField('freezingPuck', 'good', k, v)}
                />
              </div>
            </Card>
          </>
        )}

        {/* Shootout Section */}
        {hasShootout && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Shootout Statistics</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="result">Result</Label>
                <select
                  id="result"
                  value={shootoutData.result}
                  onChange={(e) => setShootoutData({ ...shootoutData, result: e.target.value as 'won' | 'lost' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
                >
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shotsSaved">Shots Saved (0-10)</Label>
                  <Input
                    id="shotsSaved"
                    type="number"
                    min="0"
                    max="10"
                    value={shootoutData.shotsSaved}
                    onChange={(e) => setShootoutData({ ...shootoutData, shotsSaved: Math.min(10, Math.max(0, parseInt(e.target.value) || 0)) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="shotsScored">Shots Scored Against (0-10)</Label>
                  <Input
                    id="shotsScored"
                    type="number"
                    min="0"
                    max="10"
                    value={shootoutData.shotsScored}
                    onChange={(e) => setShootoutData({ ...shootoutData, shotsScored: Math.min(10, Math.max(0, parseInt(e.target.value) || 0)) })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dekesSaved">Dekes Saved (0-10)</Label>
                  <Input
                    id="dekesSaved"
                    type="number"
                    min="0"
                    max="10"
                    value={shootoutData.dekesSaved}
                    onChange={(e) => setShootoutData({ ...shootoutData, dekesSaved: Math.min(10, Math.max(0, parseInt(e.target.value) || 0)) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="dekesScored">Dekes Scored Against (0-10)</Label>
                  <Input
                    id="dekesScored"
                    type="number"
                    min="0"
                    max="10"
                    value={shootoutData.dekesScored}
                    onChange={(e) => setShootoutData({ ...shootoutData, dekesScored: Math.min(10, Math.max(0, parseInt(e.target.value) || 0)) })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="comments">Comments</Label>
                <textarea
                  id="comments"
                  value={shootoutData.comments}
                  onChange={(e) => setShootoutData({ ...shootoutData, comments: e.target.value })}
                  placeholder="Any additional notes about the shootout..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-24 mt-1"
                  rows={4}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Save Button Footer */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Save Overtime/Shootout
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
