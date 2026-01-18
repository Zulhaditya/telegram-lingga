const Telegram = require("../models/Telegram");

const fs = require("fs");
const path = require("path");

// @desc    Dapatkan semua data telegram (Admin: semua, User: hanya yang diterima)
// @route   GET /api/telegrams/
// @access  Private
const getTelegram = async (req, res) => {
  try {
    const {
      status,
      search,
      startDate,
      endDate,
      sortOrder,
      page = 1,
      limit = 9,
    } = req.query;
    let filter = {};

    if (status) {
      filter.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.tanggal = {};
      if (startDate) filter.tanggal.$gte = new Date(startDate);
      if (endDate) filter.tanggal.$lte = new Date(endDate);
    }

    // Search query
    if (search) {
      filter.$or = [
        { perihal: { $regex: search, $options: "i" } },
        { nomorSurat: { $regex: search, $options: "i" } },
        { instansiPengirim: { $regex: search, $options: "i" } },
      ];
    }

    // Sort options
    let sortOptions = {};
    sortOptions.tanggal = sortOrder === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    let telegrams;

    if (req.user.role === "admin") {
      telegrams = await Telegram.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate("instansiPenerima", "nama email profileImageUrl");
    } else {
      telegrams = await Telegram.find({
        ...filter,
        instansiPenerima: req.user._id,
      })
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate("instansiPenerima", "nama email profileImageUrl");
    }

    // Tambahkan todoChecklist ke setiap telegram
    telegrams = await Promise.all(
      telegrams.map(async (telegram) => {
        const userChecklist = telegram.todoChecklists.find(
          (tc) => tc.userId.toString() === req.user._id.toString()
        );
        const checklist = userChecklist ? userChecklist.checklist : [];
        const completedCount = checklist.filter(
          (item) => item.completed
        ).length;
        return {
          ...telegram._doc,
          todoChecklist: checklist, // Override dengan checklist user
          completedTodoCount: completedCount,
        };
      })
    );

    // Hitung total untuk pagination
    const total = await Telegram.countDocuments(
      req.user.role === "admin"
        ? filter
        : { ...filter, instansiPenerima: req.user._id }
    );
    const totalPages = Math.ceil(total / limit);

    // Hitung status telegram
    const allTelegrams = await Telegram.countDocuments(
      req.user.role === "admin" ? {} : { instansiPenerima: req.user._id }
    );

    const readTelegrams = await Telegram.countDocuments({
      ...filter,
      status: "Dibaca",
      ...(req.user.role !== "admin" && { instansiPenerima: req.user._id }),
    });

    const unreadTelegrams = await Telegram.countDocuments({
      ...filter,
      status: "Belum Dibaca",
      ...(req.user.role !== "admin" && { instansiPenerima: req.user._id }),
    });

    res.json({
      telegrams,
      totalPages,
      statusSummary: {
        all: allTelegrams,
        readTelegrams,
        unreadTelegrams,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Dapatkan data telegram berdasarkan ID
// @route   GET /api/telegrams/:id
// @access  Private
const getTelegramById = async (req, res) => {
  try {
    const telegram = await Telegram.findById(req.params.id).populate(
      "instansiPenerima",
      "nama email profileImageUrl"
    );

    if (!telegram)
      return res.status(404).json({ message: "Telegram tidak ditemukan" });

    // Find checklist for the current user or admin
    let checklist = [];
    if (req.user.role === "admin") {
      // For admin, return the first checklist as template
      const firstChecklist = telegram.todoChecklists[0];
      checklist = firstChecklist ? firstChecklist.checklist : [];
    } else {
      const userChecklist = telegram.todoChecklists.find(
        (tc) => tc.userId.toString() === req.user._id.toString()
      );
      checklist = userChecklist ? userChecklist.checklist : [];
    }

    // Add todoChecklist to the response for frontend compatibility
    const telegramWithChecklist = {
      ...telegram._doc,
      todoChecklist: checklist,
    };

    res.json(telegramWithChecklist);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Buat data telegram baru (Hanya admin)
// @route   POST /api/telegrams/
// @access  Private (Admin)
const createTelegram = async (req, res) => {
  let instansiPenerima = [];
  try {
    instansiPenerima = JSON.parse(req.body.instansiPenerima);

    const {
      instansiPengirim,
      nomorSurat,
      perihal,
      klasifikasi,
      status,
      tanggal,
      // instansiPenerima,
      // attachments,
      todoChecklist,
      progress,
    } = req.body;

    if (!Array.isArray(instansiPenerima)) {
      return res
        .status(400)
        .json({ message: "Instansi penerima harus berupa array dari user ID" });
    }

    let attachments = [];

    // ✅ Jika ada PDF
    if (req.file) {
      attachments.push({
        fileName: req.file.originalname,
        fileUrl: `/uploads/telegram/${req.file.filename}`,
      });
    }

    const telegram = await Telegram.create({
      instansiPengirim,
      nomorSurat,
      perihal,
      klasifikasi,
      status,
      tanggal,
      instansiPenerima,
      attachments,
      todoChecklists: instansiPenerima.map((userId) => ({
        userId,
        checklist: todoChecklist || [],
      })),
      progress,
    });

    res.status(201).json({ message: "Sukses membuat telegram", telegram });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update data telegram (Hanya admin)
// @route   PUT /api/telegrams/:id
// @access  Private
const updateTelegram = async (req, res) => {
  try {
    const telegram = await Telegram.findById(req.params.id);

    if (!telegram) {
      return res.status(404).json({ message: "Telegram tidak ditemukan" });
    }

    // =====================
    // UPDATE FIELD BIASA
    // =====================
    telegram.instansiPengirim =
      req.body.instansiPengirim ?? telegram.instansiPengirim;

    telegram.nomorSurat = req.body.nomorSurat ?? telegram.nomorSurat;

    telegram.perihal = req.body.perihal ?? telegram.perihal;

    telegram.klasifikasi = req.body.klasifikasi ?? telegram.klasifikasi;

    telegram.status = req.body.status ?? telegram.status;

    telegram.tanggal = req.body.tanggal
      ? new Date(req.body.tanggal)
      : telegram.tanggal;

    // =====================
    // INSTANSI PENERIMA (ARRAY)
    // =====================
    if (req.body.instansiPenerima) {
      const penerima = Array.isArray(req.body.instansiPenerima)
        ? req.body.instansiPenerima
        : [req.body.instansiPenerima];

      telegram.instansiPenerima = penerima;
    }

    // =====================
    // TODO CHECKLIST (JSON STRING) - Update for all users
    // =====================
    if (req.body.todoChecklist) {
      const checklist = JSON.parse(req.body.todoChecklist);
      telegram.todoChecklists.forEach((tc) => {
        tc.checklist = checklist;
      });
    }

    // =====================
    // PDF UPLOAD (REPLACE)
    // =====================
    if (req.file) {
      if (telegram.attachments?.length > 0) {
        const oldFilePath = path.join(
          __dirname,
          "..",
          telegram.attachments[0].fileUrl
        );

        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // 2. SIMPAN FILE BARU
      telegram.attachments = [
        {
          fileName: req.file.originalname,
          fileUrl: `/uploads/telegram/${req.file.filename}`,
        },
      ];
    }

    await telegram.save();

    res.json({
      message: "Telegram berhasil diupdate",
      telegram,
    });
  } catch (error) {
    console.error("Update Telegram Error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Hapus data telegram (Hanya admin)
// @route   DELETE /api/telegrams/:id
// @access  Private (Admin)
const deleteTelegram = async (req, res) => {
  try {
    const telegram = await Telegram.findById(req.params.id);

    if (!telegram)
      return res.status(404).json({ message: "Telegram tidak ditemukan" });

    await telegram.deleteOne();
    res.json({ message: "Berhasil menghapus telegram" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update status telegram
// @route   PUT /api/telegrams/:id/status
// @access  Private
const updateTelegramStatus = async (req, res) => {
  try {
    const telegram = await Telegram.findById(req.params.id);
    if (!telegram)
      return res.status(404).json({ message: "Telegram tidak ditemukan" });

    const instansiPenerima = telegram.instansiPenerima.some(
      (userId) => userId.toString() === req.user._id.toString()
    );

    if (!instansiPenerima && req.user.role !== "admin") {
      return res.status(403).json({ message: "Tidak memiliki izin!" });
    }

    telegram.status = req.body.status || telegram.status;

    if (telegram.status === "Dibaca") {
      if (req.user.role === "admin") {
        // For admin, mark all checklists as completed
        telegram.todoChecklists.forEach((tc) => {
          tc.checklist.forEach((item) => (item.completed = true));
        });
      } else {
        // Find checklist for this user and mark all as completed
        const userChecklist = telegram.todoChecklists.find(
          (tc) => tc.userId.toString() === req.user._id.toString()
        );
        if (userChecklist) {
          userChecklist.checklist.forEach((item) => (item.completed = true));
        }
      }
      telegram.progress = 100;
    }

    await telegram.save();
    res.json({ message: "Status telegram telah diupdate", telegram });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateTelegramChecklist = async (req, res) => {
  try {
    const { todoChecklist } = req.body;
    const telegram = await Telegram.findById(req.params.id);

    if (!telegram)
      return res.status(404).json({ message: "Telegram tidak ditemukan" });

    if (
      !telegram.instansiPenerima.includes(req.user._id) &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Tidak memiliki izin untuk update checklist" });
    }

    // Find or create checklist for this user or admin
    if (req.user.role === "admin") {
      // For admin, update all checklists
      telegram.todoChecklists.forEach((tc) => {
        tc.checklist = todoChecklist;
      });
    } else {
      let userChecklist = telegram.todoChecklists.find(
        (tc) => tc.userId.toString() === req.user._id.toString()
      );

      if (!userChecklist) {
        userChecklist = { userId: req.user._id, checklist: [] };
        telegram.todoChecklists.push(userChecklist);
      }

      userChecklist.checklist = todoChecklist;
    }

    // Auto update progres berdasarkan checklist
    let completedCount, totalItems;
    if (req.user.role === "admin") {
      // For admin, use the updated checklist
      completedCount = todoChecklist.filter((item) => item.completed).length;
      totalItems = todoChecklist.length;
    } else {
      completedCount = userChecklist.checklist.filter(
        (item) => item.completed
      ).length;
      totalItems = userChecklist.checklist.length;
    }
    telegram.progress =
      totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

    // Tandai dibaca secara otomatis jika telegram sudah di checklist
    if (telegram.progress === 100) {
      telegram.status = "Dibaca";
    } else {
      telegram.status = "Belum Dibaca";
    }

    await telegram.save();
    const updatedTelegram = await Telegram.findById(req.params.id).populate(
      "instansiPenerima",
      "nama email profileImageUrl"
    );

    res.json({
      message: "Telegram telah di update checklist",
      telegram: updatedTelegram,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Dashboard data (Hanya admin)
// @route   GET /api/telegrams/dashboard-data
// @access  Private
const getDashboardData = async (req, res) => {
  try {
    // Fetch data statistik
    const totalTelegrams = await Telegram.countDocuments();
    const readTelegrams = await Telegram.countDocuments({ status: "Dibaca" });
    const unreadTelegrams = await Telegram.countDocuments({
      status: "Belum Dibaca",
    });

    // Pastikan semua status ada
    const telegramStatuses = ["Dibaca", "Belum Dibaca"];
    const telegramDistributionRaw = await Telegram.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const telegramDistribution = telegramStatuses.reduce((acc, status) => {
      const formattedKey = status.replace(/\s+/g, ""); // Hapus spasi untuk response key
      acc[formattedKey] =
        telegramDistributionRaw.find((item) => item._id === status)?.count || 0;
      return acc;
    }, {});
    telegramDistribution["Semua"] = totalTelegrams;

    // Pastikan semua klasifikasi ada
    const telegramKlasifikasi = [
      "BIASA",
      "RAHASIA",
      "SEGERA",
      "PENTING",
      "EDARAN",
    ];
    const telegramKlasifikasiLevelsRaw = await Telegram.aggregate([
      {
        $group: {
          _id: "$klasifikasi",
          count: { $sum: 1 },
        },
      },
    ]);

    const telegramKlasifikasiLevels = telegramKlasifikasi.reduce(
      (acc, klasifikasi) => {
        acc[klasifikasi] =
          telegramKlasifikasiLevelsRaw.find((item) => item._id === klasifikasi)
            ?.count || 0;
        return acc;
      },
      {}
    );

    // Fetch 10 data telegram terbaru
    const recentTelegrams = await Telegram.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("instansiPenerima", "nama email profileImageUrl");

    res.status(200).json({
      statistics: {
        totalTelegrams,
        readTelegrams,
        unreadTelegrams,
      },
      charts: {
        telegramDistribution,
        telegramKlasifikasiLevels,
      },
      recentTelegrams,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Dashboard data (Spesifik user)
// @route   GET /api/telegrams/user-dashboard
// @access  Private
const getUserDashboardData = async (req, res) => {
  try {
    const userId = req.user._id; // Hanya fetch data untuk user yang login

    // Fetch data statistik untuk telegram yang spesifik
    const totalTelegrams = await Telegram.countDocuments({
      instansiPenerima: userId,
    });

    const readTelegrams = await Telegram.countDocuments({
      instansiPenerima: userId,
      status: "Dibaca",
    });

    const unreadTelegrams = await Telegram.countDocuments({
      instansiPenerima: userId,
      status: "Belum Dibaca",
    });

    // Distribusi telegram berdasarkan status
    const telegramStatuses = ["Dibaca", "Belum Dibaca"];
    const telegramDistributionRaw = await Telegram.aggregate([
      { $match: { instansiPenerima: userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const telegramDistribution = telegramStatuses.reduce((acc, status) => {
      const formattedKey = status.replace(/\s+/g, "");
      acc[formattedKey] =
        telegramDistributionRaw.find((item) => item._id === status)?.count || 0;
      return acc;
    }, {});
    telegramDistribution["Semua"] = totalTelegrams;

    // Telegram distribusi berdasarkan klasifikasi
    const telegramKlasifikasi = [
      "BIASA",
      "RAHASIA",
      "SEGERA",
      "PENTING",
      "EDARAN",
    ];

    const telegramKlasifikasiLevelsRaw = await Telegram.aggregate([
      { $match: { instansiPenerima: userId } },
      { $group: { _id: "$klasifikasi", count: { $sum: 1 } } },
    ]);

    const telegramKlasifikasiLevels = telegramKlasifikasi.reduce(
      (acc, klasifikasi) => {
        acc[klasifikasi] =
          telegramKlasifikasiLevelsRaw.find((item) => item._id === klasifikasi)
            ?.count || 0;
        return acc;
      },
      {}
    );

    // Fetch 10 data telegram terbaru untuk user tertentu
    const recentTelegrams = await Telegram.find({
      instansiPenerima: userId,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("instansiPenerima", "nama email profileImageUrl");

    res.status(200).json({
      statistics: {
        totalTelegrams,
        readTelegrams,
        unreadTelegrams,
      },
      charts: {
        telegramDistribution,
        telegramKlasifikasiLevels,
      },
      recentTelegrams,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getTelegram,
  getTelegramById,
  createTelegram,
  updateTelegram,
  deleteTelegram,
  updateTelegramStatus,
  updateTelegramChecklist,
  getDashboardData,
  getUserDashboardData,
};
