/**
 * What a goalie reads as the name of a chart.
 *
 * Every goalie-facing chart page used to print only the pillar name. A goalie
 * looking for "the tournament chart" had no word on screen to find it by, even
 * though the chart's own name was stored and shown to admin. The chart's name now
 * leads, and the pillar sits above it as the place it belongs.
 */
export interface ChartTitle {
  /** The line to show as the heading. */
  title: string;
  /** The pillar the chart sits under, or null when it would only repeat the title. */
  pillarLabel: string | null;
}

function normalise(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

export function chartTitle(chartName: string | null | undefined, pillarName: string): ChartTitle {
  const name = (chartName ?? '').trim();

  // A chart with no name, or one named exactly like its pillar, has nothing more
  // to say than the pillar already does. Never show the same words twice.
  if (name.length === 0 || normalise(name) === normalise(pillarName)) {
    return { title: pillarName, pillarLabel: null };
  }

  return { title: name, pillarLabel: pillarName };
}
