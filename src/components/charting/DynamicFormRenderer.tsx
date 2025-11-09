'use client';

import React, { useState, useEffect } from 'react';
import {
  FormTemplate,
  FormSection,
  FormResponses,
  SectionResponse,
  FieldResponse,
} from '@/types';
import { DynamicField } from './dynamic-fields';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown, ChevronLeft, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export interface DynamicFormRendererProps {
  template: FormTemplate;
  initialValues?: FormResponses;
  onChange?: (responses: FormResponses) => void;
  onSectionComplete?: (sectionId: string, responses: SectionResponse) => void;
  disabled?: boolean;
  className?: string;
  // Section display options
  showSectionNumbers?: boolean;
  collapsibleSections?: boolean;
  highlightRequired?: boolean;
  initialSectionIndex?: number; // Focus on a specific section initially
}

/**
 * Renders a complete dynamic form based on a template
 * Handles section management, field rendering, and response collection
 */
export const DynamicFormRenderer: React.FC<DynamicFormRendererProps> = ({
  template,
  initialValues = {},
  onChange,
  onSectionComplete,
  disabled = false,
  className = '',
  showSectionNumbers = true,
  collapsibleSections = true,
  highlightRequired = true,
  initialSectionIndex,
}) => {
  const [responses, setResponses] = useState<FormResponses>(initialValues);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    // If initialSectionIndex is provided, only expand that section
    if (initialSectionIndex !== undefined && template.sections[initialSectionIndex]) {
      return new Set([template.sections[initialSectionIndex].id]);
    }
    // Otherwise, expand all sections
    return new Set(template.sections.map((s) => s.id));
  });
  const [errors, setErrors] = useState<{ [path: string]: string }>({});

  // Update responses when initial values change
  useEffect(() => {
    setResponses(initialValues);
  }, [initialValues]);

  // Notify parent of changes
  useEffect(() => {
    onChange?.(responses);
  }, [responses, onChange]);

  // Scroll to section when initialSectionIndex changes
  useEffect(() => {
    if (initialSectionIndex !== undefined && template.sections[initialSectionIndex]) {
      const sectionId = template.sections[initialSectionIndex].id;
      setTimeout(() => {
        const element = document.getElementById(`section-${sectionId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [initialSectionIndex, template.sections]);

  const handleFieldChange = (
    sectionId: string,
    fieldId: string,
    value: FieldResponse,
    repeatIndex?: number
  ) => {
    setResponses((prev) => {
      const newResponses = { ...prev };

      // Get section data
      const section = template.sections.find((s) => s.id === sectionId);

      if (section?.isRepeatable && repeatIndex !== undefined) {
        // Handle repeatable section
        const sectionArray = (prev[sectionId] as SectionResponse[]) || [];
        const newSectionArray = [...sectionArray];

        if (!newSectionArray[repeatIndex]) {
          newSectionArray[repeatIndex] = {};
        }

        newSectionArray[repeatIndex] = {
          ...newSectionArray[repeatIndex],
          [fieldId]: value,
        };

        newResponses[sectionId] = newSectionArray;
      } else {
        // Handle regular section
        const sectionData = (prev[sectionId] as SectionResponse) || {};
        newResponses[sectionId] = {
          ...sectionData,
          [fieldId]: value,
        };
      }

      return newResponses;
    });

    // Clear error for this field if it exists
    const errorKey = repeatIndex !== undefined
      ? `${sectionId}[${repeatIndex}].${fieldId}`
      : `${sectionId}.${fieldId}`;

    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const toggleSection = (sectionId: string) => {
    if (!collapsibleSections) return;

    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const isSectionExpanded = (sectionId: string) => {
    return !collapsibleSections || expandedSections.has(sectionId);
  };

  const getSectionCompletionPercentage = (section: FormSection): number => {
    const sectionData = responses[section.id];
    if (!sectionData) return 0;

    const requiredFields = section.fields.filter((f) => f.validation?.required);
    if (requiredFields.length === 0) return 100;

    if (section.isRepeatable) {
      const sectionArray = sectionData as SectionResponse[];
      if (!sectionArray.length) return 0;

      // Calculate completion for the first instance
      const firstInstance = sectionArray[0];
      const completedFields = requiredFields.filter(
        (f) => firstInstance[f.id]?.value !== undefined && firstInstance[f.id]?.value !== ''
      );

      return Math.round((completedFields.length / requiredFields.length) * 100);
    } else {
      const sectionObj = sectionData as SectionResponse;
      const completedFields = requiredFields.filter(
        (f) => sectionObj[f.id]?.value !== undefined && sectionObj[f.id]?.value !== ''
      );

      return Math.round((completedFields.length / requiredFields.length) * 100);
    }
  };

  const renderSection = (section: FormSection, index: number) => {
    const isExpanded = isSectionExpanded(section.id);
    const completionPercentage = getSectionCompletionPercentage(section);
    const sectionData = responses[section.id];

    return (
      <Card key={section.id} id={`section-${section.id}`} className="overflow-hidden">
        <CardHeader
          className={cn(
            'cursor-pointer transition-colors',
            collapsibleSections && 'hover:bg-muted/50'
          )}
          onClick={() => toggleSection(section.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                {showSectionNumbers && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {index + 1}
                  </span>
                )}
                {section.title}
                {highlightRequired && section.fields.some((f) => f.validation?.required) && (
                  <span className="text-red-500 text-sm">*</span>
                )}
              </CardTitle>
              {section.description && (
                <CardDescription className="mt-1">{section.description}</CardDescription>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Completion indicator */}
              {completionPercentage > 0 && (
                <div className="text-sm text-muted-foreground">
                  {completionPercentage}%
                </div>
              )}
              {/* Collapse/expand icon */}
              {collapsibleSections && (
                isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )
              )}
            </div>
          </div>
          {/* Progress bar */}
          {completionPercentage > 0 && completionPercentage < 100 && (
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          )}
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-6">
            {section.isRepeatable ? (
              renderRepeatableSection(section)
            ) : (
              renderRegularSection(section)
            )}
          </CardContent>
        )}
      </Card>
    );
  };

  const renderRegularSection = (section: FormSection) => {
    const sectionData = (responses[section.id] as SectionResponse) || {};

    return (
      <div className="space-y-6">
        {section.fields
          .sort((a, b) => a.order - b.order)
          .map((field) => {
            const fieldValue = sectionData[field.id];
            const errorKey = `${section.id}.${field.id}`;

            return (
              <div
                key={field.id}
                className={cn(
                  'rounded-lg border p-4',
                  field.columnSpan === 2 && 'col-span-2'
                )}
              >
                <DynamicField
                  field={field}
                  value={fieldValue}
                  onChange={(value) => handleFieldChange(section.id, field.id, value)}
                  error={errors[errorKey]}
                  disabled={disabled}
                />
              </div>
            );
          })}
      </div>
    );
  };

  const renderRepeatableSection = (section: FormSection) => {
    const sectionArray = (responses[section.id] as SectionResponse[]) || [{}];
    const maxRepeats = section.maxRepeats || 10;

    const addRepeat = () => {
      setResponses((prev) => {
        const currentArray = (prev[section.id] as SectionResponse[]) || [];
        if (currentArray.length >= maxRepeats) return prev;

        return {
          ...prev,
          [section.id]: [...currentArray, {}],
        };
      });
    };

    const removeRepeat = (index: number) => {
      setResponses((prev) => {
        const currentArray = (prev[section.id] as SectionResponse[]) || [];
        const newArray = currentArray.filter((_, i) => i !== index);

        return {
          ...prev,
          [section.id]: newArray.length > 0 ? newArray : [{}],
        };
      });
    };

    return (
      <div className="space-y-6">
        {sectionArray.map((instanceData, repeatIndex) => (
          <div key={repeatIndex} className="rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium">
                {section.repeatLabel || 'Instance'} {repeatIndex + 1}
              </h4>
              {sectionArray.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRepeat(repeatIndex)}
                  disabled={disabled}
                >
                  Remove
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {section.fields
                .sort((a, b) => a.order - b.order)
                .map((field) => {
                  const fieldValue = instanceData[field.id];
                  const errorKey = `${section.id}[${repeatIndex}].${field.id}`;

                  return (
                    <DynamicField
                      key={field.id}
                      field={field}
                      value={fieldValue}
                      onChange={(value) =>
                        handleFieldChange(section.id, field.id, value, repeatIndex)
                      }
                      error={errors[errorKey]}
                      disabled={disabled}
                    />
                  );
                })}
            </div>
          </div>
        ))}

        {sectionArray.length < maxRepeats && (
          <Button
            type="button"
            variant="outline"
            onClick={addRepeat}
            disabled={disabled}
            className="w-full"
          >
            Add {section.repeatLabel || 'Instance'}
          </Button>
        )}
      </div>
    );
  };

  const router = useRouter();
  const sortedSections = template.sections.sort((a, b) => a.order - b.order);
  const totalSections = sortedSections.length;

  const handleNavigateSection = (newIndex: number | 'all') => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    if (newIndex === 'all') {
      url.searchParams.delete('section');
    } else {
      url.searchParams.set('section', newIndex.toString());
    }
    router.push(url.pathname + url.search);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Form header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{template.name}</h2>
        {template.description && (
          <p className="text-muted-foreground">{template.description}</p>
        )}
      </div>

      {/* Section Navigation */}
      {initialSectionIndex !== undefined && (
        <div className="flex items-center justify-between gap-4 p-4 bg-muted rounded-lg">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleNavigateSection(initialSectionIndex - 1)}
            disabled={initialSectionIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Section {initialSectionIndex + 1} of {totalSections}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigateSection('all')}
            >
              <Menu className="h-4 w-4 mr-1" />
              View All
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleNavigateSection(initialSectionIndex + 1)}
            disabled={initialSectionIndex === totalSections - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-4">
        {sortedSections
          .filter((section, index) =>
            // If initialSectionIndex is provided, only show that section
            initialSectionIndex !== undefined ? index === initialSectionIndex : true
          )
          .map((section, index) => {
            // Use the actual index from the original array for proper numbering
            const actualIndex = initialSectionIndex !== undefined ? initialSectionIndex : index;
            return renderSection(section, actualIndex);
          })}
      </div>
    </div>
  );
};
