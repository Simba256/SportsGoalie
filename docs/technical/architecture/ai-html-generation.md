# AI-Powered HTML Generation for Skills

This document describes the AI-powered HTML generation feature implemented for the SportsCoach admin portal.

## Overview

The feature allows administrators to generate professional HTML content for skill pages using Claude Sonnet AI. Admins can either:
1. Generate new content from scratch based on skill details
2. Enhance existing content with AI improvements

## Components

### 1. Claude AI Service (`/src/lib/ai/claude.service.ts`)

**Purpose**: Handles communication with the Anthropic Claude API.

**Key Features**:
- Integrates with Claude 3 Sonnet model
- Builds intelligent prompts based on skill information
- Generates semantic HTML with Tailwind CSS classes
- Comprehensive error handling and logging

**API Configuration**:
- Uses `ANTHROPIC_API_KEY` environment variable
- Model: `claude-3-sonnet-20240229`
- Max tokens: 4000
- Temperature: 0.7 for creative but consistent output

### 2. API Endpoint (`/app/api/ai/generate-html/route.ts`)

**Purpose**: Server-side API endpoint for HTML generation.

**Features**:
- POST endpoint at `/api/ai/generate-html`
- Validates required fields (skillName, description, difficulty, objectives)
- Secure server-side API calls to Claude
- Comprehensive error handling and logging

**Request Format**:
```json
{
  "skillName": "Basketball Dribbling",
  "description": "Learn fundamental dribbling techniques",
  "difficulty": "beginner",
  "objectives": ["Master basic control", "Practice coordination"],
  "existingContent": "optional existing HTML to enhance"
}
```

**Response Format**:
```json
{
  "success": true,
  "content": "<section>...</section>"
}
```

### 3. HTML Editor Component (`/src/components/ui/html-editor-with-ai.tsx`)

**Purpose**: Enhanced HTML editor with AI generation capabilities.

**Features**:
- **Dual Mode**: Edit mode and preview mode
- **AI Panel**: Expandable panel with generation options
- **Smart Validation**: Checks required fields before AI generation
- **Real-time Preview**: Live HTML preview with proper styling
- **Progress Indicators**: Loading states and character counts
- **Error Handling**: User-friendly error messages

**AI Generation Options**:
1. **Generate Content**: Create new HTML from scratch
2. **Enhance Existing**: Improve and expand existing content

**Requirements Check**:
- ✓ Skill Name (required)
- ✓ Description (required)
- ✓ Learning Objectives (at least one required)
- ○ Difficulty Level (automatically included)

### 4. Integration with Skills Admin (`/app/admin/sports/[id]/skills/page.tsx`)

**Changes Made**:
- Replaced basic textarea with `HTMLEditorWithAI` component
- Passes skill form data to AI component for context
- Maintains existing form validation and save functionality

## Generated HTML Structure

The AI generates professional HTML content with:

### Semantic Structure
- `<section>` and `<article>` elements
- Proper heading hierarchy (`<h2>`, `<h3>`, etc.)
- Semantic lists and content blocks

### Content Sections
1. **Introduction/Overview**
2. **Key Concepts**
3. **Step-by-step Instructions**
4. **Common Mistakes to Avoid**
5. **Practice Exercises/Drills**
6. **Tips for Improvement**
7. **Summary/Key Takeaways**

### Styling Classes (Tailwind CSS)
- `text-lg font-semibold mb-4` for section headers
- `mb-4` for paragraph spacing
- `list-disc list-inside mb-4` for unordered lists
- `bg-blue-50 p-4 rounded-lg mb-4` for tip boxes
- `bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4` for warnings

## Environment Configuration

### Required Environment Variable
```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

**Note**: The API key should be kept secure and never committed to version control.

## Usage Instructions

### For Administrators

1. **Navigate to Skills Management**:
   - Go to Admin Portal → Sports → [Select Sport] → Skills
   - Click "Add Skill" or edit existing skill

2. **Fill Required Information**:
   - Enter skill name
   - Add description
   - Add learning objectives (one per line)
   - Select difficulty level

3. **Generate AI Content**:
   - Click "AI Assistant" button
   - Verify all requirements are met (green checkmarks)
   - Click "Generate Content" for new content
   - Click "Enhance Existing" to improve current content

4. **Review and Edit**:
   - Use "Preview" mode to see rendered HTML
   - Switch to "Edit" mode to make manual adjustments
   - Save the skill when satisfied

### AI Content Features

- **Contextual**: Content adapts to skill name, difficulty, and objectives
- **Professional**: Uses instructional design best practices
- **Interactive**: Includes exercises, tips, and structured learning
- **Responsive**: Generated with mobile-friendly Tailwind classes
- **Accessible**: Semantic HTML for screen readers

## Error Handling

### Common Errors and Solutions

1. **"Missing required fields"**:
   - Ensure skill name, description, and objectives are filled

2. **"Claude AI API key not configured"**:
   - Check `ANTHROPIC_API_KEY` in environment variables

3. **"API request failed"**:
   - Check internet connection and API key validity
   - Review API quotas and limits

4. **"Invalid response format"**:
   - Usually temporary, try regenerating
   - Check Claude API status

## Logging and Monitoring

- All API calls are logged with skill context
- Errors include detailed information for debugging
- Success metrics tracked for monitoring usage

## Security Considerations

- API key stored securely in environment variables
- Server-side API calls (client never sees API key)
- Input validation on all user-provided data
- No sensitive information in generated content

## Future Enhancements

Potential improvements:
- User preference learning (writing style)
- Multiple content templates
- Batch generation for multiple skills
- Integration with other AI models
- Content versioning and history

## Support

For issues or questions:
1. Check environment configuration
2. Review browser console for client-side errors
3. Check server logs for API-related issues
4. Verify Claude API status and quotas