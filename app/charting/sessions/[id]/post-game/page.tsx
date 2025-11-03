'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter, useParams } from 'next/navigation';
import { chartingService } from '@/lib/database';
import { Session, ChartingEntry } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import { YesNoField, createEmptyYesNo } from '@/components/charting/YesNoField';
import { toast } from 'sonner';

export default function PostGamePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [existingEntry, setExistingEntry] = useState<ChartingEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    reviewCompleted: createEmptyYesNo(),
    reviewNotCompleted: createEmptyYesNo(),
  });

  const [additionalComments, setAdditionalComments] = useState('');

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
          if (myEntry.postGame) {
            setFormData(myEntry.postGame);
          }
          if (myEntry.additionalComments) {
            setAdditionalComments(myEntry.additionalComments);
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
        postGame: formData,
        additionalComments,
      };

      if (existingEntry) {
        await chartingService.updateChartingEntry(existingEntry.id, entryData);
        toast.success('Post-Game section saved successfully!');
        router.push(`/charting/sessions/${sessionId}`);
      } else {
        const result = await chartingService.createChartingEntry(entryData);
        if (result.success && result.data) {
          const newEntryResult = await chartingService.getChartingEntry(result.data.id);
          if (newEntryResult.success && newEntryResult.data) {
            setExistingEntry(newEntryResult.data);
          }
        }
        toast.success('Post-Game section created successfully!');
        router.push(`/charting/sessions/${sessionId}`);
      }
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Failed to save data');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, key: 'value' | 'comments', value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field as keyof typeof prev] as any),
        [key]: value,
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
              <h1 className="text-3xl font-bold text-gray-900">Post-Game Review</h1>
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
                Save Post-Game
              </>
            )}
          </Button>
        </div>

        {/* Post-Game Review */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Game Review</h2>
          <div className="space-y-4">
            <YesNoField
              label="Review Completed"
              value={formData.reviewCompleted.value}
              comments={formData.reviewCompleted.comments}
              onChange={(k, v) => updateField('reviewCompleted', k, v)}
            />
            <YesNoField
              label="Review Not Completed"
              value={formData.reviewNotCompleted.value}
              comments={formData.reviewNotCompleted.comments}
              onChange={(k, v) => updateField('reviewNotCompleted', k, v)}
            />
          </div>
        </Card>

        {/* Additional Comments */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Comments</h2>
          <div className="space-y-2">
            <Label htmlFor="additionalComments">Overall Session Notes</Label>
            <textarea
              id="additionalComments"
              value={additionalComments}
              onChange={(e) => setAdditionalComments(e.target.value)}
              placeholder="Add any additional comments about the session..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-32"
              rows={6}
            />
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
                Save Post-Game
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
