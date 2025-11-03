'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter, useParams } from 'next/navigation';
import { chartingService } from '@/lib/database';
import { Session, ChartingEntry, GameOverview, GoalsByPeriod } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const createEmptyGoalsByPeriod = (): GoalsByPeriod => ({
  period1: 0,
  period2: 0,
  period3: 0,
});

const createEmptyGameOverview = (): GameOverview => ({
  goodGoals: createEmptyGoalsByPeriod(),
  badGoals: createEmptyGoalsByPeriod(),
  degreeOfChallenge: {
    period1: 5,
    period2: 5,
    period3: 5,
  },
});

export default function GameOverviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [existingEntry, setExistingEntry] = useState<ChartingEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<GameOverview>(createEmptyGameOverview());

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
          if (myEntry.gameOverview) {
            setFormData(myEntry.gameOverview);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load session data');
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
        gameOverview: formData,
      };

      if (existingEntry) {
        await chartingService.updateChartingEntry(existingEntry.id, entryData);
        toast.success('Game Overview saved successfully!');
        router.push(`/charting/sessions/${sessionId}`);
      } else {
        const result = await chartingService.createChartingEntry(entryData);
        if (result.success && result.data) {
          const newEntryResult = await chartingService.getChartingEntry(result.data.id);
          if (newEntryResult.success && newEntryResult.data) {
            setExistingEntry(newEntryResult.data);
          }
        }
        toast.success('Game Overview created successfully!');
        router.push(`/charting/sessions/${sessionId}`);
      }
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Failed to save data');
    } finally {
      setSaving(false);
    }
  };

  const updateGoals = (type: 'goodGoals' | 'badGoals', period: 'period1' | 'period2' | 'period3', value: number) => {
    setFormData((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [period]: Math.max(0, value),
      },
    }));
  };

  const updateChallenge = (period: 'period1' | 'period2' | 'period3', value: number) => {
    setFormData((prev) => ({
      ...prev,
      degreeOfChallenge: {
        ...prev.degreeOfChallenge,
        [period]: Math.min(10, Math.max(1, value)),
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
            <Button variant="outline" size="icon" onClick={() => router.push(`/charting/sessions/${sessionId}`)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Game Overview</h1>
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
                Save Overview
              </>
            )}
          </Button>
        </div>

        {/* Good Goals */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Good Goals Against{session.opponent ? ` ${session.opponent}` : ''}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="good-p1">Period 1</Label>
              <Input
                id="good-p1"
                type="number"
                min="0"
                value={formData.goodGoals.period1}
                onChange={(e) => updateGoals('goodGoals', 'period1', parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="good-p2">Period 2</Label>
              <Input
                id="good-p2"
                type="number"
                min="0"
                value={formData.goodGoals.period2}
                onChange={(e) => updateGoals('goodGoals', 'period2', parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="good-p3">Period 3</Label>
              <Input
                id="good-p3"
                type="number"
                min="0"
                value={formData.goodGoals.period3}
                onChange={(e) => updateGoals('goodGoals', 'period3', parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Total: {formData.goodGoals.period1 + formData.goodGoals.period2 + formData.goodGoals.period3}
          </p>
        </Card>

        {/* Bad Goals */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Bad Goals Against{session.opponent ? ` ${session.opponent}` : ''}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="bad-p1">Period 1</Label>
              <Input
                id="bad-p1"
                type="number"
                min="0"
                value={formData.badGoals.period1}
                onChange={(e) => updateGoals('badGoals', 'period1', parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="bad-p2">Period 2</Label>
              <Input
                id="bad-p2"
                type="number"
                min="0"
                value={formData.badGoals.period2}
                onChange={(e) => updateGoals('badGoals', 'period2', parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="bad-p3">Period 3</Label>
              <Input
                id="bad-p3"
                type="number"
                min="0"
                value={formData.badGoals.period3}
                onChange={(e) => updateGoals('badGoals', 'period3', parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Total: {formData.badGoals.period1 + formData.badGoals.period2 + formData.badGoals.period3}
          </p>
        </Card>

        {/* Degree of Challenge */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Degree of Challenge (1-10)</h2>
          <p className="text-sm text-gray-600 mb-4">
            Rate the difficulty level of each period (1 = Easy, 10 = Very Challenging)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="challenge-p1">Period 1</Label>
              <Input
                id="challenge-p1"
                type="number"
                min="1"
                max="10"
                value={formData.degreeOfChallenge.period1}
                onChange={(e) => updateChallenge('period1', parseInt(e.target.value) || 5)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="challenge-p2">Period 2</Label>
              <Input
                id="challenge-p2"
                type="number"
                min="1"
                max="10"
                value={formData.degreeOfChallenge.period2}
                onChange={(e) => updateChallenge('period2', parseInt(e.target.value) || 5)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="challenge-p3">Period 3</Label>
              <Input
                id="challenge-p3"
                type="number"
                min="1"
                max="10"
                value={formData.degreeOfChallenge.period3}
                onChange={(e) => updateChallenge('period3', parseInt(e.target.value) || 5)}
                className="mt-1"
              />
            </div>
          </div>
        </Card>

        {/* Save Button Footer */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Save Game Overview
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
