'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  Home,
  Download,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Quiz,
  QuizAttempt,
  Question,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
} from '@/types/quiz';

interface QuizResult {
  attempt: QuizAttempt;
  quiz: Quiz;
  breakdown: {
    correct: number;
    incorrect: number;
    unanswered: number;
    totalQuestions: number;
  };
  categoryBreakdown: {
    [category: string]: {
      correct: number;
      total: number;
      percentage: number;
    };
  };
}
import { quizService } from '@/lib/database/services/quiz.service';
import { useAuth } from '@/lib/auth/context';
import Link from 'next/link';

export default function QuizResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const quizId = params.id as string;
  const attemptId = params.attemptId as string;

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    if (quizId && attemptId) {
      loadResults();
    }
  }, [quizId, attemptId]);

  const loadResults = async () => {
    try {
      setLoading(true);

      const [quizResult, attemptResult] = await Promise.all([
        quizService.getQuiz(quizId),
        quizService.getQuizAttempt(attemptId),
      ]);

      const quizData = quizResult.success ? quizResult.data : null;
      const attemptData = attemptResult.success ? attemptResult.data : null;

      if (!quizData || !attemptData) {
        toast.error('Results not found', {
          description: 'The quiz results could not be found.',
        });
        router.push('/');
        return;
      }

      const quizObj = quizData as Quiz;
      const attemptObj = attemptData as QuizAttempt;

      setQuiz(quizObj);
      setAttempt(attemptObj);

      const correctAnswers = attemptObj.answers.filter(answer => answer.isCorrect).length;
      const incorrectAnswers = attemptObj.answers.filter(answer => !answer.isCorrect).length;
      const unanswered = quizObj.questions.length - attemptObj.answers.length;

      const categoryBreakdown: { [category: string]: { correct: number; total: number; percentage: number } } = {};

      quizObj.questions.forEach((question) => {
        const category = question.tags?.[0] || 'General';
        if (!categoryBreakdown[category]) {
          categoryBreakdown[category] = { correct: 0, total: 0, percentage: 0 };
        }
        categoryBreakdown[category].total++;

        const answer = attemptObj.answers.find(a => a.questionId === question.id);
        if (answer?.isCorrect) {
          categoryBreakdown[category].correct++;
        }
      });

      Object.keys(categoryBreakdown).forEach(category => {
        const breakdown = categoryBreakdown[category];
        breakdown.percentage = (breakdown.correct / breakdown.total) * 100;
      });

      const resultData: QuizResult = {
        attempt: attemptObj,
        quiz: quizObj,
        breakdown: {
          correct: correctAnswers,
          incorrect: incorrectAnswers,
          unanswered,
          totalQuestions: quizObj.questions.length,
        },
        categoryBreakdown,
      };

      setResult(resultData);
    } catch (error) {
      console.error('Error loading results:', error);
      toast.error('Failed to load results', {
        description: 'Please try refreshing the page or contact support.',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeLetter = (percentage: number) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const canRetakeQuiz = () => {
    if (!quiz || !user) return false;

    return quiz.settings.maxAttempts > 1;
  };

  const handleRetakeQuiz = () => {
    router.push(`/quiz/${quizId}`);
  };

  const getCorrectAnswerText = (question: Question): string => {
    switch (question.type) {
      case 'multiple_choice':
        const mcQuestion = question as MultipleChoiceQuestion;
        const correctOptions = mcQuestion.options.filter(opt => opt.isCorrect);
        return correctOptions.map(opt => opt.text).join(', ');

      case 'true_false':
        const tfQuestion = question as TrueFalseQuestion;
        return tfQuestion.correctAnswer ? 'True' : 'False';

      case 'fill_in_blank':
        return 'See explanation';

      case 'descriptive':
        return 'Manual grading required';

      case 'matching':
        return 'See explanation';

      default:
        return 'N/A';
    }
  };

  const getUserAnswerText = (question: Question, answer: string | boolean | string[]): string => {
    if (!answer) return 'No answer provided';

    switch (question.type) {
      case 'multiple_choice':
        const mcQuestion = question as MultipleChoiceQuestion;
        if (Array.isArray(answer.selectedOptions)) {
          const selectedTexts = answer.selectedOptions
            .map((optId: string) => mcQuestion.options.find(opt => opt.id === optId)?.text)
            .filter(Boolean);
          return selectedTexts.join(', ') || 'No selection';
        }
        return 'No selection';

      case 'true_false':
        return answer.selectedOptions?.[0] === 'true' ? 'True' : 'False';

      case 'descriptive':
        return answer.textAnswer || 'No answer provided';

      case 'fill_in_blank':
        return Array.isArray(answer.selectedOptions)
          ? answer.selectedOptions.join(', ')
          : 'No answer provided';

      case 'matching':
        return answer.textAnswer || 'See details';

      default:
        return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!result || !quiz || !attempt) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Results not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Results</h1>
        <h2 className="text-xl text-gray-600">{quiz.title}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {attempt.passed ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              {attempt.passed ? 'Passed!' : 'Not Passed'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Score</span>
                  <span className={`text-2xl font-bold ${getGradeColor(attempt.score)}`}>
                    {attempt.score.toFixed(1)}% ({getGradeLetter(attempt.score)})
                  </span>
                </div>
                <Progress value={attempt.score} className="h-3" />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>{attempt.pointsEarned} / {attempt.totalPoints} points</span>
                  <span>Passing: {quiz.settings.passingScore}%</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {result.breakdown.correct}
                  </div>
                  <div className="text-sm text-gray-500">Correct</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {result.breakdown.incorrect}
                  </div>
                  <div className="text-sm text-gray-500">Incorrect</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-600">
                    {result.breakdown.unanswered}
                  </div>
                  <div className="text-sm text-gray-500">Unanswered</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Time Spent:</span>
              <span className="font-medium">{formatTime(attempt.timeSpent)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Est. Duration:</span>
              <span className="font-medium">{quiz.estimatedDuration} min</span>
            </div>
            {quiz.settings.timeLimit && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Time Limit:</span>
                <span className="font-medium">{quiz.settings.timeLimit} min</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Completed:</span>
              <span className="font-medium">
                {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {Object.keys(result.categoryBreakdown).length > 1 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Performance by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(result.categoryBreakdown).map(([category, data]) => (
                <div key={category}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{category}</span>
                    <span className={`font-bold ${getGradeColor(data.percentage)}`}>
                      {data.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={data.percentage} className="h-2" />
                  <div className="text-sm text-gray-500 mt-1">
                    {data.correct} / {data.total} questions correct
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {quiz.settings.showCorrectAnswers && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {quiz.questions.map((question, index) => {
                const answer = attempt.answers.find(a => a.questionId === question.id);
                const isCorrect = answer?.isCorrect || false;

                return (
                  <AccordionItem key={question.id} value={question.id}>
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-3 w-full">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium">Question {index + 1}</div>
                          <div className="text-sm text-gray-600 truncate">
                            {question.title}
                          </div>
                        </div>
                        <Badge variant={isCorrect ? 'default' : 'destructive'}>
                          {answer?.pointsEarned || 0} / {question.points} pts
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-4">
                        <div>
                          <h4 className="font-medium">{question.title}</h4>
                          <p className="text-gray-700 mt-1">{question.content}</p>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-sm text-gray-600 mb-1">Your Answer:</h5>
                            <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                              {getUserAnswerText(question, answer)}
                            </p>
                          </div>
                          <div>
                            <h5 className="font-medium text-sm text-gray-600 mb-1">Correct Answer:</h5>
                            <p className="text-sm text-green-700">
                              {getCorrectAnswerText(question)}
                            </p>
                          </div>
                        </div>

                        {quiz.settings.showExplanations && question.explanation && (
                          <div>
                            <h5 className="font-medium text-sm text-gray-600 mb-1">Explanation:</h5>
                            <p className="text-sm text-gray-700">{question.explanation}</p>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-4 justify-center">
        <Link href="/">
          <Button variant="outline">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        {canRetakeQuiz() && !attempt.passed && (
          <Button onClick={handleRetakeQuiz}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Retake Quiz
          </Button>
        )}

        <Button variant="outline">
          <Share2 className="mr-2 h-4 w-4" />
          Share Results
        </Button>

        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download Certificate
        </Button>
      </div>
    </div>
  );
}