import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { firebaseService } from '@/lib/firebase/service';
import { videoReviewService } from '@/lib/database/services/video-review.service';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { message, userId } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get user context if userId is provided
    let userContext = '';
    if (userId) {
      try {
        userContext = await getUserContext(userId);
      } catch (error) {
        console.error('Error getting user context:', error);
        // Continue without context if there's an error
      }
    }

    // Create the system prompt with user context
    const systemPrompt = `You are SportsCoach AI, a helpful assistant for the SportsCoach platform - a comprehensive sports learning and coaching application. You help users with:

1. **Learning & Training**: Answer questions about sports techniques, training methods, and skill development
2. **Platform Navigation**: Help users find features, courses, quizzes, and progress tracking
3. **Progress Analysis**: Provide insights on user performance and improvement suggestions
4. **Course Recommendations**: Suggest relevant courses based on user goals and current progress
5. **General Sports Knowledge**: Share expertise on various sports, rules, strategies, and best practices

## Platform Features:
- **Sports Learning**: Structured courses for Basketball, Soccer, Tennis, Swimming, Baseball, Golf
- **Skill Tracking**: Individual skill progression and mastery
- **Interactive Quizzes**: Knowledge testing and assessment
- **Progress Analytics**: Detailed performance tracking and insights
- **Video Reviews**: Upload training videos for coach feedback and course recommendations
- **Achievement System**: Badges and milestones for motivation

## User Context:
${userContext}

**Guidelines:**
- Be encouraging and supportive in your responses
- Provide specific, actionable advice when possible
- Reference the user's current progress and enrolled sports when relevant
- Suggest relevant platform features that could help the user
- Keep responses concise but informative
- If you don't know something specific about the platform, be honest and suggest they check the relevant section

**Tone**: Friendly, knowledgeable, encouraging, and focused on helping users improve their sports skills and navigate the platform effectively.`;

    // Call Anthropic API
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    });

    // Extract the response content
    const aiResponse = response.content[0];
    if (aiResponse.type !== 'text') {
      throw new Error('Unexpected response type from Anthropic API');
    }

    return NextResponse.json({
      response: aiResponse.text,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Chatbot API error:', error);

    // Handle specific Anthropic API errors
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: 'AI service temporarily unavailable. Please try again.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred while processing your message.' },
      { status: 500 }
    );
  }
}

async function getUserContext(userId: string): Promise<string> {
  try {
    // Get user data
    const user = await firebaseService.getDocument('users', userId);
    if (!user) {
      return 'User not found in system.';
    }

    // Get user enrollments
    const enrollments = await firebaseService.getCollection('enrollments', [
      { field: 'userId', operator: '==', value: userId }
    ]);

    // Get user progress
    const userProgress = await firebaseService.getCollection('user_progress', [
      { field: 'userId', operator: '==', value: userId }
    ]);

    // Get sport progress
    const sportProgress = await firebaseService.getCollection('sport_progress', [
      { field: 'userId', operator: '==', value: userId }
    ]);

    // Get quiz attempts
    const quizAttempts = await firebaseService.getCollection('quiz_attempts', [
      { field: 'userId', operator: '==', value: userId }
    ]);

    // Get video submissions
    const videoResult = await videoReviewService.getStudentVideos(userId);
    const videos = videoResult.success ? videoResult.data || [] : [];

    // Get sports data for reference
    const sports = await firebaseService.getCollection('sports');
    const sportsMap = new Map(sports.map(sport => [sport.id, sport]));

    // Build context string
    let context = `**User Profile:**
- Name: ${user.displayName || 'Not specified'}
- Email: ${user.email}
- Role: ${user.role}
- Account created: ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
- Last login: ${user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Unknown'}

`;

    // Add enrollment information
    if (enrollments.length > 0) {
      context += `**Enrolled Sports (${enrollments.length}):**\n`;
      enrollments.forEach(enrollment => {
        const sport = sportsMap.get(enrollment.sportId);
        const sportName = sport ? sport.name : enrollment.sportId;
        context += `- ${sportName} (enrolled: ${new Date(enrollment.enrolledAt).toLocaleDateString()})\n`;
      });
      context += '\n';
    } else {
      context += '**Enrolled Sports:** None yet - new user who hasn\'t enrolled in any sports.\n\n';
    }

    // Add progress information
    if (userProgress.length > 0) {
      const progress = userProgress[0];
      context += `**Overall Progress:**
- Total quiz attempts: ${progress.overallStats?.quizzesCompleted || 0}
- Skills completed: ${progress.overallStats?.skillsCompleted || 0}
- Average quiz score: ${progress.overallStats?.averageQuizScore ? Math.round(progress.overallStats.averageQuizScore) + '%' : 'No quizzes taken'}
- Current learning streak: ${progress.overallStats?.currentStreak || 0} days
- Total time spent: ${progress.overallStats?.totalTimeSpent ? Math.round(progress.overallStats.totalTimeSpent / 60) + ' hours' : '0 hours'}
- Current level: ${progress.overallStats?.level || 1}
- Total XP: ${progress.overallStats?.totalPoints || 0}

`;
    } else {
      context += '**Overall Progress:** No progress data yet - new user just getting started.\n\n';
    }

    // Add sport-specific progress
    if (sportProgress.length > 0) {
      context += `**Sport-Specific Progress:**\n`;
      sportProgress.forEach(progress => {
        const sport = sportsMap.get(progress.sportId);
        const sportName = sport ? sport.name : progress.sportId;
        context += `- ${sportName}: ${Math.round(progress.progressPercentage || 0)}% complete, ${progress.completedSkills?.length || 0} skills mastered\n`;
      });
      context += '\n';
    }

    // Add recent quiz performance
    if (quizAttempts.length > 0) {
      const recentAttempts = quizAttempts
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
        .slice(0, 5);

      context += `**Recent Quiz Performance:**\n`;
      recentAttempts.forEach(attempt => {
        context += `- Score: ${Math.round(attempt.score)}% (${attempt.passed ? 'Passed' : 'Failed'}) on ${new Date(attempt.completedAt).toLocaleDateString()}\n`;
      });
      context += '\n';
    }

    // Add video submissions
    if (videos.length > 0) {
      context += `**Video Submissions:**\n`;
      videos.slice(0, 3).forEach(video => {
        const status = video.status === 'feedback_sent' ? 'Reviewed with feedback' :
                      video.status === 'reviewed' ? 'Under review' : 'Pending review';
        context += `- ${video.sport || 'Unknown sport'} video: "${video.description}" - ${status}\n`;
      });
      if (videos.length > 3) {
        context += `- ... and ${videos.length - 3} more video(s)\n`;
      }
      context += '\n';
    }

    // Add recommendations based on user state
    context += `**AI Assistant Notes:**\n`;
    if (enrollments.length === 0) {
      context += '- This user is new and should be encouraged to explore sports and enroll in their first sport\n';
    }
    if (quizAttempts.length === 0) {
      context += '- User hasn\'t taken any quizzes yet - could suggest trying some quizzes to test knowledge\n';
    }
    if (videos.length === 0) {
      context += '- User hasn\'t uploaded any training videos - could explain the video review feature\n';
    }
    if (userProgress.length === 0) {
      context += '- No progress data suggests this is a very new user who needs guidance getting started\n';
    }

    return context;

  } catch (error) {
    console.error('Error building user context:', error);
    return 'Unable to load user context due to a technical issue.';
  }
}