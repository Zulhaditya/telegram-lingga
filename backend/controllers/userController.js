const Telegram = require("../models/Telegram");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// @desc    Dapatkan semua data user (Hanya admin)
// @route   GET /api/users/
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "opd" }).select("-password");

    // Hitung jumlah telegram pada setiap opd yang menerimanya
    const usersWithTelegramCounts = await Promise.all(
      users.map(async (user) => {
        const telegramDibaca = await Telegram.countDocuments({
          instansiPenerima: user._id,
          status: "Dibaca",
        });
        const telegramBelumDibaca = await Telegram.countDocuments({
          instansiPenerima: user._id,
          status: "Belum Dibaca",
        });

        return {
          ...user._doc,
          telegramDibaca,
          telegramBelumDibaca,
        };
      })
    );

    res.json(usersWithTelegramCounts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Dapatkan satu data user berdasarkan id
// @route   GET /api/users/:id
// @access  Private (Admin)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getUsers, getUserById };
