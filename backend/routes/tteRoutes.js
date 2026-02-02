const express = require("express");
const router = express.Router();
const {
  submitTTE,
  getMyTTE,
  getAllTTE,
  getTTEById,
  approveTTE,
  rejectTTE,
  deleteTTE,
  getTTEStats,
  exportAllTTE,
  exportInstansiTTE,
} = require("../controllers/tteController");
const { protect } = require("../middleware/authMiddleware");
const {
  uploadTTESelfie,
  uploadTTESurat,
  uploadTTESignature,
  uploadTTESubmit,
} = require("../middleware/uploadMiddleware");

// Middleware untuk cek role admin
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Hanya admin yang bisa akses" });
  }
  next();
};

// Middleware untuk menangani multer errors
const handleMulterError = (err, req, res, next) => {
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// User routes
router.post(
  "/submit",
  protect,
  (req, res, next) => {
    uploadTTESubmit(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  submitTTE,
);

router.get("/my-tte", protect, getMyTTE);

// Admin routes
router.get("/stats", protect, adminOnly, getTTEStats);
router.get("/all", protect, adminOnly, getAllTTE);
router.get("/export/all", protect, adminOnly, exportAllTTE);
// Export for instansi (logged-in user's instansi)
router.get("/export/instansi", protect, exportInstansiTTE);
router.get("/:id", protect, getTTEById);

router.put(
  "/:id/approve",
  protect,
  adminOnly,
  uploadTTESignature.single("tteSignature"),
  approveTTE,
);

router.put("/:id/reject", protect, adminOnly, rejectTTE);

router.delete("/:id", protect, deleteTTE);

module.exports = router;
