import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');

  // Check that the page title is correct
  await expect(page).toHaveTitle(/SmarterGoalie/i);

  // Check that the main heading is visible
  await expect(page.getByRole('heading', { name: /Master Skills/i })).toBeVisible();

  // Check that the Explore Courses button exists
  await expect(page.getByRole('link', { name: /Explore Courses/i }).first()).toBeVisible();
});

test('navigation works correctly', async ({ page }) => {
  await page.goto('/');

  // Check that navigation links exist - "Courses" is the main nav link (not authenticated)
  await expect(page.getByRole('link', { name: 'Courses' }).first()).toBeVisible();
});

test('buttons are interactive', async ({ page }) => {
  await page.goto('/');

  // Test Explore Courses button click
  await page.getByRole('link', { name: /Explore Courses/i }).first().click();
  await expect(page).toHaveURL(/\/pillars/);

  // Go back and test Learn More button click
  await page.goto('/');
  await page.getByRole('link', { name: /Learn More/i }).first().click();
  await expect(page).toHaveURL(/\/pillars/);
});
