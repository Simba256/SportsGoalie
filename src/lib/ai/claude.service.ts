import { logger } from '@/lib/utils/logger';

export interface ClaudeAIResponse {
  success: boolean;
  content?: string;
  error?: string;
}

export interface GenerateHTMLOptions {
  skillName: string;
  description: string;
  difficulty: string;
  objectives: string[];
  existingContent?: string;
}

class ClaudeAIService {
  private apiKey: string;
  private baseUrl = 'https://api.anthropic.com/v1/messages';

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || '';
    if (!this.apiKey) {
      logger.warn('ANTHROPIC_API_KEY not found in environment variables', 'ClaudeAIService');
    }
  }

  async generateSkillHTML(options: GenerateHTMLOptions): Promise<ClaudeAIResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'Claude AI API key not configured'
      };
    }

    try {
      const prompt = this.buildPrompt(options);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error('Claude API request failed', 'ClaudeAIService', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });

        return {
          success: false,
          error: `API request failed: ${response.status} ${response.statusText}`
        };
      }

      const data = await response.json();

      if (!data.content || !data.content[0] || !data.content[0].text) {
        logger.error('Invalid response format from Claude API', 'ClaudeAIService', { data });
        return {
          success: false,
          error: 'Invalid response format from Claude API'
        };
      }

      let generatedHTML = data.content[0].text.trim();

      // Remove markdown code blocks if present
      if (generatedHTML.startsWith('```html')) {
        generatedHTML = generatedHTML.replace(/^```html\n/, '').replace(/\n```$/, '');
      } else if (generatedHTML.startsWith('```')) {
        generatedHTML = generatedHTML.replace(/^```[a-z]*\n/, '').replace(/\n```$/, '');
      }

      logger.info('Successfully generated HTML content', 'ClaudeAIService', {
        skillName: options.skillName,
        contentLength: generatedHTML.length
      });

      return {
        success: true,
        content: generatedHTML
      };

    } catch (error) {
      logger.error('Error generating HTML with Claude AI', 'ClaudeAIService', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private buildPrompt(options: GenerateHTMLOptions): string {
    const { skillName, description, difficulty, objectives, existingContent } = options;

    let prompt = `You are an expert instructional designer creating HTML content for a sports coaching platform.

Generate comprehensive, well-structured HTML content for a skill lesson with the following details:

**Skill Name:** ${skillName}
**Description:** ${description}
**Difficulty Level:** ${difficulty}
**Learning Objectives:**
${objectives.map(obj => `- ${obj}`).join('\n')}`;

    if (existingContent && existingContent.trim()) {
      prompt += `\n\n**Existing Content to Enhance:**
${existingContent}

Please enhance and expand the existing content while maintaining its core structure.`;
    }

    prompt += `

**Requirements:**
1. Create engaging, educational HTML content suitable for sports skill learning
2. Use proper semantic HTML5 elements (section, article, header, etc.)
3. Include these sections:
   - Introduction/Overview
   - Key Concepts
   - Step-by-step instructions or techniques
   - Common mistakes to avoid
   - Practice exercises or drills
   - Tips for improvement
   - Summary/Key takeaways

4. Use appropriate HTML classes for styling (assume Tailwind CSS is available):
   - Use "text-lg font-semibold mb-4" for section headers
   - Use "mb-4" for paragraph spacing
   - Use "list-disc list-inside mb-4" for unordered lists
   - Use "bg-blue-50 p-4 rounded-lg mb-4" for tip boxes
   - Use "bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4" for warning/mistake boxes

5. Make content interactive and engaging with:
   - Clear headings and subheadings
   - Bullet points for easy scanning
   - Highlighted tips and warnings
   - Structured practice exercises

6. Ensure content is appropriate for the ${difficulty} skill level
7. Keep HTML clean and semantic (no inline styles)
8. Return ONLY the HTML content, no markdown code blocks or explanations

Generate the HTML content now:`;

    return prompt;
  }
}

export const claudeAIService = new ClaudeAIService();