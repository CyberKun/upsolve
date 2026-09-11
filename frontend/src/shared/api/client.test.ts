import { afterEach, expect, it, vi } from 'vitest';
import { api } from './client';
import { isCodeforcesProblemUrl } from './problemUrl';

afterEach(() => { vi.unstubAllGlobals(); document.cookie = 'XSRF-TOKEN=; max-age=0'; });

it('fetches a CSRF cookie before the first mutation and submits it', async () => {
  const fetch = vi.fn().mockImplementationOnce(async () => {
    document.cookie = 'XSRF-TOKEN=test-token';
    return new Response('{}');
  }).mockResolvedValueOnce(new Response('{"ok":true}'));
  vi.stubGlobal('fetch', fetch);
  expect(await api.post('/auth/login', { username: 'demo', password: 'demo123' })).toEqual({ ok: true });
  expect(fetch.mock.calls[0]?.[0]).toBe('/api/v1/auth/csrf');
  expect(fetch.mock.calls[1]?.[1].headers.get('X-XSRF-TOKEN')).toBe('test-token');
});

it('announces session expiry and preserves server errors', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"detail":"Session expired"}', { status: 401 })));
  const listener = vi.fn();
  window.addEventListener('auth-expired', listener);
  await expect(api.get('/queue')).rejects.toMatchObject({ status: 401, message: 'Session expired' });
  expect(listener).toHaveBeenCalledOnce();
  window.removeEventListener('auth-expired', listener);
});

it.each([
  ['https://codeforces.com/contest/1900/problem/A', true],
  ['https://codeforces.com/problemset/problem/1900/A', true],
  ['https://codeforces.com/problemset/1900/problem/A', false],
  ['https://evil.example/contest/1900/problem/A', false],
  ['https://codeforces.com.evil.example/contest/1900/problem/A', false],
])('validates problem URL %s', (url, valid) => expect(isCodeforcesProblemUrl(url)).toBe(valid));
