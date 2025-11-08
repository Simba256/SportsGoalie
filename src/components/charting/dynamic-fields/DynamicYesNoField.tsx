'use client';

import React from 'react';
import { FormField, FieldResponse } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DynamicFieldProps } from './DynamicField';

export const DynamicYesNoField: React.FC<DynamicFieldProps> = ({
  field,
  value,
  onChange,
  error,
  disabled,
  className = '',
}) => {
  const isChecked = value?.value === true;
  const comments = value?.comments || '';

  const handleCheckboxChange = (checked: boolean) => {
    onChange({
      value: checked,
      comments: comments,
    });
  };

  const handleCommentsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      value: isChecked,
      comments: e.target.value,
    });
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Checkbox with label */}
      <div className="flex items-start space-x-3">
        <Checkbox
          id={field.id}
          checked={isChecked}
          onCheckedChange={handleCheckboxChange}
          disabled={disabled}
          className="mt-1"
        />
        <div className="flex-1 space-y-1">
          <Label
            htmlFor={field.id}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {field.label}
            {field.validation?.required && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </Label>
          {field.description && (
            <p className="text-sm text-muted-foreground">{field.description}</p>
          )}
        </div>
      </div>

      {/* Comments textarea (optional or required based on field config) */}
      {field.includeComments && (
        <div className="pl-7 space-y-2">
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
          {field.validation?.maxLength && (
            <p className="text-xs text-muted-foreground text-right">
              {comments.length} / {field.validation.maxLength}
            </p>
          )}
        </div>
      )}

      {/* Error message */}
      {error && <p className="text-sm text-red-500 pl-7">{error}</p>}
    </div>
  );
};
