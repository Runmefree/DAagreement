import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://dagreement.onrender.com";

// Log the API URL in development and production for debugging
console.log("🔌 API Base URL:", API_BASE_URL);
console.log("🔌 Environment:", import.meta.env.MODE);

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for debugging
API.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
API.interceptors.response.use(
  (response) => {
    console.log(`📥 Response ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error(`❌ API Error ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error("❌ No response from server:", error.message);
      console.error("📍 Attempted URL:", API_BASE_URL);
      console.error("🔗 Check if backend is running and CORS is enabled");
    } else {
      // Error in request setup
      console.error("❌ Request setup error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default API;
