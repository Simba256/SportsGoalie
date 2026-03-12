'use client';

import { ParentCrossReferenceView } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  HelpCircle,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CrossReferenceDisplayProps {
  data: ParentCrossReferenceView;
}

export function CrossReferenceDisplay({ data }: CrossReferenceDisplayProps) {
  const getAlignmentIcon = (level: string) => {
    switch (level) {
      case 'aligned':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'minor_gap':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'significant_gap':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getAlignmentBadge = (level: string) => {
    switch (level) {
      case 'aligned':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Aligned
          </Badge>
        );
      case 'minor_gap':
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            Minor Gap
          </Badge>
        );
      case 'significant_gap':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Significant Gap
          </Badge>
        );
      default:
        return null;
    }
  };

  const getDifferenceIndicator = (diff: number | undefined) => {
    if (diff === undefined) return null;

    if (Math.abs(diff) < 0.5) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <Minus className="h-3 w-3" />
          <span className="text-xs">Similar</span>
        </div>
      );
    }

    if (diff > 0) {
      return (
        <div className="flex items-center gap-1 text-blue-600">
          <TrendingUp className="h-3 w-3" />
          <span className="text-xs">You rate higher</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1 text-amber-600">
        <TrendingDown className="h-3 w-3" />
        <span className="text-xs">Goalie rates higher</span>
      </div>
    );
  };

  const scoreToPercentage = (score: number | undefined) => {
    if (score === undefined) return 0;
    // Convert 1.0-4.0 scale to 0-100
    return ((score - 1) / 3) * 100;
  };

  if (!data.parentAssessmentComplete) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Complete Your Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <HelpCircle className="h-4 w-4" />
            <AlertTitle>Assessment Required</AlertTitle>
            <AlertDescription>
              Complete your parent assessment to see how your perceptions compare with your goalie's
              self-assessment. This helps identify areas where you can provide better support.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!data.goalieAssessmentComplete) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-amber-500" />
            Waiting for Goalie Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <HelpCircle className="h-4 w-4" />
            <AlertTitle>Goalie Assessment Pending</AlertTitle>
            <AlertDescription>
              Your goalie hasn't completed their self-assessment yet. Once they do, you'll be able
              to see how your perceptions compare.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Alignment Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Perception Alignment
          </CardTitle>
          <CardDescription>
            Comparing your assessment with {data.childName}'s self-assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Overall Alignment</span>
                <span className="text-2xl font-bold">{data.overallAlignmentScore}%</span>
              </div>
              <Progress value={data.overallAlignmentScore} className="h-3" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{data.strengthAlignmentsCount}</div>
              <div className="text-sm text-muted-foreground">Areas Aligned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{data.criticalGapsCount}</div>
              <div className="text-sm text-muted-foreground">Gaps to Discuss</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Comparisons */}
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>
            How your perceptions compare across different areas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.comparisons.map((comparison) => (
            <div
              key={comparison.categorySlug}
              className="p-4 rounded-lg border bg-card"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getAlignmentIcon(comparison.alignmentLevel)}
                  <h4 className="font-medium">{comparison.categoryName}</h4>
                </div>
                {getAlignmentBadge(comparison.alignmentLevel)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Goalie's Score */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Goalie Self-Rating</span>
                    <span className="text-sm font-medium">
                      {comparison.goalieScore?.toFixed(1) || '-'}
                    </span>
                  </div>
                  <Progress
                    value={scoreToPercentage(comparison.goalieScore)}
                    className="h-2"
                  />
                </div>

                {/* Parent's Score */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Your Rating</span>
                    <span className="text-sm font-medium">
                      {comparison.parentScore?.toFixed(1) || '-'}
                    </span>
                  </div>
                  <Progress
                    value={scoreToPercentage(comparison.parentScore)}
                    className="h-2 [&>div]:bg-blue-500"
                  />
                </div>
              </div>

              {/* Difference Indicator */}
              <div className="mt-2 flex items-center justify-between">
                {getDifferenceIndicator(comparison.scoreDifference)}

                {comparison.recommendation && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          Suggestion
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>{comparison.recommendation}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              {/* Description if there's a gap */}
              {comparison.alignmentLevel !== 'aligned' && comparison.description && (
                <p className="mt-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                  {comparison.description}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Last Updated */}
      <p className="text-xs text-center text-muted-foreground">
        Last updated: {data.lastUpdated.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
    </div>
  );
}
