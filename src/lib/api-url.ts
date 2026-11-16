/**
 * Get the API base URL without trailing slash
 */
export function getApiUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  const isProduction = process.env.NODE_ENV === 'production';

  if (!configuredUrl) {
    if (isProduction) {
      throw new Error(
        'NEXT_PUBLIC_API_URL must be set before building the production frontend.',
      );
    }

    return 'http://localhost:3001';
  }

  let url: URL;
  try {
    url = new URL(configuredUrl);
  } catch {
    throw new Error('NEXT_PUBLIC_API_URL must be an absolute HTTP(S) URL.');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('NEXT_PUBLIC_API_URL must use HTTP or HTTPS.');
  }

  if (
    isProduction &&
    ['localhost', '127.0.0.1', '::1'].includes(url.hostname)
  ) {
    throw new Error(
      'NEXT_PUBLIC_API_URL cannot point to localhost in a production build.',
    );
  }

  return configuredUrl.replace(/\/+$/, '');
}

/**
 * Build a full API endpoint URL
 */
export function getApiEndpoint(path: string): string {
  const baseUrl = getApiUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}
