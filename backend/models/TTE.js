const mongoose = require("mongoose");

const TTESchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Biodata dari KTP
    namaLengkap: {
      type: String,
      required: true,
    },
    nik: {
      type: String,
      required: true,
    },
    tempatLahir: {
      type: String,
      required: true,
    },
    tanggalLahir: {
      type: Date,
      required: true,
    },
    alamat: {
      type: String,
      required: true,
    },
    nomorTelepon: {
      type: String,
      required: true,
    },
    // Informasi kepegawaian
    namaJabatan: {
      type: String,
      required: true,
    },
    pangkatGolongan: {
      type: String,
      required: true,
    },
    nip: {
      type: String,
      required: true,
    },
    asalInstansi: {
      type: String,
      required: true,
    },
    // File uploads
    fotoSelfie: {
      type: String,
      required: true,
    },
    suratKeterangan: {
      type: String,
      required: true,
    },
    // TTE Signature (diisi admin saat approve)
    tteSignature: {
      type: String,
      default: null,
    },
    tteSignatureName: {
      type: String,
      default: null,
    },
    // TTE Credentials (diisi admin saat approve)
    tteEmail: {
      type: String,
      default: null,
    },
    ttePassword: {
      type: String,
      default: null,
    },
    ttePassphrase: {
      type: String,
      default: null,
    },
    // Status pengajuan
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    // Admin approval info
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("TTE", TTESchema);
