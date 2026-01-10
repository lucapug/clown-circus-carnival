// API base URL for fetching leaderboard and submitting scores
// In single-container deployment, frontend and backend share the same origin
// Uses VITE_API_BASE_URL environment variable for dev, empty string for production (same origin)
export const getApiBaseUrl = (): string => {
  // If VITE_API_BASE_URL is set, use it (development with separate frontend server)
  // Otherwise use empty string (production: same origin as frontend)
  return import.meta.env.VITE_API_BASE_URL || "";
};
