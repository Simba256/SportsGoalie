import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import PillarsPage from '../../../../app/pillars/page';
import { sportsService } from '../../../lib/database/services/sports.service';

// Mock the sports service
vi.mock('../../../lib/database/services/sports.service', () => ({
  sportsService: {
    getAllSports: vi.fn(),
  },
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock Link component
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock pillar data matching the 7-pillar system
const mockPillarsData = {
  success: true,
  data: {
    items: [
      {
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
          totalEnrollments: 0,
          totalCompletions: 0,
          averageRating: 0,
          totalRatings: 0,
          averageCompletionTime: 0,
        },
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
        createdBy: 'admin',
      },
      {
        id: 'pillar_movement',
        name: 'Movement',
        description: 'Skating, positioning, lateral movement, and recovery',
        icon: 'Footprints',
        color: '#10B981',
        category: 'pillar',
        difficulty: 'development' as const,
        estimatedTimeToComplete: 150,
        skillsCount: 8,
        imageUrl: '',
        tags: ['skating', 'movement'],
        prerequisites: [],
        isActive: true,
        isFeatured: true,
        order: 2,
        metadata: {
          totalEnrollments: 0,
          totalCompletions: 0,
          averageRating: 0,
          totalRatings: 0,
          averageCompletionTime: 0,
        },
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
        createdBy: 'admin',
      },
      {
        id: 'pillar_technique',
        name: 'Technique',
        description: 'Save techniques, stance, glove work, and stick handling',
        icon: 'Shapes',
        color: '#8B5CF6',
        category: 'pillar',
        difficulty: 'development' as const,
        estimatedTimeToComplete: 180,
        skillsCount: 10,
        imageUrl: '',
        tags: ['saves', 'technique'],
        prerequisites: [],
        isActive: true,
        isFeatured: true,
        order: 3,
        metadata: {
          totalEnrollments: 0,
          totalCompletions: 0,
          averageRating: 0,
          totalRatings: 0,
          averageCompletionTime: 0,
        },
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
        createdBy: 'admin',
      },
    ],
    total: 3,
    page: 1,
    limit: 50,
    hasMore: false,
    totalPages: 1,
  },
  timestamp: new Date(),
};

describe('PillarsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (sportsService.getAllSports as ReturnType<typeof vi.fn>).mockResolvedValue(mockPillarsData);
  });

  it('renders pillars page with header and description', async () => {
    render(<PillarsPage />);

    await waitFor(() => {
      expect(screen.getByText('Ice Hockey Goalie Pillars')).toBeInTheDocument();
    });

    expect(screen.getByText(/Master the 7 fundamental pillars of goaltending/)).toBeInTheDocument();
  });

  it('displays pillar count badge', async () => {
    render(<PillarsPage />);

    await waitFor(() => {
      expect(screen.getByText('7 pillars')).toBeInTheDocument();
    });
  });

  it('loads and displays pillar data correctly', async () => {
    render(<PillarsPage />);

    await waitFor(() => {
      expect(screen.getByText('Mindset')).toBeInTheDocument();
      expect(screen.getByText('Movement')).toBeInTheDocument();
      expect(screen.getByText('Technique')).toBeInTheDocument();
    });

    // Check pillar descriptions
    expect(screen.getByText(/Mental preparation, focus, confidence/)).toBeInTheDocument();
    expect(screen.getByText(/Skating, positioning, lateral movement/)).toBeInTheDocument();
  });

  it('creates correct navigation links for pillars', async () => {
    render(<PillarsPage />);

    await waitFor(() => {
      expect(screen.getByText('Mindset')).toBeInTheDocument();
    });

    // Find the pillar card links
    const mindsetLink = screen.getByText('Mindset').closest('a');
    const movementLink = screen.getByText('Movement').closest('a');

    expect(mindsetLink).toHaveAttribute('href', '/pillars/pillar_mindset');
    expect(movementLink).toHaveAttribute('href', '/pillars/pillar_movement');
  });

  it('handles API errors gracefully', async () => {
    const errorResponse = {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Failed to load pillars',
      },
      timestamp: new Date(),
    };

    (sportsService.getAllSports as ReturnType<typeof vi.fn>).mockResolvedValue(errorResponse);

    render(<PillarsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Error/)).toBeInTheDocument();
    });
  });
});
