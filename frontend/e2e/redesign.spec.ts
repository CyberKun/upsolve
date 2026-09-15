import { test, expect, type Page } from '@playwright/test';

const themeIds = ['google-light', 'midnight', 'cyberpunk', 'earth', 'pastel'];
const problem = { id: 1, contestId: 1000, problemIndex: 'A', name: 'Practice fixture', rating: 1400, tags: ['math'], problemType: 'PROGRAMMING' };
const queueItem = { id: 'practice-1', problem, status: 'ATTEMPTED', priority: 'HIGH', source: 'MANUAL', archivedAt: null, createdAt: '2026-09-01T12:00:00Z', updatedAt: '2026-09-01T12:00:00Z', version: 0, hasNotes: false, hasReviewSchedule: false, nextReviewDate: null, submissionCount: 1 };

async function mockApi(page: Page, authenticated = false) {
  await page.route('**/api/v1/**', route => {
    const path = new URL(route.request().url()).pathname.replace('/api/v1', '');
    const user = { id: 'a0000000-0000-0000-0000-000000000001', username: 'demo', setupComplete: true };
    const responses: Record<string, unknown> = {
      '/auth/me': user,
      '/queue': { content: [queueItem], totalElements: 1, totalPages: 1, page: 0, size: 20 },
      '/queue/practice-1': { ...queueItem, recentSubmissions: [] },
      '/queue/practice-1/notes': { queueItemId: 'practice-1', mistakeCategories: [], version: 0 },
      '/queue/practice-1/review-schedule': { queueItemId: 'practice-1', paused: true, intervalIndex: 0, nextReviewDate: null, version: 0 },
      '/queue/practice-1/reviews': [],
      '/queue/practice-1/submissions': [],
      '/reviews/due': { overdue: [], today: [], upcoming: [] },
      '/sync-jobs': [],
      '/preferences': { trackedHandle: 'demo', timeZone: 'UTC', targetRatingMin: 800, targetRatingMax: 1800, preferredTopics: [], reviewIntervals: [1, 3, 7] },
    };
    if (path === '/auth/me' && !authenticated) return route.fulfill({ status: 401, json: { detail: 'Sign in required' } });
    if (path.startsWith('/analytics')) return route.fulfill({ json: { topics: [], bands: [], activity: [], mistakes: [] } });
    return route.fulfill({ json: responses[path] ?? {} });
  });
}

for (const width of [360, 768, 1440]) {
  test(`catalog layout, sticky bars, filters and palettes at ${width}px`, async ({ page }, testInfo) => {
    await mockApi(page);
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/explore');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Meet your next breakthrough.');
    await expect(page.locator('[data-product-card]')).toHaveCount(6);
    for (const id of themeIds) {
      await page.getByLabel('Theme', { exact: true }).selectOption(id);
      await expect(page.locator('html')).toHaveAttribute('data-theme', id);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const columns = await page.locator('#collection-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
      expect(columns).toBe(width < 640 ? 1 : width < 1024 ? 2 : 3);
      const contrast = await page.evaluate(() => {
        const style = getComputedStyle(document.documentElement);
        const rgb = (token: string) => {
          const hex = style.getPropertyValue(token).trim().slice(1);
          return [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
        };
        return [['--primary-text', '--primary-bg'], ['--secondary-text', '--secondary-bg'], ['--on-accent', '--accent-color'], ['--on-accent', '--button-hover'], ['--accent-color', '--accent-light']].map(([a, b]) => (Math.max(rgb(a), rgb(b)) + .05) / (Math.min(rgb(a), rgb(b)) + .05));
      });
      for (const ratio of contrast) expect(ratio).toBeGreaterThanOrEqual(4.5);
      if (width !== 768) await page.screenshot({ path: testInfo.outputPath(`${width}-${id}.png`), fullPage: true });
    }
    await page.reload();
    await expect(page.getByLabel('Theme', { exact: true })).toHaveValue('pastel');
    await page.getByRole('button', { name: 'Algorithms', exact: true }).click();
    await expect(page.locator('[data-product-card]')).toHaveCount(2);
    await expect(page.getByRole('button', { name: 'Algorithms', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Contest practice', exact: true }).click();
    await expect(page.locator('[data-product-card]')).toHaveCount(1);
    await page.getByRole('button', { name: 'All collections', exact: true }).click();
    await expect(page.locator('[data-product-card]')).toHaveCount(6);
    await page.evaluate(() => scrollTo(0, 1100));
    const header = await page.locator('[data-app-header]').boundingBox();
    const filters = await page.locator('[data-filter-nav]').boundingBox();
    expect(header!.y).toBe(0);
    expect(filters!.y).toBeGreaterThanOrEqual(header!.height);
    expect(filters!.y).toBeLessThanOrEqual(header!.height + 1);
    expect(errors).toEqual([]);
  });
}

test('keyboard access, focus return, navigation and reduced motion', async ({ page }) => {
  await mockApi(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/explore');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
  const explore = page.getByRole('button', { name: 'Explore Small steps. Solid foundations.' });
  await explore.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(explore).toBeFocused();
  await page.setViewportSize({ width: 360, height: 800 });
  await page.getByRole('button', { name: 'Toggle menu' }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Toggle menu' })).toBeFocused();
  await page.getByRole('button', { name: 'Toggle menu' }).click();
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Upsolve Queue', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
});

test('invalid or unavailable storage safely defaults and can still switch', async ({ page }) => {
  await mockApi(page);
  await page.addInitScript(() => localStorage.setItem('upsolve-theme', 'invalid-theme'));
  await page.goto('/explore');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'google-light');
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('Blocked'); } });
  });
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'google-light');
  await page.getByLabel('Theme', { exact: true }).selectOption('midnight');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'midnight');
});

test('existing authenticated routes and demo restrictions survive the redesign', async ({ page }) => {
  await mockApi(page, true);
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const route of ['/today', '/queue', '/queue/practice-1', '/reviews', '/insights', '/settings']) {
    await page.goto(route);
    await expect(page.getByText('Viewing Demo Mode. Modifications are disabled.')).toBeVisible();
    await page.getByLabel('Theme', { exact: true }).selectOption('midnight');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'midnight');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (route === '/today') await expect(page.getByText('Practice fixture', { exact: true })).toBeVisible();
    if (route === '/queue') await expect(page.getByRole('button', { name: 'Add problem', exact: true })).toBeDisabled();
  }
  expect(errors).toEqual([]);
});

test('sign-in and registration fit narrow and desktop layouts', async ({ page }, testInfo) => {
  await mockApi(page);
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/login', '/register']) {
      await page.goto(route);
      await expect(page.getByLabel('Username', { exact: true })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`${width}-${route.slice(1)}.png`), fullPage: true });
    }
  }
});
