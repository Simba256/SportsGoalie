import { AssessmentQuestion, ParentCategorySlug, CategoryWeight } from '@/types';

/**
 * Parent Assessment Questions (Getting to Know You)
 * Based on Michael's Parent Questionnaire Spec (03-parent-questionnaire-spec.md)
 * With exact scoring from the Scoring Assignment Guide (09-scoring-assignment-guide.md)
 *
 * 7 categories, all selection-based
 * Educational tooltips throughout
 * Focus on "car ride home" education
 */

/**
 * Category weights for parent assessment
 * Per Michael's specification (05-assessment-scoring-engine.md)
 */
export const PARENT_ASSESSMENT_WEIGHTS: CategoryWeight[] = [
  { categorySlug: 'goalie_state', weight: 10, name: "Your Goalie's Current State", description: 'What the parent sees from the outside looking in' },
  { categorySlug: 'understanding', weight: 30, name: 'Your Understanding of the Position', description: 'Knowledge of goaltending fundamentals' },
  { categorySlug: 'pre_game', weight: 10, name: 'Pre-Game', description: 'Before they hit the ice' },
  { categorySlug: 'car_ride_home', weight: 20, name: 'The Car Ride Home', description: 'Post-game communication' },
  { categorySlug: 'development_role', weight: 15, name: 'Your Role in Their Development', description: 'Active involvement in development' },
  { categorySlug: 'expectations', weight: 10, name: 'Your Expectations and Goals', description: 'Goals for the platform' },
  { categorySlug: 'preferences', weight: 5, name: 'Communication and Preferences', description: 'Platform engagement style' },
];

export const PARENT_ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // ===========================================
  // CATEGORY 1: Your Goalie's Current State (10%)
  // ===========================================
  {
    id: 'parent-q1-1',
    categorySlug: 'goalie_state',
    questionCode: 'Q1.1',
    type: 'single_select',
    question: "How would you describe your goalie's overall attitude toward the position right now?",
    tooltip: 'What the parent sees from the outside looking in.',
    isRequired: true,
    order: 1,
    options: [
      { id: 'q1-1-a', text: "They love it — can't wait to get on the ice", score: 4.0 },
      { id: 'q1-1-b', text: 'They enjoy it but get frustrated sometimes', score: 3.0 },
      { id: 'q1-1-c', text: "They're losing interest or motivation", score: 2.0 },
      { id: 'q1-1-d', text: 'It\'s up and down — depends on the week', score: 2.0 },
      { id: 'q1-1-e', text: "I'm honestly not sure", score: 1.5 },
    ],
  },
  {
    id: 'parent-q1-2',
    categorySlug: 'goalie_state',
    questionCode: 'Q1.2',
    type: 'single_select',
    question: 'After a tough game, how does your goalie typically respond?',
    isRequired: true,
    order: 2,
    requiresReview: true,
    reviewNote: "MICHAEL REVIEW: 'Doesn't seem to care' scored 1.5 — likely reveals parent's inability to read the goalie, not actual apathy. Your read?",
    options: [
      { id: 'q1-2-a', text: 'Bounces back quickly — moves on', score: 4.0 },
      { id: 'q1-2-b', text: 'Stays quiet but seems to process it', score: 3.0 },
      { id: 'q1-2-c', text: 'Gets visibly upset — hard on themselves', score: 2.0 },
      { id: 'q1-2-d', text: "Doesn't seem to care either way", score: 1.5 },
      { id: 'q1-2-e', text: 'It depends — no consistent pattern', score: 2.5 },
    ],
  },
  {
    id: 'parent-q1-3',
    categorySlug: 'goalie_state',
    questionCode: 'Q1.3',
    type: 'single_select',
    question: "How would you describe your goalie's confidence level right now?",
    isRequired: true,
    order: 3,
    options: [
      { id: 'q1-3-a', text: 'Strong and steady', score: 4.0 },
      { id: 'q1-3-b', text: 'Good but fragile — one bad game shakes it', score: 3.0 },
      { id: 'q1-3-c', text: 'Building slowly', score: 2.5 },
      { id: 'q1-3-d', text: 'Low — they doubt themselves often', score: 1.5 },
      { id: 'q1-3-e', text: "I'm not sure how to read it", score: 2.0 },
    ],
  },
  {
    id: 'parent-q1-4',
    categorySlug: 'goalie_state',
    questionCode: 'Q1.4',
    type: 'single_select',
    question: 'Does your goalie talk about their games or practices with you?',
    isRequired: true,
    order: 4,
    options: [
      { id: 'q1-4-a', text: 'Yes — they want to talk about it', score: 4.0 },
      { id: 'q1-4-b', text: 'Sometimes — if I ask', score: 2.5 },
      { id: 'q1-4-c', text: 'Rarely — they keep it to themselves', score: 2.0 },
      { id: 'q1-4-d', text: 'Only when something went wrong', score: 1.5 },
    ],
  },

  // ===========================================
  // CATEGORY 2: Your Understanding of the Position (30%)
  // ===========================================
  {
    id: 'parent-q2-1',
    categorySlug: 'understanding',
    questionCode: 'Q2.1',
    type: 'single_select',
    question: 'How well do you feel you understand what a goalie is supposed to do on the ice?',
    tooltip: 'No wrong answers — this helps the platform know where to start your education.',
    isRequired: true,
    order: 1,
    options: [
      { id: 'q2-1-a', text: 'Very well — I played goalie or have studied the position', score: 4.0 },
      { id: 'q2-1-b', text: "Reasonably well — I've watched enough games to have a sense", score: 3.0 },
      { id: 'q2-1-c', text: 'Somewhat — I know the basics but not the details', score: 2.0 },
      { id: 'q2-1-d', text: "Honestly, not well — I don't really understand the position", score: 1.0 },
    ],
  },
  {
    id: 'parent-q2-2',
    categorySlug: 'understanding',
    questionCode: 'Q2.2',
    type: 'single_select',
    question: 'When your goalie lets in a goal, can you usually tell why?',
    isRequired: true,
    order: 2,
    options: [
      { id: 'q2-2-a', text: 'Yes — I can see what went wrong most of the time', score: 4.0 },
      { id: 'q2-2-b', text: 'Sometimes — on obvious ones', score: 2.5 },
      { id: 'q2-2-c', text: 'Rarely — it all happens too fast', score: 1.5 },
      { id: 'q2-2-d', text: 'No — I just see the result, not the reason', score: 1.0 },
    ],
  },
  {
    id: 'parent-q2-3',
    categorySlug: 'understanding',
    questionCode: 'Q2.3',
    type: 'single_select',
    question: 'Do you know what "angle play" or "positional play" means in goaltending?',
    isRequired: true,
    order: 3,
    options: [
      { id: 'q2-3-a', text: 'Yes — I understand these concepts', score: 4.0 },
      { id: 'q2-3-b', text: "I've heard the terms but couldn't explain them", score: 2.0 },
      { id: 'q2-3-c', text: 'No — these are new to me', score: 1.0 },
    ],
  },
  {
    id: 'parent-q2-4',
    categorySlug: 'understanding',
    questionCode: 'Q2.4',
    type: 'single_select',
    question: 'Have you ever received any education on how to support a goalie as a parent?',
    isRequired: true,
    order: 4,
    options: [
      { id: 'q2-4-a', text: 'Yes — through a goalie coach or program', score: 4.0 },
      { id: 'q2-4-b', text: 'Some — picked up bits from watching or reading', score: 2.5 },
      { id: 'q2-4-c', text: 'No — nobody has ever taught me how to be a goalie parent', score: 1.0 },
    ],
  },

  // ===========================================
  // CATEGORY 3: Pre-Game (10%)
  // ===========================================
  {
    id: 'parent-q3-1',
    categorySlug: 'pre_game',
    questionCode: 'Q3.1',
    type: 'single_select',
    question: 'Does your goalie have a consistent pre-game routine before heading to the rink?',
    tooltip: "A goalie's mental state before the game directly affects how they perform. What happens at home, in the car on the way to the rink, and in the dressing room all set the stage. Smarter Goalie helps you understand and support this critical window.",
    isRequired: true,
    order: 1,
    options: [
      { id: 'q3-1-a', text: 'Yes — they have a routine they follow', score: 4.0 },
      { id: 'q3-1-b', text: 'Somewhat — they have habits but nothing structured', score: 2.5 },
      { id: 'q3-1-c', text: 'No — every game day is different', score: 1.5 },
      { id: 'q3-1-d', text: "I'm not sure what a pre-game routine should look like", score: 1.0 },
    ],
  },
  {
    id: 'parent-q3-2',
    categorySlug: 'pre_game',
    questionCode: 'Q3.2',
    type: 'single_select',
    question: 'How does your goalie typically seem on game day before leaving for the rink?',
    isRequired: true,
    order: 2,
    options: [
      { id: 'q3-2-a', text: 'Calm and focused', score: 4.0 },
      { id: 'q3-2-b', text: 'Excited and energized', score: 3.0 },
      { id: 'q3-2-c', text: 'Nervous or anxious', score: 2.0 },
      { id: 'q3-2-d', text: 'Quiet or withdrawn', score: 2.0 },
      { id: 'q3-2-e', text: 'It varies — no consistent pattern', score: 2.0 },
    ],
  },
  {
    id: 'parent-q3-3',
    categorySlug: 'pre_game',
    questionCode: 'Q3.3',
    type: 'single_select',
    question: 'What does the car ride TO the rink usually look like?',
    isRequired: true,
    order: 3,
    requiresReview: true,
    reviewNote: "MICHAEL REVIEW: 'I use the time to talk about what to focus on' scored 2 as coaching from the car. Is this too low? Some parents do this constructively. Your call.",
    options: [
      { id: 'q3-3-a', text: 'Relaxed — normal conversation or music', score: 3.5 },
      { id: 'q3-3-b', text: "Focused — they're getting in the zone", score: 4.0 },
      { id: 'q3-3-c', text: "Tense — they seem stressed or I'm giving them reminders", score: 2.0 },
      { id: 'q3-3-d', text: 'I use the time to talk about what to focus on in the game', score: 2.0 },
      { id: 'q3-3-e', text: "We don't really have a pattern", score: 2.0 },
    ],
  },
  {
    id: 'parent-q3-4',
    categorySlug: 'pre_game',
    questionCode: 'Q3.4',
    type: 'single_select',
    question: 'Do you currently play any role in helping your goalie prepare mentally before a game?',
    isRequired: true,
    order: 4,
    options: [
      { id: 'q3-4-a', text: 'Yes — we have a routine together', score: 4.0 },
      { id: 'q3-4-b', text: "I try but I'm not sure if it helps", score: 2.5 },
      { id: 'q3-4-c', text: 'No — I leave that to them', score: 2.0 },
      { id: 'q3-4-d', text: "No — I wouldn't know how to help with that", score: 1.5 },
    ],
  },

  // ===========================================
  // CATEGORY 4: The Car Ride Home (20%)
  // ===========================================
  {
    id: 'parent-q4-1',
    categorySlug: 'car_ride_home',
    questionCode: 'Q4.1',
    type: 'single_select',
    question: 'After a game, what does the car ride home usually look like?',
    tooltip: "The car ride home after a game is one of the most impactful moments in a young goalie's development. It can be constructive or destructive. Smarter Goalie helps you make it constructive — every time.",
    isRequired: true,
    order: 1,
    options: [
      { id: 'q4-1-a', text: 'We talk about the game — I share what I saw', score: 2.5 },
      { id: 'q4-1-b', text: 'I wait for them to bring it up', score: 3.5 },
      { id: 'q4-1-c', text: 'I try to be positive but sometimes I point out mistakes', score: 2.0 },
      { id: 'q4-1-d', text: "It's usually quiet — neither of us says much", score: 2.5 },
      { id: 'q4-1-e', text: 'It depends on whether they won or lost', score: 1.5 },
    ],
  },
  {
    id: 'parent-q4-2',
    categorySlug: 'car_ride_home',
    questionCode: 'Q4.2',
    type: 'single_select',
    question: 'When you talk about the game, do you focus more on:',
    isRequired: true,
    order: 2,
    options: [
      { id: 'q4-2-a', text: 'What they did well', score: 3.0 },
      { id: 'q4-2-b', text: 'What they need to improve', score: 1.5 },
      { id: 'q4-2-c', text: 'A mix of both', score: 3.5 },
      { id: 'q4-2-d', text: 'I mostly listen', score: 4.0 },
      { id: 'q4-2-e', text: "I tend to coach — I know I probably shouldn't", score: 1.5 },
    ],
  },
  {
    id: 'parent-q4-3',
    categorySlug: 'car_ride_home',
    questionCode: 'Q4.3',
    type: 'single_select',
    question: 'Have you ever noticed your goalie shutting down or getting upset during post-game conversations?',
    isRequired: true,
    order: 3,
    requiresReview: true,
    reviewNote: "MICHAEL REVIEW: 'I avoid the conversation to prevent this' scored 2.5 — self-aware avoidance. Better or worse than 'occasionally'? Your read.",
    options: [
      { id: 'q4-3-a', text: 'Yes — it happens regularly', score: 1.5 },
      { id: 'q4-3-b', text: 'Occasionally', score: 2.5 },
      { id: 'q4-3-c', text: 'Rarely', score: 3.5 },
      { id: 'q4-3-d', text: 'No — they handle it fine', score: 4.0 },
      { id: 'q4-3-e', text: 'I avoid the conversation to prevent this', score: 2.5 },
    ],
  },
  {
    id: 'parent-q4-4',
    categorySlug: 'car_ride_home',
    questionCode: 'Q4.4',
    type: 'single_select',
    question: 'How would you rate your post-game approach right now?',
    isRequired: true,
    order: 4,
    options: [
      { id: 'q4-4-a', text: 'I think I handle it well', score: 3.5 },
      { id: 'q4-4-b', text: 'I try but I know I could be better', score: 3.0 },
      { id: 'q4-4-c', text: "I'm not sure if I'm helping or hurting", score: 2.0 },
      { id: 'q4-4-d', text: 'I need guidance on this', score: 2.5 },
    ],
  },

  // ===========================================
  // CATEGORY 5: Your Role in Their Development (15%)
  // ===========================================
  {
    id: 'parent-q5-1',
    categorySlug: 'development_role',
    questionCode: 'Q5.1',
    type: 'single_select',
    question: "Do you currently attend your goalie's practices?",
    isRequired: true,
    order: 1,
    options: [
      { id: 'q5-1-a', text: 'Yes — all or most of them', score: 3.5 },
      { id: 'q5-1-b', text: 'Some of them', score: 3.0 },
      { id: 'q5-1-c', text: 'Rarely', score: 2.5 },
      { id: 'q5-1-d', text: 'No', score: 2.0 },
    ],
  },
  {
    id: 'parent-q5-2',
    categorySlug: 'development_role',
    questionCode: 'Q5.2',
    type: 'single_select',
    question: 'At games, what do you typically focus on while watching?',
    isRequired: true,
    order: 2,
    options: [
      { id: 'q5-2-a', text: "My goalie's performance specifically", score: 3.0 },
      { id: 'q5-2-b', text: "The team's overall play", score: 2.5 },
      { id: 'q5-2-c', text: 'Both equally', score: 3.5 },
      { id: 'q5-2-d', text: "I just enjoy watching — I don't analyze", score: 2.5 },
      { id: 'q5-2-e', text: 'I get too nervous to watch closely', score: 2.0 },
    ],
  },
  {
    id: 'parent-q5-3',
    categorySlug: 'development_role',
    questionCode: 'Q5.3',
    type: 'single_select',
    question: "Have you ever charted or tracked your goalie's performance?",
    isRequired: true,
    order: 3,
    options: [
      { id: 'q5-3-a', text: 'Yes — I keep some kind of record', score: 4.0 },
      { id: 'q5-3-b', text: "I've thought about it but haven't started", score: 3.0 },
      { id: 'q5-3-c', text: "No — I wouldn't know what to track", score: 2.0 },
      { id: 'q5-3-d', text: "No — I think that's the coach's job", score: 1.5 },
    ],
  },
  {
    id: 'parent-q5-4',
    categorySlug: 'development_role',
    questionCode: 'Q5.4',
    type: 'single_select',
    question: "Would you be willing to participate in a quick post-game observation chart (2-3 minutes) that helps build a complete picture of your goalie's development?",
    isRequired: true,
    order: 4,
    options: [
      { id: 'q5-4-a', text: 'Yes — absolutely', score: 4.0 },
      { id: 'q5-4-b', text: 'Maybe — depends on how easy it is', score: 3.0 },
      { id: 'q5-4-c', text: "Probably not — I'd rather just watch", score: 2.0 },
      { id: 'q5-4-d', text: 'I need to understand more before committing', score: 2.5 },
    ],
  },

  // ===========================================
  // CATEGORY 6: Your Expectations and Goals (10%)
  // ===========================================
  {
    id: 'parent-q6-1',
    categorySlug: 'expectations',
    questionCode: 'Q6.1',
    type: 'single_select',
    question: 'What is your primary goal for your goalie through this platform?',
    isRequired: true,
    order: 1,
    options: [
      { id: 'q6-1-a', text: "Build strong fundamentals they'll carry for years", score: 4.0 },
      { id: 'q6-1-b', text: 'Improve specific weaknesses in their game', score: 3.5 },
      { id: 'q6-1-c', text: 'Develop mental toughness and confidence', score: 3.5 },
      { id: 'q6-1-d', text: "Give them structure they're not getting elsewhere", score: 3.0 },
      { id: 'q6-1-e', text: "I'm not sure yet — I want to see what's possible", score: 2.5 },
    ],
  },
  {
    id: 'parent-q6-2',
    categorySlug: 'expectations',
    questionCode: 'Q6.2',
    type: 'single_select',
    question: 'What would success look like for YOU as a goalie parent after 6 months on this platform?',
    isRequired: true,
    order: 2,
    options: [
      { id: 'q6-2-a', text: 'I understand the position well enough to support my goalie intelligently', score: 4.0 },
      { id: 'q6-2-b', text: 'My goalie has a structured development plan and is following it', score: 3.5 },
      { id: 'q6-2-c', text: 'Our post-game conversations are constructive, not stressful', score: 3.5 },
      { id: 'q6-2-d', text: 'I know what to look for when watching games and practices', score: 3.5 },
      { id: 'q6-2-e', text: 'All of the above', score: 4.0 },
    ],
  },
  {
    id: 'parent-q6-3',
    categorySlug: 'expectations',
    questionCode: 'Q6.3',
    type: 'single_select',
    question: 'How much time per week can your goalie realistically commit to development outside of team practice?',
    isRequired: true,
    order: 3,
    options: [
      { id: 'q6-3-a', text: '15-30 minutes', score: 2.5 },
      { id: 'q6-3-b', text: '30-60 minutes', score: 3.0 },
      { id: 'q6-3-c', text: 'More than 60 minutes', score: 4.0 },
      { id: 'q6-3-d', text: "I'm not sure — depends on the schedule", score: 2.5 },
    ],
  },
  {
    id: 'parent-q6-4',
    categorySlug: 'expectations',
    questionCode: 'Q6.4',
    type: 'single_select',
    question: 'Are you open to growing your own understanding of goaltending as your goalie develops through the platform?',
    isRequired: true,
    order: 4,
    options: [
      { id: 'q6-4-a', text: "Yes — that's exactly what I want", score: 4.0 },
      { id: 'q6-4-b', text: "I'm open to it", score: 3.0 },
      { id: 'q6-4-c', text: "I'd prefer to stay in a supporting role", score: 2.0 },
      { id: 'q6-4-d', text: 'I need to know more about what that looks like', score: 2.5 },
    ],
  },

  // ===========================================
  // CATEGORY 7: Communication and Preferences (5%)
  // Note: Preference questions - neutral engagement indicators
  // ===========================================
  {
    id: 'parent-q7-1',
    categorySlug: 'preferences',
    questionCode: 'Q7.1',
    type: 'single_select',
    question: "How would you prefer to receive updates on your goalie's development?",
    isRequired: true,
    order: 1,
    options: [
      { id: 'q7-1-a', text: 'Dashboard I can check anytime', score: 3.0 },
      { id: 'q7-1-b', text: 'Email summaries', score: 3.0 },
      { id: 'q7-1-c', text: 'Notifications on my phone', score: 3.0 },
      { id: 'q7-1-d', text: 'A combination', score: 3.0 },
    ],
  },
  {
    id: 'parent-q7-2',
    categorySlug: 'preferences',
    questionCode: 'Q7.2',
    type: 'single_select',
    question: 'How often would you like to receive development updates?',
    isRequired: true,
    order: 2,
    options: [
      { id: 'q7-2-a', text: 'After every game/practice chart', score: 3.0 },
      { id: 'q7-2-b', text: 'Weekly summary', score: 3.0 },
      { id: 'q7-2-c', text: 'Bi-weekly summary', score: 3.0 },
      { id: 'q7-2-d', text: 'Only when something important changes', score: 3.0 },
    ],
  },
  {
    id: 'parent-q7-3',
    categorySlug: 'preferences',
    questionCode: 'Q7.3',
    type: 'single_select',
    question: 'Would you be interested in parent-specific educational content (articles, videos, guides) about supporting a goalie?',
    isRequired: true,
    order: 3,
    options: [
      { id: 'q7-3-a', text: 'Yes — very interested', score: 3.5 },
      { id: 'q7-3-b', text: "Somewhat — if it's relevant and not overwhelming", score: 3.0 },
      { id: 'q7-3-c', text: "Not really — just focus on my goalie's development", score: 2.5 },
      { id: 'q7-3-d', text: 'Maybe later — I want to start simple', score: 2.5 },
    ],
  },
  {
    id: 'parent-q7-4',
    categorySlug: 'preferences',
    questionCode: 'Q7.4',
    type: 'single_select',
    question: "If you had a question about the program or your goalie's development, how would you prefer to get an answer?",
    isRequired: true,
    order: 4,
    options: [
      { id: 'q7-4-a', text: 'Ask Claude AI on the platform (instant response)', score: 3.0 },
      { id: 'q7-4-b', text: 'Send a message through the platform and wait for a response', score: 3.0 },
      { id: 'q7-4-c', text: 'Read the FAQ section', score: 3.0 },
      { id: 'q7-4-d', text: "I'd want to talk to someone directly", score: 3.0 },
    ],
  },
];

/**
 * Get assessment questions grouped by category
 */
export function getParentQuestionsByCategory(): Map<ParentCategorySlug, AssessmentQuestion[]> {
  const grouped = new Map<ParentCategorySlug, AssessmentQuestion[]>();

  for (const question of PARENT_ASSESSMENT_QUESTIONS) {
    const slug = question.categorySlug as ParentCategorySlug;
    const existing = grouped.get(slug) || [];
    existing.push(question);
    grouped.set(slug, existing);
  }

  // Sort each category's questions by order
  for (const [category, questions] of grouped) {
    questions.sort((a, b) => a.order - b.order);
    grouped.set(category, questions);
  }

  return grouped;
}

/**
 * Get category order for parent assessment flow
 */
export function getParentCategoryOrder(): ParentCategorySlug[] {
  return [
    'goalie_state',
    'understanding',
    'pre_game',
    'car_ride_home',
    'development_role',
    'expectations',
    'preferences',
  ];
}

/**
 * Get total number of parent assessment questions
 */
export function getParentTotalQuestionCount(): number {
  return PARENT_ASSESSMENT_QUESTIONS.length;
}
