// axios.js

import axios from "axios"; // import axios

// create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true
});

// export api
export default api;
