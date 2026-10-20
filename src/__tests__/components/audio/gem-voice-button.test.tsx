import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { GemVoiceButton } from '@/components/audio/GemVoiceButton';

const { useCoachAudioClip } = vi.hoisted(() => ({ useCoachAudioClip: vi.fn() }));

vi.mock('@/lib/audio/context', () => ({
  useCoachAudioClip,
  useCoachAudio: () => ({ setEnabled: vi.fn() }),
}));

const LABEL = 'HEAR COACH MIKE: THE CAR RIDE HOME';

function clipState(over: Partial<ReturnType<typeof useCoachAudioClip>>) {
  return {
    clip: undefined,
    available: false,
    isLoading: false,
    isPlaying: false,
    enabled: true,
    toggle: vi.fn(),
    ...over,
  };
}

beforeEach(() => {
  useCoachAudioClip.mockReset();
  useCoachAudioClip.mockReturnValue(clipState({}));
});

afterEach(cleanup);

describe('GemVoiceButton', () => {
  it('draws nothing while the gem has no clip id', () => {
    const { container } = render(<GemVoiceButton label={LABEL} />);

    expect(container).toBeEmptyDOMElement();
    expect(useCoachAudioClip).not.toHaveBeenCalled();
  });

  it('stays hidden when the clip id has no recording uploaded', () => {
    const { container } = render(<GemVoiceButton label={LABEL} clipId="G-001" />);

    expect(container).toBeEmptyDOMElement();
  });

  it('appears once the recording is uploaded', () => {
    useCoachAudioClip.mockReturnValue(clipState({ available: true }));

    render(<GemVoiceButton label={LABEL} clipId="G-001" />);

    expect(screen.getByRole('button', { name: /Play Coach Mike/ })).toBeInTheDocument();
  });
});
