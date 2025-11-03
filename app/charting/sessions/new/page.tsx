'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';
import { chartingService } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup } from '@/components/ui/radio-group';
import { ArrowLeft, Save } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

export default function NewSessionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'game' as 'game' | 'practice',
    date: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm format
    opponent: '',
    location: '',
    tags: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);

      const sessionData = {
        studentId: user.id,
        type: formData.type,
        date: Timestamp.fromDate(new Date(formData.date)),
        opponent: formData.opponent || undefined,
        location: formData.location || undefined,
        tags: formData.tags,
        status: 'scheduled' as const,
        createdBy: user.id,
      };

      const result = await chartingService.createSession(sessionData);

      if (result.success && result.data) {
        router.push(`/charting/sessions/${result.data.id}`);
      } else {
        alert('Failed to create session');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">New Session</h1>
            <p className="text-gray-600 mt-1">Create a new game or practice session</p>
          </div>
        </div>

        {/* Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Session Type */}
            <div className="space-y-2">
              <Label>Session Type</Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as 'game' | 'practice' })}
                className="flex gap-4"
              >
                <div
                  className={`flex-1 border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    formData.type === 'game'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData({ ...formData, type: 'game' })}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="game"
                      checked={formData.type === 'game'}
                      onChange={() => setFormData({ ...formData, type: 'game' })}
                      className="text-blue-600"
                    />
                    <div>
                      <p className="font-medium">Game</p>
                      <p className="text-sm text-gray-600">Competitive match</p>
                    </div>
                  </div>
                </div>

                <div
                  className={`flex-1 border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    formData.type === 'practice'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData({ ...formData, type: 'practice' })}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="practice"
                      checked={formData.type === 'practice'}
                      onChange={() => setFormData({ ...formData, type: 'practice' })}
                      className="text-blue-600"
                    />
                    <div>
                      <p className="font-medium">Practice</p>
                      <p className="text-sm text-gray-600">Training session</p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Date and Time */}
            <div className="space-y-2">
              <Label htmlFor="date">Date & Time *</Label>
              <Input
                id="date"
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            {/* Opponent (only for games) */}
            {formData.type === 'game' && (
              <div className="space-y-2">
                <Label htmlFor="opponent">Opponent</Label>
                <Input
                  id="opponent"
                  type="text"
                  placeholder="Enter opponent team name"
                  value={formData.opponent}
                  onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
                />
              </div>
            )}

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                type="text"
                placeholder="Enter arena or rink name"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {['Home', 'Away', 'Tournament', 'League', 'Playoff'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      const tags = formData.tags.includes(tag.toLowerCase())
                        ? formData.tags.filter((t) => t !== tag.toLowerCase())
                        : [...formData.tags, tag.toLowerCase()];
                      setFormData({ ...formData, tags });
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      formData.tags.includes(tag.toLowerCase())
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="gap-2">
                {loading ? (
                  <>Creating...</>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Create Session
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
