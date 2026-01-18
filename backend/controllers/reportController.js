const Telegram = require("../models/Telegram");
const User = require("../models/User");
const excelJS = require("exceljs");

// @desc    Export semua data telegram ke excel
// @route   GET /api/reports/export/telegrams
// @access  Private (Admin)
const exportTelegramsReport = async (req, res) => {
  try {
    const { status, search, startDate, endDate, sortOrder } = req.query;

    // Build query object
    let query = {};

    // Filter by status
    if (status && status !== "") {
      query.status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.tanggal = {};
      if (startDate) {
        query.tanggal.$gte = new Date(startDate);
      }
      if (endDate) {
        query.tanggal.$lte = new Date(endDate);
      }
    }

    // Search filter
    if (search && search.trim() !== "") {
      query.$or = [
        { perihal: { $regex: search, $options: "i" } },
        { nomorSurat: { $regex: search, $options: "i" } },
        { instansiPengirim: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    let sort = {};
    if (sortOrder === "asc") {
      sort.tanggal = 1;
    } else {
      sort.tanggal = -1; // default desc
    }

    const telegrams = await Telegram.find(query)
      .populate("instansiPenerima", "nama email")
      .sort(sort);

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet(
      "Laporan Telegram Sanapati Kab. Lingga"
    );

    worksheet.columns = [
      { header: "Instansi Pengirim", key: "instansiPengirim", width: 30 },
      { header: "Instansi Penerima", key: "instansiPenerima", width: 30 },
      { header: "Perihal", key: "perihal", width: 30 },
      { header: "Klasifikasi Surat", key: "klasifikasi", width: 25 },
      { header: "Tanggal Surat", key: "tanggal", width: 25 },
      { header: "Status", key: "status", width: 25 },
    ];

    telegrams.forEach((telegram) => {
      const instansiPenerima = telegram.instansiPenerima
        .map((user) => `${user.nama} (${user.email})`)
        .join(", ");

      worksheet.addRow({
        instansiPengirim: telegram.instansiPengirim,
        instansiPenerima: instansiPenerima || "Belum ada penerima",
        perihal: telegram.perihal,
        klasifikasi: telegram.klasifikasi,
        tanggal: telegram.tanggal,
        status: telegram.status,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="laporan_telegram.xlsx"'
    );

    return workbook.xlsx.write(res).then(() => {
      res.end();
    });
  } catch (error) {
    res.status(500).json({
      message: "Error saat export data telegram",
      error: error.message,
    });
  }
};

// @desc    Export data telegram per user/instansi ke excel
// @route   GET /api/reports/export/users
// @access  Private (Admin)
const exportUsersReport = async (req, res) => {
  try {
    const users = await User.find().select("nama email _id").lean();
    const userTelegrams = await Telegram.find().populate(
      "instansiPenerima",
      "nama email _id"
    );

    const userTelegramMap = {};
    users.forEach((user) => {
      userTelegramMap[user._id] = {
        nama: user.nama,
        email: user.email,
        telegramCount: 0,
        readTelegrams: 0,
        unreadTelegrams: 0,
      };
    });

    userTelegrams.forEach((telegram) => {
      if (telegram.instansiPenerima) {
        telegram.instansiPenerima.forEach((assignedUser) => {
          if (userTelegramMap[assignedUser._id]) {
            userTelegramMap[assignedUser._id].telegramCount += 1;
            if (telegram.status === "Dibaca") {
              userTelegramMap[assignedUser._id].readTelegrams += 1;
            } else if (telegram.status === "Belum Dibaca") {
              userTelegramMap[assignedUser._id].unreadTelegrams += 1;
            }
          }
        });
      }
    });

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Laporan Telegram User");

    worksheet.columns = [
      { header: "Nama Instansi", key: "nama", width: 30 },
      { header: "Email", key: "email", width: 40 },
      {
        header: "Total telegram yang diterima",
        key: "telegramCount",
        width: 20,
      },
      { header: "Total telegram yang dibaca", key: "readTelegrams", width: 20 },
      {
        header: "Total telegram yang belum dibaca",
        key: "unreadTelegrams",
        width: 20,
      },
    ];

    Object.values(userTelegramMap).forEach((user) => {
      worksheet.addRow(user);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="laporan_instansi.xlsx"'
    );

    return workbook.xlsx.write(res).then(() => {
      res.end();
    });
  } catch (error) {
    res.status(500).json({
      message: "Error saat export data telegram",
      error: error.message,
    });
  }
};

module.exports = {
  exportTelegramsReport,
  exportUsersReport,
};
