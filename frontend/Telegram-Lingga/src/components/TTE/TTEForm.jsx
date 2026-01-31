import { useState } from "react";
import toast from "react-hot-toast";
import { FiUpload, FiX, FiCheck } from "react-icons/fi";

const TTEForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    namaLengkap: "",
    nik: "",
    tempatLahir: "",
    tanggalLahir: "",
    alamat: "",
    nomorTelepon: "",
  });

  const [files, setFiles] = useState({
    fotoSelfie: null,
    suratKeterangan: null,
  });

  const [previews, setPreviews] = useState({
    fotoSelfie: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: inputFiles } = e.target;

    if (inputFiles && inputFiles[0]) {
      const file = inputFiles[0];

      // Validasi ukuran file
      if (name === "fotoSelfie" && file.size > 5 * 1024 * 1024) {
        toast.error("Foto selfie tidak boleh lebih dari 5MB");
        return;
      }

      if (name === "suratKeterangan" && file.size > 10 * 1024 * 1024) {
        toast.error("Surat keterangan tidak boleh lebih dari 10MB");
        return;
      }

      // Validasi tipe file
      if (name === "fotoSelfie" && !file.type.startsWith("image/")) {
        toast.error("File harus berupa gambar");
        return;
      }

      if (name === "suratKeterangan" && file.type !== "application/pdf") {
        toast.error("File harus berupa PDF");
        return;
      }

      setFiles((prev) => ({
        ...prev,
        [name]: file,
      }));

      // Buat preview untuk foto selfie
      if (name === "fotoSelfie") {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews((prev) => ({
            ...prev,
            fotoSelfie: reader.result,
          }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validasi semua field
    if (
      !formData.namaLengkap ||
      !formData.nik ||
      !formData.tempatLahir ||
      !formData.tanggalLahir ||
      !formData.alamat ||
      !formData.nomorTelepon
    ) {
      toast.error("Semua field biodata harus diisi");
      return;
    }

    if (!files.fotoSelfie || !files.suratKeterangan) {
      toast.error("Foto selfie dan surat keterangan harus diupload");
      return;
    }

    // Validasi format NIK (16 digit)
    if (!/^\d{16}$/.test(formData.nik)) {
      toast.error("NIK harus terdiri dari 16 digit");
      return;
    }

    // Validasi nomor telepon
    if (!/^(\+62|62|0)[0-9]{9,12}$/.test(formData.nomorTelepon)) {
      toast.error("Nomor telepon tidak valid");
      return;
    }

    const formDataSubmit = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataSubmit.append(key, formData[key]);
    });
    formDataSubmit.append("fotoSelfie", files.fotoSelfie);
    formDataSubmit.append("suratKeterangan", files.suratKeterangan);

    onSubmit(formDataSubmit);
  };

  const removeFile = (fieldName) => {
    setFiles((prev) => ({
      ...prev,
      [fieldName]: null,
    }));
    if (fieldName === "fotoSelfie") {
      setPreviews((prev) => ({
        ...prev,
        fotoSelfie: null,
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Pengajuan Tanda Tangan Elektronik
      </h2>

      {/* Biodata Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-blue-200">
          Biodata (dari KTP)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="namaLengkap"
              value={formData.namaLengkap}
              onChange={handleInputChange}
              placeholder="Masukkan nama lengkap sesuai KTP"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NIK (Nomor Induk Kependudukan){" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nik"
              value={formData.nik}
              onChange={handleInputChange}
              placeholder="16 digit NIK"
              maxLength="16"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tempat Lahir <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="tempatLahir"
              value={formData.tempatLahir}
              onChange={handleInputChange}
              placeholder="Masukkan tempat lahir"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Lahir <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="tanggalLahir"
              value={formData.tanggalLahir}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              disabled={loading}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alamat <span className="text-red-500">*</span>
            </label>
            <textarea
              name="alamat"
              value={formData.alamat}
              onChange={handleInputChange}
              placeholder="Masukkan alamat lengkap"
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomor Telepon <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="nomorTelepon"
              value={formData.nomorTelepon}
              onChange={handleInputChange}
              placeholder="Contoh: 0812345678 atau +6212345678"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-blue-200">
          Dokumen dan Foto
        </h3>

        {/* Foto Selfie */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Foto Selfie <span className="text-red-500">*</span>
            <span className="text-xs text-gray-500 ml-1">(Maks 5MB)</span>
          </label>

          {!previews.fotoSelfie ? (
            <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-blue-400 rounded-lg p-6 cursor-pointer hover:border-blue-600 transition bg-blue-50">
              <FiUpload className="text-3xl text-blue-500 mb-2" />
              <span className="text-sm text-gray-700 font-medium">
                Klik untuk upload foto selfie
              </span>
              <span className="text-xs text-gray-500 mt-1">
                Format: JPG, PNG (Maks 5MB)
              </span>
              <input
                type="file"
                name="fotoSelfie"
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                disabled={loading}
              />
            </label>
          ) : (
            <div className="relative">
              <img
                src={previews.fotoSelfie}
                alt="Foto Selfie Preview"
                className="w-full h-64 object-cover rounded-lg border border-green-400"
              />
              <button
                type="button"
                onClick={() => removeFile("fotoSelfie")}
                disabled={loading}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition"
              >
                <FiX className="text-lg" />
              </button>
              <div className="mt-2 flex items-center text-green-600">
                <FiCheck className="mr-1" />
                <span className="text-sm">Foto siap diupload</span>
              </div>
            </div>
          )}
        </div>

        {/* Surat Keterangan */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Surat Keterangan dari Instansi{" "}
            <span className="text-red-500">*</span>
            <span className="text-xs text-gray-500 ml-1">(Maks 10MB)</span>
          </label>

          {!files.suratKeterangan ? (
            <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-blue-400 rounded-lg p-6 cursor-pointer hover:border-blue-600 transition bg-blue-50">
              <FiUpload className="text-3xl text-blue-500 mb-2" />
              <span className="text-sm text-gray-700 font-medium">
                Klik untuk upload surat keterangan
              </span>
              <span className="text-xs text-gray-500 mt-1">
                Format: PDF (Maks 10MB)
              </span>
              <input
                type="file"
                name="suratKeterangan"
                onChange={handleFileChange}
                accept=".pdf"
                className="hidden"
                disabled={loading}
              />
            </label>
          ) : (
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-green-400">
              <div className="flex items-center">
                <div className="bg-red-100 p-3 rounded-lg mr-3">
                  <span className="text-red-600 font-bold">PDF</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {files.suratKeterangan.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(files.suratKeterangan.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <FiCheck className="text-green-600 mr-3" />
                <button
                  type="button"
                  onClick={() => removeFile("suratKeterangan")}
                  disabled={loading}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition text-sm"
                >
                  <FiX className="inline mr-1" />
                  Hapus
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className={`flex-1 py-3 rounded-lg font-semibold text-white transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Sedang mengirim..." : "Ajukan Tanda Tangan Elektronik"}
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Dengan mengirimkan form ini, Anda menyatakan bahwa semua data yang Anda
        isi sudah benar dan sesuai dengan dokumen resmi.
      </p>
    </form>
  );
};

export default TTEForm;
