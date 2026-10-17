/**
 * Whether a Knowledge Check is shown to goalies, as one switch.
 *
 * A quiz is stored with two flags, `isActive` and `isPublished`, and every goalie-facing
 * query needs both true. The admin list's "Activate" only set `isActive`, so on a quiz
 * saved with Published off it changed nothing a goalie could see and the card still read
 * "Draft" (item 10 of Michael's 4 Oct run). The control is now one switch that writes both
 * flags together, and a line says in plain words what is missing when it cannot go live.
 */

export interface QuizVisibilityInput {
  isActive?: boolean;
  isPublished?: boolean;
  title?: string;
  sportId?: string;
  skillId?: string;
  videoUrl?: string;
  questions?: unknown[];
}

export interface QuizVisibility {
  /** `live`: goalies can see it. `blocked`: switched on but something is missing. `hidden`: switched off. */
  state: 'live' | 'blocked' | 'hidden';
  line: string;
}

/** The test every goalie-facing page applies: active and published. */
export function isQuizLive(quiz: QuizVisibilityInput): boolean {
  return quiz.isActive === true && quiz.isPublished === true;
}

/** Both flags from the one switch, so they can never disagree. */
export function visibilityFlags(live: boolean): { isActive: boolean; isPublished: boolean } {
  return { isActive: live, isPublished: live };
}

/** Plain-language list of what a quiz still needs before goalies can take it. */
export function quizMissing(quiz: QuizVisibilityInput): string[] {
  const missing: string[] = [];
  if (!quiz.title?.trim()) missing.push('a title');
  if (!quiz.sportId?.trim()) missing.push('a pillar');
  if (!quiz.skillId?.trim()) missing.push('a skill');
  if (!quiz.videoUrl?.trim()) missing.push('a video');
  if (!quiz.questions || quiz.questions.length === 0) missing.push('at least one question');
  return missing;
}

function joinWords(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/** The single status line shown next to the switch. */
export function describeVisibility(quiz: QuizVisibilityInput, switchedOn: boolean = isQuizLive(quiz)): QuizVisibility {
  const missing = quizMissing(quiz);

  if (missing.length > 0) {
    return {
      state: switchedOn ? 'blocked' : 'hidden',
      line: `Not visible to goalies yet. It still needs ${joinWords(missing)}.`,
    };
  }
  if (switchedOn) {
    return { state: 'live', line: 'Goalies can see and take this Knowledge Check.' };
  }
  return { state: 'hidden', line: 'Hidden from goalies. Switch on to show it.' };
}
