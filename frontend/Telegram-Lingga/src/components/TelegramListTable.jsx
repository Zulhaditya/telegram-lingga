import React from "react";
import moment from "moment";

const TelegramListTable = ({ tableData }) => {
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Dibaca":
        return "bg-green-100 text-green-500 border border-green-200";
      case "Belum Dibaca":
        return "bg-purple-100 text-purple-500 border border-purple-200";
      default:
        return "bg-gray-100 text-gray-500 border border-gray-200";
    }
  };

  const getKlasifikasiBadgeColor = (klasifikasi) => {
    switch (klasifikasi) {
      case "RAHASIA":
        return "bg-red-100 text-red-500 border border-red-200";
      case "SEGERA":
        return "bg-orange-100 text-orange-500 border border-orange-200";
      case "PENTING":
        return "bg-green-100 text-green-500 border border-green-200";
      case "EDARAN":
        return "bg-violet-100 text-gray-500 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-500 border border-gray-200";
    }
  };
  return (
    <div className="overflow-x-auto p-0 rounded-lg mt-3">
      <table className="min-w-full">
        <thead>
          <tr className="text-left">
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px]">
              Instansi Pengirim
            </th>
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px]">
              Instansi Penerima
            </th>
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px]">
              Perihal
            </th>
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px] hidden md:table-cell">
              Klasifikasi
            </th>
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px] hidden md:table-cell">
              Status
            </th>
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px] hidden md:table-cell">
              Tanggal
            </th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((telegram) => (
            <tr key={telegram._id} className="border-t border-gray-200">
              <td className="my-4.5 mx-4 text-gray-700 text-[13px] line-clamp-1 overflow-hidden">
                {telegram.instansiPengirim}
              </td>
              <td className="py-4 px-4 text-gray-700 text-[13px]">
                {telegram.instansiPenerima.map((i) => i.nama).join(", ")}
              </td>
              <td className="py-4 px-4 text-gray-700 text-[13px]">
                {telegram.perihal}
              </td>

              <td className="py-4 px-4 text-gray-700 text-[13px]">
                <span
                  className={`px-2 py-1 text-xs rounded inline-block ${getKlasifikasiBadgeColor(
                    telegram.klasifikasi
                  )}`}
                >
                  {telegram.klasifikasi}
                </span>
              </td>
              <td className="py-4 px-4 text-gray-700 text-[13px]">
                <span
                  className={`px-2 py-1 text-xs rounded inline-block ${getStatusBadgeColor(
                    telegram.status
                  )}`}
                >
                  {telegram.status}
                </span>
              </td>
              <td className="py-4 px-4 text-gray-700 text-[13px]">
                {telegram.tanggal
                  ? moment(telegram.tanggal).format("Do MMM YYYY")
                  : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TelegramListTable;
