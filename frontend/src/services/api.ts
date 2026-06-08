/**
 * Axios configuration with fallback support.
 * Useful for local environments where 'localhost' and '127.0.0.1' might behave differently.
 */
import axios from 'axios';

const primary = import.meta.env.VITE_API_URL_PRIMARY;
const secondary = import.meta.env.VITE_API_URL_SECONDARY;

export const api = axios.create({
  baseURL: primary || secondary, // Simple static fallback
});

/**
 * Optional: Logic to switch to fallback if the primary connection fails.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.config && !error.config._retry && secondary) {
      error.config._retry = true;
      error.config.baseURL = secondary;
      return api(error.config);
    }
    return Promise.reject(error);
  }
);