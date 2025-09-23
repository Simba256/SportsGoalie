'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { completeQuizSchema } from '@/lib/validation/quiz';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Quiz, QuizSettings, Question } from '@/types/quiz';
import { Sport, Skill, DifficultyLevel } from '@/types';
import { firebaseService } from '@/lib/firebase/service';
import { QuestionBuilder } from '@/components/admin/QuestionBuilder';
import Link from 'next/link';

function CreateQuizContent() {
  const router = useRouter();
  const [sports, setSports] = useState<Sport[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

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
    isActive: false,
    isPublished: false,
    category: 'general',
    questions: [],
    settings: {
      timeLimit: 30,
      shuffleQuestions: false,
      showProgressBar: true,
      allowReview: true,
      allowBacktrack: true,
      passingScore: 70,
      maxAttempts: 3,
      showCorrectAnswers: true,
      showExplanations: true,
      showScoreImmediately: true,
      requireAllQuestions: true,
    } as QuizSettings,
  });

  useEffect(() => {
    loadSportsAndSkills();
  }, []);

  const loadSportsAndSkills = async () => {
    try {
      setLoading(true);
      const [sportsData, skillsData] = await Promise.all([
        firebaseService.getCollection('sports'),
        firebaseService.getCollection('skills')
      ]);
      setSports(sportsData as Sport[]);
      setSkills(skillsData as Skill[]);
    } catch (error) {
      console.error('Error loading sports and skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    // Convert "none" values to undefined for optional fields
    const processedValue = value === "none" ? undefined : value;
    setQuizData(prev => ({
      ...prev,
      [field]: processedValue
    }));
  };

  const handleSettingsChange = (field: string, value: string | number | boolean) => {
    setQuizData(prev => ({
      ...prev,
      settings: {
        ...prev.settings!,
        [field]: value
      }
    }));
  };


  const handleAddQuestion = (question: Question) => {
    setQuizData(prev => ({
      ...prev,
      questions: [...(prev.questions || []), question]
    }));
  };

  const handleUpdateQuestion = (index: number, question: Question) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions?.map((q, i) => i === index ? question : q) || []
    }));
  };

  const handleDeleteQuestion = (index: number) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions?.filter((_, i) => i !== index) || []
    }));
  };

  const calculateMetadata = () => {
    const questions = quizData.questions || [];
    const totalQuestions = questions.length;
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    return {
      totalQuestions,
      totalPoints,
      averageScore: 0,
      completionRate: 0,
      averageDuration: quizData.estimatedDuration || 0,
      totalAttempts: 0,
      ratings: {
        average: 0,
        count: 0
      }
    };
  };

  const handleSaveQuiz = async () => {
    // Validate quiz data using Zod schema
    const validationResult = completeQuizSchema.safeParse({
      ...quizData,
      questions: quizData.questions || [],
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      toast.error('Validation Error', {
        description: firstError.message,
      });
      console.error('Validation errors:', validationResult.error.issues);
      return;
    }

    try {
      setSaveLoading(true);

      // Build quiz data using validated data, omitting undefined optional fields
      const finalQuizData: Partial<Quiz> = {
        title: validationResult.data.title,
        description: validationResult.data.description || '',
        questions: validationResult.data.questions,
        settings: quizData.settings!,
        difficulty: quizData.difficulty!,
        estimatedDuration: quizData.estimatedDuration!,
        tags: quizData.tags || [],
        isActive: quizData.isActive!,
        isPublished: quizData.isPublished!,
        category: quizData.category!,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin',
        metadata: calculateMetadata(),
      };

      // MANDATORY: Every quiz must have both sportId and skillId
      if (!quizData.sportId || quizData.sportId.trim() === '') {
        toast.error('Sport is required', {
          description: 'Every quiz must be associated with a sport.',
        });
        return;
      }

      if (!quizData.skillId || quizData.skillId.trim() === '') {
        toast.error('Skill is required', {
          description: 'Every quiz must be associated with a skill.',
        });
        return;
      }

      finalQuizData.sportId = quizData.sportId;
      finalQuizData.skillId = quizData.skillId;

      if (quizData.coverImage && quizData.coverImage.trim()) {
        finalQuizData.coverImage = quizData.coverImage;
      }

      if (quizData.instructions && quizData.instructions.trim()) {
        finalQuizData.instructions = quizData.instructions;
      }

      const docId = await firebaseService.addDocument('quizzes', finalQuizData);

      toast.success('Quiz created successfully!', {
        description: 'Your quiz has been saved and is ready for use.',
      });
      router.push(`/admin/quizzes/${docId}`);
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast.error('Failed to create quiz', {
        description: 'Please try again or contact support if the problem persists.',
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const filteredSkills = skills.filter(skill =>
    !quizData.sportId || skill.sportId === quizData.sportId
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/quizzes">
          <Button variant="outline" size="sm">
            <ArrowLeft size={16} className="mr-2" />
            Back to Quizzes
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Quiz</h1>
          <p className="text-gray-600 mt-1">Build an interactive quiz with multimedia questions</p>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Quiz Title *</Label>
                  <Input
                    id="title"
                    value={quizData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter quiz title"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={quizData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    placeholder="e.g., Skills Assessment"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={quizData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what this quiz covers"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={quizData.instructions}
                  onChange={(e) => handleInputChange('instructions', e.target.value)}
                  placeholder="Instructions for quiz takers"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="sport">Sport *</Label>
                  <Select value={quizData.sportId || ""} onValueChange={(value) => handleInputChange('sportId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a sport" />
                    </SelectTrigger>
                    <SelectContent>
                      {sports.map((sport) => (
                        <SelectItem key={sport.id} value={sport.id}>
                          {sport.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-1">Every quiz must be associated with a sport</p>
                </div>

                <div>
                  <Label htmlFor="skill">Skill *</Label>
                  <Select
                    value={quizData.skillId || ""}
                    onValueChange={(value) => handleInputChange('skillId', value)}
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
                  <p className="text-sm text-gray-500 mt-1">Every quiz must be associated with a skill</p>
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={quizData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value as DifficultyLevel)}>
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

              <div>
                <Label htmlFor="estimatedDuration">Estimated Duration (minutes)</Label>
                <Input
                  id="estimatedDuration"
                  type="number"
                  min="1"
                  value={quizData.estimatedDuration}
                  onChange={(e) => handleInputChange('estimatedDuration', parseInt(e.target.value))}
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={quizData.isActive}
                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublished"
                    checked={quizData.isPublished}
                    onCheckedChange={(checked) => handleInputChange('isPublished', checked)}
                  />
                  <Label htmlFor="isPublished">Published</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      min="0"
                      value={quizData.settings?.timeLimit || ''}
                      onChange={(e) => handleSettingsChange('timeLimit', e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="No time limit"
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxAttempts">Maximum Attempts</Label>
                    <Input
                      id="maxAttempts"
                      type="number"
                      min="1"
                      value={quizData.settings?.maxAttempts}
                      onChange={(e) => handleSettingsChange('maxAttempts', parseInt(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="passingScore">Passing Score (%)</Label>
                    <Input
                      id="passingScore"
                      type="number"
                      min="0"
                      max="100"
                      value={quizData.settings?.passingScore}
                      onChange={(e) => handleSettingsChange('passingScore', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'shuffleQuestions', label: 'Shuffle Questions' },
                    { key: 'showProgressBar', label: 'Show Progress Bar' },
                    { key: 'allowReview', label: 'Allow Review' },
                    { key: 'allowBacktrack', label: 'Allow Backtrack' },
                    { key: 'showCorrectAnswers', label: 'Show Correct Answers' },
                    { key: 'showExplanations', label: 'Show Explanations' },
                    { key: 'showScoreImmediately', label: 'Show Score Immediately' },
                    { key: 'requireAllQuestions', label: 'Require All Questions' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Switch
                        id={key}
                        checked={quizData.settings?.[key as keyof QuizSettings] as boolean}
                        onCheckedChange={(checked) => handleSettingsChange(key, checked)}
                      />
                      <Label htmlFor={key}>{label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          <QuestionBuilder
            questions={quizData.questions || []}
            onAddQuestion={handleAddQuestion}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
          />
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">{quizData.title}</h3>
                {quizData.description && (
                  <p className="text-gray-600">{quizData.description}</p>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Questions: {quizData.questions?.length || 0}</div>
                  <div>Duration: {quizData.estimatedDuration} minutes</div>
                  <div>Difficulty: {quizData.difficulty}</div>
                  <div>Passing Score: {quizData.settings?.passingScore}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4 mt-8">
        <Link href="/admin/quizzes">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button onClick={handleSaveQuiz} disabled={saveLoading}>
          {saveLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save size={16} className="mr-2" />
              Save Quiz
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function CreateQuizPage() {
  return (
    <AdminRoute>
      <CreateQuizContent />
    </AdminRoute>
  );
}