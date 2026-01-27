# ⭐ Fitur-Fitur Utama

## 1. Manajemen Koleksi

### 📍 Lokasi
- **HTML**: `Template/admin/koleksi.html`
- **Controller**: `Js/controller/tabel_koleksi_updated.js`, `add-collection.js`

### Fitur yang Tersedia

#### A. Lihat Semua Koleksi (Tabel)
- Tampil semua koleksi dalam bentuk tabel
- Kolom: Foto, Nama, Nomor Register, Nomor Inventory, Kategori, Gudang, Kondisi, Aksi
- Support scrolling horizontal (mobile)

#### B. Filter & Search
- **Filter Gudang** (sidebar): Klik tombol gudang untuk filter
- **Filter Kategori** (dropdown): Pilih kategori untuk filter
- **Search Text**: Cari berdasarkan nama koleksi
- Kombinasi filter berjalan real-time

#### C. Tambah Koleksi Baru
- Klik tombol "Tambah Koleksi"
- Form fields:
  - Nama Benda (wajib)
  - Nomor Register (wajib, auto-check duplikasi)
  - Nomor Inventory (wajib, auto-check duplikasi)
  - Kategori (dropdown, wajib)
  - Gudang → Rak → Tahap (cascading dropdown)
  - Deskripsi (optional)
  - Dimensi: Panjang, Lebar, Tinggi (desimal)
  - Kondisi: Baik/Rusak/Perlu Perbaikan (dropdown)
  - Foto (optional, upload image)
- Submit: Validasi semua field → Upload foto → POST ke API
- Success: Tampil alert, refresh tabel
- Error: Tampil error message per field

#### D. Edit Koleksi
- Klik tombol "Edit" di tabel
- Populate form dengan data lama
- Edit field apapun
- Foto: Opsi ganti atau tetap pakai lama
- Submit: PUT ke API
- Success: Refresh tabel

#### E. Hapus Koleksi
- Klik tombol "Hapus" di tabel
- Tampil konfirmasi dialog
- Jika ya: DELETE ke API, refresh tabel
- Jika tidak: Batal

#### F. Lihat Detail Koleksi
- Klik tombol "Detail" di tabel
- Modal popup menampilkan:
  - Foto koleksi (besar)
  - Semua info: nama, nomor, kategori, gudang, rak, tahap, dimensi, kondisi
  - Deskripsi lengkap

---

## 2. Laporan & Export

### 📍 Lokasi
- **HTML**: `Template/admin/laporan.html`
- **Controller**: `Js/controller/laporan.js`, `reporting.js`

### Fitur yang Tersedia

#### A. Laporan Data Lengkap
- Tab 1: "Data Lengkap"
- Tampil semua koleksi dalam tabel detail
- Kolom: Foto, Nama, Kategori, Nomor, Gudang, Rak, Kondisi, Dimensi, Deskripsi
- **Deskripsi Collapsible**: Jika > 140 karakter, tampil collapsed dengan tombol "Lihat selengkapnya"
- Export button: Excel, PDF

#### B. Laporan Per Gudang
- Tab 2: "Per Gudang"
- Summary tabel: Gudang | Jumlah Item | Baik | Rusak | Perlu Perbaiki
- Klik "Detail" untuk lihat item-item per gudang dalam modal
- Modal detail:
  - Statistik kondisi (card layout)
  - Tabel item per gudang
  - Export Excel/PDF per gudang

#### C. Laporan Berdasarkan Tanggal
- Tab 3: "Berdasarkan Tanggal"
- Input: Start Date, End Date
- Filter koleksi yang ditambah dalam range tersebut
- Render tabel seperti Data Lengkap
- Export Excel/PDF

#### D. Export Functionality
- **Excel (XLSX)**:
  - Export tabel ke file Excel
  - Multiple sheets (jika laporan kompleks)
  - Formatasi header & data
- **PDF (jsPDF)**:
  - Export tabel ke PDF
  - Include header, footer, timestamp
  - Otomatis page break jika banyak data

---

## 3. Dashboard Analytics

### 📍 Lokasi
- **HTML**: `Template/admin/dashboard_analytics.html`
- **Controller**: `Js/controller/dashboard_analytics.js`

### Fitur yang Tersedia

#### A. Statistik Kondisi Barang
- **Kondisi Baik**: Jumlah & persen
- **Kondisi Rusak**: Jumlah & persen
- **Perlu Diperbaiki**: Jumlah & persen
- **Total Item**: Total seluruh koleksi
- Visualisasi: Bar chart horizontal dengan persentase
- Warna coding: Hijau (Baik), Merah (Rusak), Kuning (Perlu Perbaiki)

#### B. Total Nilai Koleksi
- **Total Nilai Aset**: Sum semua harga koleksi (Rp)
- **Rata-rata Nilai**: Total / Jumlah item (Rp)
- Display format: Currency (Rp X.XXX.XXX)

#### C. Distribusi Per Kategori
- Tabel menampilkan:
  - Nama Kategori
  - Jumlah Item
  - Persentase
- Auto-sorted dari kategori terbanyak → terkecil
- Include pie chart visual (optional)

#### D. Distribusi Per Gudang
- Bar chart menampilkan:
  - Setiap gudang (X-axis)
  - Jumlah item (Y-axis)
  - Progress bar dengan perbandingan visual
- Hover untuk lihat detail

#### E. Refresh Button
- Klik untuk update semua data real-time
- Loading spinner saat fetch
- Update timestamp terakhir

---

## 4. Perawatan (Maintenance)

### 📍 Lokasi
- **HTML**: `Template/admin/maintenance.html`
- **Controller**: `Js/controller/maintenance.js`

### Fitur yang Tersedia

#### A. Lihat Item yang Perlu Dirawat
- Filter koleksi dengan kondisi "Perlu Diperbaiki"
- Tabel menampilkan:
  - Nama koleksi
  - Nomor register
  - Kondisi
  - Waktu ditambah
  - Durasi menunggu (berapa hari belum dirawat)

#### B. Catat Maintenance Baru
- Klik "Catat Perawatan"
- Form:
  - Pilih koleksi (dropdown, filter item dengan kondisi "Perlu Diperbaiki")
  - Jenis perawatan (dropdown: pembersihan, perbaikan, preservasi, dll)
  - Tanggal perawatan
  - Catatan (apa yang dilakukan)
  - Biaya (optional)
- Submit: POST ke API
- Success: Refresh tabel

#### C. Lihat History Perawatan
- Tabel maintenance history
- Kolom: Koleksi, Jenis, Tanggal, Catatan, Biaya, Status
- Sorting: Terbaru dulu

#### D. Jadwalkan Perawatan Berikutnya
- Input next maintenance date
- Auto-set reminder
- Tampil upcoming maintenance dalam reminder card

#### E. Total Biaya Perawatan
- Summary card menampilkan:
  - Total biaya perawatan bulan ini
  - Total biaya tahun ini
  - Average biaya per item

---

## 5. Manajemen Kategori

### 📍 Lokasi
- **HTML**: `Template/admin/kategori.html`
- **Controller**: `Js/controller/kategori.js`

### Fitur yang Tersedia

#### A. Lihat Semua Kategori
- Tabel kategori
- Kolom: Nama, Jumlah Item, Aksi

#### B. Tambah Kategori
- Klik "Tambah Kategori"
- Form: Nama kategori (wajib)
- Validasi: Tidak ada duplikasi nama
- Submit: POST ke API

#### C. Edit Kategori
- Klik "Edit"
- Ubah nama
- Submit: PUT ke API

#### D. Hapus Kategori
- Klik "Hapus"
- Konfirmasi dialog
- Submit: DELETE ke API
- Cek: Apakah kategori masih dipakai koleksi? (show warning)

---

## 6. Auth & User Management

### 📍 Lokasi
- **HTML**: `Template/login.html`, `Template/register.html`, `Template/admin/profil.html`
- **Controller**: `Js/controller/Login.js`, `register.js`, `profile.js`

### Fitur yang Tersedia

#### A. Register User Baru
- Form: Email, Username, Password, Confirm Password
- Validasi:
  - Email format valid
  - Password minimal 6 karakter
  - Password match
  - Username available (no duplikasi)
- Submit: POST /api/users/register
- Success: Redirect ke login page
- Error: Tampil error message

#### B. Login
- Form: Email, Password
- Validasi: Field tidak kosong
- Submit: POST /api/auth/login
- Success:
  - Server return JWT token
  - Frontend store di cookie
  - Redirect ke dashboard
- Error: Tampil error message (invalid credentials)

#### C. View Profile
- Tampil user info:
  - Username
  - Email
  - Phone (jika ada)
  - Join date
- Klik tombol "Edit Profile"

#### D. Edit Profile
- Update:
  - Username
  - Email
  - Phone
- Validasi sesuai format
- Submit: PUT /api/users/profile
- Success: Refresh data, tampil alert

#### E. Change Password
- Form: Old Password, New Password, Confirm Password
- Validasi: Old password correct, new password strong
- Submit: PUT /api/users/update-password
- Success: Force logout (re-login dengan password baru)

#### F. Logout
- Klik tombol "Logout"
- Konfirmasi dialog
- Clear token dari cookie
- Redirect ke login page

#### G. Auto Logout
- Token expired: Logout otomatis
- Idle 30 menit: Logout otomatis
- User akan diminta login ulang

---

## 7. Dashboard Admin

### 📍 Lokasi
- **HTML**: `Template/admin/dasboard.html`

### Fitur yang Tersedia

#### A. Overview Cards
- Total Koleksi: Jumlah item
- Kondisi Baik: Persen
- Perlu Diperbaiki: Persen
- Total Nilai: Currency format

#### B. Quick Links
- Link ke halaman utama:
  - Manajemen Koleksi
  - Laporan
  - Analytics
  - Maintenance
  - Kategori

#### C. Recent Activity
- 5 koleksi terbaru yang ditambah
- 5 maintenance terakhir yang dicatat

#### D. System Status
- Backend connection status
- Last sync timestamp
- User info (username, email)

---

## 8. Landing Page (Index)

### 📍 Lokasi
- **HTML**: `index.html`

### Fitur yang Tersedia

#### A. Navbar
- Navigation links: Beranda, Sistem Gudang, Struktur, Kontak
- Sign In button (link ke login)

#### B. Hero Section
- Title: "Museum Sri Baduga"
- Subtitle: Description
- CTA buttons: Jelajahi Sistem, Pelajari Lebih Lanjut

#### C. Struktur Organisasi
- Bagan organisasi chart (image)
- Card list: Kepala Dinas, Sekretaris, Kepala Subbagian
- Modal untuk lihat bagan lengkap (fullscreen)

#### D. Sistem Gudang Features
- 3 feature cards:
  - Manajemen Koleksi
  - Laporan Lanjutan
  - Analytics Dashboard

#### E. Kontak
- Contact form (Name, Email, Message)
- Submit: Send message (atau email ke admin)
- Alamat museum
- Jam buka

---

## Security Features Across All Pages

1. **Input Validation**
   - All user input validated before submit
   - Real-time validation feedback
   - XSS prevention (escapeHTML)

2. **Token Management**
   - JWT in secure HTTP-only cookies
   - Auto-attach to all API requests
   - Auto-logout on expiry or 30min idle

3. **Error Handling**
   - Network errors caught gracefully
   - User-friendly error messages
   - No sensitive data in errors

4. **Form Protection**
   - Duplicate number checking (koleksi)
   - Duplicate category name checking
   - Cascading dropdown validation

