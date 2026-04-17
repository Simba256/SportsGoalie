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
import { ArrowLeft, Save, Trophy, Dumbbell, MapPin, CalendarDays, Users, Tag } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

export default function NewSessionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'game' as 'game' | 'practice',
    date: new Date().toISOString().slice(0, 16),
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <section className="relative -mx-4 -mt-4 md:-mx-6 md:-mt-6 h-[250px] md:h-[290px] flex items-start justify-center px-4 pt-10 md:pt-12 overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/goalie.avif')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1748]/78 via-[#102a5d]/62 to-[#5f2033]/52" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent via-gray-100/55 to-gray-50" />

        <div className="relative z-10 w-full max-w-3xl mx-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="absolute left-1 md:-left-20 lg:-left-28 xl:-left-36 top-0 rounded-full border-white/35 bg-white/80 hover:bg-white backdrop-blur-sm text-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div className="mt-3 text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">New Session</h1>
            <p className="text-white/85 mt-2 text-sm md:text-base">Create a new game or practice session</p>
          </div>
        </div>
      </section>

      <main className="relative z-20 max-w-3xl mx-auto px-4 md:px-6 -mt-16 md:-mt-20 pb-10">
        {/* Form */}
        <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-8 p-6">
            {/* Session Type */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">Session Type</Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as 'game' | 'practice' })}
                className="grid grid-cols-2 gap-4"
              >
                <div
                  className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all ${
                    formData.type === 'game'
                      ? 'border-blue-300 bg-blue-50 shadow-md shadow-blue-500/10'
                      : 'border-border hover:border-blue-200 hover:bg-muted/50'
                  }`}
                  onClick={() => setFormData({ ...formData, type: 'game' })}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      formData.type === 'game' ? 'bg-blue-100' : 'bg-muted'
                    }`}>
                      <Trophy className={`w-5 h-5 ${formData.type === 'game' ? 'text-blue-600' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          value="game"
                          checked={formData.type === 'game'}
                          onChange={() => setFormData({ ...formData, type: 'game' })}
                          className="accent-blue-600"
                        />
                        <p className="font-semibold text-foreground">Game</p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Competitive match</p>
                    </div>
                  </div>
                </div>

                <div
                  className={`relative border-2 rounded-xl p-5 cursor-pointer transition-all ${
                    formData.type === 'practice'
                      ? 'border-blue-300 bg-blue-50 shadow-md shadow-blue-500/10'
                      : 'border-border hover:border-blue-200 hover:bg-muted/50'
                  }`}
                  onClick={() => setFormData({ ...formData, type: 'practice' })}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      formData.type === 'practice' ? 'bg-blue-100' : 'bg-muted'
                    }`}>
                      <Dumbbell className={`w-5 h-5 ${formData.type === 'practice' ? 'text-blue-600' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          value="practice"
                          checked={formData.type === 'practice'}
                          onChange={() => setFormData({ ...formData, type: 'practice' })}
                          className="accent-blue-600"
                        />
                        <p className="font-semibold text-foreground">Practice</p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Training session</p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Date and Time + Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="date" className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-600" />
                  Date & Time <span className="text-accent">*</span>
                </Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="h-10 border-border focus-visible:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Location
                </Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="Enter arena or rink name"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="h-10 border-border focus-visible:ring-blue-500"
                />
              </div>
            </div>

            {/* Opponent (only for games) */}
            {formData.type === 'game' && (
              <div className="space-y-2">
                <Label htmlFor="opponent" className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  Opponent
                </Label>
                <Input
                  id="opponent"
                  type="text"
                  placeholder="Enter opponent team name"
                  value={formData.opponent}
                  onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
                  className="border-border focus-visible:ring-blue-500"
                />
              </div>
            )}

            {/* Tags */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" />
                Tags
              </Label>
              <div className="flex flex-wrap gap-2">
                {['Home', 'Away', 'Tournament', 'League', 'Playoff'].map((tag) => {
                  const isSelected = formData.tags.includes(tag.toLowerCase());
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        const tags = isSelected
                          ? formData.tags.filter((t) => t !== tag.toLowerCase())
                          : [...formData.tags, tag.toLowerCase()];
                        setFormData({ ...formData, tags });
                      }}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                          : 'bg-muted text-muted-foreground hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
                className="border-border/50 hover:bg-muted"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="gap-2 bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Creating...
                  </>
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
      </main>
    </div>
  );
}
