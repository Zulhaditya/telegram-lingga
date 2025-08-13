const JWT = require("jsonwebtoken");
const User = require("../models/User");

// Middlware untuk melindungi routes
const protect = async (req, res, next) => {
    try {
        let token = req.headers.authorization;

        if (token && token.startsWith("Bearer")) {
            token = token.split(" ")[1] // Ekstrak token
            const decoded = JWT.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
            next();
        } else {
            res.status(401).json({message: "Tidak memiliki hak akses!"});
        }
    } catch(error) {
        res.status(401).json({message: "Token gagal", error: error.message});
    }
};

// Middlware untuk role admin
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({message: "Akses ditolak, akses ini hanya untuk Admin!"});
    }
};

module.exports = {protect, adminOnly};