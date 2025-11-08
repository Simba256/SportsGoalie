'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { formTemplateService } from '@/lib/database/services/form-template.service';
import { FormTemplate, FormSection, FormField, FieldType, AnalyticsType } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function NewTemplatePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  // Template basic info
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sport, setSport] = useState('');

  // Sections
  const [sections, setSections] = useState<Partial<FormSection>[]>([
    {
      id: 'section_1',
      title: '',
      description: '',
      order: 1,
      fields: [],
    },
  ]);

  const addSection = () => {
    const newSection: Partial<FormSection> = {
      id: `section_${sections.length + 1}`,
      title: '',
      description: '',
      order: sections.length + 1,
      fields: [],
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (index: number) => {
    if (sections.length === 1) {
      toast.error('Template must have at least one section');
      return;
    }
    const newSections = sections.filter((_, i) => i !== index);
    setSections(newSections);
  };

  const updateSection = (index: number, updates: Partial<FormSection>) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], ...updates };
    setSections(newSections);
  };

  const addFieldToSection = (sectionIndex: number) => {
    const section = sections[sectionIndex];
    const fieldCount = section.fields?.length || 0;

    const newField: Partial<FormField> = {
      id: `${section.id}_field_${fieldCount + 1}`,
      label: '',
      type: 'text',
      description: '',
      includeComments: false,
      validation: { required: false },
      analytics: {
        enabled: false,
        type: 'none',
      },
      order: fieldCount + 1,
    };

    const newSections = [...sections];
    newSections[sectionIndex].fields = [...(section.fields || []), newField as FormField];
    setSections(newSections);
  };

  const removeFieldFromSection = (sectionIndex: number, fieldIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].fields = newSections[sectionIndex].fields?.filter(
      (_, i) => i !== fieldIndex
    );
    setSections(newSections);
  };

  const updateField = (sectionIndex: number, fieldIndex: number, updates: Partial<FormField>) => {
    const newSections = [...sections];
    const fields = newSections[sectionIndex].fields || [];
    fields[fieldIndex] = { ...fields[fieldIndex], ...updates };
    newSections[sectionIndex].fields = fields;
    setSections(newSections);
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    // Validation
    if (!name.trim()) {
      toast.error('Template name is required');
      return;
    }

    if (sections.length === 0) {
      toast.error('Template must have at least one section');
      return;
    }

    for (let i = 0; i < sections.length; i++) {
      if (!sections[i].title?.trim()) {
        toast.error(`Section ${i + 1} must have a title`);
        return;
      }
      if (!sections[i].fields || sections[i].fields!.length === 0) {
        toast.error(`Section ${i + 1} must have at least one field`);
        return;
      }
      for (let j = 0; j < sections[i].fields!.length; j++) {
        if (!sections[i].fields![j].label?.trim()) {
          toast.error(`Field ${j + 1} in section ${i + 1} must have a label`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      const templateData = {
        name,
        description,
        sport,
        isActive: false,
        isArchived: false,
        allowPartialSubmission: true,
        sections: sections as FormSection[],
        createdBy: user.id,
      };

      const result = await formTemplateService.createTemplate(templateData);

      if (result.success && result.data) {
        toast.success('Template created successfully');
        router.push(`/admin/form-templates/${result.data.id}`);
      } else {
        toast.error(result.message || 'Failed to create template');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Error creating template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/form-templates">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Templates
            </Link>
          </Button>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create Template
            </>
          )}
        </Button>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Template Information</CardTitle>
          <CardDescription>Basic information about the form template</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Soccer Player Performance Tracker"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this form is used for..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sport">Sport</Label>
            <Input
              id="sport"
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              placeholder="e.g., Soccer, Basketball, Hockey"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Sections</h2>
          <Button onClick={addSection} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>

        {sections.map((section, sectionIndex) => (
          <Card key={section.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Section {sectionIndex + 1}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSection(sectionIndex)}
                  disabled={sections.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Section Title *</Label>
                <Input
                  value={section.title}
                  onChange={(e) => updateSection(sectionIndex, { title: e.target.value })}
                  placeholder="e.g., Pre-Game, In-Game Performance"
                />
              </div>

              <div className="space-y-2">
                <Label>Section Description</Label>
                <Textarea
                  value={section.description}
                  onChange={(e) => updateSection(sectionIndex, { description: e.target.value })}
                  placeholder="Describe this section..."
                  rows={2}
                />
              </div>

              {/* Fields */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Fields</Label>
                  <Button
                    onClick={() => addFieldToSection(sectionIndex)}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Field
                  </Button>
                </div>

                {(!section.fields || section.fields.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No fields yet. Click "Add Field" to get started.
                  </p>
                )}

                {section.fields?.map((field, fieldIndex) => (
                  <Card key={field.id} className="bg-muted/50">
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-3">
                          {/* Field Label and Type */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Field Label *</Label>
                              <Input
                                value={field.label}
                                onChange={(e) =>
                                  updateField(sectionIndex, fieldIndex, { label: e.target.value })
                                }
                                placeholder="e.g., Well Rested?"
                                className="h-9"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Field Type</Label>
                              <Select
                                value={field.type}
                                onValueChange={(value: FieldType) =>
                                  updateField(sectionIndex, fieldIndex, { type: value })
                                }
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="yesno">Yes/No</SelectItem>
                                  <SelectItem value="radio">Radio (Single Choice)</SelectItem>
                                  <SelectItem value="checkbox">Checkbox (Multiple)</SelectItem>
                                  <SelectItem value="numeric">Numeric</SelectItem>
                                  <SelectItem value="scale">Scale (1-10)</SelectItem>
                                  <SelectItem value="text">Text</SelectItem>
                                  <SelectItem value="textarea">Text Area</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Options for radio/checkbox */}
                          {(field.type === 'radio' || field.type === 'checkbox') && (
                            <div className="space-y-1">
                              <Label className="text-xs">Options (comma-separated)</Label>
                              <Input
                                value={field.options?.join(', ') || ''}
                                onChange={(e) => {
                                  // Store the raw value, split on blur or save
                                  const rawValue = e.target.value;
                                  // Create array from the input, but keep empty strings to preserve commas
                                  const options = rawValue.split(',').map((o) => o.trim());
                                  updateField(sectionIndex, fieldIndex, { options });
                                }}
                                onBlur={(e) => {
                                  // Clean up on blur - remove empty options
                                  const options = e.target.value
                                    .split(',')
                                    .map((o) => o.trim())
                                    .filter((o) => o.length > 0);
                                  updateField(sectionIndex, fieldIndex, { options });
                                }}
                                placeholder="e.g., poor, improving, good"
                                className="h-9"
                              />
                            </div>
                          )}

                          {/* Switches */}
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={field.validation?.required}
                                onCheckedChange={(checked) =>
                                  updateField(sectionIndex, fieldIndex, {
                                    validation: { ...field.validation, required: checked },
                                  })
                                }
                              />
                              <Label className="text-xs">Required</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={field.includeComments}
                                onCheckedChange={(checked) =>
                                  updateField(sectionIndex, fieldIndex, {
                                    includeComments: checked,
                                  })
                                }
                              />
                              <Label className="text-xs">Include Comments</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={field.analytics.enabled}
                                onCheckedChange={(checked) =>
                                  updateField(sectionIndex, fieldIndex, {
                                    analytics: {
                                      ...field.analytics,
                                      enabled: checked,
                                      type: checked ? 'percentage' : 'none',
                                    },
                                  })
                                }
                              />
                              <Label className="text-xs">Enable Analytics</Label>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFieldFromSection(sectionIndex, fieldIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Save Button (bottom) */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating Template...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create Template
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
