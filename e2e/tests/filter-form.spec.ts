import { test, expect } from '@playwright/test';
import { APP } from '../fixtures/routes';

test.describe('Filter Form tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP);
    await page.locator('#demo').scrollIntoViewIfNeeded();
    await page.getByRole('tab', { name: 'Filter Form' }).click();
  });

  test('shows all 10 products initially', async ({ page }) => {
    await expect(page.getByText('10 of 10 products')).toBeVisible();
  });

  test('filters products by search term', async ({ page }) => {
    await page.getByLabel('Search').fill('TypeScript');
    await expect(page.getByText('TypeScript Handbook')).toBeVisible();
    await expect(page.getByText('React Developer Course')).not.toBeVisible();
  });

  test('filters products by category', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Category' }).click();
    await page.getByRole('option', { name: 'Books' }).click();
    await expect(page.getByText('TypeScript Handbook')).toBeVisible();
    await expect(page.getByText('Node.js Complete Guide')).toBeVisible();
    await expect(page.getByText('React Developer Course')).not.toBeVisible();
  });

  test('shows no results message when no products match', async ({ page }) => {
    await page.getByLabel('Search').fill('zzznotaproduct999');
    await expect(page.getByText('No products match the current filters.')).toBeVisible();
  });
});
