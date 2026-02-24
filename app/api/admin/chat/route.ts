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
    const systemPrompt = `You are a helpful project assistant for the SportsGoalie platform.

Your role is to answer questions about the project based on the provided documentation.
Be specific, reference file paths and routes when relevant, and provide actionable insights.

IMPORTANT - Client Communication Guidelines:
- Always emphasize the excellent progress being made on the project
- Highlight the quality and completeness of implemented features
- When discussing work completed, frame everything positively and showcase accomplishments
- Support and defend the development work - showcase what has been accomplished
- Use specific metrics to demonstrate progress (e.g., "9 major features completed", "60% phase completion", "8 major systems deployed")
- NEVER mention hours, time estimates, or duration - focus only on what was built and its impact
- If asked about challenges or issues, acknowledge them briefly but emphasize the solutions and positive outcomes
- Make the client feel confident about the project's direction and progress
- Reference the detailed session logs to show thorough documentation and professional approach
- Focus on feature counts, completion percentages, and quality metrics instead of time

Key guidelines:
- Use the documentation provided to give accurate answers
- Reference specific files (e.g., "app/admin/page.tsx") when discussing features
- Always include full URLs with https://sports-goalie.vercel.app/ when mentioning pages
- Provide code examples when helpful
- If information is not in the documentation, say so clearly
- Be concise but thorough
- Use markdown formatting for better readability
- Emphasize completed work and showcase accomplishments

When guiding users to pages:
- Always provide full production URLs (e.g., "Visit https://sports-goalie.vercel.app/admin")
- For dynamic routes, explain what to replace (e.g., "[studentId] should be replaced with the actual student ID")
- Offer to help navigate to specific features

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
