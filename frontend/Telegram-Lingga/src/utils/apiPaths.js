export const BASE_URL = "http://localhost:8000";

// utils/apiPaths.js
export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    GET_PROFILE: "/api/auth/profile",
    UPDATE_PROFILE: "/api/auth/profile",
    CHANGE_PASSWORD: "/api/auth/change-password",
    TWOFA_SETUP: "/api/auth/2fa/setup",
    TWOFA_VERIFY_SETUP: "/api/auth/2fa/verify-setup",
    TWOFA_TOGGLE: "/api/auth/2fa/toggle",
    TWOFA_VERIFY: "/api/auth/2fa/verify",
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

  TTE: {
    SUBMIT_TTE: "/api/tte/submit",
    GET_MY_TTE: "/api/tte/my-tte",
    GET_ALL_TTE: "/api/tte/all",
    GET_TTE_BY_ID: (tteId) => `/api/tte/${tteId}`,
    APPROVE_TTE: (tteId) => `/api/tte/${tteId}/approve`,
    REJECT_TTE: (tteId) => `/api/tte/${tteId}/reject`,
    DELETE_TTE: (tteId) => `/api/tte/${tteId}`,
    GET_TTE_STATS: "/api/tte/stats",
  },

  IMAGE: {
    UPLOAD_IMAGE: "/api/auth/upload-image",
  },
};
