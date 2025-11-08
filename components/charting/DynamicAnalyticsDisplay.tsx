'use client';

import { useEffect, useState } from 'react';
import { DynamicStudentAnalytics, FieldAnalyticsResult } from '@/types';
import { dynamicAnalyticsService } from '@/lib/database/services/dynamic-analytics.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DynamicAnalyticsDisplayProps {
  studentId: string;
  templateId?: string;
}

export function DynamicAnalyticsDisplay({ studentId, templateId }: DynamicAnalyticsDisplayProps) {
  const [analytics, setAnalytics] = useState<DynamicStudentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [studentId, templateId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      if (templateId) {
        // Load analytics for specific template
        const result = await dynamicAnalyticsService.getStudentAnalytics(studentId, templateId);
        if (result.success && result.data) {
          setAnalytics(result.data);
        }
      } else {
        // Load latest analytics
        const result = await dynamicAnalyticsService.getLatestStudentAnalytics(studentId);
        if (result.success && result.data) {
          setAnalytics(result.data);
        }
      }
    } catch (error) {
      console.error('Error loading dynamic analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend?: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend?: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving':
        return 'text-green-600';
      case 'declining':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatValue = (field: FieldAnalyticsResult): string => {
    if (!field.value) return 'N/A';

    switch (field.analyticsType) {
      case 'percentage':
        return `${field.value.toFixed(1)}%`;
      case 'average':
        return field.value.toFixed(2);
      case 'sum':
        return field.value.toString();
      case 'distribution':
        if (field.distribution) {
          const topOptions = Object.entries(field.distribution)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 2)
            .map(([option]) => option);
          return topOptions.join(', ');
        }
        return 'N/A';
      case 'consistency':
        return `${field.value.toFixed(1)}% consistent`;
      default:
        return field.value.toString();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return null; // Don't show anything if no dynamic analytics
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>
                Based on {analytics.totalEntries} session{analytics.totalEntries !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <Badge variant="default">Dynamic</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(analytics.fieldAnalytics)
              .filter(([, field]) => field.enabled)
              .map(([fieldId, field]) => (
                <Card key={fieldId} className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm">{field.fieldLabel}</h4>
                      {field.trend && getTrendIcon(field.trend)}
                    </div>

                    <div className="space-y-2">
                      <p className="text-2xl font-bold">{formatValue(field)}</p>

                      {field.trend && field.trendPercentage !== undefined && (
                        <p className={`text-sm ${getTrendColor(field.trend)}`}>
                          {field.trendPercentage > 0 ? '+' : ''}
                          {field.trendPercentage.toFixed(1)}% from previous period
                        </p>
                      )}

                      <Badge variant="outline" className="text-xs">
                        {field.analyticsType}
                      </Badge>
                    </div>

                    {/* Distribution breakdown */}
                    {field.distribution && Object.keys(field.distribution).length > 0 && (
                      <div className="mt-3 pt-3 border-t space-y-1">
                        {Object.entries(field.distribution)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 3)
                          .map(([option, count]) => (
                            <div key={option} className="flex justify-between text-xs">
                              <span className="text-muted-foreground">{option}</span>
                              <span className="font-medium">{count}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Summary */}
      {analytics.categoryAnalytics && Object.keys(analytics.categoryAnalytics).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Category Summary</CardTitle>
            <CardDescription>Aggregated performance by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(analytics.categoryAnalytics).map(([category, data]) => (
                <Card key={category} className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{category}</h4>
                      {data.trend && getTrendIcon(data.trend)}
                    </div>

                    <p className="text-2xl font-bold mb-2">
                      {data.averageValue ? data.averageValue.toFixed(1) : 'N/A'}
                    </p>

                    {data.fieldCount && (
                      <p className="text-sm text-muted-foreground">
                        Based on {data.fieldCount} field{data.fieldCount !== 1 ? 's' : ''}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
