const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  exportTelegramsReport,
  exportUsersReport,
} = require("../controllers/reportController");

const router = express.Router();

router.get("/export/telegrams", protect, adminOnly, exportTelegramsReport); // Export semua telegram ke Excel/PDF
router.get("/export/users", protect, adminOnly, exportUsersReport); // Export data telegram user/instansi

module.exports = router;
