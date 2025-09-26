'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { AdminRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Quiz } from '@/types/quiz';
import { Sport, Skill, DifficultyLevel } from '@/types';
import { sportsService } from '@/lib/database/services/sports.service';
import { quizService } from '@/lib/database/services/quiz.service';

function EditQuizContent() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const [sports, setSports] = useState<Sport[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  const [quizData, setQuizData] = useState<Partial<Quiz>>({
    title: '',
    description: '',
    sportId: '',
    skillId: '',
    coverImage: '',
    instructions: '',
    difficulty: 'medium' as DifficultyLevel,
    estimatedDuration: 10,
    tags: [],
    isPublished: false,
  });

  useEffect(() => {
    loadInitialData();
  }, [quizId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Load quiz data, sports, and skills in parallel
      const [quizResult, sportsResult, skillsResult] = await Promise.all([
        quizService.getQuiz(quizId),
        sportsService.getAllSports(),
        sportsService.getAllSkills()
      ]);

      if (quizResult.success && quizResult.data) {
        const quizData = quizResult.data;
        setQuiz(quizData);
        setQuizData({
          title: quizData.title || '',
          description: quizData.description || '',
          sportId: quizData.sportId || '',
          skillId: quizData.skillId || '',
          coverImage: quizData.coverImage || '',
          instructions: quizData.instructions || '',
          difficulty: quizData.difficulty || 'medium',
          estimatedDuration: quizData.estimatedDuration || 10,
          tags: quizData.tags || [],
          isPublished: quizData.isPublished || false,
        });
      } else {
        toast.error('Quiz not found');
        router.push('/admin/quizzes');
        return;
      }

      if (sportsResult.success && sportsResult.data) {
        setSports(sportsResult.data.items);
      }

      if (skillsResult.success && skillsResult.data) {
        setSkills(skillsResult.data.items);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load quiz data');
      router.push('/admin/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaveLoading(true);

      // Validate required fields
      if (!quizData.title?.trim()) {
        toast.error('Quiz title is required');
        return;
      }
      if (!quizData.sportId) {
        toast.error('Please select a sport');
        return;
      }
      if (!quizData.skillId) {
        toast.error('Please select a skill');
        return;
      }

      // Update the quiz
      const updateData = {
        ...quizData,
        updatedAt: new Date(),
      };

      const result = await quizService.updateQuiz(quizId, updateData);

      if (result.success) {
        toast.success('Quiz updated successfully');
        router.push(`/admin/quizzes/${quizId}`);
      } else {
        toast.error(result.error?.message || 'Failed to update quiz');
      }
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setSaveLoading(false);
    }
  };

  const filteredSkills = skills.filter(skill => skill.sportId === quizData.sportId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600">Quiz not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Quiz</h1>
            <p className="text-gray-600 mt-1">Update quiz details and settings</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saveLoading}>
          <Save className="w-4 h-4 mr-2" />
          {saveLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Quiz Title *</Label>
                <Input
                  id="title"
                  value={quizData.title || ''}
                  onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                  placeholder="Enter quiz title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select
                  value={quizData.difficulty}
                  onValueChange={(value: DifficultyLevel) =>
                    setQuizData({ ...quizData, difficulty: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={quizData.description || ''}
                onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
                placeholder="Enter quiz description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sport">Sport *</Label>
                <Select
                  value={quizData.sportId}
                  onValueChange={(value) => setQuizData({ ...quizData, sportId: value, skillId: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {sports.map((sport) => (
                      <SelectItem key={sport.id} value={sport.id}>
                        {sport.icon} {sport.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="skill">Skill *</Label>
                <Select
                  value={quizData.skillId}
                  onValueChange={(value) => setQuizData({ ...quizData, skillId: value })}
                  disabled={!quizData.sportId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSkills.map((skill) => (
                      <SelectItem key={skill.id} value={skill.id}>
                        {skill.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedDuration">Estimated Duration (minutes)</Label>
              <Input
                id="estimatedDuration"
                type="number"
                min="1"
                max="180"
                value={quizData.estimatedDuration || 10}
                onChange={(e) => setQuizData({ ...quizData, estimatedDuration: parseInt(e.target.value) || 10 })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Quiz Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isPublished">Published</Label>
                <p className="text-sm text-gray-500">Make this quiz visible and accessible to users</p>
              </div>
              <Switch
                id="isPublished"
                checked={quizData.isPublished || false}
                onCheckedChange={(checked) => setQuizData({ ...quizData, isPublished: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function EditQuizPage() {
  return (
    <AdminRoute>
      <EditQuizContent />
    </AdminRoute>
  );
}