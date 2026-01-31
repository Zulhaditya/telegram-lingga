# 🚀 Quick Start Guide - Fitur Tanda Tangan Elektronik

## ⚡ 5 Menit Setup

### Step 1: Buat Folder (1 menit)
```bash
cd backend
mkdir -p uploads/tte/{selfie,surat,signature}
```

### Step 2: Update Server (sudah dilakukan)
- File `server.js` sudah update dengan route TTE ✅
- File `uploadMiddleware.js` sudah update ✅

### Step 3: Start Server (1 menit)
```bash
cd backend
npm run dev
```
Server akan berjalan di `http://localhost:8000`

### Step 4: Start Frontend (1 menit)
```bash
cd frontend/Telegram-Lingga
npm run dev
```
Frontend akan berjalan di `http://localhost:5173`

### Step 5: Login & Test (2 menit)

---

## 👤 Testing sebagai User (OPD)

### Login Credentials (gunakan user yang ada di database)
```
Email: user@example.com
Password: password123
```

### Step 1: Navigate ke TTE
1. Login ke aplikasi
2. Lihat sidebar menu
3. Klik "Tanda Tangan Elektronik"
4. Atau klik tombol "Ajukan TTE Sekarang" dari dashboard

### Step 2: Submit TTE
1. Isi form dengan data test:
   ```
   Nama Lengkap: Budi Santoso
   NIK: 1234567890123456
   Tempat Lahir: Jakarta Pusat
   Tanggal Lahir: 01 Januari 1990
   Alamat: Jl. Merdeka No. 123, Jakarta
   Nomor Telepon: 081234567890
   ```

2. Upload file:
   - Foto Selfie: Ambil file JPG/PNG apapun (max 5MB)
   - Surat Keterangan: Gunakan file PDF apapun (max 10MB)

3. Klik tombol "Ajukan Tanda Tangan Elektronik"

4. Tunggu popup "Pengajuan berhasil dikirim!"

### Step 3: Cek Status
1. Klik menu "Tanda Tangan Elektronik" lagi
2. Lihat card dengan status "Menunggu Persetujuan" 🟡
3. Data yang Anda isi ditampilkan dengan lengkap

---

## 👨‍💼 Testing sebagai Admin

### Login Credentials (gunakan admin dari database)
```
Email: admin@example.com
Password: password123
```

### Step 1: Navigate ke Manage TTE
1. Login sebagai admin
2. Klik menu "Tanda Tangan Elektronik"
3. Atau klik "Kelola Sekarang" dari dashboard

### Step 2: Lihat Daftar Pengajuan
- Lihat stats cards (Total, Pending, Approved, Rejected)
- Lihat tabel daftar pengajuan
- Cari pengajuan yang status "Pending"

### Step 3: Verifikasi Pengajuan
1. Klik tombol "Detail" pada pengajuan pending
2. Modal akan terbuka dengan 3 tab:

**Tab 1: Informasi**
- Verifikasi data biodata yang diajukan
- Lihat tanggal pengajuan
- Lihat info penyetujuan (jika sudah)

**Tab 2: Dokumen**
- Lihat preview foto selfie
- Download surat keterangan PDF
- Lihat signature (jika sudah approved)

**Tab 3: Tindakan** (hanya jika status Pending)
- 2 opsi: Setujui atau Tolak

### Step 4: Setujui Pengajuan
1. Klik tab "Tindakan"
2. Klik tombol "Setujui Pengajuan"
3. Form akan muncul dengan input:
   - Nama Signature: Isi dengan "Direktur" atau "Kepala Bagian IT"
   - Upload File Signature: Upload gambar PNG/JPG apapun

4. Klik "Konfirmasi Persetujuan"
5. Tunggu popup "Pengajuan TTE berhasil disetujui!"

### Step 5: Verify Approval
1. Lihat tabel, status berubah menjadi "Disetujui" 🟢
2. Klik Detail lagi, lihat signature di tab Dokumen
3. User sekarang bisa download signature

### Step 6 (Optional): Tolak Pengajuan
Buat test dengan user lain, lalu:
1. Klik tab "Tindakan"
2. Klik tombol "Tolak Pengajuan"
3. Isi alasan: "Dokumen kurang lengkap"
4. Klik "Konfirmasi Penolakan"
5. Status berubah "Ditolak" 🔴

---

## 📋 Checklist Testing

### User Feature
- [ ] Bisa akses menu TTE dari sidebar
- [ ] Bisa buka halaman form pengajuan
- [ ] Form validation bekerja (try kosong fields)
- [ ] File upload bekerja (try upload file salah format)
- [ ] Pengajuan berhasil disubmit
- [ ] Redirect ke status page
- [ ] Bisa lihat status pengajuan (pending)
- [ ] Bisa download surat keterangan
- [ ] Bisa lihat foto selfie preview
- [ ] Bisa hapus pengajuan (pending only)

### Admin Feature
- [ ] Bisa akses menu TTE dari sidebar
- [ ] Lihat stats cards dengan angka yang benar
- [ ] Search bekerja (cari nama/NIK)
- [ ] Filter by status bekerja
- [ ] Tabel menampilkan TTE list
- [ ] Klik Detail buka modal
- [ ] Tab Informasi menampilkan biodata
- [ ] Tab Dokumen menampilkan files
- [ ] Tab Tindakan punya buttons approval/rejection
- [ ] Approve flow: input name, upload file, confirm
- [ ] Reject flow: input reason, confirm
- [ ] Status berubah setelah action
- [ ] Signature image tampil setelah approve

### UI/UX Quality
- [ ] Color scheme consistent (yellow/green/red)
- [ ] Icons meaningful dan jelas
- [ ] Responsive di mobile/tablet/desktop
- [ ] Toast notifications muncul dengan tepat
- [ ] Modal user-friendly dengan tabs clear
- [ ] Buttons disabled saat loading
- [ ] Error messages jelas dan helpful

---

## 🔧 Troubleshooting

### "404 Not Found" saat akses TTE page
**Solution:**
- Pastikan server sudah running (`npm run dev` di backend)
- Pastikan route di `App.jsx` sudah update
- Cek browser console untuk error

### "File upload failed"
**Solution:**
- Pastikan folder `uploads/tte/` sudah dibuat
- Cek file size (selfie max 5MB, surat max 10MB)
- Cek format file (selfie: JPG/PNG, surat: PDF)

### "NIK sudah terdaftar"
**Solution:**
- Gunakan NIK yang belum pernah diajukan
- Ubah 1-2 digit terakhir dari NIK test

### "Cannot read property 'role' of null"
**Solution:**
- Logout dan login ulang
- Refresh browser
- Cek token JWT di localStorage

### Modal tidak muncul saat klik Detail
**Solution:**
- Cek browser console untuk error
- Verify backend API response
- Check network tab di DevTools

---

## 📞 API Testing dengan Postman

### 1. Submit TTE
```
POST http://localhost:8000/api/tte/submit
Headers:
  Authorization: Bearer <token>
  Content-Type: multipart/form-data

Body (form-data):
  namaLengkap: Budi Santoso
  nik: 1234567890123456
  tempatLahir: Jakarta
  tanggalLahir: 1990-01-01
  alamat: Jl. Test
  nomorTelepon: 081234567890
  fotoSelfie: [file]
  suratKeterangan: [file]
```

### 2. Get My TTE
```
GET http://localhost:8000/api/tte/my-tte
Headers:
  Authorization: Bearer <token>
```

### 3. Get All TTE (Admin)
```
GET http://localhost:8000/api/tte/all?status=pending&search=budi
Headers:
  Authorization: Bearer <admin_token>
```

### 4. Approve TTE
```
PUT http://localhost:8000/api/tte/:id/approve
Headers:
  Authorization: Bearer <admin_token>
  Content-Type: multipart/form-data

Body (form-data):
  tteSignatureName: Direktur
  tteSignature: [file]
```

### 5. Reject TTE
```
PUT http://localhost:8000/api/tte/:id/reject
Headers:
  Authorization: Bearer <admin_token>
  Content-Type: application/json

Body (json):
{
  "rejectionReason": "Dokumen tidak lengkap"
}
```

---

## 📊 Monitoring

### Check Server Logs
```bash
# Terminal 1 (backend)
cd backend && npm run dev
# Lihat output logs saat submit/approve/reject

# Terminal 2 (frontend)
cd frontend/Telegram-Lingga && npm run dev
# Lihat console saat navigate/submit
```

### Check MongoDB
```bash
# Lihat TTE collection
db.ttess.find().pretty()

# Lihat pending TTE
db.ttess.find({status: "pending"})

# Lihat approved TTE
db.ttess.find({status: "approved"})
```

### Check File System
```bash
# Lihat files yang terupload
ls -la backend/uploads/tte/selfie/
ls -la backend/uploads/tte/surat/
ls -la backend/uploads/tte/signature/
```

---

## 🎓 Learning Path

Jika ingin memahami lebih dalam:

1. **Backend Architecture**
   - Baca `backend/models/TTE.js` - Structure
   - Baca `backend/controllers/tteController.js` - Logic
   - Baca `backend/routes/tteRoutes.js` - Endpoints

2. **Frontend Components**
   - Baca `src/components/TTE/TTEForm.jsx` - Form handling
   - Baca `src/pages/User/SubmitTTE.jsx` - User flow
   - Baca `src/pages/Admin/ManageTTE.jsx` - Admin flow

3. **API Integration**
   - Baca `src/utils/apiPaths.js` - API paths
   - Trace axios calls di components
   - Monitor network tab di DevTools

4. **Documentation**
   - `Dokumentasi/TTE_DOCUMENTATION.md` - Complete docs
   - `SETUP_TTE_FEATURE.md` - Setup guide
   - `IMPLEMENTATION_SUMMARY_TTE.md` - Implementation details

---

## ✨ Next Steps (Optional)

Setelah fitur TTE berjalan dengan baik, berikut saran improvement:

1. **Email Notification**
   - Kirim email saat TTE diapprove
   - Kirim email saat TTE ditolak

2. **Signature Templates**
   - Buat template signature standard
   - Admin pilih template, tinggal customize nama

3. **Export Features**
   - Export TTE list ke Excel
   - Export individual TTE report

4. **Signature Verification**
   - Verify signature asli (integrity)
   - Timestamp pada signature

5. **Advanced Search**
   - Filter by date range
   - Filter by approval status date

---

## 📝 Notes

- Semua validasi sudah diimplementasikan
- Error handling sudah comprehensive
- UI/UX design sudah professional
- Code sudah well-documented
- Ready untuk production (dengan beberapa improvements)

---

## 🎉 Selesai!

Anda sekarang punya fitur TTE yang lengkap dan siap digunakan!

Jika ada pertanyaan atau issue, refer ke:
- `Dokumentasi/TTE_DOCUMENTATION.md`
- `SETUP_TTE_FEATURE.md`
- atau buka issue di repository

**Happy Testing! 🚀**

---

**Quick Start Guide Version:** 1.0
**Last Updated:** January 31, 2026
