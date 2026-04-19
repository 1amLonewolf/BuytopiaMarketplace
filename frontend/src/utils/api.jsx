import axios from 'axios';

// Must match your Railway **public** URL (Dashboard → service → Settings → Networking).
const DEFAULT_PRODUCTION_API = 'https://buytopia-backend-production-3994.up.railway.app';

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
