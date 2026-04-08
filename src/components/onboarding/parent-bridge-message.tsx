'use client';

import { Button } from '@/components/ui/button';
import { ChevronRight, Target, Sparkles, CheckCircle2 } from 'lucide-react';

interface ParentBridgeMessageProps {
  parentName: string;
  onContinue: () => void;
}

export function ParentBridgeMessage({
  parentName,
  onContinue,
}: ParentBridgeMessageProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 border-2 border-red-200">
            <Sparkles className="w-10 h-10 text-red-500" />
          </div>
        </div>

        {/* Greeting */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
          Thanks, {parentName}.
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Now let&apos;s understand how you see your goalie&apos;s game — and your role in their development.
        </p>

        {/* Assessment explanation */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8 text-left">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-red-500" />
            Now for the deeper questions.
          </h3>

          <p className="text-gray-600 mb-4">
            The next section explores how you perceive your goalie&apos;s current state,
            your understanding of the position, and how you communicate after games.
            This isn&apos;t a test — we&apos;re looking for your honest perspective.
          </p>

          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-gray-500">
              <CheckCircle2 className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span>7 categories covering different aspects of being a goalie parent</span>
            </li>
            <li className="flex items-start gap-2 text-gray-500">
              <CheckCircle2 className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span>28 quick questions — all multiple choice</span>
            </li>
            <li className="flex items-start gap-2 text-gray-500">
              <CheckCircle2 className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span>No right or wrong answers — just be honest</span>
            </li>
            <li className="flex items-start gap-2 text-gray-500">
              <CheckCircle2 className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span>Your progress is saved if you need to take a break</span>
            </li>
          </ul>
        </div>

        <p className="text-gray-400 mb-8">
          Your answers will be cross-referenced with your goalie&apos;s self-assessment to identify
          alignment and areas where additional support may help.
        </p>

        {/* Continue button */}
        <Button
          size="lg"
          onClick={onContinue}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-10 py-6 text-lg rounded-xl shadow-lg shadow-red-500/20 transition-all hover:scale-105"
        >
          Continue to Assessment
          <ChevronRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
