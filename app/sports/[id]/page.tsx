'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sport, Skill, DifficultyLevel, QuizAttempt } from '@/types';
import { sportsService } from '@/lib/database/services/sports.service';
import { videoQuizService } from '@/lib/database/services/video-quiz.service';
import { useSportEnrollment } from '@/src/hooks/useEnrollment';
import { useAuth } from '@/lib/auth/context';
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
  HeartOff,
  Loader2,
} from 'lucide-react';

interface SportDetailState {
  sport: Sport | null;
  skills: Skill[];
  loading: boolean;
  skillsLoading: boolean;
  error: string | null;
}

interface SkillProgress {
  [skillId: string]: {
    percentage: number;
    passed: boolean;
  } | null;
}

export default function SportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sportId = params.id as string;
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  // Debug auth state
  useEffect(() => {
    console.log('Auth state changed:', { user: !!user, id: user?.id, authLoading, isAuthenticated });
  }, [user, authLoading, isAuthenticated]);

  const [state, setState] = useState<SportDetailState>({
    sport: null,
    skills: [],
    loading: true,
    skillsLoading: true,
    error: null,
  });

  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [skillProgress, setSkillProgress] = useState<SkillProgress>({});

  // Use enrollment hook for the sport
  const {
    enrolled,
    progress,
    loading: enrollmentLoading,
    enroll,
    unenroll,
  } = useSportEnrollment(sportId);

  useEffect(() => {
    if (!sportId) return;

    const loadSportData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        // Load sport and skills in parallel
        const [sportResult, skillsResult] = await Promise.all([
          sportsService.getSport(sportId),
          sportsService.getSkillsBySport(sportId),
        ]);

        if (!sportResult.success || !sportResult.data) {
          setState(prev => ({
            ...prev,
            error: sportResult.error?.message || 'Sport not found',
            loading: false,
            skillsLoading: false,
          }));
          return;
        }

        if (!skillsResult.success) {
          setState(prev => ({
            ...prev,
            sport: sportResult.data,
            error: skillsResult.error?.message || 'Failed to load skills',
            loading: false,
            skillsLoading: false,
          }));
          return;
        }

        setState(prev => ({
          ...prev,
          sport: sportResult.data,
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

    loadSportData();
  }, [sportId]);

  // Load quiz progress for each skill
  useEffect(() => {
    if (!user || !state.skills.length) return;

    const loadSkillProgress = async () => {
      const progressMap: SkillProgress = {};

      // Load video quiz attempts for all skills in parallel
      await Promise.all(
        state.skills.map(async (skill) => {
          try {
            console.log(`📚 Loading progress for skill ${skill.id}`);

            // Get the latest video quiz attempt for this skill
            const attemptsResult = await videoQuizService.getUserVideoQuizAttempts(user.id, {
              skillId: skill.id,
              completed: true,
              limit: 1,
            });

            console.log(`📈 Progress result for skill ${skill.id}:`, {
              success: attemptsResult.success,
              hasData: !!attemptsResult.data,
              itemsCount: attemptsResult.data?.items?.length || 0,
              error: attemptsResult.error,
            });

            if (attemptsResult.success && attemptsResult.data?.items.length > 0) {
              const latestAttempt = attemptsResult.data.items[0];
              progressMap[skill.id] = {
                percentage: latestAttempt.percentage,
                passed: latestAttempt.passed,
              };
              console.log(`✅ Found progress for skill ${skill.id}:`, progressMap[skill.id]);
            } else {
              progressMap[skill.id] = null;
              console.log(`❌ No progress found for skill ${skill.id}`);
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
      case 'beginner':
        return 'text-green-600 bg-green-100';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-100';
      case 'advanced':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };


  // Handle enrollment in sport
  const handleStartLearning = async () => {
    console.log('handleStartLearning called, user state:', user);
    console.log('Auth loading state:', { user: !!user, id: user?.id });

    if (!user) {
      toast.error("Please log in to start learning this sport.");
      router.push('/auth/login');
      return;
    }

    if (enrolled) {
      // If already enrolled, navigate to first skill or continue where left off
      if (state.skills.length > 0) {
        // Find next skill to learn or first skill if none started
        const nextSkill = state.skills.find(skill =>
          !progress?.completedSkills.includes(skill.id)
        ) || state.skills[0];

        router.push(`/sports/${sportId}/skills/${nextSkill.id}`);
      } else {
        toast.error("This sport doesn't have any skills yet.");
      }
      return;
    }

    // Enroll in the sport
    try {
      console.log('Starting enrollment process...');
      const success = await enroll();
      console.log('Enrollment success:', success);

      if (success) {
        toast.success(`Successfully enrolled in ${state.sport?.name}! Start learning now!`);

        // Navigate to first skill if available
        if (state.skills.length > 0) {
          router.push(`/sports/${sportId}/skills/${state.skills[0].id}`);
        } else {
          // If no skills, navigate to dashboard to see progress
          router.push('/dashboard');
        }
      } else {
        toast.error("Enrollment failed. Please check the console for details and try again.");
      }
    } catch (error) {
      console.error('Enrollment error in component:', error);
      toast.error("An unexpected error occurred. Please check the console and try again.");
    }
  };

  // Handle favorites (placeholder for now)
  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error("Please log in to save favorites.");
      router.push('/auth/login');
      return;
    }

    setFavoriteLoading(true);
    try {
      // TODO: Implement favorites functionality in backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      setIsFavorited(!isFavorited);
      toast.success(
        isFavorited
          ? `${state.sport?.name} removed from favorites`
          : `${state.sport?.name} added to favorites`
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
    beginner: state.skills.filter(skill => skill.difficulty === 'beginner'),
    intermediate: state.skills.filter(skill => skill.difficulty === 'intermediate'),
    advanced: state.skills.filter(skill => skill.difficulty === 'advanced'),
  };

  if (state.loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading sport details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (state.error || !state.sport) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-red-600 text-4xl">⚠️</div>
              <h3 className="text-lg font-medium text-red-900">
                {state.error || 'Sport not found'}
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

  const { sport } = state;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Sports
      </Button>

      {/* Sport Header */}
      <div className="space-y-6">
        {sport.imageUrl && (
          <div className="aspect-video md:aspect-[21/9] relative overflow-hidden rounded-lg">
            <img
              src={sport.imageUrl}
              alt={sport.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-end">
              <div className="p-6 text-white space-y-2 w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h1 className="text-4xl font-bold">{sport.name}</h1>
                    {sport.isFeatured && (
                      <span className="bg-primary text-primary-foreground text-sm px-3 py-1 rounded-full font-medium">
                        Featured
                      </span>
                    )}
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
                    <span className="ml-2">{isFavorited ? 'Favorited' : 'Favorite'}</span>
                  </Button>
                </div>
                <p className="text-lg text-white/90 max-w-3xl">{sport.description}</p>
              </div>
            </div>
          </div>
        )}

        {!sport.imageUrl && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold">{sport.name}</h1>
                <p className="text-xl text-muted-foreground mt-2">{sport.description}</p>
              </div>
              {sport.isFeatured && (
                <span className="bg-primary text-primary-foreground text-sm px-3 py-1 rounded-full font-medium">
                  Featured
                </span>
              )}
            </div>
          </div>
        )}

        {/* Sport Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(sport.difficulty)}`}
                >
                  {sport.difficulty}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Difficulty Level</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-muted-foreground" />
                <span className="text-xl font-semibold">{sport.skillsCount}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Skills</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-muted-foreground" />
                <span className="text-xl font-semibold">{sport.metadata.totalEnrollments}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Enrolled</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        {(sport.metadata.averageRating > 0 || sport.tags.length > 0) && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              {sport.metadata.averageRating > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="text-lg font-semibold">{sport.metadata.averageRating.toFixed(1)}</span>
                    <span className="text-muted-foreground">
                      ({sport.metadata.totalRatings} reviews)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Trophy className="w-4 h-4" />
                    <span>{sport.metadata.totalCompletions} completed</span>
                  </div>
                </div>
              )}

              {sport.tags.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {sport.tags.map((tag) => (
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
              <option value="beginner">Beginner ({skillsByDifficulty.beginner.length})</option>
              <option value="intermediate">Intermediate ({skillsByDifficulty.intermediate.length})</option>
              <option value="advanced">Advanced ({skillsByDifficulty.advanced.length})</option>
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
                  ? 'This sport doesn\'t have any skills yet.'
                  : `No ${selectedDifficulty} level skills available.`}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkills.map((skill, index) => (
              <Link key={skill.id} href={`/sports/${sportId}/skills/${skill.id}`}>
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
                              <span className="text-primary text-xs mt-1">•</span>
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
                              skillProgress[skill.id]!.passed
                                ? 'text-green-600'
                                : 'text-amber-600'
                            }`}>
                              {Math.round(skillProgress[skill.id]!.percentage)}%
                            </span>
                            {skillProgress[skill.id]!.passed && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ease-out ${
                              skillProgress[skill.id]!.passed
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