// Configuración centralizada de la aplicación
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api",
  ENDPOINTS: {
    LOGIN: "/login",
    REGISTER: "/register",
    PROFILE: "/profile",
    GAME: "/game",
    FORGOT_PASSWORD: "/password/send-reset-code",
    RESET_PASSWORD: "/password/reset",
    LEADERBOARD_MOUSE: "/leaderboard/mouse",
    LEADERBOARD_KEYBOARD: "/leaderboard/keyboard",
    STATS_MOUSE: "/stats/mouse",
    STATS_KEYBOARD: "/stats/keyboard",
  },
};

// Helper function para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function para endpoints específicos
export const getApiEndpoint = (
  endpointKey: keyof typeof API_CONFIG.ENDPOINTS
): string => {
  return buildApiUrl(API_CONFIG.ENDPOINTS[endpointKey]);
};

// Helper function para cambiar la URL base (útil para desarrollo/producción)
export const setApiBaseUrl = (newBaseUrl: string): void => {
  API_CONFIG.BASE_URL = newBaseUrl;
};
