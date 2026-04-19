import axios from 'axios';

// Dev: leave empty so /api hits the Vite proxy. Prod: full backend URL unless VITE_API_URL is set.
const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '' : 'https://buytopia-backend.onrender.com');

axios.defaults.baseURL = API_URL;

export default axios;
