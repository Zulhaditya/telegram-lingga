const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

// const telegramSchema = new mongoose.Schema(
//   {
//     instansiPengirim: { type: String, required: true },
//     perihal: { type: String },
//     klasifikasi: {
//       type: String,
//       enum: ["BIASA", "RAHASIA", "SEGERA", "PENTING", "EDARAN"],
//       default: "BIASA",
//     },
//     status: {
//       type: String,
//       enum: ["Dibaca", "Belum Dibaca"],
//       default: "Belum Dibaca",
//     },
//     tanggal: { type: Date, required: true },
//     instansiPenerima: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//     attachments: [{ type: String }],
//     todoChecklist: [todoSchema],
//     progress: { type: Number, default: 0 },
//   },
//   { timestamps: true }
// );

const telegramSchema = new mongoose.Schema(
  {
    instansiPengirim: {
      type: String,
      required: true,
      trim: true,
    },

    nomorSurat: {
      type: String,
      required: true,
      trim: true,
    },

    perihal: {
      type: String,
      trim: true,
    },

    klasifikasi: {
      type: String,
      enum: ["BIASA", "RAHASIA", "SEGERA", "PENTING", "EDARAN"],
      default: "BIASA",
    },

    status: {
      type: String,
      enum: ["Dibaca", "Belum Dibaca"],
      default: "Belum Dibaca",
    },

    tanggal: {
      type: Date,
      required: true,
    },

    instansiPenerima: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    attachments: [
      {
        fileName: {
          type: String,
          required: true,
        },
        fileUrl: {
          type: String,
          required: true,
        },
      },
    ],

    todoChecklist: [todoSchema],

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Telegram", telegramSchema);
