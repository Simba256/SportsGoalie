'use client';

import { useState, useEffect } from 'react';
import { Session, FormTemplate, FormResponses, DynamicChartingEntry } from '@/types';
import { formTemplateService } from '@/lib/database/services/form-template.service';
import { dynamicChartingService } from '@/lib/database/services/dynamic-charting.service';
import { DynamicFormRenderer } from '@/components/charting/DynamicFormRenderer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ChartingFormWrapperProps {
  session: Session;
  userId: string;
  userRole: 'student' | 'admin';
  onSave: () => void;
  LegacyForm: React.ComponentType<any>;
}

export function ChartingFormWrapper({
  session,
  userId,
  userRole,
  onSave,
  LegacyForm,
}: ChartingFormWrapperProps) {
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [existingEntry, setExistingEntry] = useState<DynamicChartingEntry | null>(null);
  const [responses, setResponses] = useState<FormResponses>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [useDynamicForm, setUseDynamicForm] = useState(false);

  useEffect(() => {
    loadTemplateAndEntry();
  }, [session.id]);

  const loadTemplateAndEntry = async () => {
    try {
      setLoading(true);

      // For now, hardcode sport as "Hockey" since current system is hockey-specific
      // TODO: Get sport from session or user profile
      const sport = 'Hockey';

      // Try to get active template for this sport
      const templateResult = await formTemplateService.getActiveTemplate(sport);

      if (templateResult.success && templateResult.data) {
        setTemplate(templateResult.data);
        setUseDynamicForm(true);

        // Try to load existing entry
        const entriesResult = await dynamicChartingService.getDynamicEntriesBySession(
          session.id
        );

        if (entriesResult.success && entriesResult.data && entriesResult.data.length > 0) {
          // Find entry submitted by current user
          const entry = entriesResult.data.find((e) => e.submittedBy === userId);
          if (entry) {
            setExistingEntry(entry);
            setResponses(entry.responses || {});
          }
        }
      } else {
        // No active template, use legacy form
        setUseDynamicForm(false);
      }
    } catch (error) {
      console.error('Error loading template:', error);
      setUseDynamicForm(false);
    } finally {
      setLoading(false);
    }
  };

  const handleResponsesChange = (newResponses: FormResponses) => {
    setResponses(newResponses);
  };

  const handleSave = async () => {
    if (!template) return;

    try {
      setSaving(true);

      const entryData = {
        sessionId: session.id,
        studentId: session.studentId,
        submittedBy: userId,
        submitterRole: userRole,
        formTemplateId: template.id,
        formTemplateVersion: template.version,
        responses,
      };

      if (existingEntry) {
        const result = await dynamicChartingService.updateDynamicEntry(
          existingEntry.id,
          entryData
        );

        if (result.success) {
          toast.success('Session updated successfully');
          onSave();
        } else {
          toast.error(result.message || 'Failed to update session');
        }
      } else {
        const result = await dynamicChartingService.createDynamicEntry(entryData);

        if (result.success && result.data) {
          setExistingEntry({ ...entryData, id: result.data.id } as DynamicChartingEntry);
          toast.success('Session saved successfully');
          onSave();
        } else {
          toast.error(result.message || 'Failed to save session');
        }
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Use dynamic form if template is available
  if (useDynamicForm && template) {
    return (
      <div className="space-y-6">
        {/* Save Button (top) */}
        <div className="flex justify-end sticky top-0 bg-gray-50 py-4 z-10">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Progress
              </>
            )}
          </Button>
        </div>

        {/* Dynamic Form */}
        <DynamicFormRenderer
          template={template}
          initialValues={responses}
          onChange={handleResponsesChange}
          showSectionNumbers={true}
          collapsibleSections={true}
        />

        {/* Save Button (bottom) */}
        <div className="flex justify-end pb-8">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Progress
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Fallback to legacy form if no template
  return (
    <div className="space-y-4">
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">Using Legacy Form</h3>
            <p className="text-sm text-yellow-700 mt-1">
              No dynamic template found for this sport. Using the original form structure.
              Ask your admin to initialize templates to use the new dynamic charting system.
            </p>
          </div>
        </div>
      </Card>
      <LegacyForm />
    </div>
  );
}
