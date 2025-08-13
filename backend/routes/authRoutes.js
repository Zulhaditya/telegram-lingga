const express = require("express");
const { registerUser, loginUser, getUserProfile, updateUserProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Autentikasi Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

router.post("/upload-image", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "Tidak ada file gambar yang diupload" });
    }
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
    req.file.filename
    }`;
    res.status(200).json({ imageUrl });
});

module.exports = router;