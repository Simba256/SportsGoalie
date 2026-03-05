'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sport, Skill, DifficultyLevel, PILLARS } from '@/types';
import { sportsService } from '@/lib/database/services/sports.service';
import { videoQuizService } from '@/lib/database/services/video-quiz.service';
import { useSportEnrollment } from '@/src/hooks/useEnrollment';
import { useAuth } from '@/lib/auth/context';
import { getPillarColorClasses, getPillarSlugFromDocId } from '@/src/lib/utils/pillars';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  BookOpen,
  Play,
  CheckCircle,
  Star,
  Trophy,
  Heart,
  Loader2,
  Brain,
  Footprints,
  Shapes,
  Target,
  Grid3X3,
  Dumbbell,
} from 'lucide-react';

// Icon map for pillar icons
const PILLAR_ICONS: Record<string, React.ElementType> = {
  Brain,
  Footprints,
  Shapes,
  Target,
  Grid3X3,
  Dumbbell,
};

interface PillarDetailState {
  pillar: Sport | null;
  skills: Skill[];
  loading: boolean;
  skillsLoading: boolean;
  error: string | null;
}

interface SkillProgress {
  [skillId: string]: {
    percentage: number;
    isCompleted: boolean;
  } | null;
}

export default function PillarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pillarId = params.id as string;
  const { user } = useAuth();

  const [state, setState] = useState<PillarDetailState>({
    pillar: null,
    skills: [],
    loading: true,
    skillsLoading: true,
    error: null,
  });

  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [skillProgress, setSkillProgress] = useState<SkillProgress>({});

  // Use enrollment hook for the pillar
  const {
    enrolled: _enrolled,
    progress: _progress,
    loading: _enrollmentLoading,
    enroll: _enroll,
    unenroll: _unenroll,
  } = useSportEnrollment(pillarId);

  // Get pillar display info
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
    return {
      icon: pillar.icon,
      color: 'blue',
      shortName: pillar.name.split(' ')[0],
    };
  };

  useEffect(() => {
    if (!pillarId) return;

    const loadPillarData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const [pillarResult, skillsResult] = await Promise.all([
          sportsService.getSport(pillarId),
          sportsService.getSkillsBySport(pillarId),
        ]);

        if (!pillarResult.success || !pillarResult.data) {
          setState(prev => ({
            ...prev,
            error: pillarResult.error?.message || 'Pillar not found',
            loading: false,
            skillsLoading: false,
          }));
          return;
        }

        if (!skillsResult.success) {
          setState(prev => ({
            ...prev,
            pillar: pillarResult.data ?? null,
            error: skillsResult.error?.message || 'Failed to load skills',
            loading: false,
            skillsLoading: false,
          }));
          return;
        }

        setState(prev => ({
          ...prev,
          pillar: pillarResult.data ?? null,
          skills: skillsResult.data?.items || [],
          loading: false,
          skillsLoading: false,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: 'An unexpected error occurred',
          loading: false,
          skillsLoading: false,
        }));
      }
    };

    loadPillarData();
  }, [pillarId]);

  // Load quiz progress for each skill
  useEffect(() => {
    if (!user || !state.skills.length) return;

    const loadSkillProgress = async () => {
      const progressMap: SkillProgress = {};

      await Promise.all(
        state.skills.map(async (skill) => {
          try {
            const attemptsResult = await videoQuizService.getUserVideoQuizAttempts(user.id, {
              skillId: skill.id,
              completed: true,
              limit: 1,
            });

            if (attemptsResult.success && attemptsResult.data?.items && attemptsResult.data.items.length > 0) {
              const latestAttempt = attemptsResult.data.items[0];
              progressMap[skill.id] = {
                percentage: latestAttempt.percentage,
                isCompleted: latestAttempt.isCompleted,
              };
            } else {
              progressMap[skill.id] = null;
            }
          } catch (error) {
            console.error(`Failed to load progress for skill ${skill.id}:`, error);
            progressMap[skill.id] = null;
          }
        })
      );

      setSkillProgress(progressMap);
    };

    loadSkillProgress();
  }, [user, state.skills]);

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'introduction':
        return 'text-green-600 bg-green-100';
      case 'development':
        return 'text-yellow-600 bg-yellow-100';
      case 'refinement':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error("Please log in to save favorites.");
      router.push('/auth/login');
      return;
    }

    setFavoriteLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsFavorited(!isFavorited);
      toast.success(
        isFavorited
          ? `${state.pillar?.name} removed from favorites`
          : `${state.pillar?.name} added to favorites`
      );
    } catch (error) {
      toast.error("Failed to update favorites. Please try again.");
    } finally {
      setFavoriteLoading(false);
    }
  };

  const filteredSkills = selectedDifficulty === 'all'
    ? state.skills
    : state.skills.filter(skill => skill.difficulty === selectedDifficulty);

  const skillsByDifficulty = {
    introduction: state.skills.filter(skill => skill.difficulty === 'introduction'),
    development: state.skills.filter(skill => skill.difficulty === 'development'),
    refinement: state.skills.filter(skill => skill.difficulty === 'refinement'),
  };

  if (state.loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading pillar details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (state.error || !state.pillar) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-red-600 text-4xl">!</div>
              <h3 className="text-lg font-medium text-red-900">
                {state.error || 'Pillar not found'}
              </h3>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => router.back()}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { pillar } = state;
  const displayInfo = getPillarDisplayInfo(pillar);
  const colorClasses = getPillarColorClasses(displayInfo.color);
  const IconComponent = PILLAR_ICONS[displayInfo.icon] || Target;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Pillars
      </Button>

      {/* Pillar Header */}
      <div className="space-y-6">
        {/* Gradient Header with Icon */}
        <div className={`relative overflow-hidden rounded-lg bg-gradient-to-br ${colorClasses.gradient} p-8 md:p-12`}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 md:h-24 md:w-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <IconComponent className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </div>
              <div className="text-white space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-bold">{pillar.name}</h1>
                  {pillar.isFeatured && (
                    <span className="bg-white/20 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full font-medium">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-lg text-white/90 max-w-2xl">{pillar.description}</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleToggleFavorite}
              disabled={favoriteLoading}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              {favoriteLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isFavorited ? (
                <Heart className="w-4 h-4 fill-current text-red-500" />
              ) : (
                <Heart className="w-4 h-4" />
              )}
              <span className="ml-2 hidden md:inline">{isFavorited ? 'Favorited' : 'Favorite'}</span>
            </Button>
          </div>
        </div>

        {/* Pillar Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={`${colorClasses.border} border-2`}>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded ${colorClasses.bgLight} ${colorClasses.text} text-sm font-medium`}>
                  Pillar {pillar.order}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Pillar Number</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-muted-foreground" />
                <span className="text-xl font-semibold">{pillar.skillsCount}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Skills</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-muted-foreground" />
                <span className="text-xl font-semibold">{pillar.metadata.totalEnrollments}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Students Enrolled</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        {(pillar.metadata.averageRating > 0 || pillar.tags.length > 0) && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              {pillar.metadata.averageRating > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="text-lg font-semibold">{pillar.metadata.averageRating.toFixed(1)}</span>
                    <span className="text-muted-foreground">
                      ({pillar.metadata.totalRatings} reviews)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Trophy className="w-4 h-4" />
                    <span>{pillar.metadata.totalCompletions} completed</span>
                  </div>
                </div>
              )}

              {pillar.tags.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {pillar.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Skills Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Skills ({state.skills.length})</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Filter by difficulty:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as DifficultyLevel | 'all')}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="all">All Levels</option>
              <option value="introduction">Introduction ({skillsByDifficulty.introduction.length})</option>
              <option value="development">Development ({skillsByDifficulty.development.length})</option>
              <option value="refinement">Refinement ({skillsByDifficulty.refinement.length})</option>
            </select>
          </div>
        </div>

        {state.skillsLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredSkills.length === 0 ? (
          <Card className="p-8">
            <div className="text-center space-y-4">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-medium">No skills found</h3>
              <p className="text-muted-foreground">
                {selectedDifficulty === 'all'
                  ? 'This pillar doesn\'t have any skills yet.'
                  : `No ${selectedDifficulty} level skills available.`}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkills.map((skill, index) => (
              <Link key={skill.id} href={`/pillars/${pillarId}/skills/${skill.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {skill.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="bg-muted px-2 py-1 rounded text-xs">
                            Skill {index + 1}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${getDifficultyColor(skill.difficulty)}`}
                          >
                            {skill.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {skill.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        {skill.hasVideo && (
                          <div className="flex items-center gap-1">
                            <Play className="w-4 h-4" />
                            <span className="text-xs">Video</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {skill.learningObjectives.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">Learning Objectives</h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {skill.learningObjectives.slice(0, 2).map((objective, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-primary text-xs mt-1">*</span>
                              <span className="line-clamp-1">{objective}</span>
                            </li>
                          ))}
                          {skill.learningObjectives.length > 2 && (
                            <li className="text-xs text-muted-foreground italic">
                              +{skill.learningObjectives.length - 2} more objectives
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {skill.prerequisites.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>Prerequisites:</span>
                        <span>{skill.prerequisites.length} skill{skill.prerequisites.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}

                    {/* Progress Bar - Latest Quiz Score */}
                    {user && skillProgress[skill.id] && (
                      <div className="space-y-2 pt-3 border-t border-border/50">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground">Latest Score</span>
                          <div className="flex items-center space-x-1">
                            <span className={`text-lg font-bold ${
                              skillProgress[skill.id]!.isCompleted
                                ? 'text-green-600'
                                : 'text-amber-600'
                            }`}>
                              {Math.round(skillProgress[skill.id]!.percentage)}%
                            </span>
                            {skillProgress[skill.id]!.isCompleted && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ease-out ${
                              skillProgress[skill.id]!.isCompleted
                                ? 'bg-green-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${skillProgress[skill.id]!.percentage}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {user && skillProgress[skill.id] === null && (
                      <div className="pt-3 border-t border-border/50">
                        <div className="text-xs text-muted-foreground text-center">
                          No quiz attempts yet
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
