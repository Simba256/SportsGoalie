import { OnboardingQuestion, PillarSlug } from '@/types';

/**
 * Ice Hockey Goalie Onboarding Assessment Questions
 *
 * ~4-5 questions per pillar = ~27 total questions
 * Mix of rating scales, multiple choice, true/false, and video scenarios
 */
export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  // ===========================================
  // PILLAR 1: MINDSET DEVELOPMENT
  // ===========================================
  {
    id: 'mindset-1',
    pillarSlug: 'mindset',
    type: 'rating',
    question: 'How well do you handle letting in a goal during a game?',
    description: 'Think about your typical emotional response after allowing a goal.',
    ratingMin: 1,
    ratingMax: 5,
    ratingLabels: {
      min: 'I get very upset and it affects my next saves',
      max: 'I stay focused and move on quickly',
    },
    maxPoints: 5,
    order: 1,
  },
  {
    id: 'mindset-2',
    pillarSlug: 'mindset',
    type: 'rating',
    question: 'Rate your ability to stay focused during high-pressure moments.',
    description: 'Such as penalty shots, overtime, or tight games.',
    ratingMin: 1,
    ratingMax: 5,
    ratingLabels: {
      min: 'I often feel overwhelmed',
      max: 'I thrive under pressure',
    },
    maxPoints: 5,
    order: 2,
  },
  {
    id: 'mindset-3',
    pillarSlug: 'mindset',
    type: 'rating',
    question: 'How confident are you in your abilities before a game?',
    description: 'Consider your typical mindset during warm-ups.',
    ratingMin: 1,
    ratingMax: 5,
    ratingLabels: {
      min: 'I often doubt myself',
      max: 'I feel fully confident and ready',
    },
    maxPoints: 5,
    order: 3,
  },
  {
    id: 'mindset-4',
    pillarSlug: 'mindset',
    type: 'multiple_choice',
    question: 'When you make a mistake, what is your first instinct?',
    options: [
      { id: 'a', text: 'Blame myself and dwell on the error', points: 1 },
      { id: 'b', text: 'Get frustrated with teammates or circumstances', points: 2 },
      { id: 'c', text: 'Acknowledge it and try to do better next time', points: 4 },
      { id: 'd', text: 'Use it as immediate learning and refocus', points: 5 },
    ],
    maxPoints: 5,
    order: 4,
  },
  {
    id: 'mindset-5',
    pillarSlug: 'mindset',
    type: 'multiple_choice',
    question: 'How do you prepare mentally before a game?',
    options: [
      { id: 'a', text: 'I don\'t have a specific routine', points: 1 },
      { id: 'b', text: 'I try to relax but nothing consistent', points: 2 },
      { id: 'c', text: 'I have a basic routine I follow', points: 4 },
      { id: 'd', text: 'I have a detailed pre-game mental preparation routine', points: 5 },
    ],
    maxPoints: 5,
    order: 5,
  },

  // ===========================================
  // PILLAR 2: SKATING AS A SKILL
  // ===========================================
  {
    id: 'skating-1',
    pillarSlug: 'skating',
    type: 'rating',
    question: 'How comfortable are you moving laterally in your crease?',
    description: 'T-pushes, shuffles, and lateral movements.',
    ratingMin: 1,
    ratingMax: 5,
    ratingLabels: {
      min: 'I struggle with lateral movement',
      max: 'Very smooth and controlled',
    },
    maxPoints: 5,
    order: 1,
  },
  {
    id: 'skating-2',
    pillarSlug: 'skating',
    type: 'rating',
    question: 'Rate your ability to recover after going down (butterfly recovery).',
    description: 'How quickly and efficiently can you get back to your feet?',
    ratingMin: 1,
    ratingMax: 5,
    ratingLabels: {
      min: 'Recovery is slow and difficult',
      max: 'Quick and effortless recovery',
    },
    maxPoints: 5,
    order: 2,
  },
  {
    id: 'skating-3',
    pillarSlug: 'skating',
    type: 'multiple_choice',
    question: 'How often do you work on skating drills specific to goaltending?',
    options: [
      { id: 'a', text: 'Rarely or never', points: 1 },
      { id: 'b', text: 'Occasionally during team practice', points: 2 },
      { id: 'c', text: 'Regularly during practices', points: 4 },
      { id: 'd', text: 'Dedicated skating sessions weekly', points: 5 },
    ],
    maxPoints: 5,
    order: 3,
  },
  {
    id: 'skating-4',
    pillarSlug: 'skating',
    type: 'multiple_choice',
    question: 'Which skating technique do you find most challenging?',
    description: 'This helps us identify areas for focus.',
    options: [
      { id: 'a', text: 'C-cuts and arc movements', points: 3 },
      { id: 'b', text: 'T-pushes across the crease', points: 3 },
      { id: 'c', text: 'Backward skating and positioning', points: 3 },
      { id: 'd', text: 'All techniques feel comfortable', points: 5 },
    ],
    maxPoints: 5,
    order: 4,
  },
  {
    id: 'skating-5',
    pillarSlug: 'skating',
    type: 'video_scenario',
    question: 'Watch this goalie movement. What technique is being demonstrated?',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder
    options: [
      { id: 'a', text: 'Butterfly slide', points: 0 },
      { id: 'b', text: 'T-push', points: 5 },
      { id: 'c', text: 'Shuffle step', points: 0 },
      { id: 'd', text: 'C-cut', points: 0 },
    ],
    maxPoints: 5,
    order: 5,
  },

  // ===========================================
  // PILLAR 3: FORM & STRUCTURE
  // ===========================================
  {
    id: 'form-1',
    pillarSlug: 'form',
    type: 'rating',
    question: 'How consistent is your butterfly form?',
    description: 'Knees together, pads flat, hands in position.',
    ratingMin: 1,
    ratingMax: 5,
    ratingLabels: {
      min: 'Inconsistent with gaps',
      max: 'Tight and consistent every time',
    },
    maxPoints: 5,
    order: 1,
  },
  {
    id: 'form-2',
    pillarSlug: 'form',
    type: 'rating',
    question: 'Rate your glove and blocker positioning in your stance.',
    description: 'Are they consistently in the correct position?',
    ratingMin: 1,
    ratingMax: 5,
    ratingLabels: {
      min: 'Often out of position',
      max: 'Always properly positioned',
    },
    maxPoints: 5,
    order: 2,
  },
  {
    id: 'form-3',
    pillarSlug: 'form',
    type: 'multiple_choice',
    question: 'Where should your weight be in your ready stance?',
    options: [
      { id: 'a', text: 'On my heels', points: 1 },
      { id: 'b', text: 'Evenly distributed', points: 3 },
      { id: 'c', text: 'On the balls of my feet', points: 5 },
      { id: 'd', text: 'On my toes', points: 2 },
    ],
    maxPoints: 5,
    order: 3,
  },
  {
    id: 'form-4',
    pillarSlug: 'form',
    type: 'video_scenario',
    question: 'Watch this stance. What needs improvement?',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder
    options: [
      { id: 'a', text: 'Glove is too low', points: 5 },
      { id: 'b', text: 'Knees are too straight', points: 0 },
      { id: 'c', text: 'Stance is too narrow', points: 0 },
      { id: 'd', text: 'Everything looks correct', points: 0 },
    ],
    maxPoints: 5,
    order: 4,
  },
  {
    id: 'form-5',
    pillarSlug: 'form',
    type: 'true_false',
    question: 'In butterfly position, small gaps between your pads and ice are acceptable.',
    options: [
      { id: 'true', text: 'True', points: 0 },
      { id: 'false', text: 'False', points: 5 },
    ],
    maxPoints: 5,
    order: 5,
  },

  // ===========================================
  // PILLAR 4: POSITIONAL SYSTEMS
  // ===========================================
  {
    id: 'positioning-1',
    pillarSlug: 'positioning',
    type: 'rating',
    question: 'How well do you understand angle play and cutting down angles?',
    ratingMin: 1,
    ratingMax: 5,
    ratingLabels: {
      min: 'Not very familiar with the concept',
      max: 'Strong understanding and application',
    },
    maxPoints: 5,
    order: 1,
  },
  {
    id: 'positioning-2',
    pillarSlug: 'positioning',
    type: 'multiple_choice',
    question: 'When a shooter is at the top of the circle, where should you position yourself?',
    options: [
      { id: 'a', text: 'At the goal line', points: 1 },
      { id: 'b', text: 'At the top of the crease', points: 5 },
      { id: 'c', text: 'Halfway between crease and goal line', points: 3 },
      { id: 'd', text: 'Outside the crease', points: 2 },
    ],
    maxPoints: 5,
    order: 2,
  },
  {
    id: 'positioning-3',
    pillarSlug: 'positioning',
    type: 'multiple_choice',
    question: 'What determines your depth in the crease?',
    options: [
      { id: 'a', text: 'Personal preference', points: 1 },
      { id: 'b', text: 'Distance and angle of the puck', points: 5 },
      { id: 'c', text: 'Whether it\'s a power play', points: 2 },
      { id: 'd', text: 'The score of the game', points: 1 },
    ],
    maxPoints: 5,
    order: 3,
  },
  {
    id: 'positioning-4',
    pillarSlug: 'positioning',
    type: 'video_scenario',
    question: 'In this play, is the goalie positioned correctly?',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder
    options: [
      { id: 'a', text: 'Yes, perfect position', points: 0 },
      { id: 'b', text: 'Too deep in the crease', points: 5 },
      { id: 'c', text: 'Too far out', points: 0 },
      { id: 'd', text: 'Off angle to the shooter', points: 0 },
    ],
    maxPoints: 5,
    order: 4,
  },
  {
    id: 'positioning-5',
    pillarSlug: 'positioning',
    type: 'true_false',
    question: 'You should always challenge the shooter by moving as far out as possible.',
    options: [
      { id: 'true', text: 'True', points: 0 },
      { id: 'false', text: 'False', points: 5 },
    ],
    maxPoints: 5,
    order: 5,
  },

  // ===========================================
  // PILLAR 5: 7 POINT SYSTEM BELOW ICING LINE
  // ===========================================
  {
    id: 'seven_point-1',
    pillarSlug: 'seven_point',
    type: 'multiple_choice',
    question: 'How familiar are you with the "7 Point System" for below the goal line play?',
    options: [
      { id: 'a', text: 'Never heard of it', points: 1 },
      { id: 'b', text: 'I\'ve heard of it but don\'t really understand it', points: 2 },
      { id: 'c', text: 'I understand the basics', points: 4 },
      { id: 'd', text: 'I know it well and use it in games', points: 5 },
    ],
    maxPoints: 5,
    order: 1,
  },
  {
    id: 'seven_point-2',
    pillarSlug: 'seven_point',
    type: 'multiple_choice',
    question: 'When the puck is behind the goal line in the corner, what is your primary concern?',
    options: [
      { id: 'a', text: 'Watching only the puck', points: 1 },
      { id: 'b', text: 'Positioning for a wraparound', points: 3 },
      { id: 'c', text: 'Reading potential passing lanes', points: 5 },
      { id: 'd', text: 'Staying deep in the crease', points: 2 },
    ],
    maxPoints: 5,
    order: 2,
  },
  {
    id: 'seven_point-3',
    pillarSlug: 'seven_point',
    type: 'video_scenario',
    question: 'Watch this below-the-line play. What should the goalie do next?',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder
    options: [
      { id: 'a', text: 'Push to far post', points: 5 },
      { id: 'b', text: 'Stay centered', points: 0 },
      { id: 'c', text: 'Drop into butterfly', points: 0 },
      { id: 'd', text: 'Challenge out of crease', points: 0 },
    ],
    maxPoints: 5,
    order: 3,
  },
  {
    id: 'seven_point-4',
    pillarSlug: 'seven_point',
    type: 'video_scenario',
    question: 'Identify the coverage point the goalie should be at in this scenario.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder
    options: [
      { id: 'a', text: 'Point 1 - Near post tight', points: 0 },
      { id: 'b', text: 'Point 3 - Short side above crease', points: 5 },
      { id: 'c', text: 'Point 5 - Center crease', points: 0 },
      { id: 'd', text: 'Point 7 - Far post', points: 0 },
    ],
    maxPoints: 5,
    order: 4,
  },
  {
    id: 'seven_point-5',
    pillarSlug: 'seven_point',
    type: 'multiple_choice',
    question: 'What is the biggest risk when the puck is behind your net?',
    options: [
      { id: 'a', text: 'Wraparound attempts', points: 3 },
      { id: 'b', text: 'Quick passes to the slot', points: 5 },
      { id: 'c', text: 'Shots from the point', points: 1 },
      { id: 'd', text: 'Offsides', points: 0 },
    ],
    maxPoints: 5,
    order: 5,
  },

  // ===========================================
  // PILLAR 6: GAME/PRACTICE/OFF-ICE
  // ===========================================
  {
    id: 'training-1',
    pillarSlug: 'training',
    type: 'rating',
    question: 'How consistent is your off-ice training routine?',
    description: 'Stretching, strength training, reaction drills.',
    ratingMin: 1,
    ratingMax: 5,
    ratingLabels: {
      min: 'No regular off-ice routine',
      max: 'Consistent daily/weekly routine',
    },
    maxPoints: 5,
    order: 1,
  },
  {
    id: 'training-2',
    pillarSlug: 'training',
    type: 'rating',
    question: 'Rate the quality of your pre-game warm-up routine.',
    ratingMin: 1,
    ratingMax: 5,
    ratingLabels: {
      min: 'Just take a few shots',
      max: 'Comprehensive warm-up covering all movements',
    },
    maxPoints: 5,
    order: 2,
  },
  {
    id: 'training-3',
    pillarSlug: 'training',
    type: 'rating',
    question: 'How often do you review video of your own play?',
    ratingMin: 1,
    ratingMax: 5,
    ratingLabels: {
      min: 'Never',
      max: 'After every game',
    },
    maxPoints: 5,
    order: 3,
  },
  {
    id: 'training-4',
    pillarSlug: 'training',
    type: 'rating',
    question: 'Rate your nutrition and sleep habits during the hockey season.',
    ratingMin: 1,
    ratingMax: 5,
    ratingLabels: {
      min: 'Poor - no attention to diet or sleep',
      max: 'Excellent - optimized for performance',
    },
    maxPoints: 5,
    order: 4,
  },
  {
    id: 'training-5',
    pillarSlug: 'training',
    type: 'multiple_choice',
    question: 'What do you typically do after a game?',
    options: [
      { id: 'a', text: 'Head home immediately', points: 1 },
      { id: 'b', text: 'Chat with teammates then leave', points: 2 },
      { id: 'c', text: 'Cool down stretching', points: 4 },
      { id: 'd', text: 'Full recovery routine (stretching, hydration, nutrition)', points: 5 },
    ],
    maxPoints: 5,
    order: 5,
  },
];

/**
 * Get questions grouped by pillar
 */
export function getQuestionsByPillar(): Record<PillarSlug, OnboardingQuestion[]> {
  const grouped: Record<string, OnboardingQuestion[]> = {};

  for (const question of ONBOARDING_QUESTIONS) {
    if (!grouped[question.pillarSlug]) {
      grouped[question.pillarSlug] = [];
    }
    grouped[question.pillarSlug].push(question);
  }

  // Sort each pillar's questions by order
  for (const pillar in grouped) {
    grouped[pillar].sort((a, b) => a.order - b.order);
  }

  return grouped as Record<PillarSlug, OnboardingQuestion[]>;
}

/**
 * Get total number of questions
 */
export function getTotalQuestionCount(): number {
  return ONBOARDING_QUESTIONS.length;
}

/**
 * Get question count per pillar
 */
export function getQuestionCountByPillar(): Record<PillarSlug, number> {
  const counts: Record<string, number> = {};

  for (const question of ONBOARDING_QUESTIONS) {
    counts[question.pillarSlug] = (counts[question.pillarSlug] || 0) + 1;
  }

  return counts as Record<PillarSlug, number>;
}
