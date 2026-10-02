import { defineConfig, devices } from '@playwright/test';

/**
 * Browser tests for Coach Mike's voice on phones (tests/audio). They serve their
 * own page, so unlike playwright.config.ts they need no dev server.
 *
 *   npm run test:e2e:audio
 *
 * Needs WebKit as well as Chromium: `npx playwright install webkit`.
 * Set COACH_CLIP_URL to a clip's download URL to also play a real recording.
 */

// Playwright starts Chromium with autoplay allowed. Swapping that for the
// gesture-required policy makes Chromium lock each audio element until a tap
// has played it, the way an iPhone does.
const iphoneTapRule = {
  launchOptions: {
    ignoreDefaultArgs: ['--autoplay-policy=no-user-gesture-required'],
    args: ['--autoplay-policy=user-gesture-required'],
  },
};

export default defineConfig({
  testDir: './tests/audio',
  outputDir: './test-results/audio',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 60_000,
  reporter: 'list',

  projects: [
    {
      name: 'Chromium, iPhone tap rule',
      use: { ...devices['Desktop Chrome'], ...iphoneTapRule },
      metadata: { enforcesTapRule: true },
    },
    {
      name: 'Mobile Chrome, iPhone tap rule',
      use: { ...devices['Pixel 5'], ...iphoneTapRule },
      metadata: { enforcesTapRule: true },
    },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
});
