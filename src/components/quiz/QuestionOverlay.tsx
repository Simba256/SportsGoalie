'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionOverlayProps } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';

export const QuestionOverlay: React.FC<QuestionOverlayProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onSkip,
  showSkip = false,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[]>('');
  const [fillInAnswers, setFillInAnswers] = useState<string[]>([]);

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswer('');
    setFillInAnswers([]);
  }, [question.id]);

  // Handle answer submission
  const handleSubmit = () => {
    if (question.type === 'fill_in_blank') {
      onAnswer(fillInAnswers);
    } else {
      onAnswer(selectedAnswer);
    }
  };

  // Check if answer is selected/filled
  const isAnswerReady = (): boolean => {
    switch (question.type) {
      case 'multiple_choice':
        if (question.options && question.options.some(opt => opt.allowMultiple)) {
          return Array.isArray(selectedAnswer) && selectedAnswer.length > 0;
        }
        return typeof selectedAnswer === 'string' && selectedAnswer.length > 0;

      case 'true_false':
        return selectedAnswer === 'true' || selectedAnswer === 'false';

      case 'fill_in_blank':
        return fillInAnswers.length > 0 && fillInAnswers.every(a => a.trim().length > 0);

      case 'descriptive':
        return typeof selectedAnswer === 'string' && selectedAnswer.trim().length > 0;

      default:
        return false;
    }
  };

  // Render question based on type
  const renderQuestionContent = () => {
    switch (question.type) {
      case 'multiple_choice':
        return renderMultipleChoice();

      case 'true_false':
        return renderTrueFalse();

      case 'fill_in_blank':
        return renderFillInBlank();

      case 'descriptive':
        return renderDescriptive();

      default:
        return <p className="text-gray-500">Unsupported question type</p>;
    }
  };

  const renderMultipleChoice = () => {
    if (!question.options || question.options.length === 0) {
      return <p className="text-gray-500">No options available</p>;
    }

    const allowMultiple = question.options.some(opt => opt.allowMultiple);

    if (allowMultiple) {
      return (
        <div className="space-y-3">
          {question.options.map((option) => (
            <div
              key={option.id}
              className="flex items-center space-x-3 p-4 rounded-lg border-2 hover:border-primary/50 transition-all cursor-pointer"
              onClick={() => {
                const current = Array.isArray(selectedAnswer) ? selectedAnswer : [];
                if (current.includes(option.id)) {
                  setSelectedAnswer(current.filter(id => id !== option.id));
                } else {
                  setSelectedAnswer([...current, option.id]);
                }
              }}
            >
              <Checkbox
                checked={Array.isArray(selectedAnswer) && selectedAnswer.includes(option.id)}
                onCheckedChange={(checked) => {
                  const current = Array.isArray(selectedAnswer) ? selectedAnswer : [];
                  if (checked) {
                    setSelectedAnswer([...current, option.id]);
                  } else {
                    setSelectedAnswer(current.filter(id => id !== option.id));
                  }
                }}
              />
              <Label className="flex-1 cursor-pointer text-base">
                {option.text}
              </Label>
            </div>
          ))}
        </div>
      );
    }

    return (
      <RadioGroup
        value={selectedAnswer as string}
        onValueChange={(value) => setSelectedAnswer(value)}
        className="space-y-3"
      >
        {question.options.map((option) => (
          <div
            key={option.id}
            className="flex items-center space-x-3 p-4 rounded-lg border-2 hover:border-primary/50 transition-all cursor-pointer"
            onClick={() => setSelectedAnswer(option.id)}
          >
            <RadioGroupItem value={option.id} id={option.id} />
            <Label htmlFor={option.id} className="flex-1 cursor-pointer text-base">
              {option.text}
            </Label>
          </div>
        ))}
      </RadioGroup>
    );
  };

  const renderTrueFalse = () => {
    return (
      <RadioGroup
        value={selectedAnswer as string}
        onValueChange={(value) => setSelectedAnswer(value)}
        className="space-y-3"
      >
        <div
          className="flex items-center space-x-3 p-4 rounded-lg border-2 hover:border-primary/50 transition-all cursor-pointer"
          onClick={() => setSelectedAnswer('true')}
        >
          <RadioGroupItem value="true" id="true" />
          <Label htmlFor="true" className="flex-1 cursor-pointer text-base flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            True
          </Label>
        </div>
        <div
          className="flex items-center space-x-3 p-4 rounded-lg border-2 hover:border-primary/50 transition-all cursor-pointer"
          onClick={() => setSelectedAnswer('false')}
        >
          <RadioGroupItem value="false" id="false" />
          <Label htmlFor="false" className="flex-1 cursor-pointer text-base flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            False
          </Label>
        </div>
      </RadioGroup>
    );
  };

  const renderFillInBlank = () => {
    const blanksCount = question.correctAnswers?.length || 1;

    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Fill in the blank(s) below:
        </p>
        {Array.from({ length: blanksCount }).map((_, index) => (
          <div key={index}>
            <Label htmlFor={`blank-${index}`} className="mb-2 block">
              Blank {index + 1}:
            </Label>
            <input
              id={`blank-${index}`}
              type="text"
              value={fillInAnswers[index] || ''}
              onChange={(e) => {
                const newAnswers = [...fillInAnswers];
                newAnswers[index] = e.target.value;
                setFillInAnswers(newAnswers);
              }}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-colors text-base"
              placeholder="Type your answer..."
              autoFocus={index === 0}
            />
          </div>
        ))}
      </div>
    );
  };

  const renderDescriptive = () => {
    const maxWords = question.maxWords || 200;
    const minWords = question.minWords || 10;

    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="descriptive-answer" className="mb-2 block">
            Your Answer:
          </Label>
          <textarea
            id="descriptive-answer"
            value={selectedAnswer as string}
            onChange={(e) => setSelectedAnswer(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-colors text-base min-h-[120px] resize-y"
            placeholder="Type your answer here..."
            maxLength={maxWords * 10} // rough character limit
            autoFocus
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            Min: {minWords} words • Max: {maxWords} words
          </span>
          <span>
            {(selectedAnswer as string).split(/\s+/).filter(w => w.length > 0).length} words
          </span>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="w-full max-w-2xl"
        >
          <Card className="shadow-2xl">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="text-xs">
                  Question {questionNumber} of {totalQuestions}
                </Badge>
                {question.points && (
                  <Badge variant="outline" className="text-xs">
                    {question.points} {question.points === 1 ? 'point' : 'points'}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xl leading-tight">
                {question.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Question Content */}
              {question.content && (
                <p className="text-gray-700 leading-relaxed">{question.content}</p>
              )}

              {/* Question Answer Options */}
              {renderQuestionContent()}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={!isAnswerReady()}
                  className="flex-1"
                  size="lg"
                >
                  Continue
                </Button>
                {showSkip && onSkip && (
                  <Button
                    onClick={onSkip}
                    variant="outline"
                    size="lg"
                  >
                    Skip
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
