import { test, expect } from '@playwright/test';
import { APP } from '../fixtures/routes';

test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP);
  });

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle('MUI Schema Form Builder');
  });

  test('renders navbar with logo and navigation links', async ({ page }) => {
    await expect(page.getByText('mui-schema-form-builder').first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'GitHub' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'npm' }).first()).toBeVisible();
  });

  test('renders hero heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /MUI Schema/i })).toBeVisible();
  });

  test('shows install command in hero section', async ({ page }) => {
    await expect(page.getByText(/npm install mui-schema-form-builder/).first()).toBeVisible();
  });

  test('demo section contains all five example tabs', async ({ page }) => {
    await page.locator('#demo').scrollIntoViewIfNeeded();

    for (const label of [
      'FormBuilder',
      'Multi-step Wizard',
      'Array Fields',
      'Filter Form',
      'Combo Input',
    ]) {
      await expect(page.getByRole('tab', { name: label })).toBeVisible();
    }
  });
});
