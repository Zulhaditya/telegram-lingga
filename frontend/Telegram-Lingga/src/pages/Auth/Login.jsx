import React, { useContext, useState } from "react";
import AuthLayout from "../../components/layouts/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/Input";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext";
import { FiLock, FiMail, FiAlertCircle, FiLoader } from "react-icons/fi";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { updateUser } = useContext(UserContext);

  const navigate = useNavigate();

  // Atur login form
  const handleLogin = async (e) => {
    e.preventDefault();

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

    // Login API
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password,
      });

      const { token, role, twoFactorRequired, twoFactorEnabled, _id, qrCode } =
        response.data;

      if (twoFactorRequired) {
        // Simpan data sementara untuk proses 2FA login (sertakan apakah sudah enable & qr jika ada)
        localStorage.setItem(
          "temp2faUser",
          JSON.stringify({ _id, email, twoFactorEnabled, qrCode }),
        );
        navigate("/2fa");
        return;
      }

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
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg transform hover:scale-110 transition duration-300">
              <FiLock className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                Portal Login
              </h1>
              <p className="text-xs text-blue-100">
                Telegram Sanapati Kabupaten Lingga
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-200 mt-4 leading-relaxed">
            Masukkan kredensial akun instansi Anda untuk mengakses platform
            Telegram Sanapati dan layanan TTE (Tanda Tangan Elektronik).
          </p>
        </div>

        {/* Form Card with Glass Morphism */}
        <form
          onSubmit={handleLogin}
          className="space-y-5 p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-slide-up"
        >
          {/* Email Input */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              <div className="flex items-center gap-2">
                <FiMail className="text-blue-300" />
                Email Instansi
              </div>
            </label>
            <input
              value={email}
              onChange={({ target }) => setEmail(target.value)}
              placeholder="nama@linggakab.go.id"
              type="email"
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition backdrop-blur"
            />
            <p className="text-xs text-blue-100 mt-1">
              Gunakan email resmi instansi Anda
            </p>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              <div className="flex items-center gap-2">
                <FiLock className="text-blue-300" />
                Password
              </div>
            </label>
            <input
              value={password}
              onChange={({ target }) => setPassword(target.value)}
              placeholder="Masukkan password Anda"
              type="password"
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition backdrop-blur"
            />
            <p className="text-xs text-blue-100 mt-1">Minimal 8 karakter</p>
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
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 rounded-lg transition duration-300 flex items-center justify-center gap-2 shadow-lg transform hover:scale-105 active:scale-95"
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin" />
                Sedang Login...
              </>
            ) : (
              "Masuk"
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

          {/* Register Link */}
          <p className="text-center text-sm text-gray-200">
            Belum punya akun?{" "}
            <Link
              className="font-semibold text-blue-300 hover:text-blue-200 transition"
              to="/register"
            >
              Daftar di sini
            </Link>
          </p>
        </form>

        {/* Info Box */}
        <div
          className="mt-8 p-4 bg-blue-500/20 border border-blue-400/50 rounded-lg backdrop-blur animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <p className="text-xs text-blue-100">
            <span className="font-semibold text-blue-200">💡 Tips:</span>{" "}
            Pastikan Anda menggunakan email resmi instansi Anda yang terdaftar
            di sistem.
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

export default Login;
