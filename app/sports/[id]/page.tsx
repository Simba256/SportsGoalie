'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sport, Skill, DifficultyLevel } from '@/types';
import { sportsService } from '@/lib/database/services/sports.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  Users,
  BookOpen,
  Play,
  CheckCircle,
  Star,
  Trophy,
} from 'lucide-react';

interface SportDetailState {
  sport: Sport | null;
  skills: Skill[];
  loading: boolean;
  skillsLoading: boolean;
  error: string | null;
}

export default function SportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sportId = params.id as string;

  const [state, setState] = useState<SportDetailState>({
    sport: null,
    skills: [],
    loading: true,
    skillsLoading: true,
    error: null,
  });

  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');

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

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
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
              <div className="p-6 text-white space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-4xl">{sport.icon}</span>
                  <h1 className="text-4xl font-bold">{sport.name}</h1>
                  {sport.isFeatured && (
                    <span className="bg-primary text-primary-foreground text-sm px-3 py-1 rounded-full font-medium">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-lg text-white/90 max-w-3xl">{sport.description}</p>
              </div>
            </div>
          </div>
        )}

        {!sport.imageUrl && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-6xl">{sport.icon}</span>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span className="text-xl font-semibold">
                  {Math.round(sport.estimatedTimeToComplete)}h
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Est. Duration</p>
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
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(skill.estimatedTimeToComplete)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {skill.hasVideo && (
                          <div className="flex items-center gap-1">
                            <Play className="w-4 h-4" />
                            <span className="text-xs">Video</span>
                          </div>
                        )}
                        {skill.hasQuiz && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs">Quiz</span>
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
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Action Section */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">Ready to start learning {sport.name}?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Begin your journey with {sport.skillsCount} comprehensive skills designed to take you from beginner to advanced level.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg">
                Start Learning
              </Button>
              <Button variant="outline" size="lg">
                Save to Favorites
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}