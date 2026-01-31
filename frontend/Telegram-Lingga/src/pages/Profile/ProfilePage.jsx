import React, { useContext, useEffect, useState } from "react";
import { useUserAuth } from "../../hooks/useUserAuth";
import { UserContext } from "../../context/userContext";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import Input from "../../components/Inputs/Input.jsx";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { FaCamera, FaLock, FaUser } from "react-icons/fa";
import { MdEdit, MdSave } from "react-icons/md";
import toast from "react-hot-toast";

const ProfilePage = () => {
  useUserAuth();

  const { user, setUser, updateUser } = useContext(UserContext);

  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); // profile, password, security
  const [loading, setLoading] = useState(false);

  // Profile form state
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    profileImageUrl: "",
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Security settings state
  const [securityData, setSecurityData] = useState({
    twoFactorEnabled: false,
    password: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nama: user.nama || "",
        email: user.email || "",
        profileImageUrl: user.profileImageUrl || "",
      });
      // Ensure twoFactorEnabled is boolean, not undefined
      setSecurityData((prev) => ({
        ...prev,
        twoFactorEnabled: Boolean(user.twoFactorEnabled),
      }));
    }
  }, [user]);

  const handleInputChange = (e, field) => {
    const value = e.target ? e.target.value : e;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordChange = (e, field) => {
    const value = e.target ? e.target.value : e;
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSecurityChange = (e, field) => {
    const value = e.target ? e.target.value : e;
    setSecurityData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi file
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (JPG, PNG, dll)");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Ukuran gambar maksimal 5MB");
      return;
    }

    const formDataImage = new FormData();
    formDataImage.append("image", file);

    try {
      setLoading(true);
      const response = await axiosInstance.post(
        API_PATHS.IMAGE.UPLOAD_IMAGE,
        formDataImage,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setFormData((prev) => ({
        ...prev,
        profileImageUrl: response.data.imageUrl,
      }));
      toast.success("Foto profil berhasil diupload");
    } catch (error) {
      console.error("Error uploading image:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal mengupload foto profil";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      // Validasi input
      if (!formData.nama || !formData.nama.trim()) {
        toast.error("Nama lengkap tidak boleh kosong");
        return;
      }

      if (!formData.email || !formData.email.trim()) {
        toast.error("Email tidak boleh kosong");
        return;
      }

      // Validasi format email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Format email tidak valid");
        return;
      }

      setLoading(true);

      const response = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, {
        nama: formData.nama.trim(),
        email: formData.email.trim(),
        profileImageUrl: formData.profileImageUrl,
      });

      // Update user context dengan data yang baru dari server
      updateUser(response.data);
      setIsEditMode(false);

      toast.success("Profil berhasil diperbarui");
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal memperbarui profil";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!passwordData.currentPassword || !passwordData.newPassword) {
        toast.error("Semua field password harus diisi");
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error("Password baru dan konfirmasi tidak cocok");
        return;
      }

      if (passwordData.newPassword.length < 6) {
        toast.error("Password baru minimal 6 karakter");
        return;
      }

      if (passwordData.newPassword === passwordData.currentPassword) {
        toast.error("Password baru harus berbeda dengan password saat ini");
        return;
      }

      setLoading(true);

      await axiosInstance.post(API_PATHS.AUTH.CHANGE_PASSWORD, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password berhasil diubah");
    } catch (error) {
      console.error("Error changing password:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal mengubah password";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    try {
      if (!securityData.password) {
        toast.error("Password diperlukan untuk mengubah pengaturan 2FA");
        return;
      }

      setLoading(true);

      const response = await axiosInstance.post(API_PATHS.AUTH.TWOFA_TOGGLE, {
        password: securityData.password,
      });

      // Update user dengan data terbaru dari server
      // Gunakan setUser untuk memastikan state sync dengan user context
      setUser((prev) => ({
        ...prev,
        twoFactorEnabled: response.data.twoFactorEnabled,
      }));

      setSecurityData((prev) => ({
        ...prev,
        password: "",
        twoFactorEnabled: response.data.twoFactorEnabled,
      }));

      toast.success(response.data.message);
    } catch (error) {
      console.error("Error toggling 2FA:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal mengubah pengaturan 2FA";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto">
          {/* Tabs Navigation */}
          <div className="flex gap-4 mb-8 border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab("profile");
                setIsEditMode(false);
              }}
              className={`pb-4 px-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === "profile"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <FaUser size={16} />
                Profil
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab("password");
              }}
              className={`pb-4 px-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === "password"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <FaLock size={16} />
                Ganti Password
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab("security");
              }}
              className={`pb-4 px-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === "security"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <FaLock size={16} />
                Keamanan
              </div>
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="card space-y-6">
              {/* Profile Image Section */}
              <div className="flex flex-col items-center gap-4 pb-6 border-b border-gray-200">
                <div className="relative">
                  <img
                    src={
                      formData.profileImageUrl ||
                      "https://via.placeholder.com/120"
                    }
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  />
                  <label
                    htmlFor="profile-image"
                    className="absolute bottom-0 right-0 bg-primary text-white p-3 rounded-full cursor-pointer hover:bg-blue-600 transition-colors shadow-lg"
                  >
                    <FaCamera size={18} />
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={loading}
                    />
                  </label>
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {user?.nama}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {user?.role === "admin" ? "Administrator" : "OPD"}
                  </p>
                </div>
              </div>

              {/* Profile Form */}
              {!isEditMode ? (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Lengkap
                      </label>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-gray-900 font-medium">
                          {formData.nama}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-gray-900 font-medium">
                          {formData.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-900 font-medium capitalize">
                        {user?.role === "admin"
                          ? "Administrator"
                          : "OPD (Organisasi Perangkat Daerah)"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsEditMode(true)}
                    className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <MdEdit size={18} />
                    Edit Profil
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={formData.nama}
                        onChange={(e) => handleInputChange(e, "nama")}
                        placeholder="Masukkan nama lengkap"
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange(e, "email")}
                        placeholder="Masukkan email"
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleUpdateProfile}
                      disabled={loading}
                      className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <MdSave size={18} />
                      {loading ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                    <button
                      onClick={() => setIsEditMode(false)}
                      className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <div className="card space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Ganti Password
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Untuk keamanan akun Anda, silakan ganti password secara
                  berkala.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Saat Ini
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange(e, "currentPassword")}
                    placeholder="Masukkan password saat ini"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Baru
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange(e, "newPassword")}
                    placeholder="Masukkan password baru (minimal 6 karakter)"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange(e, "confirmPassword")}
                    placeholder="Konfirmasi password baru"
                    className="form-input"
                  />
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <MdSave size={18} />
                  {loading ? "Memproses..." : "Ubah Password"}
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="card space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Pengaturan Keamanan
                </h3>
              </div>

              {/* Two Factor Authentication Section */}
              <div className="border border-gray-200 rounded-lg p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900">
                      Autentikasi Dua Faktor (2FA)
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Tingkatkan keamanan akun dengan autentikasi dua faktor
                      menggunakan aplikasi autentikator.
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user?.twoFactorEnabled
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user?.twoFactorEnabled ? "Aktif" : "Tidak Aktif"}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    {user?.twoFactorEnabled
                      ? "2FA sudah aktif di akun Anda. Setiap kali login, Anda akan diminta memasukkan kode dari aplikasi autentikator."
                      : "Aktifkan 2FA untuk menambah lapisan keamanan ekstra pada akun Anda."}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Masukkan Password untuk Konfirmasi
                  </label>
                  <input
                    type="password"
                    value={securityData.password}
                    onChange={(e) => handleSecurityChange(e, "password")}
                    placeholder="Masukkan password Anda"
                    className="form-input"
                  />
                </div>

                <button
                  onClick={handleToggle2FA}
                  disabled={loading || !securityData.password}
                  className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${
                    user?.twoFactorEnabled
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  <FaLock size={18} />
                  {loading
                    ? "Memproses..."
                    : user?.twoFactorEnabled
                      ? "Nonaktifkan 2FA"
                      : "Aktifkan 2FA"}
                </button>
              </div>

              {/* Account Information */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="font-bold text-gray-900 mb-4">Informasi Akun</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status Akun:</span>
                    <span className="font-medium text-green-600">Aktif</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tipe Akun:</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {user?.role === "admin" ? "Administrator" : "OPD"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-900">
                      {user?.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
