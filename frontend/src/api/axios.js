import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://your-backend-name.onrender.com/api",
});

// attach the JWT to every request
api.interceptors.request.use((config) => {
  try {
    const saved = JSON.parse(localStorage.getItem("rf_user"));
    if (saved?.token) config.headers.Authorization = `Bearer ${saved.token}`;
  } catch {
    /* ignore a corrupt value */
  }
  return config;
});

export const errMsg = (e) => e.response?.data?.message || e.message || "Something went wrong";

export default api;
