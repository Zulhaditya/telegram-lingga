import { useState } from "react";

const UserCard = ({ userInfo }) => {
  return (
    <div className="user-card p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={userInfo?.profileImageUrl}
            alt={`Avatar`}
            className="w-12 h-12 rounded-full border-2 border-white"
          />

          <div>
            <p className="text-sm font-medium">{userInfo?.nama}</p>
            <p className="text-xs text-gray-500">{userInfo?.email}</p>
          </div>
        </div>
      </div>

      <div className="flex items-end gap-3 mt-5">
        <StatCard
          label="Dibaca"
          count={userInfo?.telegramDibaca || 0}
          status="Dibaca"
        />
        <StatCard
          label="Belum Dibaca"
          count={userInfo?.telegramBelumDibaca || 0}
          status="Belum Dibaca"
        />
      </div>
    </div>
  )
}

export default UserCard;

const StatCard = ({ label, count, status }) => {
  const getStatusTagColor = () => {
    switch (status) {
      case "Dibaca":
        return "text-lime-500 bg-lime-50 border border-lime-500/20";
      case "Belum Dibaca":
        return "text-cyan-500 bg-cyan-50 border border-cyan-500/20";
      default:
        return "text-violet-500 bg-violet-50 border border-violet-500/10";
    }
  }

  return (
    <div
      className={`flex-1 text-[10px] font-medium ${getStatusTagColor()} px-4 py-0.5 rounded`}
    >
      <span className="text-[12px] font-semibold">{count}</span> <br /> {label}
    </div>
  )
}
