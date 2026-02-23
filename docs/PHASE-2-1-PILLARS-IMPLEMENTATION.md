# Phase 2.1: Convert to 6 Pillars Structure

## Overview

Convert the current dynamic unlimited sports system to a fixed 6 Pillars structure for ice hockey goalies, while maintaining backward compatibility for potential future dynamic sports.

**The 6 Pillars:**
1. **Mind-Set Development** - Psychological resilience, strategic thinking, mental fortitude, emotional regulation (the Mind Vault)
2. **Skating as a Skill** - Precise edgework, explosive lateral pushes, seamless transitions, calculated efficiency
3. **Form & Structure** - Stance, posture, glove/blocker positioning, paddle down control (foundation before flair)
4. **Positional Systems** - Systematic positional play, 7 Angle-Marker system, 7 Point System for optimal crease positioning
5. **7 Point System Below Icing Line** - Specialized positioning for the critical zone below the icing line
6. **Game/Practice/Off-Ice Performance** - Holistic training: game performance, practice drills, off-ice conditioning

**The 3 Levels per Pillar:**
- Introduction (Level 1)
- Development (Level 2)
- Refinement (Level 3)

---

## Implementation Steps

### Step 1: Create New Type Definitions

**File:** `/src/types/pillar.ts` (NEW)

Create new types for the pillar system:

```typescript
// Core types
export type PillarSlug = 'mindset_development' | 'skating_skill' | 'form_structure' | 'positional_systems' | 'seven_point_below_icing' | 'performance_programs';
export type PillarLevelSlug = 'introduction' | 'development' | 'refinement';
export type UnlockStatus = 'locked' | 'unlocked' | 'completed';

// Pillar interface (fixed 6 pillars)
export interface Pillar {
  id: string;
  slug: PillarSlug;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number; // 1-6
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Level interface (3 per pillar = 18 total)
export interface PillarLevel {
  id: string;
  pillarId: string;
  slug: PillarLevelSlug;
  name: string;
  description: string;
  order: number; // 1, 2, or 3
  passingScore: number; // e.g., 70 for 70%
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Lesson (replaces Skill within pillar context)
export interface Lesson {
  id: string;
  pillarId: string;
  levelId: string;
  title: string;
  description: string;
  content?: string;
  videoUrl?: string;
  order: number;
  estimatedMinutes: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

// Student progress per pillar
export interface StudentPillarProgress {
  id: string;
  odUserId: string;
  pillarId: string;
  currentLevelSlug: PillarLevelSlug;
  levelProgress: Record<PillarLevelSlug, LevelProgressData>;
  startedAt: Timestamp;
  lastAccessedAt: Timestamp;
}

export interface LevelProgressData {
  status: UnlockStatus;
  completedLessons: string[];
  evaluationScore?: number;
  evaluationPassed?: boolean;
  unlockedAt?: Timestamp;
  completedAt?: Timestamp;
}
```

**File:** `/src/types/index.ts` (MODIFY)

Add export for new pillar types:
```typescript
// Add at bottom
export * from './pillar';
```

---

### Step 2: Create Pillar Service

**File:** `/src/lib/database/services/pillar.service.ts` (NEW)

Core service with these methods:

**Pillar CRUD (mostly read-only for fixed 6):**
- `getAllPillars()` - Get all 6 pillars
- `getPillar(pillarId)` - Get single pillar
- `getPillarBySlug(slug)` - Get by slug name

**Level Operations:**
- `getLevelsByPillar(pillarId)` - Get 3 levels for pillar
- `getLevel(levelId)` - Get single level

**Lesson Operations:**
- `createLesson(lesson)` - Create lesson (admin)
- `updateLesson(lessonId, updates)` - Update lesson (admin)
- `deleteLesson(lessonId)` - Delete lesson (admin)
- `getLessonsByLevel(levelId)` - Get lessons for level
- `getLesson(lessonId)` - Get single lesson

**Progress Operations:**
- `initializeStudentProgress(userId)` - Create progress for all 6 pillars
- `getStudentPillarProgress(userId, pillarId)` - Get progress
- `getAllStudentProgress(userId)` - Get all 6 pillar progress
- `markLessonComplete(userId, lessonId)` - Mark lesson done
- `recordEvaluationResult(userId, pillarId, levelSlug, score, passed)` - Record eval
- `unlockNextLevel(userId, pillarId)` - Unlock next level after passing eval

**Visibility (for hidden content requirement):**
- `getVisibleLevelsForStudent(userId, pillarId)` - Only unlocked levels
- `getVisibleLessonsForStudent(userId, levelId)` - Only if level unlocked

---

### Step 3: Create Seed Data for Pillars

**File:** `/src/lib/database/seeding/pillar-seed-data.ts` (NEW)

```typescript
export const PILLARS_SEED_DATA: Omit<Pillar, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { slug: 'mindset_development', name: 'Mind-Set Development', description: 'Psychological resilience, strategic thinking, mental fortitude, and emotional regulation - the creation of the Mind Vault', icon: 'brain', color: '#7c3aed', order: 1, isActive: true },
  { slug: 'skating_skill', name: 'Skating as a Skill', description: 'Precise edgework, explosive lateral pushes, and seamless transitions - calculated efficiency, not just movement', icon: 'footprints', color: '#0891b2', order: 2, isActive: true },
  { slug: 'form_structure', name: 'Form & Structure', description: 'Stance, posture, glove and blocker positioning, paddle down control - foundation before flair', icon: 'shield', color: '#059669', order: 3, isActive: true },
  { slug: 'positional_systems', name: 'Positional Systems', description: 'Systematic positional play including the 7 Angle-Marker and 7 Point Systems for optimal crease positioning', icon: 'target', color: '#dc2626', order: 4, isActive: true },
  { slug: 'seven_point_below_icing', name: '7 Point System Below Icing Line', description: 'Specialized positioning for the unique challenges and opportunities in the critical zone below the icing line', icon: 'map-pin', color: '#ca8a04', order: 5, isActive: true },
  { slug: 'performance_programs', name: 'Game/Practice/Off-Ice Performance', description: 'Holistic training extending beyond on-ice drills - game performance, practice sessions, and off-ice conditioning', icon: 'activity', color: '#2563eb', order: 6, isActive: true },
];

export const LEVELS_SEED_DATA = [
  { slug: 'introduction', name: 'Introduction', order: 1, passingScore: 70 },
  { slug: 'development', name: 'Development', order: 2, passingScore: 75 },
  { slug: 'refinement', name: 'Refinement', order: 3, passingScore: 80 },
];
```

---

### Step 4: Create Database Migration

**File:** `/src/lib/database/migrations/002-pillars.ts` (NEW)

Migration to:
1. Create `pillars` collection with 6 documents
2. Create `pillar_levels` collection with 18 documents (6 pillars × 3 levels)
3. Create `lessons` collection (empty, admin will add)
4. Create `student_pillar_progress` collection (empty, created on enrollment)

---

### Step 5: Update Database Index

**File:** `/src/lib/database/index.ts` (MODIFY)

Add export for new service:
```typescript
export { PillarService, pillarService } from './services/pillar.service';
```

---

### Step 6: Create React Hooks

**File:** `/src/hooks/usePillars.ts` (NEW)

```typescript
// Main hook - get all pillars with student progress
export function usePillars() {
  // Returns { pillars, progress, loading, error }
}

// Single pillar with levels and progress
export function usePillar(pillarId: string) {
  // Returns { pillar, levels, progress, loading, error }
}

// Level content (respects visibility)
export function usePillarLevel(pillarId: string, levelSlug: string) {
  // Returns { level, lessons, canAccess, loading, error }
}

// Progress mutation hooks
export function usePillarProgressMutations() {
  // Returns { markLessonComplete, recordEvaluation }
}
```

---

### Step 7: Create UI Components

**Directory:** `/src/components/pillars/` (NEW)

| Component | Purpose |
|-----------|---------|
| `PillarCard.tsx` | Card showing pillar with current level indicator |
| `PillarGrid.tsx` | Grid of 6 pillar cards |
| `LevelTabs.tsx` | Tabs for 3 levels (locked/unlocked states) |
| `LevelCard.tsx` | Card showing level with lock/unlock status |
| `LessonList.tsx` | List of lessons in a level |
| `LessonCard.tsx` | Individual lesson card |
| `ProgressIndicator.tsx` | Visual progress (no numerical scores for students) |

---

### Step 8: Create Student Pages

**Directory:** `/app/pillars/` (NEW)

| Route | Purpose |
|-------|---------|
| `/pillars` | Main dashboard showing 6 pillars |
| `/pillars/[pillarId]` | Single pillar with 3 level tabs |
| `/pillars/[pillarId]/levels/[levelSlug]` | Level detail with lessons |
| `/pillars/[pillarId]/levels/[levelSlug]/lessons/[lessonId]` | Lesson view |
| `/pillars/[pillarId]/levels/[levelSlug]/evaluation` | Level evaluation |

---

### Step 9: Create Admin Pages

**Directory:** `/app/admin/pillars/` (NEW)

| Route | Purpose |
|-------|---------|
| `/admin/pillars` | Manage pillars (view only, fixed 6) |
| `/admin/pillars/[pillarId]` | Manage levels for pillar |
| `/admin/pillars/[pillarId]/levels/[levelSlug]/lessons` | Manage lessons |
| `/admin/pillars/[pillarId]/levels/[levelSlug]/lessons/new` | Create lesson |
| `/admin/pillars/[pillarId]/levels/[levelSlug]/lessons/[lessonId]/edit` | Edit lesson |

---

### Step 10: Update Navigation

**Files to modify:**
- `/src/components/layout/Sidebar.tsx` or equivalent - Add "Pillars" link
- `/app/dashboard/page.tsx` - Add pillar progress section

---

### Step 11: Integrate with Existing Video Quiz System

**Purpose:** Use the existing VideoQuiz infrastructure for pillar level evaluations.

**File:** `/src/types/pillar.ts` (ADD)

```typescript
// Link evaluations to existing video quiz system
export interface PillarLevelEvaluation {
  id: string;
  pillarId: string;
  levelSlug: PillarLevelSlug;
  videoQuizId: string; // References existing video_quizzes collection
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**File:** `/src/lib/database/services/pillar.service.ts` (ADD methods)

```typescript
// Evaluation methods linking to VideoQuizService
async getLevelEvaluation(pillarId: string, levelSlug: string): Promise<VideoQuiz | null>
async setLevelEvaluation(pillarId: string, levelSlug: string, videoQuizId: string): Promise<void>
async checkEvaluationCompletion(userId: string, pillarId: string, levelSlug: string): Promise<{
  completed: boolean;
  passed: boolean;
  score?: number; // Only visible to admin
}>
```

**Database:** Create `pillar_level_evaluations` collection to map levels to video quizzes.

---

### Step 12: Add Failure/Remedial Content Support

**Purpose:** Show remedial content when students fail an evaluation.

**File:** `/src/types/pillar.ts` (ADD)

```typescript
// Remedial content for failed evaluations
export interface RemedialContent {
  id: string;
  pillarId: string;
  levelSlug: PillarLevelSlug;
  title: string;
  description: string;
  content?: string; // Rich text
  videoUrl?: string;
  lessons: string[]; // Specific lesson IDs to review
  resources: ExternalResource[];
  order: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**File:** `/src/lib/database/services/pillar.service.ts` (ADD methods)

```typescript
// Remedial content methods
async getRemedialContent(pillarId: string, levelSlug: string): Promise<RemedialContent[]>
async createRemedialContent(content: Omit<RemedialContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>
async updateRemedialContent(contentId: string, updates: Partial<RemedialContent>): Promise<void>
async deleteRemedialContent(contentId: string): Promise<void>
```

**New Pages:**

| Route | Purpose |
|-------|---------|
| `/pillars/[pillarId]/levels/[levelSlug]/evaluation/failed` | Show remedial content after failing |
| `/admin/pillars/[pillarId]/levels/[levelSlug]/remedial` | Manage remedial content |
| `/admin/pillars/[pillarId]/levels/[levelSlug]/remedial/new` | Create remedial content |

**Database:** Create `remedial_content` collection.

**Flow:**
1. Student takes evaluation (video quiz)
2. If passed → Unlock next level
3. If failed → Redirect to remedial content page
4. Student reviews remedial content
5. Student can re-attempt evaluation

---

## Key Files Summary

| File | Action | Purpose |
|------|--------|---------|
| `/src/types/pillar.ts` | CREATE | Type definitions for pillars, levels, lessons, progress, evaluations, remedial |
| `/src/types/index.ts` | MODIFY | Export pillar types |
| `/src/lib/database/services/pillar.service.ts` | CREATE | Core pillar service with all CRUD and progress methods |
| `/src/lib/database/index.ts` | MODIFY | Export pillar service |
| `/src/lib/database/seeding/pillar-seed-data.ts` | CREATE | Seed data for 6 pillars and 18 levels |
| `/src/lib/database/migrations/002-pillars.ts` | CREATE | DB migration for all pillar collections |
| `/src/hooks/usePillars.ts` | CREATE | React hooks for pillars, levels, progress |
| `/src/components/pillars/*.tsx` | CREATE | UI components (cards, grids, indicators) |
| `/app/pillars/**/*.tsx` | CREATE | Student pages (dashboard, levels, lessons, evaluation) |
| `/app/admin/pillars/**/*.tsx` | CREATE | Admin pages (manage lessons, evaluations, remedial content) |

---

## Database Collections

| Collection | Documents | Purpose |
|------------|-----------|---------|
| `pillars` | 6 (fixed) | The 6 pillars |
| `pillar_levels` | 18 (fixed) | 3 levels per pillar |
| `lessons` | Dynamic | Lessons created by admin |
| `student_pillar_progress` | Dynamic | Per-student progress |
| `pillar_level_evaluations` | Up to 18 | Maps levels to video quizzes |
| `remedial_content` | Dynamic | Failure/remedial content per level |

---

## Verification Plan

### 1. Database Setup
```bash
# Run migration to create collections and seed 6 pillars
npm run db:migrate
```

### 2. Service Tests
- Verify `pillarService.getAllPillars()` returns 6 pillars
- Verify `pillarService.getLevelsByPillar(id)` returns 3 levels
- Verify progress initialization creates records for all 6 pillars

### 3. UI Tests (Playwright)
- Student can see all 6 pillars on `/pillars`
- Student only sees Introduction level unlocked initially
- Student cannot access Development/Refinement (locked)
- Admin can create lessons for any level
- After passing Introduction evaluation, Development unlocks

### 4. Manual Testing
- [ ] Navigate to `/pillars` - see 6 pillar cards with correct names
- [ ] Click pillar - see 3 level tabs (Development & Refinement locked)
- [ ] View Introduction lessons
- [ ] Complete lessons and take evaluation (video quiz)
- [ ] **Pass evaluation** → Verify Development unlocks
- [ ] **Fail evaluation** → Verify remedial content shows
- [ ] Review remedial content and re-attempt evaluation
- [ ] Admin: Create/edit/delete lessons
- [ ] Admin: Assign video quiz to level evaluation
- [ ] Admin: Create/edit remedial content

---

## Notes

- **No breaking changes** - Existing sports/skills system remains intact for future use
- **Hidden content** - Students only see unlocked levels and their lessons
- **No numerical scores** - Students see pass/fail only (scores stored for admin analytics)
- **Extensible** - Same pillar structure can be used for future sports (after ~3 months)
- **Video Quiz Integration** - Reuses existing VideoQuiz infrastructure for evaluations
- **Remedial Content** - Failed students see simplified review content before retrying
- **Hockey Only** - This is specifically for ice hockey goalies (other sports later)

## Implementation Order (Recommended)

1. **Types first** - Create all type definitions
2. **Service layer** - Implement PillarService with all methods
3. **Migration & Seed** - Set up database with 6 pillars
4. **Hooks** - Create React hooks for data access
5. **Components** - Build UI components
6. **Student pages** - Create pillar browsing and learning pages
7. **Admin pages** - Create content management pages
8. **Video Quiz integration** - Link evaluations to existing quiz system
9. **Remedial content** - Add failure content management
10. **Navigation updates** - Add links to dashboard and sidebar
