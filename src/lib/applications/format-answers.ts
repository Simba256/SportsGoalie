/**
 * Turning a stored baseline questionnaire back into something a human can read.
 *
 * The questionnaire stores answers as bare values keyed by question id — a radio
 * answer is the option id (`C4-2`), a scale answer is `"4"`, and a couple of
 * question types are spread across several keys. None of that means anything on
 * its own. This walks the question bank in order and pairs each question with
 * what was actually chosen, so the review screen shows the questionnaire as the
 * applicant saw it rather than a dump of ids.
 *
 * Two rules worth keeping:
 *
 * 1. Questions the applicant was never shown are left out. `getActiveQuestions`
 *    applies the same conditional logic the questionnaire used, so a branch they
 *    never reached does not appear as an unanswered question they skipped.
 *
 * 2. Nothing stored is silently dropped. Anything in `responses` that no longer
 *    matches a question in the bank — an answer to a question since reworded or
 *    removed — comes back in `orphans` so the screen can still show it. An
 *    applicant's words going missing because the form changed after they wrote
 *    them would be the worst failure this screen could have.
 */

import {
  STUDENT_BASELINE_SECTIONS,
  getActiveQuestions,
  type V2Question,
  type V2Section,
} from '@/data/student-baseline-profile-v2';

export interface FormattedExtra {
  /** What the free text was attached to — an option, or a follow-up question. */
  label: string;
  text: string;
}

export interface FormattedAnswer {
  questionId: string;
  question: string;
  subLabel?: string;
  /** False when they were shown the question and left it blank. */
  answered: boolean;
  /** One line per value. A multi-select produces several. */
  values: string[];
  /** Context that only makes sense next to the answer, e.g. what 1 and 5 meant. */
  scaleHint?: string;
  extras: FormattedExtra[];
}

export interface FormattedSection {
  key: string;
  title: string;
  categoryLabel: string;
  answers: FormattedAnswer[];
  answeredCount: number;
}

export interface FormattedQuestionnaire {
  sections: FormattedSection[];
  /** Stored answers with no matching question left in the bank. */
  orphans: { key: string; value: string }[];
  answeredCount: number;
  activeCount: number;
}

type Responses = Record<string, string | string[]>;

/** The option ids a question owns, so a stored id can be turned back into words. */
function optionText(question: V2Question, value: string): string {
  const option = question.options?.find(o => o.id === value);
  return option ? option.text : value;
}

function asString(value: string | string[] | undefined): string {
  if (typeof value === 'string') return value.trim();
  return '';
}

/**
 * The extra keys a question type spreads its answer across, beyond its own id.
 * `email_phone` and `location` write one key per box.
 */
function compositeKeys(question: V2Question): string[] {
  if (question.inputType === 'email_phone') return [`${question.id}-email`, `${question.id}-phone`];
  if (question.inputType === 'location') return [`${question.id}-city`, `${question.id}-state`, `${question.id}-country`];
  return [];
}

function formatValues(question: V2Question, responses: Responses): { values: string[]; scaleHint?: string } {
  const raw = responses[question.id];

  switch (question.inputType) {
    case 'email_phone': {
      const email = asString(responses[`${question.id}-email`]);
      const phone = asString(responses[`${question.id}-phone`]);
      return { values: [email, phone].filter(Boolean) };
    }

    case 'location': {
      const parts = [
        asString(responses[`${question.id}-city`]),
        asString(responses[`${question.id}-state`]),
        asString(responses[`${question.id}-country`]),
      ].filter(Boolean);
      return { values: parts.length ? [parts.join(', ')] : [] };
    }

    case 'multi_select': {
      const chosen = Array.isArray(raw) ? raw : raw ? [raw] : [];
      return { values: chosen.map(id => optionText(question, id)) };
    }

    case 'scale': {
      const value = asString(raw);
      if (!value) return { values: [] };
      const hint = [question.scaleLeft && `1 = ${question.scaleLeft}`, question.scaleRight && `5 = ${question.scaleRight}`]
        .filter(Boolean)
        .join('  ·  ');
      return { values: [`${value} out of 5`], scaleHint: hint || undefined };
    }

    case 'scale_3': {
      const value = asString(raw);
      const labels: Record<string, string | undefined> = {
        '1': question.scaleLeft,
        '2': question.scaleMid,
        '3': question.scaleRight,
      };
      if (!value) return { values: [] };
      return { values: [labels[value] ?? value] };
    }

    default: {
      // text, open_text and radio all store a single string. An open_text answer
      // can hold an option id too — the "skip" and "prefer not to say" buttons
      // write one — so every single-value answer goes through the option lookup.
      const value = asString(raw);
      return { values: value ? [optionText(question, value)] : [] };
    }
  }
}

function formatExtras(question: V2Question, openExtras: Record<string, string>): FormattedExtra[] {
  const extras: FormattedExtra[] = [];

  for (const option of question.options ?? []) {
    const text = (openExtras[`${question.id}::${option.id}`] ?? '').trim();
    if (text) extras.push({ label: option.text, text });
  }

  const sub = (openExtras[`${question.id}::sub`] ?? '').trim();
  if (sub && question.subQuestion) extras.push({ label: question.subQuestion.question, text: sub });

  return extras;
}

function formatSection(section: V2Section, responses: Responses, openExtras: Record<string, string>): FormattedSection {
  const answers = getActiveQuestions(section, responses).map<FormattedAnswer>(question => {
    const { values, scaleHint } = formatValues(question, responses);
    const extras = formatExtras(question, openExtras);
    return {
      questionId: question.id,
      question: question.question,
      subLabel: question.subLabel,
      // A question answered only by its free-text box still counts as answered.
      answered: values.length > 0 || extras.length > 0,
      values,
      scaleHint,
      extras,
    };
  });

  return {
    key: section.key,
    title: section.title,
    categoryLabel: section.categoryLabel,
    answers,
    answeredCount: answers.filter(a => a.answered).length,
  };
}

export function formatApplicantAnswers(
  responses: Responses,
  openExtras: Record<string, string> = {}
): FormattedQuestionnaire {
  const sections = STUDENT_BASELINE_SECTIONS.map(section => formatSection(section, responses, openExtras));

  // Every key the bank accounts for, whether or not the applicant was shown it —
  // a key belonging to a branch they skipped is not an orphan, it is just unused.
  const known = new Set<string>();
  for (const section of STUDENT_BASELINE_SECTIONS) {
    for (const question of section.questions) {
      known.add(question.id);
      for (const key of compositeKeys(question)) known.add(key);
    }
  }

  const orphans = Object.entries(responses)
    .filter(([key]) => !known.has(key))
    .map(([key, value]) => ({ key, value: Array.isArray(value) ? value.join(', ') : String(value) }))
    .filter(entry => entry.value.trim() !== '');

  return {
    sections,
    orphans,
    answeredCount: sections.reduce((total, s) => total + s.answeredCount, 0),
    activeCount: sections.reduce((total, s) => total + s.answers.length, 0),
  };
}
