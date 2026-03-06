'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { useOnboardingV2 } from '@/hooks/useOnboardingV2';
import {
  OnboardingContainer,
  WelcomeScreenV2,
  IntakeScreen,
  BridgeMessage,
  CategoryIntro,
  AssessmentQuestionV2,
  OnboardingProgressV2,
  IntelligenceProfileView,
} from '@/components/onboarding';

/**
 * Main onboarding evaluation page (V2).
 * Full-screen immersive flow with new 7-category, 1.0-4.0 scoring system.
 */
export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();

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
    currentIntakeScreen,
    intakeScreenQuestions,
    intakeResponses,
    intakeData,
    currentCategoryIndex,
    currentQuestionIndex,
    currentCategory,
    currentQuestion,
    categoryQuestions,
    intelligenceProfile,
    totalIntakeScreens,
    totalCategories,
    questionProgress,
    beginOnboarding,
    answerIntake,
    nextIntakeScreen,
    previousIntakeScreen,
    startCategory,
    answerQuestion,
    goToDashboard,
  } = useOnboardingV2({
    userId: user?.id || null,
    studentName: user?.displayName || 'Student',
    enabled: !authLoading && !!user && !user.onboardingCompleted,
    onRefreshUser: refreshUser,
  });

  // Determine if hook is actually enabled
  const hookEnabled = !authLoading && !!user && !user.onboardingCompleted;

  // Error state - check BEFORE loading to show errors properly
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

  // Loading state
  if (authLoading || (hookEnabled && (loading || phase === 'loading'))) {
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

  return (
    <OnboardingContainer>
      {/* Progress bar (shown during intake and assessment phases) */}
      {(phase === 'intake' || phase === 'question' || phase === 'category_intro') && (
        <div className="p-4 sm:p-6">
          <OnboardingProgressV2
            phase={phase === 'category_intro' || phase === 'question' ? 'assessment' : phase}
            currentIntakeScreen={currentIntakeScreen}
            totalIntakeScreens={totalIntakeScreens}
            currentCategoryIndex={currentCategoryIndex}
            currentQuestionIndex={currentQuestionIndex}
            questionProgress={questionProgress}
          />
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Welcome Screen */}
        {phase === 'welcome' && user && (
          <WelcomeScreenV2
            studentName={user.displayName?.split(' ')[0] || 'Student'}
            onBegin={beginOnboarding}
          />
        )}

        {/* Intake Screen */}
        {phase === 'intake' && (
          <IntakeScreen
            screen={currentIntakeScreen}
            totalScreens={totalIntakeScreens}
            questions={intakeScreenQuestions}
            responses={intakeResponses}
            onAnswer={answerIntake}
            onNext={nextIntakeScreen}
            onBack={previousIntakeScreen}
            loading={loading}
          />
        )}

        {/* Bridge Message */}
        {phase === 'bridge' && intakeData && user && (
          <BridgeMessage
            studentName={user.displayName?.split(' ')[0] || 'Student'}
            ageRange={intakeData.ageRange}
            experienceLevel={intakeData.experienceLevel}
            primaryReasons={intakeData.primaryReasons}
            onContinue={startCategory}
          />
        )}

        {/* Category Introduction */}
        {phase === 'category_intro' && currentCategory && (
          <CategoryIntro
            categorySlug={currentCategory.slug as any}
            categoryName={currentCategory.name}
            categoryDescription={currentCategory.description}
            questionCount={categoryQuestions.length}
            categoryIndex={currentCategoryIndex}
            totalCategories={totalCategories}
            onStart={startCategory}
          />
        )}

        {/* Assessment Question */}
        {phase === 'question' && currentQuestion && currentCategory && (
          <div className="flex-1 flex items-center justify-center p-6">
            <AssessmentQuestionV2
              question={currentQuestion}
              categoryName={currentCategory.shortName}
              categoryColor={currentCategory.color}
              questionNumber={currentQuestionIndex + 1}
              totalQuestionsInCategory={categoryQuestions.length}
              onAnswer={(optionId, score) => answerQuestion(currentQuestion.id, optionId, score)}
            />
          </div>
        )}

        {/* Intelligence Profile */}
        {phase === 'profile' && intelligenceProfile && (
          <IntelligenceProfileView
            profile={intelligenceProfile}
            ageRange={intakeData?.ageRange}
            onContinue={goToDashboard}
          />
        )}
      </div>
    </OnboardingContainer>
  );
}
