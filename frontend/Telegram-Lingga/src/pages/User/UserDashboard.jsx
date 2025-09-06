import React, { useContext, useEffect, useState } from "react";
import { useUserAuth } from "../../hooks/useUserAuth";
import { UserContext } from "../../context/userContext";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";
import InfoCard from "../../components/Cards/InfoCard";
import { addThousandsSeparator } from "../../utils/helper";
import TelegramListTable from "../../components/TelegramListTable";
import { LuArrowRight } from "react-icons/lu";
import CustomPieChart from "../../components/Charts/CustomPieChart";
import CustomBarChart from "../../components/Charts/CustomBarChart";

const COLORS = ["8D51FF", "#00B8DB", "#7BCE00"];

const UserDashboard = () => {
  useUserAuth();

  const { user } = useContext(UserContext);

  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);

  const prepareChartData = (data) => {
    const telegramDistribution = data?.telegramDistribution || null;
    const telegramKlasifikasiLevels = data?.telegramKlasifikasiLevels || null;

    const telegramDistributionData = [
      { status: "Dibaca", count: telegramDistribution?.Dibaca || 0 },
      { status: "Belum Dibaca", count: telegramDistribution?.BelumDibaca || 0 },
      { status: "Semua", count: telegramDistribution?.Semua || 0 },
    ];

    setPieChartData(telegramDistributionData);

    const KlasifikasiLevelData = [
      { klasifikasi: "BIASA", count: telegramKlasifikasiLevels?.BIASA || 0 },
      { klasifikasi: "SEGERA", count: telegramKlasifikasiLevels?.SEGERA || 0 },
      {
        klasifikasi: "RAHASIA",
        count: telegramKlasifikasiLevels?.RAHASIA || 0,
      },
      { klasifikasi: "EDARAN", count: telegramKlasifikasiLevels?.EDARAN || 0 },
      {
        klasifikasi: "PENTING",
        count: telegramKlasifikasiLevels?.PENTING || 0,
      },
    ];

    setBarChartData(KlasifikasiLevelData);
  };

  const getDashboardData = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.TELEGRAMS.GET_USER_DASHBOARD_DATA
      );

      if (response.data) {
        setDashboardData(response.data);
        prepareChartData(response.data?.charts || null);
      }
    } catch (error) {
      console.error("Error saat fetching data instansi:", error);
    }
  };

  const onSeeMore = () => {
    navigate("/user/telegram");
  };

  useEffect(() => {
    getDashboardData();

    return () => { };
  }, []);

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="card my-5">
        <div>
          <div className="col-span-3">
            <h2 className="text-xl md:text-2xl">
              Selamat Datang, {user?.nama}!
            </h2>
            <p className="text-xs md:text-[13px] text-gray-400 mt-1.5">
              {moment().format("dddd Do MMM YYYY")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mt-5">
          <InfoCard
            label="Total Telegram"
            value={addThousandsSeparator(
              dashboardData?.charts?.telegramDistribution?.Semua || 0
            )}
            color="bg-primary"
          />
          <InfoCard
            label="Dibaca"
            value={addThousandsSeparator(
              dashboardData?.charts?.telegramDistribution?.Dibaca || 0
            )}
            color="bg-cyan-500"
          />
          <InfoCard
            label="Belum Dibaca"
            value={addThousandsSeparator(
              dashboardData?.charts?.telegramDistribution?.BelumDibaca || 0
            )}
            color="bg-violet-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 md:my-6">
        <div>
          <div className="card">
            <div className="flex items-center justify-between">
              <h5 className="font-medium ">Distribusi Telegram</h5>
            </div>

            <CustomPieChart data={pieChartData} colors={COLORS} />
          </div>
        </div>

        <div>
          <div className="card">
            <div className="flex items-center justify-between">
              <h5 className="font-medium ">Klasifikasi Telegram</h5>
            </div>

            <CustomBarChart data={barChartData} />
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between">
              <h5 className="text-lg">Telegram Terbaru</h5>

              <button className="card-btn" onClick={onSeeMore}>
                Lihat semua <LuArrowRight className="text-base" />
              </button>
            </div>

            <TelegramListTable
              tableData={dashboardData?.recentTelegrams || []}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
