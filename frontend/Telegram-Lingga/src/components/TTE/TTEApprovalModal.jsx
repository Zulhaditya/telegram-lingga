import { useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS, BASE_URL } from "../../utils/apiPaths";
import {
  FiDownload,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiUpload,
  FiEye,
} from "react-icons/fi";
import moment from "moment";
import "moment/locale/id";

moment.locale("id");

const TTEApprovalModal = ({ tte, onClose, onApprove, onReject, loading }) => {
  const [activeTab, setActiveTab] = useState("info");
  const [signatureFile, setSignatureFile] = useState(null);
  const [signatureName, setSignatureName] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  const handleSignatureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File signature tidak boleh lebih dari 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("File harus berupa gambar");
        return;
      }
      setSignatureFile(file);
    }
  };

  const handleApprove = async () => {
    if (!signatureFile || !signatureName) {
      toast.error("Signature file dan nama signature harus diisi");
      return;
    }

    const formData = new FormData();
    formData.append("tteSignature", signatureFile);
    formData.append("tteSignatureName", signatureName);

    await onApprove(tte._id, formData);
    setShowApprovalForm(false);
    setSignatureFile(null);
    setSignatureName("");
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Alasan penolakan harus diisi");
      return;
    }

    await onReject(tte._id, { rejectionReason });
    setShowRejectionForm(false);
    setRejectionReason("");
  };

  const handleDownloadDocument = (docPath, filename) => {
    const link = document.createElement("a");
    link.href = `${BASE_URL}/${docPath}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 my-8">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <h2 className="text-xl font-bold">Verifikasi Pengajuan TTE</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-white hover:bg-blue-800 p-1 rounded transition disabled:opacity-50"
          >
            <FiX className="text-2xl" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("info")}
            className={`px-6 py-3 font-medium transition ${
              activeTab === "info"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Informasi
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`px-6 py-3 font-medium transition ${
              activeTab === "documents"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Dokumen
          </button>
          {tte.status === "pending" && (
            <button
              onClick={() => setActiveTab("action")}
              className={`px-6 py-3 font-medium transition ${
                activeTab === "action"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Tindakan
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Info Tab */}
          {activeTab === "info" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Data Biodata
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Nama Lengkap
                  </p>
                  <p className="text-gray-800 font-medium">{tte.namaLengkap}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    NIK
                  </p>
                  <p className="text-gray-800 font-medium">{tte.nik}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Tempat Lahir
                  </p>
                  <p className="text-gray-800 font-medium">{tte.tempatLahir}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Tanggal Lahir
                  </p>
                  <p className="text-gray-800 font-medium">
                    {moment(tte.tanggalLahir).format("DD MMMM YYYY")}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Alamat
                  </p>
                  <p className="text-gray-800 font-medium">{tte.alamat}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Nomor Telepon
                  </p>
                  <p className="text-gray-800 font-medium">
                    {tte.nomorTelepon}
                  </p>
                </div>
              </div>

              <hr className="my-6" />

              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Informasi Pengajuan
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Tanggal Pengajuan
                  </p>
                  <p className="text-gray-800 font-medium">
                    {moment(tte.createdAt).format("DD MMMM YYYY HH:mm")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Status
                  </p>
                  <p
                    className={`font-medium ${
                      tte.status === "pending"
                        ? "text-yellow-600"
                        : tte.status === "approved"
                          ? "text-green-600"
                          : "text-red-600"
                    }`}
                  >
                    {tte.status === "pending"
                      ? "Menunggu Persetujuan"
                      : tte.status === "approved"
                        ? "Disetujui"
                        : "Ditolak"}
                  </p>
                </div>
                {tte.approvedBy && (
                  <>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">
                        Disetujui Oleh
                      </p>
                      <p className="text-gray-800 font-medium">
                        {tte.approvedBy.nama}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">
                        Tanggal Persetujuan
                      </p>
                      <p className="text-gray-800 font-medium">
                        {moment(tte.approvedAt).format("DD MMMM YYYY HH:mm")}
                      </p>
                    </div>
                  </>
                )}
                {tte.rejectionReason && (
                  <div className="col-span-2 bg-red-50 p-4 rounded border border-red-200">
                    <p className="text-xs text-red-700 uppercase font-semibold mb-1">
                      Alasan Penolakan
                    </p>
                    <p className="text-red-900 text-sm">
                      {tte.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Dokumen dan Foto
              </h3>

              <div className="space-y-6">
                {/* Foto Selfie */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    📸 Foto Selfie
                  </p>
                  <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={`${BASE_URL}/${tte.fotoSelfie}`}
                      alt="Foto Selfie"
                      className="w-full max-h-96 object-cover"
                    />
                  </div>
                </div>

                {/* Surat Keterangan */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    📄 Surat Keterangan Instansi
                  </p>
                  <button
                    onClick={() =>
                      handleDownloadDocument(
                        tte.suratKeterangan,
                        `Surat-Keterangan-${tte.nik}.pdf`,
                      )
                    }
                    className="flex items-center gap-3 w-full bg-red-50 hover:bg-red-100 p-4 rounded-lg border border-red-300 transition"
                  >
                    <div className="bg-red-200 px-3 py-2 rounded font-bold text-red-700">
                      PDF
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-800">
                        {tte.suratKeterangan.split("/").pop()}
                      </p>
                    </div>
                    <FiDownload className="text-red-600" />
                  </button>
                </div>

                {/* TTE Signature (jika sudah approved) */}
                {tte.status === "approved" && tte.tteSignature && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      ✍️ Tanda Tangan Elektronik
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-300 mb-4">
                      <p className="text-xs text-gray-600 mb-2">
                        <strong>Nama Signature:</strong> {tte.tteSignatureName}
                      </p>
                      <img
                        src={`${BASE_URL}/${tte.tteSignature}`}
                        alt="TTE Signature"
                        className="max-w-xs max-h-48 border border-gray-300 rounded p-2"
                      />
                    </div>
                    <button
                      onClick={() =>
                        handleDownloadDocument(
                          tte.tteSignature,
                          `TTE-${tte.nik}.png`,
                        )
                      }
                      className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition"
                    >
                      <FiDownload />
                      Download Signature
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Tab */}
          {activeTab === "action" && tte.status === "pending" && (
            <div>
              {!showApprovalForm && !showRejectionForm ? (
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowApprovalForm(true)}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition"
                  >
                    <FiCheck className="text-xl" />
                    Setujui Pengajuan
                  </button>
                  <button
                    onClick={() => setShowRejectionForm(true)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition"
                  >
                    <FiX className="text-xl" />
                    Tolak Pengajuan
                  </button>
                </div>
              ) : showApprovalForm ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">
                    🖼️ Unggah Tanda Tangan Elektronik
                  </h3>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Signature <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={signatureName}
                      onChange={(e) => setSignatureName(e.target.value)}
                      placeholder="Contoh: Direktur, Kepala Bidang, dll"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      disabled={loading}
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload File Signature{" "}
                      <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-500 ml-1">
                        (JPG, PNG, maks 5MB)
                      </span>
                    </label>
                    {!signatureFile ? (
                      <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-green-400 rounded-lg p-6 cursor-pointer hover:border-green-600 bg-green-50 transition">
                        <FiUpload className="text-3xl text-green-500 mb-2" />
                        <span className="text-sm text-gray-700 font-medium">
                          Klik untuk upload signature
                        </span>
                        <input
                          type="file"
                          onChange={handleSignatureChange}
                          accept="image/*"
                          className="hidden"
                          disabled={loading}
                        />
                      </label>
                    ) : (
                      <div className="bg-white p-4 rounded-lg border border-green-400 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 p-3 rounded">
                            <FiEye className="text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {signatureFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(signatureFile.size / 1024 / 1024).toFixed(2)}
                              MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSignatureFile(null)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleApprove}
                      disabled={loading || !signatureFile || !signatureName}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition disabled:bg-gray-400"
                    >
                      {loading ? "Memproses..." : "Konfirmasi Persetujuan"}
                    </button>
                    <button
                      onClick={() => setShowApprovalForm(false)}
                      disabled={loading}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-semibold transition disabled:bg-gray-400"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : showRejectionForm ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-900 mb-4">
                    ❌ Tolak Pengajuan TTE
                  </h3>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alasan Penolakan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Jelaskan alasan penolakan pengajuan TTE ini..."
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                      disabled={loading}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleReject}
                      disabled={loading || !rejectionReason.trim()}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition disabled:bg-gray-400"
                    >
                      {loading ? "Memproses..." : "Konfirmasi Penolakan"}
                    </button>
                    <button
                      onClick={() => setShowRejectionForm(false)}
                      disabled={loading}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg font-semibold transition disabled:bg-gray-400"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition disabled:opacity-50"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default TTEApprovalModal;
