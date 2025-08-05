import { API_CONFIG, getApiEndpoint } from "./config";

export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const signOut = (): void => {
  localStorage.removeItem("token");
};

export const signIn = async (email: string, password: string) => {
  const res = await fetch(getApiEndpoint("LOGIN"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error((await res.json()).msg || "Login failed");
  const data = await res.json();
  localStorage.setItem("token", data.token);
  return data;
};

export const signUp = async (
  email: string,
  password: string,
  username: string,
  age: number,
  language: string,
  country: string,
  verify_password: string
) => {
  const res = await fetch(getApiEndpoint("REGISTER"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      username,
      age,
      language,
      country,
      verify_password,
    }),
  });
  if (!res.ok) throw new Error((await res.json()).msg || "Registration failed");
  const data = await res.json();
  localStorage.setItem("token", data.token);
  return data;
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getUserProfile = async () => {
  const response = await fetchWithAuth(getApiEndpoint("PROFILE"));
  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }
  return response.json();
};

// Obtiene estadísticas del usuario usando el método de entrada especificado
export const getUserStatsMouse = async () => {
  const response = await fetchWithAuth(getApiEndpoint("STATS_MOUSE"));
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Mouse stats error:", response.status, errorText);
    throw new Error(`Failed to fetch user stats (mouse): ${response.status}`);
  }

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    console.error("Expected JSON but got:", text.substring(0, 200));
    throw new Error("Server returned non-JSON response for mouse stats");
  }

  return response.json();
};

export const getUserStatsKeyboard = async () => {
  const response = await fetchWithAuth(getApiEndpoint("STATS_KEYBOARD"));
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Keyboard stats error:", response.status, errorText);
    throw new Error(
      `Failed to fetch user stats (keyboard): ${response.status}`
    );
  }

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    console.error("Expected JSON but got:", text.substring(0, 200));
    throw new Error("Server returned non-JSON response for keyboard stats");
  }

  return response.json();
};

export const postUserStatsMouse = async (stats: {
  zombies_killed_by_player: number;
  zombies_killed_by_environment: number;
  total_play_time: number;
  bullets_fired: number;
  typing_accuracy: number;
  levels_completed: number;
}) => {
  const response = await fetchWithAuth(getApiEndpoint("STATS_MOUSE"), {
    method: "POST",
    body: JSON.stringify(stats),
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Mouse stats POST error:", response.status, errorText);
    throw new Error(`Failed to post user stats (mouse): ${response.status}`);
  }
  return response.json();
};

export const postUserStatsKeyboard = async (stats: {
  zombies_killed_by_player: number;
  zombies_killed_by_environment: number;
  total_play_time: number;
  bullets_fired: number;
  typing_accuracy: number;
  levels_completed: number;
}) => {
  const response = await fetchWithAuth(getApiEndpoint("STATS_KEYBOARD"), {
    method: "POST",
    body: JSON.stringify(stats),
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Keyboard stats POST error:", response.status, errorText);
    throw new Error(`Failed to post user stats (keyboard): ${response.status}`);
  }
  return response.json();
};

// Obtiene el leaderboard para mouse
export const getLeaderboardMouse = async () => {
  try {
    const response = await fetch(getApiEndpoint("LEADERBOARD_MOUSE"));
    if (!response.ok) {
      throw new Error(`Failed to fetch mouse leaderboard: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching mouse leaderboard:", error);
    throw error;
  }
};

// Obtiene el leaderboard para keyboard
export const getLeaderboardKeyboard = async () => {
  try {
    const response = await fetch(getApiEndpoint("LEADERBOARD_KEYBOARD"));
    if (!response.ok) {
      throw new Error(`Failed to fetch keyboard leaderboard: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching keyboard leaderboard:", error);
    throw error;
  }
};