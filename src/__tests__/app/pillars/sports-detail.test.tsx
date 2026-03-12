import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import PillarDetailPage from '../../../../app/pillars/[id]/page';
import { sportsService } from '@/lib/database/services/sports.service';
import { videoQuizService } from '@/lib/database/services/video-quiz.service';

// Mock the services
vi.mock('@/lib/database/services/sports.service', () => ({
  sportsService: {
    getSport: vi.fn(),
    getSkillsBySport: vi.fn(),
  },
}));

vi.mock('@/lib/database/services/video-quiz.service', () => ({
  videoQuizService: {
    getVideoQuizzesBySkill: vi.fn(),
  },
}));

// Mock enrollment hook
vi.mock('@/hooks/useEnrollment', () => ({
  useSportEnrollment: () => ({
    enrolled: false,
    progress: null,
    loading: false,
    enroll: vi.fn(),
    unenroll: vi.fn(),
  }),
}));

// Mock auth context
vi.mock('@/lib/auth/context', () => ({
  useAuth: () => ({
    user: { id: 'test-user', role: 'student' },
    loading: false,
  }),
}));

// Mock Next.js router
const mockRouter = {
  push: vi.fn(),
  back: vi.fn(),
};

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useParams: () => ({ id: 'pillar_mindset' }),
}));

// Mock Link component
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockPillar = {
  id: 'pillar_mindset',
  name: 'Mindset',
  description: 'Mental preparation, focus, confidence, and game psychology',
  icon: 'Brain',
  color: '#3B82F6',
  category: 'pillar',
  difficulty: 'development' as const,
  estimatedTimeToComplete: 120,
  skillsCount: 5,
  imageUrl: '',
  tags: ['mental', 'psychology'],
  prerequisites: [],
  isActive: true,
  isFeatured: true,
  order: 1,
  metadata: {
    totalEnrollments: 50,
    totalCompletions: 25,
    averageRating: 4.5,
    totalRatings: 40,
    averageCompletionTime: 100,
  },
  createdAt: new Date() as any,
  updatedAt: new Date() as any,
  createdBy: 'admin',
};

const mockSkills = [
  {
    id: 'skill-1',
    sportId: 'pillar_mindset',
    name: 'Mental Preparation',
    description: 'Learn to prepare your mind before games',
    difficulty: 'introduction' as const,
    estimatedTimeToComplete: 30,
    content: '<p>Mental preparation content</p>',
    externalResources: [],
    media: undefined,
    prerequisites: [],
    learningObjectives: ['Build focus', 'Develop confidence'],
    tags: ['mental', 'preparation'],
    hasVideo: true,
    hasQuiz: true,
    isActive: true,
    order: 1,
    metadata: {
      totalCompletions: 20,
      averageCompletionTime: 25,
      averageRating: 4.3,
      totalRatings: 18,
      difficulty: 'introduction' as const,
    },
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
    createdBy: 'admin',
  },
];

const mockPillarResponse = {
  success: true,
  data: mockPillar,
  timestamp: new Date(),
};

const mockSkillsResponse = {
  success: true,
  data: {
    items: mockSkills,
    total: 1,
    page: 1,
    limit: 50,
    hasMore: false,
    totalPages: 1,
  },
  timestamp: new Date(),
};

describe('PillarDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (sportsService.getSport as ReturnType<typeof vi.fn>).mockResolvedValue(mockPillarResponse);
    (sportsService.getSkillsBySport as ReturnType<typeof vi.fn>).mockResolvedValue(mockSkillsResponse);
    (videoQuizService.getVideoQuizzesBySkill as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: { items: [], total: 0 },
    });
  });

  it('loads and displays pillar information correctly', async () => {
    render(<PillarDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Mindset')).toBeInTheDocument();
    });

    expect(screen.getByText(/Mental preparation, focus, confidence/)).toBeInTheDocument();
  });

  it('loads and displays skills correctly', async () => {
    render(<PillarDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Mental Preparation')).toBeInTheDocument();
    });

    expect(screen.getByText(/Learn to prepare your mind/)).toBeInTheDocument();
  });

  it('creates correct navigation links for skills', async () => {
    render(<PillarDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Mental Preparation')).toBeInTheDocument();
    });

    // Find link containing the skill
    const skillCard = screen.getByText('Mental Preparation').closest('a');
    expect(skillCard).toHaveAttribute('href', '/pillars/pillar_mindset/skills/skill-1');
  });

  it('handles pillar not found error', async () => {
    const errorResponse = {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Pillar not found',
      },
      timestamp: new Date(),
    };

    (sportsService.getSport as ReturnType<typeof vi.fn>).mockResolvedValue(errorResponse);

    render(<PillarDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(/not found|error/i)).toBeInTheDocument();
    });
  });

  it('displays empty state when no skills available', async () => {
    const emptySkillsResponse = {
      success: true,
      data: {
        items: [],
        total: 0,
        page: 1,
        limit: 50,
        hasMore: false,
        totalPages: 0,
      },
      timestamp: new Date(),
    };

    (sportsService.getSkillsBySport as ReturnType<typeof vi.fn>).mockResolvedValue(emptySkillsResponse);

    render(<PillarDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Mindset')).toBeInTheDocument();
    });

    // The pillar loads but no skills - check for empty or minimal skill display
    expect(screen.queryByText('Mental Preparation')).not.toBeInTheDocument();
  });
});
