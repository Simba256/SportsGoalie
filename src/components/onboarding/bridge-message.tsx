'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { GoalieAgeRange } from '@/types';
import { ChevronRight, Target, Sparkles, CheckCircle2 } from 'lucide-react';

interface BridgeMessageProps {
  studentName: string;
  ageRange?: GoalieAgeRange;
  experienceLevel?: string;
  primaryReasons?: string[];
  onContinue: () => void;
}

/**
 * Reason ID to display text mapping
 */
const REASON_DISPLAY: Record<string, string> = {
  'reason-get-better': 'getting better at your position',
  'reason-learn-right': 'learning the right way to play goalie',
  'reason-struggling': 'working through challenges in your game',
  'reason-structure': 'having structured training you can do on your own',
  'reason-understand': 'understanding your strengths and areas to work on',
  'reason-referred': 'what your parent or coach told you about',
  'reason-next-level': 'taking your game to the next level',
  'reason-exploring': 'checking out what this is all about',
};

/**
 * Experience level display text
 */
const EXPERIENCE_DISPLAY: Record<string, string> = {
  'new': "You're just getting started as a goalie — and that's an exciting place to be.",
  'less_than_1_season': "You've got a bit of experience under your belt.",
  '1_to_3_seasons': "You've been at this for a while now and have some experience.",
  '4_plus_seasons': "You're a veteran between the pipes with plenty of games behind you.",
};

/**
 * Personalized bridge message between intake and assessment.
 * Acknowledges the goalie's reasons for joining and sets expectations.
 */
export function BridgeMessage({
  studentName,
  ageRange,
  experienceLevel,
  primaryReasons = [],
  onContinue,
}: BridgeMessageProps) {
  // Get experience message
  const experienceMessage = useMemo(() => {
    if (!experienceLevel) return '';
    return EXPERIENCE_DISPLAY[experienceLevel] || '';
  }, [experienceLevel]);

  // Get formatted reasons (max 3)
  const formattedReasons = useMemo(() => {
    const reasons = primaryReasons.slice(0, 3).map(id => REASON_DISPLAY[id]).filter(Boolean);
    if (reasons.length === 0) return 'improving your goaltending skills';
    if (reasons.length === 1) return reasons[0];
    if (reasons.length === 2) return `${reasons[0]} and ${reasons[1]}`;
    return `${reasons[0]}, ${reasons[1]}, and ${reasons[2]}`;
  }, [primaryReasons]);

  // Determine tone based on age
  const isYounger = ageRange === '8-10' || ageRange === '11-13';

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        {/* Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/30">
            <Sparkles className="w-10 h-10 text-cyan-400" />
          </div>
        </div>

        {/* Greeting */}
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6">
          {isYounger ? (
            <>Got it, {studentName}!</>
          ) : (
            <>Thanks, {studentName}.</>
          )}
        </h1>

        {/* Experience acknowledgment */}
        {experienceMessage && (
          <p className="text-lg text-slate-300 mb-4">
            {experienceMessage}
          </p>
        )}

        {/* Reasons acknowledgment */}
        <p className="text-lg text-slate-300 mb-8">
          {isYounger ? (
            <>
              It sounds like you're interested in <span className="text-cyan-400 font-medium">{formattedReasons}</span>.
              {' '}That's exactly what Smarter Goalie is here to help with.
            </>
          ) : (
            <>
              You're here for <span className="text-cyan-400 font-medium">{formattedReasons}</span> —
              and that's exactly what Smarter Goalie is built to help you with.
            </>
          )}
        </p>

        {/* Assessment explanation box */}
        <div className="bg-slate-800/50 rounded-xl p-6 mb-8 text-left">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            {isYounger ? "What's next?" : "Now let's get to know your game."}
          </h3>

          <p className="text-slate-300 mb-4">
            {isYounger ? (
              "We're going to ask you some questions about how you play goalie — things like how you feel about games, what you do during practice, and how you think about your position."
            ) : (
              "The next section will ask you questions across 7 areas of your goaltending. This isn't a test — there are no wrong answers. We're trying to understand where you are today so we can personalize your experience."
            )}
          </p>

          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-slate-400">
              <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
              <span>7 categories covering different parts of goaltending</span>
            </li>
            <li className="flex items-start gap-2 text-slate-400">
              <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
              <span>28 quick questions — all multiple choice</span>
            </li>
            <li className="flex items-start gap-2 text-slate-400">
              <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
              <span>No right or wrong answers — just be honest</span>
            </li>
            <li className="flex items-start gap-2 text-slate-400">
              <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
              <span>Your progress is saved if you need to take a break</span>
            </li>
          </ul>
        </div>

        {/* Encouragement based on experience */}
        <p className="text-slate-400 mb-8">
          {isYounger ? (
            "Take your time with each question. There's no rush, and your answers help us help you!"
          ) : (
            "Your answers will help us build your Intelligence Profile and customize your learning path."
          )}
        </p>

        {/* Continue button */}
        <Button
          size="lg"
          onClick={onContinue}
          className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold px-10 py-6 text-lg rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
        >
          {isYounger ? "Let's Go!" : "Continue to Assessment"}
          <ChevronRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
