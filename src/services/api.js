/**
 * Centralized API client.
 * Formatted to match the procedural PHP REST API JSON standard:
 * Success: { success: true, message: string, data: any }
 * Failure: { success: false, message: string, errors: array }
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function apiRequest(endpoint, { method = 'GET', body, token } = {}) {
  // If backend is active, this issues fetch requests. In Phase 1 mock mode, services handle simulation.
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    return data;
  } catch (err) {
    return {
      success: false,
      message: err.message || 'Network error occurred',
      errors: [err.message],
    };
  }
}
