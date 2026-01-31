import axios from "axios";
import { BASE_URL } from "./apiPaths";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle error biasa secara global
    if (error.response) {
      if (error.response.status === 401) {
        // Hanya redirect ke login jika error adalah token invalid, bukan password salah
        // Token invalid biasanya tidak memiliki message field atau message generic
        const shouldLogout =
          !error.response.data?.message ||
          error.response.data?.message?.includes("token") ||
          error.response.data?.message?.includes("autentik");

        if (shouldLogout) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
        // Jika 401 karena hal lain (misal password), biarkan component handle errornya
      } else if (error.response.status === 500) {
        console.error("Server error. Coba lagi nanti");
      }
    } else if (error.code === "ECONNABORTED") {
      console.error("Request timeout. Coba lagi nanti");
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
