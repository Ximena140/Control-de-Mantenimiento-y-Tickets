const DEVELOPMENT_API_BASE_URL = 'https://localhost:5001';

/**
 * Resolves the backend base URL from VITE_API_BASE_URL.
 * Development falls back to the local API; a production build without the variable
 * returns null so the app can show an explicit configuration error instead of calling localhost.
 */
function resolveApiBaseUrl(): string | null {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, '');
  }
  return import.meta.env.DEV ? DEVELOPMENT_API_BASE_URL : null;
}

export const API_BASE_URL = resolveApiBaseUrl();
