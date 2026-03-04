import { test, expect } from '@playwright/test';

/**
 * Student Onboarding Evaluation System Tests
 *
 * Tests the following flows:
 * 1. Onboarding page accessibility (with/without authentication)
 * 2. Visual verification of welcome screen and dark theme
 * 3. Coach evaluation review page existence
 * 4. Screenshot capture for visual verification
 */

// Override baseURL to use port 3000 instead of 3001
test.use({ baseURL: 'http://localhost:3000' });

test.describe('Student Onboarding Evaluation System', () => {

  test('Navigate to onboarding page without authentication', async ({ page }) => {
    console.log('Step 1: Navigating to /onboarding without authentication...');

    // Navigate to onboarding page
    await page.goto('/onboarding');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Take screenshot of initial state
    await page.screenshot({
      path: 'test-results/onboarding-unauthenticated.png',
      fullPage: true
    });

    // Get current URL to check if redirected
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    // Check if redirected to login
    if (currentUrl.includes('/auth/login') || currentUrl.includes('/login')) {
      console.log('✓ Page requires authentication - redirected to login');

      // Take screenshot of login page
      await page.screenshot({
        path: 'test-results/onboarding-redirect-to-login.png',
        fullPage: true
      });

      expect(currentUrl).toMatch(/\/auth\/login|\/login/);
    } else {
      console.log('✓ Onboarding page accessible without authentication');

      // Check for common elements that might be on the page
      const bodyText = await page.textContent('body');
      console.log('Page content preview:', bodyText?.substring(0, 200));
    }
  });

  test('Navigate to onboarding page with student authentication', async ({ page }) => {
    console.log('Step 1: Logging in as verified student...');

    // Navigate to login page
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    // Take screenshot of login page
    await page.screenshot({
      path: 'test-results/login-page.png',
      fullPage: true
    });

    // Fill in student credentials from TESTING_CREDENTIALS.md
    await page.fill('input[type="email"]', 'syedbasimmehmood1@gmail.com');
    await page.fill('input[type="password"]', 'password');

    // Take screenshot before login
    await page.screenshot({
      path: 'test-results/login-form-filled.png',
      fullPage: true
    });

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for navigation after login
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Additional wait for any redirects

    const postLoginUrl = page.url();
    console.log('Post-login URL:', postLoginUrl);

    // Take screenshot after login
    await page.screenshot({
      path: 'test-results/post-login-page.png',
      fullPage: true
    });

    console.log('Step 2: Navigating to /onboarding as authenticated student...');

    // Now navigate to onboarding page
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Wait for any animations

    const onboardingUrl = page.url();
    console.log('Onboarding URL:', onboardingUrl);

    // Take full page screenshot
    await page.screenshot({
      path: 'test-results/onboarding-authenticated.png',
      fullPage: true
    });

    console.log('Step 3: Verifying onboarding page elements...');

    // Check if we're on the onboarding page
    if (onboardingUrl.includes('/onboarding')) {
      console.log('✓ Successfully accessed onboarding page');

      // Get page title
      const title = await page.title();
      console.log('Page title:', title);

      // Look for welcome screen elements
      const bodyText = await page.textContent('body');

      // Check for pillar preview
      const hasPillarMention = bodyText?.toLowerCase().includes('pillar');
      console.log('Has pillar mention:', hasPillarMention);

      // Check for "Begin" button
      const beginButton = page.locator('button:has-text("Begin")');
      const beginButtonExists = await beginButton.count() > 0;
      console.log('Begin button exists:', beginButtonExists);

      if (beginButtonExists) {
        console.log('✓ Begin button found');
        await beginButton.screenshot({ path: 'test-results/begin-button.png' });
      }

      // Check for dark theme/ice texture background
      const bodyBg = await page.evaluate(() => {
        const body = document.body;
        const styles = window.getComputedStyle(body);
        return {
          backgroundColor: styles.backgroundColor,
          backgroundImage: styles.backgroundImage,
          className: body.className
        };
      });
      console.log('Body background styles:', bodyBg);

      // Check for dark theme classes (common patterns)
      const isDarkTheme = bodyBg.className.includes('dark') ||
                         bodyBg.className.includes('theme-dark') ||
                         bodyBg.backgroundColor.includes('rgb(0, 0, 0)') ||
                         bodyBg.backgroundColor.includes('rgb(17, 24, 39)'); // Tailwind dark gray
      console.log('Has dark theme:', isDarkTheme);

      // Check for ice texture
      const hasBackgroundImage = bodyBg.backgroundImage !== 'none';
      console.log('Has background image:', hasBackgroundImage);

      // Look for main content container
      const mainContent = await page.locator('main, [role="main"], .onboarding-container').first();
      const mainExists = await mainContent.count() > 0;
      console.log('Main content container exists:', mainExists);

      if (mainExists) {
        await mainContent.screenshot({ path: 'test-results/onboarding-main-content.png' });
      }

      // Log all headings on the page
      const headings = await page.locator('h1, h2, h3').allTextContents();
      console.log('Page headings:', headings);

    } else {
      console.log('⚠ Redirected away from onboarding page to:', onboardingUrl);
    }
  });

  test('Check coach evaluation review page accessibility', async ({ page }) => {
    console.log('Step 1: Logging in as admin/coach...');

    // Navigate to login page
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    // Login with admin credentials (coach role)
    await page.fill('input[type="email"]', 'syedbasimmehmood@gmail.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('Step 2: Navigating to /coach...');

    // Navigate to coach page
    await page.goto('/coach');
    await page.waitForLoadState('networkidle');

    const coachUrl = page.url();
    console.log('Coach page URL:', coachUrl);

    // Take screenshot of coach interface
    await page.screenshot({
      path: 'test-results/coach-interface.png',
      fullPage: true
    });

    // Check if we're on the coach page
    if (coachUrl.includes('/coach')) {
      console.log('✓ Successfully accessed coach interface');

      // Get page title
      const title = await page.title();
      console.log('Page title:', title);

      // Look for students section
      const bodyText = await page.textContent('body');
      const hasStudents = bodyText?.toLowerCase().includes('student');
      console.log('Has student mention:', hasStudents);

      // Log all links on the page
      const links = await page.locator('a').all();
      console.log(`Found ${links.length} links on coach page`);

      // Check for links to student evaluation
      const evaluationLinks = await page.locator('a[href*="evaluation"]').count();
      console.log('Evaluation links found:', evaluationLinks);

      // Check for links to student pages
      const studentLinks = await page.locator('a[href*="students"]').all();
      console.log(`Student-related links found: ${studentLinks.length}`);

      if (studentLinks.length > 0) {
        // Get href of first student link
        const firstStudentLink = await studentLinks[0].getAttribute('href');
        console.log('First student link:', firstStudentLink);

        // If we found a student link, try to navigate to see the structure
        if (firstStudentLink) {
          console.log('Step 3: Exploring student detail page structure...');

          try {
            await page.goto(firstStudentLink);
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);

            const studentPageUrl = page.url();
            console.log('Student page URL:', studentPageUrl);

            // Take screenshot
            await page.screenshot({
              path: 'test-results/coach-student-detail.png',
              fullPage: true
            });

            // Extract studentId from URL
            const studentIdMatch = studentPageUrl.match(/\/students\/([^\/]+)/);
            if (studentIdMatch) {
              const studentId = studentIdMatch[1];
              console.log('Student ID:', studentId);

              // Try to navigate to evaluation page
              console.log('Step 4: Attempting to access evaluation page...');
              const evaluationUrl = `/coach/students/${studentId}/evaluation`;

              await page.goto(evaluationUrl);
              await page.waitForLoadState('networkidle');

              const finalUrl = page.url();
              console.log('Evaluation page URL:', finalUrl);

              // Take screenshot
              await page.screenshot({
                path: 'test-results/coach-evaluation-page.png',
                fullPage: true
              });

              if (finalUrl.includes('evaluation')) {
                console.log('✓ Evaluation page exists and is accessible');
              } else {
                console.log('⚠ Evaluation page not found or redirected');
              }
            }
          } catch (error) {
            console.log('Error navigating to student page:', error);
          }
        }
      }

    } else {
      console.log('⚠ Could not access coach interface, redirected to:', coachUrl);
    }
  });

  test('Visual verification - screenshots and theme check', async ({ page }) => {
    console.log('Performing visual verification tests...');

    // Test 1: Check onboarding page without auth
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');

    const viewportSize = page.viewportSize();
    console.log('Viewport size:', viewportSize);

    await page.screenshot({
      path: 'test-results/visual-onboarding-full.png',
      fullPage: true
    });

    // Test 2: Check responsive design (mobile view)
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    await page.screenshot({
      path: 'test-results/visual-onboarding-mobile.png',
      fullPage: true
    });

    // Test 3: Check responsive design (tablet view)
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad size
    await page.screenshot({
      path: 'test-results/visual-onboarding-tablet.png',
      fullPage: true
    });

    // Reset to desktop
    await page.setViewportSize({ width: 1280, height: 720 });

    console.log('✓ Visual verification screenshots captured');
  });
});
