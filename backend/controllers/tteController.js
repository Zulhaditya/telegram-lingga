const TTE = require("../models/TTE");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");

// @desc    Submit pengajuan TTE baru
// @route   POST /api/tte/submit
// @access  Private (User OPD)
const submitTTE = async (req, res) => {
  try {
    console.log("TTE Submit Request Body:", req.body);
    console.log("TTE Submit Request Files:", req.files);

    const {
      namaLengkap,
      nik,
      tempatLahir,
      tanggalLahir,
      alamat,
      nomorTelepon,
    } = req.body;
    const userId = req.user.id;

    // Validasi input
    if (
      !namaLengkap ||
      !nik ||
      !tempatLahir ||
      !tanggalLahir ||
      !alamat ||
      !nomorTelepon
    ) {
      return res
        .status(400)
        .json({ message: "Semua field biodata harus diisi" });
    }

    // Validasi file
    if (!req.files || !req.files.fotoSelfie || !req.files.suratKeterangan) {
      return res
        .status(400)
        .json({ message: "Foto selfie dan surat keterangan harus diupload" });
    }

    // Cek apakah user sudah memiliki pengajuan yang sedang diproses
    const existingTTE = await TTE.findOne({
      userId,
      status: { $in: ["pending", "approved"] },
    });

    if (existingTTE) {
      // Hapus file yang baru diupload
      if (req.files.fotoSelfie) {
        fs.unlinkSync(req.files.fotoSelfie[0].path);
      }
      if (req.files.suratKeterangan) {
        fs.unlinkSync(req.files.suratKeterangan[0].path);
      }

      return res.status(400).json({
        message: "Anda sudah memiliki pengajuan TTE yang aktif",
      });
    }

    // Cek duplikasi NIK
    const existingNIK = await TTE.findOne({ nik });
    if (existingNIK) {
      // Hapus file yang baru diupload
      if (req.files.fotoSelfie) {
        fs.unlinkSync(req.files.fotoSelfie[0].path);
      }
      if (req.files.suratKeterangan) {
        fs.unlinkSync(req.files.suratKeterangan[0].path);
      }

      return res.status(400).json({
        message: "NIK sudah terdaftar dalam sistem",
      });
    }

    // Buat data TTE baru
    const newTTE = await TTE.create({
      userId,
      namaLengkap,
      nik,
      tempatLahir,
      tanggalLahir: new Date(tanggalLahir),
      alamat,
      nomorTelepon,
      fotoSelfie: req.files.fotoSelfie[0].path.replace(/\\/g, "/"),
      suratKeterangan: req.files.suratKeterangan[0].path.replace(/\\/g, "/"),
    });

    res.status(201).json({
      message: "Pengajuan TTE berhasil disubmit",
      tte: newTTE,
    });
  } catch (error) {
    // Hapus file jika terjadi error
    if (req.files) {
      if (req.files.fotoSelfie) {
        req.files.fotoSelfie.forEach((file) => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      if (req.files.suratKeterangan) {
        req.files.suratKeterangan.forEach((file) => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
    }
    console.error("TTE Submit Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get TTE user yang login
// @route   GET /api/tte/my-tte
// @access  Private (User)
const getMyTTE = async (req, res) => {
  try {
    const userId = req.user.id;

    const tte = await TTE.findOne({ userId })
      .populate("userId", "nama email profileImageUrl")
      .populate("approvedBy", "nama email");

    if (!tte) {
      return res.status(404).json({ message: "Data TTE tidak ditemukan" });
    }

    res.status(200).json({ tte });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get semua TTE (untuk admin)
// @route   GET /api/tte/all
// @access  Private (Admin)
const getAllTTE = async (req, res) => {
  try {
    const { status, search } = req.query;
    let filter = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { namaLengkap: { $regex: search, $options: "i" } },
        { nik: { $regex: search, $options: "i" } },
        { nomorTelepon: { $regex: search, $options: "i" } },
      ];
    }

    const tteList = await TTE.find(filter)
      .populate("userId", "nama email profileImageUrl")
      .populate("approvedBy", "nama email")
      .sort({ createdAt: -1 });

    res.status(200).json({ count: tteList.length, tte: tteList });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get TTE detail by ID
// @route   GET /api/tte/:id
// @access  Private (Admin & User yang bersangkutan)
const getTTEById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const user = await User.findById(userId);

    const tte = await TTE.findById(id)
      .populate("userId", "nama email profileImageUrl")
      .populate("approvedBy", "nama email");

    if (!tte) {
      return res.status(404).json({ message: "Data TTE tidak ditemukan" });
    }

    // Check authorization: hanya admin atau user yang bersangkutan
    if (user.role !== "admin" && tte.userId._id.toString() !== userId) {
      return res.status(403).json({ message: "Anda tidak memiliki akses" });
    }

    res.status(200).json({ tte });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Approve TTE dengan upload signature
// @route   PUT /api/tte/:id/approve
// @access  Private (Admin)
const approveTTE = async (req, res) => {
  try {
    const { id } = req.params;
    const { tteSignatureName } = req.body;
    const adminId = req.user.id;

    // Validasi signature file
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "File signature gambar harus diupload" });
    }

    if (!tteSignatureName) {
      return res.status(400).json({ message: "Nama signature harus diisi" });
    }

    const tte = await TTE.findById(id);

    if (!tte) {
      // Hapus file yang diupload
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: "Data TTE tidak ditemukan" });
    }

    // Update TTE dengan status approved dan signature
    tte.status = "approved";
    tte.tteSignature = req.file.path.replace(/\\/g, "/");
    tte.tteSignatureName = tteSignatureName;
    tte.approvedBy = adminId;
    tte.approvedAt = new Date();

    await tte.save();

    // Populate untuk response
    await tte.populate("userId", "nama email profileImageUrl");
    await tte.populate("approvedBy", "nama email");

    res.status(200).json({
      message: "TTE berhasil disetujui",
      tte,
    });
  } catch (error) {
    // Hapus file jika terjadi error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Reject TTE
// @route   PUT /api/tte/:id/reject
// @access  Private (Admin)
const rejectTTE = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ message: "Alasan penolakan harus diisi" });
    }

    const tte = await TTE.findById(id);

    if (!tte) {
      return res.status(404).json({ message: "Data TTE tidak ditemukan" });
    }

    // Jangan hapus file, hanya update status
    tte.status = "rejected";
    tte.rejectionReason = rejectionReason;

    await tte.save();

    // Populate untuk response
    await tte.populate("userId", "nama email profileImageUrl");

    res.status(200).json({
      message: "Pengajuan TTE ditolak",
      tte,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete TTE (hanya untuk pending)
// @route   DELETE /api/tte/:id
// @access  Private (Admin & User yang bersangkutan)
const deleteTTE = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const user = await User.findById(userId);

    const tte = await TTE.findById(id);

    if (!tte) {
      return res.status(404).json({ message: "Data TTE tidak ditemukan" });
    }

    // Cek authorization
    if (user.role !== "admin" && tte.userId.toString() !== userId) {
      return res.status(403).json({ message: "Anda tidak memiliki akses" });
    }

    // Hanya bisa hapus jika status pending
    if (tte.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Hanya pengajuan pending yang bisa dihapus" });
    }

    // Hapus file
    if (fs.existsSync(tte.fotoSelfie)) {
      fs.unlinkSync(tte.fotoSelfie);
    }
    if (fs.existsSync(tte.suratKeterangan)) {
      fs.unlinkSync(tte.suratKeterangan);
    }

    await TTE.findByIdAndDelete(id);

    res.status(200).json({ message: "Pengajuan TTE berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get TTE statistics (untuk admin dashboard)
// @route   GET /api/tte/stats
// @access  Private (Admin)
const getTTEStats = async (req, res) => {
  try {
    const totalTTE = await TTE.countDocuments();
    const pendingTTE = await TTE.countDocuments({ status: "pending" });
    const approvedTTE = await TTE.countDocuments({ status: "approved" });
    const rejectedTTE = await TTE.countDocuments({ status: "rejected" });

    res.status(200).json({
      totalTTE,
      pendingTTE,
      approvedTTE,
      rejectedTTE,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  submitTTE,
  getMyTTE,
  getAllTTE,
  getTTEById,
  approveTTE,
  rejectTTE,
  deleteTTE,
  getTTEStats,
};
