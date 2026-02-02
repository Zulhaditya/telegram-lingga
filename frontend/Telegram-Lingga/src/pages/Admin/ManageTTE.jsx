import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import TTEApprovalModal from "../../components/TTE/TTEApprovalModal";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import {
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiEye,
} from "react-icons/fi";
import moment from "moment";
import "moment/locale/id";

moment.locale("id");

const ManageTTE = () => {
  const [tteList, setTteList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTTE: 0,
    pendingTTE: 0,
    approvedTTE: 0,
    rejectedTTE: 0,
  });

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
  });

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [secureMode, setSecureMode] = useState("mask");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selectedTTE, setSelectedTTE] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchTTEData();
    fetchStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tteList, filters, sortBy, sortOrder]);

  const fetchTTEData = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.TTE.GET_ALL_TTE);
      if (response.status === 200) {
        setTteList(response.data.tte);
      }
    } catch (error) {
      toast.error("Gagal mengambil data TTE");
      console.error("Error fetching TTE:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.TTE.GET_TTE_STATS);
      if (response.status === 200) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const applyFilters = () => {
    let filtered = tteList;

    if (filters.status !== "all") {
      filtered = filtered.filter((tte) => tte.status === filters.status);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter((tte) => {
        return (
          (tte.namaLengkap || "").toLowerCase().includes(q) ||
          (tte.nik || "").includes(filters.search) ||
          (tte.asalInstansi || "").toLowerCase().includes(q)
        );
      });
    }

    // apply sorting
    if (sortBy) {
      const sorted = filtered.slice().sort((a, b) => {
        const va = a[sortBy];
        const vb = b[sortBy];
        // handle dates
        if (sortBy === "createdAt") {
          const da = new Date(va || 0).getTime();
          const db = new Date(vb || 0).getTime();
          return sortOrder === "asc" ? da - db : db - da;
        }
        // fallback string compare
        const sa = (va || "").toString().toLowerCase();
        const sb = (vb || "").toString().toLowerCase();
        if (sa < sb) return sortOrder === "asc" ? -1 : 1;
        if (sa > sb) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
      setFilteredList(sorted);
      setCurrentPage(1);
    } else {
      setFilteredList(filtered);
      setCurrentPage(1);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleApprove = async (tteId, formData) => {
    setProcessingId(tteId);
    try {
      const response = await axiosInstance.put(
        API_PATHS.TTE.APPROVE_TTE(tteId),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.status === 200) {
        toast.success("Pengajuan TTE berhasil disetujui!");
        setTteList((prev) =>
          prev.map((tte) => (tte._id === tteId ? response.data.tte : tte)),
        );
        setSelectedTTE(null);
        fetchStats();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menyetujui TTE");
      console.error("Error approving TTE:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (tteId, data) => {
    setProcessingId(tteId);
    try {
      const response = await axiosInstance.put(
        API_PATHS.TTE.REJECT_TTE(tteId),
        data,
      );

      if (response.status === 200) {
        toast.success("Pengajuan TTE berhasil ditolak!");
        setTteList((prev) =>
          prev.map((tte) => (tte._id === tteId ? response.data.tte : tte)),
        );
        setSelectedTTE(null);
        fetchStats();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menolak TTE");
      console.error("Error rejecting TTE:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const params = {};
      if (filters.status && filters.status !== "all")
        params.status = filters.status;
      if (filters.search) params.search = filters.search;
      if (sortBy) params.sortBy = sortBy;
      if (sortOrder) params.sortOrder = sortOrder;
      if (secureMode) params.secureMode = secureMode;

      const response = await axiosInstance.get(API_PATHS.TTE.EXPORT_ALL, {
        params,
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/octet-stream",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tte_report_admin.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Laporan TTE berhasil diunduh");
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Gagal mengunduh laporan TTE");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FiClock className="text-yellow-600" />;
      case "approved":
        return <FiCheckCircle className="text-green-600" />;
      case "rejected":
        return <FiAlertCircle className="text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTotalPages = () =>
    Math.max(1, Math.ceil(filteredList.length / pageSize));

  const getPageNumbers = () => {
    const total = getTotalPages();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [];
    const start = Math.max(2, currentPage - 2);
    const end = Math.min(total - 1, currentPage + 2);
    pages.push(1);
    if (start > 2) pages.push("ellipsis-start");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push("ellipsis-end");
    pages.push(total);
    return pages;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout activeMenu="Kelola TTE">
      <div className="bg-gray-100 p-6 -mx-5">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Manajemen Tanda Tangan Elektronik
            </h1>
            <p className="text-gray-600">
              Verifikasi dan setujui pengajuan TTE dari pengguna
            </p>
            <div className="mt-3 flex items-center gap-3">
              <select
                value={secureMode}
                onChange={(e) => setSecureMode(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
              >
                <option value="mask">Mask</option>
                <option value="real">Real</option>
              </select>
              <button
                onClick={handleDownloadReport}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Download Laporan (Excel)
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <p className="text-gray-600 text-sm font-medium mb-2">
                Total TTE
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.totalTTE}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-2">
                    Menunggu
                  </p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {stats.pendingTTE}
                  </p>
                </div>
                <FiClock className="text-5xl text-yellow-200" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-2">
                    Disetujui
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.approvedTTE}
                  </p>
                </div>
                <FiCheckCircle className="text-5xl text-green-200" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-2">
                    Ditolak
                  </p>
                  <p className="text-3xl font-bold text-red-600">
                    {stats.rejectedTTE}
                  </p>
                </div>
                <FiAlertCircle className="text-5xl text-red-200" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔍 Cari
                </label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari berdasarkan nama, NIK, atau nomor telepon..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }))
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiFilter className="inline mr-1" />
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Semua Status</option>
                  <option value="pending">Menunggu Persetujuan</option>
                  <option value="approved">Disetujui</option>
                  <option value="rejected">Ditolak</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {filteredList.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-600 text-lg">
                  Tidak ada data TTE yang sesuai dengan filter
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-300">
                    <tr>
                      <th
                        onClick={() => handleSort("namaLengkap")}
                        className="cursor-pointer px-6 py-4 text-left text-sm font-semibold text-gray-700"
                      >
                        Nama Lengkap
                        {sortBy === "namaLengkap"
                          ? sortOrder === "asc"
                            ? " ↑"
                            : " ↓"
                          : ""}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Jabatan
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Pangkat / Golongan
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Nomor Telepon
                      </th>
                      <th
                        onClick={() => handleSort("createdAt")}
                        className="cursor-pointer px-6 py-4 text-left text-sm font-semibold text-gray-700"
                      >
                        Tanggal Pengajuan
                        {sortBy === "createdAt"
                          ? sortOrder === "asc"
                            ? " ↑"
                            : " ↓"
                          : ""}
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const indexOfLast = currentPage * pageSize;
                      const indexOfFirst = indexOfLast - pageSize;
                      const displayed = filteredList.slice(
                        indexOfFirst,
                        indexOfLast,
                      );
                      return displayed.map((tte) => (
                        <tr
                          key={tte._id}
                          className="border-b border-gray-200 hover:bg-gray-50 transition"
                        >
                          <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                            {tte.namaLengkap}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {tte.namaJabatan}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {tte.pangkatGolongan}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {tte.nomorTelepon}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {moment(tte.createdAt).format("DD MMM YYYY HH:mm")}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                tte.status,
                              )}`}
                            >
                              {getStatusIcon(tte.status)}
                              {tte.status === "pending"
                                ? "Menunggu"
                                : tte.status === "approved"
                                  ? "Disetujui"
                                  : "Ditolak"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => setSelectedTTE(tte)}
                              className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition"
                            >
                              <FiEye />
                              Detail
                            </button>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <div className="text-sm text-gray-600">
                    Menampilkan{" "}
                    {filteredList.length === 0
                      ? 0
                      : (currentPage - 1) * pageSize + 1}{" "}
                    - {Math.min(currentPage * pageSize, filteredList.length)}{" "}
                    dari {filteredList.length}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded-md border text-sm ${currentPage === 1 ? "bg-gray-100 text-gray-400" : "bg-white hover:bg-gray-50"}`}
                      >
                        Pertama
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded-md border text-sm ${currentPage === 1 ? "bg-gray-100 text-gray-400" : "bg-white hover:bg-gray-50"}`}
                      >
                        Sebelumnya
                      </button>
                    </div>

                    <div className="inline-flex items-center space-x-1">
                      {getPageNumbers().map((p, idx) =>
                        p === "ellipsis-start" || p === "ellipsis-end" ? (
                          <span key={p + idx} className="px-2 text-gray-400">
                            …
                          </span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setCurrentPage(p)}
                            className={`px-3 py-1 rounded-md text-sm border ${currentPage === p ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-gray-50"}`}
                          >
                            {p}
                          </button>
                        ),
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((p) =>
                            Math.min(getTotalPages(), p + 1),
                          )
                        }
                        disabled={currentPage === getTotalPages()}
                        className={`px-3 py-1 rounded-md border text-sm ${currentPage === getTotalPages() ? "bg-gray-100 text-gray-400" : "bg-white hover:bg-gray-50"}`}
                      >
                        Berikutnya
                      </button>
                      <button
                        onClick={() => setCurrentPage(getTotalPages())}
                        disabled={currentPage === getTotalPages()}
                        className={`px-3 py-1 rounded-md border text-sm ${currentPage === getTotalPages() ? "bg-gray-100 text-gray-400" : "bg-white hover:bg-gray-50"}`}
                      >
                        Terakhir
                      </button>
                    </div>

                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="ml-3 px-2 py-1 border rounded text-sm"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedTTE && (
        <TTEApprovalModal
          tte={selectedTTE}
          onClose={() => setSelectedTTE(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          loading={processingId === selectedTTE._id}
        />
      )}
    </DashboardLayout>
  );
};

export default ManageTTE;
