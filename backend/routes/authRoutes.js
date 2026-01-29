const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  setupTwoFactor,
  verifyTwoFactorSetup,
  verifyTwoFactor,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Autentikasi Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/2fa/verify", verifyTwoFactor); // public endpoint to verify OTP during login
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

// 2FA routes
router.get("/2fa/setup", protect, setupTwoFactor);
router.post("/2fa/verify-setup", protect, verifyTwoFactorSetup);

router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ message: "Tidak ada file gambar yang diupload" });
  }
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
    req.file.filename
  }`;
  res.status(200).json({ imageUrl });
});

module.exports = router;
