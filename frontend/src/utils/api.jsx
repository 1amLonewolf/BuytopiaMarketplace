import axios from 'axios';

// Empty base URL = same-origin `/api/...` (Vite dev proxy, Vercel/Netlify rewrites to your backend).
// Set VITE_API_URL only when the browser must call the API host directly (no /api proxy).
const API_URL = import.meta.env.VITE_API_URL || '';

axios.defaults.baseURL = API_URL;

export default axios;
