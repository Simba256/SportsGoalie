'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { AdminRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Quiz } from '@/types/quiz';
import { Sport, Skill } from '@/types';
import { firebaseService } from '@/lib/firebase/service';
import { cacheOrFetch } from '@/lib/utils/cache.service';
import Link from 'next/link';

function QuizzesAdminContent() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [quizzesData, sportsData, skillsData] = await Promise.all([
        cacheOrFetch('admin-quizzes', () => firebaseService.getCollection('quizzes')),
        cacheOrFetch('admin-sports', () => firebaseService.getCollection('sports')),
        cacheOrFetch('admin-skills', () => firebaseService.getCollection('skills'))
      ]);

      setQuizzes(quizzesData as Quiz[]);
      setSports(sportsData as Sport[]);
      setSkills(skillsData as Skill[]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;

    try {
      await firebaseService.deleteDocument('quizzes', quizId);
      setQuizzes(prev => prev.filter(quiz => quiz.id !== quizId));
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error('Failed to delete quiz', {
        description: 'Please try again or contact support if the problem persists.',
      });
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = selectedSport === 'all' || quiz.sportId === selectedSport;
    const matchesDifficulty = selectedDifficulty === 'all' || quiz.difficulty === selectedDifficulty;

    return matchesSearch && matchesSport && matchesDifficulty;
  });

  const getSportName = (sportId?: string) => {
    if (!sportId) return 'General';
    const sport = sports.find(s => s.id === sportId);
    return sport?.name || 'Unknown Sport';
  };

  const getSkillName = (skillId?: string) => {
    if (!skillId) return null;
    const skill = skills.find(s => s.id === skillId);
    return skill?.name;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quiz Management</h1>
          <p className="text-gray-600 mt-2">Create and manage interactive quizzes</p>
        </div>
        <Link href="/admin/quizzes/create">
          <Button className="flex items-center gap-2">
            <Plus size={20} />
            Create Quiz
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedSport} onValueChange={setSelectedSport}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by sport" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sports</SelectItem>
            {sports.map((sport) => (
              <SelectItem key={sport.id} value={sport.id}>
                {sport.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz) => (
          <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">{quiz.title}</CardTitle>
                <div className="flex gap-1 ml-2">
                  <Link href={`/admin/quizzes/${quiz.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye size={16} />
                    </Button>
                  </Link>
                  <Link href={`/admin/quizzes/${quiz.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Edit size={16} />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {quiz.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {quiz.description}
                </p>
              )}

              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {getSportName(quiz.sportId)}
                  </Badge>
                  {quiz.skillId && (
                    <Badge variant="outline">
                      {getSkillName(quiz.skillId)}
                    </Badge>
                  )}
                  <Badge
                    variant={quiz.difficulty === 'beginner' ? 'default' :
                            quiz.difficulty === 'intermediate' ? 'secondary' : 'destructive'}
                  >
                    {quiz.difficulty}
                  </Badge>
                  <Badge variant={quiz.isActive ? 'default' : 'secondary'}>
                    {quiz.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="text-sm text-gray-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Questions:</span>
                    <span>{quiz.metadata.totalQuestions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Est. Duration:</span>
                    <span>{quiz.estimatedDuration} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Points:</span>
                    <span>{quiz.metadata.totalPoints}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Attempts:</span>
                    <span>{quiz.metadata.totalAttempts}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQuizzes.length === 0 && (
        <div className="text-center py-12">
          <Filter className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No quizzes found</h3>
          <p className="mt-1 text-gray-500">
            {searchTerm || selectedSport !== 'all' || selectedDifficulty !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first quiz'
            }
          </p>
          {!searchTerm && selectedSport === 'all' && selectedDifficulty === 'all' && (
            <div className="mt-6">
              <Link href="/admin/quizzes/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Quiz
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function QuizzesAdminPage() {
  return (
    <AdminRoute>
      <QuizzesAdminContent />
    </AdminRoute>
  );
}