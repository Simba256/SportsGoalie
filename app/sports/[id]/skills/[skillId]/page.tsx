'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sport, Skill, DifficultyLevel } from '@/types';
import { sportsService } from '@/lib/database/services/sports.service';
import { quizService } from '@/lib/database/services/quiz.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  BookOpen,
  Play,
  CheckCircle,
  Star,
  ExternalLink,
  Target,
  AlertTriangle,
  Bookmark,
  Share2,
} from 'lucide-react';

interface SkillDetailState {
  sport: Sport | null;
  skill: Skill | null;
  prerequisites: Skill[];
  loading: boolean;
  error: string | null;
  hasQuizzes: boolean;
  quizzesLoading: boolean;
}

export default function SkillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sportId = params.id as string;
  const skillId = params.skillId as string;

  const [state, setState] = useState<SkillDetailState>({
    sport: null,
    skill: null,
    prerequisites: [],
    loading: true,
    error: null,
    hasQuizzes: false,
    quizzesLoading: true,
  });

  const [activeTab, setActiveTab] = useState<'content' | 'objectives' | 'resources'>('content');

  useEffect(() => {
    if (!sportId || !skillId) return;

    const loadSkillData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        // Load sport, skill, and prerequisites
        const [sportResult, skillResult] = await Promise.all([
          sportsService.getSport(sportId),
          sportsService.getSkill(skillId),
        ]);

        if (!sportResult.success || !sportResult.data) {
          setState(prev => ({
            ...prev,
            error: 'Sport not found',
            loading: false,
          }));
          return;
        }

        if (!skillResult.success || !skillResult.data) {
          setState(prev => ({
            ...prev,
            sport: sportResult.data,
            error: 'Skill not found',
            loading: false,
          }));
          return;
        }

        // Load prerequisites if they exist
        let prerequisites: Skill[] = [];
        if (skillResult.data.prerequisites.length > 0) {
          const prereqResult = await sportsService.getSkillPrerequisites(skillId);
          if (prereqResult.success && prereqResult.data) {
            prerequisites = prereqResult.data;
          }
        }

        setState(prev => ({
          ...prev,
          sport: sportResult.data,
          skill: skillResult.data,
          prerequisites,
          loading: false,
        }));

        // Check if quizzes exist for this skill
        checkForQuizzes(skillId);
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: 'An unexpected error occurred',
          loading: false,
        }));
      }
    };

    const checkForQuizzes = async (skillId: string) => {
      try {
        setState(prev => ({ ...prev, quizzesLoading: true }));
        console.log('🔍 Checking for quizzes for skillId:', skillId);
        const quizzesResult = await quizService.getQuizzesBySkill(skillId);
        console.log('📊 Quiz query result:', quizzesResult);

        const hasQuizzes = quizzesResult.success && quizzesResult.data.items.length > 0;

        if (hasQuizzes) {
          console.log('✅ Found quizzes:', quizzesResult.data.items.map(q => ({
            id: q.id,
            title: q.title,
            isActive: q.isActive,
            isPublished: q.isPublished
          })));
        } else {
          console.log('❌ No active quizzes found. Check if quiz is marked as active and published.');
        }

        setState(prev => ({
          ...prev,
          hasQuizzes,
          quizzesLoading: false,
        }));
      } catch (error) {
        console.error('Error checking for quizzes:', error);
        setState(prev => ({
          ...prev,
          hasQuizzes: false,
          quizzesLoading: false,
        }));
      }
    };

    loadSkillData();
  }, [sportId, skillId]);

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

  const handleTakeQuiz = async () => {
    if (!skillId) return;

    try {
      console.log('Fetching quizzes for skillId:', skillId);
      const quizzesResult = await quizService.getQuizzesBySkill(skillId);

      console.log('Quiz query result:', quizzesResult);

      if (quizzesResult.success && quizzesResult.data.items.length > 0) {
        const quiz = quizzesResult.data.items[0];
        console.log('Found quiz:', quiz);
        router.push(`/quiz/${quiz.id}`);
      } else {
        alert('Quiz not available yet. Please check back later!');
        console.log('No quiz found for skill:', skillId);
        console.log('Query result:', quizzesResult);
      }
    } catch (error) {
      alert('Unable to load quiz. Please try again later.');
      console.error('Error navigating to quiz:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
    }
  };

  if (state.loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading skill details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (state.error || !state.skill || !state.sport) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-red-600 text-4xl">⚠️</div>
              <h3 className="text-lg font-medium text-red-900">
                {state.error || 'Skill not found'}
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

  const { sport, skill, prerequisites } = state;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link href="/sports" className="hover:text-primary">Sports</Link>
        <span>/</span>
        <Link href={`/sports/${sportId}`} className="hover:text-primary">{sport.name}</Link>
        <span>/</span>
        <span className="text-foreground">{skill.name}</span>
      </nav>

      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to {sport.name}
      </Button>

      {/* Skill Header */}
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-4 flex-1">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{skill.name}</h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(skill.difficulty)}`}
                >
                  {skill.difficulty}
                </span>
              </div>
              <p className="text-lg text-muted-foreground">{skill.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Bookmark className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Skill Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span className="text-xl font-semibold">
                  {formatDuration(skill.estimatedTimeToComplete)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Est. Time</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-muted-foreground" />
                <span className="text-xl font-semibold">{skill.learningObjectives.length}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Objectives</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                {skill.hasVideo && <Play className="w-5 h-5 text-green-600" />}
                {state.hasQuizzes && <CheckCircle className="w-5 h-5 text-blue-600" />}
                <span className="text-xl font-semibold">
                  {[skill.hasVideo && 'Video', state.hasQuizzes && 'Quiz'].filter(Boolean).join(' + ') || 'Text'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Content Type</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-xl font-semibold">
                  {skill.metadata.averageRating > 0 ? skill.metadata.averageRating.toFixed(1) : 'New'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Prerequisites Warning */}
        {prerequisites.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-medium text-yellow-900">Prerequisites Required</h4>
                  <p className="text-sm text-yellow-800">
                    Complete these skills before starting this one for the best learning experience:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {prerequisites.map((prereq) => (
                      <Link key={prereq.id} href={`/sports/${sportId}/skills/${prereq.id}`}>
                        <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-sm hover:bg-yellow-300 transition-colors">
                          {prereq.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Content Tabs */}
      <div className="space-y-6">
        <div className="border-b">
          <nav className="flex space-x-8">
            {[
              { id: 'content', label: 'Content', icon: BookOpen },
              { id: 'objectives', label: 'Learning Objectives', icon: Target },
              { id: 'resources', label: 'Resources', icon: ExternalLink },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as typeof activeTab)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'content' && (
            <div className="space-y-6">
              {/* Video Content */}
              {skill.hasVideo && skill.media?.videos && skill.media.videos.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Play className="w-5 h-5" />
                      Video Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {skill.media.videos.map((video) => (
                      <div key={video.id} className="space-y-2">
                        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                          <div className="text-center space-y-2">
                            <Play className="w-12 h-12 text-muted-foreground mx-auto" />
                            <p className="text-sm text-muted-foreground">
                              Video Player: {video.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Duration: {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                            </p>
                          </div>
                        </div>
                        <h4 className="font-medium">{video.title}</h4>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Text Content */}
              {skill.content && (
                <Card>
                  <CardHeader>
                    <CardTitle>Skill Guide</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: skill.content }}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Images */}
              {skill.media?.images && skill.media.images.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Visual Guide</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {skill.media.images.map((image) => (
                        <div key={image.id} className="space-y-2">
                          <img
                            src={image.url}
                            alt={image.alt}
                            className="w-full rounded-lg"
                          />
                          {image.caption && (
                            <p className="text-sm text-muted-foreground">{image.caption}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quiz Section - Dynamically shown if quizzes exist */}
              {state.quizzesLoading ? (
                <Card className="bg-gray-50 border-gray-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <p className="text-sm text-gray-600">Checking for quizzes...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : state.hasQuizzes ? (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-8 h-8 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-blue-900">Knowledge Check</h4>
                          <p className="text-sm text-blue-700">
                            Test your understanding with an interactive quiz
                          </p>
                        </div>
                      </div>
                      <Button onClick={handleTakeQuiz}>
                        Take Quiz
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          )}

          {activeTab === 'objectives' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Learning Objectives
                </CardTitle>
                <CardDescription>
                  By the end of this skill, you will be able to:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {skill.learningObjectives.map((objective, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-4">
              {skill.externalResources && skill.externalResources.length > 0 ? (
                skill.externalResources.map((resource, index) => (
                  <Card key={resource.id || `resource-${index}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">{resource.title}</h4>
                          {resource.description && (
                            <p className="text-sm text-muted-foreground">{resource.description}</p>
                          )}
                          <span className="inline-block bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                            {resource.type}
                          </span>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <ExternalLink className="w-8 h-8 text-muted-foreground mx-auto" />
                      <h4 className="font-medium">No external resources</h4>
                      <p className="text-sm text-muted-foreground">
                        All the learning material is included in the skill content above.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Section */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Ready to start this skill?</h3>
              <p className="text-sm text-muted-foreground">
                Track your progress and mark as complete when finished
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                Mark as Complete
              </Button>
              <Button>
                Start Learning
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}