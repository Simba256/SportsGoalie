'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Eye, Code, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HTMLEditorWithAIProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  skillName?: string;
  description?: string;
  difficulty?: string;
  objectives?: string[];
}

export function HTMLEditorWithAI({
  label = 'Content (HTML)',
  value,
  onChange,
  placeholder = 'Enter HTML content or use AI to generate...',
  className,
  skillName = '',
  description = '',
  difficulty = 'beginner',
  objectives = []
}: HTMLEditorWithAIProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const canGenerateAI = skillName?.trim() && description?.trim() && objectives?.length > 0;


  const handleGenerateAI = async () => {
    console.log('🚀 Generate AI clicked!', {
      canGenerateAI,
      skillName,
      description,
      objectives,
      difficulty
    });

    if (!canGenerateAI) {
      setError('Please fill in skill name, description, and at least one learning objective first');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-html', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skillName,
          description,
          difficulty,
          objectives,
          existingContent: value
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate content');
      }

      onChange(data.content);
      setShowAIPanel(false);

    } catch (err) {
      console.error('Error generating AI content:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnhanceExisting = async () => {
    console.log('✨ Enhance Existing clicked!', {
      canGenerateAI,
      hasContent: !!value.trim(),
      skillName,
      description,
      objectives
    });

    if (!value.trim()) {
      setError('Please enter some content to enhance first');
      return;
    }

    if (!canGenerateAI) {
      setError('Please fill in skill name, description, and learning objectives first');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-html', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skillName,
          description,
          difficulty,
          objectives,
          existingContent: value
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to enhance content');
      }

      onChange(data.content);

    } catch (err) {
      console.error('Error enhancing content:', err);
      setError(err instanceof Error ? err.message : 'Failed to enhance content');
    } finally {
      setIsGenerating(false);
    }
  };

  // Prevent hydration mismatch by only rendering interactive elements after client hydration
  if (!isClient) {
    return (
      <div className={cn('space-y-4', className)}>
        <Label className="text-base font-medium">{label}</Label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border rounded-lg px-3 py-2 min-h-[300px] font-mono text-sm resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Label and AI Controls */}
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">{label}</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1"
          >
            {showPreview ? <Code className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPreview ? 'Edit' : 'Preview'}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              console.log('🎯 AI Assistant button clicked!');
              setShowAIPanel(!showAIPanel);
            }}
            className="flex items-center gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Sparkles className="w-4 h-4" />
            AI Assistant {isClient && '✓'}
          </Button>
        </div>
      </div>

      {/* AI Panel */}
      {showAIPanel && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              AI Content Generator
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Generate professional HTML content for your skill using Claude AI
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Requirements Check */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <Badge
                  variant={skillName?.trim() ? "default" : "destructive"}
                  className={`text-xs ${skillName?.trim() ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}`}
                >
                  {skillName?.trim() ? "✓" : "✗"} Skill Name
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={description?.trim() ? "default" : "destructive"}
                  className={`text-xs ${description?.trim() ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}`}
                >
                  {description?.trim() ? "✓" : "✗"} Description
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={objectives?.length > 0 ? "default" : "destructive"}
                  className={`text-xs ${objectives?.length > 0 ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}`}
                >
                  {objectives?.length > 0 ? "✓" : "✗"} Objectives ({objectives?.length || 0})
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-300">
                  Level: {difficulty}
                </Badge>
              </div>
            </div>

            {!canGenerateAI && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-red-800 mb-2">Missing Required Fields</h4>
                    <p className="text-sm text-red-700 mb-3">
                      Please complete the following fields before using AI generation:
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {!skillName?.trim() && (
                    <div className="flex items-center gap-2 text-sm text-red-700">
                      <span className="w-4 h-4 rounded-full bg-red-200 flex items-center justify-center text-xs">✗</span>
                      <span>Skill Name (required)</span>
                    </div>
                  )}
                  {!description?.trim() && (
                    <div className="flex items-center gap-2 text-sm text-red-700">
                      <span className="w-4 h-4 rounded-full bg-red-200 flex items-center justify-center text-xs">✗</span>
                      <span>Description (required)</span>
                    </div>
                  )}
                  {!objectives?.length && (
                    <div className="flex items-center gap-2 text-sm text-red-700">
                      <span className="w-4 h-4 rounded-full bg-red-200 flex items-center justify-center text-xs">✗</span>
                      <span>Learning Objectives - Add at least one objective in the "Learning Objectives" field below</span>
                    </div>
                  )}
                </div>
              </div>
            )}


            {/* AI Actions */}
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleGenerateAI}
                disabled={isGenerating || !canGenerateAI}
                className={`flex items-center gap-2 ${!canGenerateAI ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {value.trim() ? 'Regenerate Content' : 'Generate Content'}
              </Button>

              {value.trim() && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleEnhanceExisting}
                  disabled={isGenerating || !canGenerateAI}
                  className="flex items-center gap-2"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Enhance Existing
                </Button>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Editor/Preview */}
      {showPreview ? (
        <Card className="min-h-[300px]">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: value || '<p class="text-muted-foreground italic">No content to preview</p>' }}
            />
          </CardContent>
        </Card>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border rounded-lg px-3 py-2 min-h-[300px] font-mono text-sm resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isGenerating}
        />
      )}

      {/* Character Count */}
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>{value.length} characters</span>
        {isGenerating && (
          <span className="flex items-center gap-1 text-blue-600">
            <Loader2 className="w-3 h-3 animate-spin" />
            Generating content with AI...
          </span>
        )}
      </div>
    </div>
  );
}