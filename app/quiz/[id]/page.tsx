'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Clock, ArrowLeft, ArrowRight, CheckCircle, Play } from 'lucide-react';
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
import {
  Quiz,
  QuizAttempt,
  Question,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  DescriptiveQuestion,
  FillInBlankQuestion,
  MatchingQuestion,
  QuestionMedia,
  QuestionAnswer,
} from '@/types/quiz';
import { firebaseService } from '@/lib/firebase/service';
import { useAuth } from '@/lib/auth/context';

export default function QuizTakingPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: any }>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

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
      const quizData = await firebaseService.getDocument('quizzes', quizId);
      if (!quizData) {
        alert('Quiz not found');
        router.push('/');
        return;
      }
      setQuiz(quizData as Quiz);

      if (quizData.settings?.timeLimit) {
        setTimeRemaining(quizData.settings.timeLimit * 60);
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      alert('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async () => {
    if (!quiz || !user) return;

    try {
      const attemptData: Omit<QuizAttempt, 'id'> = {
        quizId: quiz.id,
        userId: user.id,
        startedAt: new Date(),
        timeSpent: 0,
        score: 0,
        pointsEarned: 0,
        totalPoints: quiz.metadata.totalPoints,
        passingScore: quiz.settings.passingScore,
        passed: false,
        attemptNumber: 1,
        answers: [],
        status: 'in-progress',
      };

      const attemptId = await firebaseService.addDocument('quiz_attempts', attemptData);
      setAttempt({ id: attemptId, ...attemptData });
      setShowInstructions(false);
      setIsTimerActive(true);
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert('Failed to start quiz');
    }
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || !attempt || !user) return;

    try {
      setSubmitting(true);

      const quizAnswers: QuestionAnswer[] = quiz.questions.map(question => {
        const userAnswer = answers[question.id];
        const isCorrect = checkAnswer(question, userAnswer);

        return {
          questionId: question.id,
          questionType: question.type,
          answer: userAnswer,
          isCorrect,
          pointsEarned: isCorrect ? question.points : 0,
          timeSpent: 0,
          attempts: 1,
        };
      });

      const totalScore = quizAnswers.reduce((sum, answer) => sum + answer.pointsEarned, 0);
      const percentage = (totalScore / quiz.metadata.totalPoints) * 100;
      const passed = percentage >= quiz.settings.passingScore;

      const updatedAttempt: Partial<QuizAttempt> = {
        submittedAt: new Date(),
        score: percentage,
        pointsEarned: totalScore,
        passed,
        answers: quizAnswers,
        status: 'submitted',
        timeSpent: quiz.settings.timeLimit ? (quiz.settings.timeLimit * 60 - (timeRemaining || 0)) : 0,
      };

      await firebaseService.updateDocument('quiz_attempts', attempt.id, updatedAttempt);

      router.push(`/quiz/${quizId}/results/${attempt.id}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const checkAnswer = (question: Question, userAnswer: any): boolean => {
    switch (question.type) {
      case 'multiple-choice':
        const mcQuestion = question as MultipleChoiceQuestion;
        const correctOptions = mcQuestion.options.filter(opt => opt.isCorrect).map(opt => opt.id);
        if (mcQuestion.allowMultipleAnswers) {
          return Array.isArray(userAnswer) &&
                 userAnswer.length === correctOptions.length &&
                 userAnswer.every(ans => correctOptions.includes(ans));
        } else {
          return correctOptions.includes(userAnswer);
        }

      case 'true-false':
        const tfQuestion = question as TrueFalseQuestion;
        return userAnswer === tfQuestion.correctAnswer;

      case 'fill-in-blank':
        const fibQuestion = question as FillInBlankQuestion;
        if (!Array.isArray(userAnswer)) return false;
        return fibQuestion.blanks.every((blank, index) => {
          const answer = userAnswer[index]?.toLowerCase().trim();
          return blank.acceptedAnswers.some(accepted =>
            blank.caseSensitive
              ? (blank.exactMatch ? answer === accepted : answer.includes(accepted))
              : (blank.exactMatch ? answer === accepted.toLowerCase() : answer.includes(accepted.toLowerCase()))
          );
        });

      case 'descriptive':
        return false;

      case 'matching':
        const matchQuestion = question as MatchingQuestion;
        if (!userAnswer || typeof userAnswer !== 'object') return false;
        return matchQuestion.pairs.every(pair =>
          userAnswer[pair.left.text] === pair.right.text
        );

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
      case 'multiple-choice':
        return renderMultipleChoice(question as MultipleChoiceQuestion);
      case 'true-false':
        return renderTrueFalse(question as TrueFalseQuestion);
      case 'descriptive':
        return renderDescriptive(question as DescriptiveQuestion);
      case 'fill-in-blank':
        return renderFillInBlank(question as FillInBlankQuestion);
      case 'matching':
        return renderMatching(question as MatchingQuestion);
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
        <div
          className="prose"
          dangerouslySetInnerHTML={{
            __html: question.template.replace(/{blank}/g, (_, index) =>
              `<input type="text" class="border rounded px-2 py-1 mx-1" placeholder="Answer ${index + 1}" />`
            ),
          }}
        />
        {question.blanks.map((blank, index) => (
          <div key={blank.id}>
            <Label>Blank {index + 1}</Label>
            <Input
              value={answer[index] || ''}
              onChange={(e) => {
                const newAnswers = [...answer];
                newAnswers[index] = e.target.value;
                handleAnswerChange(question.id, newAnswers);
              }}
              placeholder={`Answer for blank ${index + 1}`}
            />
          </div>
        ))}
      </div>
    );
  };

  const renderMatching = (question: MatchingQuestion) => {
    const answer = answers[question.id] || {};

    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">Match items from the left column with items from the right column:</p>
        {question.pairs.map((pair) => (
          <div key={pair.id} className="grid grid-cols-2 gap-4 items-center">
            <div className="p-3 border rounded">
              {pair.left.text}
            </div>
            <select
              value={answer[pair.left.text] || ''}
              onChange={(e) =>
                handleAnswerChange(question.id, {
                  ...answer,
                  [pair.left.text]: e.target.value,
                })
              }
              className="p-2 border rounded"
            >
              <option value="">Select match...</option>
              {question.pairs.map((p) => (
                <option key={p.id} value={p.right.text}>
                  {p.right.text}
                </option>
              ))}
            </select>
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
              <div>
                <span className="font-medium">Attempts Allowed:</span> {quiz.settings.maxAttempts}
              </div>
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