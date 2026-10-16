import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { skillPagePath } from '@/lib/training/skill-path';

describe('skillPagePath', () => {
  it('goes to the skill page under /pillars', () => {
    expect(skillPagePath('pillar-1', 'skill-9')).toBe('/pillars/pillar-1/skills/skill-9');
  });

  it('never uses the old /sports route', () => {
    expect(skillPagePath('pillar-1', 'skill-9')).not.toMatch(/^\/sports/);
  });

  it('falls back to the pillar when the quiz has no skill', () => {
    expect(skillPagePath('pillar-1', '')).toBe('/pillars/pillar-1');
    expect(skillPagePath('pillar-1', undefined)).toBe('/pillars/pillar-1');
  });

  it('falls back to the dashboard when the quiz has neither', () => {
    expect(skillPagePath('', '')).toBe('/dashboard');
    expect(skillPagePath(undefined, 'skill-9')).toBe('/dashboard');
    expect(skillPagePath(null, null)).toBe('/dashboard');
  });

  it('points at a page that exists in the app', () => {
    const route = join(process.cwd(), 'app', 'pillars', '[id]', 'skills', '[skillId]', 'page.tsx');
    expect(existsSync(route)).toBe(true);
  });
});
