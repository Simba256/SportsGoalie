'use client';

import React from 'react';
import { FormField, FieldResponse } from '@/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DynamicFieldProps } from './DynamicField';

export const DynamicNumericField: React.FC<DynamicFieldProps> = ({
  field,
  value,
  onChange,
  error,
  disabled,
  className = '',
}) => {
  const numericValue = value?.value as number | undefined;
  const comments = value?.comments || '';

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === '' ? undefined : Number(e.target.value);

    onChange({
      value: newValue as number,
      comments: comments,
    });
  };

  const handleCommentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      value: numericValue || 0,
      comments: e.target.value,
    });
  };

  return (
    <div className={`space-y-3 ${className}`}>
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

      {/* Numeric input */}
      <Input
        id={field.id}
        type="number"
        value={numericValue ?? ''}
        onChange={handleValueChange}
        disabled={disabled}
        placeholder={field.placeholder}
        min={field.validation?.min}
        max={field.validation?.max}
        className="max-w-xs"
      />

      {/* Min/max hint */}
      {(field.validation?.min !== undefined || field.validation?.max !== undefined) && (
        <p className="text-xs text-muted-foreground">
          {field.validation.min !== undefined && field.validation.max !== undefined
            ? `Range: ${field.validation.min} - ${field.validation.max}`
            : field.validation.min !== undefined
            ? `Minimum: ${field.validation.min}`
            : `Maximum: ${field.validation.max}`}
        </p>
      )}

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
