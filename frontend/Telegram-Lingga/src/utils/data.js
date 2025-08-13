import {
  LuLayoutDashboard,
  LuUsers,
  LuClipboardCheck,
  LuSquarePlus,
  LuLogOut,
} from "react-icons/lu";

export const SIDE_MENU_DATA = [
  {
    id: "01",
    label: "Dashboard",
    icon: LuLayoutDashboard,
    path: "/admin/dashboard",
  },
  {
    id: "02",
    label: "Manajemen Telegram",
    icon: LuClipboardCheck,
    path: "/admin/telegrams",
  },
  {
    id: "03",
    label: "Buat Telegram",
    icon: LuSquarePlus,
    path: "/admin/create-telegrams",
  },
  {
    id: "04",
    label: "Instansi",
    icon: LuUsers,
    path: "/admin/create-telegrams",
  },
  {
    id: "05",
    label: "Logout",
    icon: LuLogOut,
    path: "/admin/create-telegrams",
  },
];

export const SIDE_MENU_USER_DATA = [
  {
    id: "01",
    label: "Dashboard",
    icon: LuLayoutDashboard,
    path: "/user/dashboard",
  },
  {
    id: "02",
    label: "Telegram Instansi",
    icon: LuClipboardCheck,
    path: "/user/dashboard",
  },
  {
    id: "03",
    label: "Logout",
    icon: LuClipboardCheck,
    path: "/user/dashboard",
  },
];

export const PRIORITY_DATA = [
  { label: "PENTING", value: "PENTING" },
  { label: "SEGERA", value: "SEGERA" },
  { label: "BIASA", value: "BIASA" },
  { label: "EDARAN", value: "EDARAN" },
  { label: "RAHASIA", value: "RAHASIA" },
];

export const STATUS_DATA = [
  { label: "Dibaca", value: "Dibaca" },
  { label: "Belum Dibaca", value: "Belum Dibaca" },
];
