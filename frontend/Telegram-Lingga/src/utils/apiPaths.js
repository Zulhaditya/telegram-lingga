export const BASE_URL = "http://localhost:8000";

// utils/apiPaths.js
export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    GET_PROFILE: "/api/auth/profile",
  },

  USERS: {
    GET_ALL_USERS: "/api/users",
    GET_USER_BY_ID: (userId) => `/api/users/${userId}`,
    CREATE_USER: "/api/users",
    UPDATE_USER: (userId) => `/api/users/${userId}`,
    DELETE_USER: (userId) => `/api/users/${userId}`,
  },

  TELEGRAMS: {
    GET_DASHBOARD_DATA: "/api/telegrams/dashboard-data",
    GET_USER_DASHBOARD_DATA: "/api/telegrams/user-dashboard-data",
    GET_ALL_TELEGRAMS: "/api/telegrams",
    GET_TELEGRAM_BY_ID: (telegramId) => `/api/telegrams/${telegramId}`,
    CREATE_TELEGRAM: "/api/telegrams",
    UPDATE_TELEGRAM: (telegramId) => `/api/telegrams/${telegramId}`,
    DELETE_TELEGRAM: (telegramId) => `/api/telegrams/${telegramId}`,

    UPDATE_TELEGRAM_STATUS: (telegramId) =>
      `/api/telegrams/${telegramId}/status`,
    UPDATE_TODO_CHECKLIST: (telegramId) => `/api/telegrams/${telegramId}/todo`,
  },

  REPORTS: {
    EXPORT_TELEGRAM: "/api/reports/export/telegrams",
    EXPORT_USERS: "/api/reports/export/users",
  },

  IMAGE: {
    UPLOAD_IMAGE: "/api/auth/upload-image",
  },
};
