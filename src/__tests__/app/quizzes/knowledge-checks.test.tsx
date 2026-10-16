import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import QuizzesPage from '../../../../app/quizzes/page';
import { videoQuizService } from '@/lib/database/services/video-quiz.service';

vi.mock('@/lib/database/services/video-quiz.service', () => ({
  videoQuizService: {
    getPublishedVideoQuizzes: vi.fn(),
    getVideoQuizzes: vi.fn(),
    getUserVideoQuizAttempts: vi.fn(),
  },
}));

vi.mock('@/lib/auth/context', () => ({
  useAuth: () => ({ user: { id: 'test-user', role: 'student' }, loading: false }),
}));

vi.mock('@/components/auth/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/ui/skeletons', () => ({
  SkeletonListPage: () => <div data-testid="skeleton" />,
}));

vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const quiz = {
  id: 'quiz-1',
  title: 'Angles and depth',
  description: 'Play the shot, not the shooter',
  difficulty: 'easy',
  estimatedDuration: 5,
  questions: [{ id: 'q1' }, { id: 'q2' }],
  isActive: true,
  isPublished: true,
};

const page = (items: unknown[]) => ({
  success: true,
  data: { items, total: items.length, page: 1, limit: 100, hasMore: false },
  timestamp: new Date(),
});

describe('Knowledge Checks page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(videoQuizService.getUserVideoQuizAttempts).mockResolvedValue(page([]) as never);
  });

  it('lists the quizzes the admin has made active and published', async () => {
    vi.mocked(videoQuizService.getPublishedVideoQuizzes).mockResolvedValue(page([quiz]) as never);

    render(<QuizzesPage />);

    expect(await screen.findByText('Angles and depth')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/quiz/video/quiz-1');
  });

  it('asks for published quizzes and never filters on a `status` field', async () => {
    vi.mocked(videoQuizService.getPublishedVideoQuizzes).mockResolvedValue(page([quiz]) as never);

    render(<QuizzesPage />);
    await screen.findByText('Angles and depth');

    expect(videoQuizService.getPublishedVideoQuizzes).toHaveBeenCalledTimes(1);
    // The quiz form writes isActive and isPublished and nothing called `status`;
    // a query on it matches no document and leaves the page empty.
    expect(videoQuizService.getVideoQuizzes).not.toHaveBeenCalled();
  });

  it('says so plainly when nothing is published yet', async () => {
    vi.mocked(videoQuizService.getPublishedVideoQuizzes).mockResolvedValue(page([]) as never);

    render(<QuizzesPage />);

    await waitFor(() => expect(screen.getByText('No Knowledge Checks found')).toBeInTheDocument());
  });
});
