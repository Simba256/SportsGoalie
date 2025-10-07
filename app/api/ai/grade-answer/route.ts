import { NextRequest, NextResponse } from 'next/server';
import { claudeAIService, GradeAnswerOptions } from '@/lib/ai/claude.service';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const body: GradeAnswerOptions = await request.json();

    // Validate required fields
    if (!body.questionText || !body.questionContent || !body.userAnswer) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: questionText, questionContent, userAnswer' },
        { status: 400 }
      );
    }

    if (typeof body.maxPoints !== 'number' || body.maxPoints <= 0) {
      return NextResponse.json(
        { success: false, error: 'maxPoints must be a positive number' },
        { status: 400 }
      );
    }

    // Grade the answer using Claude AI
    const result = await claudeAIService.gradeAnswer(body);

    if (!result.success) {
      logger.error('Failed to grade answer', 'AI-GradeAnswer-API', {
        error: result.error,
        questionText: body.questionText
      });

      return NextResponse.json(
        { success: false, error: result.error || 'Failed to grade answer' },
        { status: 500 }
      );
    }

    logger.info('Successfully graded answer via API', 'AI-GradeAnswer-API', {
      questionText: body.questionText,
      isCorrect: result.isCorrect,
      pointsEarned: result.pointsEarned
    });

    return NextResponse.json({
      success: true,
      isCorrect: result.isCorrect,
      pointsEarned: result.pointsEarned,
      maxPoints: result.maxPoints,
      feedback: result.feedback
    });

  } catch (error) {
    logger.error('Error in grade-answer API endpoint', 'AI-GradeAnswer-API', { error });

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
