import {
  FiDownload,
  FiEye,
  FiTrash2,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
} from "react-icons/fi";
import { BASE_URL } from "../../utils/apiPaths";
import moment from "moment";
import "moment/locale/id";

moment.locale("id");

const TTEStatusCard = ({ tte, onDelete, onView, loading = {} }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: <FiClock className="inline mr-1" />,
        label: "Menunggu Persetujuan",
      },
      approved: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: <FiCheckCircle className="inline mr-1" />,
        label: "Sudah Disetujui",
      },
      rejected: {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: <FiAlertCircle className="inline mr-1" />,
        label: "Ditolak",
      },
    };

    return statusConfig[status] || statusConfig.pending;
  };

  const statusConfig = getStatusBadge(tte.status);

  const handleDownloadSurat = () => {
    const filePath = tte.suratKeterangan;
    const link = document.createElement("a");
    link.href = `${BASE_URL}/${filePath}`;
    link.download = `Surat-Keterangan-${tte.nik}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSignature = () => {
    if (!tte.tteSignature) return;
    const filePath = tte.tteSignature;
    const link = document.createElement("a");
    link.href = `${BASE_URL}/${filePath}`;
    link.download = `TTE-${tte.nik}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-blue-500">
      {/* Header dengan status */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {tte.namaLengkap}
            </h3>
            <p className="text-sm text-gray-600 mt-1">NIK: {tte.nik}</p>
          </div>
          <span
            className={`inline-flex items-center px-4 py-2 rounded-full font-semibold ${statusConfig.bg} ${statusConfig.text}`}
          >
            {statusConfig.icon}
            {statusConfig.label}
          </span>
        </div>

        {/* Tanggal pengajuan */}
        <div className="text-sm text-gray-600">
          <p>Pengajuan: {moment(tte.createdAt).format("DD MMMM YYYY HH:mm")}</p>
          {tte.approvedAt && (
            <p className="text-green-700 font-medium">
              Disetujui: {moment(tte.approvedAt).format("DD MMMM YYYY HH:mm")}
            </p>
          )}
        </div>
      </div>

      {/* Body dengan informasi */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">
              Tempat Lahir
            </p>
            <p className="text-sm text-gray-800 font-medium">
              {tte.tempatLahir}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">
              Tanggal Lahir
            </p>
            <p className="text-sm text-gray-800 font-medium">
              {moment(tte.tanggalLahir).format("DD MMMM YYYY")}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-gray-500 uppercase font-semibold">
              Alamat
            </p>
            <p className="text-sm text-gray-800 font-medium">{tte.alamat}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">
              Nomor Telepon
            </p>
            <p className="text-sm text-gray-800 font-medium">
              {tte.nomorTelepon}
            </p>
          </div>
        </div>

        {/* Approval Info */}
        {tte.status === "approved" && tte.approvedBy && (
          <div className="bg-green-50 p-4 rounded-lg mb-6 border border-green-200">
            <p className="text-xs text-green-700 uppercase font-semibold mb-1">
              Disetujui oleh
            </p>
            <p className="text-sm text-green-900 font-medium">
              {tte.approvedBy.nama}
            </p>
            <p className="text-xs text-green-700 mt-1">
              Nama Signature: {tte.tteSignatureName}
            </p>
          </div>
        )}

        {/* Rejection Info */}
        {tte.status === "rejected" && tte.rejectionReason && (
          <div className="bg-red-50 p-4 rounded-lg mb-6 border border-red-200">
            <p className="text-xs text-red-700 uppercase font-semibold mb-1">
              Alasan Penolakan
            </p>
            <p className="text-sm text-red-900 font-medium">
              {tte.rejectionReason}
            </p>
          </div>
        )}

        {/* File Downloads */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
          <p className="text-xs text-gray-600 uppercase font-semibold mb-3">
            Dokumen
          </p>
          <div className="space-y-2">
            <button
              onClick={handleDownloadSurat}
              className="w-full flex items-center justify-between bg-white hover:bg-gray-100 p-3 rounded border border-gray-300 transition"
            >
              <span className="text-sm text-gray-700 font-medium">
                📄 Surat Keterangan
              </span>
              <FiDownload className="text-blue-600" />
            </button>

            {tte.status === "approved" && tte.tteSignature && (
              <button
                onClick={handleDownloadSignature}
                className="w-full flex items-center justify-between bg-white hover:bg-gray-100 p-3 rounded border border-gray-300 transition"
              >
                <span className="text-sm text-gray-700 font-medium">
                  🖼️ Tanda Tangan Elektronik
                </span>
                <FiDownload className="text-green-600" />
              </button>
            )}
          </div>
        </div>

        {/* Image Previews */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Foto Selfie Preview */}
          <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100 h-40">
            <img
              src={`${BASE_URL}/${tte.fotoSelfie}`}
              alt="Foto Selfie"
              className="w-full h-full object-cover"
            />
          </div>

          {/* TTE Signature Preview */}
          {tte.status === "approved" && tte.tteSignature && (
            <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100 h-40 flex items-center justify-center">
              <img
                src={`${BASE_URL}/${tte.tteSignature}`}
                alt="TTE Signature"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer dengan actions */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3">
        <button
          onClick={() => onView(tte._id)}
          disabled={loading[tte._id]}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition disabled:bg-gray-400"
        >
          <FiEye />
          Detail
        </button>

        {tte.status === "pending" && (
          <button
            onClick={() => onDelete(tte._id)}
            disabled={loading[tte._id]}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition disabled:bg-gray-400"
          >
            <FiTrash2 />
            Hapus
          </button>
        )}
      </div>
    </div>
  );
};

export default TTEStatusCard;
