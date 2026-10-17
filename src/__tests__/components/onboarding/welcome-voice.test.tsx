import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { stubMediaElements } from '../../helpers/media-element';
import { CoachBaselineQuestionnaire } from '@/components/onboarding/CoachBaselineQuestionnaire';
import { ParentBaselineQuestionnaire } from '@/components/onboarding/ParentBaselineQuestionnaire';
import { CoachAudioProvider } from '@/lib/audio/context';
import type { CoachAudioClip } from '@/types/coach-audio';

const { getAllClips } = vi.hoisted(() => ({ getAllClips: vi.fn() }));

vi.mock('@/lib/database/services/coach-audio.service', () => ({
  coachAudioService: { getAllClips },
}));

const UPLOADED = new Date('2026-10-04T09:00:00Z');
const LABEL = 'HEAR COACH MIKE: WELCOME';

function clip(id: string): CoachAudioClip {
  return {
    id,
    url: `https://storage.example/${id}.mp3`,
    storagePath: `coach-audio/${id}.mp3`,
    contentType: 'audio/mpeg',
    sizeBytes: 48_000,
    durationSeconds: 6,
    originalFilename: `${id}.mp3`,
    uploadedAt: UPLOADED,
    updatedAt: UPLOADED,
  };
}

/**
 * A parent or coach registers and lands on the first screen of their baseline
 * profile. Michael's welcome words are already on it; the recording of him
 * saying them belongs there too.
 */
const FLOWS = [
  {
    name: 'coach',
    id: 'COACH-WELCOME',
    begin: 'BEGIN THE COACH BASELINE PROFILE',
    ui: () => <CoachBaselineQuestionnaire userId="coach-under-test" userName="Test Coach" onComplete={vi.fn()} />,
  },
  {
    name: 'parent',
    id: 'PARENT-WELCOME',
    begin: 'BEGIN THE PARENT BASELINE PROFILE',
    ui: () => <ParentBaselineQuestionnaire userId="parent-under-test" userName="Test Parent" onComplete={vi.fn()} />,
  },
] as const;

async function open(ui: React.ReactElement) {
  render(<CoachAudioProvider>{ui}</CoachAudioProvider>);
  await waitFor(() =>
    expect(screen.queryByRole('button', { name: 'This recording has not been added yet' })).toBeNull()
  );
}

const playButton = () => screen.queryByRole('button', { name: `Play Coach Mike: ${LABEL}` });

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

describe.each(FLOWS)('onboarding — Coach Mike welcome for the $name', ({ id, begin, ui }) => {
  it(`offers ${id} on the first screen once it is uploaded`, async () => {
    getAllClips.mockResolvedValue({ success: true, data: { [id]: clip(id) } });
    await open(ui());
    expect(playButton()).not.toBeNull();
  });

  it(`offers nothing while ${id} is not uploaded`, async () => {
    getAllClips.mockResolvedValue({ success: true, data: {} });
    await open(ui());
    expect(screen.queryByRole('button', { name: /Coach Mike/ })).toBeNull();
    expect(screen.queryByText('NOT RECORDED YET')).toBeNull();
  });

  it('plays the welcome when the button is pressed', async () => {
    getAllClips.mockResolvedValue({ success: true, data: { [id]: clip(id) } });
    await open(ui());

    fireEvent.click(playButton()!);
    await act(async () => {});

    expect(media.state.playedSources).toEqual([`https://storage.example/${id}.mp3`]);
  });

  it('still lets them begin, with or without the clip', async () => {
    getAllClips.mockResolvedValue({ success: true, data: {} });
    await open(ui());
    expect(screen.getByRole('button', { name: new RegExp(begin) })).toBeEnabled();
  });

  it('stops the welcome when they begin', async () => {
    getAllClips.mockResolvedValue({ success: true, data: { [id]: clip(id) } });
    await open(ui());

    fireEvent.click(playButton()!);
    await act(async () => {});
    expect(media.pause).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: new RegExp(begin) }));

    expect(media.pause).toHaveBeenCalled();
    expect(media.state.paused).toBe(true);
  });
});
