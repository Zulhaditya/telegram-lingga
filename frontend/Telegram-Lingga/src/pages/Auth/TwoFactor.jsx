import React, { useEffect, useState, useContext } from "react";
import AuthLayout from "../../components/layouts/AuthLayout";
import Input from "../../components/Inputs/Input";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";

const TwoFactor = () => {
  const [qrCode, setQrCode] = useState(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("setup"); // 'setup' or 'verify-login'

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
    try {
      await axiosInstance.post(API_PATHS.AUTH.TWOFA_VERIFY_SETUP, {
        token: code,
      });
      alert("2FA berhasil diaktifkan.");
      navigate("/user/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Kode OTP tidak valid");
    }
  };

  const handleVerifyLogin = async (e) => {
    e.preventDefault();
    setError(null);
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
        if (role === "admin") navigate("/admin/dashboard");
        else navigate("/user/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Kode OTP tidak valid");
    }
  };

  return (
    <AuthLayout>
      <div className="lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-black">
          Autentikasi Dua Faktor
        </h3>
        <p className="text-xs text-slate-700 mt-[5px] mb-6">
          {mode === "setup" || mode === "setup-login"
            ? "Pindai QR berikut dengan aplikasi Authenticator, lalu masukkan kode OTP untuk mengaktifkan 2FA."
            : "Masukkan kode OTP dari aplikasi Authenticator untuk melanjutkan."}
        </p>

        {(mode === "setup" || mode === "setup-login") && qrCode && (
          <div className="mb-4">
            <img src={qrCode} alt="QR Code" className="w-48 h-48" />
          </div>
        )}

        <form
          onSubmit={
            mode === "setup" || mode === "setup-login"
              ? handleVerifyLogin
              : handleVerifyLogin
          }
        >
          <Input
            value={code}
            onChange={({ target }) => setCode(target.value)}
            label="Kode OTP"
            placeholder="Masukkan 6 digit kode"
            type="text"
          />

          {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

          <button type="submit" className="btn-primary">
            Verifikasi
          </button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default TwoFactor;
