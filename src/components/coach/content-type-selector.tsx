'use client';

import { useRef } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BookOpen, PlayCircle, ArrowRight, Video, FileText, Paperclip, Clock, ListChecks, Award } from 'lucide-react';

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
  const contentRef = useRef<HTMLDivElement>(null);

  const handleSelect = (type: ContentType) => {
    onSelect(type);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={contentRef}
        showCloseButton={false}
        tabIndex={-1}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          requestAnimationFrame(() => contentRef.current?.focus());
        }}
        className="sm:max-w-2xl p-0 gap-0 overflow-hidden border-0 bg-white shadow-2xl rounded-2xl"
      >
        {/* Header */}
        <DialogHeader className="px-8 pt-8 pb-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
          <div className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 bg-blue-500/15 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 w-44 h-44 bg-red-500/10 rounded-full blur-3xl" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-300 mb-2">
              Content Library
            </p>
            <DialogTitle className="text-2xl font-bold tracking-tight text-white">
              Create New Content
            </DialogTitle>
            <DialogDescription className="text-slate-300 mt-1.5 text-sm">
              Select the type of content you'd like to build for your students
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Content Cards */}
        <div className="px-8 py-8">
          <div className="grid gap-5 md:grid-cols-2">
            {/* Lesson Card */}
            <button
              onClick={() => handleSelect('lesson')}
              className="group relative flex flex-col text-left rounded-xl border-2 border-slate-200 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/70 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/25">
                  <BookOpen className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 transition-colors">
                    Lesson
                  </h3>
                  <p className="text-sm text-slate-500">Video + Text Content</p>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed mb-5 flex-1">
                Create a lesson with video content, written instructions, learning
                objectives, and attachments. Perfect for teaching new skills or concepts.
              </p>

              <div className="flex flex-wrap gap-2 mb-5">
                <FeatureTag icon={<Video className="h-3 w-3" />} label="Video Upload" />
                <FeatureTag icon={<FileText className="h-3 w-3" />} label="Rich Text" />
                <FeatureTag icon={<Paperclip className="h-3 w-3" />} label="Attachments" />
              </div>

              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">
                Create Lesson
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </button>

            {/* Quiz Card */}
            <button
              onClick={() => handleSelect('quiz')}
              className="group relative flex flex-col text-left rounded-xl border-2 border-slate-200 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/70 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md shadow-red-500/25">
                  <PlayCircle className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 transition-colors">
                    Video Quiz
                  </h3>
                  <p className="text-sm text-slate-500">Interactive Assessment</p>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed mb-5 flex-1">
                Create an interactive quiz with questions appearing at specific video
                timestamps. Great for testing comprehension and engagement.
              </p>

              <div className="flex flex-wrap gap-2 mb-5">
                <FeatureTag icon={<Clock className="h-3 w-3" />} label="Timed Questions" />
                <FeatureTag icon={<ListChecks className="h-3 w-3" />} label="Multiple Choice" />
                <FeatureTag icon={<Award className="h-3 w-3" />} label="Auto-grading" />
              </div>

              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">
                Create Quiz
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-6 flex justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="px-6 border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-lg"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FeatureTag({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-700">
      {icon}
      {label}
    </span>
  );
}
