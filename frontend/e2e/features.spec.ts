import { test as base, expect } from '@playwright/test';

const test = base.extend<{ serverErrors: void }>({
  serverErrors: [async ({ page }, use) => {
    const errors: string[] = [];
    page.on('response', response => {
      if (response.status() >= 500) errors.push(`${response.status()} ${response.url()}`);
    });
    await use();
    expect(errors).toEqual([]);
  }, { auto: true }],
});

test('new account completes setup, sync, queue, notes, reviews, analytics, export and logout', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/register');
  await page.getByLabel('Username', { exact: true }).fill(`audit${Date.now()}`);
  const username = await page.getByLabel('Username', { exact: true }).inputValue();
  await page.getByLabel('Password', { exact: true }).fill('password123');
  await page.getByLabel('Confirm Password').fill('password123');
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await page.getByRole('link', { name: 'Go to Sign in' }).click();
  await page.getByLabel('Username', { exact: true }).fill(username);
  await page.getByLabel('Password', { exact: true }).fill('password123');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/setup$/);
  await page.getByPlaceholder('Codeforces handle', { exact: true }).fill(username);
  await page.getByRole('button', { name: 'Start tracking' }).click();
  await expect(page).toHaveURL(/\/today$/);
  await page.goto('/setup');
  await expect(page).toHaveURL(/\/today$/);
  await page.getByRole('link', { name: 'Upsolve Queue', exact: true }).click();
  await page.getByRole('link', { name: /Audit Practice/ }).first().click();
  await page.getByLabel('Priority', { exact: true }).selectOption('HIGH');
  await expect(page.getByLabel('Priority', { exact: true })).toHaveValue('HIGH');
  await page.getByPlaceholder('What insight unlocked the solution?').fill('Use a prefix sum.');
  await page.getByRole('button', { name: 'Save notes', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Saved', exact: true })).toBeVisible();
  await page.getByPlaceholder('What insight unlocked the solution?').fill('Use a prefix sum and check overflow.');
  await page.getByRole('button', { name: 'Save notes', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Saved', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Enable reviews', exact: true }).click();
  await page.getByRole('button', { name: 'Start review', exact: true }).click();
  await page.getByRole('button', { name: 'Reveal my notes' }).click();
  await expect(page.locator('section').getByText('Use a prefix sum and check overflow.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Record outcome' }).click();
  await page.getByRole('button', { name: 'Needed a hint' }).click();
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await page.getByLabel('Status', { exact: true }).selectOption('SOLVED');
  await expect(page.getByLabel('Status', { exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Archive', exact: true }).click();
  await page.getByRole('link', { name: 'Back to queue' }).click();
  await page.getByRole('button', { name: 'Archived', exact: true }).click();
  await page.getByRole('link', { name: /Audit Practice/ }).first().click();
  await page.getByRole('button', { name: 'Unarchive', exact: true }).click();
  await page.getByRole('link', { name: 'Upsolve Queue', exact: true }).click();
  await page.getByRole('button', { name: 'Add problem', exact: true }).click();
  await page.getByPlaceholder('Search by name or ID...').fill('Audit Search');
  await page.getByText('Audit Search', { exact: true }).click();
  await page.getByRole('button', { name: 'Add to queue', exact: true }).click();
  await expect(page.getByRole('link', { name: /Audit Search/ }).first()).toBeVisible();
  await page.getByRole('link', { name: 'Reviews', exact: true }).click();
  await expect(page.getByText('Audit Practice', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Insights', exact: true }).click();
  await expect(page.getByText('Weekly Activity', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  await page.getByPlaceholder('1, 3, 7, 14, 30').fill('2, 5, 10');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Saved', exact: true })).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export all data' }).click();
  expect((await download).suggestedFilename()).toBe('upsolve-export.json');
  await page.getByRole('button', { name: 'Logout', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(errors).toEqual([]);
});

test('mobile sign-in and navigation render without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/login');
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Try Demo User (Read-Only)' }).click();
  await expect(page).toHaveURL(/\/today$/);
  await page.goto('/setup');
  await expect(page).toHaveURL(/\/today$/);
  await page.getByRole('button', { name: 'Toggle menu' }).click();
  await page.getByRole('link', { name: 'Upsolve Queue', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Add problem', exact: true })).toBeDisabled();
  await expect(page.locator('a[href^="/queue/"]:visible').first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
