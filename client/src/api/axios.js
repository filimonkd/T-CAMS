import axios from 'axios';

/**
 * Expects a backend auth endpoint (POST /api/auth/login returning
 * { token, user }) that does not exist yet as of Phase 8 - see the Phase 9
 * PR description. Written to this contract now so wiring up real auth later
 * is a backend-only change; nothing here needs to move.
 */
const TOKEN_STORAGE_KEY = 'tcams_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let onUnauthorized = null;

// Called once from AuthContext so the interceptor can trigger a logout
// without importing AuthContext here (which would create a cycle).
export function registerUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

// Normalizes the backend's { message, code } error shape (see guardService.js
// GuardError / the app.js error handler) into a single string for display.
export function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.message ||
    'Something went wrong. Please try again.'
  );
}

export { TOKEN_STORAGE_KEY };
export default api;
