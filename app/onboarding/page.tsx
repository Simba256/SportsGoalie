'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useParentOnboarding } from '@/hooks/useParentOnboarding';
import {
  OnboardingContainer,
  WelcomeScreen,
  IntakeScreen,
  BridgeMessage,
  CategoryIntro,
  AssessmentQuestion,
  OnboardingProgress,
  AssessmentComplete,
  ParentWelcomeScreen,
  ParentBridgeMessage,
  ParentAssessmentComplete,
} from '@/components/onboarding';

/**
 * Main onboarding evaluation page.
 * Supports both goalie (student) and parent flows.
 * Full-screen immersive flow with 7-category, 1.0-4.0 scoring system.
 */
function OnboardingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, refreshUser } = useAuth();

  // Determine if this is a parent onboarding flow
  const isParent = user?.role === 'parent' || searchParams.get('role') === 'parent';

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [authLoading, user, router]);

  // Redirect if already completed onboarding (goalie)
  useEffect(() => {
    if (!authLoading && user && !isParent && user.onboardingCompleted) {
      router.push('/dashboard');
    }
  }, [authLoading, user, isParent, router]);

  // Redirect if already completed onboarding (parent)
  useEffect(() => {
    if (!authLoading && user && isParent && user.parentOnboardingComplete) {
      router.push('/parent');
    }
  }, [authLoading, user, isParent, router]);

  // Goalie onboarding hook
  const goalieOnboarding = useOnboarding({
    userId: user?.id || null,
    studentName: user?.displayName || 'Student',
    enabled: !authLoading && !!user && !isParent && !user?.onboardingCompleted,
    onRefreshUser: refreshUser,
  });

  // Parent onboarding hook
  const parentOnboarding = useParentOnboarding({
    userId: user?.id || null,
    parentName: user?.displayName || 'Parent',
    enabled: !authLoading && !!user && isParent && !user?.parentOnboardingComplete,
    onRefreshUser: refreshUser,
  });

  // Pick the active hook based on role
  const onboarding = isParent ? parentOnboarding : goalieOnboarding;
  const hookEnabled = !authLoading && !!user && (
    isParent
      ? !user.parentOnboardingComplete
      : !user.onboardingCompleted
  );

  const {
    phase,
    loading,
    error,
    evaluation,
    currentIntakeScreen,
    intakeScreenQuestions,
    intakeResponses,
    intakeData,
    currentCategoryIndex,
    currentQuestionIndex,
    currentCategory,
    currentQuestion,
    categoryQuestions,
    totalIntakeScreens,
    questionProgress,
    beginOnboarding,
    answerIntake,
    nextIntakeScreen,
    previousIntakeScreen,
    startCategory,
    answerQuestion,
    previousQuestion,
    goToDashboard,
  } = onboarding;

  const selectedOptionId =
    currentQuestion && evaluation
      ? (() => {
          const response = evaluation.assessmentResponses.find(
            (r) => r.questionId === currentQuestion.id
          );
          return typeof response?.value === 'string' ? response.value : null;
        })()
      : null;

  const canGoBackInAssessment = currentCategoryIndex > 0 || currentQuestionIndex > 0;

  // Error state - check BEFORE loading to show errors properly
  if (error) {
    return (
      <OnboardingContainer>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
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
            <Loader2 className="w-12 h-12 animate-spin text-red-500 mx-auto mb-4" />
            <p className="text-gray-400">Loading your evaluation...</p>
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
          <OnboardingProgress
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
          isParent ? (
            <ParentWelcomeScreen
              parentName={user.displayName?.split(' ')[0] || 'Parent'}
              onBegin={beginOnboarding}
            />
          ) : (
            <WelcomeScreen
              studentName={user.displayName?.split(' ')[0] || 'Student'}
              onBegin={beginOnboarding}
            />
          )
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
        {phase === 'bridge' && user && (
          isParent ? (
            <ParentBridgeMessage
              parentName={user.displayName?.split(' ')[0] || 'Parent'}
              onContinue={startCategory}
            />
          ) : (
            intakeData ? (
              <BridgeMessage
                studentName={user.displayName?.split(' ')[0] || 'Student'}
                ageRange={intakeData.ageRange}
                experienceLevel={intakeData.experienceLevel}
                primaryReasons={intakeData.primaryReasons}
                onContinue={startCategory}
              />
            ) : null
          )
        )}

        {/* Category Introduction */}
        {phase === 'category_intro' && currentCategory && (
          <CategoryIntro
            categorySlug={currentCategory.slug as any}
            categoryName={currentCategory.name}
            categoryDescription={currentCategory.description}
            questionCount={categoryQuestions.length}
            categoryIndex={currentCategoryIndex}
            totalCategories={onboarding.totalCategories}
            onStart={startCategory}
          />
        )}

        {/* Assessment Question */}
        {phase === 'question' && currentQuestion && currentCategory && (
          <div className="flex-1 flex items-center justify-center p-6">
            <AssessmentQuestion
              key={currentQuestion.id}
              question={currentQuestion}
              categoryName={currentCategory.shortName}
              categoryColor={currentCategory.color}
              questionNumber={currentQuestionIndex + 1}
              totalQuestionsInCategory={categoryQuestions.length}
              initialSelectedOptionId={selectedOptionId}
              onAnswer={(optionId, score) => answerQuestion(currentQuestion.id, optionId, score)}
              onBack={previousQuestion}
              canGoBack={canGoBackInAssessment}
              disabled={loading}
            />
          </div>
        )}

        {/* Assessment Complete */}
        {phase === 'profile' && (
          isParent ? (
            <ParentAssessmentComplete
              parentName={user?.displayName?.split(' ')[0]}
              onContinue={goToDashboard}
            />
          ) : (
            <AssessmentComplete
              studentName={user?.displayName?.split(' ')[0]}
              onContinue={goToDashboard}
            />
          )
        )}
      </div>
    </OnboardingContainer>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <OnboardingContainer>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-red-500 mx-auto mb-4" />
              <p className="text-gray-400">Loading your evaluation...</p>
            </div>
          </div>
        </OnboardingContainer>
      }
    >
      <OnboardingPageContent />
    </Suspense>
  );
}
