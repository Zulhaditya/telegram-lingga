import React, { useEffect, useState, useContext } from "react";
import AuthLayout from "../../components/layouts/AuthLayout";
import Input from "../../components/Inputs/Input";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import {
  FiShield,
  FiLoader,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";

const TwoFactor = () => {
  const [qrCode, setQrCode] = useState(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [mode, setMode] = useState("setup"); // 'setup' or 'verify-login'
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { updateUser } = useContext(UserContext);

  useEffect(() => {
    const tempRaw = localStorage.getItem("temp2faUser");
    const token = localStorage.getItem("token");

    if (tempRaw) {
      const temp = JSON.parse(tempRaw);
      // jika user sudah enable 2FA -> hanya verifikasi OTP
      if (temp.twoFactorEnabled) {
        setMode("verify-login");
      } else {
        // belum enabled -> tampilkan QR yang dikembalikan dari login
        setMode("setup-login");
        if (temp.qrCode) setQrCode(temp.qrCode);
      }
      return;
    }

    if (token) {
      // user sudah login (protected) ingin setup 2FA dari dalam aplikasi
      setMode("setup");
      axiosInstance
        .get(API_PATHS.AUTH.TWOFA_SETUP)
        .then((res) => {
          setQrCode(res.data.qrCode);
        })
        .catch((err) => {
          console.error(err);
          setError("Gagal memuat QR code");
        });
    } else {
      // no token and no temp => redirect to login
      navigate("/login");
    }
  }, [navigate]);

  const handleVerifySetup = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await axiosInstance.post(API_PATHS.AUTH.TWOFA_VERIFY_SETUP, {
        token: code,
      });
      setSuccess("2FA berhasil diaktifkan!");
      setTimeout(() => {
        navigate("/user/dashboard");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Kode OTP tidak valid");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const temp = JSON.parse(localStorage.getItem("temp2faUser"));
      if (!temp || !temp._id) return setError("Data user tidak ditemukan");

      const res = await axiosInstance.post(API_PATHS.AUTH.TWOFA_VERIFY, {
        userId: temp._id,
        token: code,
      });

      const { token: jwt, role } = res.data;
      if (jwt) {
        localStorage.setItem("token", jwt);
        localStorage.removeItem("temp2faUser");
        updateUser(res.data);
        setSuccess("Login berhasil!");
        setTimeout(() => {
          if (role === "admin") navigate("/admin/dashboard");
          else navigate("/user/dashboard");
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Kode OTP tidak valid");
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
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center shadow-lg transform hover:scale-110 transition duration-300">
              <FiShield className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                Autentikasi Dua Faktor
              </h1>
              <p className="text-xs text-purple-100">
                Telegram Sanapati Kabupaten Lingga
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-200 mt-4 leading-relaxed">
            {mode === "setup" || mode === "setup-login"
              ? "Pindai kode QR berikut menggunakan aplikasi Authenticator (Google Authenticator, Microsoft Authenticator, atau Authy), kemudian masukkan kode OTP 6 digit untuk mengaktifkan keamanan dua faktor."
              : "Masukkan kode OTP 6 digit dari aplikasi Authenticator Anda untuk melanjutkan login."}
          </p>
        </div>

        {/* QR Code Section */}
        {(mode === "setup" || mode === "setup-login") && qrCode && (
          <div className="mb-8 p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-center shadow-lg animate-slide-up">
            <p className="text-sm font-semibold text-white mb-4">
              Pindai QR Code ini:
            </p>
            <div className="inline-block p-4 bg-white rounded-lg border-2 border-purple-300 shadow-lg">
              <img src={qrCode} alt="QR Code" className="w-48 h-48" />
            </div>
            <p className="text-xs text-purple-100 mt-4">
              Jika QR code tidak terbaca, masukkan kode manual di aplikasi
              Authenticator Anda.
            </p>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={
            mode === "verify-login" ? handleVerifyLogin : handleVerifySetup
          }
          className="space-y-5 p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl animate-slide-up"
        >
          {/* OTP Input */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Kode OTP (6 Digit)
            </label>
            <input
              value={code}
              onChange={({ target }) => {
                // Hanya accept angka
                const val = target.value.replace(/\D/g, "").slice(0, 6);
                setCode(val);
              }}
              placeholder="000000"
              type="text"
              maxLength="6"
              inputMode="numeric"
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition text-center text-2xl tracking-widest font-mono backdrop-blur"
            />
            <p className="text-xs text-purple-100 mt-1">
              Masukkan 6 digit kode dari aplikasi Authenticator Anda
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-4 flex gap-3 backdrop-blur">
              <FiAlertCircle className="text-red-300 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-100">
                  Verifikasi Gagal
                </p>
                <p className="text-sm text-red-100">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-500/20 border border-green-400/50 rounded-lg p-4 flex gap-3 backdrop-blur animate-fade-in">
              <FiCheckCircle className="text-green-300 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-100 font-semibold">{success}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 rounded-lg transition duration-300 flex items-center justify-center gap-2 shadow-lg transform hover:scale-105 active:scale-95"
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin" />
                Sedang Verifikasi...
              </>
            ) : (
              "Verifikasi"
            )}
          </button>
        </form>

        {/* Security Info */}
        <div
          className="mt-8 p-4 bg-purple-500/20 border border-purple-400/50 rounded-lg backdrop-blur animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <p className="text-xs text-purple-100">
            <span className="font-semibold text-purple-200">🔒 Keamanan:</span>{" "}
            Autentikasi dua faktor menambah lapisan keamanan pada akun Anda.
            Pastikan Anda menyimpan aplikasi Authenticator dengan aman.
          </p>
        </div>

        {/* Back to Login Link */}
        {mode === "verify-login" && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("temp2faUser");
                navigate("/login");
              }}
              className="text-sm text-purple-300 hover:text-purple-200 transition font-medium"
            >
              ← Kembali ke Login
            </button>
          </div>
        )}

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

export default TwoFactor;
