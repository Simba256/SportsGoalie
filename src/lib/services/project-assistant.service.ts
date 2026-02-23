import fs from 'fs/promises';
import path from 'path';

/**
 * Project Assistant Service
 *
 * Loads and manages project documentation for the AI chatbot.
 * Provides context-aware document loading and formatting for Claude API.
 */

export interface DocumentMetadata {
  path: string;
  category: 'overview' | 'features' | 'pages' | 'progress' | 'technical' | 'decisions';
  title: string;
  keywords: string[];
  priority: number; // 1 (highest) to 5 (lowest)
  lastModified?: Date;
}

export interface DocumentContent {
  metadata: DocumentMetadata;
  content: string;
}

export class ProjectAssistantService {
  private static instance: ProjectAssistantService;
  private docsPath: string;
  private cache: Map<string, DocumentContent> = new Map();
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes
  private lastCacheUpdate: number = 0;

  private constructor() {
    this.docsPath = path.join(process.cwd(), 'docs', 'client');
  }

  public static getInstance(): ProjectAssistantService {
    if (!ProjectAssistantService.instance) {
      ProjectAssistantService.instance = new ProjectAssistantService();
    }
    return ProjectAssistantService.instance;
  }

  /**
   * Get all available document metadata
   */
  async getDocumentList(): Promise<DocumentMetadata[]> {
    const documents: DocumentMetadata[] = [];
    const categories: Array<DocumentMetadata['category']> = [
      'overview',
      'features',
      'pages',
      'progress',
      'technical',
      'decisions'
    ];

    for (const category of categories) {
      const categoryPath = path.join(this.docsPath, category);

      try {
        const files = await fs.readdir(categoryPath);
        const mdFiles = files.filter(file => file.endsWith('.md'));

        for (const file of mdFiles) {
          const filePath = path.join(categoryPath, file);
          const stats = await fs.stat(filePath);

          documents.push({
            path: filePath,
            category,
            title: this.formatTitle(file),
            keywords: this.extractKeywords(category, file),
            priority: this.assignPriority(category, file),
            lastModified: stats.mtime
          });
        }
      } catch (error) {
        console.warn(`Could not read category ${category}:`, error);
      }
    }

    return documents.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Load all client documentation
   */
  async loadAllDocuments(): Promise<DocumentContent[]> {
    const metadata = await this.getDocumentList();
    const documents: DocumentContent[] = [];

    for (const meta of metadata) {
      try {
        const content = await fs.readFile(meta.path, 'utf-8');
        documents.push({
          metadata: meta,
          content
        });
      } catch (error) {
        console.error(`Failed to load ${meta.path}:`, error);
      }
    }

    return documents;
  }

  /**
   * Load documents by category
   */
  async loadDocumentsByCategory(
    category: DocumentMetadata['category']
  ): Promise<DocumentContent[]> {
    const allDocs = await this.loadAllDocuments();
    return allDocs.filter(doc => doc.metadata.category === category);
  }

  /**
   * Load documents relevant to a question using keyword matching
   */
  async loadRelevantDocuments(question: string): Promise<DocumentContent[]> {
    const allDocs = await this.loadAllDocuments();
    const questionLower = question.toLowerCase();

    // Extract potential keywords from question
    const questionWords = questionLower
      .split(/\s+/)
      .filter(word => word.length > 3); // Filter short words

    // Score documents by keyword relevance
    const scoredDocs = allDocs.map(doc => {
      let score = 0;

      // Check if keywords from document appear in question
      for (const keyword of doc.metadata.keywords) {
        if (questionLower.includes(keyword.toLowerCase())) {
          score += 10;
        }
      }

      // Check if question words appear in document content
      for (const word of questionWords) {
        if (doc.content.toLowerCase().includes(word)) {
          score += 1;
        }
      }

      // Boost by priority (lower priority number = higher importance)
      score += (6 - doc.metadata.priority) * 2;

      return { doc, score };
    });

    // Sort by score and return top results
    const topDocs = scoredDocs
      .filter(item => item.score > 5) // Minimum relevance threshold
      .sort((a, b) => b.score - a.score)
      .slice(0, 10) // Top 10 most relevant
      .map(item => item.doc);

    // If no relevant docs found, return high-priority docs
    if (topDocs.length === 0) {
      return allDocs.filter(doc => doc.metadata.priority <= 2).slice(0, 5);
    }

    return topDocs;
  }

  /**
   * Format documents into context string for AI
   */
  formatContextForAI(documents: DocumentContent[]): string {
    let context = '# SportsGoalie Project Documentation\n\n';
    context += 'The following documentation provides comprehensive information about the SportsGoalie project.\n\n';
    context += '---\n\n';

    // Group by category
    const byCategory = documents.reduce((acc, doc) => {
      if (!acc[doc.metadata.category]) {
        acc[doc.metadata.category] = [];
      }
      acc[doc.metadata.category].push(doc);
      return acc;
    }, {} as Record<string, DocumentContent[]>);

    // Format each category
    for (const [category, docs] of Object.entries(byCategory)) {
      context += `## ${this.formatCategoryName(category)}\n\n`;

      for (const doc of docs) {
        context += `### ${doc.metadata.title}\n\n`;
        context += `${doc.content}\n\n`;
        context += '---\n\n';
      }
    }

    context += '\n\nUse this documentation to answer questions about the SportsGoalie project.';
    context += '\nProvide specific details, reference file paths when relevant, and be helpful.';

    return context;
  }

  /**
   * Get full project context for AI (all documents)
   */
  async getFullProjectContext(): Promise<string> {
    const documents = await this.loadAllDocuments();
    return this.formatContextForAI(documents);
  }

  /**
   * Get smart context for AI based on question
   */
  async getSmartContext(question: string): Promise<string> {
    const documents = await this.loadRelevantDocuments(question);
    return this.formatContextForAI(documents);
  }

  /**
   * Get context for specific topic
   */
  async getTopicContext(topic: string): Promise<string> {
    const categoryMap: Record<string, DocumentMetadata['category']> = {
      'authentication': 'features',
      'auth': 'features',
      'coach': 'features',
      'curriculum': 'features',
      'routes': 'pages',
      'pages': 'pages',
      'progress': 'progress',
      'status': 'progress',
      'technical': 'technical',
      'decisions': 'decisions',
      'overview': 'overview',
    };

    const category = categoryMap[topic.toLowerCase()];
    if (category) {
      const documents = await this.loadDocumentsByCategory(category);
      return this.formatContextForAI(documents);
    }

    // Fall back to smart context
    return this.getSmartContext(topic);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.lastCacheUpdate = 0;
  }

  /**
   * Get context statistics
   */
  async getStats(): Promise<{
    totalDocuments: number;
    byCategory: Record<string, number>;
    totalSize: number;
  }> {
    const documents = await this.loadAllDocuments();
    const stats = {
      totalDocuments: documents.length,
      byCategory: {} as Record<string, number>,
      totalSize: 0
    };

    for (const doc of documents) {
      stats.byCategory[doc.metadata.category] =
        (stats.byCategory[doc.metadata.category] || 0) + 1;
      stats.totalSize += doc.content.length;
    }

    return stats;
  }

  // Private helper methods

  private formatTitle(filename: string): string {
    return filename
      .replace('.md', '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private formatCategoryName(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  private extractKeywords(
    category: string,
    filename: string
  ): string[] {
    const keywords: string[] = [category];

    // Extract from filename
    const fileWords = filename
      .replace('.md', '')
      .split('-')
      .filter(word => word.length > 2);
    keywords.push(...fileWords);

    // Add category-specific keywords
    const categoryKeywords: Record<string, string[]> = {
      overview: ['status', 'summary', 'project', 'tech stack'],
      features: ['authentication', 'coach', 'curriculum', 'quiz', 'charting'],
      pages: ['routes', 'pages', 'navigation', 'admin', 'student', 'coach'],
      progress: ['phase', 'milestone', 'development', 'time', 'completed'],
      technical: ['database', 'service', 'security', 'api', 'architecture'],
      decisions: ['decision', 'architecture', 'choice', 'rationale']
    };

    if (categoryKeywords[category]) {
      keywords.push(...categoryKeywords[category]);
    }

    return [...new Set(keywords)]; // Remove duplicates
  }

  private assignPriority(
    category: string,
    filename: string
  ): number {
    // Priority 1 (highest) - most commonly needed
    if (filename.includes('summary') || filename.includes('current-status')) {
      return 1;
    }

    // Priority 2 - core features and routes
    if (category === 'features' || category === 'pages') {
      return 2;
    }

    // Priority 3 - progress and technical
    if (category === 'progress' || category === 'technical') {
      return 3;
    }

    // Priority 4 - decisions and overview
    if (category === 'decisions' || category === 'overview') {
      return 4;
    }

    // Default priority
    return 5;
  }
}

// Export singleton instance
export const projectAssistantService = ProjectAssistantService.getInstance();
