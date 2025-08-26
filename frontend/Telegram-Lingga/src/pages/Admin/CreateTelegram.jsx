import {useState} from 'react';
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { PRIORITY_DATA } from "../../utils/data";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { LuTrash2 } from "react-icons/lu";
import SelectDropdown from "../../components/Inputs/SelectDropdown"
import SelectUsers from "../../components/Inputs/SelectUsers"

const CreateTelegram = () => {
  
  const location = useLocation();
  const { telegramId } = location.state || {};
  const navigate = useNavigate();

  const [telegramData, setTelegramData] = useState({
    instansiPengirim: "",
    instansiPenerima: [],
    perihal: "",
    klasifikasi: "BIASA",
    todoChecklist: [],
    attachments: [],
  });

  const [currentTelegram, setCurrrentTelegram] = useState(null);
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);
  
  const handleValueChange = (key, value) => {
    setTelegramData((prevData) => ({...prevData, [key]: value }));
  };

  
  const clearData = () => {
    // Reset form
    setTelegramData({
      instansiPengirim: "",
      instansiPenerima: [],
      perihal: "",
      klasifikasi: "",
      todoChecklist: [],
      attachments: [],
      tanggal: null,
    });
  };

  // Buat telegram
  const createTelegram = async () => {};

  // Update telegram
  const updateTelegram = async () => {};
  
  const handleSubmit = async () => {};

  // Dapatkan telegram info berdasarkan id
  const getTelegramDetailsById = async () => {};

  // Hapus telegram
  const deleteTelegram = async () => {};
  

  return (
    <DashboardLayout activeMenu="Create Telegram">
      <div className="mt-5">
        <div className="grid grid-cols-1 md:grid-cols-4 mt-4">
          <div className="form-card col-span-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-xl font-medium">
                {telegramId ? "Update Telegram" : "Buat Telegram"}
              </h2>
              
              {telegramId && (
                <button
                  className="flex items-center gap-1.5 text-[13px] font-medium text-rose-500 bg-rose-50 rounded px-2 py-1 border border-rose-100 hover:border-rose-300 cursor-pointer"
                  onClick={() => setOpenDeleteAlert(true)}
                >
                  <LuTrash2 className="text-base" /> Hapus
                </button>
              )}
            </div>
            
            <div className="mt-4">
              <label className="text-xs font-medium text-slate-600">
                Instansi Pengirim
              </label>
              
              <input 
                placeholder="Kemendagri"
                className="form-input"
                value={telegramData.instansiPengirim}
                onChange={({ target }) => 
                  handleValueChange("instansiPengirim", target.value)
                }
              />
            </div>
            
            <div className="mt-4">
              <label className="text-xs font-medium text-slate-600">
                Instansi Penerima

              </label>
              
              <SelectUsers 
                selectedUsers={telegramData.instansiPenerima}
                setSelectedUsers={(value) => {
                  handleValueChange("instansiPenerima", value);
                }}
              />
              
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium text-slate-600">
                Perihal
              </label>

              <textarea
                placeholder="Pelatihan Teknis CPNS 2025"
                className="form-input"
                rows={4}
                value={telegramData.perihal}
                onChange={({ target }) => 
                  handleValueChange("perihal", target.value)
                }
              >

              </textarea>
            </div>

            <div className="grid grid-cols-12 gap-4 mt-2">
              <div className="col-span-6 md:col-span-4">
                <label className="text-xs font-medium text-slate-600">
                  Klasifikasi
                </label>

                <SelectDropdown
                  options={PRIORITY_DATA}
                  value={telegramData.klasifikasi}
                  onChange={(value) => handleValueChange("klasifikasi", value)}
                  placeholder="Pilih klasifikasi"
                />
              </div>

            <div className="col-span-6 md:col-span-4">
              <label className="text-xs font-medium text-slate-600">
                Tanggal
              </label>
              
              <input 
                placeholder=""
                className="form-input"
                value={telegramData.tanggal}
                onChange={({ target }) =>
                  handleValueChange("tanggal", target.value)}
                type="date"
              />
            </div>

            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default CreateTelegram
