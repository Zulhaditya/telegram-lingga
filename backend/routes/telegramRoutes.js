const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  getDashboardData,
  getUserDashboardData,
  getTelegram,
  getTelegramById,
  createTelegram,
  updateTelegram,
  deleteTelegram,
  updateTelegramStatus,
  updateTelegramChecklist,
} = require("../controllers/telegramController");

const router = express.Router();

// Routes untuk manajemen Telegram
router.get("/dashboard-data", protect, getDashboardData);
router.get("/user-dashboard-data", protect, getUserDashboardData);
router.get("/", protect, getTelegram); // Dapatkan semua data telegram (Admin: semua, User: yang diterima saja)
router.get("/:id", protect, getTelegramById); // Dapatkan data telegram berdasarkan ID
router.post("/", protect, adminOnly, createTelegram); // Buat data telegram (Hanya admin)
router.put("/:id", protect, updateTelegram); // Update data telegram
router.delete("/:id", protect, adminOnly, deleteTelegram); // Hapus data telegram (Hanya admin)
router.put("/:id/status", protect, updateTelegramStatus); // Update status telegram
router.put("/:id/todo", protect, updateTelegramChecklist); // Update checklist telegram

module.exports = router;
