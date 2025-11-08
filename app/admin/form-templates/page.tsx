'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { formTemplateService } from '@/lib/database/services/form-template.service';
import { initializeDefaultTemplates, checkDefaultTemplatesExist } from '@/lib/templates/init-templates';
import { FormTemplate } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function FormTemplatesPage() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [templatesExist, setTemplatesExist] = useState({ hockeyGoalie: false });

  useEffect(() => {
    loadTemplates();
    checkTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const result = await formTemplateService.getTemplates({
        isArchived: false,
        orderBy: 'updatedAt',
        orderDirection: 'desc',
      });

      if (result.success && result.data) {
        setTemplates(result.data);
      } else {
        toast.error('Failed to load templates');
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Error loading templates');
    } finally {
      setLoading(false);
    }
  };

  const checkTemplates = async () => {
    const exists = await checkDefaultTemplatesExist();
    setTemplatesExist(exists);
  };

  const handleInitializeTemplates = async () => {
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    setInitializing(true);
    try {
      const result = await initializeDefaultTemplates(user.id);

      if (result.success) {
        toast.success(result.message);
        await loadTemplates();
        await checkTemplates();
      } else {
        toast.error(result.message);
        if (result.errors && result.errors.length > 0) {
          result.errors.forEach((error) => {
            toast.error(error);
          });
        }
      }
    } catch (error) {
      console.error('Error initializing templates:', error);
      toast.error('Failed to initialize templates');
    } finally {
      setInitializing(false);
    }
  };

  const handleActivateTemplate = async (templateId: string, sport: string) => {
    try {
      const result = await formTemplateService.activateTemplate(templateId, sport);

      if (result.success) {
        toast.success('Template activated successfully');
        await loadTemplates();
      } else {
        toast.error(result.message || 'Failed to activate template');
      }
    } catch (error) {
      console.error('Error activating template:', error);
      toast.error('Error activating template');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Form Templates</h1>
          <p className="text-muted-foreground mt-1">
            Manage dynamic form templates for charting sessions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadTemplates} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Initialization Card */}
      {!templatesExist.hockeyGoalie && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <CardTitle className="text-orange-900">Initialize Default Templates</CardTitle>
                  <CardDescription className="text-orange-700">
                    No default templates found. Click below to create the default Hockey Goalie
                    Performance Tracker template.
                  </CardDescription>
                </div>
              </div>
              <Button
                onClick={handleInitializeTemplates}
                disabled={initializing}
                className="ml-4"
              >
                {initializing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Initialize Templates
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Templates List */}
      {templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No Templates Found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Initialize default templates to get started
                </p>
              </div>
              <Button onClick={handleInitializeTemplates} disabled={initializing}>
                {initializing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Initialize Default Templates
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{template.name}</CardTitle>
                    {template.description && (
                      <CardDescription className="mt-2">{template.description}</CardDescription>
                    )}
                  </div>
                  {template.isActive && (
                    <Badge variant="default" className="ml-2">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Template Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Sport</p>
                    <p className="font-medium">{template.sport || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Version</p>
                    <p className="font-medium">v{template.version}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Sections</p>
                    <p className="font-medium">{template.sections.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Usage</p>
                    <p className="font-medium">{template.usageCount || 0} entries</p>
                  </div>
                </div>

                {/* Field Count */}
                <div className="text-sm">
                  <p className="text-muted-foreground">Total Fields</p>
                  <p className="font-medium">
                    {template.sections.reduce((sum, section) => sum + section.fields.length, 0)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {!template.isActive && template.sport && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleActivateTemplate(template.id, template.sport!)}
                      className="flex-1"
                    >
                      Activate
                    </Button>
                  )}
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/admin/form-templates/${template.id}`}>View Details</Link>
                  </Button>
                </div>

                {/* Metadata */}
                <div className="text-xs text-muted-foreground border-t pt-2">
                  <p>
                    Created:{' '}
                    {template.createdAt?.toDate?.().toLocaleDateString() || 'Unknown'}
                  </p>
                  {template.updatedAt && (
                    <p>
                      Updated:{' '}
                      {template.updatedAt?.toDate?.().toLocaleDateString() || 'Unknown'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
