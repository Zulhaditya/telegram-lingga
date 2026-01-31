import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS, BASE_URL } from "../../utils/apiPaths";
import {
  FiArrowLeft,
  FiDownload,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
} from "react-icons/fi";
import moment from "moment";
import "moment/locale/id";

moment.locale("id");

const TTEDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tte, setTte] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTTEDetail();
  }, [id]);

  const fetchTTEDetail = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.TTE.GET_TTE_BY_ID(id));
      if (response.status === 200) {
        setTte(response.data.tte);
      }
    } catch (error) {
      toast.error("Gagal mengambil detail TTE");
      console.error("Error fetching TTE detail:", error);
      navigate("/user/tte-status");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FiClock className="w-6 h-6 text-yellow-600" />;
      case "approved":
        return <FiCheckCircle className="w-6 h-6 text-green-600" />;
      case "rejected":
        return <FiAlertCircle className="w-6 h-6 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Menunggu Persetujuan";
      case "approved":
        return "Disetujui";
      case "rejected":
        return "Ditolak";
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600";
      case "approved":
        return "text-green-600";
      case "rejected":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const downloadFile = (filePath, fileName) => {
    const fileUrl = `${BASE_URL}/${filePath}`;
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!tte) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/user/tte-status")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4 transition"
          >
            <FiArrowLeft />
            Kembali ke Status TTE
          </button>
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">Data TTE tidak ditemukan</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate("/user/tte-status")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-6 transition"
        >
          <FiArrowLeft />
          Kembali ke Status TTE
        </button>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Detail Pengajuan TTE
              </h1>
              <p className="text-gray-600">
                Informasi lengkap tentang pengajuan Anda
              </p>
            </div>
            <div
              className={`flex items-center gap-2 ${getStatusColor(tte.status)}`}
            >
              {getStatusIcon(tte.status)}
              <span className="text-xl font-semibold">
                {getStatusText(tte.status)}
              </span>
            </div>
          </div>

          {/* Biodata Section */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Biodata (dari KTP)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Nama Lengkap</p>
                <p className="text-lg font-medium text-gray-800">
                  {tte.namaLengkap}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  NIK (Nomor Induk Kependudukan)
                </p>
                <p className="text-lg font-medium text-gray-800">{tte.nik}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Tempat Lahir</p>
                <p className="text-lg font-medium text-gray-800">
                  {tte.tempatLahir}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Tanggal Lahir</p>
                <p className="text-lg font-medium text-gray-800">
                  {moment(tte.tanggalLahir).format("DD MMMM YYYY")}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 mb-1">Alamat</p>
                <p className="text-lg font-medium text-gray-800">
                  {tte.alamat}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Nomor Telepon</p>
                <p className="text-lg font-medium text-gray-800">
                  {tte.nomorTelepon}
                </p>
              </div>
            </div>
          </div>

          {/* Informasi Kepegawaian Section */}
          <div className="border-t border-gray-200 mt-6 pt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              💼 Informasi Kepegawaian
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Nama Jabatan</p>
                <p className="text-lg font-medium text-gray-800">
                  {tte.namaJabatan}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Pangkat / Golongan</p>
                <p className="text-lg font-medium text-gray-800">
                  {tte.pangkatGolongan}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  NIP (Nomor Induk Kepegawaian)
                </p>
                <p className="text-lg font-medium text-gray-800">{tte.nip}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 mb-1">Asal Instansi</p>
                <p className="text-lg font-medium text-gray-800">
                  {tte.asalInstansi}
                </p>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="border-t border-gray-200 mt-6 pt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📄 Dokumen
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Foto Selfie */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 font-medium mb-3">
                  Foto Selfie
                </p>
                <div className="bg-white rounded-lg overflow-hidden mb-3 border border-gray-200">
                  <img
                    src={`${BASE_URL}/${tte.fotoSelfie}`}
                    alt="Foto Selfie"
                    className="w-full h-48 object-cover"
                  />
                </div>
                <button
                  onClick={() =>
                    downloadFile(tte.fotoSelfie, "foto-selfie.jpg")
                  }
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
                >
                  <FiDownload />
                  Unduh
                </button>
              </div>

              {/* Surat Keterangan */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 font-medium mb-3">
                  Surat Keterangan Instansi
                </p>
                <div className="bg-white rounded-lg p-8 border border-gray-200 text-center mb-3">
                  <p className="text-4xl mb-2">📄</p>
                  <p className="text-sm text-gray-600">File PDF</p>
                </div>
                <button
                  onClick={() =>
                    downloadFile(tte.suratKeterangan, "surat-keterangan.pdf")
                  }
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
                >
                  <FiDownload />
                  Unduh
                </button>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="border-t border-gray-200 mt-6 pt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              ⏱️ Timeline
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                  <div className="w-1 h-12 bg-gray-300"></div>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    Pengajuan Dibuat
                  </p>
                  <p className="text-sm text-gray-600">
                    {moment(tte.createdAt).format("DD MMMM YYYY HH:mm")}
                  </p>
                </div>
              </div>

              {tte.approvedAt && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {tte.status === "approved"
                        ? "Pengajuan Disetujui"
                        : "Pengajuan Ditolak"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {moment(tte.approvedAt).format("DD MMMM YYYY HH:mm")}
                    </p>
                  </div>
                </div>
              )}

              {tte.rejectionReason && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="font-semibold text-red-800 mb-2">
                    Alasan Penolakan
                  </p>
                  <p className="text-red-700">{tte.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>

          {/* TTE Credentials Section (if approved) */}
          {tte.status === "approved" && tte.tteEmail && (
            <div className="border-t border-gray-200 mt-6 pt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                🔐 Kredensial Tanda Tangan Elektronik
              </h2>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <p className="text-sm text-gray-600 font-medium mb-2">
                      Email TTE
                    </p>
                    <p className="text-lg font-medium text-gray-800 break-all">
                      {tte.tteEmail}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <p className="text-sm text-gray-600 font-medium mb-2">
                      Password TTE
                    </p>
                    <p className="text-lg font-medium text-gray-800 font-mono">
                      {tte.ttePassword}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <p className="text-sm text-gray-600 font-medium mb-2">
                      Passphrase TTE
                    </p>
                    <p className="text-lg font-medium text-gray-800 font-mono">
                      {tte.ttePassphrase}
                    </p>
                  </div>
                </div>

                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Penting:</strong> Simpan kredensial ini dengan
                    aman. Jangan bagikan kepada siapapun.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TTE Signature Section (if approved) */}
          {tte.status === "approved" && tte.tteSignature && (
            <div className="border-t border-gray-200 mt-6 pt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                ✨ Tanda Tangan Elektronik Anda
              </h2>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
                <div className="bg-white rounded-lg overflow-hidden border-2 border-blue-300 mb-4">
                  <img
                    src={`${BASE_URL}/${tte.tteSignature}`}
                    alt="Tanda Tangan Elektronik"
                    className="w-full h-auto"
                  />
                </div>
                <button
                  onClick={() =>
                    downloadFile(
                      tte.tteSignature,
                      "tanda-tangan-elektronik.png",
                    )
                  }
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition font-semibold"
                >
                  <FiDownload />
                  Unduh Tanda Tangan Elektronik
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Status Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">ℹ️ Informasi</h3>
          <p className="text-blue-800 text-sm">
            {tte.status === "pending"
              ? "Pengajuan Anda sedang ditinjau oleh admin. Silakan tunggu sampai proses selesai."
              : tte.status === "approved"
                ? "Selamat! Pengajuan Anda telah disetujui. Anda dapat mengunduh tanda tangan elektronik Anda di atas."
                : "Pengajuan Anda ditolak. Silakan baca alasan penolakan dan coba ajukan kembali."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TTEDetail;
