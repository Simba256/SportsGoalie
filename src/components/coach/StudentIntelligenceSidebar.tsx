'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, TrendingUp, Plus, Brain, Target } from 'lucide-react';
import { onboardingService } from '@/lib/database';
import type {
  IntelligenceProfile,
  GapAnalysis,
  StrengthAnalysis,
} from '@/types';
import { getPacingLevelDisplayText } from '@/types';
import {
  getRecommendedPillarsFromGaps,
  type PillarRecommendation,
} from '@/lib/utils/category-pillar-mapping';
import { getPillarByDocId } from '@/lib/utils/pillars';

interface Props {
  studentId: string;
  onAddContentForPillar?: (pillarId: string, pillarName: string) => void;
}

export function StudentIntelligenceSidebar({ studentId, onAddContentForPillar }: Props) {
  const [profile, setProfile] = useState<IntelligenceProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<PillarRecommendation[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await onboardingService.getEvaluation(studentId);
        if (result.success && result.data?.intelligenceProfile) {
          const p = result.data.intelligenceProfile;
          setProfile(p);
          setRecommendations(getRecommendedPillarsFromGaps(p.identifiedGaps));
        }
      } catch (err) {
        console.error('Failed to load intelligence profile:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [studentId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="py-6 text-center">
          <Brain className="h-8 w-8 text-amber-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-amber-800">Assessment Not Completed</p>
          <p className="text-xs text-amber-600 mt-1">
            This student hasn't completed onboarding yet. Gaps and recommendations will appear here after assessment.
          </p>
        </CardContent>
      </Card>
    );
  }

  const priorityColors = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    low: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  return (
    <div className="space-y-4">
      {/* Score & Level */}
      <Card className="border-zinc-200 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-zinc-900">
            <Target className="h-4 w-4 text-zinc-700" />
            Assessment Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-zinc-900">{profile.overallScore.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground ml-1">/ 4.0</span>
            </div>
            <Badge className={
              profile.pacingLevel === 'refinement' ? 'bg-red-600 text-white' :
              profile.pacingLevel === 'development' ? 'bg-blue-500' :
              'bg-zinc-700 text-white'
            }>
              {getPacingLevelDisplayText(profile.pacingLevel)}
            </Badge>
          </div>
          {/* Mini category bars */}
          <div className="space-y-1.5">
            {profile.categoryScores.map((cat) => (
              <div key={cat.categorySlug} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-16 truncate capitalize">
                  {cat.categorySlug.replace('_', ' ')}
                </span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      cat.averageScore >= 3.0 ? 'bg-blue-600' :
                      cat.averageScore >= 2.0 ? 'bg-red-500' :
                      'bg-zinc-400'
                    }`}
                    style={{ width: `${((cat.averageScore - 1) / 3) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium w-6 text-right">{cat.averageScore.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gaps */}
      {profile.identifiedGaps.length > 0 && (
        <Card className="border-red-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              Identified Gaps ({profile.identifiedGaps.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {profile.identifiedGaps.map((gap: GapAnalysis) => (
              <div key={gap.categorySlug} className={`rounded-lg border px-3 py-2 ${priorityColors[gap.priority]}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold capitalize">{gap.categoryName}</span>
                  <span className="text-[10px] font-bold uppercase">{gap.priority}</span>
                </div>
                <p className="text-[10px] mt-0.5 opacity-80">Score: {gap.score.toFixed(1)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Strengths */}
      {profile.identifiedStrengths.length > 0 && (
        <Card className="border-blue-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
              <TrendingUp className="h-4 w-4" />
              Strengths ({profile.identifiedStrengths.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {profile.identifiedStrengths.map((s: StrengthAnalysis) => (
              <div key={s.categorySlug} className="flex items-center justify-between rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5">
                <span className="text-xs font-medium text-zinc-800 capitalize">{s.categoryName}</span>
                <span className="text-xs font-bold text-blue-700">{s.score.toFixed(1)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommended Pillars (from gaps) */}
      {recommendations.length > 0 && onAddContentForPillar && (
        <Card className="border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-700">Recommended Content Areas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recommendations.map((rec) => {
              const pillarInfo = getPillarByDocId(rec.pillarId);
              return (
                <div key={rec.pillarSlug} className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{pillarInfo?.name || rec.pillarSlug}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{rec.reasons[0]}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                    onClick={() => onAddContentForPillar(rec.pillarId, pillarInfo?.name || rec.pillarSlug)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Charting Emphasis */}
      {profile.chartingEmphasis && profile.chartingEmphasis.length > 0 && (
        <Card className="border-zinc-200 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-zinc-900">Charting Focus Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {profile.chartingEmphasis.map((area) => (
                <Badge key={area} variant="outline" className="text-[10px] border-red-200 bg-red-50 text-red-700">
                  {area}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
