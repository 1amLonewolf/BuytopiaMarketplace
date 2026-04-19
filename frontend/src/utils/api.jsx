import axios from 'axios';

// Must match your deployed backend (see Railway dashboard). Same host as frontend/vercel.json rewrites.
const DEFAULT_PRODUCTION_API = 'https://buytopia-backend-production.up.railway.app';

function resolveBaseURL() {
  const fromEnv = import.meta.env.VITE_API_URL;
  if (fromEnv !== undefined && fromEnv !== '') {
    return fromEnv;
  }
  // Dev: relative /api → Vite proxy (vite.config.js).
  // Prod: call API host directly so static hosts without /api rewrites still work (avoids 404 on /api/*).
  if (import.meta.env.DEV) {
    return '';
  }
  return DEFAULT_PRODUCTION_API;
}

axios.defaults.baseURL = resolveBaseURL();

export default axios;
