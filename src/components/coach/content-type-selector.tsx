'use client';

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
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto border-zinc-200 bg-gradient-to-b from-white to-zinc-50/80 shadow-2xl shadow-zinc-300/40">
        <DialogHeader className="relative rounded-xl border border-zinc-200 bg-gradient-to-r from-zinc-950 via-blue-950 to-zinc-900 px-5 py-3 text-white">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-red-500/10 blur-2xl" />
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-red-300">Curriculum</p>
          <DialogTitle className="text-[2rem] leading-tight font-black tracking-tight text-white">Create Custom Content</DialogTitle>
          <DialogDescription className="text-blue-100/80">
            Choose the type of content you want to create
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-3 md:grid-cols-2">
          {/* Lesson Option */}
          <Card
            className="group cursor-pointer border-blue-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100"
            onClick={() => handleSelect('lesson')}
          >
            <CardHeader className="pb-1.5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 text-blue-700 ring-1 ring-blue-200">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-zinc-900">Lesson</CardTitle>
                    <CardDescription className="text-zinc-500">Video + Text Content</CardDescription>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-zinc-400 transition-colors group-hover:text-blue-700" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-4">
              <p className="text-sm text-zinc-600">
                Create a lesson with video content, written instructions, learning objectives, and attachments. Perfect for teaching new skills or concepts.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                <span className="text-xs px-2.5 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700">Video Upload</span>
                <span className="text-xs px-2.5 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700">Rich Text</span>
                <span className="text-xs px-2.5 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-700">Attachments</span>
              </div>
            </CardContent>
          </Card>

          {/* Quiz Option */}
          <Card
            className="group cursor-pointer border-red-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-red-400 hover:shadow-lg hover:shadow-red-100"
            onClick={() => handleSelect('quiz')}
          >
            <CardHeader className="pb-1.5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-100 text-red-700 ring-1 ring-red-200">
                    <PlayCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-zinc-900">Video Quiz</CardTitle>
                    <CardDescription className="text-zinc-500">Interactive Video Assessment</CardDescription>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-zinc-400 transition-colors group-hover:text-red-700" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-4">
              <p className="text-sm text-zinc-600">
                Create an interactive quiz with questions appearing at specific video timestamps. Great for testing comprehension and engagement.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                <span className="text-xs px-2.5 py-1 rounded-full border border-red-200 bg-red-50 text-red-700">Timestamp Questions</span>
                <span className="text-xs px-2.5 py-1 rounded-full border border-red-200 bg-red-50 text-red-700">Multiple Choice</span>
                <span className="text-xs px-2.5 py-1 rounded-full border border-red-200 bg-red-50 text-red-700">Auto-grading</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
