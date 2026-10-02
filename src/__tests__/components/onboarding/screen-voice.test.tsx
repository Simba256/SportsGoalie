import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { stubMediaElements } from '../../helpers/media-element';
import { StudentBaselineQuestionnaire } from '@/components/onboarding/StudentBaselineQuestionnaire';
import { CoachAudioProvider } from '@/lib/audio/context';
import type { CoachAudioClip } from '@/types/coach-audio';

const { getAllClips } = vi.hoisted(() => ({ getAllClips: vi.fn() }));

vi.mock('@/lib/database/services/coach-audio.service', () => ({
  coachAudioService: { getAllClips },
}));

const USER_ID = 'goalie-under-test';
const FIRST_FOLDER_UPLOAD = new Date('2026-09-13T15:00:00Z');
const NEW_TAKE_UPLOAD = new Date('2026-10-02T09:00:00Z');

/** The five welcome lines, the screen each sits on, and its button label. */
const SCREENS = [
  { id: 'V-A-01', phase: 'hero', label: 'HEAR COACH MIKE: WELCOME IN' },
  { id: 'V-A-02', phase: 'dp_choice', label: 'HEAR COACH MIKE: WHAT THIS IS' },
  { id: 'V-A-03', phase: 'dp_reply', label: 'HEAR COACH MIKE: BUILT NOT BORN' },
  { id: 'V-A-04', phase: 'privacy_gate', label: 'HEAR COACH MIKE: THE HONESTY RULE' },
  { id: 'V-A-05', phase: 'closing', label: 'HEAR COACH MIKE: HOW TO USE THE DAY' },
] as const;

function clip(id: string, uploadedAt: Date): CoachAudioClip {
  return {
    id,
    url: `https://storage.example/${id}.mp3`,
    storagePath: `coach-audio/${id}.mp3`,
    contentType: 'audio/mpeg',
    sizeBytes: 48_000,
    durationSeconds: 6,
    originalFilename: `${id}.mp3`,
    uploadedAt,
    updatedAt: uploadedAt,
  };
}

/** What is on file today: all five from the first folder. */
function firstFolder(): Record<string, CoachAudioClip> {
  return Object.fromEntries(SCREENS.map(s => [s.id, clip(s.id, FIRST_FOLDER_UPLOAD)]));
}

/** Opens the questionnaire on a given screen, through the saved-draft path it resumes from. */
async function openAt(phase: string) {
  window.localStorage.setItem(
    `sbq-draft-${USER_ID}`,
    JSON.stringify({
      phase,
      sectionIndex: 0,
      questionIndex: 0,
      responses: {},
      openExtras: {},
      driverChoice: 'driver',
      intake: { name: 'Test Goalie' },
    })
  );

  render(
    <CoachAudioProvider>
      <StudentBaselineQuestionnaire userId={USER_ID} userName="Test Goalie" onComplete={vi.fn()} />
    </CoachAudioProvider>
  );

  // Until the clip list is in, every voice button holds its place, disabled.
  await waitFor(() =>
    expect(screen.queryByRole('button', { name: 'This recording has not been added yet' })).toBeNull()
  );
}

const playButton = (label: string) => screen.queryByRole('button', { name: `Play Coach Mike: ${label}` });

let media: ReturnType<typeof stubMediaElements>;

beforeEach(() => {
  window.localStorage.clear();
  media = stubMediaElements();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe('onboarding — Coach Mike on the opening screens', () => {
  it.each(SCREENS.filter(s => s.id === 'V-A-03' || s.id === 'V-A-04'))(
    'offers $id on the $phase screen',
    async ({ phase, label }) => {
      getAllClips.mockResolvedValue({ success: true, data: firstFolder() });
      await openAt(phase);
      expect(playButton(label)).not.toBeNull();
    }
  );

  it.each(SCREENS.filter(s => s.id === 'V-A-01' || s.id === 'V-A-02' || s.id === 'V-A-05'))(
    'offers nothing on the $phase screen while $id is held for re-recording',
    async ({ phase }) => {
      getAllClips.mockResolvedValue({ success: true, data: firstFolder() });
      await openAt(phase);
      expect(screen.queryByRole('button', { name: /Coach Mike/ })).toBeNull();
      expect(screen.queryByText('NOT RECORDED YET')).toBeNull();
    }
  );

  it.each(SCREENS)('offers $id on the $phase screen once a new take is uploaded', async ({ id, phase, label }) => {
    getAllClips.mockResolvedValue({
      success: true,
      data: { ...firstFolder(), [id]: clip(id, NEW_TAKE_UPLOAD) },
    });
    await openAt(phase);
    expect(playButton(label)).not.toBeNull();
  });

  it('offers nothing when a line has not been uploaded at all', async () => {
    getAllClips.mockResolvedValue({ success: true, data: {} });
    await openAt('privacy_gate');
    expect(screen.queryByRole('button', { name: /Coach Mike/ })).toBeNull();
  });

  it('plays the line when the button is pressed', async () => {
    getAllClips.mockResolvedValue({ success: true, data: firstFolder() });
    await openAt('privacy_gate');

    fireEvent.click(playButton('HEAR COACH MIKE: THE HONESTY RULE')!);
    await act(async () => {});

    expect(media.state.playedSources).toEqual(['https://storage.example/V-A-04.mp3']);
    expect(
      screen.getByRole('button', { name: 'Pause Coach Mike: HEAR COACH MIKE: THE HONESTY RULE' })
    ).toBeInTheDocument();
  });

  it('stops the line when the goalie moves on to the next screen', async () => {
    getAllClips.mockResolvedValue({
      success: true,
      data: { ...firstFolder(), 'V-A-01': clip('V-A-01', NEW_TAKE_UPLOAD) },
    });
    await openAt('hero');

    fireEvent.click(playButton('HEAR COACH MIKE: WELCOME IN')!);
    await act(async () => {});
    expect(media.pause).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /BEGIN THE STUDENT BASELINE PROFILE/ }));

    expect(media.pause).toHaveBeenCalledTimes(1);
    expect(media.state.paused).toBe(true);
  });
});
