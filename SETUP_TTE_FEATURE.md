# Panduan Setup Fitur TTE

## 📁 Struktur Folder yang Diperlukan

Sebelum menjalankan aplikasi, pastikan struktur folder upload sudah dibuat:

```
backend/
├── uploads/
│   ├── profile/           # Profil user photos
│   ├── tte/
│   │   ├── selfie/       # Foto selfie untuk TTE
│   │   ├── surat/        # Surat keterangan PDF
│   │   └── signature/    # Signature images (diupload admin)
│   └── telegram/         # Telegram documents
```

## 🚀 Setup Instructions

### 1. Buat Folder Uploads
```bash
cd backend
mkdir -p uploads/profile uploads/tte/selfie uploads/tte/surat uploads/tte/signature uploads/telegram
```

### 2. Install Dependencies (jika belum)
```bash
npm install
```

### 3. Environment Variables
Pastikan file `.env` sudah konfigurasi dengan benar:
```env
PORT=8000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
ADMIN_INVITE_TOKEN=your_admin_token
```

### 4. Run Backend Server
```bash
npm run dev
```

### 5. Run Frontend
```bash
cd frontend/Telegram-Lingga
npm run dev
```

## 📋 Checklist Fitur TTE

Backend:
- ✅ Model TTE (`models/TTE.js`)
- ✅ Controller TTE (`controllers/tteController.js`)
- ✅ Routes TTE (`routes/tteRoutes.js`)
- ✅ Updated Middleware (`middleware/uploadMiddleware.js`)
- ✅ Server updated (`server.js`)

Frontend:
- ✅ API Paths updated (`utils/apiPaths.js`)
- ✅ Form Component (`components/TTE/TTEForm.jsx`)
- ✅ Status Card (`components/TTE/TTEStatusCard.jsx`)
- ✅ Approval Modal (`components/TTE/TTEApprovalModal.jsx`)
- ✅ User Submit Page (`pages/User/SubmitTTE.jsx`)
- ✅ User Status Page (`pages/User/MyTTEStatus.jsx`)
- ✅ Admin Manage Page (`pages/Admin/ManageTTE.jsx`)
- ✅ Routes updated (`App.jsx`)
- ✅ Menu updated (`utils/data.js`)
- ✅ User Dashboard updated
- ✅ Admin Dashboard updated

## 🧪 Testing

### Test User Flow:
1. Login sebagai user (OPD)
2. Klik menu "Tanda Tangan Elektronik"
3. Klik "Ajukan TTE Sekarang"
4. Isi form dengan data test:
   - Nama: Test User
   - NIK: 1234567890123456
   - Tempat Lahir: Jakarta
   - Tanggal Lahir: 01/01/1990
   - Alamat: Jl Test No 123
   - Nomor Telepon: 08123456789
5. Upload foto selfie dan surat keterangan
6. Klik submit

### Test Admin Flow:
1. Login sebagai admin
2. Klik menu "Tanda Tangan Elektronik"
3. Lihat daftar pengajuan TTE
4. Klik tombol "Detail" untuk pengajuan status "Pending"
5. Verifikasi data di tab "Informasi"
6. Lihat dokumen di tab "Dokumen"
7. Klik tab "Tindakan"
8. Klik "Setujui Pengajuan"
9. Isi nama signature (contoh: "Direktur")
10. Upload file signature (gambar PNG atau JPG)
11. Klik "Konfirmasi Persetujuan"

### Test User Check Status:
1. Login sebagai user
2. Klik menu "Tanda Tangan Elektronik"
3. Lihat status pengajuan
4. Jika approved: Download signature
5. Lihat detail approved info

## 🐛 Common Issues & Solutions

### Issue: "File uploads not working"
**Solution:**
- Pastikan folder uploads sudah dibuat
- Cek permission folder (chmod 755)
- Restart server

### Issue: "NIK validation error"
**Solution:**
- Pastikan NIK 16 digit
- Tidak ada spasi atau karakter special
- Cek apakah NIK sudah pernah diajukan

### Issue: "Cannot read property 'path' of undefined"
**Solution:**
- Pastikan file berhasil diupload
- Cek ukuran file tidak melebihi limit
- Cek tipe file sesuai requirement

### Issue: "Unauthorized - Admin only"
**Solution:**
- Pastikan login sebagai admin
- Cek token JWT masih valid
- Logout dan login kembali

## 📊 Database Collections

Setelah pertama kali aplikasi berjalan, database akan otomatis membuat collection:
- `users` - User data
- `ttess` - TTE data (pluralized)
- `telegrams` - Telegram data
- dll

## 🔐 Security Best Practices

1. **Always validate file uploads**
   - Cek tipe MIME
   - Cek ukuran file
   - Rename file dengan timestamp

2. **Protect uploaded files**
   - Tidak boleh accessible langsung
   - Harus through API yang authenticated
   - Gunakan proper CORS settings

3. **Validate user input**
   - Frontend validation
   - Backend validation
   - Sanitize input

4. **Monitor file uploads**
   - Log semua file yang diupload
   - Track storage usage
   - Delete old/unused files periodically

## 📞 Support

Jika ada pertanyaan atau issues, hubungi developer atau buka issue di repository.

---

**Setup Date:** January 31, 2026
**Version:** 1.0
