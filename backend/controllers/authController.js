const User = require("../models/User");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");

// Generate Token JWT
const generateToken = (userId) => {
    return JWT.sign({id: userId}, process.env.JWT_SECRET, {expiresIn: "7d"});
};

// @desc    Registrasi user baru
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { nama, email, password, profileImageUrl, adminInviteToken } = req.body;

        // Cek jika user sudah terdaftar
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({message: "User sudah terdaftar"});
        }

        // Tentukan role dari user: Admin jika token yang diberikan benar, jika salah maka OPD
        let role = "opd";
        if (
            adminInviteToken &&
            adminInviteToken == process.env.ADMIN_INVITE_TOKEN
        ) {
            role = "admin";
        }

        // Hasing password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Buat user baru
        const user = await User.create({
            nama,
            email,
            password: hashedPassword,
            profileImageUrl,
            role,
        });

        // Kembalikan data user dengan token JWT
        res.status(201).json({
            _id: user._id,
            nama: user.nama,
            emai: user.email,
            role: user.role,
            profileImageUrl: user.profileImageUrl,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Email atau password tidak valid" });
        }

        // Bandingkan password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Email atau password tidak valid " });
        }

        // Kembalikan data user beserta token JWT
        res.json({
            _id: user._id,
            nama: user.nama,
            email: user.email,
            role: user.role,
            profileImageUrl: user.profileImageUrl,
            token: generateToken(user._id),
        });

    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
};

// @desc    Dapatkan data user
// @route   GET /api/auth/profile
// @access  Private (membutuhkan token JWT)
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
};

// @desc    Update data user
// @route   PUT /api/auth/profile
// @access  Private (membutuhkan token JWT)
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        user.nama = req.body.nama || user.nama;
        user.email = req.body.email || user.email;

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            nama: updatedUser.nama,
            email: updatedUser.email,
            role: updatedUser.role,
            token: generateToken(updatedUser._id),
        });
    } catch (error) {
        res.status(500).json({message: "Server error", error: error.message});
    }
};

module.exports = {registerUser, loginUser, getUserProfile, updateUserProfile};