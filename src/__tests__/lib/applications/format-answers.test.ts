import { describe, it, expect } from 'vitest';

import { formatApplicantAnswers } from '@/lib/applications/format-answers';
import {
  STUDENT_BASELINE_SECTIONS,
  getAllQuestions,
  type V2InputType,
  type V2Question,
} from '@/data/student-baseline-profile-v2';

/**
 * The review screen's whole value is that Michael reads words, not ids. These
 * tests run against the real question bank rather than a fixture, so a question
 * type added to the questionnaire without a matching case in the formatter shows
 * up here as a raw id leaking through — which is the exact failure that would
 * otherwise reach the screen quietly.
 */

const ALL = getAllQuestions();

/** First question of a given type, so the fixtures follow the bank as it changes. */
function firstOfType(type: V2InputType): V2Question {
  const question = ALL.find(q => q.inputType === type && !q.conditionalLogic);
  if (!question) throw new Error(`No unconditional ${type} question in the bank`);
  return question;
}

/** The section that owns a question, for asserting where its answer lands. */
function sectionOf(id: string) {
  return STUDENT_BASELINE_SECTIONS.find(s => s.questions.some(q => q.id === id))!;
}

function findAnswer(result: ReturnType<typeof formatApplicantAnswers>, id: string) {
  for (const section of result.sections) {
    const answer = section.answers.find(a => a.questionId === id);
    if (answer) return answer;
  }
  return undefined;
}

describe('formatApplicantAnswers — option ids become words', () => {
  it('resolves a radio answer to the option text the applicant clicked', () => {
    const question = firstOfType('radio');
    const option = question.options![1];

    const answer = findAnswer(formatApplicantAnswers({ [question.id]: option.id }), question.id);

    expect(answer?.answered).toBe(true);
    expect(answer?.values).toEqual([option.text]);
    // The stored id must not survive into what is shown.
    expect(answer?.values[0]).not.toBe(option.id);
  });

  it('resolves every choice in a multi-select', () => {
    const question = firstOfType('multi_select');
    const chosen = question.options!.slice(0, 2);

    const answer = findAnswer(
      formatApplicantAnswers({ [question.id]: chosen.map(o => o.id) }),
      question.id
    );

    expect(answer?.values).toEqual(chosen.map(o => o.text));
  });

  it('keeps a free-text answer exactly as written', () => {
    const question = firstOfType('text');
    const answer = findAnswer(formatApplicantAnswers({ [question.id]: '  Sam Rivera  ' }), question.id);

    expect(answer?.values).toEqual(['Sam Rivera']);
  });

  it('reads a scale answer out of 5 and says what the ends meant', () => {
    const question = firstOfType('scale');
    const answer = findAnswer(formatApplicantAnswers({ [question.id]: '4' }), question.id);

    expect(answer?.values).toEqual(['4 out of 5']);
    expect(answer?.scaleHint).toContain(question.scaleLeft!);
    expect(answer?.scaleHint).toContain(question.scaleRight!);
  });

  it('turns a three-point scale back into its label rather than a number', () => {
    const question = firstOfType('scale_3');
    const answer = findAnswer(formatApplicantAnswers({ [question.id]: '2' }), question.id);

    expect(answer?.values).toEqual([question.scaleMid]);
  });
});

describe('formatApplicantAnswers — the answers split across several keys', () => {
  it('gathers email and phone from their separate keys', () => {
    const question = firstOfType('email_phone');
    const answer = findAnswer(
      formatApplicantAnswers({
        [`${question.id}-email`]: 'sam@example.com',
        [`${question.id}-phone`]: '555-0100',
      }),
      question.id
    );

    expect(answer?.values).toEqual(['sam@example.com', '555-0100']);
  });

  it('joins a location into one line and skips the boxes left empty', () => {
    const question = firstOfType('location');
    const answer = findAnswer(
      formatApplicantAnswers({
        [`${question.id}-city`]: 'Calgary',
        [`${question.id}-state`]: '',
        [`${question.id}-country`]: 'Canada',
      }),
      question.id
    );

    expect(answer?.values).toEqual(['Calgary, Canada']);
  });
});

describe('formatApplicantAnswers — the free text attached to an answer', () => {
  it('shows the extra text under the option it belongs to', () => {
    const question = ALL.find(q => q.options?.some(o => o.hasOpenText) && !q.conditionalLogic);
    if (!question) return; // Nothing in the bank invites free text; nothing to assert.
    const option = question.options!.find(o => o.hasOpenText)!;

    const answer = findAnswer(
      formatApplicantAnswers(
        { [question.id]: option.id },
        { [`${question.id}::${option.id}`]: 'It happens most in the third period.' }
      ),
      question.id
    );

    expect(answer?.extras).toEqual([
      { label: option.text, text: 'It happens most in the third period.' },
    ]);
  });

  it('shows a follow-up question and its answer together', () => {
    const question = ALL.find(q => q.subQuestion && !q.conditionalLogic);
    if (!question) return;

    const answer = findAnswer(
      formatApplicantAnswers(
        { [question.id]: question.subQuestion!.showWhenParentValues[0] },
        { [`${question.id}::sub`]: 'Because I stopped trusting my read.' }
      ),
      question.id
    );

    expect(answer?.extras.at(-1)).toEqual({
      label: question.subQuestion!.question,
      text: 'Because I stopped trusting my read.',
    });
  });

  it('counts a question answered only by its free text as answered', () => {
    const question = ALL.find(q => q.subQuestion && !q.conditionalLogic);
    if (!question) return;

    const answer = findAnswer(
      formatApplicantAnswers({}, { [`${question.id}::sub`]: 'Only this.' }),
      question.id
    );

    expect(answer?.answered).toBe(true);
  });
});

describe('formatApplicantAnswers — what is shown and what is not', () => {
  it('says a question was left blank rather than dropping it', () => {
    const question = firstOfType('radio');
    const answer = findAnswer(formatApplicantAnswers({}), question.id);

    expect(answer).toBeDefined();
    expect(answer?.answered).toBe(false);
    expect(answer?.values).toEqual([]);
  });

  it('leaves out a branch the applicant was never shown', () => {
    const conditional = ALL.find(q => q.conditionalLogic);
    if (!conditional) return;

    const hidden = formatApplicantAnswers({});
    expect(findAnswer(hidden, conditional.id)).toBeUndefined();

    const shown = formatApplicantAnswers({
      [conditional.conditionalLogic!.parentId]: conditional.conditionalLogic!.showWhenIncludes[0],
    });
    expect(findAnswer(shown, conditional.id)).toBeDefined();
  });

  it('surfaces an answer whose question is no longer in the bank instead of losing it', () => {
    const result = formatApplicantAnswers({ 'Z99': 'Something they wrote before the form changed' });

    expect(result.orphans).toEqual([
      { key: 'Z99', value: 'Something they wrote before the form changed' },
    ]);
  });

  it('does not treat a composite key as an orphan', () => {
    const question = firstOfType('email_phone');
    const result = formatApplicantAnswers({ [`${question.id}-email`]: 'sam@example.com' });

    expect(result.orphans).toEqual([]);
  });

  it('counts answered against shown, not against the whole bank', () => {
    const question = firstOfType('text');
    const result = formatApplicantAnswers({ [question.id]: 'Sam Rivera' });

    expect(result.answeredCount).toBe(1);
    expect(result.activeCount).toBeGreaterThan(1);
    expect(result.activeCount).toBeLessThanOrEqual(ALL.length);
  });

  it('puts an answer in the section that owns the question', () => {
    const question = firstOfType('radio');
    const result = formatApplicantAnswers({ [question.id]: question.options![0].id });
    const owning = result.sections.find(s => s.answers.some(a => a.questionId === question.id));

    expect(owning?.key).toBe(sectionOf(question.id).key);
    expect(result.sections.map(s => s.key)).toEqual(STUDENT_BASELINE_SECTIONS.map(s => s.key));
  });

  it('never leaves a raw option id in a rendered answer, for any question type', () => {
    // One answer per question, always the first option where there is one.
    const responses: Record<string, string | string[]> = {};
    for (const question of ALL) {
      const first = question.options?.[0];
      if (first) responses[question.id] = question.inputType === 'multi_select' ? [first.id] : first.id;
    }

    const result = formatApplicantAnswers(responses);
    const optionIds = new Set(ALL.flatMap(q => (q.options ?? []).map(o => o.id)));

    for (const section of result.sections) {
      for (const answer of section.answers) {
        for (const value of answer.values) {
          expect(optionIds.has(value), `${answer.questionId} rendered as the id "${value}"`).toBe(false);
        }
      }
    }
  });
});
