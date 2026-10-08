import { test, expect } from '@playwright/test';
import { APP } from '../fixtures/routes';

test.describe('FormBuilder tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(APP);
    await page.locator('#demo').scrollIntoViewIfNeeded();
    // FormBuilder is tab index 0 — active by default
  });

  test('renders required form fields', async ({ page }) => {
    await expect(page.getByLabel('Full Name')).toBeVisible();
    await expect(page.getByLabel('Age')).toBeVisible();
    await expect(page.getByLabel('Email Address')).toBeVisible();
    await expect(page.getByLabel('Phone Number')).toBeVisible();
  });

  test('shows Save Profile submit button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Save Profile' })).toBeVisible();
  });

  test('shows validation error when Full Name is cleared and form is submitted', async ({
    page,
  }) => {
    await page.getByLabel('Full Name').clear();
    await page.getByRole('button', { name: 'Save Profile' }).click();
    await expect(page.getByText('Name must be at least 2 characters')).toBeVisible();
  });

  test('City/State field is hidden until Country is selected', async ({ page }) => {
    // visibleIf: (values) => !!values['country'] — not mounted when country is empty
    await expect(page.getByPlaceholder('New York, NY')).toHaveCount(0);

    await page.getByRole('combobox', { name: 'Country' }).click();
    await page.getByRole('option', { name: 'United States' }).click();

    await expect(page.getByPlaceholder('New York, NY')).toBeVisible();
  });
});
