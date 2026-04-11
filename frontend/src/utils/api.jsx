import axios from 'axios';

// Set base URL for API calls
// Use empty string to use the Vite proxy defined in vite.config.js
const API_URL = '';

axios.defaults.baseURL = API_URL;

export default axios;
