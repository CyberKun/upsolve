export function isCodeforcesProblemUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return ['http:', 'https:'].includes(url.protocol) && ['codeforces.com', 'www.codeforces.com'].includes(url.hostname)
      && /^\/(?:contest\/\d+\/problem\/[A-Za-z0-9]+|problemset\/problem\/\d+\/[A-Za-z0-9]+)\/?$/.test(url.pathname);
  } catch { return false; }
}
