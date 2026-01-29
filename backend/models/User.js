const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    nama: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImageUrl: { type: String, default: null },
    role: { type: String, enum: ["admin", "opd"], default: "opd" },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, default: null },
    twoFactorTempSecret: { type: String, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);
