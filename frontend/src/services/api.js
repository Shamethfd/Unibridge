import axios from 'axios';
import config from '../config/config';

// Centralized API client used by the workflow pages.
// Base URL is taken from `REACT_APP_API_URL` (fallback: http://localhost:5000).
export const api = axios.create({
  baseURL: config.API_URL,
  headers: { 'Content-Type': 'application/json' },
  // No cookie-based auth is used in this project, so credentials are not needed.
  // Disabling this avoids strict CORS failures that appear as "Network Error".
  withCredentials: false,
});

export const getApiErrorMessage = (err) => {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.response?.data?.success === false && err?.response?.data?.error) return err.response.data.error;
  if (err?.message) return err.message;
  return 'Request failed';
};

