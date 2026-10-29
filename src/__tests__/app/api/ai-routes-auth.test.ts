// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const verifyAdminRequest = vi.fn();
const verifyUserRequest = vi.fn();
const generateSkillHTML = vi.fn();
const gradeAnswer = vi.fn();

vi.mock('@/lib/auth/admin-request', () => ({
  verifyAdminRequest: (...args: unknown[]) => verifyAdminRequest(...args),
  verifyUserRequest: (...args: unknown[]) => verifyUserRequest(...args),
}));

vi.mock('@/lib/ai/claude.service', () => ({
  claudeAIService: {
    generateSkillHTML: (...args: unknown[]) => generateSkillHTML(...args),
    gradeAnswer: (...args: unknown[]) => gradeAnswer(...args),
  },
}));

vi.mock('@/lib/utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { POST as generateHtml } from '../../../../app/api/ai/generate-html/route';
import { POST as gradeAnswerRoute } from '../../../../app/api/ai/grade-answer/route';

function post(path: string, body: unknown): NextRequest {
  return new NextRequest(`http://localhost${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const htmlBody = {
  skillName: 'Angles',
  description: 'Playing the angle',
  difficulty: 'introduction',
  objectives: ['Square to the shooter'],
};

const gradeBody = {
  questionText: 'Where do you set up?',
  questionContent: 'Where do you set up?',
  userAnswer: 'On the angle',
  maxPoints: 2,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/ai/generate-html', () => {
  it('turns away a caller with no token before touching the AI service', async () => {
    verifyAdminRequest.mockResolvedValue({ ok: false, error: 'Unauthorized - No valid token provided', status: 401 });

    const res = await generateHtml(post('/api/ai/generate-html', htmlBody));

    expect(res.status).toBe(401);
    expect(generateSkillHTML).not.toHaveBeenCalled();
  });

  it('turns away a signed-in caller who is not an admin', async () => {
    verifyAdminRequest.mockResolvedValue({ ok: false, error: 'Forbidden - Admin access required', status: 403 });

    const res = await generateHtml(post('/api/ai/generate-html', htmlBody));

    expect(res.status).toBe(403);
    expect(generateSkillHTML).not.toHaveBeenCalled();
  });

  it('generates for an admin', async () => {
    verifyAdminRequest.mockResolvedValue({ ok: true, uid: 'admin-1' });
    generateSkillHTML.mockResolvedValue({ success: true, content: '<p>lesson</p>' });

    const res = await generateHtml(post('/api/ai/generate-html', htmlBody));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, content: '<p>lesson</p>' });
  });
});

describe('POST /api/ai/grade-answer', () => {
  it('turns away a caller with no token before touching the AI service', async () => {
    verifyUserRequest.mockResolvedValue({ ok: false, error: 'Unauthorized - No valid token provided', status: 401 });

    const res = await gradeAnswerRoute(post('/api/ai/grade-answer', gradeBody));

    expect(res.status).toBe(401);
    expect(gradeAnswer).not.toHaveBeenCalled();
  });

  it('grades for a signed-in member', async () => {
    verifyUserRequest.mockResolvedValue({ ok: true, uid: 'goalie-1' });
    gradeAnswer.mockResolvedValue({
      success: true,
      isCorrect: true,
      pointsEarned: 2,
      maxPoints: 2,
      feedback: 'Good',
    });

    const res = await gradeAnswerRoute(post('/api/ai/grade-answer', gradeBody));

    expect(res.status).toBe(200);
    expect((await res.json()).pointsEarned).toBe(2);
  });
});
