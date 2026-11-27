export type UrlValidationResult =
  | { ok: true; url: string; displayHost: string }
  | { ok: false; error: string };

const EXPLICIT_SCHEME_RE = /^[a-zA-Z][a-zA-Z\d+\-.]*:/;

/**
 * Normalizes a pasted website/app URL (prepending https:// when no scheme is supplied)
 * and strictly validates that it uses http: or https: with a valid hostname.
 */
export function normalizeAndValidateUrl(rawInput: string): UrlValidationResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { ok: false, error: 'Enter a website or web app URL to preview.' };
  }

  if (/\s/.test(trimmed)) {
    return { ok: false, error: 'URLs cannot contain spaces.' };
  }

  if (EXPLICIT_SCHEME_RE.test(trimmed)) {
    const lower = trimmed.toLowerCase();
    if (!lower.startsWith('http://') && !lower.startsWith('https://')) {
      return {
        ok: false,
        error: 'Only http:// and https:// website URLs are supported.',
      };
    }
  }

  const candidate = EXPLICIT_SCHEME_RE.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        ok: false,
        error: 'Only http:// and https:// website URLs are supported.',
      };
    }

    const host = parsed.hostname.toLowerCase();
    const isLocalhost = host === 'localhost';
    const hasValidDomain =
      host.includes('.') &&
      !host.startsWith('.') &&
      !host.endsWith('.') &&
      /^[a-z0-9.-]+$/.test(host) &&
      host.split('.').every((label) => label.length > 0 && !label.startsWith('-') && !label.endsWith('-'));

    if (!isLocalhost && !hasValidDomain) {
      return {
        ok: false,
        error: 'Enter a valid domain (for example, example.com or app.site.com).',
      };
    }

    const displayHost = parsed.hostname.replace(/^www\./i, '');
    return {
      ok: true,
      url: parsed.href,
      displayHost,
    };
  } catch {
    return {
      ok: false,
      error: 'Enter a valid website URL (for example, example.com).',
    };
  }
}
