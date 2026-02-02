import React, { useContext, useState } from "react";
import AuthLayout from "../../components/layouts/AuthLayout";
import { validateEmail } from "../../utils/helper";
import ProfilePhotoSelector from "../../components/Inputs/ProfilePhotoSelector";
import Input from "../../components/Inputs/Input";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext";
import uploadImage from "../../utils/uploadImage";
import {
  FiLock,
  FiMail,
  FiAlertCircle,
  FiLoader,
  FiUser,
  FiKey,
} from "react-icons/fi";

const Register = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminInviteToken, setAdminInviteToken] = useState("");

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Atur register form
  const handleRegister = async (e) => {
    e.preventDefault();

    let profileImageUrl = "";

    if (!fullName) {
      setError("Nama instansi masih kosong");
      return;
    }

    if (!validateEmail(email)) {
      setError("Email instansi anda salah.");
      return;
    }

    if (!password) {
      setError("Password instansi anda salah");
      return;
    }

    setError("");
    setLoading(true);

    // Register API
    try {
      // Upload gambar jika ada
      if (profilePic) {
        const imgUploadRes = await uploadImage(profilePic);
        profileImageUrl = imgUploadRes.imageUrl || "";
      }
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        nama: fullName,
        email,
        password,
        profileImageUrl,
        adminInviteToken,
      });

      const { token, role } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        updateUser(response.data);

        // Redirect berdasarkan role
        if (role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/user/dashboard");
        }
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Terjadi kesalahan. Silahkan coba lagi nanti");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full flex flex-col justify-center mt-10">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-lg transform hover:scale-110 transition duration-300">
              <FiUser className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                Pendaftaran Akun
              </h1>
              <p className="text-xs text-green-100">
                Telegram Sanapati Kabupaten Lingga
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-200 mt-4 leading-relaxed">
            Daftarkan instansi Anda untuk mendapatkan akses ke platform Telegram
            Sanapati dan layanan TTE.
          </p>
        </div>

        {/* Registration Form */}
        <form
          onSubmit={handleRegister}
          className="space-y-6 p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-slide-up"
        >
          {/* Profile Photo Section */}
          <div className="bg-white/10 p-6 rounded-xl border border-white/20 backdrop-blur">
            <label className="block text-sm font-semibold text-white mb-4">
              📷 Foto Logo Instansi
            </label>
            <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />
            <p className="text-xs text-green-100 mt-2">
              Format: JPG, PNG (Ukuran max 5MB)
            </p>
          </div>

          {/* Form Fields Grid */}
          <div className="space-y-5">
            {/* Nama Instansi */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                <div className="flex items-center gap-2">
                  <FiUser className="text-green-300" />
                  Nama Instansi
                </div>
              </label>
              <input
                value={fullName}
                onChange={({ target }) => setFullName(target.value)}
                placeholder="Contoh: Dinas Komunikasi dan Informatika"
                type="text"
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition backdrop-blur"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                <div className="flex items-center gap-2">
                  <FiMail className="text-green-300" />
                  Email Instansi
                </div>
              </label>
              <input
                value={email}
                onChange={({ target }) => setEmail(target.value)}
                placeholder="nama@linggakab.go.id"
                type="email"
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition backdrop-blur"
              />
              <p className="text-xs text-green-100 mt-1">
                Gunakan domain resmi instansi Anda
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                <div className="flex items-center gap-2">
                  <FiLock className="text-green-300" />
                  Password
                </div>
              </label>
              <input
                value={password}
                onChange={({ target }) => setPassword(target.value)}
                placeholder="Minimal 8 karakter"
                type="password"
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition backdrop-blur"
              />
            </div>

            {/* Admin Invite Token */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                <div className="flex items-center gap-2">
                  <FiKey className="text-green-300" />
                  Kode Invite Admin{" "}
                  <span className="text-gray-300 font-normal">(Opsional)</span>
                </div>
              </label>
              <input
                value={adminInviteToken}
                onChange={({ target }) => setAdminInviteToken(target.value)}
                placeholder="Masukkan kode jika Anda diundang"
                type="text"
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition backdrop-blur"
              />
              <p className="text-xs text-green-100 mt-1">
                Hanya untuk pengguna yang diundang admin
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-4 flex gap-3 backdrop-blur">
              <FiAlertCircle className="text-red-300 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-100">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 rounded-lg transition duration-300 flex items-center justify-center gap-2 shadow-lg transform hover:scale-105 active:scale-95"
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin" />
                Sedang Mendaftar...
              </>
            ) : (
              "Daftar Sekarang"
            )}
          </button>

          {/* Divider */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/10 text-gray-200 backdrop-blur">
                atau
              </span>
            </div>
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-200">
            Sudah punya akun?{" "}
            <Link
              className="font-semibold text-green-300 hover:text-green-200 transition"
              to="/login"
            >
              Login di sini
            </Link>
          </p>
        </form>

        {/* Info Box */}
        <div
          className="mt-8 p-4 bg-green-500/20 border border-green-400/50 rounded-lg backdrop-blur animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <p className="text-xs text-green-100">
            <span className="font-semibold text-green-200">✓ Keamanan:</span>{" "}
            Data Anda akan dienkripsi dan disimpan dengan aman sesuai standar
            keamanan data pemerintah.
          </p>
        </div>

        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fade-in {
            animation: fadeIn 0.6s ease-out forwards;
          }
          
          .animate-slide-up {
            animation: slideUp 0.6s ease-out forwards;
          }
        `}</style>
      </div>
    </AuthLayout>
  );
};

export default Register;
