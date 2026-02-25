import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { projectAssistantService } from '@/lib/services/project-assistant.service';
import { adminAuth } from '@/lib/firebase/admin';

/**
 * POST /api/admin/chat
 *
 * Chat endpoint for Project Assistant AI
 * Only accessible to admin users
 */

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  useFullContext?: boolean;
  topic?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Admin chat API called');

    // 1. Authenticate user
    const authHeader = request.headers.get('authorization');
    console.log('🔑 Auth header present:', !!authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    console.log('🎫 Token extracted, length:', token?.length || 0);

    // Verify Firebase token
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json(
        {
          error: 'Unauthorized - Invalid token',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 401 }
      );
    }

    // 2. Check if user is admin
    const { adminDb } = await import('@/lib/firebase/admin');
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();

    if (!userData || userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // 3. Parse request body
    const body: ChatRequest = await request.json();
    const { messages, useFullContext = false, topic } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request - messages array required' },
        { status: 400 }
      );
    }

    // 4. Load project context
    let projectContext: string;

    if (topic) {
      // Load topic-specific context
      projectContext = await projectAssistantService.getTopicContext(topic);
    } else if (useFullContext) {
      // Load all documentation
      projectContext = await projectAssistantService.getFullProjectContext();
    } else {
      // Smart context based on last user message
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        projectContext = await projectAssistantService.getSmartContext(lastMessage.content);
      } else {
        projectContext = await projectAssistantService.getFullProjectContext();
      }
    }

    // 5. Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // 6. Prepare system prompt
    const systemPrompt = `You are a friendly project assistant for the SportsGoalie platform.

Your role is to help the admin understand what they can do with the platform and how it's progressing.

COMMUNICATION STYLE - VERY IMPORTANT:
- Keep answers SHORT and to the point (2-4 sentences usually)
- Use simple, non-technical language - NO coding terms, file paths, or technical jargon
- Focus on WHAT the user can DO, not how things work technically
- Frame everything as actions: "You can...", "To do this, go to...", "This lets you..."
- Be conversational and friendly, like talking to a business owner

WHEN ANSWERING QUESTIONS:
- For "What can I do?" questions: List actions briefly (e.g., "You can manage coaches, review student progress, create quizzes")
- For "Where do I find?" questions: Give the page name and URL directly
- For progress questions: Share completion percentage and key features, always positive
- NEVER mention: code, files, APIs, databases, technologies, frameworks, TypeScript, React, Firebase, etc.
- NEVER give long technical explanations

PROGRESS & CONFIDENCE:
- The project is going great - 60% of Phase 2 complete
- 10 major features built across multiple sessions
- Always be positive about progress and quality
- If asked about issues, briefly acknowledge and focus on solutions

GUIDING TO PAGES - Always include full URLs:
- Admin Dashboard: https://sports-goalie.vercel.app/admin
- Manage Coaches: https://sports-goalie.vercel.app/admin/coaches
- Manage Users: https://sports-goalie.vercel.app/admin/users
- Manage Sports & Skills: https://sports-goalie.vercel.app/admin/sports
- Video Quizzes: https://sports-goalie.vercel.app/admin/quizzes
- Analytics: https://sports-goalie.vercel.app/admin/analytics
- Coach Dashboard: https://sports-goalie.vercel.app/coach
- Student Dashboard: https://sports-goalie.vercel.app/dashboard

EXAMPLE GOOD ANSWERS:
- "You can invite new coaches by going to the Coaches page (https://sports-goalie.vercel.app/admin/coaches). Just click 'Invite Coach' and enter their email."
- "The project is at 60% completion for Phase 2. We've built coach invitations, student management, custom curriculums, and this AI assistant you're using now!"
- "To see student progress, visit the Users page at https://sports-goalie.vercel.app/admin/users and click on any student."

Project Documentation:
${projectContext}
`;

    // 7. Call Anthropic API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514', // Use Sonnet 4 for better cost/performance
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    });

    // 8. Extract response text
    const assistantMessage = response.content[0];
    if (assistantMessage.type !== 'text') {
      throw new Error('Unexpected response type from Anthropic');
    }

    // 9. Return response
    return NextResponse.json({
      success: true,
      response: assistantMessage.text,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
      contextStats: {
        documentsLoaded: projectContext.split('###').length - 1,
        contextSize: projectContext.length,
      }
    });

  } catch (error) {
    console.error('Chat API error:', error);

    // Handle specific error types
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        {
          error: 'AI service error',
          message: error.message,
        },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/chat
 *
 * Get chat context statistics
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user (same as POST)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    // 2. Check admin role
    const { adminDb } = await import('@/lib/firebase/admin');
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();

    if (!userData || userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // 3. Get statistics
    const stats = await projectAssistantService.getStats();

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Chat stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
