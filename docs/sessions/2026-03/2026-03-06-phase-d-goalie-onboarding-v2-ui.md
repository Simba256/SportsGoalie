# Session: Phase D - Goalie Onboarding V2 UI Integration

**Date:** 2026-03-06
**Duration:** ~1.5 hours
**Phase:** Phase 2 - Michael's Scoring Foundation
**Focus:** Integrate V2 scoring system into goalie onboarding UI

## Goals

- [x] Update onboarding service with V2 methods
- [x] Create useOnboardingV2 hook for new flow
- [x] Create V2 UI components for onboarding
- [x] Replace main onboarding page with V2 flow
- [x] Verify build passes

## Work Completed

### 1. Updated Onboarding Service (`src/lib/database/services/onboarding.service.ts`)

Added new V2 methods to the service:
- `createEvaluationV2()` - Creates V2 evaluation with version flag
- `getEvaluationV2()` - Retrieves V2 evaluation
- `saveIntakeResponse()` - Saves intake (Front Door) responses
- `completeIntake()` - Completes intake phase, extracts key data
- `startAssessment()` - Transitions to assessment phase
- `saveAssessmentResponseV2()` - Saves assessment responses with 1.0-4.0 scoring
- `completeEvaluationV2()` - Completes assessment, generates intelligence profile
- `updatePhaseV2()` - Updates evaluation phase

### 2. Created useOnboardingV2 Hook (`src/hooks/useOnboardingV2.ts`)

New hook managing V2 onboarding flow with phases:
- `loading` - Initial load
- `welcome` - Entry point
- `intake` - Front Door intake questions (4 screens)
- `bridge` - Personalized bridge message
- `category_intro` - Introduction for each category
- `question` - Assessment questions
- `profile` - Intelligence Profile reveal
- `complete` - Redirect to dashboard

Features:
- Tracks intake screen progress (0-3)
- Tracks category index (0-6) and question index
- Manages intake and assessment responses
- Handles resume functionality
- Auto-saves progress

### 3. Created V2 Components

| Component | File | Description |
|-----------|------|-------------|
| WelcomeScreenV2 | `welcome-screen-v2.tsx` | Updated welcome with 7 category preview |
| IntakeScreen | `intake-screen.tsx` | Displays intake questions per screen, handles single/multi-select |
| BridgeMessage | `bridge-message.tsx` | Personalized transition message based on intake responses |
| CategoryIntro | `category-intro.tsx` | Brief intro before each assessment category |
| AssessmentQuestionV2 | `assessment-question-v2.tsx` | Question component with 1.0-4.0 scoring |
| OnboardingProgressV2 | `onboarding-progress-v2.tsx` | Progress indicator for intake + 7 categories |
| IntelligenceProfileView | `intelligence-profile-view.tsx` | Displays generated profile with scores, strengths, gaps |

### 4. Updated Main Onboarding Page

Replaced `app/onboarding/page.tsx` to use V2 flow:
- Uses `useOnboardingV2` hook
- Renders appropriate component for each phase
- Shows progress indicator during intake and assessment
- Handles resume from any phase

### 5. Updated Exports

Updated `src/components/onboarding/index.ts` with all V2 component exports while keeping legacy components for backward compatibility.

## Files Modified

| File | Change Type |
|------|-------------|
| `src/lib/database/services/onboarding.service.ts` | Modified - Added V2 methods |
| `src/hooks/useOnboardingV2.ts` | **New** |
| `src/components/onboarding/welcome-screen-v2.tsx` | **New** |
| `src/components/onboarding/intake-screen.tsx` | **New** |
| `src/components/onboarding/bridge-message.tsx` | **New** |
| `src/components/onboarding/category-intro.tsx` | **New** |
| `src/components/onboarding/assessment-question-v2.tsx` | **New** |
| `src/components/onboarding/onboarding-progress-v2.tsx` | **New** |
| `src/components/onboarding/intelligence-profile-view.tsx` | **New** |
| `src/components/onboarding/index.ts` | Modified - Added V2 exports |
| `app/onboarding/page.tsx` | Modified - V2 flow integration |

## V2 Onboarding Flow

```
[Welcome]
    ↓
[Intake Screen 1] → Tell us about you (age, experience)
    ↓
[Intake Screen 2] → Where are you playing? (level, goalie coach)
    ↓
[Intake Screen 3] → What brought you here? (multi-select reasons)
    ↓
[Intake Screen 4] → One more thing (training, awareness)
    ↓
[Bridge Message] → Personalized transition
    ↓
[Category 1: Feelings] → Intro → 4 questions
    ↓
[Category 2: Knowledge] → Intro → 4 questions
    ↓
[Category 3: Pre-Game] → Intro → 4 questions
    ↓
[Category 4: In-Game] → Intro → 4 questions
    ↓
[Category 5: Post-Game] → Intro → 4 questions
    ↓
[Category 6: Training] → Intro → 4 questions
    ↓
[Category 7: Learning] → Intro → 4 questions
    ↓
[Intelligence Profile] → Score visualization, strengths, gaps
    ↓
[Dashboard]
```

## Technical Details

### Scoring System
- 1.0-4.0 continuous scale per response
- Category weights: Feelings (15%), Knowledge (25%), Pre-Game (10%), In-Game (25%), Post-Game (10%), Training (10%), Learning (5%)
- Pacing levels: Introduction (1.0-2.2), Development (2.2-3.1), Refinement (3.1-4.0)

### Data Flow
- Intake responses extracted for: age range, experience level, playing level, goalie coach status, primary reasons
- Assessment responses saved with category slug and score
- Intelligence profile generated using `generateGoalieIntelligenceProfile()`
- Profile includes: overall score, pacing level, category scores, strengths, gaps, recommendations

## Verification

- [x] Build passes (`npm run build`)
- [ ] Manual flow test (pending deployment)
- [ ] Resume functionality test
- [ ] Playwright tests update

## Next Steps

1. Manual testing of complete onboarding flow
2. Update Playwright tests for V2 flow
3. Test resume functionality (refresh mid-flow)
4. Verify intelligence profile calculation accuracy
5. Consider adding PIPEDA consent flow for under-13

## Blockers

None

## Notes

- Legacy onboarding components kept for backward compatibility
- Legacy `useOnboarding.ts` hook still exists but not used by main page
- V2 evaluations stored with `eval_v2_{userId}` ID pattern
- Build time: ~24 seconds with Turbopack
