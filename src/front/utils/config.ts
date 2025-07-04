// Configuración centralizada de la aplicación
export const API_CONFIG = {
  BASE_URL: "https://bug-free-zebra-g4xg7pwgww9cwxgg-3001.app.github.dev/api",
  ENDPOINTS: {
    LOGIN: "/login",
    REGISTER: "/register",
    PROFILE: "/profile",
    GAME: "/game",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
    LEADERBOARD: "/leaderboard",
    GAME_STATS: "/game-stats",
    SCORES: "/scores",
  },
};

// Helper function para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function para endpoints específicos
export const getApiEndpoint = (endpointKey: keyof typeof API_CONFIG.ENDPOINTS): string => {
  return buildApiUrl(API_CONFIG.ENDPOINTS[endpointKey]);
};

// Helper function para cambiar la URL base (útil para desarrollo/producción)
export const setApiBaseUrl = (newBaseUrl: string): void => {
  API_CONFIG.BASE_URL = newBaseUrl;
};
