import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import moment from 'moment';
import AvatarGroup from "../../components/AvatarGroup";
import { LuSquareArrowOutUpRight } from 'react-icons/lu';

const ViewTelegramDetails = () => {
  const { id } = useParams();
  const [telegram, setTelegram] = useState(null);

  const getStatusTagColor = (status) => {
    switch (status) {
      case "Dibaca":
        return "text-lime-500 bg-lime-50 border border-lime-500/20";
      case "Belum Dibaca":
        return "text-cyan-500 bg-cyan-50 border border-cyan-500/20";
      default:
        return "text-violet-500 bg-violet-50 border border-violet-500/10";
    }
  };

  // Dapatkan info telegram berdasarkan id
  const getTelegramDetailsById = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.TELEGRAMS.GET_TELEGRAM_BY_ID(id)
      );

      if (response.data) {
        const telegramInfo = response.data;
        setTelegram(telegramInfo);
      }
    } catch (error) {
      console.error("Error saat fetching data telegram:", error);
    }
  };

  // Handle checklist
  const updateTodoChecklist = async (index) => {
    const todoChecklist = [...telegram?.todoChecklist];
    const telegramId = id;

    if (todoChecklist && todoChecklist[index]) {
      todoChecklist[index].completed = !todoChecklist[index].completed;

      try {
        const response = await axiosInstance.put(
          API_PATHS.TELEGRAMS.UPDATE_TODO_CHECKLIST(telegramId),
          { todoChecklist }
        );
        if (response.status === 200) {
          setTelegram(response.data?.telegram || telegram);
        } else {
          todoChecklist[index].completed = !todoChecklist[index].completed;
        }
      } catch (error) {
        todoChecklist[index].completed = !todoChecklist[index].completed;
      }
    }
  };

  // Handle klik link
  const handleLinkClick = (link) => {
    window.open(link, "_blank");
  };

  useEffect(() => {
    if (id) {
      getTelegramDetailsById();
    }

    return () => { };
  }, [id]);


  return (
    <DashboardLayout activeMenu="Telegram Instansi">
      <div className="mt-5">
        {telegram && (
          <div className="grid grid-cols-1 md:grid-cols-4 mt-4">
            <div className="form-card col-span-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base md:text-base font-medium">
                  {telegram?.perihal}
                </h2>

                <div
                  className={`text-[13px] font-medium ${getStatusTagColor(
                    telegram?.status
                  )} px-4 py-0.5 rounded`}
                >
                  {telegram?.status}
                </div>
              </div>

              <div className="mt-4">
                <InfoBox label="Perihal" value={telegram?.perihal} />
              </div>

              <div className="grid grid-cols-12 gap-4 mt-4">
                <div className="col-span-6 md:col-span-4">
                  <InfoBox label="Klasifikasi" value={telegram?.klasifikasi} />
                </div>

                <div className="col-span-6 md:col-span-4">
                  <InfoBox label="Tanggal"
                    value={
                      telegram?.tanggal
                        ? moment(telegram?.tanggal).format("Do MMM YYYY")
                        : "N/A"
                    }
                  />
                </div>

                <div className="col-span-6 md:col-span-4">
                  <label className="text-xs font-medium text-slate-500">
                    Instansi Penerima
                  </label>

                  <AvatarGroup
                    avatars={
                      telegram?.instansiPenerima?.map((item) => item?.profileImageUrl) ||
                      []
                    }
                    maxVisible={5}
                  />
                </div>
              </div>

              <div className="mt-2">
                <label className="text-xs font-medium text-slate-500">
                  Checklist
                </label>

                {telegram?.todoChecklist?.map((item, index) => (
                  <TodoChecklist
                    key={`todo_${index}`}
                    text={item.text}
                    isChecked={item?.completed}
                    onChange={() => updateTodoChecklist(index)}
                  />
                ))}
              </div>

              {telegram?.attachments?.length > 0 && (
                <div className="mt-2">
                  <label className="text-xs font-medium text-slate-500">
                    Lampiran
                  </label>

                  {telegram?.attachments?.map((link, index) => (
                    <Attachment
                      key={`link_${index}`}
                      link={link}
                      index={index}
                      onClick={() => handleLinkClick(link)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default ViewTelegramDetails;

const InfoBox = ({ label, value }) => {
  return <>
    <label className="text-xs font-medium text-slate-500">{label}</label>
    <p className="text-[12px] md:text-[13px] font-medium text-gray-700 mt-0.5">
      {value}
    </p>
  </>
}

const TodoChecklist = ({ text, isChecked, onChange }) => {
  return <div className="flex items-center gap-3 p-3">
    <input
      type="checkbox"
      checked={isChecked}
      onChange={onChange}
      className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded-sm outline-none cursor-pointer"
    />

    <p className="text-[13px] text-gray-800">{text}</p>
  </div>
}

const Attachment = ({ link, index, onClick }) => {
  return <div
    className="flex justify-between bg-gray-50 border border-gray-100 px-3 py-2 rounded-md mb-3 mt-2 cursor-pointer"
    onClick={onClick}
  >
    <div className="flex-1 flex items-center gap-3 border border-gray-100">
      <span className="text-xs text-gray-400 font-semibold mr-2">
        {index < 9 ? `0${index + 1}` : index + 1}
      </span>

      <p className="text-xs text-black">{link}</p>
    </div>

    <LuSquareArrowOutUpRight className="text-gray-400" />
  </div>
}
