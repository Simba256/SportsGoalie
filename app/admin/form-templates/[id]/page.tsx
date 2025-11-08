'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { formTemplateService } from '@/lib/database/services/form-template.service';
import { FormTemplate } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, CheckCircle2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;

  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplate();
  }, [templateId]);

  const loadTemplate = async () => {
    setLoading(true);
    try {
      const result = await formTemplateService.getTemplate(templateId);

      if (result.success && result.data) {
        setTemplate(result.data);
      } else {
        toast.error('Failed to load template');
        router.push('/admin/form-templates');
      }
    } catch (error) {
      console.error('Error loading template:', error);
      toast.error('Error loading template');
      router.push('/admin/form-templates');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!template) {
    return null;
  }

  const totalFields = template.sections.reduce((sum, section) => sum + section.fields.length, 0);
  const analyticsEnabledFields = template.sections.reduce(
    (sum, section) => sum + section.fields.filter((f) => f.analytics.enabled).length,
    0
  );

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
        {template.isActive && (
          <Badge variant="default" className="ml-2">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )}
      </div>

      {/* Template Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{template.name}</CardTitle>
              {template.description && (
                <CardDescription className="mt-2 text-base">{template.description}</CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Sport</p>
              <p className="font-medium">{template.sport || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Version</p>
              <p className="font-medium">v{template.version}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sections</p>
              <p className="font-medium">{template.sections.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Fields</p>
              <p className="font-medium">{totalFields}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Analytics Fields</p>
              <p className="font-medium">{analyticsEnabledFields}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Usage Count</p>
              <p className="font-medium">{template.usageCount || 0} entries</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium">
                {template.isArchived ? 'Archived' : template.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Partial Submission</p>
              <p className="font-medium">{template.allowPartialSubmission ? 'Allowed' : 'Not allowed'}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Created</p>
                <p>{template.createdAt?.toDate?.().toLocaleString() || 'Unknown'}</p>
              </div>
              {template.updatedAt && (
                <div>
                  <p className="text-muted-foreground">Last Updated</p>
                  <p>{template.updatedAt?.toDate?.().toLocaleString() || 'Unknown'}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Sections & Fields</h2>
        {template.sections
          .sort((a, b) => a.order - b.order)
          .map((section, sectionIndex) => (
            <Card key={section.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
                    {sectionIndex + 1}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    {section.description && (
                      <CardDescription className="mt-1">{section.description}</CardDescription>
                    )}
                  </div>
                  <Badge variant="outline">{section.fields.length} fields</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {section.fields
                    .sort((a, b) => a.order - b.order)
                    .map((field, fieldIndex) => (
                      <div
                        key={field.id}
                        className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50"
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-background text-xs font-medium">
                          {fieldIndex + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{field.label}</p>
                            <Badge variant="secondary" className="text-xs">
                              {field.type}
                            </Badge>
                            {field.validation?.required && (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            )}
                            {field.analytics.enabled && (
                              <Badge variant="default" className="text-xs">
                                Analytics: {field.analytics.type}
                              </Badge>
                            )}
                          </div>
                          {field.description && (
                            <p className="text-sm text-muted-foreground mb-2">{field.description}</p>
                          )}
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {field.options && field.options.length > 0 && (
                              <span>Options: {field.options.join(', ')}</span>
                            )}
                            {field.validation?.min !== undefined && (
                              <span>Min: {field.validation.min}</span>
                            )}
                            {field.validation?.max !== undefined && (
                              <span>Max: {field.validation.max}</span>
                            )}
                            {field.includeComments && <span>Includes comments</span>}
                            {field.analytics.category && (
                              <span>Category: {field.analytics.category}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
