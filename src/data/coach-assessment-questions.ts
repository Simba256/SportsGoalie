import { AssessmentQuestion, CoachCategorySlug, CategoryWeight } from '@/types';

/**
 * Coach Assessment Questions (Getting to Know You)
 * Based on Michael's Coach Questionnaire Spec (04-coach-questionnaire-spec.md)
 * With exact scoring from the Scoring Assignment Guide (09-scoring-assignment-guide.md)
 *
 * 7 categories, all selection-based
 * Educational tooltips throughout
 */

/**
 * Category weights for coach assessment
 * Per Michael's specification (05-assessment-scoring-engine.md)
 */
export const COACH_ASSESSMENT_WEIGHTS: CategoryWeight[] = [
  { categorySlug: 'goalie_knowledge', weight: 30, name: 'Your Goaltending Knowledge', description: 'Understanding of goaltending fundamentals' },
  { categorySlug: 'current_approach', weight: 25, name: 'Your Current Approach', description: 'Current goalie development practices' },
  { categorySlug: 'pre_game', weight: 10, name: 'Pre-Game Assessment', description: 'Assessing goalie readiness' },
  { categorySlug: 'in_game', weight: 15, name: 'In-Game Reading', description: 'Reading goalie performance during games' },
  { categorySlug: 'post_game', weight: 10, name: 'Post-Game Debrief', description: 'Post-game feedback and communication' },
  { categorySlug: 'coaching_goals', weight: 5, name: 'Your Coaching Goals', description: 'Goals for goalie development' },
  { categorySlug: 'preferences', weight: 5, name: 'Communication and Preferences', description: 'Platform engagement style' },
];

export const COACH_ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // ===========================================
  // CATEGORY 1: Your Goaltending Knowledge (30%)
  // ===========================================
  {
    id: 'coach-q1-1',
    categorySlug: 'goalie_knowledge',
    questionCode: 'Q1.1',
    type: 'single_select',
    question: 'How would you rate your current understanding of goaltending as a position?',
    tooltip: 'No wrong answers — this tells Smarter Goalie where to start your education.',
    isRequired: true,
    order: 1,
    options: [
      { id: 'q1-1-a', text: 'Strong — I played goalie or have studied the position extensively', score: 4.0 },
      { id: 'q1-1-b', text: 'Moderate — I understand the basics and some technical aspects', score: 3.0 },
      { id: 'q1-1-c', text: 'Limited — I know what a goalie does but not the details of how or why', score: 2.0 },
      { id: 'q1-1-d', text: "Minimal — I'm a coach but goaltending is a blind spot for me", score: 1.0 },
    ],
  },
  {
    id: 'coach-q1-2',
    categorySlug: 'goalie_knowledge',
    questionCode: 'Q1.2',
    type: 'single_select',
    question: 'Can you identify the difference between a positioning error and a technical error when your goalie lets in a goal?',
    isRequired: true,
    order: 2,
    options: [
      { id: 'q1-2-a', text: 'Yes — most of the time', score: 4.0 },
      { id: 'q1-2-b', text: 'Sometimes — on obvious breakdowns', score: 2.5 },
      { id: 'q1-2-c', text: 'Rarely — I see the goal but not the cause', score: 1.5 },
      { id: 'q1-2-d', text: "No — I wouldn't know where to start", score: 1.0 },
    ],
  },
  {
    id: 'coach-q1-3',
    categorySlug: 'goalie_knowledge',
    questionCode: 'Q1.3',
    type: 'single_select',
    question: 'Are you familiar with the concept of angles and positional systems in goaltending?',
    isRequired: true,
    order: 3,
    options: [
      { id: 'q1-3-a', text: 'Yes — I understand angle play and how positioning works', score: 4.0 },
      { id: 'q1-3-b', text: "I've heard the terms but couldn't coach it", score: 2.0 },
      { id: 'q1-3-c', text: 'No — these concepts are new to me', score: 1.0 },
    ],
  },
  {
    id: 'coach-q1-4',
    categorySlug: 'goalie_knowledge',
    questionCode: 'Q1.4',
    type: 'single_select',
    question: 'Have you ever received any formal or informal education specifically about goaltending?',
    isRequired: true,
    order: 4,
    options: [
      { id: 'q1-4-a', text: 'Yes — coaching clinics, certifications, or mentorship that included goaltending', score: 4.0 },
      { id: 'q1-4-b', text: 'Some — picked up bits from goalie coaches or watching', score: 2.5 },
      { id: 'q1-4-c', text: "No — everything I know about goalies I've figured out on my own", score: 1.5 },
      { id: 'q1-4-d', text: "No — I've never had any goaltending education", score: 1.0 },
    ],
  },

  // ===========================================
  // CATEGORY 2: Your Current Approach to Goalie Development (25%)
  // ===========================================
  {
    id: 'coach-q2-1',
    categorySlug: 'current_approach',
    questionCode: 'Q2.1',
    type: 'single_select',
    question: 'During team practices, what does your goalie typically do?',
    isRequired: true,
    order: 1,
    options: [
      { id: 'q2-1-a', text: 'They participate in team drills and take shots — that\'s about it', score: 2.0 },
      { id: 'q2-1-b', text: "I try to give them specific work but I'm not sure it's effective", score: 2.5 },
      { id: 'q2-1-c', text: 'They work separately with a goalie coach', score: 4.0 },
      { id: 'q2-1-d', text: "They stand in net for shooting drills — I don't structure anything specific for them", score: 1.5 },
      { id: 'q2-1-e', text: "Honestly, I haven't thought much about what they do during practice", score: 1.0 },
    ],
  },
  {
    id: 'coach-q2-2',
    categorySlug: 'current_approach',
    questionCode: 'Q2.2',
    type: 'single_select',
    question: 'Do you currently design warm-ups with your goalie in mind?',
    isRequired: true,
    order: 2,
    options: [
      { id: 'q2-2-a', text: 'Yes — I have a goalie-specific warm-up routine', score: 4.0 },
      { id: 'q2-2-b', text: "I try but I don't know what a good goalie warm-up looks like", score: 2.5 },
      { id: 'q2-2-c', text: 'No — the goalie warms up however they want', score: 1.5 },
      { id: 'q2-2-d', text: 'No — they just take shots from the team during warm-up', score: 1.0 },
    ],
  },
  {
    id: 'coach-q2-3',
    categorySlug: 'current_approach',
    questionCode: 'Q2.3',
    type: 'single_select',
    question: 'When you give your goalie feedback, what does it usually sound like?',
    isRequired: true,
    order: 3,
    requiresReview: true,
    reviewNote: "MICHAEL REVIEW: 'I don't give feedback because I'm not sure what to say' scored 2 (higher than results-based). The logic: honest restraint beats confident ignorance. Confirm.",
    options: [
      { id: 'q2-3-a', text: 'Specific technical feedback — I can identify what needs to change', score: 4.0 },
      { id: 'q2-3-b', text: "General encouragement — 'good game' or 'shake it off'", score: 2.0 },
      { id: 'q2-3-c', text: 'Results-based — focused on goals against or saves', score: 1.5 },
      { id: 'q2-3-d', text: "I don't give my goalie much feedback because I'm not sure what to say", score: 2.0 },
      { id: 'q2-3-e', text: 'I leave goalie feedback to others', score: 2.5 },
    ],
  },
  {
    id: 'coach-q2-4',
    categorySlug: 'current_approach',
    questionCode: 'Q2.4',
    type: 'single_select',
    question: "Do you currently track or evaluate your goalie's performance in any structured way?",
    isRequired: true,
    order: 4,
    options: [
      { id: 'q2-4-a', text: 'Yes — I use some form of tracking or evaluation', score: 4.0 },
      { id: 'q2-4-b', text: 'I keep mental notes but nothing formal', score: 2.5 },
      { id: 'q2-4-c', text: 'No — I evaluate based on the eye test and game results', score: 2.0 },
      { id: 'q2-4-d', text: "No — I wouldn't know what to track beyond save percentage", score: 1.0 },
    ],
  },

  // ===========================================
  // CATEGORY 3: Pre-Game — Assessing Your Goalie's Readiness (10%)
  // ===========================================
  {
    id: 'coach-q3-1',
    categorySlug: 'pre_game',
    questionCode: 'Q3.1',
    type: 'single_select',
    question: "Before a game, do you assess your goalie's readiness or mental state?",
    tooltip: "A goalie's readiness before the game is visible to a trained eye. How they warm up, how they carry themselves, their focus level — these all signal what kind of game is coming. Smarter Goalie teaches you to read these signals.",
    isRequired: true,
    order: 1,
    options: [
      { id: 'q3-1-a', text: 'Yes — I check in with them and observe their demeanor', score: 4.0 },
      { id: 'q3-1-b', text: "Somewhat — I notice if something seems off but don't have a system", score: 2.5 },
      { id: 'q3-1-c', text: "No — I assume they're ready if they show up", score: 1.5 },
      { id: 'q3-1-d', text: "No — I wouldn't know what to look for", score: 1.0 },
    ],
  },
  {
    id: 'coach-q3-2',
    categorySlug: 'pre_game',
    questionCode: 'Q3.2',
    type: 'single_select',
    question: 'During warm-up, can you tell if your goalie is mentally and physically prepared?',
    isRequired: true,
    order: 2,
    options: [
      { id: 'q3-2-a', text: 'Yes — I can read their body language and movement quality', score: 4.0 },
      { id: 'q3-2-b', text: "Sometimes — if it's obviously good or obviously bad", score: 2.5 },
      { id: 'q3-2-c', text: 'No — warm-up all looks the same to me', score: 1.5 },
      { id: 'q3-2-d', text: "I don't watch the goalie during warm-up — I'm focused on the team", score: 1.0 },
    ],
  },
  {
    id: 'coach-q3-3',
    categorySlug: 'pre_game',
    questionCode: 'Q3.3',
    type: 'single_select',
    question: 'Do you have any pre-game communication routine with your goalie?',
    isRequired: true,
    order: 3,
    options: [
      { id: 'q3-3-a', text: 'Yes — I talk to them before every game about what to expect', score: 4.0 },
      { id: 'q3-3-b', text: 'Occasionally — depends on the game or situation', score: 2.5 },
      { id: 'q3-3-c', text: 'No — I give team talks but nothing goalie-specific', score: 1.5 },
      { id: 'q3-3-d', text: "No — I wouldn't know what to say to a goalie before a game", score: 1.0 },
    ],
  },
  {
    id: 'coach-q3-4',
    categorySlug: 'pre_game',
    questionCode: 'Q3.4',
    type: 'single_select',
    question: 'If your goalie seems off before a game — nervous, unfocused, or low energy — how do you handle it?',
    isRequired: true,
    order: 4,
    options: [
      { id: 'q3-4-a', text: 'I address it directly with them', score: 4.0 },
      { id: 'q3-4-b', text: "I try to be encouraging but I'm not sure it helps", score: 2.5 },
      { id: 'q3-4-c', text: "I don't usually notice until the game starts", score: 1.5 },
      { id: 'q3-4-d', text: "I notice but I don't know how to address it effectively", score: 2.0 },
    ],
  },

  // ===========================================
  // CATEGORY 4: In-Game — Reading Your Goalie's Performance (15%)
  // ===========================================
  {
    id: 'coach-q4-1',
    categorySlug: 'in_game',
    questionCode: 'Q4.1',
    type: 'single_select',
    question: "During a game, do you pay attention to your goalie's performance period by period?",
    tooltip: "A coach who can read their goalie's performance during the game — not just after — can make adjustments that change outcomes. Period-by-period awareness builds over time. Smarter Goalie gives you the framework.",
    isRequired: true,
    order: 1,
    options: [
      { id: 'q4-1-a', text: "Yes — I track how they're performing each period", score: 4.0 },
      { id: 'q4-1-b', text: "Somewhat — I notice trends if they're obvious", score: 2.5 },
      { id: 'q4-1-c', text: "Not really — I focus on the team's overall play", score: 1.5 },
      { id: 'q4-1-d', text: 'No — I only notice the goalie when goals go in', score: 1.0 },
    ],
  },
  {
    id: 'coach-q4-2',
    categorySlug: 'in_game',
    questionCode: 'Q4.2',
    type: 'single_select',
    question: "Can you tell the difference between a goal that was the goalie's fault and one that was a defensive breakdown?",
    isRequired: true,
    order: 2,
    options: [
      { id: 'q4-2-a', text: 'Yes — most of the time', score: 4.0 },
      { id: 'q4-2-b', text: 'Sometimes — on clear-cut situations', score: 2.5 },
      { id: 'q4-2-c', text: "Rarely — it's hard to tell in real time", score: 1.5 },
      { id: 'q4-2-d', text: 'No — I tend to look at the goalie first regardless', score: 1.0 },
    ],
  },
  {
    id: 'coach-q4-3',
    categorySlug: 'in_game',
    questionCode: 'Q4.3',
    type: 'single_select',
    question: 'When your goalie lets in a goal, what is your typical response from the bench?',
    isRequired: true,
    order: 3,
    options: [
      { id: 'q4-3-a', text: 'I assess the situation and respond accordingly — sometimes talk to them, sometimes leave them alone', score: 4.0 },
      { id: 'q4-3-b', text: 'I try to be encouraging regardless of the situation', score: 3.0 },
      { id: 'q4-3-c', text: "I get frustrated — I know I shouldn't but it happens", score: 1.5 },
      { id: 'q4-3-d', text: "I don't really respond — I move on to the next play", score: 2.5 },
      { id: 'q4-3-e', text: 'It depends on the score and the moment', score: 3.0 },
    ],
  },
  {
    id: 'coach-q4-4',
    categorySlug: 'in_game',
    questionCode: 'Q4.4',
    type: 'single_select',
    question: "Have you ever noticed your goalie's performance changing between periods — starting slow, fading late, or dropping after a goal against?",
    isRequired: true,
    order: 4,
    options: [
      { id: 'q4-4-a', text: 'Yes — I see patterns in their performance across periods', score: 4.0 },
      { id: 'q4-4-b', text: "Sometimes — but I haven't tracked it", score: 2.5 },
      { id: 'q4-4-c', text: "No — I haven't paid attention to period-by-period changes", score: 1.5 },
      { id: 'q4-4-d', text: "I've noticed it but I don't know what causes it or how to address it", score: 2.0 },
    ],
  },

  // ===========================================
  // CATEGORY 5: Post-Game — Your Goalie Debrief (10%)
  // ===========================================
  {
    id: 'coach-q5-1',
    categorySlug: 'post_game',
    questionCode: 'Q5.1',
    type: 'single_select',
    question: 'After a game, do you talk to your goalie specifically about their performance?',
    isRequired: true,
    order: 1,
    options: [
      { id: 'q5-1-a', text: 'Yes — I always have a conversation with them', score: 4.0 },
      { id: 'q5-1-b', text: 'Sometimes — depends on the game', score: 2.5 },
      { id: 'q5-1-c', text: 'Rarely — I give team feedback but not goalie-specific', score: 1.5 },
      { id: 'q5-1-d', text: "No — I don't know what constructive goalie feedback looks like", score: 1.5 },
    ],
  },
  {
    id: 'coach-q5-2',
    categorySlug: 'post_game',
    questionCode: 'Q5.2',
    type: 'single_select',
    question: 'When you do give post-game feedback to your goalie, what do you focus on?',
    isRequired: true,
    order: 2,
    options: [
      { id: 'q5-2-a', text: 'Specific moments and what they did well or could improve', score: 4.0 },
      { id: 'q5-2-b', text: "General statements — 'good game' or 'tough night'", score: 2.0 },
      { id: 'q5-2-c', text: 'Results — goals against, save percentage, wins and losses', score: 1.5 },
      { id: 'q5-2-d', text: "I try but I know my feedback isn't very specific or helpful", score: 2.0 },
      { id: 'q5-2-e', text: "I don't give goalie-specific feedback", score: 1.5 },
    ],
  },
  {
    id: 'coach-q5-3',
    categorySlug: 'post_game',
    questionCode: 'Q5.3',
    type: 'single_select',
    question: 'Are you comfortable having honest conversations with your goalie about their development areas?',
    isRequired: true,
    order: 3,
    options: [
      { id: 'q5-3-a', text: 'Yes — I can be direct and constructive', score: 4.0 },
      { id: 'q5-3-b', text: "Somewhat — I try but I worry about damaging their confidence", score: 2.5 },
      { id: 'q5-3-c', text: "No — I avoid critical feedback with goalies because I don't understand the position well enough", score: 2.0 },
      { id: 'q5-3-d', text: 'No — I leave that to the goalie coach or parents', score: 2.0 },
    ],
  },
  {
    id: 'coach-q5-4',
    categorySlug: 'post_game',
    questionCode: 'Q5.4',
    type: 'single_select',
    question: "Would you be willing to complete a quick post-game coach evaluation chart (3-5 minutes) that helps build a complete picture of your goalie's development?",
    isRequired: true,
    order: 4,
    options: [
      { id: 'q5-4-a', text: 'Yes — absolutely', score: 4.0 },
      { id: 'q5-4-b', text: 'Maybe — depends on how easy it is', score: 3.0 },
      { id: 'q5-4-c', text: "Probably not — I'm already stretched thin after games", score: 2.0 },
      { id: 'q5-4-d', text: 'I need to understand more before committing', score: 2.5 },
    ],
  },

  // ===========================================
  // CATEGORY 6: Your Coaching Goals (5%)
  // ===========================================
  {
    id: 'coach-q6-1',
    categorySlug: 'coaching_goals',
    questionCode: 'Q6.1',
    type: 'single_select',
    question: 'What is your primary goal as a coach in relation to your goalie?',
    isRequired: true,
    order: 1,
    options: [
      { id: 'q6-1-a', text: 'Develop them as a complete goaltender — not just a shot-stopper', score: 4.0 },
      { id: 'q6-1-b', text: 'Understand the position well enough to give meaningful feedback', score: 3.5 },
      { id: 'q6-1-c', text: 'Learn how to use practice time effectively for goalie development', score: 3.5 },
      { id: 'q6-1-d', text: 'Be able to evaluate goalie performance accurately', score: 3.0 },
      { id: 'q6-1-e', text: "I'm not sure yet — show me what's possible", score: 2.5 },
    ],
  },
  {
    id: 'coach-q6-2',
    categorySlug: 'coaching_goals',
    questionCode: 'Q6.2',
    type: 'single_select',
    question: 'What would success look like for YOU as a coach after 6 months with Smarter Goalie?',
    isRequired: true,
    order: 2,
    options: [
      { id: 'q6-2-a', text: 'I understand goaltending well enough to communicate effectively with my goalie', score: 4.0 },
      { id: 'q6-2-b', text: 'I have structured goalie development integrated into my team practices', score: 4.0 },
      { id: 'q6-2-c', text: "I can evaluate my goalie's performance accurately and give constructive feedback", score: 4.0 },
      { id: 'q6-2-d', text: 'My goalie is developing consistently and I know why', score: 4.0 },
      { id: 'q6-2-e', text: 'All of the above', score: 4.0 },
    ],
  },
  {
    id: 'coach-q6-3',
    categorySlug: 'coaching_goals',
    questionCode: 'Q6.3',
    type: 'single_select',
    question: 'Are you open to being educated on goaltending as part of your coaching development?',
    isRequired: true,
    order: 3,
    options: [
      { id: 'q6-3-a', text: 'Yes — I want to learn everything I can', score: 4.0 },
      { id: 'q6-3-b', text: "I'm open to it — if it's practical and not overwhelming", score: 3.0 },
      { id: 'q6-3-c', text: "I'd prefer quick resources I can apply immediately", score: 2.5 },
      { id: 'q6-3-d', text: 'I need to see how it fits into my coaching schedule', score: 2.5 },
    ],
  },
  {
    id: 'coach-q6-4',
    categorySlug: 'coaching_goals',
    questionCode: 'Q6.4',
    type: 'single_select',
    question: 'Would you be open to evolving a segment of your team practice — when possible — into designated goalie-specific drill activities?',
    isRequired: true,
    order: 4,
    options: [
      { id: 'q6-4-a', text: "Yes — that sounds like exactly what I need", score: 4.0 },
      { id: 'q6-4-b', text: "I'm interested but I'd need to see how it works in practice", score: 3.0 },
      { id: 'q6-4-c', text: 'Maybe — depends on how much it changes my current practice plans', score: 2.5 },
      { id: 'q6-4-d', text: "I hadn't thought about that before", score: 2.0 },
    ],
  },

  // ===========================================
  // CATEGORY 7: Communication and Preferences (5%)
  // Note: Preference questions - neutral engagement indicators
  // ===========================================
  {
    id: 'coach-q7-1',
    categorySlug: 'preferences',
    questionCode: 'Q7.1',
    type: 'single_select',
    question: "How would you prefer to receive information about your goalie's development through Smarter Goalie?",
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
    id: 'coach-q7-2',
    categorySlug: 'preferences',
    questionCode: 'Q7.2',
    type: 'single_select',
    question: 'How often would you like to receive goalie development updates?',
    isRequired: true,
    order: 2,
    options: [
      { id: 'q7-2-a', text: 'After every game chart is completed', score: 3.0 },
      { id: 'q7-2-b', text: 'Weekly summary', score: 3.0 },
      { id: 'q7-2-c', text: 'Bi-weekly summary', score: 3.0 },
      { id: 'q7-2-d', text: 'Only when something significant changes', score: 3.0 },
    ],
  },
  {
    id: 'coach-q7-3',
    categorySlug: 'preferences',
    questionCode: 'Q7.3',
    type: 'single_select',
    question: 'Would you be interested in coach-specific educational content about goaltending (articles, videos, practice design guides)?',
    isRequired: true,
    order: 3,
    options: [
      { id: 'q7-3-a', text: 'Yes — very interested', score: 3.5 },
      { id: 'q7-3-b', text: "Somewhat — if it's practical and time-efficient", score: 3.0 },
      { id: 'q7-3-c', text: 'Not really — just give me the evaluation tools', score: 2.5 },
      { id: 'q7-3-d', text: 'Maybe later — I want to start simple', score: 2.5 },
    ],
  },
  {
    id: 'coach-q7-4',
    categorySlug: 'preferences',
    questionCode: 'Q7.4',
    type: 'single_select',
    question: 'If you had a question about the program or goaltending concepts, how would you prefer to get an answer?',
    isRequired: true,
    order: 4,
    options: [
      { id: 'q7-4-a', text: 'Ask Claude AI within Smarter Goalie (instant response)', score: 3.0 },
      { id: 'q7-4-b', text: 'Send a message through Smarter Goalie and wait for a response', score: 3.0 },
      { id: 'q7-4-c', text: 'Read the FAQ section', score: 3.0 },
      { id: 'q7-4-d', text: "I'd want to talk to someone directly", score: 3.0 },
    ],
  },
];

/**
 * Get assessment questions grouped by category
 */
export function getCoachQuestionsByCategory(): Map<CoachCategorySlug, AssessmentQuestion[]> {
  const grouped = new Map<CoachCategorySlug, AssessmentQuestion[]>();

  for (const question of COACH_ASSESSMENT_QUESTIONS) {
    const slug = question.categorySlug as CoachCategorySlug;
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
 * Get category order for coach assessment flow
 */
export function getCoachCategoryOrder(): CoachCategorySlug[] {
  return [
    'goalie_knowledge',
    'current_approach',
    'pre_game',
    'in_game',
    'post_game',
    'coaching_goals',
    'preferences',
  ];
}

/**
 * Get total number of coach assessment questions
 */
export function getCoachTotalQuestionCount(): number {
  return COACH_ASSESSMENT_QUESTIONS.length;
}
