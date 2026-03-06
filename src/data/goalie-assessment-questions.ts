import { AssessmentQuestion, GoalieCategorySlug, CategoryWeight } from '@/types';

/**
 * Goalie Assessment Questions (Getting to Know You)
 * Based on Michael's Goalie Questionnaire Spec (02-goalie-questionnaire-spec.md)
 * With exact scoring from the Scoring Assignment Guide (09-scoring-assignment-guide.md)
 *
 * 7 categories, all selection-based
 * Educational tooltips throughout
 * Language speaks directly to the goalie
 */

/**
 * Category weights for goalie assessment
 * Per Michael's specification (05-assessment-scoring-engine.md)
 */
export const GOALIE_ASSESSMENT_WEIGHTS: CategoryWeight[] = [
  { categorySlug: 'feelings', weight: 15, name: 'How You Feel About Being a Goalie', description: 'Mental resilience, confidence, emotional response' },
  { categorySlug: 'knowledge', weight: 25, name: 'What You Know About Your Position', description: 'Understanding of goaltending fundamentals' },
  { categorySlug: 'pre_game', weight: 10, name: 'Before the Game', description: 'Pre-game routines and preparation' },
  { categorySlug: 'in_game', weight: 25, name: 'During the Game', description: 'In-game awareness and competing' },
  { categorySlug: 'post_game', weight: 10, name: 'After the Game', description: 'Self-evaluation and reflection' },
  { categorySlug: 'training', weight: 10, name: 'Your Training and Development', description: 'Training habits and practice engagement' },
  { categorySlug: 'learning', weight: 5, name: 'How You Want to Learn', description: 'Learning preferences and style' },
];

export const GOALIE_ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // ===========================================
  // CATEGORY 1: How You Feel About Being a Goalie (15%)
  // ===========================================
  {
    id: 'goalie-q1-1',
    categorySlug: 'feelings',
    questionCode: 'Q1.1',
    type: 'single_select',
    question: 'How do you feel about playing goalie right now?',
    tooltip: "Goaltending starts in your head before it ever reaches your body. How you feel about the position, how you handle pressure, how you bounce back — this is where development begins. There are no wrong answers here.",
    isRequired: true,
    order: 1,
    options: [
      { id: 'q1-1-a', text: 'I love it — this is my position', score: 4.0 },
      { id: 'q1-1-b', text: 'I like it most of the time but it can be tough', score: 3.0 },
      { id: 'q1-1-c', text: "I'm not sure how I feel about it anymore", score: 2.0 },
      { id: 'q1-1-d', text: "It's hard — I feel a lot of pressure", score: 2.0 },
      { id: 'q1-1-e', text: "I'm just trying it out — still figuring out if it's for me", score: 1.5 },
    ],
  },
  {
    id: 'goalie-q1-2',
    categorySlug: 'feelings',
    questionCode: 'Q1.2',
    type: 'single_select',
    question: 'When you let in a goal, what usually goes through your mind?',
    isRequired: true,
    order: 2,
    requiresReview: true,
    reviewNote: "MICHAEL REVIEW: 'shake it off' scored 3 — could be composure or avoidance. Your call.",
    options: [
      { id: 'q1-2-a', text: 'I shake it off and focus on the next shot', score: 3.0 },
      { id: 'q1-2-b', text: 'I get frustrated but I try to move on', score: 2.5 },
      { id: 'q1-2-c', text: 'I replay it in my head and it bothers me', score: 2.0 },
      { id: 'q1-2-d', text: "I feel like it's always my fault", score: 1.5 },
      { id: 'q1-2-e', text: 'It depends on the goal — some bother me more than others', score: 3.5 },
    ],
  },
  {
    id: 'goalie-q1-3',
    categorySlug: 'feelings',
    questionCode: 'Q1.3',
    type: 'single_select',
    question: 'How would you describe your confidence level right now?',
    isRequired: true,
    order: 3,
    options: [
      { id: 'q1-3-a', text: 'High — I trust myself in net', score: 4.0 },
      { id: 'q1-3-b', text: 'Pretty good — but a bad game can shake it', score: 3.0 },
      { id: 'q1-3-c', text: "It's building — I'm getting there", score: 2.5 },
      { id: 'q1-3-d', text: 'Low — I doubt myself a lot', score: 1.5 },
      { id: 'q1-3-e', text: 'Up and down — it changes game to game', score: 2.0 },
    ],
  },
  {
    id: 'goalie-q1-4',
    categorySlug: 'feelings',
    questionCode: 'Q1.4',
    type: 'single_select',
    question: "Do you ever feel like you're on your own out there — like nobody on your team understands what you're going through?",
    isRequired: true,
    order: 4,
    options: [
      { id: 'q1-4-a', text: 'Yes — all the time', score: 1.5 },
      { id: 'q1-4-b', text: 'Sometimes — depends on the team and the coach', score: 2.5 },
      { id: 'q1-4-c', text: 'Not really — I have good support', score: 3.5 },
      { id: 'q1-4-d', text: 'I never thought about it that way', score: 2.0 },
    ],
  },

  // ===========================================
  // CATEGORY 2: What You Know About Your Position (25%)
  // ===========================================
  {
    id: 'goalie-q2-1',
    categorySlug: 'knowledge',
    questionCode: 'Q2.1',
    type: 'single_select',
    question: 'Has anyone ever taught you how to play goalie — not just put you in net, but actually taught you the position?',
    tooltip: 'No wrong answers — this helps Smarter Goalie know where to start.',
    isRequired: true,
    order: 1,
    options: [
      { id: 'q2-1-a', text: "Yes — I've had proper goalie coaching", score: 4.0 },
      { id: 'q2-1-b', text: "Some — I've picked up bits from camps or clinics", score: 2.5 },
      { id: 'q2-1-c', text: "Not really — I've mostly figured it out on my own", score: 1.5 },
      { id: 'q2-1-d', text: 'No — nobody has ever taught me the position', score: 1.0 },
    ],
  },
  {
    id: 'goalie-q2-2',
    categorySlug: 'knowledge',
    questionCode: 'Q2.2',
    type: 'single_select',
    question: 'Do you know why you move to certain spots in your crease, or do you just react to the puck?',
    isRequired: true,
    order: 2,
    options: [
      { id: 'q2-2-a', text: 'I understand positioning and why I go where I go', score: 4.0 },
      { id: 'q2-2-b', text: "I have some idea but it's mostly instinct", score: 2.5 },
      { id: 'q2-2-c', text: 'I mostly just react — I go where the puck goes', score: 1.5 },
      { id: 'q2-2-d', text: "I'm not sure — I've never thought about it that way", score: 1.0 },
    ],
  },
  {
    id: 'goalie-q2-3',
    categorySlug: 'knowledge',
    questionCode: 'Q2.3',
    type: 'single_select',
    question: 'When you make a save, can you usually explain what you did right?',
    isRequired: true,
    order: 3,
    options: [
      { id: 'q2-3-a', text: 'Yes — I can break down what I did and why it worked', score: 4.0 },
      { id: 'q2-3-b', text: 'Sometimes — on the easy ones', score: 2.5 },
      { id: 'q2-3-c', text: 'Not really — I just know I stopped the puck', score: 1.5 },
      { id: 'q2-3-d', text: 'No — it all happens too fast to think about', score: 1.0 },
    ],
  },
  {
    id: 'goalie-q2-4',
    categorySlug: 'knowledge',
    questionCode: 'Q2.4',
    type: 'single_select',
    question: 'When you let in a goal, can you usually figure out what went wrong?',
    isRequired: true,
    order: 4,
    options: [
      { id: 'q2-4-a', text: 'Yes — I can usually identify my mistake', score: 4.0 },
      { id: 'q2-4-b', text: "Sometimes — if it's obvious", score: 2.5 },
      { id: 'q2-4-c', text: 'Rarely — I just know the puck went in', score: 1.5 },
      { id: 'q2-4-d', text: "No — I usually don't know what I could have done differently", score: 1.0 },
    ],
  },

  // ===========================================
  // CATEGORY 3: Before the Game (10%)
  // ===========================================
  {
    id: 'goalie-q3-1',
    categorySlug: 'pre_game',
    questionCode: 'Q3.1',
    type: 'single_select',
    question: 'Do you have a pre-game routine — things you do the same way before every game?',
    tooltip: "The game doesn't start when the puck drops — it starts long before that. How you prepare at home, in the car, in the dressing room, and during warm-up all set the stage for how you'll perform. Smarter Goalie will teach you how to build a pre-game routine that works for you.",
    isRequired: true,
    order: 1,
    options: [
      { id: 'q3-1-a', text: 'Yes — I have a routine I follow every time', score: 4.0 },
      { id: 'q3-1-b', text: 'Kind of — I have some habits but nothing planned out', score: 2.5 },
      { id: 'q3-1-c', text: 'No — every game day is different', score: 1.5 },
      { id: 'q3-1-d', text: "I'm not sure what a pre-game routine is", score: 1.0 },
    ],
  },
  {
    id: 'goalie-q3-2',
    categorySlug: 'pre_game',
    questionCode: 'Q3.2',
    type: 'single_select',
    question: 'How do you usually feel before a game?',
    isRequired: true,
    order: 2,
    requiresReview: true,
    reviewNote: "MICHAEL REVIEW: 'Quiet — I go inside my own head' scored 2.5 as neutral. Could be focus or anxiety. Your call.",
    options: [
      { id: 'q3-2-a', text: "Calm and ready — I'm looking forward to it", score: 4.0 },
      { id: 'q3-2-b', text: 'Excited — I get pumped up', score: 3.0 },
      { id: 'q3-2-c', text: 'Nervous — I feel butterflies or stress', score: 2.0 },
      { id: 'q3-2-d', text: 'Quiet — I go inside my own head', score: 2.5 },
      { id: 'q3-2-e', text: 'It changes every time — no pattern', score: 1.5 },
    ],
  },
  {
    id: 'goalie-q3-3',
    categorySlug: 'pre_game',
    questionCode: 'Q3.3',
    type: 'single_select',
    question: 'During warm-up, what are you focused on?',
    isRequired: true,
    order: 3,
    options: [
      { id: 'q3-3-a', text: 'Getting my body loose and tracking the puck', score: 4.0 },
      { id: 'q3-3-b', text: 'Just stopping everything — I want to feel sharp', score: 3.0 },
      { id: 'q3-3-c', text: 'Nothing specific — I just take shots', score: 2.0 },
      { id: 'q3-3-d', text: "I get nervous during warm-up if I'm not stopping pucks", score: 1.5 },
      { id: 'q3-3-e', text: "I've never thought about what I should focus on during warm-up", score: 1.0 },
    ],
  },
  {
    id: 'goalie-q3-4',
    categorySlug: 'pre_game',
    questionCode: 'Q3.4',
    type: 'single_select',
    question: 'Does anyone talk to you before the game about what to expect or how to prepare mentally?',
    isRequired: true,
    order: 4,
    options: [
      { id: 'q3-4-a', text: 'Yes — my coach or goalie coach talks to me', score: 4.0 },
      { id: 'q3-4-b', text: 'Sometimes — my parent gives me reminders', score: 2.5 },
      { id: 'q3-4-c', text: 'No — nobody talks to me specifically before games', score: 1.5 },
      { id: 'q3-4-d', text: 'No — and I wish someone would', score: 2.0 },
    ],
  },

  // ===========================================
  // CATEGORY 4: During the Game (25%)
  // ===========================================
  {
    id: 'goalie-q4-1',
    categorySlug: 'in_game',
    questionCode: 'Q4.1',
    type: 'single_select',
    question: 'During a game, where are your eyes most of the time?',
    tooltip: "Competing as a goalie isn't just about trying hard. It's about how you see the puck, how you read the play, and how your eyes, mind, and body work together. Smarter Goalie will teach you what competing really means for a goalie.",
    isRequired: true,
    order: 1,
    options: [
      { id: 'q4-1-a', text: 'On the puck — I follow it everywhere', score: 3.0 },
      { id: 'q4-1-b', text: 'On the player with the puck', score: 2.5 },
      { id: 'q4-1-c', text: 'I try to watch the puck and the players around it', score: 4.0 },
      { id: 'q4-1-d', text: "Honestly, I'm not sure — it all happens fast", score: 1.5 },
      { id: 'q4-1-e', text: 'It depends on the situation', score: 3.5 },
    ],
  },
  {
    id: 'goalie-q4-2',
    categorySlug: 'in_game',
    questionCode: 'Q4.2',
    type: 'single_select',
    question: 'When the other team is passing the puck around in your zone, what do you do?',
    isRequired: true,
    order: 2,
    options: [
      { id: 'q4-2-a', text: 'I move with the puck and try to stay in position', score: 4.0 },
      { id: 'q4-2-b', text: 'I watch the puck and react when the shot comes', score: 2.5 },
      { id: 'q4-2-c', text: "I get confused — I don't always know where to be", score: 1.5 },
      { id: 'q4-2-d', text: 'I freeze sometimes — too many things happening at once', score: 1.0 },
      { id: 'q4-2-e', text: 'I try to track it but I lose it sometimes', score: 2.0 },
    ],
  },
  {
    id: 'goalie-q4-3',
    categorySlug: 'in_game',
    questionCode: 'Q4.3',
    type: 'single_select',
    question: 'After you let in a goal during a game, how quickly do you refocus?',
    isRequired: true,
    order: 3,
    requiresReview: true,
    reviewNote: "MICHAEL REVIEW: 'Right away' scored 3 — true refocus includes rapid clinical self-evaluation, not just shaking it off. Confirm this aligns.",
    options: [
      { id: 'q4-3-a', text: "Right away — I'm ready for the next play", score: 3.0 },
      { id: 'q4-3-b', text: 'It takes me a few seconds but I get back', score: 2.5 },
      { id: 'q4-3-c', text: 'It depends on the goal — some shake me more than others', score: 3.0 },
      { id: 'q4-3-d', text: "It takes me a while — I'm still thinking about it the next shift", score: 1.5 },
      { id: 'q4-3-e', text: 'I struggle with this — one goal can ruin my whole game', score: 1.0 },
    ],
  },
  {
    id: 'goalie-q4-4',
    categorySlug: 'in_game',
    questionCode: 'Q4.4',
    type: 'single_select',
    question: 'Do you notice your own performance changing as the game goes on — like starting slow, playing great in the second period, or fading in the third?',
    isRequired: true,
    order: 4,
    options: [
      { id: 'q4-4-a', text: 'Yes — I notice patterns in how I play across the game', score: 4.0 },
      { id: 'q4-4-b', text: "Sometimes — but I haven't really tracked it", score: 2.5 },
      { id: 'q4-4-c', text: "No — I don't pay attention to that", score: 1.5 },
      { id: 'q4-4-d', text: "Now that you mention it, maybe — I'm not sure", score: 2.0 },
    ],
  },

  // ===========================================
  // CATEGORY 5: After the Game (10%)
  // ===========================================
  {
    id: 'goalie-q5-1',
    categorySlug: 'post_game',
    questionCode: 'Q5.1',
    type: 'single_select',
    question: 'After a game, do you think about how you played?',
    isRequired: true,
    order: 1,
    requiresReview: true,
    reviewNote: "MICHAEL REVIEW: 'I replay the game in my head' scored 3 — could be constructive review or destructive rumination. Your lens on this?",
    options: [
      { id: 'q5-1-a', text: 'Yes — I replay the game in my head', score: 3.0 },
      { id: 'q5-1-b', text: 'Yes — but only if it was a bad game', score: 2.0 },
      { id: 'q5-1-c', text: 'Sometimes — if a specific goal is bothering me', score: 2.0 },
      { id: 'q5-1-d', text: 'Not really — I move on pretty quickly', score: 2.5 },
      { id: 'q5-1-e', text: 'I try not to think about it', score: 1.5 },
    ],
  },
  {
    id: 'goalie-q5-2',
    categorySlug: 'post_game',
    questionCode: 'Q5.2',
    type: 'single_select',
    question: 'When you think about your game, what do you focus on?',
    isRequired: true,
    order: 2,
    options: [
      { id: 'q5-2-a', text: 'Mostly the goals I let in — what went wrong', score: 2.0 },
      { id: 'q5-2-b', text: 'Mostly the saves I made — what went right', score: 2.5 },
      { id: 'q5-2-c', text: 'A mix of both — good and bad', score: 4.0 },
      { id: 'q5-2-d', text: 'I focus on how I felt more than specific plays', score: 2.0 },
      { id: 'q5-2-e', text: "I don't really know how to evaluate my own game", score: 1.5 },
    ],
  },
  {
    id: 'goalie-q5-3',
    categorySlug: 'post_game',
    questionCode: 'Q5.3',
    type: 'single_select',
    question: 'Does anyone talk to you after the game about your performance?',
    isRequired: true,
    order: 3,
    options: [
      { id: 'q5-3-a', text: 'My coach gives me specific feedback', score: 4.0 },
      { id: 'q5-3-b', text: 'My parent talks to me about the game', score: 2.5 },
      { id: 'q5-3-c', text: 'My goalie coach reviews my games with me', score: 4.0 },
      { id: 'q5-3-d', text: "People say general things like 'good game' or 'tough one'", score: 2.0 },
      { id: 'q5-3-e', text: 'Nobody really talks to me about my game specifically', score: 1.5 },
    ],
  },
  {
    id: 'goalie-q5-4',
    categorySlug: 'post_game',
    questionCode: 'Q5.4',
    type: 'single_select',
    question: 'Would you be interested in learning how to evaluate your own game — so you can see what you did well and what to work on, without needing someone else to tell you?',
    isRequired: true,
    order: 4,
    options: [
      { id: 'q5-4-a', text: "Yes — that's exactly what I want", score: 4.0 },
      { id: 'q5-4-b', text: "I think so — if it's not too complicated", score: 3.0 },
      { id: 'q5-4-c', text: "Maybe — I'd need to understand how", score: 2.5 },
      { id: 'q5-4-d', text: "I'm not sure — I've never tried anything like that", score: 2.0 },
    ],
  },

  // ===========================================
  // CATEGORY 6: Your Training and Development (10%)
  // ===========================================
  {
    id: 'goalie-q6-1',
    categorySlug: 'training',
    questionCode: 'Q6.1',
    type: 'single_select',
    question: 'Outside of team practice and games, what do you currently do to develop your goalie skills?',
    isRequired: true,
    order: 1,
    options: [
      { id: 'q6-1-a', text: 'I work with a goalie coach regularly', score: 4.0 },
      { id: 'q6-1-b', text: 'I do some training on my own — drills, exercises, video', score: 3.0 },
      { id: 'q6-1-c', text: 'I go to goalie camps or clinics occasionally', score: 2.5 },
      { id: 'q6-1-d', text: 'Nothing — games and team practice are all I do', score: 1.5 },
      { id: 'q6-1-e', text: "I want to do more but I don't know what to do", score: 2.0 },
    ],
  },
  {
    id: 'goalie-q6-2',
    categorySlug: 'training',
    questionCode: 'Q6.2',
    type: 'single_select',
    question: 'During team practice, do you feel like you\'re actually developing as a goalie, or are you mostly just taking shots?',
    isRequired: true,
    order: 2,
    options: [
      { id: 'q6-2-a', text: "I'm developing — the practice structure helps me grow", score: 4.0 },
      { id: 'q6-2-b', text: "Some drills help me, most don't", score: 2.5 },
      { id: 'q6-2-c', text: "I'm mostly just a target for shooters", score: 1.5 },
      { id: 'q6-2-d', text: "I don't feel like I'm getting much out of team practice as a goalie", score: 1.5 },
      { id: 'q6-2-e', text: "I've never thought about whether practice is helping me develop", score: 1.0 },
    ],
  },
  {
    id: 'goalie-q6-3',
    categorySlug: 'training',
    questionCode: 'Q6.3',
    type: 'single_select',
    question: 'How much time per week could you commit to working on your goalie game outside of team practice?',
    isRequired: true,
    order: 3,
    options: [
      { id: 'q6-3-a', text: '15-30 minutes', score: 2.0 },
      { id: 'q6-3-b', text: '30-60 minutes', score: 3.0 },
      { id: 'q6-3-c', text: 'More than 60 minutes', score: 4.0 },
      { id: 'q6-3-d', text: "I'm not sure — depends on my schedule", score: 2.0 },
      { id: 'q6-3-e', text: "I'd make time if I knew what to do", score: 3.0 },
    ],
  },
  {
    id: 'goalie-q6-4',
    categorySlug: 'training',
    questionCode: 'Q6.4',
    type: 'single_select',
    question: 'If Smarter Goalie gave you a structured training plan you could follow on your own — at home, off-ice, or at the rink — would you use it?',
    isRequired: true,
    order: 4,
    options: [
      { id: 'q6-4-a', text: "Absolutely — that's what I need", score: 4.0 },
      { id: 'q6-4-b', text: "Probably — if it's easy to follow and makes sense", score: 3.0 },
      { id: 'q6-4-c', text: 'Maybe — depends on what it looks like', score: 2.5 },
      { id: 'q6-4-d', text: "I'm not sure — I'd need to see it first", score: 2.0 },
    ],
  },

  // ===========================================
  // CATEGORY 7: How You Want to Learn (5%)
  // Note: This category informs content delivery, not level
  // ===========================================
  {
    id: 'goalie-q7-1',
    categorySlug: 'learning',
    questionCode: 'Q7.1',
    type: 'single_select',
    question: 'How do you learn best?',
    tooltip: 'This helps us show you content in the way that works best for you.',
    isRequired: true,
    order: 1,
    options: [
      { id: 'q7-1-a', text: "Watching videos — show me and I'll figure it out", score: 3.0 },
      { id: 'q7-1-b', text: 'Reading and looking at diagrams — explain it to me step by step', score: 3.0 },
      { id: 'q7-1-c', text: 'Doing it — I learn by trying', score: 3.0 },
      { id: 'q7-1-d', text: 'A mix — different things work for different skills', score: 3.0 },
      { id: 'q7-1-e', text: "I'm not sure — nobody has ever asked me that", score: 2.0 },
    ],
  },
  {
    id: 'goalie-q7-2',
    categorySlug: 'learning',
    questionCode: 'Q7.2',
    type: 'single_select',
    question: 'Would you be interested in watching video of your own games and practices to learn from them?',
    isRequired: true,
    order: 2,
    options: [
      { id: 'q7-2-a', text: "Yes — I'd love to review my own footage", score: 4.0 },
      { id: 'q7-2-b', text: "I think so — but I'd need help knowing what to look for", score: 3.0 },
      { id: 'q7-2-c', text: "Maybe — I've never done it before", score: 2.5 },
      { id: 'q7-2-d', text: 'No — that sounds stressful', score: 1.5 },
    ],
  },
  {
    id: 'goalie-q7-3',
    categorySlug: 'learning',
    questionCode: 'Q7.3',
    type: 'single_select',
    question: 'How would you like to track your progress?',
    isRequired: true,
    order: 3,
    options: [
      { id: 'q7-3-a', text: 'Charts and stats I can see over time', score: 3.5 },
      { id: 'q7-3-b', text: 'Levels I can unlock as I get better', score: 3.0 },
      { id: 'q7-3-c', text: "Feedback from coaches or the system telling me how I'm doing", score: 3.0 },
      { id: 'q7-3-d', text: "I don't really care about tracking — I just want to get better", score: 2.0 },
      { id: 'q7-3-e', text: 'A combination of all of that', score: 4.0 },
    ],
  },
  {
    id: 'goalie-q7-4',
    categorySlug: 'learning',
    questionCode: 'Q7.4',
    type: 'single_select',
    question: 'If you had a question about goaltending or your development, how would you want to get an answer?',
    tooltip: 'This helps us know how to best support you.',
    isRequired: true,
    order: 4,
    options: [
      { id: 'q7-4-a', text: 'Ask Claude AI within Smarter Goalie (instant response)', score: 3.0 },
      { id: 'q7-4-b', text: 'Send a message and wait for a response', score: 3.0 },
      { id: 'q7-4-c', text: 'Look it up in a guide or FAQ', score: 3.0 },
      { id: 'q7-4-d', text: "I'd want to talk to a real person", score: 3.0 },
    ],
  },
];

/**
 * Get assessment questions grouped by category
 */
export function getQuestionsByCategory(): Map<GoalieCategorySlug, AssessmentQuestion[]> {
  const grouped = new Map<GoalieCategorySlug, AssessmentQuestion[]>();

  for (const question of GOALIE_ASSESSMENT_QUESTIONS) {
    const slug = question.categorySlug as GoalieCategorySlug;
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
 * Get questions for a specific category
 */
export function getQuestionsForCategory(categorySlug: GoalieCategorySlug): AssessmentQuestion[] {
  return GOALIE_ASSESSMENT_QUESTIONS
    .filter(q => q.categorySlug === categorySlug)
    .sort((a, b) => a.order - b.order);
}

/**
 * Get total number of assessment questions
 */
export function getTotalQuestionCount(): number {
  return GOALIE_ASSESSMENT_QUESTIONS.length;
}

/**
 * Get question count per category
 */
export function getQuestionCountByCategory(): Record<GoalieCategorySlug, number> {
  const counts: Record<string, number> = {};

  for (const question of GOALIE_ASSESSMENT_QUESTIONS) {
    counts[question.categorySlug] = (counts[question.categorySlug] || 0) + 1;
  }

  return counts as Record<GoalieCategorySlug, number>;
}

/**
 * Get category order for assessment flow
 */
export function getCategoryOrder(): GoalieCategorySlug[] {
  return [
    'feelings',
    'knowledge',
    'pre_game',
    'in_game',
    'post_game',
    'training',
    'learning',
  ];
}

/**
 * Get questions that require Michael's review
 */
export function getQuestionsRequiringReview(): AssessmentQuestion[] {
  return GOALIE_ASSESSMENT_QUESTIONS.filter(q => q.requiresReview);
}
