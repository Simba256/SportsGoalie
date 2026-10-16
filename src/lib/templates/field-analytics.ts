import type { AnalyticsType, FieldType } from '@/types';

/**
 * The analytics that mean something for a given input type, and the one the
 * builder picks when an admin switches analytics on.
 *
 * The rule that matters: a field with analytics switched on is never saved with
 * type `none`. The template validator rejects exactly that combination
 * ("Analytics type required when analytics is enabled"), which is what stopped
 * Text and Text Area fields from being saved with analytics on (reported 11 Sept).
 *
 * - yes/no           -> percentage   (share of yes answers)
 * - scale / numeric  -> average      (the number the goalie gave)
 * - radio / checkbox -> distribution (which options were chosen)
 * - text / textarea  -> count        (how many check-ins the goalie wrote something)
 * - date / time      -> count        (how many check-ins carry one)
 *
 * `percentage` on a 1-10 scale scored a permanent 0% because nothing is ever
 * `true`, which is why the type follows the input rather than being fixed.
 */
export function defaultAnalyticsType(fieldType: FieldType): AnalyticsType {
  switch (fieldType) {
    case 'yesno':
      return 'percentage';
    case 'scale':
    case 'numeric':
      return 'average';
    case 'radio':
    case 'checkbox':
      return 'distribution';
    case 'text':
    case 'textarea':
    case 'date':
    case 'time':
      return 'count';
  }
}
