/**
 * API Configuration Utility
 * Centralized API base URL management using environment variables only.
 * No hardcoded URLs for security.
 */

/**
 * Gets the API base URL from environment variables.
 *
 * In production, VITE_API_BASE_URL environment variable is required.
 * In development, falls back to localhost if not set.
 *
 * @throws {Error} If in production and VITE_API_BASE_URL is not set
 */
export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  const isProduction = import.meta.env.PROD;

  // In production, environment variable is required
  if (isProduction && !envUrl) {
    throw new Error(
      'VITE_API_BASE_URL environment variable is required in production. ' +
      'Please set it in your deployment platform (e.g., Vercel environment variables).'
    );
  }

  // In development, use localhost as fallback
  const baseUrl = envUrl || (isProduction ? '' : 'http://localhost:8000');

  // Remove trailing slash
  return baseUrl.replace(/\/$/, '');
}

/**
 * API Base URL (singleton)
 */
export const API_BASE_URL = getApiBaseUrl();
