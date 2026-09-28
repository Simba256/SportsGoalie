import { readFileSync } from 'node:fs';
import path from 'node:path';

import { expect, test, type Page, type Route, type TestInfo } from '@playwright/test';
import * as ts from 'typescript';

/**
 * Coach Mike's voice on phones: src/lib/audio/playback.ts in real browser
 * engines. Run with `npm run test:e2e:audio` (see playwright.audio.config.ts).
 *
 * The freeze-point voice starts itself, from a timer, with nobody tapping. An
 * iPhone refuses that unless a tap has already played the same audio element.
 * `primeElement`, called from the Start Quiz tap, is meant to be that tap.
 *
 * What this can show, and what it cannot:
 *
 * - The "iPhone tap rule" projects run Chromium with its gesture-required
 *   autoplay policy, which locks each element until a tap plays it, as iOS
 *   does. There the control test proves the lock is on, and the freeze test
 *   proves the prime is what lifts it.
 * - Playwright's WebKit is not iOS Safari. If it lets the page play without a
 *   tap, the tests there show only that the code runs in WebKit. Each test
 *   prints what it saw. A real iPhone is still the final word:
 *   tests/audio/REAL-PHONE-CHECKLIST.md.
 * - Playwright's WebKit for Windows cannot play audio at all: it fails even a
 *   plain PCM WAV with MediaError 4. Each test checks for that first, without
 *   playing anything, and skips with that reason rather than fail or pass.
 *
 * Playwright's own page.evaluate() and locator checks count as a tap in these
 * engines. So the page runs each scenario itself and reports back through a
 * binding, and every play meant to be unprompted comes UNPROMPTED_AFTER_MS
 * after the last interaction, past the 5-second window a tap stays valid for.
 */

const ORIGIN = 'https://audio-harness.test';
const UNPROMPTED_AFTER_MS = 7_000;
const REAL_CLIP_URL = process.env.COACH_CLIP_URL;

/** How one play went, as the page reports it. */
interface PlayReport {
  result: 'playing' | 'blocked' | 'failed';
  /** 0.8 s later, whether the element was still running and how far it got. */
  after: { paused: boolean; currentTime: number } | null;
  /** MediaError code, if the element hit one. */
  errorCode: number | null;
}

/** playback.ts as a plain script that sets window.SGAudio. It imports nothing. */
function playbackScript(): string {
  const source = readFileSync(path.join(__dirname, '../../src/lib/audio/playback.ts'), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2017, module: ts.ModuleKind.CommonJS },
  });
  return `window.SGAudio = (function () {\nvar exports = {};\n${outputText}\nreturn exports;\n})();`;
}

/** Three seconds of a quiet 440 Hz tone, as a 16-bit mono WAV. */
function toneWav(seconds = 3, frequency = 440, sampleRate = 22_050): Buffer {
  const samples = Math.round(seconds * sampleRate);
  const wav = Buffer.alloc(44 + samples * 2);
  wav.write('RIFF', 0, 'ascii');
  wav.writeUInt32LE(36 + samples * 2, 4);
  wav.write('WAVE', 8, 'ascii');
  wav.write('fmt ', 12, 'ascii');
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20); // PCM
  wav.writeUInt16LE(1, 22); // mono
  wav.writeUInt32LE(sampleRate, 24);
  wav.writeUInt32LE(sampleRate * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write('data', 36, 'ascii');
  wav.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i += 1) {
    wav.writeInt16LE(Math.round(Math.sin((2 * Math.PI * frequency * i) / sampleRate) * 3000), 44 + i * 2);
  }
  return wav;
}

/**
 * The quiz in miniature: one shared audio element as the provider has, a Start
 * Quiz button that primes it, the freeze-point play from a timer, and the
 * "Tap to hear" fallback.
 */
const HARNESS_PAGE = `<!doctype html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body>
<button id="start" style="font-size:24px;padding:24px">Start Quiz</button>
<button id="tap" style="font-size:24px;padding:24px">Tap to hear Coach Mike</button>
<script src="/playback.js"></script>
<script>
  const params = new URLSearchParams(location.search);
  const clipUrl = params.get('clip');
  const unpromptedAfter = Number(params.get('unpromptedAfter'));
  const { primeElement, silentWavDataUri, startClip } = window.SGAudio;

  function newElement() {
    const element = new Audio();
    element.preload = 'none';
    return element;
  }

  // The provider's one element, and one no tap ever touches.
  const voice = newElement();
  const untouched = newElement();

  function afterAMoment(element) {
    return new Promise(resolve =>
      setTimeout(() => resolve({ paused: element.paused, currentTime: element.currentTime }), 800)
    );
  }

  async function play(element) {
    const result = await startClip(element, clipUrl);
    return {
      result,
      after: result === 'playing' ? await afterAMoment(element) : null,
      errorCode: element.error ? element.error.code : null,
    };
  }

  // Whether this engine can decode audio at all, found by loading the prime's
  // own WAV into a spare element. Loading needs no tap and plays nothing.
  function decodes(src) {
    return new Promise(resolve => {
      const probe = new Audio();
      probe.preload = 'auto';
      probe.addEventListener('loadedmetadata', () => resolve({ ok: true, errorCode: null }), { once: true });
      probe.addEventListener('error', () => resolve({ ok: false, errorCode: probe.error && probe.error.code }), { once: true });
      probe.src = src;
      probe.load();
    });
  }

  decodes(silentWavDataUri()).then(wav =>
    window.report('ready', {
      decodesWav: wav.ok,
      wavErrorCode: wav.errorCode,
      mp3: voice.canPlayType('audio/mpeg'),
    })
  );

  if (params.get('scenario') === 'untapped') {
    setTimeout(async () => window.report('untapped', await play(voice)), unpromptedAfter);
  }

  document.getElementById('start').addEventListener('click', () => {
    primeElement(voice).then(unlocked => window.report('prime', unlocked));
    setTimeout(async () => {
      const [primed, unprimed] = await Promise.all([play(voice), play(untouched)]);
      window.report('freeze', { primed, unprimed });
    }, unpromptedAfter);
  });

  document.getElementById('tap').addEventListener('click', async () => {
    window.report('tap', await play(voice));
  });
</script>
</body>
</html>`;

/** Serves `body`, answering range requests with 206 as iOS expects of media. */
function serve(route: Route, body: Buffer, contentType: string) {
  const range = /bytes=(\d+)-(\d*)/.exec(route.request().headers()['range'] ?? '');
  if (!range) {
    return route.fulfill({
      status: 200,
      body,
      headers: { 'content-type': contentType, 'accept-ranges': 'bytes', 'content-length': String(body.length) },
    });
  }
  const start = Number(range[1]);
  const end = range[2] ? Math.min(Number(range[2]), body.length - 1) : body.length - 1;
  return route.fulfill({
    status: 206,
    body: body.subarray(start, end + 1),
    headers: {
      'content-type': contentType,
      'accept-ranges': 'bytes',
      'content-range': `bytes ${start}-${end}/${body.length}`,
      'content-length': String(end - start + 1),
    },
  });
}

const PLAYBACK_JS = playbackScript();
const TONE = toneWav();

/** Opens the harness page and returns a way to wait for its reports. */
async function openHarness(page: Page, options: { clip: string; scenario?: 'untapped' }) {
  const received = new Map<string, unknown>();
  const waiting = new Map<string, (value: unknown) => void>();

  await page.exposeFunction('report', (key: string, value: unknown) => {
    received.set(key, value);
    waiting.get(key)?.(value);
  });

  await page.route(`${ORIGIN}/**`, route => {
    const { pathname } = new URL(route.request().url());
    if (pathname === '/') return serve(route, Buffer.from(HARNESS_PAGE), 'text/html; charset=utf-8');
    if (pathname === '/playback.js') return serve(route, Buffer.from(PLAYBACK_JS), 'text/javascript');
    if (pathname === '/tone.wav') return serve(route, TONE, 'audio/wav');
    return route.fulfill({ status: 404 });
  });

  const query = new URLSearchParams({ clip: options.clip, unpromptedAfter: String(UNPROMPTED_AFTER_MS) });
  if (options.scenario) query.set('scenario', options.scenario);
  await page.goto(`${ORIGIN}/?${query}`);

  /** Waits for the page to report `key`. No page calls, so no stray taps. */
  const next = <T>(key: string, timeoutMs = UNPROMPTED_AFTER_MS + 15_000) =>
    new Promise<T>((resolve, reject) => {
      if (received.has(key)) return resolve(received.get(key) as T);
      const timer = setTimeout(() => reject(new Error(`The page never reported "${key}"`)), timeoutMs);
      waiting.set(key, value => {
        clearTimeout(timer);
        resolve(value as T);
      });
    });

  return { next };
}

/** A tap on touch devices, a click elsewhere. Either is a real user gesture. */
async function press(page: Page, testInfo: TestInfo, selector: string) {
  const button = page.locator(selector);
  if (testInfo.project.use.hasTouch) await button.tap();
  else await button.click();
}

const enforcesTapRule = (testInfo: TestInfo) => testInfo.project.metadata?.enforcesTapRule === true;

/** Prints what the engine did, so a run can be read without assuming. */
function observe(testInfo: TestInfo, what: string) {
  testInfo.annotations.push({ type: 'observed', description: what });
  // eslint-disable-next-line no-console -- the run's output is the record of what each engine did
  console.log(`[${testInfo.project.name}] ${what}`);
}

const TONE_URL = `${ORIGIN}/tone.wav`;

function expectHeard(report: PlayReport) {
  expect(report.result).toBe('playing');
  expect(report.after?.paused).toBe(false);
  expect(report.after?.currentTime ?? 0).toBeGreaterThan(0.2);
}

const describePlay = (report: PlayReport) =>
  `${report.result} (t=${report.after ? report.after.currentTime.toFixed(2) : '-'}s, MediaError=${report.errorCode ?? 'none'})`;

interface Ready {
  decodesWav: boolean;
  wavErrorCode: number | null;
  mp3: string;
}

/** Skips, saying why, in an engine build that cannot play audio at all. */
async function requireAudio(harness: { next: <T>(key: string) => Promise<T> }, testInfo: TestInfo): Promise<Ready> {
  const ready = await harness.next<Ready>('ready');
  if (!ready.decodesWav) {
    observe(testInfo, `cannot decode a plain PCM WAV (MediaError ${ready.wavErrorCode}); no audio in this engine build`);
  }
  test.skip(
    !ready.decodesWav,
    'This engine build cannot play audio at all (Playwright WebKit on Windows). See tests/audio/REAL-PHONE-CHECKLIST.md'
  );
  return ready;
}

test('control: the page cannot start the voice when nobody has tapped', async ({ page }, testInfo) => {
  const harness = await openHarness(page, { clip: TONE_URL, scenario: 'untapped' });
  await requireAudio(harness, testInfo);
  const untapped = await harness.next<PlayReport>('untapped');
  observe(testInfo, `unprompted play with no tap: ${describePlay(untapped)}`);

  if (enforcesTapRule(testInfo)) {
    expect(untapped.result).toBe('blocked');
  } else {
    // This engine does not enforce the rule, so the freeze test below shows
    // only that the code works in it. It must still not fail outright.
    observe(testInfo, 'this engine lets the page play without a tap; the unlock is not tested here');
    expect(['playing', 'blocked']).toContain(untapped.result);
  }
});

test('freeze point: after Start Quiz the page can start the voice by itself', async ({ page }, testInfo) => {
  const harness = await openHarness(page, { clip: TONE_URL });
  await requireAudio(harness, testInfo);
  await press(page, testInfo, '#start');

  expect(await harness.next<boolean>('prime')).toBe(true);

  const { primed, unprimed } = await harness.next<{ primed: PlayReport; unprimed: PlayReport }>('freeze');
  observe(
    testInfo,
    `${UNPROMPTED_AFTER_MS / 1000}s after Start Quiz: primed element ${describePlay(primed)}, ` +
      `untouched element ${describePlay(unprimed)}`
  );

  expectHeard(primed);
  if (enforcesTapRule(testInfo)) {
    // The element no tap touched is still locked, so it was the prime that
    // unlocked the voice, not something about the page as a whole.
    expect(unprimed.result).toBe('blocked');
  }
});

test('Tap to hear: after a refused play, a tap plays the voice', async ({ page }, testInfo) => {
  const harness = await openHarness(page, { clip: TONE_URL, scenario: 'untapped' });
  await requireAudio(harness, testInfo);
  const untapped = await harness.next<PlayReport>('untapped');
  if (enforcesTapRule(testInfo)) expect(untapped.result).toBe('blocked');

  await press(page, testInfo, '#tap');
  const tapped = await harness.next<PlayReport>('tap');
  observe(testInfo, `unprompted ${describePlay(untapped)}, then tap: ${describePlay(tapped)}`);

  expectHeard(tapped);
});

test('a real Coach Mike recording plays at the freeze point after Start Quiz', async ({ page }, testInfo) => {
  test.skip(!REAL_CLIP_URL, 'Set COACH_CLIP_URL to a clip download URL to run this');

  const harness = await openHarness(page, { clip: REAL_CLIP_URL! });
  const ready = await requireAudio(harness, testInfo);
  observe(testInfo, `canPlayType("audio/mpeg") = "${ready.mp3}"`);

  await press(page, testInfo, '#start');
  expect(await harness.next<boolean>('prime')).toBe(true);

  const { primed } = await harness.next<{ primed: PlayReport; unprimed: PlayReport }>('freeze');
  observe(testInfo, `real clip at the freeze point: ${describePlay(primed)}`);

  expectHeard(primed);
});
