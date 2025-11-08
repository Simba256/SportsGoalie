'use client';

import React from 'react';
import { FormField, FieldResponse } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DynamicFieldProps } from './DynamicField';

export const DynamicCheckboxField: React.FC<DynamicFieldProps> = ({
  field,
  value,
  onChange,
  error,
  disabled,
  className = '',
}) => {
  const selectedValues = (value?.value as string[]) || [];
  const comments = value?.comments || '';

  const handleCheckboxChange = (option: string, checked: boolean) => {
    let newValues: string[];

    if (checked) {
      newValues = [...selectedValues, option];
    } else {
      newValues = selectedValues.filter((v) => v !== option);
    }

    onChange({
      value: newValues,
      comments: comments,
    });
  };

  const handleCommentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      value: selectedValues,
      comments: e.target.value,
    });
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label and description */}
      <div className="space-y-1">
        <Label className="text-sm font-medium">
          {field.label}
          {field.validation?.required && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </Label>
        {field.description && (
          <p className="text-sm text-muted-foreground">{field.description}</p>
        )}
      </div>

      {/* Checkbox options */}
      <div className="space-y-2">
        {field.options?.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <Checkbox
              id={`${field.id}-${option}`}
              checked={selectedValues.includes(option)}
              onCheckedChange={(checked) =>
                handleCheckboxChange(option, checked as boolean)
              }
              disabled={disabled}
            />
            <Label
              htmlFor={`${field.id}-${option}`}
              className="text-sm font-normal capitalize cursor-pointer"
            >
              {option.replace(/_/g, ' ')}
            </Label>
          </div>
        ))}
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
