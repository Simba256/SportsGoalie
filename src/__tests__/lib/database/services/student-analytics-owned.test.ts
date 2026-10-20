import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StudentAnalyticsService } from '@/lib/database/services/student-analytics.service';

vi.mock('@/lib/database/base.service', () => ({
  BaseDatabaseService: class {
    query = vi.fn();
  },
}));

vi.mock('@/lib/utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn(), database: vi.fn() },
}));

vi.mock('@/lib/database/services/sports.service', () => ({
  sportsService: {
    getSport: vi.fn(),
    getSkill: vi.fn(),
    getSkillsBySport: vi.fn(),
  },
}));

vi.mock('@/lib/database/services/video-quiz.service', () => ({
  videoQuizService: { getVideoQuiz: vi.fn() },
}));

import { sportsService } from '@/lib/database/services/sports.service';
import { videoQuizService } from '@/lib/database/services/video-quiz.service';

const day = (d: number) => ({ toDate: () => new Date(Date.UTC(2026, 9, d, 12, 0, 0)) });

// A finished take as the player writes it: `completedAt` set, `submittedAt` never.
function take(
  id: string,
  skillId: string,
  completedAt: number,
  answers: Array<[string, boolean]>,
  percentage: number,
) {
  return {
    id,
    userId: 'u1',
    sportId: 'sport-1',
    skillId,
    videoQuizId: `quiz-${skillId}`,
    status: 'submitted',
    isCompleted: true,
    percentage,
    completedAt: day(completedAt),
    questionsAnswered: answers.map(([questionId, isCorrect]) => ({ questionId, isCorrect })),
  };
}

describe('StudentAnalyticsService on the owned rule', () => {
  let service: StudentAnalyticsService;
  let query: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new StudentAnalyticsService();
    query = service.query as unknown as ReturnType<typeof vi.fn>;
  });

  function givenTakes(items: unknown[]) {
    query.mockResolvedValue({ success: true, data: { items } });
  }

  it('reports a finished skill at 0% as open, not completed', async () => {
    givenTakes([take('a1', 'skill-1', 3, [['q1', false], ['q2', false]], 0)]);
    vi.mocked(sportsService.getSport).mockResolvedValue({
      success: true,
      data: { id: 'sport-1', name: 'Pillar', description: '' },
    } as never);
    vi.mocked(sportsService.getSkillsBySport).mockResolvedValue({
      success: true,
      data: { items: [{ id: 'skill-1', name: 'Angles', difficulty: 'introduction' }] },
    } as never);

    const result = await service.getCourseProgressDetails('u1');
    const course = result.data?.[0];
    const skill = course?.skills[0];

    expect(skill?.status).toBe('in_progress');
    expect(skill?.quizStatus).toBe('open');
    expect(skill?.completedAt).toBeNull();
    expect(course?.completedSkills).toBe(0);
    expect(course?.progressPercentage).toBe(0);
  });

  it('completes the skill, dated by the take that finished it, once every question is right', async () => {
    givenTakes([
      take('a1', 'skill-1', 3, [['q1', true], ['q2', false]], 50),
      take('a2', 'skill-1', 5, [['q1', false], ['q2', true]], 50),
    ]);
    vi.mocked(sportsService.getSport).mockResolvedValue({
      success: true,
      data: { id: 'sport-1', name: 'Pillar', description: '' },
    } as never);
    vi.mocked(sportsService.getSkillsBySport).mockResolvedValue({
      success: true,
      data: { items: [{ id: 'skill-1', name: 'Angles', difficulty: 'introduction' }] },
    } as never);

    const result = await service.getCourseProgressDetails('u1');
    const course = result.data?.[0];
    const skill = course?.skills[0];

    expect(skill?.quizStatus).toBe('owned');
    expect(skill?.status).toBe('completed');
    expect(skill?.completedAt?.toISOString()).toBe(new Date(Date.UTC(2026, 9, 5, 12)).toISOString());
    // `completedAt` is what a finished take sets, so last activity is no longer blank.
    expect(course?.lastActivityDate?.toISOString()).toBe(new Date(Date.UTC(2026, 9, 5, 12)).toISOString());
    expect(course?.status).toBe('completed');
  });

  it('counts owned skills, not attempted ones, in the student overview', async () => {
    givenTakes([
      take('a1', 'skill-1', 3, [['q1', true]], 100),
      take('a2', 'skill-2', 4, [['q1', false]], 0),
    ]);

    vi.mocked(videoQuizService.getVideoQuiz).mockResolvedValue({ success: true, data: null } as never);

    const result = await service.getStudentAnalytics('u1');

    expect(result.success).toBe(true);
    expect(result.data?.overview.totalSkillsStarted).toBe(2);
    expect(result.data?.progress.skillsCompleted).toBe(1);
    expect(result.data?.progress.skillsInProgress).toBe(1);
    expect(result.data?.progress.completionRate).toBe(50);
  });
});
