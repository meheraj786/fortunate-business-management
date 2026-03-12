import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
});

// --- Refresh token interceptor ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, success = false) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(success);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401 errors that aren't already retries or refresh/login requests
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/user/login") &&
      !originalRequest.url?.includes("/user/refresh-token")
    ) {
      if (isRefreshing) {
        // Another refresh is in progress — queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/user/refresh-token");
        processQueue(null, true);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, false);
        localStorage.removeItem("isAuthenticated");
        // Don't use window.location.href — it causes a hard browser reload.
        // Just reject the error; PrivateRoute will detect null user and
        // navigate to /login via React Router (smooth, no reload).
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
