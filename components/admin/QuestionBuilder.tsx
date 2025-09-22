'use client';

import React, { useState } from 'react';
import { Plus, Edit, Trash2, Upload, X, Play, Image as ImageIcon } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Question,
  QuestionType,
  QuestionMedia,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  DescriptiveQuestion,
  FillInBlankQuestion,
  MatchingQuestion,
  MultipleChoiceOption,
  MatchingPair,
} from '@/types/quiz';
import { DifficultyLevel } from '@/types';
import { storageService } from '@/lib/firebase/storage.service';

interface QuestionBuilderProps {
  questions: Question[];
  onAddQuestion: (question: Question) => void;
  onUpdateQuestion: (index: number, question: Question) => void;
  onDeleteQuestion: (index: number) => void;
}

export const QuestionBuilder: React.FC<QuestionBuilderProps> = ({
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
    type: 'multiple-choice',
    title: '',
    content: '',
    points: 1,
    difficulty: 'medium',
    order: questions.length,
    isRequired: true,
    tags: [],
  });

  const resetForm = () => {
    setCurrentQuestion({
      type: 'multiple-choice',
      title: '',
      content: '',
      points: 1,
      difficulty: 'medium',
      order: questions.length,
      isRequired: true,
      tags: [],
    });
    setEditingIndex(null);
  };

  const handleOpenDialog = (index?: number) => {
    if (index !== undefined) {
      setEditingIndex(index);
      setCurrentQuestion({ ...questions[index] });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setTimeout(resetForm, 300);
  };

  const handleMediaUpload = async (file: File, targetPath: string) => {
    try {
      const url = await storageService.uploadFile(file, 'SKILL_MEDIA');
      const media: QuestionMedia = {
        id: Date.now().toString(),
        type: file.type.startsWith('video/') ? 'video' : 'image',
        url,
        alt: file.name,
        order: 0,
      };

      if (targetPath === 'question') {
        setCurrentQuestion(prev => ({
          ...prev,
          media: [...(prev.media || []), media],
        }));
      }

      return media;
    } catch (error) {
      console.error('Error uploading media:', error);
      alert('Failed to upload media');
      return null;
    }
  };

  const handleRemoveMedia = (mediaId: string, targetPath: string) => {
    if (targetPath === 'question') {
      setCurrentQuestion(prev => ({
        ...prev,
        media: prev.media?.filter(m => m.id !== mediaId) || [],
      }));
    }
  };

  const renderMediaPreview = (media: QuestionMedia) => (
    <div key={media.id} className="relative inline-block mr-2 mb-2">
      {media.type === 'image' ? (
        <img
          src={media.url}
          alt={media.alt}
          className="w-20 h-20 object-cover rounded border"
        />
      ) : (
        <div className="w-20 h-20 bg-gray-200 rounded border flex items-center justify-center">
          <Play size={24} className="text-gray-500" />
        </div>
      )}
      <button
        onClick={() => handleRemoveMedia(media.id, 'question')}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
      >
        <X size={12} />
      </button>
    </div>
  );

  const renderMultipleChoiceEditor = () => {
    const mcQuestion = currentQuestion as Partial<MultipleChoiceQuestion>;
    const options = mcQuestion.options || [];

    const addOption = () => {
      const newOption: MultipleChoiceOption = {
        id: Date.now().toString(),
        text: '',
        isCorrect: false,
        explanation: '',
      };
      setCurrentQuestion(prev => ({
        ...prev,
        options: [...options, newOption],
      }));
    };

    const updateOption = (index: number, field: string, value: any) => {
      const updatedOptions = options.map((opt, i) =>
        i === index ? { ...opt, [field]: value } : opt
      );
      setCurrentQuestion(prev => ({
        ...prev,
        options: updatedOptions,
      }));
    };

    const removeOption = (index: number) => {
      setCurrentQuestion(prev => ({
        ...prev,
        options: options.filter((_, i) => i !== index),
      }));
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={mcQuestion.allowMultipleAnswers || false}
            onCheckedChange={(checked) =>
              setCurrentQuestion(prev => ({ ...prev, allowMultipleAnswers: checked }))
            }
          />
          <Label>Allow Multiple Answers</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={mcQuestion.shuffleOptions || false}
            onCheckedChange={(checked) =>
              setCurrentQuestion(prev => ({ ...prev, shuffleOptions: checked }))
            }
          />
          <Label>Shuffle Options</Label>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label>Options</Label>
            <Button onClick={addOption} size="sm">
              <Plus size={16} className="mr-1" />
              Add Option
            </Button>
          </div>

          {options.map((option, index) => (
            <Card key={option.id} className="p-3">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={option.isCorrect}
                    onCheckedChange={(checked) => updateOption(index, 'isCorrect', checked)}
                  />
                  <Label className="text-sm">Correct Answer</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                    className="ml-auto text-red-600"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
                <Input
                  placeholder="Option text"
                  value={option.text}
                  onChange={(e) => updateOption(index, 'text', e.target.value)}
                />
                <Input
                  placeholder="Explanation (optional)"
                  value={option.explanation || ''}
                  onChange={(e) => updateOption(index, 'explanation', e.target.value)}
                />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderTrueFalseEditor = () => {
    const tfQuestion = currentQuestion as Partial<TrueFalseQuestion>;

    return (
      <div className="space-y-4">
        <div>
          <Label>Correct Answer</Label>
          <Select
            value={tfQuestion.correctAnswer?.toString()}
            onValueChange={(value) =>
              setCurrentQuestion(prev => ({ ...prev, correctAnswer: value === 'true' }))
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

        <div>
          <Label>Explanation for True</Label>
          <Input
            placeholder="Explanation when answer is true"
            value={tfQuestion.trueExplanation || ''}
            onChange={(e) =>
              setCurrentQuestion(prev => ({ ...prev, trueExplanation: e.target.value }))
            }
          />
        </div>

        <div>
          <Label>Explanation for False</Label>
          <Input
            placeholder="Explanation when answer is false"
            value={tfQuestion.falseExplanation || ''}
            onChange={(e) =>
              setCurrentQuestion(prev => ({ ...prev, falseExplanation: e.target.value }))
            }
          />
        </div>
      </div>
    );
  };

  const renderDescriptiveEditor = () => {
    const descQuestion = currentQuestion as Partial<DescriptiveQuestion>;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Minimum Words</Label>
            <Input
              type="number"
              min="0"
              value={descQuestion.minWords || ''}
              onChange={(e) =>
                setCurrentQuestion(prev => ({ ...prev, minWords: parseInt(e.target.value) || undefined }))
              }
            />
          </div>
          <div>
            <Label>Maximum Words</Label>
            <Input
              type="number"
              min="0"
              value={descQuestion.maxWords || ''}
              onChange={(e) =>
                setCurrentQuestion(prev => ({ ...prev, maxWords: parseInt(e.target.value) || undefined }))
              }
            />
          </div>
        </div>

        <div>
          <Label>Sample Answer</Label>
          <Textarea
            placeholder="Provide a sample answer for reference"
            value={descQuestion.sampleAnswer || ''}
            onChange={(e) =>
              setCurrentQuestion(prev => ({ ...prev, sampleAnswer: e.target.value }))
            }
            rows={3}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={descQuestion.autoGrade || false}
            onCheckedChange={(checked) =>
              setCurrentQuestion(prev => ({ ...prev, autoGrade: checked }))
            }
          />
          <Label>Enable Auto-grading</Label>
        </div>
      </div>
    );
  };

  const handleSaveQuestion = () => {
    if (!currentQuestion.title?.trim() || !currentQuestion.content?.trim()) {
      alert('Please fill in the title and content');
      return;
    }

    const questionData: Question = {
      id: editingIndex !== null ? questions[editingIndex].id : Date.now().toString(),
      type: currentQuestion.type!,
      title: currentQuestion.title!,
      content: currentQuestion.content!,
      media: currentQuestion.media || [],
      points: currentQuestion.points!,
      difficulty: currentQuestion.difficulty!,
      explanation: currentQuestion.explanation,
      timeLimit: currentQuestion.timeLimit,
      order: currentQuestion.order!,
      tags: currentQuestion.tags || [],
      isRequired: currentQuestion.isRequired!,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin',
      ...currentQuestion,
    } as Question;

    if (editingIndex !== null) {
      onUpdateQuestion(editingIndex, questionData);
    } else {
      onAddQuestion(questionData);
    }

    handleCloseDialog();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Questions ({questions.length})</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus size={16} className="mr-2" />
                  Add Question
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingIndex !== null ? 'Edit Question' : 'Add New Question'}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Question Type</Label>
                      <Select
                        value={currentQuestion.type}
                        onValueChange={(value: QuestionType) =>
                          setCurrentQuestion(prev => ({ ...prev, type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                          <SelectItem value="true-false">True/False</SelectItem>
                          <SelectItem value="descriptive">Descriptive</SelectItem>
                          <SelectItem value="fill-in-blank">Fill in the Blank</SelectItem>
                          <SelectItem value="matching">Matching</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Difficulty</Label>
                      <Select
                        value={currentQuestion.difficulty}
                        onValueChange={(value: DifficultyLevel) =>
                          setCurrentQuestion(prev => ({ ...prev, difficulty: value }))
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

                  <div>
                    <Label>Question Title</Label>
                    <Input
                      value={currentQuestion.title}
                      onChange={(e) =>
                        setCurrentQuestion(prev => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="Enter question title"
                    />
                  </div>

                  <div>
                    <Label>Question Content</Label>
                    <Textarea
                      value={currentQuestion.content}
                      onChange={(e) =>
                        setCurrentQuestion(prev => ({ ...prev, content: e.target.value }))
                      }
                      placeholder="Enter the question text"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Media Attachments</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleMediaUpload(file, 'question');
                          }
                        }}
                        className="hidden"
                        id="media-upload"
                      />
                      <label htmlFor="media-upload">
                        <Button variant="outline" className="cursor-pointer" asChild>
                          <span>
                            <Upload size={16} className="mr-2" />
                            Upload Image/Video
                          </span>
                        </Button>
                      </label>
                    </div>
                    {currentQuestion.media && currentQuestion.media.length > 0 && (
                      <div className="mt-3">
                        {currentQuestion.media.map(renderMediaPreview)}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Points</Label>
                      <Input
                        type="number"
                        min="1"
                        value={currentQuestion.points}
                        onChange={(e) =>
                          setCurrentQuestion(prev => ({ ...prev, points: parseInt(e.target.value) }))
                        }
                      />
                    </div>

                    <div>
                      <Label>Time Limit (seconds)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={currentQuestion.timeLimit || ''}
                        onChange={(e) =>
                          setCurrentQuestion(prev => ({
                            ...prev,
                            timeLimit: e.target.value ? parseInt(e.target.value) : undefined,
                          }))
                        }
                        placeholder="No limit"
                      />
                    </div>

                    <div className="flex items-center space-x-2 mt-6">
                      <Switch
                        checked={currentQuestion.isRequired}
                        onCheckedChange={(checked) =>
                          setCurrentQuestion(prev => ({ ...prev, isRequired: checked }))
                        }
                      />
                      <Label>Required</Label>
                    </div>
                  </div>

                  <div>
                    <Label>Explanation (Optional)</Label>
                    <Textarea
                      value={currentQuestion.explanation || ''}
                      onChange={(e) =>
                        setCurrentQuestion(prev => ({ ...prev, explanation: e.target.value }))
                      }
                      placeholder="Explanation shown after answering"
                      rows={2}
                    />
                  </div>

                  {currentQuestion.type === 'multiple-choice' && renderMultipleChoiceEditor()}
                  {currentQuestion.type === 'true-false' && renderTrueFalseEditor()}
                  {currentQuestion.type === 'descriptive' && renderDescriptiveEditor()}

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={handleCloseDialog}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveQuestion}>
                      {editingIndex !== null ? 'Update' : 'Add'} Question
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No questions added yet. Click "Add Question" to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <Card key={question.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{question.type}</Badge>
                        <Badge variant={question.difficulty === 'easy' ? 'default' :
                                      question.difficulty === 'medium' ? 'secondary' : 'destructive'}>
                          {question.difficulty}
                        </Badge>
                        <span className="text-sm text-gray-500">{question.points} pts</span>
                      </div>
                      <h4 className="font-medium">{question.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{question.content}</p>
                      {question.media && question.media.length > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                          <ImageIcon size={12} />
                          <span>{question.media.length} media file(s)</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(index)}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteQuestion(index)}
                        className="text-red-600"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};