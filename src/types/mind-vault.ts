import { Timestamp } from 'firebase/firestore';

// ─── Mind Vault Categories ───────────────────────────────────────────

export type MindVaultCategory =
  | 'acceptance'
  | 'cannot_accept'
  | 'past_challenges'
  | 'what_has_worked'
  | 'personal_mantras'
  | 'self_coaching'
  | 'curriculum_anchors'
  | 'hockey_challenges'
  | 'lifestyle_challenges';

export type AcceptanceSubCategory =
  | 'game'
  | 'practice'
  | 'coaching'
  | 'teammate'
  | 'personal_mental'
  | 'lifestyle';

export type CannotAcceptSubCategory =
  | 'mental_surrender'
  | 'identity_threats'
  | 'focus_killers'
  | 'growth_blockers';

// ─── Mind Vault Entry ────────────────────────────────────────────────

export interface MindVaultEntry {
  id: string;
  studentId: string;
  category: MindVaultCategory;
  subcategory?: AcceptanceSubCategory | CannotAcceptSubCategory | string;
  content: string;
  isVoiceEntry: boolean;
  sessionId?: string;
  source: 'manual' | 'pre_game' | 'post_game' | 'practice';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateMindVaultEntryData {
  studentId: string;
  category: MindVaultCategory;
  subcategory?: string;
  content: string;
  isVoiceEntry: boolean;
  sessionId?: string;
  source: 'manual' | 'pre_game' | 'post_game' | 'practice';
}

// ─── Category Metadata ───────────────────────────────────────────────

export interface MindVaultCategoryInfo {
  slug: MindVaultCategory;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  color: string;
}

export const MIND_VAULT_CATEGORIES: MindVaultCategoryInfo[] = [
  {
    slug: 'acceptance',
    name: 'Acceptance List',
    shortName: 'Acceptance',
    description: 'What you have made peace with — your foundation of mental strength.',
    icon: 'Heart',
    color: 'emerald',
  },
  {
    slug: 'cannot_accept',
    name: 'Cannot Accept List',
    shortName: 'Cannot Accept',
    description: 'Your psychological firewall — what you consciously refuse to surrender to.',
    icon: 'ShieldAlert',
    color: 'red',
  },
  {
    slug: 'past_challenges',
    name: 'Past Challenges Overcome',
    shortName: 'Challenges',
    description: 'Your own proof of resilience — moments you got through.',
    icon: 'Mountain',
    color: 'amber',
  },
  {
    slug: 'what_has_worked',
    name: 'What Has Worked',
    shortName: 'What Works',
    description: 'Mental strategies, routines, and self-talk that have proven effective.',
    icon: 'Lightbulb',
    color: 'yellow',
  },
  {
    slug: 'personal_mantras',
    name: 'Personal Mantras',
    shortName: 'Mantras',
    description: 'Your own words in your own voice — the phrases that anchor you.',
    icon: 'Quote',
    color: 'purple',
  },
  {
    slug: 'self_coaching',
    name: 'Self-Coaching Tools',
    shortName: 'Self-Coaching',
    description: 'Specific techniques you use to reset, refocus, and recover.',
    icon: 'Wrench',
    color: 'blue',
  },
  {
    slug: 'curriculum_anchors',
    name: 'Curriculum Anchors',
    shortName: 'Anchors',
    description: 'Lessons that landed deeply and you keep close.',
    icon: 'Anchor',
    color: 'indigo',
  },
  {
    slug: 'hockey_challenges',
    name: 'Hockey Challenges',
    shortName: 'Hockey',
    description: 'Specific game situations you logged and resolved.',
    icon: 'Trophy',
    color: 'cyan',
  },
  {
    slug: 'lifestyle_challenges',
    name: 'Lifestyle Challenges',
    shortName: 'Lifestyle',
    description: 'Family, school, social, time management — how you navigated them.',
    icon: 'Users',
    color: 'pink',
  },
];

export function getMindVaultCategoryInfo(slug: MindVaultCategory): MindVaultCategoryInfo | undefined {
  return MIND_VAULT_CATEGORIES.find((c) => c.slug === slug);
}

// ─── Acceptance List Prompts ─────────────────────────────────────────

export interface AcceptancePrompt {
  id: string;
  subcategory: AcceptanceSubCategory | CannotAcceptSubCategory;
  text: string;
}

export interface AcceptanceSubCategoryInfo {
  slug: AcceptanceSubCategory;
  name: string;
  description: string;
}

export interface CannotAcceptSubCategoryInfo {
  slug: CannotAcceptSubCategory;
  name: string;
  description: string;
}

export const ACCEPTANCE_SUBCATEGORIES: AcceptanceSubCategoryInfo[] = [
  { slug: 'game', name: 'Game Challenges', description: 'Accepting the realities of competition' },
  { slug: 'practice', name: 'Practice Challenges', description: 'Accepting the nature of growth' },
  { slug: 'coaching', name: 'Coaching Challenges', description: 'Accepting coaching dynamics' },
  { slug: 'teammate', name: 'Teammate Challenges', description: 'Accepting what you cannot control' },
  { slug: 'personal_mental', name: 'Personal & Mental', description: 'Accepting your human side' },
  { slug: 'lifestyle', name: 'Lifestyle Challenges', description: 'Accepting the full picture' },
];

export const CANNOT_ACCEPT_SUBCATEGORIES: CannotAcceptSubCategoryInfo[] = [
  { slug: 'mental_surrender', name: 'Mental Surrender', description: 'Never giving up' },
  { slug: 'identity_threats', name: 'Identity Threats', description: 'Protecting your worth' },
  { slug: 'focus_killers', name: 'Focus Killers', description: 'Guarding your focus' },
  { slug: 'growth_blockers', name: 'Growth Blockers', description: 'Refusing complacency' },
];

export const ACCEPTANCE_PROMPTS: AcceptancePrompt[] = [
  // Game Challenges
  { id: 'a-game-1', subcategory: 'game', text: 'I accept that I will get scored on.' },
  { id: 'a-game-2', subcategory: 'game', text: 'I accept that some goals will be fluky and unfair.' },
  { id: 'a-game-3', subcategory: 'game', text: 'I accept that the score does not define my performance.' },
  // Practice Challenges
  { id: 'a-practice-1', subcategory: 'practice', text: 'I accept that growth is not always visible in the moment.' },
  { id: 'a-practice-2', subcategory: 'practice', text: 'I accept that it is my responsibility to manage my time.' },
  // Coaching Challenges
  { id: 'a-coaching-1', subcategory: 'coaching', text: 'I accept that not every coach will fully understand my position.' },
  { id: 'a-coaching-2', subcategory: 'coaching', text: 'I accept that my development is ultimately my responsibility.' },
  // Teammate Challenges
  { id: 'a-teammate-1', subcategory: 'teammate', text: 'I accept that I cannot control what happens in front of me.' },
  { id: 'a-teammate-2', subcategory: 'teammate', text: 'I accept that I will lead by example, not by complaint.' },
  // Personal & Mental
  { id: 'a-personal-1', subcategory: 'personal_mental', text: 'I accept that fear is a normal part of this position.' },
  { id: 'a-personal-2', subcategory: 'personal_mental', text: 'I accept that some days my best will look different.' },
  // Lifestyle Challenges
  { id: 'a-lifestyle-1', subcategory: 'lifestyle', text: 'I accept that what I do off the ice affects what I do on the ice.' },
];

export const CANNOT_ACCEPT_PROMPTS: AcceptancePrompt[] = [
  // Mental Surrender
  { id: 'ca-surrender-1', subcategory: 'mental_surrender', text: 'I cannot accept giving up — on a play, on a period, on a game, on myself.' },
  // Identity Threats
  { id: 'ca-identity-1', subcategory: 'identity_threats', text: 'I cannot accept one bad goal defining my worth as a goaltender.' },
  // Focus Killers
  { id: 'ca-focus-1', subcategory: 'focus_killers', text: 'I cannot accept the bench affecting my next save.' },
  // Growth Blockers
  { id: 'ca-growth-1', subcategory: 'growth_blockers', text: 'I cannot accept being complacent with my current level of skill.' },
];

// ─── Category Summary (for dashboard) ────────────────────────────────

export interface MindVaultCategorySummary {
  category: MindVaultCategory;
  entryCount: number;
  lastUpdated: Timestamp | null;
}
