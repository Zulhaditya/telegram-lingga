const Telegram = require("../models/Telegram");

const fs = require("fs");
const path = require("path");

// @desc    Dapatkan semua data telegram (Admin: semua, User: hanya yang diterima)
// @route   GET /api/telegrams/
// @access  Private
const getTelegram = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};

    if (status) {
      filter.status = status;
    }

    let telegrams;

    if (req.user.role === "admin") {
      telegrams = await Telegram.find(filter).populate(
        "instansiPenerima",
        "nama email profileImageUrl"
      );
    } else {
      telegrams = await Telegram.find({
        ...filter,
        instansiPenerima: req.user._id,
      }).populate("instansiPenerima", "nama email profileImageUrl");
    }

    // Tambahkan todoChecklist ke setiap telegram
    telegrams = await Promise.all(
      telegrams.map(async (telegram) => {
        const completedCount = telegram.todoChecklist.filter(
          (item) => item.completed
        ).length;
        return { ...telegram._doc, completedTodoCount: completedCount };
      })
    );

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
    const telegrams = await Telegram.findById(req.params.id).populate(
      "instansiPenerima",
      "nama email profileImageUrl"
    );

    if (!telegrams)
      return res.status(404).json({ message: "Telegram tidak ditemukan" });

    res.json(telegrams);
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
      perihal,
      klasifikasi,
      status,
      tanggal,
      instansiPenerima,
      attachments,
      todoChecklist,
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
    // TODO CHECKLIST (JSON STRING)
    // =====================
    if (req.body.todoChecklist) {
      telegram.todoChecklist = JSON.parse(req.body.todoChecklist);
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
      telegram.todoChecklist.forEach((item) => (item.completed = true));
      telegram.progress = 100;
    }

    await telegram.save();
    res.json({ message: "Status telegram telah diupdate", telegram });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update checklist telegram
// @route   PUT /api/telegram/:id/todo
// @access  Private
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

    telegram.todoChecklist = todoChecklist;

    // Auto update progres berdasarkan checklist
    const completedCount = telegram.todoChecklist.filter(
      (item) => item.completed
    ).length;

    const totalItems = telegram.todoChecklist.length;
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
      .select(
        "instansiPengirim perihal klasifikasi status tanggal instansiPenerima createdAt"
      );

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
