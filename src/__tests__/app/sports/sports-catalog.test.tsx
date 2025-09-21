import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SportsPage from '../../../../app/sports/page';
import { sportsService } from '../../lib/database/services/sports.service';

// Mock the sports service
jest.mock('../../lib/database/services/sports.service', () => ({
  sportsService: {
    getAllSports: jest.fn(),
    searchSports: jest.fn(),
  },
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

const mockSportsData = {
  success: true,
  data: {
    items: [
      {
        id: 'sport-1',
        name: 'Basketball',
        description: 'Learn basketball fundamentals and advanced techniques',
        icon: '🏀',
        color: '#FF6B35',
        category: 'team-sports',
        difficulty: 'intermediate' as const,
        estimatedTimeToComplete: 120,
        skillsCount: 15,
        imageUrl: 'https://example.com/basketball.jpg',
        tags: ['team', 'indoor', 'ball-game'],
        prerequisites: [],
        isActive: true,
        isFeatured: true,
        order: 1,
        metadata: {
          totalEnrollments: 150,
          totalCompletions: 75,
          averageRating: 4.5,
          totalRatings: 120,
          averageCompletionTime: 100,
        },
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
        createdBy: 'admin',
      },
      {
        id: 'sport-2',
        name: 'Tennis',
        description: 'Master tennis techniques from basic to professional level',
        icon: '🎾',
        color: '#4CAF50',
        category: 'individual-sports',
        difficulty: 'beginner' as const,
        estimatedTimeToComplete: 80,
        skillsCount: 10,
        imageUrl: 'https://example.com/tennis.jpg',
        tags: ['individual', 'outdoor', 'racket'],
        prerequisites: [],
        isActive: true,
        isFeatured: false,
        order: 2,
        metadata: {
          totalEnrollments: 95,
          totalCompletions: 60,
          averageRating: 4.2,
          totalRatings: 85,
          averageCompletionTime: 70,
        },
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
        createdBy: 'admin',
      },
    ],
    total: 2,
    page: 1,
    limit: 50,
    hasMore: false,
    totalPages: 1,
  },
  timestamp: new Date(),
};

const mockEmptySportsData = {
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

describe('SportsPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    (sportsService.getAllSports as jest.Mock).mockResolvedValue(mockSportsData);
    (sportsService.searchSports as jest.Mock).mockResolvedValue(mockSportsData);
  });

  it('renders sports catalog with header and description', async () => {
    render(<SportsPage />);

    expect(screen.getByText('Sports Catalog')).toBeInTheDocument();
    expect(screen.getByText('Discover and master new sports skills with our comprehensive learning platform')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('2 sports available')).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    render(<SportsPage />);

    expect(screen.getByText('Loading sports catalog...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument(); // spinner
  });

  it('loads and displays sports data correctly', async () => {
    render(<SportsPage />);

    await waitFor(() => {
      expect(screen.getByText('Basketball')).toBeInTheDocument();
      expect(screen.getByText('Tennis')).toBeInTheDocument();
    });

    // Check sport details
    expect(screen.getByText('Learn basketball fundamentals and advanced techniques')).toBeInTheDocument();
    expect(screen.getByText('Master tennis techniques from basic to professional level')).toBeInTheDocument();

    // Check metadata
    expect(screen.getByText('2h')).toBeInTheDocument(); // Basketball duration
    expect(screen.getByText('15 skills')).toBeInTheDocument(); // Basketball skills
    expect(screen.getByText('4.5')).toBeInTheDocument(); // Basketball rating
  });

  it('displays featured badge for featured sports', async () => {
    render(<SportsPage />);

    await waitFor(() => {
      expect(screen.getByText('Featured')).toBeInTheDocument();
    });
  });

  it('shows difficulty levels with correct styling', async () => {
    render(<SportsPage />);

    await waitFor(() => {
      expect(screen.getByText('intermediate')).toBeInTheDocument();
      expect(screen.getByText('beginner')).toBeInTheDocument();
    });
  });

  it('handles search functionality', async () => {
    render(<SportsPage />);

    await waitFor(() => {
      expect(screen.getByText('Basketball')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search sports by name, description, or tags...');
    const searchButton = screen.getByRole('button', { name: /search/i });

    await user.type(searchInput, 'basketball');
    await user.click(searchButton);

    expect(sportsService.searchSports).toHaveBeenCalledWith('basketball', {});
  });

  it('handles filter functionality', async () => {
    render(<SportsPage />);

    await waitFor(() => {
      expect(screen.getByText('Basketball')).toBeInTheDocument();
    });

    // Open filters
    const filtersButton = screen.getByRole('button', { name: /filters/i });
    await user.click(filtersButton);

    expect(screen.getByText('Difficulty Level')).toBeInTheDocument();
    expect(screen.getByText('Duration (hours)')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();

    // Test difficulty filter
    const beginnerCheckbox = screen.getByRole('checkbox', { name: /beginner/i });
    await user.click(beginnerCheckbox);

    expect(sportsService.getAllSports).toHaveBeenCalledWith({
      limit: 50,
      difficulty: ['beginner'],
    });
  });

  it('handles duration filters', async () => {
    render(<SportsPage />);

    await waitFor(() => {
      expect(screen.getByText('Basketball')).toBeInTheDocument();
    });

    // Open filters
    const filtersButton = screen.getByRole('button', { name: /filters/i });
    await user.click(filtersButton);

    const minDurationInput = screen.getByPlaceholderText('Min');
    const maxDurationInput = screen.getByPlaceholderText('Max');

    await user.type(minDurationInput, '50');
    await user.type(maxDurationInput, '150');

    expect(sportsService.getAllSports).toHaveBeenCalledWith({
      limit: 50,
      duration: { min: 50, max: 150 },
    });
  });

  it('handles feature filters', async () => {
    render(<SportsPage />);

    await waitFor(() => {
      expect(screen.getByText('Basketball')).toBeInTheDocument();
    });

    // Open filters
    const filtersButton = screen.getByRole('button', { name: /filters/i });
    await user.click(filtersButton);

    const hasVideoCheckbox = screen.getByRole('checkbox', { name: /has video content/i });
    const hasQuizCheckbox = screen.getByRole('checkbox', { name: /has quizzes/i });

    await user.click(hasVideoCheckbox);
    await user.click(hasQuizCheckbox);

    expect(sportsService.getAllSports).toHaveBeenCalledWith({
      limit: 50,
      hasVideo: true,
      hasQuiz: true,
    });
  });

  it('clears all filters', async () => {
    render(<SportsPage />);

    await waitFor(() => {
      expect(screen.getByText('Basketball')).toBeInTheDocument();
    });

    // Add some filters first
    const searchInput = screen.getByPlaceholderText('Search sports by name, description, or tags...');
    await user.type(searchInput, 'test');

    const filtersButton = screen.getByRole('button', { name: /filters/i });
    await user.click(filtersButton);

    const beginnerCheckbox = screen.getByRole('checkbox', { name: /beginner/i });
    await user.click(beginnerCheckbox);

    // Now clear all
    const clearAllButton = screen.getByRole('button', { name: /clear all/i });
    await user.click(clearAllButton);

    expect(searchInput).toHaveValue('');
    expect(sportsService.getAllSports).toHaveBeenCalledWith({ limit: 50 });
  });

  it('displays empty state when no sports found', async () => {
    (sportsService.getAllSports as jest.Mock).mockResolvedValue(mockEmptySportsData);

    render(<SportsPage />);

    await waitFor(() => {
      expect(screen.getByText('No sports found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search terms or filters to find what you\'re looking for.')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    const errorResponse = {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Failed to load sports',
      },
      timestamp: new Date(),
    };

    (sportsService.getAllSports as jest.Mock).mockResolvedValue(errorResponse);

    render(<SportsPage />);

    await waitFor(() => {
      expect(screen.getByText('Error:')).toBeInTheDocument();
      expect(screen.getByText('Failed to load sports')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  it('handles network exceptions', async () => {
    (sportsService.getAllSports as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<SportsPage />);

    await waitFor(() => {
      expect(screen.getByText('Error:')).toBeInTheDocument();
      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
    });
  });

  it('creates correct navigation links for sports', async () => {
    render(<SportsPage />);

    await waitFor(() => {
      expect(screen.getByText('Basketball')).toBeInTheDocument();
    });

    const basketballLink = screen.getByText('Basketball').closest('a');
    const tennisLink = screen.getByText('Tennis').closest('a');

    expect(basketballLink).toHaveAttribute('href', '/sports/sport-1');
    expect(tennisLink).toHaveAttribute('href', '/sports/sport-2');
  });

  it('displays sport tags correctly', async () => {
    render(<SportsPage />);

    await waitFor(() => {
      expect(screen.getByText('team')).toBeInTheDocument();
      expect(screen.getByText('indoor')).toBeInTheDocument();
      expect(screen.getByText('ball-game')).toBeInTheDocument();
      expect(screen.getByText('individual')).toBeInTheDocument();
      expect(screen.getByText('outdoor')).toBeInTheDocument();
      expect(screen.getByText('racket')).toBeInTheDocument();
    });
  });

  it('formats duration correctly', async () => {
    render(<SportsPage />);

    await waitFor(() => {
      expect(screen.getByText('2h')).toBeInTheDocument(); // Basketball 120 minutes
      expect(screen.getByText('1h')).toBeInTheDocument(); // Tennis 80 minutes
    });
  });

  it('displays enrollment and rating information', async () => {
    render(<SportsPage />);

    await waitFor(() => {
      expect(screen.getByText('150 enrolled')).toBeInTheDocument();
      expect(screen.getByText('95 enrolled')).toBeInTheDocument();
      expect(screen.getByText('(120 reviews)')).toBeInTheDocument();
      expect(screen.getByText('(85 reviews)')).toBeInTheDocument();
    });
  });

  it('retries loading on try again button click', async () => {
    const errorResponse = {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Failed to load sports',
      },
      timestamp: new Date(),
    };

    (sportsService.getAllSports as jest.Mock)
      .mockResolvedValueOnce(errorResponse)
      .mockResolvedValueOnce(mockSportsData);

    render(<SportsPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load sports')).toBeInTheDocument();
    });

    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    await user.click(tryAgainButton);

    await waitFor(() => {
      expect(screen.getByText('Basketball')).toBeInTheDocument();
    });

    expect(sportsService.getAllSports).toHaveBeenCalledTimes(2);
  });
});