import axios from 'axios';

// Set base URL for API calls
// - In development: Vite proxy handles /api → http://localhost:5000
// - In production: Uses VITE_API_URL from hosting platform env vars
// - Fallback: empty string (same origin)
const API_URL = import.meta.env.VITE_API_URL || '';

axios.defaults.baseURL = API_URL;

export default axios;
