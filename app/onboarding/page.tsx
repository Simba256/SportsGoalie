'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SkeletonContentPage } from '@/components/ui/skeletons';
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

  // Error state
  if (error) {
    return (
      <OnboardingContainer>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ textAlign: 'center', maxWidth: '420px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#f87171">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Something went wrong</h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: '11px 24px', background: 'linear-gradient(135deg, #f87171, #ef4444)', border: 'none', color: '#fff', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
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
        <div style={{ flex: 1, padding: '24px' }}>
          <SkeletonContentPage />
        </div>
      </OnboardingContainer>
    );
  }

  return (
    <OnboardingContainer>
      {/* Progress bar (shown during intake and assessment phases) */}
      {(phase === 'intake' || phase === 'question' || phase === 'category_intro') && (
        <div style={{ padding: '24px 24px 12px' }}>
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

      {/* Main content area — minHeight:0 completes the flex chain so children can constrain their height */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
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
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '12px 40px 20px', overflow: 'hidden', justifyContent: 'center' }}>
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
          <div className="flex-1 p-6">
            <SkeletonContentPage />
          </div>
        </OnboardingContainer>
      }
    >
      <OnboardingPageContent />
    </Suspense>
  );
}
