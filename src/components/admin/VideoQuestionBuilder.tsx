'use client';

import React, { useState } from 'react';
import { VideoQuizQuestion, QuestionType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Trash2,
  Edit,
  Clock,
  PlayCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner';

interface VideoQuestionBuilderProps {
  questions: VideoQuizQuestion[];
  videoDuration: number;
  onChange: (questions: VideoQuizQuestion[]) => void;
}

interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  allowMultiple?: boolean;
}

export function VideoQuestionBuilder({
  questions,
  videoDuration,
  onChange,
}: VideoQuestionBuilderProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [newQuestion, setNewQuestion] = useState<Partial<VideoQuizQuestion>>({
    type: 'multiple_choice',
    timestamp: 0,
    points: 10,
    required: true,
  });

  const toggleQuestionExpanded = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  const formatTimestamp = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddQuestion = () => {
    if (!newQuestion.question || newQuestion.question.trim() === '') {
      toast.error('Question text is required');
      return;
    }

    if (newQuestion.timestamp === undefined || newQuestion.timestamp < 0) {
      toast.error('Valid timestamp is required');
      return;
    }

    if (newQuestion.timestamp! > videoDuration) {
      toast.error('Timestamp cannot exceed video duration');
      return;
    }

    // Check if timestamp conflicts with existing question
    const conflictingQuestion = questions.find(
      (q) => Math.abs(q.timestamp - newQuestion.timestamp!) < 5
    );
    if (conflictingQuestion) {
      toast.error('Questions must be at least 5 seconds apart');
      return;
    }

    // Validate question based on type
    if (newQuestion.type === 'multiple_choice') {
      if (!newQuestion.options || newQuestion.options.length < 2) {
        toast.error('Multiple choice questions need at least 2 options');
        return;
      }
      if (!newQuestion.options.some((opt: any) => opt.isCorrect)) {
        toast.error('At least one option must be marked as correct');
        return;
      }
    } else if (newQuestion.type === 'true_false') {
      if (newQuestion.correctAnswer === undefined) {
        toast.error('Correct answer is required for true/false questions');
        return;
      }
    } else if (newQuestion.type === 'fill_in_blank') {
      if (!newQuestion.correctAnswers || newQuestion.correctAnswers.length === 0) {
        toast.error('At least one correct answer is required');
        return;
      }
    }

    const questionToAdd: VideoQuizQuestion = {
      id: `q_${Date.now()}`,
      type: newQuestion.type as QuestionType,
      question: newQuestion.question,
      timestamp: newQuestion.timestamp!,
      points: newQuestion.points || 10,
      required: newQuestion.required !== false,
      explanation: newQuestion.explanation,
      options: newQuestion.options,
      correctAnswer: newQuestion.correctAnswer,
      correctAnswers: newQuestion.correctAnswers,
      caseSensitive: newQuestion.caseSensitive,
    };

    const updatedQuestions = [...questions, questionToAdd].sort(
      (a, b) => a.timestamp - b.timestamp
    );
    onChange(updatedQuestions);

    // Reset form
    setNewQuestion({
      type: 'multiple_choice',
      timestamp: 0,
      points: 10,
      required: true,
    });

    toast.success('Question added successfully');
  };

  const handleDeleteQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    onChange(updatedQuestions);
    toast.success('Question deleted');
  };

  const handleUpdateQuestion = (index: number, updates: Partial<VideoQuizQuestion>) => {
    const updatedQuestions = questions.map((q, i) =>
      i === index ? { ...q, ...updates } : q
    );
    onChange(updatedQuestions);
  };

  const renderQuestionTypeFields = () => {
    switch (newQuestion.type) {
      case 'multiple_choice':
        return (
          <div className="space-y-4">
            <div>
              <Label>Options</Label>
              <div className="space-y-2 mt-2">
                {(newQuestion.options || []).map((option: any, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={option.text}
                      onChange={(e) => {
                        const newOptions = [...(newQuestion.options || [])];
                        newOptions[index] = { ...option, text: e.target.value };
                        setNewQuestion({ ...newQuestion, options: newOptions });
                      }}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1"
                    />
                    <Switch
                      checked={option.isCorrect}
                      onCheckedChange={(checked) => {
                        const newOptions = [...(newQuestion.options || [])];
                        newOptions[index] = { ...option, isCorrect: checked };
                        setNewQuestion({ ...newQuestion, options: newOptions });
                      }}
                    />
                    <Label className="text-sm">Correct</Label>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newOptions = (newQuestion.options || []).filter(
                          (_: any, i: number) => i !== index
                        );
                        setNewQuestion({ ...newQuestion, options: newOptions });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newOptions = [
                      ...(newQuestion.options || []),
                      { id: `opt_${Date.now()}`, text: '', isCorrect: false },
                    ];
                    setNewQuestion({ ...newQuestion, options: newOptions });
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Option
                </Button>
              </div>
            </div>
          </div>
        );

      case 'true_false':
        return (
          <div>
            <Label>Correct Answer</Label>
            <Select
              value={String(newQuestion.correctAnswer)}
              onValueChange={(value) =>
                setNewQuestion({ ...newQuestion, correctAnswer: value === 'true' })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select correct answer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'fill_in_blank':
        return (
          <div className="space-y-4">
            <div>
              <Label>Correct Answers (one per line)</Label>
              <Textarea
                value={(newQuestion.correctAnswers || []).join('\n')}
                onChange={(e) =>
                  setNewQuestion({
                    ...newQuestion,
                    correctAnswers: e.target.value.split('\n').filter((a) => a.trim()),
                  })
                }
                placeholder="Enter correct answers"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={newQuestion.caseSensitive}
                onCheckedChange={(checked) =>
                  setNewQuestion({ ...newQuestion, caseSensitive: checked })
                }
              />
              <Label>Case Sensitive</Label>
            </div>
          </div>
        );

      case 'descriptive':
        return (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              Descriptive questions will require manual grading or AI evaluation.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Question List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Questions ({questions.length})</CardTitle>
            <div className="text-sm text-gray-500">
              Video: {formatTimestamp(videoDuration)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="mx-auto h-12 w-12 mb-4 text-gray-400" />
              <p>No questions added yet</p>
              <p className="text-sm mt-1">Add your first question below</p>
            </div>
          ) : (
            <div className="space-y-2">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center gap-2 text-sm font-medium text-primary">
                        <PlayCircle className="h-4 w-4" />
                        {formatTimestamp(question.timestamp)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{question.question}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                              {question.type.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-gray-600">
                              {question.points} points
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleQuestionExpanded(index)}
                          >
                            {expandedQuestions.has(index) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteQuestion(index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      {expandedQuestions.has(index) && (
                        <div className="mt-4 p-4 bg-gray-50 rounded space-y-2">
                          {question.explanation && (
                            <div>
                              <span className="text-xs font-medium text-gray-700">
                                Explanation:
                              </span>
                              <p className="text-sm text-gray-600 mt-1">
                                {question.explanation}
                              </p>
                            </div>
                          )}
                          {question.type === 'multiple_choice' && question.options && (
                            <div>
                              <span className="text-xs font-medium text-gray-700">
                                Options:
                              </span>
                              <ul className="text-sm text-gray-600 mt-1 space-y-1">
                                {question.options.map((opt) => (
                                  <li key={opt.id} className="flex items-center gap-2">
                                    {opt.isCorrect && (
                                      <span className="text-green-600 font-bold">✓</span>
                                    )}
                                    {opt.text}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Question Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Question</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="questionType">Question Type</Label>
              <Select
                value={newQuestion.type}
                onValueChange={(value) =>
                  setNewQuestion({ ...newQuestion, type: value as QuestionType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="true_false">True/False</SelectItem>
                  <SelectItem value="fill_in_blank">Fill in the Blank</SelectItem>
                  <SelectItem value="descriptive">Descriptive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="timestamp">
                Timestamp (seconds) - Max: {videoDuration}s
              </Label>
              <Input
                id="timestamp"
                type="number"
                min="0"
                max={videoDuration}
                value={newQuestion.timestamp}
                onChange={(e) =>
                  setNewQuestion({
                    ...newQuestion,
                    timestamp: parseInt(e.target.value),
                  })
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                {formatTimestamp(newQuestion.timestamp || 0)}
              </p>
            </div>

            <div>
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                min="1"
                value={newQuestion.points}
                onChange={(e) =>
                  setNewQuestion({
                    ...newQuestion,
                    points: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="questionText">Question Text *</Label>
            <Textarea
              id="questionText"
              value={newQuestion.question || ''}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, question: e.target.value })
              }
              placeholder="Enter your question"
              rows={2}
            />
          </div>

          {renderQuestionTypeFields()}

          <div>
            <Label htmlFor="explanation">Explanation (optional)</Label>
            <Textarea
              id="explanation"
              value={newQuestion.explanation || ''}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, explanation: e.target.value })
              }
              placeholder="Provide an explanation for the answer"
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={newQuestion.required !== false}
              onCheckedChange={(checked) =>
                setNewQuestion({ ...newQuestion, required: checked })
              }
            />
            <Label>Required Question</Label>
          </div>

          <Button onClick={handleAddQuestion} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
