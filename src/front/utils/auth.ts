const API_BASE_URL =
  "https://bug-free-zebra-g4xg7pwgww9cwxgg-3001.app.github.dev/api";

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
  const res = await fetch(`${API_BASE_URL}/login`, {
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
  const res = await fetch(`${API_BASE_URL}/register`, {
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
  const response = await fetchWithAuth(`${API_BASE_URL}/profile`);
  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }
  return response.json();
};
