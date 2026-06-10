/**
 * Get the API base URL without trailing slash
 */
export function getApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

/**
 * Build a full API endpoint URL
 */
export function getApiEndpoint(path: string): string {
  const baseUrl = getApiUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}
