'use client';

/**
 * Coach Audio context.
 *
 * Two problems this exists to solve:
 *
 *   1. There are close to a hundred "Hear Coach Mike" buttons across the site.
 *      If each one fetched its own clip record, opening a page would fire
 *      dozens of Firestore reads for a collection of at most 59 tiny
 *      documents. The provider reads the collection once and shares it.
 *
 *   2. Only one line should ever be audible. A single shared HTMLAudioElement
 *      means starting a clip stops whatever was playing, without every button
 *      needing to know about every other button.
 *
 * The voice on/off preference is per-viewer and lives in localStorage. It is a
 * convenience, not state anyone else needs, and it is read defensively — a
 * browser with site data blocked throws on access rather than returning null.
 *
 * Takes Michael is re-recording are left out of `clips` altogether, so every
 * button and every freeze point treats them as not uploaded yet. See
 * `isHeldForReRecord`.
 *
 * iPhones refuse a play that no tap started. `prime()` unlocks the shared
 * element from a tap, and `blockedId` names the clip the phone last refused so
 * the screen can ask for the tap instead of staying silent. See playback.ts.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { primeElement, startClip } from '@/lib/audio/playback';
import { coachAudioService } from '@/lib/database/services/coach-audio.service';
import { playableClips, type CoachAudioClip } from '@/types/coach-audio';

const ENABLED_STORAGE_KEY = 'sg.coachAudio.enabled';

interface CoachAudioContextValue {
  /** Clips that may play, by id: uploaded and not held. Empty until the first load resolves. */
  clips: Record<string, CoachAudioClip>;
  isLoading: boolean;
  /** The clip currently playing, or null. */
  playingId: string | null;
  /** The clip whose last play the browser refused for want of a tap, or null. */
  blockedId: string | null;
  /** Viewer's voice on/off preference. */
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  play: (id: string) => void;
  pause: () => void;
  /** Stops `id` if it is the clip playing, and leaves anything else alone. */
  stopClip: (id: string) => void;
  toggle: (id: string) => void;
  /**
   * Unlocks playback for a later play no tap starts, such as the freeze-point
   * voice. Call it synchronously inside a tap handler. Silent, and does nothing
   * once the element is unlocked.
   */
  prime: () => void;
  /** Re-reads the collection. Called by the admin screen after an upload. */
  refresh: () => Promise<void>;
}

const CoachAudioContext = createContext<CoachAudioContextValue | null>(null);

export function CoachAudioProvider({ children }: { children: ReactNode }) {
  const [clips, setClips] = useState<Record<string, CoachAudioClip>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [blockedId, setBlockedId] = useState<string | null>(null);
  const [enabled, setEnabledState] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  // True once the element has played from a tap, so `prime` has nothing to do.
  const unlockedRef = useRef(false);
  // The clip the element was last asked to play. Set at once rather than when
  // play() resolves, so `stopClip` also catches a clip that is still starting.
  const requestedIdRef = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    const result = await coachAudioService.getAllClips();
    if (result.success && result.data) setClips(playableClips(result.data));
    setIsLoading(false);
  }, []);

  // The first load runs here rather than calling `refresh()` in the effect
  // body, so the state updates land in a promise callback instead of
  // synchronously during the effect (which cascades a render, and which the
  // react-hooks lint rule rejects).
  useEffect(() => {
    let cancelled = false;

    void coachAudioService.getAllClips().then(result => {
      if (cancelled) return;
      if (result.success && result.data) setClips(playableClips(result.data));
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Restore the viewer's preference.
  //
  // Deferred to a timeout rather than read during render or set synchronously
  // on mount: the server has no localStorage, so it always renders with voice
  // on, and applying a stored `false` before hydration finishes would be a
  // markup mismatch. Reading is wrapped because access itself throws in a
  // browser configured to block site data.
  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(() => {
      if (cancelled) return;
      try {
        const stored = window.localStorage.getItem(ENABLED_STORAGE_KEY);
        if (stored !== null) setEnabledState(stored === 'true');
      } catch {
        /* default to on */
      }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  // One audio element for the whole app, created on the client only.
  useEffect(() => {
    const element = new Audio();
    element.preload = 'none';
    audioRef.current = element;

    const clearPlaying = () => setPlayingId(null);
    element.addEventListener('ended', clearPlaying);
    element.addEventListener('pause', clearPlaying);
    element.addEventListener('error', clearPlaying);

    return () => {
      element.removeEventListener('ended', clearPlaying);
      element.removeEventListener('pause', clearPlaying);
      element.removeEventListener('error', clearPlaying);
      element.pause();
      audioRef.current = null;
    };
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setPlayingId(null);
    // A refused play only matters while its moment is on screen.
    setBlockedId(null);
  }, []);

  const play = useCallback(
    (id: string) => {
      const element = audioRef.current;
      const clip = clips[id];
      if (!element || !clip) return;

      requestedIdRef.current = id;

      // `startClip` calls play() before it returns, so a press still counts as
      // the tap on an iPhone.
      void startClip(element, clip.url).then(outcome => {
        if (outcome === 'playing') {
          unlockedRef.current = true;
          setBlockedId(null);
          setPlayingId(id);
          return;
        }

        // Whatever went wrong, the button must not be left showing "playing".
        setPlayingId(null);

        if (outcome === 'blocked') {
          // The phone wants a tap. Say which clip, so the screen can ask for
          // one, and unlock again on the next tap that primes.
          unlockedRef.current = false;
          setBlockedId(id);
        }
      });
    },
    [clips]
  );

  const prime = useCallback(() => {
    const element = audioRef.current;
    // A playing element is already unlocked, and priming it would cut it off.
    if (!element || unlockedRef.current || !element.paused) return;

    requestedIdRef.current = null;
    void primeElement(element).then(unlocked => {
      if (unlocked) unlockedRef.current = true;
    });
  }, []);

  const stopClip = useCallback(
    (id: string) => {
      const element = audioRef.current;
      if (element && requestedIdRef.current === id && !element.paused) pause();
    },
    [pause]
  );

  const toggle = useCallback(
    (id: string) => {
      if (playingId === id) pause();
      else play(id);
    },
    [playingId, pause, play]
  );

  const setEnabled = useCallback(
    (value: boolean) => {
      setEnabledState(value);
      if (!value) pause();
      try {
        window.localStorage.setItem(ENABLED_STORAGE_KEY, String(value));
      } catch {
        /* preference simply will not persist */
      }
    },
    [pause]
  );

  const value = useMemo<CoachAudioContextValue>(
    () => ({
      clips,
      isLoading,
      playingId,
      blockedId,
      enabled,
      setEnabled,
      play,
      pause,
      stopClip,
      toggle,
      prime,
      refresh,
    }),
    [
      clips,
      isLoading,
      playingId,
      blockedId,
      enabled,
      setEnabled,
      play,
      pause,
      stopClip,
      toggle,
      prime,
      refresh,
    ]
  );

  return <CoachAudioContext.Provider value={value}>{children}</CoachAudioContext.Provider>;
}

export function useCoachAudio(): CoachAudioContextValue {
  const context = useContext(CoachAudioContext);
  if (!context) {
    throw new Error('useCoachAudio must be used inside a CoachAudioProvider');
  }
  return context;
}

/**
 * Everything one button needs for one clip.
 *
 * `available` is false when the recording has not been uploaded — which is the
 * normal state for the eight pillar intros, and for every line Michael has not
 * recorded for the marketing pages — and while a take is held for re-recording.
 * Callers decide whether that means a disabled button or no button at all.
 *
 * `wasBlocked` is true when this clip's last play was refused because nobody
 * tapped; a tap on the button will play it.
 */
export function useCoachAudioClip(id: string) {
  const { clips, isLoading, playingId, blockedId, enabled, toggle } = useCoachAudio();
  const clip = clips[id] ?? null;

  return {
    clip,
    available: clip !== null,
    isLoading,
    isPlaying: playingId === id,
    wasBlocked: clip !== null && blockedId === id,
    enabled,
    toggle: useCallback(() => toggle(id), [toggle, id]),
  };
}
