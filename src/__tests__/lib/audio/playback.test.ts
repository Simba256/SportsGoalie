import { describe, it, expect, vi } from 'vitest';

import {
  createSilentWav,
  primeElement,
  silentWavDataUri,
  startClip,
} from '@/lib/audio/playback';

const DATA_URI_PREFIX = 'data:audio/wav;base64,';
const CLIP_URL = 'https://storage.example/V-A-03.mp3';

function ascii(bytes: Uint8Array, offset: number, length: number): string {
  return String.fromCharCode(...bytes.slice(offset, offset + length));
}

/**
 * Just enough of an audio element to drive the helpers, with `src` assignments
 * counted: assigning a src, even the same one, makes a real element reload.
 */
function fakeElement(play: () => Promise<void> | undefined, initialSrc = '') {
  let src = initialSrc;
  const element = {
    srcAssignments: 0,
    currentTime: 42,
    play: vi.fn(play),
    get src() {
      return src;
    },
    set src(value: string) {
      element.srcAssignments += 1;
      src = value;
    },
  };
  return element;
}

type FakeElement = ReturnType<typeof fakeElement>;

const asAudio = (element: FakeElement) => element as unknown as HTMLAudioElement;
const refused = () => Promise.reject(new DOMException('no tap', 'NotAllowedError'));
const aborted = () => Promise.reject(new DOMException('replaced', 'AbortError'));

describe('createSilentWav', () => {
  it('writes a 16-bit mono PCM WAV header that matches its own length', () => {
    const bytes = createSilentWav();
    const view = new DataView(bytes.buffer);

    expect(bytes.length).toBe(1644); // 44-byte header + 0.1 s at 8 kHz, 2 bytes a sample
    expect(ascii(bytes, 0, 4)).toBe('RIFF');
    expect(view.getUint32(4, true)).toBe(bytes.length - 8);
    expect(ascii(bytes, 8, 4)).toBe('WAVE');
    expect(ascii(bytes, 12, 4)).toBe('fmt ');
    expect(view.getUint32(16, true)).toBe(16);
    expect(view.getUint16(20, true)).toBe(1); // PCM
    expect(view.getUint16(22, true)).toBe(1); // mono
    expect(view.getUint32(24, true)).toBe(8000);
    expect(view.getUint32(28, true)).toBe(16000);
    expect(view.getUint16(32, true)).toBe(2);
    expect(view.getUint16(34, true)).toBe(16);
    expect(ascii(bytes, 36, 4)).toBe('data');
    expect(view.getUint32(40, true)).toBe(bytes.length - 44);
  });

  it('is silence', () => {
    expect(createSilentWav().subarray(44).every(byte => byte === 0)).toBe(true);
  });
});

describe('silentWavDataUri', () => {
  it('decodes back to the same file', () => {
    const uri = silentWavDataUri();
    expect(uri.startsWith(DATA_URI_PREFIX)).toBe(true);

    const decoded = Uint8Array.from(atob(uri.slice(DATA_URI_PREFIX.length)), c => c.charCodeAt(0));
    expect(Array.from(decoded)).toEqual(Array.from(createSilentWav()));
  });

  it('is built once', () => {
    expect(silentWavDataUri()).toBe(silentWavDataUri());
  });
});

describe('startClip', () => {
  it('calls play() before returning, so a tap handler still counts as the tap', () => {
    const element = fakeElement(() => Promise.resolve());
    void startClip(asAudio(element), CLIP_URL);
    expect(element.play).toHaveBeenCalledTimes(1);
  });

  it('loads the clip, rewinds it and reports it playing', async () => {
    const element = fakeElement(() => Promise.resolve());
    await expect(startClip(asAudio(element), CLIP_URL)).resolves.toBe('playing');
    expect(element.src).toBe(CLIP_URL);
    expect(element.currentTime).toBe(0);
  });

  it('does not reload a clip that is already loaded', async () => {
    const element = fakeElement(() => Promise.resolve(), CLIP_URL);
    await startClip(asAudio(element), CLIP_URL);
    expect(element.srcAssignments).toBe(0);
    expect(element.currentTime).toBe(0);
  });

  it('reports a play refused for want of a tap as blocked', async () => {
    await expect(startClip(asAudio(fakeElement(refused)), CLIP_URL)).resolves.toBe('blocked');
  });

  it('reports every other failure as failed, not blocked', async () => {
    await expect(startClip(asAudio(fakeElement(aborted)), CLIP_URL)).resolves.toBe('failed');
    await expect(
      startClip(
        asAudio(fakeElement(() => Promise.reject(new DOMException('bad file', 'NotSupportedError')))),
        CLIP_URL
      )
    ).resolves.toBe('failed');
  });

  it('copes with a play() that throws instead of rejecting', async () => {
    const throwsRefusal = fakeElement(() => {
      throw new DOMException('no tap', 'NotAllowedError');
    });
    const throwsOther = fakeElement(() => {
      throw new TypeError('broken');
    });

    await expect(startClip(asAudio(throwsRefusal), CLIP_URL)).resolves.toBe('blocked');
    await expect(startClip(asAudio(throwsOther), CLIP_URL)).resolves.toBe('failed');
  });

  it('copes with an older browser whose play() returns nothing', async () => {
    await expect(startClip(asAudio(fakeElement(() => undefined)), CLIP_URL)).resolves.toBe('playing');
  });
});

describe('primeElement', () => {
  it('plays the silence, calling play() before returning', () => {
    const element = fakeElement(() => Promise.resolve());
    void primeElement(asAudio(element));
    expect(element.src).toBe(silentWavDataUri());
    expect(element.play).toHaveBeenCalledTimes(1);
  });

  it('reports the element unlocked when the silence plays', async () => {
    await expect(primeElement(asAudio(fakeElement(() => Promise.resolve())))).resolves.toBe(true);
  });

  it('reports it still locked when the browser refuses', async () => {
    await expect(primeElement(asAudio(fakeElement(refused)))).resolves.toBe(false);
  });

  it('counts a play cut short by a real clip as unlocked — the tap still happened', async () => {
    await expect(primeElement(asAudio(fakeElement(aborted)))).resolves.toBe(true);
  });
});
