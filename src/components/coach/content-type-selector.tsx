'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, PlayCircle, ChevronRight } from 'lucide-react';

export type ContentType = 'lesson' | 'quiz';

interface ContentTypeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: ContentType) => void;
}

export function ContentTypeSelector({
  open,
  onOpenChange,
  onSelect,
}: ContentTypeSelectorProps) {
  const handleSelect = (type: ContentType) => {
    onSelect(type);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Custom Content</DialogTitle>
          <DialogDescription>
            Choose the type of content you want to create
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Lesson Option */}
          <Card
            className="cursor-pointer transition-all hover:border-primary hover:shadow-md group"
            onClick={() => handleSelect('lesson')}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 text-blue-600">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Lesson</CardTitle>
                    <CardDescription>Video + Text Content</CardDescription>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">
                Create a lesson with video content, written instructions, learning objectives, and attachments. Perfect for teaching new skills or concepts.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs px-2 py-1 bg-muted rounded">Video Upload</span>
                <span className="text-xs px-2 py-1 bg-muted rounded">Rich Text</span>
                <span className="text-xs px-2 py-1 bg-muted rounded">Attachments</span>
              </div>
            </CardContent>
          </Card>

          {/* Quiz Option */}
          <Card
            className="cursor-pointer transition-all hover:border-primary hover:shadow-md group"
            onClick={() => handleSelect('quiz')}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 text-green-600">
                    <PlayCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Video Quiz</CardTitle>
                    <CardDescription>Interactive Video Assessment</CardDescription>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">
                Create an interactive quiz with questions appearing at specific video timestamps. Great for testing comprehension and engagement.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs px-2 py-1 bg-muted rounded">Timestamp Questions</span>
                <span className="text-xs px-2 py-1 bg-muted rounded">Multiple Choice</span>
                <span className="text-xs px-2 py-1 bg-muted rounded">Auto-grading</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
