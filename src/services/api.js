import { storage } from '../utils/storage';

/**
 * Centralized API client.
 * Connects to procedural PHP REST API with automatic Bearer token injection,
 * JSON envelopes, and seamless mock fallback mode.
 */

export const API_BASE_URL = 'https://bluevult.com/revolut_api/backend/api/v1';


// Toggle to force mock mode if backend is offline or during testing
export const USE_MOCK_FALLBACK = false;

const AUTH_TOKEN_KEY = 'app_auth_jwt_token';

export async function apiRequest(endpoint, { method = 'GET', body, token, headers = {} } = {}) {
  let authToken = token;
  if (!authToken) {
    try {
      authToken = await storage.getItem(AUTH_TOKEN_KEY);
    } catch (_e) {
      authToken = null;
    }
  }

  const requestHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...headers,
  };

  if (authToken) {
    requestHeaders.Authorization = `Bearer ${authToken}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${API_BASE_URL}${cleanEndpoint}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(fullUrl, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();
    return data;
  } catch (err) {
    return {
      success: false,
      message: err.name === 'AbortError' ? 'Request timed out' : (err.message || 'Network error occurred'),
      data: null,
      isNetworkError: true,
    };
  }
}
