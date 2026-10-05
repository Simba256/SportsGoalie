import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';

import { stubMediaElements } from '../../helpers/media-element';
import { markVoiceMoment, refreshUser, resetFakeAuth, signIn } from '../../helpers/fake-auth';
import { FirstVisitVoice } from '@/components/audio/FirstVisitVoice';
import { PillarTeachingVoice } from '@/components/audio/PillarTeachingVoice';
import { CoachAudioProvider } from '@/lib/audio/context';
import { PILLAR_TEACHING_CLIPS } from '@/lib/audio/placements';
import { COACH_AUDIO_CATALOGUE, type CoachAudioClip } from '@/types/coach-audio';

const { getAllClips } = vi.hoisted(() => ({ getAllClips: vi.fn() }));

vi.mock('@/lib/database/services/coach-audio.service', () => ({
  coachAudioService: { getAllClips },
}));
vi.mock('@/lib/auth/context', async () => {
  const { useAuth } = await import('../../helpers/fake-auth');
  return { useAuth };
});
vi.mock('@/lib/database/services/user.service', async () => {
  const { markVoiceMoment } = await import('../../helpers/fake-auth');
  return { userService: { markVoiceMoment } };
});

const UPLOADED = new Date('2026-10-04T09:00:00Z');
const url = (id: string) => `https://storage.example/${id}.mp3`;

function clip(id: string): CoachAudioClip {
  return {
    id,
    url: url(id),
    storagePath: `coach-audio/${id}.mp3`,
    contentType: 'audio/mpeg',
    sizeBytes: 48_000,
    durationSeconds: 6,
    originalFilename: `${id}.mp3`,
    uploadedAt: UPLOADED,
    updatedAt: UPLOADED,
  };
}

const onFile = (ids: string[]) => Object.fromEntries(ids.map(id => [id, clip(id)]));

const GOALIE = { id: 'goalie-1', role: 'student', onboardingCompleted: true };
const MIND_VAULT_LABEL = 'HEAR COACH MIKE: THE MIND-VAULT';

let media: ReturnType<typeof stubMediaElements>;

/** Renders inside the provider and lets the clip list and voice preference load. */
async function mount(ui: React.ReactElement) {
  const view = render(<CoachAudioProvider>{ui}</CoachAudioProvider>);
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 5));
  });
  return view;
}

/** The play buttons on screen, in page order, by their accessible names. */
const playButtons = () =>
  screen.queryAllByRole('button', { name: /^(Play|Pause) Coach Mike/ }).map(b => b.getAttribute('aria-label'));
const voiceToggles = () => screen.queryAllByRole('button', { name: /^VOICE (ON|OFF)$/ });

beforeEach(() => {
  window.localStorage.clear();
  media = stubMediaElements();
  resetFakeAuth();
  getAllClips.mockResolvedValue({ success: true, data: {} });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe('placements', () => {
  it('only name clips that are in the catalogue', () => {
    const known = new Set(COACH_AUDIO_CATALOGUE.map(entry => entry.id));
    for (const placed of Object.values(PILLAR_TEACHING_CLIPS)) {
      for (const { clipId } of placed) expect(known.has(clipId), clipId).toBe(true);
    }
  });
});

describe('PillarTeachingVoice — 7 Angle-Marker System (pillar_positioning)', () => {
  beforeEach(() => {
    getAllClips.mockResolvedValue({ success: true, data: onFile(['V-A-06', 'V-A-09', 'V-A-10']) });
  });

  it('stacks V-A-06, then V-A-09, then V-A-10', async () => {
    await mount(<PillarTeachingVoice pillarId="pillar_positioning" />);

    expect(playButtons()).toEqual([
      'Play Coach Mike: HEAR COACH MIKE: THE 7 ANGLE-MARKER SYSTEM',
      'Play Coach Mike: HEAR COACH MIKE: THE 4 LEVEL ARCH SYSTEM',
      'Play Coach Mike: HEAR COACH MIKE: THE THREE LANES OF ATTACK',
    ]);
  });

  it('plays the right clip from each button', async () => {
    await mount(<PillarTeachingVoice pillarId="pillar_positioning" />);

    const [first, second, third] = screen.getAllByRole('button', { name: /^Play Coach Mike/ });
    await act(async () => fireEvent.click(first));
    expect(media.state.playedSources.at(-1)).toBe(url('V-A-06'));

    await act(async () => fireEvent.click(second));
    expect(media.state.playedSources.at(-1)).toBe(url('V-A-09'));

    await act(async () => fireEvent.click(third));
    expect(media.state.playedSources.at(-1)).toBe(url('V-A-10'));
  });

  it('shows a single VOICE ON switch for the whole stack, not one per button', async () => {
    await mount(<PillarTeachingVoice pillarId="pillar_positioning" />);
    expect(voiceToggles()).toHaveLength(1);
  });

  it('puts the switch beside the first button that is showing', async () => {
    getAllClips.mockResolvedValue({ success: true, data: onFile(['V-A-09', 'V-A-10']) });
    await mount(<PillarTeachingVoice pillarId="pillar_positioning" />);

    expect(playButtons()).toHaveLength(2);
    expect(voiceToggles()).toHaveLength(1);
  });

  it('shows no button for a clip that is not uploaded, and no "not recorded" notice', async () => {
    getAllClips.mockResolvedValue({ success: true, data: onFile(['V-A-06', 'V-A-10']) });
    await mount(<PillarTeachingVoice pillarId="pillar_positioning" />);

    expect(playButtons()).toEqual([
      'Play Coach Mike: HEAR COACH MIKE: THE 7 ANGLE-MARKER SYSTEM',
      'Play Coach Mike: HEAR COACH MIKE: THE THREE LANES OF ATTACK',
    ]);
    expect(screen.queryByText('NOT RECORDED YET')).toBeNull();
  });

  it('shows nothing at all while none of them is uploaded', async () => {
    getAllClips.mockResolvedValue({ success: true, data: {} });
    await mount(<PillarTeachingVoice pillarId="pillar_positioning" />);

    expect(playButtons()).toEqual([]);
    expect(voiceToggles()).toEqual([]);
  });
});

describe('PillarTeachingVoice — 6 Zone, 7 Point System (pillar_seven_point)', () => {
  it('stacks V-A-07, then V-A-08 directly beneath it', async () => {
    getAllClips.mockResolvedValue({ success: true, data: onFile(['V-A-07', 'V-A-08']) });
    await mount(<PillarTeachingVoice pillarId="pillar_seven_point" />);

    expect(playButtons()).toEqual([
      'Play Coach Mike: HEAR COACH MIKE: THE 6 ZONE, 7 POINT SYSTEM',
      'Play Coach Mike: HEAR COACH MIKE: ANGLES 1 AND 7 ARE THE SAME',
    ]);
    expect(voiceToggles()).toHaveLength(1);
  });

  it('does not carry the 7 Angle-Marker clips, and they do not carry its own', async () => {
    getAllClips.mockResolvedValue({
      success: true,
      data: onFile(['V-A-06', 'V-A-07', 'V-A-08', 'V-A-09', 'V-A-10']),
    });
    await mount(<PillarTeachingVoice pillarId="pillar_seven_point" />);

    expect(playButtons()).toHaveLength(2);
    expect(playButtons().join(' ')).not.toMatch(/ANGLE-MARKER|ARCH|LANES/);
  });
});

describe('PillarTeachingVoice — other pillars', () => {
  it.each(['pillar_mindset', 'pillar_unknown', ''])('renders nothing for %j', async pillarId => {
    getAllClips.mockResolvedValue({
      success: true,
      data: onFile(['V-A-06', 'V-A-07', 'V-A-08', 'V-A-09', 'V-A-10']),
    });
    const { container } = await mount(<PillarTeachingVoice pillarId={pillarId} />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe('FirstVisitVoice — the Mind-Vault, first visit only', () => {
  beforeEach(() => {
    getAllClips.mockResolvedValue({ success: true, data: onFile(['V-A-14']) });
  });

  const vault = () => <FirstVisitVoice moment="mindVaultFirstVisit" label={MIND_VAULT_LABEL} />;

  it('shows the V-A-14 button on the first visit and counts the visit', async () => {
    signIn(GOALIE);
    await mount(vault());

    expect(playButtons()).toEqual([`Play Coach Mike: ${MIND_VAULT_LABEL}`]);
    expect(markVoiceMoment).toHaveBeenCalledTimes(1);
    expect(markVoiceMoment).toHaveBeenCalledWith('goalie-1', 'mindVaultFirstVisit');
  });

  it('plays V-A-14 when pressed, and does not start by itself', async () => {
    signIn(GOALIE);
    await mount(vault());
    expect(media.play).not.toHaveBeenCalled();

    await act(async () => fireEvent.click(screen.getByRole('button', { name: /^Play Coach Mike/ })));
    expect(media.state.playedSources).toEqual([url('V-A-14')]);
  });

  it('keeps the button for the rest of the visit after counting it', async () => {
    signIn(GOALIE);
    await mount(vault());

    expect(refreshUser).toHaveBeenCalledTimes(1);
    expect(playButtons()).toHaveLength(1);
  });

  it('is gone on the next visit', async () => {
    signIn(GOALIE);
    const first = await mount(vault());
    first.unmount();

    await mount(vault());
    expect(playButtons()).toEqual([]);
    expect(markVoiceMoment).toHaveBeenCalledTimes(1);
  });

  it('is gone for a goalie whose account says the visit has happened', async () => {
    signIn({ ...GOALIE, voiceMoments: { mindVaultFirstVisit: new Date('2026-10-05T00:00:00Z') } });
    await mount(vault());

    expect(playButtons()).toEqual([]);
    expect(markVoiceMoment).not.toHaveBeenCalled();
  });

  it('is not shown, and the visit is not counted, while V-A-14 is not uploaded', async () => {
    getAllClips.mockResolvedValue({ success: true, data: {} });
    signIn(GOALIE);
    await mount(vault());

    expect(playButtons()).toEqual([]);
    expect(markVoiceMoment).not.toHaveBeenCalled();
  });

  it('counts the visit once the recording is uploaded, not before', async () => {
    getAllClips.mockResolvedValue({ success: true, data: {} });
    signIn(GOALIE);
    const missing = await mount(vault());
    missing.unmount();
    expect(markVoiceMoment).not.toHaveBeenCalled();

    getAllClips.mockResolvedValue({ success: true, data: onFile(['V-A-14']) });
    await mount(vault());
    expect(playButtons()).toHaveLength(1);
    expect(markVoiceMoment).toHaveBeenCalledTimes(1);
  });

  it('shows nothing when nobody is signed in', async () => {
    await mount(vault());

    expect(playButtons()).toEqual([]);
    expect(markVoiceMoment).not.toHaveBeenCalled();
  });
});
