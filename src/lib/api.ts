import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

function processQueue(error: unknown) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(null);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt refresh on auth endpoints — a 401 from /auth/user/ means
    // the user is simply not logged in (no redirect loop), and /auth/registration/
    // should also be exempt so a failed registration doesn't trigger a refresh.
    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/token/refresh/") ||
      originalRequest?.url?.includes("/auth/login/") ||
      originalRequest?.url?.includes("/auth/logout/") ||
      originalRequest?.url?.includes("/auth/user/") ||
      originalRequest?.url?.includes("/auth/registration/");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Queue this request until the refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // The refresh token is in an HttpOnly cookie — just POST and the backend
        // will read it, validate it, and set new cookies automatically
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/token/refresh/`,
          {},
          { withCredentials: true }
        );
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // Refresh failed — redirect to login
        if (typeof window !== "undefined") {
          window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
