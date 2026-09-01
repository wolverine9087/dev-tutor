import apiRequest from "./api";

export const login = (credentials) => apiRequest("/auth/login", {
  method: "POST",
  body: JSON.stringify(credentials)
});

export const register = (details) => apiRequest("/auth/register", {
  method: "POST",
  body: JSON.stringify(details)
});

export const getCurrentUser = () => apiRequest("/auth/me");

export const logout = () => apiRequest("/auth/logout", { method: "POST" });
