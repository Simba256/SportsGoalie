'use client';

import React from 'react';
import { FormField, FieldResponse } from '@/types';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { DynamicFieldProps } from './DynamicField';

export const DynamicRadioField: React.FC<DynamicFieldProps> = ({
  field,
  value,
  onChange,
  error,
  disabled,
  className = '',
}) => {
  const selectedValue = value?.value as string | undefined;
  const comments = value?.comments || '';

  const handleValueChange = (newValue: string) => {
    onChange({
      value: newValue,
      comments: comments,
    });
  };

  const handleCommentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      value: selectedValue || '',
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

      {/* Radio options */}
      <RadioGroup
        value={selectedValue}
        onValueChange={handleValueChange}
        disabled={disabled}
        className="space-y-2"
      >
        {field.options?.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <RadioGroupItem value={option} id={`${field.id}-${option}`} />
            <Label
              htmlFor={`${field.id}-${option}`}
              className="text-sm font-normal capitalize cursor-pointer"
            >
              {option.replace(/_/g, ' ')}
            </Label>
          </div>
        ))}
      </RadioGroup>

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
