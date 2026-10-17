/**
 * Which marker a question gets on the results review.
 *
 * A question not yet got right is something to look at again, never a red cross: the
 * goalie keeps going until every question is owned (src/lib/training/owned.ts), so a miss
 * is a step in that, not a verdict. Reflective questions have no right or wrong at all and
 * are checked first so an honest "No" can never fall through to the look-again marker.
 */
export type ReviewMarkerKind = 'reflective' | 'right' | 'look-again';

interface AnswerFlags {
  reflective?: boolean | null;
  isCorrect?: boolean | null;
}

export function reviewMarker(
  answer: AnswerFlags,
  question?: { reflective?: boolean | null } | null,
): ReviewMarkerKind {
  if (answer.reflective === true || question?.reflective === true) return 'reflective';
  return answer.isCorrect ? 'right' : 'look-again';
}
