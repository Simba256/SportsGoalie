import { Timestamp } from 'firebase/firestore';
import {
  AssessmentResponse,
  AssessmentQuestion,
  IntelligenceProfile,
  IntelligenceScore,
  GoalieAgeRange,
} from '@/types';
import { generateIntelligenceProfile } from './intelligence-profile';

// ─── Scale converters ─────────────────────────────────────────────────────────

function scaleToScore(val: string): IntelligenceScore {
  const n = parseInt(val, 10);
  if (isNaN(n) || n < 1 || n > 5) return 2.0;
  // Maps 1→1.0, 2→1.75, 3→2.5, 4→3.25, 5→4.0
  return (1.0 + (n - 1) * 0.75) as IntelligenceScore;
}

function scale3ToScore(val: string): IntelligenceScore {
  if (val === '1') return 1.0;
  if (val === '2') return 2.5;
  if (val === '3') return 4.0;
  return 2.0;
}

// Higher values mean more rumination/negativity → inverted mapping
function invertedScaleToScore(val: string): IntelligenceScore {
  const n = parseInt(val, 10);
  if (isNaN(n) || n < 1 || n > 5) return 2.0;
  // Maps 1→4.0, 2→3.25, 3→2.5, 4→1.75, 5→1.0
  return (4.0 - (n - 1) * 0.75) as IntelligenceScore;
}

// ─── Scoring entry type ───────────────────────────────────────────────────────

interface ScoringEntry {
  categorySlug: string;
  questionText: string;
  getScore: (val: string) => IntelligenceScore;
}

// ─── STUDENT V2 scoring map ───────────────────────────────────────────────────
// 22 scoreable questions across 7 categories (feelings 15%, knowledge 25%,
// pre_game 10%, in_game 25%, post_game 10%, training 10%, learning 5%)

const STUDENT_SCORING_MAP: Record<string, ScoringEntry> = {

  // ── FEELINGS (15%) ──────────────────────────────────────────────────────────
  D1: {
    categorySlug: 'feelings',
    questionText: 'How confident do you feel before most games?',
    getScore: scaleToScore,
  },
  D6: {
    categorySlug: 'feelings',
    questionText: 'When the game is on the line — what shows up in you?',
    getScore: (val) => (({
      'D6-1': 4.0,    // Calm — I want the puck on net
      'D6-2': 3.5,    // Focused — I lock in tighter
      'D6-3': 3.0,    // Nervous but ready
      'D6-4': 1.5,    // Anxious — it can shake me
      'D6-5': 2.5,    // Mixed — depends on the night
      'D6-open': 2.5,
      'D6-6': 2.0,    // I'm not sure yet
    } as Record<string, number>)[val] ?? 2.0) as IntelligenceScore,
  },
  F1: {
    categorySlug: 'feelings',
    questionText: 'When things get tough — what is the first voice you hear in your head?',
    getScore: (val) => (({
      'F1-1': 4.0,    // "You got this — shake it off."
      'F1-2': 3.5,    // "It's okay, the next save is yours."
      'F1-3': 1.5,    // "You're letting the team down."
      'F1-4': 1.0,    // "You're not good enough today."
      'F1-5': 1.0,    // "You suck."
      'F1-6': 2.5,    // Both voices — depends on the moment
      'F1-open': 2.5,
      'F1-7': 2.0,    // I'm not sure yet
    } as Record<string, number>)[val] ?? 2.0) as IntelligenceScore,
  },
  F2: {
    categorySlug: 'feelings',
    questionText: 'Which voice tends to be louder for you overall?',
    getScore: scale3ToScore, // 1→negative louder, 2→equal, 3→supportive louder
  },
  F10: {
    categorySlug: 'feelings',
    questionText: 'Do you see yourself as a quitter?',
    getScore: (val) => (({
      'F10-no': 4.0,
      'F10-some': 2.5,
      'F10-yes': 1.0,
      'F10-ns': 2.0,
    } as Record<string, number>)[val] ?? 2.0) as IntelligenceScore,
  },
  F11: {
    categorySlug: 'feelings',
    questionText: 'Do you see yourself as someone who faces daunting tasks and gives it a go anyway?',
    getScore: (val) => (({
      'F11-1': 4.0,   // Yes — that's me
      'F11-2': 3.5,   // Most of the time, yes
      'F11-3': 2.5,   // Sometimes — depends on what it is
      'F11-4': 1.5,   // Honestly, not really
      'F11-5': 2.0,   // I'm not sure yet
    } as Record<string, number>)[val] ?? 2.0) as IntelligenceScore,
  },

  // ── KNOWLEDGE (25%) ─────────────────────────────────────────────────────────
  C3: {
    categorySlug: 'knowledge',
    questionText: 'How would you rate yourself as a goalie so far?',
    getScore: scaleToScore,
  },
  C4: {
    categorySlug: 'knowledge',
    questionText: 'Are you a better goalie than when you started?',
    getScore: (val) => (({
      'C4-1': 4.0,    // Yes — a lot better
      'C4-2': 3.0,    // Yes — some growth
      'C4-3': 2.0,    // About the same
      'C4-4': 1.0,    // Honestly, I have struggled
      'C4-5': 2.0,    // I'm not sure yet
    } as Record<string, number>)[val] ?? 2.0) as IntelligenceScore,
  },
  C7: {
    categorySlug: 'knowledge',
    questionText: 'Are you open to changing things in your game — even things you currently believe in?',
    getScore: (val) => (({
      'C7-1': 4.0,    // Yes — I am open to whatever helps me grow
      'C7-2': 3.0,    // Mostly yes — but I trust what is already working
      'C7-3': 2.5,    // I am open, but it takes me time to change
      'C7-4': 1.5,    // Honestly, I struggle with change
      'C7-5': 2.0,    // I'm not sure yet
    } as Record<string, number>)[val] ?? 2.0) as IntelligenceScore,
  },
  E1: {
    categorySlug: 'knowledge',
    questionText: 'How well do you feel you know your own game?',
    getScore: scaleToScore,
  },

  // ── PRE_GAME (10%) ──────────────────────────────────────────────────────────
  D8: {
    categorySlug: 'pre_game',
    questionText: 'When do you start preparing for your next start?',
    getScore: (val) => (({
      'D8-1': 4.0,    // The night before
      'D8-2': 3.5,    // The morning of
      'D8-3': 3.0,    // A few hours before puck drop
      'D8-4': 2.0,    // Once I am at the rink
      'D8-5': 1.0,    // I don't have a set routine yet
      'D8-open': 2.5,
    } as Record<string, number>)[val] ?? 2.0) as IntelligenceScore,
  },
  A12: {
    categorySlug: 'pre_game',
    questionText: 'Was anything on the Smarter Goalie website overwhelming?',
    getScore: (val) => (({
      'A12-1': 4.0,   // No — it felt clear (strong cognitive readiness)
      'A12-2': 3.0,   // A little — but I want to keep going
      'A12-3': 1.5,   // Yes — it was a lot to take in
      'A12-4': 2.0,   // I'm still figuring it out
    } as Record<string, number>)[val] ?? 2.0) as IntelligenceScore,
  },

  // ── IN_GAME (25%) ───────────────────────────────────────────────────────────
  D4: {
    categorySlug: 'in_game',
    questionText: 'How often do you replay mistakes in your head DURING the game?',
    getScore: (val) => (({
      'D4-1': 4.0,    // I quickly process the goal — take what I can and move on
      'D4-2': 2.5,    // Sometimes it sticks for a shift or two
      'D4-3': 1.5,    // It causes tension that affects my next save
      'D4-4': 1.0,    // It throws me off the rest of the game
      'D4-5': 2.0,    // I'm not sure yet
    } as Record<string, number>)[val] ?? 2.0) as IntelligenceScore,
  },
  D4B: {
    categorySlug: 'in_game',
    questionText: 'How often do you replay mistakes in your head AFTER the game?',
    getScore: invertedScaleToScore, // Rarely(1)→4.0, All the time(5)→1.0
  },
  D5: {
    categorySlug: 'in_game',
    questionText: 'How well do you feel you read the play right now?',
    getScore: scaleToScore,
  },

  // ── POST_GAME (10%) ─────────────────────────────────────────────────────────
  C8: {
    categorySlug: 'post_game',
    questionText: 'Can you self-evaluate your game honestly — including the parts that need work?',
    getScore: scaleToScore,
  },
  C9: {
    categorySlug: 'post_game',
    questionText: 'When you reflect on your own game — are you harder on yourself than you should be, fair, or too easy?',
    getScore: (val) => (({
      'C9-1': 1.0,    // Very hard on myself (extreme self-criticism)
      'C9-2': 2.5,    // Sometimes hard on myself
      'C9-3': 4.0,    // Fair — I see what I did well and what I did not
      'C9-4': 2.0,    // Probably too easy on myself
      'C9-5': 2.0,    // I'm not sure yet
    } as Record<string, number>)[val] ?? 2.0) as IntelligenceScore,
  },

  // ── TRAINING (10%) ──────────────────────────────────────────────────────────
  B4: {
    categorySlug: 'training',
    questionText: 'How much do you feel you have trained your brain through sport?',
    getScore: scaleToScore,
  },
  B11: {
    categorySlug: 'training',
    questionText: 'Do you train physically off the ice?',
    getScore: (val) => (({
      'B11-1': 4.0,   // Yes — regular structured training
      'B11-2': 2.5,   // Yes — but inconsistent
      'B11-3': 2.0,   // Some — light or occasional
      'B11-4': 1.0,   // Not yet
      'B11-5': 1.5,   // I'm not sure what counts
    } as Record<string, number>)[val] ?? 2.0) as IntelligenceScore,
  },
  H2: {
    categorySlug: 'training',
    questionText: 'How much time can you commit to working on your game outside of team practice?',
    getScore: (val) => (({
      'H2-1': 2.0,    // 15–30 minutes a few times a week
      'H2-2': 3.0,    // 30–60 minutes a few times a week
      'H2-3': 4.0,    // 1–2 hours most days
      'H2-4': 4.0,    // Whatever it takes — I'm all in
      'H2-5': 1.5,    // I'm not sure yet
    } as Record<string, number>)[val] ?? 2.0) as IntelligenceScore,
  },
  G7: {
    categorySlug: 'training',
    questionText: 'How committed are you to your own development as a goalie?',
    getScore: scaleToScore,
  },

  // ── LEARNING (5%) ───────────────────────────────────────────────────────────
  G6: {
    categorySlug: 'learning',
    questionText: 'Is your motivation coming more from inside you — or from someone or something around you?',
    getScore: (val) => (({
      'G6-1': 4.0,    // Mostly internal — comes from me
      'G6-2': 2.0,    // Mostly external — comes from outside
      'G6-3': 3.0,    // A mix of both
      'G6-4': 2.0,    // I'm not sure yet
    } as Record<string, number>)[val] ?? 2.0) as IntelligenceScore,
  },
  G4: {
    categorySlug: 'learning',
    questionText: 'Where do you want goaltending to take you?',
    getScore: (val) => (({
      'G4-1': 3.0,    // Be the best I can be at my current level
      'G4-2': 3.5,    // Move up a level next season
      'G4-3': 3.5,    // Play high school / varsity
      'G4-4': 4.0,    // Play college, university, or junior
      'G4-5': 4.0,    // Play professionally one day
      'G4-6': 2.5,    // I just love playing — no specific destination
      'G4-open': 3.0,
      'G4-7': 2.0,    // I'm not sure yet
    } as Record<string, number>)[val] ?? 2.0) as IntelligenceScore,
  },
};

// ─── PARENT V2 scoring map ────────────────────────────────────────────────────
// 15 scoreable questions across 7 categories (goalie_state 10%, understanding 30%,
// pre_game 10%, car_ride_home 20%, development_role 15%, expectations 10%, preferences 5%)

const PARENT_SCORING_MAP: Record<string, ScoringEntry> = {

  // ── GOALIE_STATE (10%) ──────────────────────────────────────────────────────
  C2: {
    categorySlug: 'goalie_state',
    questionText: "How would you describe your goalie's consistency game to game?",
    getScore: scaleToScore,
  },
  C3: {
    categorySlug: 'goalie_state',
    questionText: "How would you describe your goalie's engagement level during practices?",
    getScore: scaleToScore,
  },
  C4: {
    categorySlug: 'goalie_state',
    questionText: 'How does your goalie recover from a bad goal during a game?',
    getScore: scaleToScore,
  },
  C5B: {
    categorySlug: 'goalie_state',
    questionText: "What do you usually see in your goalie's body language under pressure?",
    getScore: (val) => (({
      'C5B-1': 4.0,   // Emotional control — they stay composed
      'C5B-2': 3.0,   // Mostly composed — small slips
      'C5B-3': 2.5,   // Mixed — they can swing either way
      'C5B-4': 1.5,   // Visible frustration — body language drops
      'C5B-5': 1.0,   // Visible anxiety — tension shows
      'C5B-6': 2.0,   // Hard to tell
      'C5B-open': 2.5,
    } as Record<string, number>)[val] ?? 2.0) as IntelligenceScore,
  },
  C6: {
    categorySlug: 'goalie_state',
    questionText: 'When your goalie struggles — what voice do you hear coming from them?',
    getScore: (val) => (({
      'C6-1': 4.0,    // Mostly supportive — they bounce back
      'C6-2': 2.5,    // Mixed — depends on the day
      'C6-3': 1.0,    // Mostly hard on themselves — they spiral
      'C6-4': 2.0,    // Hard to tell — they keep it inside
      'C6-5': 2.0,    // I'm not sure
    } as Record<string, number>)[val] ?? 2.0) as IntelligenceScore,
  },

  // ── UNDERSTANDING (30%) ─────────────────────────────────────────────────────
  B2: {
    categorySlug: 'understanding',
    questionText: 'How familiar are you with the technical side of goaltending?',
    getScore: (val) => (({
      'B2-1': 1.0,    // Not familiar at all
      'B2-2': 2.0,    // Basic — I know some terminology
      'B2-3': 3.0,    // Moderate — I can follow what is being coached
      'B2-4': 4.0,    // Strong — I played, coached, or studied the position
    } as Record<string, number>)[val] ?? 2.0) as IntelligenceScore,
  },

  // ── PRE_GAME (10%) ──────────────────────────────────────────────────────────
  D1: {
    categorySlug: 'pre_game',
    questionText: "How would you describe your goalie's confidence — what you actually observe?",
    getScore: scaleToScore,
  },

  // ── CAR_RIDE_HOME (20%) ─────────────────────────────────────────────────────
  F1: {
    categorySlug: 'car_ride_home',
    questionText: 'What do you typically say to your goalie after a difficult game?',
    getScore: (val) => (({
      'F1-1': 3.0,    // I keep it positive and avoid the negatives
      'F1-2': 2.0,    // I review what happened and discuss the goals
      'F1-3': 4.0,    // I let them lead the conversation (best approach)
      'F1-4': 1.0,    // I sometimes say things I later regret
      'F1-5': 2.0,    // I am not always sure what to say
      'F1-open': 2.5,
    } as Record<string, number>)[val] ?? 2.0) as IntelligenceScore,
  },
  F3: {
    categorySlug: 'car_ride_home',
    questionText: 'Has your goalie ever asked you not to talk about the game on the car ride home?',
    getScore: (val) => (({
      'F3-1': 4.0,    // Yes — and I respect that
      'F3-2': 2.0,    // Yes — but I find it difficult
      'F3-3': 3.0,    // No — they are open to the conversation
      'F3-4': 2.0,    // We have not had this conversation yet
    } as Record<string, number>)[val] ?? 2.0) as IntelligenceScore,
  },
  F4: {
    categorySlug: 'car_ride_home',
    questionText: 'When your goalie is silent after a tough game — what do you usually do?',
    getScore: (val) => (({
      'F4-1': 4.0,    // I respect the silence and let them lead
      'F4-2': 3.0,    // I try to lighten the mood with something unrelated
      'F4-3': 3.5,    // I gently ask if they want to talk
      'F4-4': 1.5,    // I fill the silence — I find it uncomfortable
      'F4-open': 2.5,
      'F4-na': 2.5,
    } as Record<string, number>)[val] ?? 2.0) as IntelligenceScore,
  },
  F6: {
    categorySlug: 'car_ride_home',
    questionText: 'Have you ever said something on a car ride home that you wish you could take back?',
    getScore: (val) => (({
      'F6-1': 3.5,    // Yes — and I have apologized (accountability)
      'F6-2': 2.0,    // Yes — but I never brought it up afterward
      'F6-3': 3.0,    // Yes — and I am still working on it (growth orientation)
      'F6-4': 4.0,    // No — I have been careful
      'F6-5': 2.0,    // I'm not sure
    } as Record<string, number>)[val] ?? 2.0) as IntelligenceScore,
  },

  // ── DEVELOPMENT_ROLE (15%) ──────────────────────────────────────────────────
  B1: {
    categorySlug: 'development_role',
    questionText: "How would you describe your current involvement in your goalie's development?",
    getScore: (val) => (({
      'B1-1': 1.0,    // I attend games and that is the extent
      'B1-2': 2.0,    // I attend but lack deep knowledge
      'B1-3': 2.5,    // I try but feel I lack the knowledge
      'B1-4': 4.0,    // I am actively involved — finding resources, working with coaches
      'B1-open': 2.5,
    } as Record<string, number>)[val] ?? 2.0) as IntelligenceScore,
  },
  E1: {
    categorySlug: 'development_role',
    questionText: 'How did you react when your goalie first told you they wanted to play this position?',
    getScore: (val) => (({
      'E1-1': 4.0,    // I was excited and supportive right away
      'E1-2': 3.5,    // I was surprised — but I supported it
      'E1-3': 3.0,    // I was hesitant at first — but I have come around
      'E1-4': 2.0,    // I still worry about it
      'E1-5': 2.5,    // I am not the parent who was there for that moment
      'E1-open': 2.5,
    } as Record<string, number>)[val] ?? 2.0) as IntelligenceScore,
  },
  E4: {
    categorySlug: 'development_role',
    questionText: 'How do you typically behave when your goalie lets in a soft goal — in the stands?',
    getScore: (val) => (({
      'E4-1': 4.0,    // I stay quiet and supportive
      'E4-2': 1.5,    // I show visible disappointment
      'E4-3': 3.0,    // I keep it inside but I feel it
      'E4-4': 1.0,    // I sometimes react out loud
      'E4-5': 2.0,    // I'm not always sure how I come across
      'E4-6': 2.0,    // I had not thought about this before
    } as Record<string, number>)[val] ?? 2.0) as IntelligenceScore,
  },

  // ── EXPECTATIONS (10%) ──────────────────────────────────────────────────────
  D6: {
    categorySlug: 'expectations',
    questionText: 'Do you see your goalie as someone who quits when things get hard — or someone who stays the course?',
    getScore: (val) => (({
      'D6-1': 4.0,    // Stays the course — they push through
      'D6-2': 3.0,    // Mostly stays — but struggles sometimes
      'D6-3': 2.5,    // Mixed — depends on the situation
      'D6-4': 1.0,    // Quits when things get hard
      'D6-5': 2.0,    // I'm not sure yet
    } as Record<string, number>)[val] ?? 2.0) as IntelligenceScore,
  },

  // ── PREFERENCES (5%) ────────────────────────────────────────────────────────
  E6: {
    categorySlug: 'preferences',
    questionText: 'Would you welcome guidance from Smarter Goalie on how to be the most effective support person?',
    getScore: (val) => (({
      'E6-1': 4.0,    // Yes — I would love that guidance
      'E6-2': 3.5,    // Yes — I am open to it
      'E6-3': 2.5,    // Maybe — depending on the format
      'E6-4': 1.0,    // Not at this time
    } as Record<string, number>)[val] ?? 2.0) as IntelligenceScore,
  },
};

// ─── COACH V2 scoring map ─────────────────────────────────────────────────────
// 15 scoreable questions across 7 categories (goalie_knowledge 30%, current_approach 25%,
// pre_game 10%, in_game 15%, post_game 10%, coaching_goals 5%, preferences 5%)

const COACH_SCORING_MAP: Record<string, ScoringEntry> = {

  // ── GOALIE_KNOWLEDGE (30%) ──────────────────────────────────────────────────
  B1: {
    categorySlug: 'goalie_knowledge',
    questionText: 'How would you describe your personal knowledge of the goaltender position?',
    getScore: (val) => (({
      'B1-1': 1.0,    // Very little technical knowledge
      'B1-2': 2.0,    // Enough to support, rely on others for technical work
      'B1-3': 3.0,    // Some background from playing or observing closely
      'B1-4': 4.0,    // Studied the position and can guide in most areas
      'B1-5': 1.5,    // Still figuring out what I know
    } as Record<string, number>)[val] ?? 2.0) as IntelligenceScore,
  },
  B3: {
    categorySlug: 'goalie_knowledge',
    questionText: 'How comfortable are you giving technical feedback to your goaltender right now?',
    getScore: scaleToScore,
  },
  E7: {
    categorySlug: 'goalie_knowledge',
    questionText: 'How aware are you of the unique psychological demands on the goaltender position?',
    getScore: scaleToScore,
  },

  // ── CURRENT_APPROACH (25%) ──────────────────────────────────────────────────
  E1: {
    categorySlug: 'current_approach',
    questionText: 'When you have two goaltenders — do you identify one as the stronger of the two?',
    getScore: (val) => (({
      'E1-1': 2.0,    // Yes — I clearly identify #1 and backup
      'E1-2': 3.5,    // Yes — but I treat them on par publicly
      'E1-3': 2.5,    // Sometimes — depending on the season's flow
      'E1-4': 4.0,    // No — I treat them as on par, both can start any game
      'E1-5': 2.0,    // I had not formalized this in my mind before
    } as Record<string, number>)[val] ?? 2.0) as IntelligenceScore,
  },
  E3: {
    categorySlug: 'current_approach',
    questionText: 'When you know which goalie is starting — when do you typically tell them?',
    getScore: (val) => (({
      'E3-1': 4.0,    // The day before
      'E3-2': 3.5,    // The morning of
      'E3-3': 2.5,    // Upon arrival at the rink
      'E3-4': 1.5,    // During warm-up
      'E3-5': 2.0,    // It varies game to game
      'E3-6': 1.0,    // I do not formally tell them — they figure it out
    } as Record<string, number>)[val] ?? 2.0) as IntelligenceScore,
  },
  E5: {
    categorySlug: 'current_approach',
    questionText: 'Do you have a defined role for the backup goalie on game days?',
    getScore: (val) => (({
      'E5-1': 4.0,    // Yes — clear, meaningful role
      'E5-2': 3.0,    // Yes — but informal
      'E5-3': 2.5,    // Somewhat — depends on the game
      'E5-4': 1.5,    // No — I have not defined this
      'E5-5': 1.0,    // I had not thought about this before
    } as Record<string, number>)[val] ?? 2.0) as IntelligenceScore,
  },
  E6: {
    categorySlug: 'current_approach',
    questionText: 'Before a big game — how do you typically approach your goalie?',
    getScore: (val) => (({
      'E6-1': 3.0,    // I keep things normal — no special treatment
      'E6-2': 4.0,    // I have a calm, supportive pre-game conversation
      'E6-3': 3.0,    // I pump them up with confidence-building words
      'E6-4': 3.5,    // I let them lead — I follow their energy
      'E6-5': 2.0,    // I am not always sure what to say
      'E6-open': 3.0,
    } as Record<string, number>)[val] ?? 2.0) as IntelligenceScore,
  },
  E8: {
    categorySlug: 'current_approach',
    questionText: "Do you understand how much your actions and words can affect the goalie's mind?",
    getScore: (val) => (({
      'E8-1': 4.0,    // Yes — I am acutely aware and try to coach accordingly
      'E8-2': 3.0,    // Yes — but I know I have room to grow in this area
      'E8-3': 2.5,    // I am aware in theory but do not always act on it
      'E8-4': 1.5,    // Honestly — I have not thought about this enough
      'E8-5': 2.0,    // This question is opening my eyes right now
    } as Record<string, number>)[val] ?? 2.0) as IntelligenceScore,
  },
  E9: {
    categorySlug: 'current_approach',
    questionText: 'Do you regularly check in with your goalie about how they are FEELING — beyond their play?',
    getScore: (val) => (({
      'E9-1': 4.0,    // Yes — regularly
      'E9-2': 3.0,    // Sometimes — when something stands out
      'E9-3': 2.0,    // Rarely — I focus on the play
      'E9-4': 1.5,    // No — I have not made this a habit
      'E9-5': 1.0,    // I had not considered this as a coaching responsibility
    } as Record<string, number>)[val] ?? 2.0) as IntelligenceScore,
  },

  // ── PRE_GAME (10%) ──────────────────────────────────────────────────────────
  E4: {
    categorySlug: 'pre_game',
    questionText: 'How important do you feel it is for a goalie to know in advance when they are starting?',
    getScore: scaleToScore,
  },

  // ── IN_GAME (15%) ───────────────────────────────────────────────────────────
  D2: {
    categorySlug: 'in_game',
    questionText: "How would you rate your goalie's consistency game to game?",
    getScore: scaleToScore,
  },
  D3: {
    categorySlug: 'in_game',
    questionText: 'How does your goalie handle giving up a bad goal during a game?',
    getScore: scaleToScore,
  },
  D4: {
    categorySlug: 'in_game',
    questionText: "How would you describe your goalie's engagement level during practices?",
    getScore: scaleToScore,
  },
  D5: {
    categorySlug: 'in_game',
    questionText: 'When your goalie struggles in a game — what do you SEE in their body language?',
    getScore: (val) => (({
      'D5-1': 4.0,    // They reset visibly — head up, posture strong
      'D5-2': 2.5,    // Mixed — depends on the moment
      'D5-3': 1.0,    // They get visibly down — shoulders drop, posture changes
      'D5-4': 2.0,    // Hard to read — they keep it inside
      'D5-5': 1.5,    // I had not paid close attention to this before
    } as Record<string, number>)[val] ?? 2.0) as IntelligenceScore,
  },

  // ── POST_GAME (10%) ─────────────────────────────────────────────────────────
  G3: {
    categorySlug: 'post_game',
    questionText: 'How important is it to you that parents are informed and aligned about goalie development?',
    getScore: scaleToScore,
  },

  // ── PREFERENCES (5%) ────────────────────────────────────────────────────────
  F4: {
    categorySlug: 'preferences',
    questionText: "How would you describe your willingness to use Smarter Goalie's tools — overall?",
    getScore: (val) => (({
      'F4-1': 4.0,    // Fully willing — I want to engage with all the tools available
      'F4-2': 3.0,    // Willing — but I need to see the value as I go
      'F4-3': 2.5,    // Open — but I will start small and grow if it fits
      'F4-4': 2.0,    // Cautious — I will let the goalie engage first
      'F4-5': 1.5,    // I am not sure yet
    } as Record<string, number>)[val] ?? 2.0) as IntelligenceScore,
  },
};

// ─── Converter helpers ────────────────────────────────────────────────────────

function buildResponses(
  scoringMap: Record<string, ScoringEntry>,
  rawResponses: Record<string, string | string[]>,
  prefix: string
): AssessmentResponse[] {
  const now = Timestamp.now();
  const result: AssessmentResponse[] = [];

  for (const [questionId, entry] of Object.entries(scoringMap)) {
    const raw = rawResponses[questionId];
    if (raw === undefined || raw === null) continue;

    // Only score single-value responses (radio, scale, scale_3)
    // multi_select and open_text are not in the scoring maps, but guard anyway
    if (Array.isArray(raw)) continue;

    const strVal = String(raw).trim();
    if (!strVal) continue;

    const score = entry.getScore(strVal);

    result.push({
      questionId,
      questionCode: `${prefix}-${questionId}`,
      categorySlug: entry.categorySlug,
      value: strVal,
      score,
      answeredAt: now,
    });
  }

  return result;
}

function buildSyntheticQuestions(
  scoringMap: Record<string, ScoringEntry>
): AssessmentQuestion[] {
  return Object.entries(scoringMap).map(([id, entry], index) => ({
    id,
    categorySlug: entry.categorySlug,
    questionCode: id,
    type: 'single_select' as const,
    question: entry.questionText,
    options: [],
    order: index + 1,
    isRequired: false,
  }));
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Convert raw V2 student responses into AssessmentResponse[] for the scoring engine.
 */
export function convertStudentV2ToAssessmentResponses(
  rawResponses: Record<string, string | string[]>
): AssessmentResponse[] {
  return buildResponses(STUDENT_SCORING_MAP, rawResponses, 'V2-STU');
}

/**
 * Convert raw V2 parent responses into AssessmentResponse[] for the scoring engine.
 */
export function convertParentV2ToAssessmentResponses(
  rawResponses: Record<string, string | string[]>
): AssessmentResponse[] {
  return buildResponses(PARENT_SCORING_MAP, rawResponses, 'V2-PAR');
}

/**
 * Convert raw V2 coach responses into AssessmentResponse[] for the scoring engine.
 */
export function convertCoachV2ToAssessmentResponses(
  rawResponses: Record<string, string | string[]>
): AssessmentResponse[] {
  return buildResponses(COACH_SCORING_MAP, rawResponses, 'V2-COA');
}

/**
 * Generate a complete IntelligenceProfile from V2 student baseline responses.
 */
export function generateStudentV2IntelligenceProfile(
  userId: string,
  rawResponses: Record<string, string | string[]>,
  ageRange?: GoalieAgeRange
): IntelligenceProfile {
  const responses = convertStudentV2ToAssessmentResponses(rawResponses);
  const questions = buildSyntheticQuestions(STUDENT_SCORING_MAP);
  return generateIntelligenceProfile(userId, 'goalie', responses, questions, ageRange);
}

/**
 * Generate a complete IntelligenceProfile from V2 parent baseline responses.
 */
export function generateParentV2IntelligenceProfile(
  userId: string,
  rawResponses: Record<string, string | string[]>
): IntelligenceProfile {
  const responses = convertParentV2ToAssessmentResponses(rawResponses);
  const questions = buildSyntheticQuestions(PARENT_SCORING_MAP);
  return generateIntelligenceProfile(userId, 'parent', responses, questions);
}

/**
 * Generate a complete IntelligenceProfile from V2 coach baseline responses.
 */
export function generateCoachV2IntelligenceProfile(
  userId: string,
  rawResponses: Record<string, string | string[]>
): IntelligenceProfile {
  const responses = convertCoachV2ToAssessmentResponses(rawResponses);
  const questions = buildSyntheticQuestions(COACH_SCORING_MAP);
  return generateIntelligenceProfile(userId, 'coach', responses, questions);
}
