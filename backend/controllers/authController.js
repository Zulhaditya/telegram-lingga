const User = require("../models/User");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

// Generate Token JWT
const generateToken = (userId) => {
  return JWT.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc    Registrasi user baru
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { nama, email, password, profileImageUrl, adminInviteToken } =
      req.body;

    // Cek jika user sudah terdaftar
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User sudah terdaftar" });
    }

    // Tentukan role dari user: Admin jika token yang diberikan benar, jika salah maka OPD
    let role = "opd";
    if (
      adminInviteToken &&
      adminInviteToken == process.env.ADMIN_INVITE_TOKEN
    ) {
      role = "admin";
    }

    // Hasing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Buat user baru
    const user = await User.create({
      nama,
      email,
      password: hashedPassword,
      profileImageUrl,
      role,
    });

    // Kembalikan data user dengan token JWT
    res.status(201).json({
      _id: user._id,
      nama: user.nama,
      emai: user.email,
      role: user.role,
      profileImageUrl: user.profileImageUrl,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Email atau password tidak valid" });
    }

    // Bandingkan password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Email atau password tidak valid " });
    }

    // Jika user sudah mengaktifkan 2FA, informasikan agar front-end menampilkan input OTP
    // Untuk alur yang diminta: selalu arahkan ke halaman 2FA setelah password valid
    // Jika user sudah mengaktifkan 2FA, beri tahu front-end bahwa harus memasukkan OTP
    if (user.twoFactorEnabled) {
      return res.json({
        twoFactorRequired: true,
        twoFactorEnabled: true,
        _id: user._id,
        email: user.email,
        role: user.role,
      });
    }

    // Jika user belum mengaktifkan 2FA, buat temporary secret & QR dan kembalikan ke front-end
    const secret = speakeasy.generateSecret({
      name: `Telegram-Lingga (${user.email})`,
    });

    user.twoFactorTempSecret = secret.base32;
    await user.save();

    const otpauth = secret.otpauth_url;
    const qrCodeDataURL = await qrcode.toDataURL(otpauth);

    return res.json({
      twoFactorRequired: true,
      twoFactorEnabled: false,
      _id: user._id,
      email: user.email,
      role: user.role,
      qrCode: qrCodeDataURL,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Dapatkan data user
// @route   GET /api/auth/profile
// @access  Private (membutuhkan token JWT)
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update data user
// @route   PUT /api/auth/profile
// @access  Private (membutuhkan token JWT)
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    user.nama = req.body.nama || user.nama;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      nama: updatedUser.nama,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Setup 2FA - generate secret & QR code (protected)
// @route   GET /api/auth/2fa/setup
// @access  Private
const setupTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    const secret = speakeasy.generateSecret({
      name: `Telegram-Lingga (${user.email})`,
    });

    // Save temporary secret until user verifies
    user.twoFactorTempSecret = secret.base32;
    await user.save();

    // Generate QR code data URL
    const otpauth = secret.otpauth_url;
    const qrCodeDataURL = await qrcode.toDataURL(otpauth);

    res.json({ qrCode: qrCodeDataURL });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Verify 2FA setup and enable it (protected)
// @route   POST /api/auth/2fa/verify-setup
// @access  Private
const verifyTwoFactorSetup = async (req, res) => {
  try {
    const { token } = req.body; // token is the OTP code
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });
    if (!user.twoFactorTempSecret)
      return res
        .status(400)
        .json({ message: "Tidak ada setup 2FA yang pending" });

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorTempSecret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (!verified)
      return res.status(401).json({ message: "Kode OTP tidak valid" });

    user.twoFactorSecret = user.twoFactorTempSecret;
    user.twoFactorTempSecret = null;
    user.twoFactorEnabled = true;
    await user.save();

    res.json({ message: "2FA berhasil diaktifkan" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Verify 2FA during login and issue JWT (public)
// @route   POST /api/auth/2fa/verify
// @access  Public
const verifyTwoFactor = async (req, res) => {
  try {
    const { userId, token } = req.body;
    if (!userId || !token)
      return res.status(400).json({ message: "userId dan token diperlukan" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });
    // Accept either permanent secret or temporary secret (first-time setup during login)
    const secretToVerify = user.twoFactorSecret || user.twoFactorTempSecret;
    if (!secretToVerify)
      return res
        .status(400)
        .json({ message: "2FA belum diaktifkan untuk user ini" });

    const verified = speakeasy.totp.verify({
      secret: secretToVerify,
      encoding: "base32",
      token,
      window: 1,
    });

    if (!verified)
      return res.status(401).json({ message: "Kode OTP tidak valid" });

    // If token verified against temp secret, promote it to permanent
    if (!user.twoFactorSecret && user.twoFactorTempSecret) {
      user.twoFactorSecret = user.twoFactorTempSecret;
      user.twoFactorTempSecret = null;
      user.twoFactorEnabled = true;
      await user.save();
    }

    // Issue JWT after successful 2FA
    res.json({
      _id: user._id,
      nama: user.nama,
      email: user.email,
      role: user.role,
      profileImageUrl: user.profileImageUrl,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  setupTwoFactor,
  verifyTwoFactorSetup,
  verifyTwoFactor,
};
