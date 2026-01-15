import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const CustomBarChart = ({ data }) => {
  // Fungsi untuk generate warna
  const getBarColor = (entry) => {
    switch (entry?.priority || entry?.klasifikasi) {
      case "BIASA":
        return "#10B981"; // Hijau
      case "SEGERA":
        return "#F59E0B"; // Kuning
      case "RAHASIA":
        return "#EF4444"; // Merah
      case "PENTING":
        return "#8B5CF6"; // Ungu
      case "EDARAN":
        return "#06B6D4"; // Cyan
      default:
        return "#6B7280"; // Abu-abu
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white shadow-md rounded-lg p-2 border border-gray-300">
          <p className="text-xs font-semibold text-purple-800 mb-1">
            {payload[0].payload.klasifikasi}
          </p>
          <p className="text-sm text-gray-600">
            Jumlah:{" "}
            <span className="text-sm font-medium text-gray-900">
              {payload[0].payload.count}
            </span>
          </p>
        </div>
      );
    }

    return null;
  };
  return (
    <div className="">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid stroke="none" />

          <XAxis
            dataKey="klasifikasi"
            tick={{ fontSize: 12, fill: "#555" }}
            stroke="none"
          />

          <YAxis tick={{ fontSize: 12, fill: "#555" }} stroke="none" />

          <Tooltip content={CustomTooltip} cursor={{ fill: "transparent" }} />

          <Bar
            dataKey="count"
            nameKey="klasifikasi"
            fill="#FF8042"
            radius={[10, 10, 0, 0]}
            activeDot={{ r: 8, fill: "yellow" }}
            activeStyle={{ fill: "green" }}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={getBarColor(entry)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomBarChart;
