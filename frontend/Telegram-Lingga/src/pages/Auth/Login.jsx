import React, { useContext, useState } from "react";
import AuthLayout from "../../components/layouts/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/Input";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

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
    }
  };

  return (
    <AuthLayout>
      <div className="lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-black">Selamat Datang</h3>
        <p className="text-xs text-slate-700 mt-[5px] mb-6">
          Masukkan data instansi untuk Login
        </p>

        <form onSubmit={handleLogin}>
          <Input
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            label="Email"
            placeholder="diskominfo@linggakab.go.id"
            type="text"
          />

          <Input
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            label="Password"
            placeholder="Minimal 8 Karakter"
            type="password"
          />

          {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

          <button type="submit" className="btn-primary">
            Masuk
          </button>

          <p className="text-[13px] text-slate-800 mt-3">
            Belum punya akun?{" "}
            <Link className="font-medium text-primary underline" to="/register">
              Daftar
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Login;
