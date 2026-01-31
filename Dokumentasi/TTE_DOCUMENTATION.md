# Dokumentasi Fitur Tanda Tangan Elektronik (TTE)

## 📋 Daftar Isi
1. [Ikhtisar Fitur](#ikhtisar-fitur)
2. [Fitur User](#fitur-user)
3. [Fitur Admin](#fitur-admin)
4. [Struktur Database](#struktur-database)
5. [API Endpoints](#api-endpoints)
6. [Panduan Penggunaan](#panduan-penggunaan)
7. [Error Handling](#error-handling)

---

## 🎯 Ikhtisar Fitur

Fitur Tanda Tangan Elektronik (TTE) memungkinkan pengguna instansi (OPD) untuk mengajukan permintaan pembuatan tanda tangan elektronik resmi mereka. Admin dapat meninjau, menyetujui, atau menolak pengajuan tersebut, serta mengirimkan visualisasi signature dalam bentuk gambar.

### Alur Keseluruhan:
```
User Ajukan TTE → Admin Verifikasi → Admin Buat Signature → User Terima TTE
```

---

## 👤 Fitur User (OPD)

### 1. Pengajuan TTE (Submit TTE)
**Route:** `/user/submit-tte`
**Komponen:** `SubmitTTE.jsx`

#### Form Input yang Diperlukan:
- **Biodata (dari KTP)**
  - Nama Lengkap (text)
  - NIK - 16 digit (numeric)
  - Tempat Lahir (text)
  - Tanggal Lahir (date)
  - Alamat (textarea)
  - Nomor Telepon (telp)

- **Dokumen**
  - Foto Selfie (image: JPG/PNG, max 5MB)
  - Surat Keterangan dari Instansi (PDF, max 10MB)

#### Validasi:
- Semua field biodata harus diisi
- NIK harus 16 digit dan unik (tidak boleh ada duplikasi)
- Nomor telepon harus format yang valid: `0812345678` atau `+6212345678`
- File foto selfie harus berupa gambar
- File surat keterangan harus PDF
- User hanya bisa memiliki 1 pengajuan yang aktif (pending atau approved)

#### Response:
```json
{
  "message": "Pengajuan TTE berhasil disubmit",
  "tte": {
    "_id": "...",
    "userId": "...",
    "namaLengkap": "...",
    "nik": "...",
    "status": "pending",
    "createdAt": "..."
  }
}
```

### 2. Melihat Status TTE
**Route:** `/user/tte-status`
**Komponen:** `MyTTEStatus.jsx`

#### Fitur:
- Menampilkan status pengajuan TTE user (pending, approved, rejected)
- Menampilkan detail biodata
- Menampilkan file foto selfie dan surat keterangan
- Jika approved: tampilkan signature image dan nama signature
- Jika rejected: tampilkan alasan penolakan
- Download surat keterangan
- Download signature (jika sudah approved)
- Hapus pengajuan (hanya untuk status pending)

#### Status Pengajuan:
- 🟡 **Pending**: Menunggu persetujuan dari admin
- 🟢 **Approved**: Sudah disetujui, signature sudah dibuat dan bisa diunduh
- 🔴 **Rejected**: Ditolak dengan alasan yang jelas

---

## 🔐 Fitur Admin

### 1. Manajemen TTE
**Route:** `/admin/tte`
**Komponen:** `ManageTTE.jsx`

#### Dashboard Stats:
- Total TTE
- TTE Pending (menunggu)
- TTE Approved (disetujui)
- TTE Rejected (ditolak)

#### Filter & Search:
- **Search:** Berdasarkan nama lengkap, NIK, atau nomor telepon
- **Status Filter:** Semua, Pending, Approved, Rejected

#### Tabel Daftar:
Menampilkan kolom:
- Nama Lengkap
- NIK
- Nomor Telepon
- Tanggal Pengajuan
- Status (dengan badge warna)
- Tombol Detail/Action

### 2. Modal Verifikasi TTE
**Komponen:** `TTEApprovalModal.jsx`

#### Tab 1: Informasi
- Data biodata user
- Informasi pengajuan (tanggal, status)
- Siapa yang menyetujui (jika approved)
- Alasan penolakan (jika rejected)

#### Tab 2: Dokumen
- Preview foto selfie
- Download surat keterangan (PDF)
- Preview dan download signature (jika approved)

#### Tab 3: Tindakan (hanya untuk pending)
- **Setujui Pengajuan**
  - Input: Nama Signature (contoh: Direktur, Kepala Bidang, dll)
  - Upload: File signature gambar (JPG/PNG, max 5MB)
  - Konfirmasi dengan tombol "Konfirmasi Persetujuan"

- **Tolak Pengajuan**
  - Input: Alasan penolakan (textarea)
  - Konfirmasi dengan tombol "Konfirmasi Penolakan"

#### Proses Approval:
```
1. Admin membuka detail TTE yang pending
2. Admin masuk ke tab "Tindakan"
3. Admin klik "Setujui Pengajuan"
4. Admin isi nama signature
5. Admin upload file signature gambar
6. Admin konfirmasi
7. TTE berubah status menjadi "approved"
8. Signature image tersimpan
```

---

## 💾 Struktur Database

### Model: TTE
```javascript
{
  userId: ObjectId (ref: User),
  
  // Biodata
  namaLengkap: String (required),
  nik: String (required, unique),
  tempatLahir: String (required),
  tanggalLahir: Date (required),
  alamat: String (required),
  nomorTelepon: String (required),
  
  // File Uploads
  fotoSelfie: String (path),
  suratKeterangan: String (path),
  
  // TTE Signature
  tteSignature: String (path, nullable),
  tteSignatureName: String (nullable),
  
  // Status
  status: String (enum: ["pending", "approved", "rejected"]),
  
  // Admin Info
  approvedBy: ObjectId (ref: User, nullable),
  approvedAt: Date (nullable),
  rejectionReason: String (nullable),
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### Struktur Folder Upload:
```
uploads/
├── profile/           (profil user)
├── tte/
│   ├── selfie/       (foto selfie TTE)
│   ├── surat/        (surat keterangan)
│   └── signature/    (signature yang dibuat admin)
└── telegram/         (dokumen telegram)
```

---

## 🔌 API Endpoints

### Base URL: `http://localhost:8000/api/tte`

#### 1. Submit TTE (User)
```
POST /api/tte/submit
Headers: Authorization, Content-Type: multipart/form-data
Body:
{
  "namaLengkap": "string",
  "nik": "string (16 digit)",
  "tempatLahir": "string",
  "tanggalLahir": "date",
  "alamat": "string",
  "nomorTelepon": "string",
  "fotoSelfie": File,
  "suratKeterangan": File
}

Response (201):
{
  "message": "Pengajuan TTE berhasil disubmit",
  "tte": {...}
}
```

#### 2. Get My TTE (User)
```
GET /api/tte/my-tte
Headers: Authorization
Response (200):
{
  "tte": {
    "_id": "...",
    "namaLengkap": "...",
    "status": "pending|approved|rejected",
    ...
  }
}
```

#### 3. Get All TTE (Admin)
```
GET /api/tte/all?status=pending&search=john
Headers: Authorization (admin only)
Response (200):
{
  "count": 5,
  "tte": [...]
}
```

#### 4. Get TTE Detail
```
GET /api/tte/:id
Headers: Authorization
Response (200):
{
  "tte": {...}
}
```

#### 5. Approve TTE (Admin)
```
PUT /api/tte/:id/approve
Headers: Authorization, Content-Type: multipart/form-data
Body:
{
  "tteSignature": File,
  "tteSignatureName": "string"
}

Response (200):
{
  "message": "TTE berhasil disetujui",
  "tte": {...}
}
```

#### 6. Reject TTE (Admin)
```
PUT /api/tte/:id/reject
Headers: Authorization, Content-Type: application/json
Body:
{
  "rejectionReason": "string"
}

Response (200):
{
  "message": "Pengajuan TTE ditolak",
  "tte": {...}
}
```

#### 7. Delete TTE
```
DELETE /api/tte/:id
Headers: Authorization
Response (200):
{
  "message": "Pengajuan TTE berhasil dihapus"
}
```

#### 8. Get TTE Stats (Admin)
```
GET /api/tte/stats
Headers: Authorization (admin only)
Response (200):
{
  "totalTTE": 10,
  "pendingTTE": 3,
  "approvedTTE": 6,
  "rejectedTTE": 1
}
```

---

## 📚 Panduan Penggunaan

### Untuk User (OPD)

#### Step 1: Akses Menu TTE
1. Login ke aplikasi
2. Klik menu "Tanda Tangan Elektronik" di sidebar

#### Step 2: Ajukan TTE
1. Klik tombol "Ajukan TTE Sekarang" atau "Ajukan TTE Baru"
2. Isi semua field biodata sesuai KTP Anda
3. Upload foto selfie (JPG/PNG, maks 5MB)
4. Upload surat keterangan dari instansi (PDF, maks 10MB)
5. Klik tombol "Ajukan Tanda Tangan Elektronik"
6. Tunggu konfirmasi dari admin

#### Step 3: Pantau Status
1. Klik menu "Tanda Tangan Elektronik"
2. Lihat status pengajuan Anda
3. Jika approved: Download signature gambar
4. Jika rejected: Baca alasan dan ajukan ulang

### Untuk Admin

#### Step 1: Akses Manajemen TTE
1. Login sebagai admin
2. Klik menu "Tanda Tangan Elektronik" di sidebar
3. Atau buka langsung dari dashboard

#### Step 2: Verifikasi Pengajuan
1. Lihat daftar TTE dengan filter status "Pending"
2. Cari pengajuan yang ingin diverifikasi
3. Klik tombol "Detail"

#### Step 3: Proses Approval
1. Buka modal verifikasi
2. Tab "Informasi": Verifikasi data biodata
3. Tab "Dokumen": 
   - Lihat foto selfie
   - Download surat keterangan
   - Verifikasi dokumen asli
4. Tab "Tindakan":
   - **Jika valid**: Klik "Setujui", isi nama signature, upload file signature, konfirmasi
   - **Jika tidak valid**: Klik "Tolak", isi alasan, konfirmasi

#### Step 4: Follow-up
- Admin bisa melihat history pengajuan yang sudah approved/rejected
- Admin bisa download signature yang telah dibuat

---

## ⚠️ Error Handling

### Backend Error Responses

#### 400 Bad Request
```json
{
  "message": "Semua field biodata harus diisi"
}
```

#### 400 Duplikasi Data
```json
{
  "message": "NIK sudah terdaftar dalam sistem"
}
```

#### 400 Pengajuan Aktif
```json
{
  "message": "Anda sudah memiliki pengajuan TTE yang aktif"
}
```

#### 404 Not Found
```json
{
  "message": "Data TTE tidak ditemukan"
}
```

#### 403 Forbidden
```json
{
  "message": "Anda tidak memiliki akses"
}
```

#### 500 Server Error
```json
{
  "message": "Server error",
  "error": "error details"
}
```

### Frontend Error Handling
Semua error ditangani menggunakan `react-hot-toast`:
- Error dari server ditampilkan sebagai toast notification merah
- Success messages ditampilkan sebagai toast notification hijau
- Validasi form dilakukan di frontend sebelum submit

---

## 🔒 Security

1. **Authentication**: Semua endpoint memerlukan JWT token
2. **Authorization**: 
   - User hanya bisa akses data TTE mereka sendiri
   - Admin bisa akses semua TTE
3. **File Upload**:
   - Validasi tipe MIME
   - Validasi ukuran file
   - File disimpan dengan timestamp di nama file
4. **Database**:
   - NIK unique (tidak boleh duplikasi)
   - User hanya bisa punya 1 pengajuan aktif

---

## 🎨 UI/UX Design

### Component Colors & Icons:
- **Pending Status**: 🟡 Kuning (#FCD34D)
- **Approved Status**: 🟢 Hijau (#10B981)
- **Rejected Status**: 🔴 Merah (#EF4444)
- **Icon TTE**: 📋 LuFileSignature

### Responsive Design:
- Desktop: Grid layout optimal
- Tablet: Adjusted spacing & font sizes
- Mobile: Single column, touch-friendly buttons

---

## 📝 Catatan Penting

1. **Validasi NIK**: Gunakan format 16 digit yang valid
2. **Nama Signature**: Beri nama yang jelas dan profesional (contoh: "Direktur Utama", "Kepala Bagian IT")
3. **Signature File**: Gunakan file PNG dengan background transparan untuk hasil terbaik
4. **Surat Keterangan**: Pastikan PDF jelas dan terbaca dengan baik
5. **Foto Selfie**: Pastikan wajah jelas terlihat dan pencahayaan cukup

---

## 🚀 Teknologi yang Digunakan

### Backend:
- Node.js + Express.js
- MongoDB + Mongoose
- Multer (file upload)
- JWT (authentication)
- bcryptjs (password hashing)

### Frontend:
- React 19
- React Router DOM 7
- Axios (HTTP client)
- React Hot Toast (notifications)
- React Icons (UI icons)
- Tailwind CSS (styling)
- Moment.js (date formatting)
- Recharts (charts - untuk future use)

---

## 📞 Support & Troubleshooting

### Masalah Umum:

1. **Error "NIK sudah terdaftar"**
   - Gunakan NIK yang belum pernah diajukan sebelumnya
   - Cek apakah ada pengajuan sebelumnya dengan NIK yang sama

2. **File tidak bisa diupload**
   - Cek ukuran file (selfie max 5MB, surat max 10MB)
   - Cek format file (selfie: JPG/PNG, surat: PDF)

3. **Tidak bisa akses halaman TTE**
   - Pastikan sudah login
   - Pastikan user adalah admin atau opd (bukan guest)

4. **Signature tidak muncul setelah approval**
   - Reload halaman atau buka kembali detail TTE
   - Cek di tab "Dokumen"

---

**Versi Dokumentasi:** 1.0
**Last Updated:** January 31, 2026
