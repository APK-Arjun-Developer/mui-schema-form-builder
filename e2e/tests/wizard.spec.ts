import { test, expect } from '@playwright/test';
import { APP } from '../fixtures/routes';

test.describe('Multi-step Wizard tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP);
    await page.locator('#demo').scrollIntoViewIfNeeded();
    await page.getByRole('tab', { name: 'Multi-step Wizard' }).click();
  });

  test('shows Personal step with name and contact fields', async ({ page }) => {
    await expect(page.getByLabel('First Name')).toBeVisible();
    await expect(page.getByLabel('Last Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Phone')).toBeVisible();
  });

  test('shows Continue button on first step', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Continue/i })).toBeVisible();
  });

  test('shows required field errors when Continue is clicked with empty fields', async ({
    page,
  }) => {
    await page.getByRole('button', { name: /Continue/i }).click();
    await expect(page.getByText('Required').first()).toBeVisible();
  });

  test('navigates to Security step after filling Personal step', async ({ page }) => {
    await page.getByLabel('First Name').fill('John');
    await page.getByLabel('Last Name').fill('Doe');
    await page.getByLabel('Email').fill('john@example.com');
    await page.getByRole('button', { name: /Continue/i }).click();

    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
  });

  test('Back button returns to Personal step from Security step', async ({ page }) => {
    await page.getByLabel('First Name').fill('John');
    await page.getByLabel('Last Name').fill('Doe');
    await page.getByLabel('Email').fill('john@example.com');
    await page.getByRole('button', { name: /Continue/i }).click();

    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await page.getByRole('button', { name: /Back/i }).click();

    await expect(page.getByLabel('First Name')).toBeVisible();
  });
});
