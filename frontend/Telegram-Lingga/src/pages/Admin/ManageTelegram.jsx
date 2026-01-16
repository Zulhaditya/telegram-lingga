import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { LuFileSpreadsheet } from "react-icons/lu";
import TelegramStatusTab from "../../components/TelegramStatusTab";
import TelegramCard from "../../components/Cards/TelegramCard";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ManageTelegram = () => {
  const [allTelegrams, setAllTelegrams] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [sortOrder, setSortOrder] = useState("desc");

  const navigate = useNavigate();

  const getAllTelegrams = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.TELEGRAMS.GET_ALL_TELEGRAMS,
        {
          params: {
            status: filterStatus === "Semua" ? "" : filterStatus,
            search: searchQuery,
            startDate: dateRange[0]
              ? dateRange[0].toISOString().split("T")[0]
              : "",
            endDate: dateRange[1]
              ? dateRange[1].toISOString().split("T")[0]
              : "",
            sortOrder,
          },
        }
      );

      setAllTelegrams(
        response.data?.telegrams?.length > 0 ? response.data.telegrams : []
      );

      const statusSummary = response.data?.statusSummary || {};

      const statusArray = [
        { label: "Semua", count: statusSummary.all || 0 },
        { label: "Dibaca", count: statusSummary.readTelegrams || 0 },
        { label: "Belum Dibaca", count: statusSummary.unreadTelegrams || 0 },
      ];

      setTabs(statusArray);
    } catch (error) {
      console.error("Error fetching instansi:", error);
    }
  };

  const handleClick = (telegramData) => {
    navigate(`/admin/create-telegram`, {
      state: { telegramId: telegramData._id },
    });
  };

  // Download data telegram
  const handleDownloadReport = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.REPORTS.EXPORT_TELEGRAM,
        {
          responseType: "blob",
        }
      );

      // Buat url untuk blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "data_telegram.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error saat download laporan telegram:", error);
      toast.error("Gagal saat download laporan telegram. Silahkan coba lagi");
    }
  };

  useEffect(() => {
    getAllTelegrams();
    return () => {};
  }, [filterStatus, searchQuery, dateRange, sortOrder]);

  return (
    <DashboardLayout activeMenu="Manajemen Telegram">
      <div className="my-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl md:text-xl font-medium">
              Telegram Instansi
            </h2>

            <button
              className="flex lg:hidden download-btn"
              onClick={handleDownloadReport}
            >
              <LuFileSpreadsheet className="text-lg" />
              Download Laporan
            </button>
          </div>

          {tabs?.[0]?.count > 0 && (
            <div className="flex items-center gap-3">
              <TelegramStatusTab
                tabs={tabs}
                activeTab={filterStatus}
                setActiveTab={setFilterStatus}
              />

              <button
                className="hidden lg:flex download-btn"
                onClick={handleDownloadReport}
              >
                <LuFileSpreadsheet className="text-lg" />
                Download Laporan
              </button>
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mt-4">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Cari Surat
              </label>
              <input
                type="text"
                placeholder="Cari berdasarkan perihal, nomor surat, atau instansi pengirim..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Rentang Tanggal
                </label>
                <DatePicker
                  selectsRange={true}
                  startDate={dateRange[0]}
                  endDate={dateRange[1]}
                  onChange={(update) => {
                    setDateRange(update);
                  }}
                  isClearable={true}
                  placeholderText="Pilih rentang tanggal"
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary w-full"
                  dateFormat="dd/MM/yyyy"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Urutkan
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="desc">Terbaru</option>
                  <option value="asc">Terlama</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {allTelegrams?.map((item, index) => (
            <TelegramCard
              key={item._id}
              instansiPengirim={item.instansiPengirim}
              nomorSurat={item.nomorSurat}
              instansiPenerima={item.instansiPenerima?.map(
                (item) => item.profileImageUrl
              )}
              perihal={item.perihal}
              klasifikasi={item.klasifikasi}
              status={item.status}
              tanggal={item.tanggal}
              progress={item.progress}
              attachmentCount={item.attachments?.length || 0}
              completedTodoCount={item.completedTodoCount || 0}
              todoChecklist={item.todoChecklist || []}
              onClick={() => {
                handleClick(item);
              }}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManageTelegram;
