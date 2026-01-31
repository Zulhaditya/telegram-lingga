require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const telegramRoutes = require("./routes/telegramRoutes");
const reportRoutes = require("./routes/reportRoutes");
const tteRoutes = require("./routes/tteRoutes");

const app = express();

// Middleware untuk handle CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Koneksi ke Database
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/telegrams", telegramRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/tte", tteRoutes);

// Serve folder upload
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Mulai Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));
