'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { OnboardingQuestion } from '@/types';
import { Play, Check, Video, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoScenarioQuestionProps {
  question: OnboardingQuestion;
  onAnswer: (optionId: string, points: number) => void;
  disabled?: boolean;
}

/**
 * Video scenario question component.
 * Shows a video and then asks a multiple choice question about it.
 */
export function VideoScenarioQuestion({
  question,
  onAnswer,
  disabled,
}: VideoScenarioQuestionProps) {
  const [showQuestion, setShowQuestion] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const options = question.options || [];

  // Extract YouTube video ID if it's a YouTube URL
  const getYouTubeId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = url?.match(regex);
    return match ? match[1] : null;
  };

  const youtubeId = question.videoUrl ? getYouTubeId(question.videoUrl) : null;

  const handleVideoComplete = () => {
    // Short delay before showing question
    setTimeout(() => setShowQuestion(true), 300);
  };

  const handleSkipVideo = () => {
    // Allow skipping for demo purposes (placeholder videos)
    setShowQuestion(true);
  };

  const handleSelect = async (optionId: string, points: number) => {
    if (disabled || isSubmitting) return;

    setSelectedId(optionId);
    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 500));

    onAnswer(optionId, points);
  };

  if (!showQuestion) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        {/* Question preview */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm mb-4">
            <Video className="w-4 h-4" />
            Video Scenario
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {question.question}
          </h3>
          <p className="text-slate-400 text-sm">Watch the video, then answer the question</p>
        </div>

        {/* Video player area */}
        <div className="relative aspect-video bg-slate-800 rounded-xl overflow-hidden mb-6">
          {youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            // Placeholder for non-YouTube or missing videos
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <AlertCircle className="w-16 h-16 text-slate-600 mb-4" />
              <p className="text-slate-500 text-center px-4">
                Video scenario placeholder
              </p>
              <p className="text-slate-600 text-sm mt-2">
                (Video content coming soon)
              </p>
            </div>
          )}
        </div>

        {/* Continue button */}
        <div className="text-center">
          <Button
            onClick={handleVideoComplete}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold px-8 py-6 rounded-xl"
          >
            I've Watched the Video
            <Play className="ml-2 w-5 h-5" />
          </Button>

          {/* Skip option for placeholder videos */}
          {!youtubeId && (
            <button
              onClick={handleSkipVideo}
              className="block mx-auto mt-4 text-sm text-slate-500 hover:text-slate-400"
            >
              Skip video (for demo)
            </button>
          )}
        </div>
      </div>
    );
  }

  // Show question after video
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Question */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm mb-4">
          <Check className="w-4 h-4" />
          Video Complete
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          {question.question}
        </h3>
        {question.description && (
          <p className="text-slate-400">{question.description}</p>
        )}
      </div>

      {/* Options */}
      <div className="grid gap-3">
        {options.map((option, index) => {
          const isSelected = selectedId === option.id;
          const letter = String.fromCharCode(65 + index);

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id, option.points)}
              disabled={disabled || isSubmitting}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all duration-300',
                'flex items-center gap-4',
                isSelected
                  ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-cyan-400 text-white scale-[1.02] shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500',
                (disabled || isSubmitting) && !isSelected && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div
                className={cn(
                  'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg',
                  isSelected
                    ? 'bg-gradient-to-br from-blue-500 to-cyan-400 text-white'
                    : 'bg-slate-700 text-slate-400'
                )}
              >
                {isSelected ? <Check className="w-5 h-5" /> : letter}
              </div>
              <span className="flex-1 font-medium">{option.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
