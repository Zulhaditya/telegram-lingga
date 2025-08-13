const express = require("express");
const { adminOnly, protect } = require("../middleware/authMiddleware");
const { getUsers, getUserById } = require("../controllers/userController");

const router = express.Router();

// Routes untuk manajemen user
router.get("/", protect, adminOnly, getUsers); // Dapatkan data semua user (Hanya admin)
router.get("/:id", protect, getUserById); // Dapatkan data spesifik satu user berdasarkan id

module.exports = router;
