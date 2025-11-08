'use client';

import React from 'react';
import { FormField, FieldResponse } from '@/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DynamicFieldProps } from './DynamicField';

export const DynamicTextField: React.FC<DynamicFieldProps> = ({
  field,
  value,
  onChange,
  error,
  disabled,
  className = '',
}) => {
  const textValue = (value?.value as string) || '';

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      value: e.target.value,
    });
  };

  return (
    <div className={`space-y-2 ${className}`}>
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

      {/* Text input */}
      <Input
        id={field.id}
        type="text"
        value={textValue}
        onChange={handleValueChange}
        disabled={disabled}
        placeholder={field.placeholder}
        maxLength={field.validation?.maxLength}
      />

      {/* Character count */}
      {field.validation?.maxLength && (
        <p className="text-xs text-muted-foreground text-right">
          {textValue.length} / {field.validation.maxLength}
        </p>
      )}

      {/* Error message */}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};
