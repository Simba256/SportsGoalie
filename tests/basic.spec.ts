import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Check that the page title is correct
  await expect(page).toHaveTitle(/SportsCoach V3/);

  // Check that the main heading is visible
  await expect(page.getByRole('heading', { name: /Master Sports Skills/ })).toBeVisible();

  // Check that the Get Started button exists
  await expect(page.getByRole('button', { name: 'Get Started' }).first()).toBeVisible();
});

test('navigation works correctly', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Check that navigation links exist
  await expect(page.getByRole('link', { name: 'Sports' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Quizzes' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Progress' })).toBeVisible();
});

test('buttons are interactive', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Test Get Started button click
  await page.getByRole('button', { name: 'Get Started' }).first().click();

  // Test Learn More button click
  await page.getByRole('button', { name: 'Learn More' }).click();
});