import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import TTEForm from "../../components/TTE/TTEForm";
import { FiArrowLeft } from "react-icons/fi";

const SubmitTTE = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmitTTE = async (formData) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(
        API_PATHS.TTE.SUBMIT_TTE,
        formData,
      );

      if (response.status === 201) {
        toast.success(response.data.message || "Pengajuan berhasil dikirim!");
        setTimeout(() => {
          navigate("/user/tte-status");
        }, 1500);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage);
      console.error("Error submitting TTE:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/user")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4 transition"
          >
            <FiArrowLeft />
            Kembali ke Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Tanda Tangan Elektronik
          </h1>
          <p className="text-gray-600">
            Ajukan permintaan tanda tangan elektronik dengan mengisi data
            biodata dan dokumen yang diperlukan.
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-3">
            📋 Dokumen yang Diperlukan:
          </h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li className="flex items-start">
              <span className="mr-3">✓</span>
              <span>
                <strong>Biodata dari KTP:</strong> Nama lengkap, NIK, tempat
                lahir, tanggal lahir, dan alamat
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-3">✓</span>
              <span>
                <strong>Foto Selfie:</strong> Foto diri Anda (format JPG/PNG,
                maksimal 5MB)
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-3">✓</span>
              <span>
                <strong>Surat Keterangan Instansi:</strong> Dokumen PDF dari
                institusi (maksimal 10MB)
              </span>
            </li>
          </ul>
        </div>

        {/* Form */}
        <TTEForm onSubmit={handleSubmitTTE} loading={loading} />
      </div>
    </div>
  );
};

export default SubmitTTE;
