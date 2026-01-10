// API base URL for fetching leaderboard and submitting scores
// Uses VITE_API_BASE_URL environment variable, defaults to localhost:8000
export const getApiBaseUrl = (): string => {
  return import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
};
