import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, it, expect } from 'vitest';
import { QuizVisibilityControl } from '@/components/admin/QuizVisibilityControl';

const complete = {
  title: 'Angles and depth',
  sportId: 'pillar-1',
  skillId: 'skill-1',
  videoUrl: 'https://example.com/video.mp4',
  questions: [{ id: 'q1' }],
};

describe('QuizVisibilityControl', () => {
  it('is one switch, off while either flag is off', () => {
    render(<QuizVisibilityControl quiz={{ ...complete, isActive: true, isPublished: false }} onChange={vi.fn()} />);

    expect(screen.getAllByRole('switch')).toHaveLength(1);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('status')).toHaveTextContent('Hidden from goalies');
  });

  it('reads live when both flags are on', () => {
    render(<QuizVisibilityControl quiz={{ ...complete, isActive: true, isPublished: true }} onChange={vi.fn()} />);

    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Goalies can see and take this Knowledge Check.');
  });

  it('asks to switch on when it is off, and off when it is on', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <QuizVisibilityControl quiz={{ ...complete, isActive: false, isPublished: false }} onChange={onChange} />,
    );
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenLastCalledWith(true);

    rerender(<QuizVisibilityControl quiz={{ ...complete, isActive: true, isPublished: true }} onChange={onChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it('says what is missing rather than claiming goalies can see it', () => {
    render(
      <QuizVisibilityControl
        quiz={{ ...complete, questions: [], isActive: true, isPublished: true }}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      'Not visible to goalies yet. It still needs at least one question.',
    );
  });
});
