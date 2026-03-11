'use client';

import { useState, useEffect } from 'react';
import { Sport, PILLARS } from '@/types';
import { sportsService } from '@/lib/database/services/sports.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { LoadingState, LoadingCard } from '@/components/ui/loading';
import { getPillarColorClasses, getPillarSlugFromDocId } from '@/src/lib/utils/pillars';
import Link from 'next/link';
import {
  Brain,
  Footprints,
  Shapes,
  Target,
  Grid3X3,
  Dumbbell,
  Heart,
  Users,
  Sparkles,
  BookOpen,
} from 'lucide-react';

// Icon map for pillar icons
const PILLAR_ICONS: Record<string, React.ElementType> = {
  Brain,
  Footprints,
  Shapes,
  Target,
  Grid3X3,
  Dumbbell,
  Heart,
};

interface PillarsPageState {
  pillars: Sport[];
  loading: boolean;
  error: string | null;
}

export default function PillarsPage() {
  const [state, setState] = useState<PillarsPageState>({
    pillars: [],
    loading: true,
    error: null,
  });

  const loadPillars = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await sportsService.getAllSports({ limit: 10 });

      if (result.success && result.data) {
        // Sort by order to ensure consistent display
        const sortedPillars = result.data.items.sort((a, b) => a.order - b.order);
        setState(prev => ({
          ...prev,
          pillars: sortedPillars,
          loading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: result.error?.message || 'Failed to load pillars',
          loading: false,
        }));
      }
    } catch {
      setState(prev => ({
        ...prev,
        error: 'An unexpected error occurred',
        loading: false,
      }));
    }
  };

  useEffect(() => {
    loadPillars();
  }, []);

  // Get pillar info from PILLARS constant for consistent display
  const getPillarDisplayInfo = (pillar: Sport) => {
    const slug = getPillarSlugFromDocId(pillar.id);
    if (slug) {
      const info = PILLARS.find(p => p.slug === slug);
      if (info) {
        return {
          icon: info.icon,
          color: info.color,
          shortName: info.shortName,
        };
      }
    }
    // Fallback to using Sport data
    return {
      icon: pillar.icon,
      color: 'blue',
      shortName: pillar.name.split(' ')[0],
    };
  };

  if (state.loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={[{ label: 'Learning Pillars', current: true }]} className="mb-6" />
        <LoadingState message="Loading learning pillars..." />
        <LoadingCard count={6} className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Learning Pillars', current: true }]} />

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Ice Hockey Goalie Pillars
              </h1>
              <Sparkles className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Master the 7 fundamental pillars of goaltending. Each pillar builds upon the others to develop you into a complete goalie.
            </p>
          </div>
          <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
            7 pillars
          </div>
        </div>
      </div>

      {/* Error State */}
      {state.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <span className="font-medium">Error:</span>
              <span>{state.error}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadPillars}
              className="mt-2"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pillars Grid */}
      {state.pillars.length === 0 && !state.loading ? (
        <Card className="p-8">
          <div className="text-center space-y-4">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-medium">No pillars found</h3>
            <p className="text-muted-foreground">
              Pillars are being set up. Please check back soon.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.pillars.map((pillar) => {
            const displayInfo = getPillarDisplayInfo(pillar);
            const colorClasses = getPillarColorClasses(displayInfo.color);
            const IconComponent = PILLAR_ICONS[displayInfo.icon] || Target;

            return (
              <Link key={pillar.id} href={`/pillars/${pillar.id}`}>
                <Card className={`h-full hover:shadow-lg transition-all duration-300 cursor-pointer group border-2 ${colorClasses.border} hover:scale-[1.02]`}>
                  {/* Colored Header */}
                  <div className={`h-24 bg-gradient-to-br ${colorClasses.gradient} rounded-t-lg flex items-center justify-center relative overflow-hidden`}>
                    <IconComponent className="w-12 h-12 text-white drop-shadow-lg" />
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {pillar.isFeatured && (
                      <div className="absolute top-2 right-2 bg-white/90 text-xs px-2 py-1 rounded-full font-medium">
                        Featured
                      </div>
                    )}
                  </div>

                  <CardHeader className="space-y-2 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className={`text-lg group-hover:${colorClasses.text} transition-colors`}>
                        {pillar.name}
                      </CardTitle>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${colorClasses.bgLight} ${colorClasses.text}`}>
                        Pillar {pillar.order}
                      </span>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {pillar.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-0">
                    <div className="flex items-center justify-center text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{pillar.skillsCount} skills</span>
                      </div>
                    </div>

                    {pillar.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 justify-center">
                        {pillar.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Information Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">About the 7 Pillars</h3>
              <p className="text-muted-foreground">
                These 7 pillars form the foundation of comprehensive goaltender development.
                Each pillar contains skills, drills, and assessments designed to help you
                progress from beginner to advanced levels. Work through each pillar to
                build a well-rounded skill set.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
