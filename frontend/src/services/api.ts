/**
 * Axios configuration with fallback support.
 * Useful for local environments where 'localhost' and '127.0.0.1' might behave differently.
 */
import axios from 'axios';
import { GenerationResponse, StatusResponse } from '../types/JobResponse';

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

/**
 * Workflow API services to interact with the FastAPI backend.
 * Uses the established axios instance to benefit from the fallback logic.
 */
export const workflowApi = {
  generate: async (prompt: string, cfg: number, steps: number): Promise<GenerationResponse> => {
    const response = await api.post('/generate', { prompt, cfg, steps });
    return response.data;
  },

  getStatus: async (promptId: string): Promise<StatusResponse> => {
    const response = await api.get<StatusResponse>(`/status/${promptId}`);
    return response.data;
  }
};