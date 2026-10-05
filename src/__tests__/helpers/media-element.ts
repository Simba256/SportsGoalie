import { vi } from 'vitest';

/**
 * How the next play() call goes:
 *
 * - `plays`   — starts.
 * - `refused` — the browser wants a tap (NotAllowedError), as an iPhone does.
 * - `aborted` — something replaced it before it started (AbortError).
 * - `loading` — never settles, like a clip still coming down the wire.
 */
export type PlayOutcome = 'plays' | 'refused' | 'aborted' | 'loading';

/**
 * jsdom has audio elements but cannot play them: play() and pause() only log
 * "not implemented", and `paused` never changes. This stands in for a browser
 * closely enough to test the Coach Audio provider. Restore it with
 * `vi.restoreAllMocks()`.
 *
 * As in a browser, an element reports itself playing as soon as play() is
 * called, before the promise settles, and pause() on a playing element fires
 * 'pause'.
 */
export function stubMediaElements() {
  const state = {
    paused: true,
    nextPlay: 'plays' as PlayOutcome,
    /** The element's src at each play() call, in order. */
    playedSources: [] as string[],
    element: null as HTMLMediaElement | null,
  };

  vi.spyOn(HTMLMediaElement.prototype, 'paused', 'get').mockImplementation(() => state.paused);

  const play = vi
    .spyOn(HTMLMediaElement.prototype, 'play')
    .mockImplementation(function (this: HTMLMediaElement) {
      state.element = this;
      state.playedSources.push(this.src);

      if (state.nextPlay === 'refused') {
        return Promise.reject(new DOMException('no tap', 'NotAllowedError'));
      }
      if (state.nextPlay === 'aborted') {
        return Promise.reject(new DOMException('replaced', 'AbortError'));
      }

      state.paused = false;
      return state.nextPlay === 'loading' ? new Promise<void>(() => {}) : Promise.resolve();
    });

  const pause = vi
    .spyOn(HTMLMediaElement.prototype, 'pause')
    .mockImplementation(function (this: HTMLMediaElement) {
      if (state.paused) return;
      state.paused = true;
      this.dispatchEvent(new Event('pause'));
    });

  /** The clip reaches its end by itself. */
  const end = () => {
    state.paused = true;
    state.element?.dispatchEvent(new Event('ended'));
  };

  return { state, play, pause, end };
}
