import { NextRequest, NextResponse } from 'next/server';
import { claudeAIService } from '@/lib/ai/claude.service';
import { logger } from '@/lib/utils/logger';

interface GenerateHTMLRequest {
  skillName: string;
  description: string;
  difficulty: string;
  objectives: string[];
  existingContent?: string;
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Add proper admin authentication when ready
    // For now, assuming this endpoint is only accessible to admin users

    const body: GenerateHTMLRequest = await request.json();

    // Validate required fields
    if (!body.skillName || !body.description || !body.difficulty) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: skillName, description, difficulty' },
        { status: 400 }
      );
    }

    if (!body.objectives || body.objectives.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one learning objective is required' },
        { status: 400 }
      );
    }

    // Generate HTML using Claude AI
    const result = await claudeAIService.generateSkillHTML({
      skillName: body.skillName,
      description: body.description,
      difficulty: body.difficulty,
      objectives: body.objectives,
      existingContent: body.existingContent
    });

    if (!result.success) {
      logger.error('Failed to generate HTML content', 'AI-GenerateHTML-API', {
        error: result.error,
        skillName: body.skillName
      });

      return NextResponse.json(
        { success: false, error: result.error || 'Failed to generate HTML content' },
        { status: 500 }
      );
    }

    logger.info('Successfully generated HTML content via API', 'AI-GenerateHTML-API', {
      skillName: body.skillName
    });

    return NextResponse.json({
      success: true,
      content: result.content
    });

  } catch (error) {
    logger.error('Error in generate-html API endpoint', 'AI-GenerateHTML-API', { error });

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}