'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Clock, ArrowLeft, ArrowRight, CheckCircle, Play } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ProtectedRoute } from '@/components/auth/protected-route';
import {
  Quiz,
  QuizAttempt,
  Question,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  DescriptiveQuestion,
  FillInBlankQuestion,
  QuestionMedia,
  QuestionAnswer,
} from '@/types/quiz';
import { Timestamp } from 'firebase/firestore';
import { quizService } from '@/lib/database/services/quiz.service';
import { useAuth } from '@/lib/auth/context';

function QuizTakingPageContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: string | boolean | string[] }>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (quizId) {
      loadQuiz();
    }
  }, [quizId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeRemaining && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev && prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev ? prev - 1 : 0;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeRemaining]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const quizResult = await quizService.getQuiz(quizId);

      if (!quizResult.success || !quizResult.data) {
        toast.error('Quiz not found', {
          description: 'The requested quiz could not be found.',
        });
        router.push('/');
        return;
      }

      const quizData = quizResult.data;
      setQuiz(quizData);

      if (quizData.estimatedTimeToComplete) {
        setTimeRemaining(quizData.estimatedTimeToComplete * 60);
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      toast.error('Failed to load quiz', {
        description: 'Please try refreshing the page or contact support.',
      });
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async () => {
    if (!quiz || !user) {
      toast.error('Authentication required', {
        description: 'Please sign in to take this quiz.',
      });
      return;
    }

    // Simply start the quiz - no database writes needed until submission
    setShowInstructions(false);
    setIsTimerActive(true);
    setQuizStartTime(Date.now()); // Record start time for accurate time tracking

    toast.success('Quiz started!', {
      description: 'Answer all questions and submit when ready.',
    });
  };

  const handleAnswerChange = (questionId: string, answer: string | boolean | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const gradeWithAI = async (question: Question, userAnswer: string | string[]) => {
    const fibQuestion = question.type === 'fill_in_blank' ? question as FillInBlankQuestion : null;
    const descQuestion = question.type === 'descriptive' ? question as DescriptiveQuestion : null;

    const response = await fetch('/api/ai/grade-answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        questionText: question.title,
        questionContent: question.content,
        userAnswer,
        correctAnswer: fibQuestion?.correctAnswers,
        sampleAnswer: descQuestion?.sampleAnswer,
        rubric: descQuestion?.rubric,
        maxPoints: question.points,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('AI grading API error:', errorData);
      throw new Error(`Failed to grade answer with AI: ${errorData.error || response.statusText}`);
    }

    const result = await response.json();
    return result;
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || !user) return;

    try {
      setSubmitting(true);

      // Calculate answers and score with AI grading for fill-in-blank and descriptive questions
      const quizAnswers: QuestionAnswer[] = await Promise.all(
        quiz.questions.map(async question => {
          const userAnswer = answers[question.id];

          // Use AI grading for fill-in-blank and descriptive questions
          if ((question.type === 'fill_in_blank' || question.type === 'descriptive') && userAnswer) {
            try {
              const gradingResult = await gradeWithAI(question, userAnswer);

              return {
                questionId: question.id,
                questionType: question.type,
                answer: userAnswer,
                isCorrect: gradingResult.isCorrect,
                pointsEarned: gradingResult.pointsEarned,
                timeSpent: 0,
              };
            } catch (error) {
              console.error('AI grading failed, falling back to simple check:', error);
              // Fallback to simple checking if AI fails
              const isCorrect = checkAnswer(question, userAnswer);
              return {
                questionId: question.id,
                questionType: question.type,
                answer: userAnswer,
                isCorrect,
                pointsEarned: isCorrect ? question.points : 0,
                timeSpent: 0,
              };
            }
          }

          // Use regular checking for MCQ and True/False
          const isCorrect = checkAnswer(question, userAnswer);
          return {
            questionId: question.id,
            questionType: question.type,
            answer: userAnswer,
            isCorrect,
            pointsEarned: isCorrect ? question.points : 0,
            timeSpent: 0,
          };
        })
      );

      const maxScore = quiz.questions.reduce((sum, q) => sum + q.points, 0);
      const totalScore = quizAnswers.reduce((sum, answer) => sum + (answer.pointsEarned || 0), 0);
      const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
      const passed = percentage >= quiz.settings.passingScore;

      // Calculate actual time spent in seconds
      const timeSpent = quizStartTime
        ? Math.floor((Date.now() - quizStartTime) / 1000)
        : 0;

      // Save completion record (not an "attempt", just a completion/submission)
      const submissionResult = await quizService.saveQuizCompletion({
        userId: user.id,
        quizId: quiz.id,
        skillId: quiz.skillId,
        sportId: quiz.sportId,
        answers: quizAnswers,
        score: totalScore,
        maxScore,
        percentage,
        passed,
        timeSpent,
      });

      if (!submissionResult.success || !submissionResult.data) {
        throw new Error(submissionResult.error?.message || 'Failed to submit quiz');
      }

      // Redirect to results page
      router.push(`/quiz/${quizId}/results/${submissionResult.data.id}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz', {
        description: 'Your answers may not have been saved. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const checkAnswer = (question: Question, userAnswer: string | boolean | string[]): boolean => {
    switch (question.type) {
      case 'multiple_choice':
        const mcQuestion = question as MultipleChoiceQuestion;
        const correctOptions = mcQuestion.options.filter(opt => opt.isCorrect).map(opt => opt.id);
        if (mcQuestion.allowMultipleAnswers) {
          return Array.isArray(userAnswer) &&
                 userAnswer.length === correctOptions.length &&
                 userAnswer.every(ans => correctOptions.includes(ans));
        } else {
          return correctOptions.includes(userAnswer);
        }

      case 'true_false':
        const tfQuestion = question as TrueFalseQuestion;
        return userAnswer === tfQuestion.correctAnswer;

      case 'fill_in_blank':
        const fibQuestion = question as FillInBlankQuestion;
        if (!Array.isArray(userAnswer)) return false;
        return fibQuestion.correctAnswers.every((correctAnswer, index) => {
          const answer = userAnswer[index];
          if (!answer) return false;
          const normalizedAnswer = fibQuestion.caseSensitive
            ? answer.trim()
            : answer.trim().toLowerCase();
          const normalizedCorrect = fibQuestion.caseSensitive
            ? correctAnswer.trim()
            : correctAnswer.trim().toLowerCase();
          return normalizedAnswer === normalizedCorrect;
        });

      case 'descriptive':
        return false;

      default:
        return false;
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderQuestionMedia = (media: QuestionMedia[]) => {
    if (!media || media.length === 0) return null;

    return (
      <div className="mb-4 space-y-3">
        {media.map((item) => (
          <div key={item.id} className="rounded-lg overflow-hidden">
            {item.type === 'image' ? (
              <img
                src={item.url}
                alt={item.alt}
                className="max-w-full h-auto max-h-64 object-contain"
              />
            ) : (
              <video
                src={item.url}
                controls
                className="max-w-full h-auto max-h-64"
                poster={item.thumbnail}
              >
                Your browser does not support video playback.
              </video>
            )}
            {item.caption && (
              <p className="text-sm text-gray-600 mt-1">{item.caption}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'multiple_choice':
        return renderMultipleChoice(question as MultipleChoiceQuestion);
      case 'true_false':
        return renderTrueFalse(question as TrueFalseQuestion);
      case 'descriptive':
        return renderDescriptive(question as DescriptiveQuestion);
      case 'fill_in_blank':
        return renderFillInBlank(question as FillInBlankQuestion);
      default:
        return null;
    }
  };

  const renderMultipleChoice = (question: MultipleChoiceQuestion) => {
    const answer = answers[question.id];

    if (question.allowMultipleAnswers) {
      return (
        <div className="space-y-3">
          {question.options.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox
                id={option.id}
                checked={Array.isArray(answer) && answer.includes(option.id)}
                onCheckedChange={(checked) => {
                  const currentAnswers = Array.isArray(answer) ? answer : [];
                  if (checked) {
                    handleAnswerChange(question.id, [...currentAnswers, option.id]);
                  } else {
                    handleAnswerChange(question.id, currentAnswers.filter(id => id !== option.id));
                  }
                }}
              />
              <Label htmlFor={option.id} className="flex-1">
                {option.text}
              </Label>
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <RadioGroup
          value={answer}
          onValueChange={(value) => handleAnswerChange(question.id, value)}
        >
          {question.options.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <RadioGroupItem value={option.id} id={option.id} />
              <Label htmlFor={option.id} className="flex-1">
                {option.text}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );
    }
  };

  const renderTrueFalse = (question: TrueFalseQuestion) => {
    const answer = answers[question.id];

    return (
      <RadioGroup
        value={answer?.toString()}
        onValueChange={(value) => handleAnswerChange(question.id, value === 'true')}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="true" id="true" />
          <Label htmlFor="true">True</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="false" id="false" />
          <Label htmlFor="false">False</Label>
        </div>
      </RadioGroup>
    );
  };

  const renderDescriptive = (question: DescriptiveQuestion) => {
    const answer = answers[question.id];

    return (
      <div className="space-y-2">
        <Textarea
          value={answer || ''}
          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          placeholder="Enter your answer here..."
          rows={6}
          className="resize-none"
        />
        {(question.minWords || question.maxWords) && (
          <div className="text-sm text-gray-500">
            {question.minWords && `Minimum ${question.minWords} words. `}
            {question.maxWords && `Maximum ${question.maxWords} words.`}
          </div>
        )}
      </div>
    );
  };

  const renderFillInBlank = (question: FillInBlankQuestion) => {
    const answer = answers[question.id] || [];

    return (
      <div className="space-y-4">
        <p className="text-gray-700 mb-4">{question.content}</p>
        {question.correctAnswers.map((_, index) => (
          <div key={index}>
            <Label>Answer {index + 1}</Label>
            <Input
              value={answer[index] || ''}
              onChange={(e) => {
                const newAnswers = [...answer];
                newAnswers[index] = e.target.value;
                handleAnswerChange(question.id, newAnswers);
              }}
              placeholder={`Enter answer ${index + 1}`}
            />
          </div>
        ))}
      </div>
    );
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Quiz not found</p>
      </div>
    );
  }

  // Show instructions until user clicks Start Quiz
  if (showInstructions) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{quiz.title}</CardTitle>
            {quiz.description && (
              <p className="text-gray-600">{quiz.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {quiz.instructions && (
              <div>
                <h3 className="font-semibold mb-2">Instructions</h3>
                <p className="text-gray-700 whitespace-pre-line">{quiz.instructions}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Questions:</span> {quiz.metadata.totalQuestions}
              </div>
              <div>
                <span className="font-medium">Total Points:</span> {quiz.metadata.totalPoints}
              </div>
              <div>
                <span className="font-medium">Duration:</span> {quiz.estimatedDuration} minutes
              </div>
              <div>
                <span className="font-medium">Passing Score:</span> {quiz.settings.passingScore}%
              </div>
              {quiz.settings.timeLimit && (
                <div>
                  <span className="font-medium">Time Limit:</span> {quiz.settings.timeLimit} minutes
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <Button onClick={startQuiz} size="lg">
                <Play className="mr-2 h-4 w-4" />
                Start Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            <p className="text-gray-600">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </p>
          </div>
          {timeRemaining !== null && (
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span className={`font-mono ${timeRemaining < 300 ? 'text-red-600' : ''}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>

        {quiz.settings.showProgressBar && (
          <Progress value={progress} className="h-2" />
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="flex-1">{currentQuestion.title}</CardTitle>
            <div className="flex gap-2 ml-4">
              <Badge variant="outline">{currentQuestion.type}</Badge>
              <Badge variant="secondary">{currentQuestion.points} pts</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-gray-700 whitespace-pre-line">{currentQuestion.title}</p>
            {currentQuestion.description && (
              <p className="text-gray-600 text-sm mt-2 whitespace-pre-line">{currentQuestion.description}</p>
            )}
          </div>

          {renderQuestionMedia(currentQuestion.media || [])}

          <div>
            {renderQuestion(currentQuestion)}
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0 || !quiz.settings.allowBacktrack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <Button onClick={handleSubmitQuiz} disabled={submitting}>
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Submit Quiz
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(quiz.questions.length - 1, prev + 1))}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function QuizTakingPage() {
  return (
    <ProtectedRoute>
      <QuizTakingPageContent />
    </ProtectedRoute>
  );
}