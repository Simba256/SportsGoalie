'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { useOnboarding } from '@/hooks/useOnboarding';
import {
  OnboardingContainer,
  OnboardingProgress,
  WelcomeScreen,
  PillarIntro,
  RatingQuestion,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  VideoScenarioQuestion,
  ResultsScreen,
} from '@/components/onboarding';
import { getQuestionCountByPillar } from '@/data/onboarding-questions';

/**
 * Main onboarding evaluation page.
 * Full-screen immersive flow through the 6 Goalie Pillars.
 */
export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // Redirect if already completed onboarding
  useEffect(() => {
    if (!authLoading && user?.onboardingCompleted) {
      router.push('/dashboard');
    }
  }, [authLoading, user, router]);

  const {
    phase,
    loading,
    error,
    evaluation,
    currentPillarIndex,
    currentPillar,
    currentQuestion,
    completedPillars,
    questionProgress,
    beginEvaluation,
    startPillar,
    answerQuestion,
    goToDashboard,
  } = useOnboarding({
    userId: user?.id || null,
    studentName: user?.displayName || 'Student',
    enabled: !authLoading && !!user && !user.onboardingCompleted,
  });

  // Loading state
  if (authLoading || loading || phase === 'loading') {
    return (
      <OnboardingContainer>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="text-slate-400">Loading your evaluation...</p>
          </div>
        </div>
      </OnboardingContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <OnboardingContainer>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </OnboardingContainer>
    );
  }

  // Question counts for pillar intros
  const questionCounts = getQuestionCountByPillar();

  return (
    <OnboardingContainer>
      {/* Progress bar (hidden on welcome and results) */}
      {phase !== 'welcome' && phase !== 'results' && phase !== 'complete' && (
        <div className="p-4 sm:p-6">
          <OnboardingProgress
            currentPillarIndex={currentPillarIndex}
            completedPillars={completedPillars}
          />

          {/* Question counter */}
          {phase === 'question' && (
            <div className="text-center mt-4">
              <span className="text-sm text-slate-500">
                Question {questionProgress.current + 1} of {questionProgress.total}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Welcome Screen */}
        {phase === 'welcome' && user && (
          <WelcomeScreen
            studentName={user.displayName?.split(' ')[0] || 'Student'}
            onBegin={beginEvaluation}
          />
        )}

        {/* Pillar Introduction */}
        {phase === 'pillar_intro' && currentPillar && (
          <PillarIntro
            pillar={currentPillar}
            pillarIndex={currentPillarIndex}
            questionCount={questionCounts[currentPillar.slug] || 0}
            onContinue={startPillar}
          />
        )}

        {/* Question */}
        {phase === 'question' && currentQuestion && (
          <div className="flex-1 flex items-center justify-center p-6">
            {currentQuestion.type === 'rating' && (
              <RatingQuestion
                key={currentQuestion.id}
                question={currentQuestion}
                onAnswer={(value, points) => answerQuestion(value, points)}
              />
            )}

            {currentQuestion.type === 'multiple_choice' && (
              <MultipleChoiceQuestion
                key={currentQuestion.id}
                question={currentQuestion}
                onAnswer={(optionId, points) => answerQuestion(optionId, points)}
              />
            )}

            {currentQuestion.type === 'true_false' && (
              <TrueFalseQuestion
                key={currentQuestion.id}
                question={currentQuestion}
                onAnswer={(optionId, points) => answerQuestion(optionId, points)}
              />
            )}

            {currentQuestion.type === 'video_scenario' && (
              <VideoScenarioQuestion
                key={currentQuestion.id}
                question={currentQuestion}
                onAnswer={(optionId, points) => answerQuestion(optionId, points)}
              />
            )}
          </div>
        )}

        {/* Results Screen */}
        {phase === 'results' && evaluation && (
          <ResultsScreen
            evaluation={evaluation}
            onContinue={goToDashboard}
          />
        )}
      </div>
    </OnboardingContainer>
  );
}
