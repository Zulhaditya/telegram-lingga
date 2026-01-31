import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import {
  FiArrowLeft,
  FiPlus,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiEye,
  FiSearch,
  FiFilter,
} from "react-icons/fi";
import moment from "moment";
import "moment/locale/id";

moment.locale("id");

const MyTTEStatus = () => {
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

  const navigate = useNavigate();

  useEffect(() => {
    fetchMyTTE();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tteList, filters]);

  const fetchMyTTE = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.TTE.GET_MY_TTE);
      if (response.status === 200) {
        const ttes = Array.isArray(response.data.tte) ? response.data.tte : [];
        setTteList(ttes);
        calculateStats(ttes);
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error("Gagal mengambil data TTE");
        console.error("Error fetching TTE:", error);
      }
      setTteList([]);
      setStats({
        totalTTE: 0,
        pendingTTE: 0,
        approvedTTE: 0,
        rejectedTTE: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ttes) => {
    const totalTTE = ttes.length;
    const pendingTTE = ttes.filter((tte) => tte.status === "pending").length;
    const approvedTTE = ttes.filter((tte) => tte.status === "approved").length;
    const rejectedTTE = ttes.filter((tte) => tte.status === "rejected").length;

    setStats({ totalTTE, pendingTTE, approvedTTE, rejectedTTE });
  };

  const applyFilters = () => {
    let filtered = tteList;

    if (filters.status !== "all") {
      filtered = filtered.filter((tte) => tte.status === filters.status);
    }

    if (filters.search) {
      filtered = filtered.filter(
        (tte) =>
          tte.namaLengkap
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          tte.nik.includes(filters.search) ||
          tte.nomorTelepon.includes(filters.search),
      );
    }

    setFilteredList(filtered);
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <button
                onClick={() => navigate("/user")}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4 transition"
              >
                <FiArrowLeft />
                Kembali ke Dashboard
              </button>
              <h1 className="text-3xl font-bold text-gray-800">
                Status Tanda Tangan Elektronik
              </h1>
              <p className="text-gray-600 mt-2">
                Pantau status pengajuan TTE Anda
              </p>
            </div>
            <button
              onClick={() => navigate("/user/submit-tte")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              <FiPlus />
              Ajukan TTE Baru
            </button>
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
                {tteList.length === 0 ? (
                  <>
                    <div className="text-6xl mb-4">📝</div>
                    <p className="text-gray-600 text-lg mb-6">
                      Anda belum mengajukan tanda tangan elektronik
                    </p>
                    <button
                      onClick={() => navigate("/user/submit-tte")}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                    >
                      <FiPlus />
                      Ajukan TTE Sekarang
                    </button>
                  </>
                ) : (
                  <p className="text-gray-600 text-lg">
                    Tidak ada data TTE yang sesuai dengan filter
                  </p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-300">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Nama Lengkap
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        NIK
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Nomor Telepon
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Tanggal Pengajuan
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
                    {filteredList.map((tte) => (
                      <tr
                        key={tte._id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                          {tte.namaLengkap}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {tte.nik}
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
                            onClick={() =>
                              navigate(`/user/tte-detail/${tte._id}`)
                            }
                            className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition"
                          >
                            <FiEye />
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyTTEStatus;
