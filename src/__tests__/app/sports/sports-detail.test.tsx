import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SportDetailPage from '../../../../app/sports/[id]/page';
import { sportsService } from '../../lib/database/services/sports.service';

// Mock the sports service
jest.mock('../../lib/database/services/sports.service', () => ({
  sportsService: {
    getSport: jest.fn(),
    getSkillsBySport: jest.fn(),
  },
}));

// Mock Next.js router
const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useParams: () => ({ id: 'sport-1' }),
}));

// Mock Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

const mockSport = {
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
};

const mockSkills = [
  {
    id: 'skill-1',
    sportId: 'sport-1',
    name: 'Basic Dribbling',
    description: 'Learn fundamental dribbling techniques',
    difficulty: 'beginner' as const,
    estimatedTimeToComplete: 30,
    content: '<p>Basic dribbling content</p>',
    externalResources: [],
    media: undefined,
    prerequisites: [],
    learningObjectives: ['Master ball control', 'Develop hand-eye coordination'],
    tags: ['fundamentals', 'basics'],
    hasVideo: true,
    hasQuiz: true,
    isActive: true,
    order: 1,
    metadata: {
      totalCompletions: 45,
      averageCompletionTime: 25,
      averageRating: 4.3,
      totalRatings: 40,
      difficulty: 'beginner' as const,
    },
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
    createdBy: 'admin',
  },
  {
    id: 'skill-2',
    sportId: 'sport-1',
    name: 'Advanced Shooting',
    description: 'Master advanced shooting techniques',
    difficulty: 'advanced' as const,
    estimatedTimeToComplete: 60,
    content: '<p>Advanced shooting content</p>',
    externalResources: [],
    media: undefined,
    prerequisites: ['skill-1'],
    learningObjectives: ['Perfect shooting form', 'Increase accuracy', 'Learn different shot types'],
    tags: ['shooting', 'advanced'],
    hasVideo: true,
    hasQuiz: false,
    isActive: true,
    order: 2,
    metadata: {
      totalCompletions: 20,
      averageCompletionTime: 55,
      averageRating: 4.7,
      totalRatings: 18,
      difficulty: 'advanced' as const,
    },
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
    createdBy: 'admin',
  },
];

const mockSportResponse = {
  success: true,
  data: mockSport,
  timestamp: new Date(),
};

const mockSkillsResponse = {
  success: true,
  data: {
    items: mockSkills,
    total: 2,
    page: 1,
    limit: 50,
    hasMore: false,
    totalPages: 1,
  },
  timestamp: new Date(),
};

describe('SportDetailPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    (sportsService.getSport as jest.Mock).mockResolvedValue(mockSportResponse);
    (sportsService.getSkillsBySport as jest.Mock).mockResolvedValue(mockSkillsResponse);
  });

  it('renders loading state initially', () => {
    render(<SportDetailPage />);

    expect(screen.getByText('Loading sport details...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument(); // spinner
  });

  it('loads and displays sport information correctly', async () => {
    render(<SportDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Basketball')).toBeInTheDocument();
      expect(screen.getByText('Learn basketball fundamentals and advanced techniques')).toBeInTheDocument();
    });

    // Check featured badge
    expect(screen.getByText('Featured')).toBeInTheDocument();

    // Check sport stats
    expect(screen.getByText('intermediate')).toBeInTheDocument();
    expect(screen.getByText('120h')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument(); // skills count
    expect(screen.getByText('150')).toBeInTheDocument(); // enrollments
  });

  it('displays sport metadata correctly', async () => {
    render(<SportDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('4.5')).toBeInTheDocument(); // rating
      expect(screen.getByText('(120 reviews)')).toBeInTheDocument();
      expect(screen.getByText('75 completed')).toBeInTheDocument();
    });
  });

  it('displays sport tags', async () => {
    render(<SportDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('team')).toBeInTheDocument();
      expect(screen.getByText('indoor')).toBeInTheDocument();
      expect(screen.getByText('ball-game')).toBeInTheDocument();
    });
  });

  it('loads and displays skills correctly', async () => {
    render(<SportDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Skills (2)')).toBeInTheDocument();
      expect(screen.getByText('Basic Dribbling')).toBeInTheDocument();
      expect(screen.getByText('Advanced Shooting')).toBeInTheDocument();
    });

    // Check skill details
    expect(screen.getByText('Learn fundamental dribbling techniques')).toBeInTheDocument();
    expect(screen.getByText('Master advanced shooting techniques')).toBeInTheDocument();
  });

  it('displays skill metadata correctly', async () => {
    render(<SportDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('30min')).toBeInTheDocument(); // Basic Dribbling duration
      expect(screen.getByText('1h')).toBeInTheDocument(); // Advanced Shooting duration
    });

    // Check video and quiz indicators
    const videoIcons = screen.getAllByText('Video');
    expect(videoIcons).toHaveLength(2); // Both skills have video

    const quizIcons = screen.getAllByText('Quiz');
    expect(quizIcons).toHaveLength(1); // Only one skill has quiz
  });

  it('displays learning objectives', async () => {
    render(<SportDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Master ball control')).toBeInTheDocument();
      expect(screen.getByText('Develop hand-eye coordination')).toBeInTheDocument();
      expect(screen.getByText('Perfect shooting form')).toBeInTheDocument();
    });
  });

  it('shows prerequisites information', async () => {
    render(<SportDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Prerequisites: 1 skill')).toBeInTheDocument();
    });
  });

  it('filters skills by difficulty', async () => {
    render(<SportDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Basic Dribbling')).toBeInTheDocument();
      expect(screen.getByText('Advanced Shooting')).toBeInTheDocument();
    });

    // Test difficulty filter
    const difficultySelect = screen.getByDisplayValue('All Levels');
    await user.selectOptions(difficultySelect, 'beginner');

    // Should show only beginner skills
    expect(screen.getByText('Basic Dribbling')).toBeInTheDocument();
    expect(screen.queryByText('Advanced Shooting')).not.toBeInTheDocument();
  });

  it('creates correct navigation links for skills', async () => {
    render(<SportDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Basic Dribbling')).toBeInTheDocument();
    });

    const basicDribblingLink = screen.getByText('Basic Dribbling').closest('a');
    const advancedShootingLink = screen.getByText('Advanced Shooting').closest('a');

    expect(basicDribblingLink).toHaveAttribute('href', '/sports/sport-1/skills/skill-1');
    expect(advancedShootingLink).toHaveAttribute('href', '/sports/sport-1/skills/skill-2');
  });

  it('handles back navigation', async () => {
    render(<SportDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Basketball')).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /back to sports/i });
    await user.click(backButton);

    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('handles sport not found error', async () => {
    const errorResponse = {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Sport not found',
      },
      timestamp: new Date(),
    };

    (sportsService.getSport as jest.Mock).mockResolvedValue(errorResponse);

    render(<SportDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Sport not found')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  it('handles skills loading error', async () => {
    const skillsErrorResponse = {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Failed to load skills',
      },
      timestamp: new Date(),
    };

    (sportsService.getSkillsBySport as jest.Mock).mockResolvedValue(skillsErrorResponse);

    render(<SportDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Basketball')).toBeInTheDocument(); // Sport loads fine
      expect(screen.getByText('Failed to load skills')).toBeInTheDocument();
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

    (sportsService.getSkillsBySport as jest.Mock).mockResolvedValue(emptySkillsResponse);

    render(<SportDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('No skills found')).toBeInTheDocument();
      expect(screen.getByText('This sport doesn\'t have any skills yet.')).toBeInTheDocument();
    });
  });

  it('displays call-to-action section', async () => {
    render(<SportDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Ready to start learning Basketball?')).toBeInTheDocument();
      expect(screen.getByText('Begin your journey with 15 comprehensive skills designed to take you from beginner to advanced level.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /start learning/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save to favorites/i })).toBeInTheDocument();
    });
  });

  it('handles network exceptions gracefully', async () => {
    (sportsService.getSport as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<SportDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
    });
  });

  it('displays difficulty filter counts correctly', async () => {
    render(<SportDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Beginner (1)')).toBeInTheDocument();
      expect(screen.getByText('Intermediate (0)')).toBeInTheDocument();
      expect(screen.getByText('Advanced (1)')).toBeInTheDocument();
    });
  });

  it('displays sport without image correctly', async () => {
    const sportWithoutImage = {
      ...mockSport,
      imageUrl: undefined,
    };

    (sportsService.getSport as jest.Mock).mockResolvedValue({
      success: true,
      data: sportWithoutImage,
      timestamp: new Date(),
    });

    render(<SportDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('🏀')).toBeInTheDocument(); // Icon should be displayed
      expect(screen.getByText('Basketball')).toBeInTheDocument();
    });

    // Should not have image element
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});