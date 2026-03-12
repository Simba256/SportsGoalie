import { BaseDatabaseService } from '../base.service';
import {
  ParentLink,
  ParentRelationship,
  LinkedChildSummary,
  LinkedParentSummary,
  User,
  ApiResponse,
} from '@/types';
import { Timestamp } from 'firebase/firestore';
import { logger } from '../../utils/logger';

/**
 * Generate a random parent link code in XXXX-XXXX format
 * Uses uppercase alphanumeric characters (excluding confusing chars like 0/O, 1/I/L)
 */
function generateParentLinkCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // Excluded: 0, O, 1, I, L
  let code = '';
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Normalize a parent link code for comparison
 * - Uppercase
 * - Remove spaces
 * - Add hyphen if missing
 */
function normalizeParentLinkCode(code: string): string {
  const cleaned = code.toUpperCase().replace(/[\s-]/g, '');
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  }
  return cleaned;
}

/**
 * Service for managing parent-child account linking
 */
export class ParentLinkService extends BaseDatabaseService {
  private readonly PARENT_LINKS_COLLECTION = 'parentLinks';
  private readonly USERS_COLLECTION = 'users';
  private readonly PARENT_LINK_CODES_COLLECTION = 'parentLinkCodes';

  /**
   * Generate a new parent link code for a goalie
   * @param goalieId - The goalie's user ID
   * @param expirationDays - Days until the code expires (default: 7)
   */
  async generateParentLinkCode(
    goalieId: string,
    expirationDays: number = 7
  ): Promise<ApiResponse<{ code: string; expiresAt: Date }>> {
    logger.info('Generating parent link code', 'ParentLinkService', { goalieId, expirationDays });

    try {
      // Verify the user is a student
      const userResult = await this.getById<User>(this.USERS_COLLECTION, goalieId);
      if (!userResult.success || !userResult.data) {
        return {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
          timestamp: new Date(),
        };
      }

      if (userResult.data.role !== 'student') {
        return {
          success: false,
          error: {
            code: 'INVALID_ROLE',
            message: 'Only students can generate parent link codes',
          },
          timestamp: new Date(),
        };
      }

      // Generate unique code with collision checking
      let code = generateParentLinkCode();
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        const existingResult = await this.getById<{ code: string; goalieId: string }>(
          this.PARENT_LINK_CODES_COLLECTION,
          code
        );

        if (!existingResult.data) {
          break; // Code is unique
        }

        code = generateParentLinkCode();
        attempts++;
      }

      if (attempts >= maxAttempts) {
        return {
          success: false,
          error: {
            code: 'CODE_GENERATION_FAILED',
            message: 'Failed to generate unique code after maximum attempts',
          },
          timestamp: new Date(),
        };
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expirationDays);

      // Store the code in the lookup collection
      await this.createWithId(this.PARENT_LINK_CODES_COLLECTION, code, {
        code,
        goalieId,
        goalieName: userResult.data.displayName,
        expiresAt: Timestamp.fromDate(expiresAt),
      });

      // Update the user document with the new code
      await this.update<User>(this.USERS_COLLECTION, goalieId, {
        parentLinkCode: code,
        parentLinkCodeExpiry: Timestamp.fromDate(expiresAt),
      });

      logger.info('Parent link code generated successfully', 'ParentLinkService', {
        goalieId,
        code,
        expiresAt,
      });

      return {
        success: true,
        data: { code, expiresAt },
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to generate parent link code', 'ParentLinkService', error);
      return {
        success: false,
        error: {
          code: 'CODE_GENERATION_ERROR',
          message: 'Failed to generate parent link code',
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Link a parent to a child using a link code
   * @param parentId - The parent's user ID
   * @param linkCode - The code shared by the goalie
   * @param relationship - The relationship type
   */
  async linkParentToChild(
    parentId: string,
    linkCode: string,
    relationship: ParentRelationship = 'parent'
  ): Promise<ApiResponse<{ linkId: string; childId: string; childName: string }>> {
    const normalizedCode = normalizeParentLinkCode(linkCode);
    logger.info('Attempting to link parent to child', 'ParentLinkService', {
      parentId,
      code: normalizedCode,
      relationship,
    });

    try {
      // Verify the parent exists and has parent role
      const parentResult = await this.getById<User>(this.USERS_COLLECTION, parentId);
      if (!parentResult.success || !parentResult.data) {
        return {
          success: false,
          error: {
            code: 'PARENT_NOT_FOUND',
            message: 'Parent user not found',
          },
          timestamp: new Date(),
        };
      }

      if (parentResult.data.role !== 'parent') {
        return {
          success: false,
          error: {
            code: 'INVALID_ROLE',
            message: 'User must have parent role to link to a child',
          },
          timestamp: new Date(),
        };
      }

      // Look up the code
      const codeResult = await this.getById<{
        code: string;
        goalieId: string;
        goalieName: string;
        expiresAt: Timestamp;
      }>(this.PARENT_LINK_CODES_COLLECTION, normalizedCode);

      if (!codeResult.success || !codeResult.data) {
        return {
          success: false,
          error: {
            code: 'INVALID_CODE',
            message: 'Invalid or expired link code',
          },
          timestamp: new Date(),
        };
      }

      // Check expiration
      const now = new Date();
      const expiresAt = codeResult.data.expiresAt.toDate();
      if (now > expiresAt) {
        return {
          success: false,
          error: {
            code: 'CODE_EXPIRED',
            message: 'This link code has expired. Please ask for a new code.',
          },
          timestamp: new Date(),
        };
      }

      const childId = codeResult.data.goalieId;
      const childName = codeResult.data.goalieName;

      // Check if already linked
      const existingLinkResult = await this.query<ParentLink>(this.PARENT_LINKS_COLLECTION, {
        where: [
          { field: 'parentId', operator: '==', value: parentId },
          { field: 'childId', operator: '==', value: childId },
          { field: 'status', operator: '==', value: 'active' },
        ],
        limit: 1,
      });

      if (existingLinkResult.success && existingLinkResult.data && existingLinkResult.data.items.length > 0) {
        return {
          success: false,
          error: {
            code: 'ALREADY_LINKED',
            message: 'You are already linked to this goalie',
          },
          timestamp: new Date(),
        };
      }

      // Create the parent link
      const linkData: Omit<ParentLink, 'id' | 'createdAt' | 'updatedAt'> = {
        parentId,
        childId,
        linkedAt: Timestamp.now(),
        linkedBy: 'code',
        status: 'active',
        relationship,
      };

      const linkResult = await this.create<ParentLink>(this.PARENT_LINKS_COLLECTION, linkData);

      if (!linkResult.success || !linkResult.data) {
        return {
          success: false,
          error: {
            code: 'LINK_CREATION_FAILED',
            message: 'Failed to create parent-child link',
          },
          timestamp: new Date(),
        };
      }

      // Update both user documents with the link
      // Update parent's linkedChildIds
      const parentUser = parentResult.data;
      const updatedChildIds = [...(parentUser.linkedChildIds || [])];
      if (!updatedChildIds.includes(childId)) {
        updatedChildIds.push(childId);
      }
      await this.update<User>(this.USERS_COLLECTION, parentId, {
        linkedChildIds: updatedChildIds,
      });

      // Update child's linkedParentIds
      const childResult = await this.getById<User>(this.USERS_COLLECTION, childId);
      if (childResult.success && childResult.data) {
        const updatedParentIds = [...(childResult.data.linkedParentIds || [])];
        if (!updatedParentIds.includes(parentId)) {
          updatedParentIds.push(parentId);
        }
        await this.update<User>(this.USERS_COLLECTION, childId, {
          linkedParentIds: updatedParentIds,
        });
      }

      logger.info('Parent linked to child successfully', 'ParentLinkService', {
        linkId: linkResult.data.id,
        parentId,
        childId,
        childName,
      });

      return {
        success: true,
        data: {
          linkId: linkResult.data.id,
          childId,
          childName,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to link parent to child', 'ParentLinkService', error);
      return {
        success: false,
        error: {
          code: 'LINK_ERROR',
          message: 'Failed to link parent to child',
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get all children linked to a parent
   * @param parentId - The parent's user ID
   */
  async getLinkedChildren(parentId: string): Promise<ApiResponse<LinkedChildSummary[]>> {
    logger.info('Getting linked children for parent', 'ParentLinkService', { parentId });

    try {
      // Get active links for this parent
      const linksResult = await this.query<ParentLink>(this.PARENT_LINKS_COLLECTION, {
        where: [
          { field: 'parentId', operator: '==', value: parentId },
          { field: 'status', operator: '==', value: 'active' },
        ],
      });

      if (!linksResult.success || !linksResult.data) {
        return {
          success: false,
          error: linksResult.error,
          timestamp: new Date(),
        };
      }

      const children: LinkedChildSummary[] = [];

      // Fetch each child's details
      for (const link of linksResult.data.items) {
        const childResult = await this.getById<User>(this.USERS_COLLECTION, link.childId);
        if (childResult.success && childResult.data) {
          const child = childResult.data;

          // Get progress data (simplified for now)
          const { ProgressService } = await import('./progress.service');
          const progressResult = await ProgressService.getUserProgress(link.childId);

          children.push({
            childId: child.id,
            displayName: child.displayName,
            email: child.email,
            profileImage: child.profileImage,
            studentNumber: child.studentNumber,
            linkedAt: link.linkedAt.toDate(),
            relationship: link.relationship,
            progressPercentage: progressResult.success && progressResult.data
              ? Math.round((progressResult.data.overallStats.skillsCompleted / Math.max(progressResult.data.overallStats.sportsCompleted, 1)) * 100)
              : undefined,
            lastActiveAt: child.lastLoginAt?.toDate(),
            quizzesCompleted: progressResult.success && progressResult.data
              ? progressResult.data.overallStats.quizzesCompleted
              : undefined,
            currentStreak: progressResult.success && progressResult.data
              ? progressResult.data.overallStats.currentStreak
              : undefined,
            hasCompletedAssessment: child.onboardingCompleted,
            pacingLevel: child.initialAssessmentLevel,
          });
        }
      }

      return {
        success: true,
        data: children,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to get linked children', 'ParentLinkService', error);
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch linked children',
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get all parents linked to a goalie
   * @param goalieId - The goalie's user ID
   */
  async getLinkedParents(goalieId: string): Promise<ApiResponse<LinkedParentSummary[]>> {
    logger.info('Getting linked parents for goalie', 'ParentLinkService', { goalieId });

    try {
      // Get active links for this goalie
      const linksResult = await this.query<ParentLink>(this.PARENT_LINKS_COLLECTION, {
        where: [
          { field: 'childId', operator: '==', value: goalieId },
          { field: 'status', operator: '==', value: 'active' },
        ],
      });

      if (!linksResult.success || !linksResult.data) {
        return {
          success: false,
          error: linksResult.error,
          timestamp: new Date(),
        };
      }

      const parents: LinkedParentSummary[] = [];

      // Fetch each parent's details
      for (const link of linksResult.data.items) {
        const parentResult = await this.getById<User>(this.USERS_COLLECTION, link.parentId);
        if (parentResult.success && parentResult.data) {
          const parent = parentResult.data;

          parents.push({
            parentId: parent.id,
            displayName: parent.displayName,
            email: parent.email,
            profileImage: parent.profileImage,
            linkedAt: link.linkedAt.toDate(),
            relationship: link.relationship,
            hasCompletedAssessment: parent.parentOnboardingComplete,
          });
        }
      }

      return {
        success: true,
        data: parents,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to get linked parents', 'ParentLinkService', error);
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch linked parents',
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Revoke a parent-child link
   * @param linkId - The link document ID
   * @param revokedBy - The user ID of who is revoking (parent or child)
   */
  async revokeLink(linkId: string, revokedBy: string): Promise<ApiResponse<void>> {
    logger.info('Revoking parent-child link', 'ParentLinkService', { linkId, revokedBy });

    try {
      // Get the link first
      const linkResult = await this.getById<ParentLink>(this.PARENT_LINKS_COLLECTION, linkId);
      if (!linkResult.success || !linkResult.data) {
        return {
          success: false,
          error: {
            code: 'LINK_NOT_FOUND',
            message: 'Link not found',
          },
          timestamp: new Date(),
        };
      }

      const link = linkResult.data;

      // Verify the revoker is either the parent or child
      if (revokedBy !== link.parentId && revokedBy !== link.childId) {
        return {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Only the parent or child can revoke this link',
          },
          timestamp: new Date(),
        };
      }

      // Update the link status
      await this.update<ParentLink>(this.PARENT_LINKS_COLLECTION, linkId, {
        status: 'revoked',
        revokedAt: Timestamp.now(),
        revokedBy,
      });

      // Remove from both users' linked arrays
      const parentResult = await this.getById<User>(this.USERS_COLLECTION, link.parentId);
      if (parentResult.success && parentResult.data) {
        const updatedChildIds = (parentResult.data.linkedChildIds || []).filter(
          (id) => id !== link.childId
        );
        await this.update<User>(this.USERS_COLLECTION, link.parentId, {
          linkedChildIds: updatedChildIds,
        });
      }

      const childResult = await this.getById<User>(this.USERS_COLLECTION, link.childId);
      if (childResult.success && childResult.data) {
        const updatedParentIds = (childResult.data.linkedParentIds || []).filter(
          (id) => id !== link.parentId
        );
        await this.update<User>(this.USERS_COLLECTION, link.childId, {
          linkedParentIds: updatedParentIds,
        });
      }

      logger.info('Parent-child link revoked successfully', 'ParentLinkService', {
        linkId,
        revokedBy,
        parentId: link.parentId,
        childId: link.childId,
      });

      return {
        success: true,
        message: 'Link revoked successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to revoke link', 'ParentLinkService', error);
      return {
        success: false,
        error: {
          code: 'REVOKE_ERROR',
          message: 'Failed to revoke link',
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Check if a parent is linked to a specific child
   * @param parentId - The parent's user ID
   * @param childId - The child's user ID
   */
  async isLinked(parentId: string, childId: string): Promise<boolean> {
    try {
      const result = await this.query<ParentLink>(this.PARENT_LINKS_COLLECTION, {
        where: [
          { field: 'parentId', operator: '==', value: parentId },
          { field: 'childId', operator: '==', value: childId },
          { field: 'status', operator: '==', value: 'active' },
        ],
        limit: 1,
      });

      return !!(result.success && result.data && result.data.items.length > 0);
    } catch (error) {
      logger.error('Failed to check link status', 'ParentLinkService', error);
      return false;
    }
  }

  /**
   * Get the link between a parent and child
   * @param parentId - The parent's user ID
   * @param childId - The child's user ID
   */
  async getLink(parentId: string, childId: string): Promise<ApiResponse<ParentLink | null>> {
    try {
      const result = await this.query<ParentLink>(this.PARENT_LINKS_COLLECTION, {
        where: [
          { field: 'parentId', operator: '==', value: parentId },
          { field: 'childId', operator: '==', value: childId },
          { field: 'status', operator: '==', value: 'active' },
        ],
        limit: 1,
      });

      if (result.success && result.data && result.data.items.length > 0) {
        return {
          success: true,
          data: result.data.items[0],
          timestamp: new Date(),
        };
      }

      return {
        success: true,
        data: null,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to get link', 'ParentLinkService', error);
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch link',
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Regenerate a parent link code (invalidates the old one)
   * @param goalieId - The goalie's user ID
   * @param expirationDays - Days until the new code expires
   */
  async regenerateParentLinkCode(
    goalieId: string,
    expirationDays: number = 7
  ): Promise<ApiResponse<{ code: string; expiresAt: Date }>> {
    logger.info('Regenerating parent link code', 'ParentLinkService', { goalieId });

    try {
      // Get current code and delete it
      const userResult = await this.getById<User>(this.USERS_COLLECTION, goalieId);
      if (userResult.success && userResult.data?.parentLinkCode) {
        await this.delete(this.PARENT_LINK_CODES_COLLECTION, userResult.data.parentLinkCode);
      }

      // Generate new code
      return this.generateParentLinkCode(goalieId, expirationDays);
    } catch (error) {
      logger.error('Failed to regenerate parent link code', 'ParentLinkService', error);
      return {
        success: false,
        error: {
          code: 'REGENERATE_ERROR',
          message: 'Failed to regenerate parent link code',
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Validate a parent link code without using it
   * @param linkCode - The code to validate
   */
  async validateLinkCode(linkCode: string): Promise<ApiResponse<{
    valid: boolean;
    goalieName?: string;
    expiresAt?: Date;
  }>> {
    const normalizedCode = normalizeParentLinkCode(linkCode);

    try {
      const codeResult = await this.getById<{
        code: string;
        goalieId: string;
        goalieName: string;
        expiresAt: Timestamp;
      }>(this.PARENT_LINK_CODES_COLLECTION, normalizedCode);

      if (!codeResult.success || !codeResult.data) {
        return {
          success: true,
          data: { valid: false },
          timestamp: new Date(),
        };
      }

      const now = new Date();
      const expiresAt = codeResult.data.expiresAt.toDate();

      if (now > expiresAt) {
        return {
          success: true,
          data: { valid: false },
          timestamp: new Date(),
        };
      }

      return {
        success: true,
        data: {
          valid: true,
          goalieName: codeResult.data.goalieName,
          expiresAt,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to validate link code', 'ParentLinkService', error);
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Failed to validate link code',
        },
        timestamp: new Date(),
      };
    }
  }
}

// Export singleton instance
export const parentLinkService = new ParentLinkService();
