'use client';

import React from 'react';
import { FormField, FieldResponse } from '@/types';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { DynamicFieldProps } from './DynamicField';

export const DynamicScaleField: React.FC<DynamicFieldProps> = ({
  field,
  value,
  onChange,
  error,
  disabled,
  className = '',
}) => {
  const scaleValue = (value?.value as number) || field.validation?.min || 1;
  const comments = value?.comments || '';

  const min = field.validation?.min || 1;
  const max = field.validation?.max || 10;

  const handleValueChange = (values: number[]) => {
    onChange({
      value: values[0],
      comments: comments,
    });
  };

  const handleCommentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      value: scaleValue,
      comments: e.target.value,
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Label and description */}
      <div className="space-y-1">
        <Label htmlFor={field.id} className="text-sm font-medium">
          {field.label}
          {field.validation?.required && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </Label>
        {field.description && (
          <p className="text-sm text-muted-foreground">{field.description}</p>
        )}
      </div>

      {/* Scale display */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">{min}</span>
          <span className="text-2xl font-bold">{scaleValue}</span>
          <span className="text-sm text-muted-foreground">{max}</span>
        </div>

        {/* Slider */}
        <Slider
          id={field.id}
          value={[scaleValue]}
          onValueChange={handleValueChange}
          disabled={disabled}
          min={min}
          max={max}
          step={1}
          className="w-full"
        />

        {/* Scale markers */}
        <div className="flex justify-between text-xs text-muted-foreground">
          {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((num) => (
            <span key={num} className={num === scaleValue ? 'font-bold' : ''}>
              {num}
            </span>
          ))}
        </div>
      </div>

      {/* Comments textarea (if enabled) */}
      {field.includeComments && (
        <div className="space-y-2">
          <Label htmlFor={`${field.id}-comments`} className="text-sm">
            {field.commentsLabel || 'Comments'}
            {field.commentsRequired && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </Label>
          <Textarea
            id={`${field.id}-comments`}
            value={comments}
            onChange={handleCommentsChange}
            disabled={disabled}
            placeholder={field.placeholder || 'Add any additional notes...'}
            className="min-h-[80px] resize-none"
            maxLength={field.validation?.maxLength}
          />
        </div>
      )}

      {/* Error message */}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};
