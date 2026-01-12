# DOKUMENTASI FITUR BARU SISTEM MUSEUM

Dokumen ini menjelaskan tiga fitur baru yang telah ditambahkan ke Sistem Inventaris Museum Sri Baduga.

## ✅ DAFTAR FITUR YANG DITAMBAHKAN

### 1. DASHBOARD ANALYTICS (Analitik Dasbor)
### 2. MAINTENANCE/PEMELIHARAAN (Manajemen Perawatan)
### 3. ADVANCED REPORTING (Laporan Lanjutan)

---

## 1️⃣ DASHBOARD ANALYTICS

### 📍 Lokasi File
- **HTML**: `Template/admin/dashboard_analytics.html`
- **Controller**: `Js/controller/dashboard_analytics.js`

### 🎯 Fitur yang Tersedia

#### A. Statistik Kondisi Barang
Menampilkan breakdown kondisi semua koleksi:
- **Kondisi Baik**: Item dalam kondisi prima
- **Kondisi Rusak**: Item yang tidak bisa digunakan
- **Perlu Diperbaiki**: Item yang masih bisa diperbaiki
- **Total Item**: Jumlah seluruh koleksi
- **Visualisasi**: Bar chart horizontal dengan persentase

#### B. Total Nilai Koleksi
- **Total Nilai Aset**: Jumlah nilai rupiah semua koleksi
- **Rata-rata Nilai**: Nilai aset per item

#### C. Distribusi Per Kategori
Tabel yang menunjukkan:
- Nama kategori
- Jumlah item per kategori
- Persentase distribusi
- Sorting otomatis dari kategori terbanyak

#### D. Distribusi Per Gudang
Visualisasi bar chart untuk:
- Setiap gudang/lokasi penyimpanan
- Jumlah item di setiap gudang
- Progress bar dengan perbandingan visual

### 🔧 Cara Menggunakan

1. Buka halaman: `admin/dashboard_analytics.html`
2. Sistem akan otomatis memuat semua data analytics
3. Klik tombol **🔄 Refresh** untuk memperbarui data secara real-time

### 📊 Data yang Diperlukan

Field koleksi yang digunakan:
```javascript
{
  kondisi: "baik|rusak|perlu perbaikan",  // Required
  nilai_aset: 5000000,                     // Required untuk nilai
  kategori: { nama: "Tekstil" },          // Required untuk kategori
  gudang: { nama: "Gudang A" }            // Required untuk gudang
}
```

---

## 2️⃣ MAINTENANCE / PEMELIHARAAN

### 📍 Lokasi File
- **HTML**: `Template/admin/maintenance.html`
- **Controller**: `Js/controller/maintenance.js`

### 🎯 Fitur yang Tersedia

#### A. Notifikasi Barang Perlu Dirawat
Sistem otomatis mendeteksi dan menampilkan:
- Item dengan kondisi **Rusak** (🔴 Mendesak)
- Item dengan kondisi **Perlu Perbaikan** (🟡 Segera)
- Item dengan jadwal perawatan yang **overdue**
- Klik untuk melihat detail dan tambah log perawatan

#### B. Daftar Maintenance (Tab 1)
Tabel riwayat perawatan dengan kolom:
- No. urut
- Nama Item
- Kondisi saat ini
- Jenis perawatan terakhir
- Tanggal perawatan
- Jadwal perawatan berikutnya
- Tombol aksi (Lihat / Tambah Log)

#### C. Jadwal Perawatan (Tab 2)
- Menampilkan jadwal perawatan mendatang
- Item yang sudah overdue ditandai dengan badge merah
- Filter otomatis berdasarkan tanggal

#### D. Laporan Biaya (Tab 3)
Statistik biaya perawatan:
- Total biaya perawatan semua item
- Rata-rata biaya per item yang dirawat
- Total jumlah perawatan yang dilakukan
- Tabel detail biaya per perawatan

### 🔧 Cara Menggunakan

#### 1. Melihat Detail Riwayat Perawatan
```
1. Buka halaman Maintenance
2. Di tab "Daftar Maintenance", klik tombol "Lihat"
3. Modal akan menampilkan seluruh riwayat perawatan item
```

#### 2. Menambah Log Perawatan Baru
```
1. Klik tombol "+ Log" di samping item
2. Isi formulir:
   - Jenis Perawatan (Pembersihan, Restorasi, dll)
   - Tanggal perawatan
   - Deskripsi detail
   - Nama teknisi/petugas
   - Biaya perawatan (opsional)
   - Kondisi setelah perawatan
   - Jadwal perawatan berikutnya (opsional)
3. Klik "Simpan"
```

#### 3. Monitoring Biaya
```
1. Buka tab "Laporan Biaya"
2. Lihat statistik total, rata-rata, dan detail per perawatan
```

### 📊 Data Structure

```javascript
{
  maintenance_log: [
    {
      jenis_perawatan: "Pembersihan",
      tanggal: "2024-01-15",
      deskripsi: "Pembersihan debu dan perapihan",
      teknisi: "Budi",
      biaya: 50000,
    }
  ],
  next_maintenance_date: "2024-06-15",
  kondisi: "baik"  // Updated setelah perawatan
}
```

---

## 3️⃣ ADVANCED REPORTING

### 📍 Lokasi File
- **HTML**: `Template/admin/laporan_advanced.html`
- **Controller**: `Js/controller/reporting.js`

### 🎯 Fitur yang Tersedia

#### A. Laporan Per Gudang (Tab 1)
Tabel distribusi koleksi per gudang:
- Nama gudang
- Jumlah item di gudang
- Total nilai aset gudang
- Status kondisi (jumlah rusak & perlu perbaikan)
- Tombol untuk melihat detail item per gudang

#### B. Laporan Nilai Aset (Tab 2)
Top 30 koleksi dengan nilai tertinggi:
- Ranking berdasarkan nilai aset
- Nama koleksi
- Kategori
- No. inventaris
- Nilai aset (format currency IDR)
- Total nilai top 30

#### C. Laporan Berdasarkan Tanggal (Tab 3)
Filter dan laporan koleksi berdasarkan periode:
- Input tanggal mulai dan akhir
- Tabel hasil filter dengan kolom:
  - No. urut
  - Tanggal akuisisi
  - Nama koleksi
  - Kategori
  - Kondisi
  - Nilai
- Total nilai periode terpilih

#### D. Export & Tools (Tab 4)
- Button export laporan ke PDF
- Print view untuk semua data
- Tips dan informasi penggunaan
- Quick summary ringkasan data

### 🔧 Cara Menggunakan

#### 1. Melihat Laporan Per Gudang
```
1. Buka halaman Laporan Advanced
2. Berada di tab "Laporan Per Gudang"
3. Tabel otomatis menampilkan semua gudang
4. Klik "Lihat Detail" untuk melihat item per gudang
```

#### 2. Laporan Nilai Aset Tertinggi
```
1. Klik tab "Laporan Nilai Aset"
2. Sistem menampilkan Top 30 item dengan nilai tertinggi
3. Lihat total nilai top 30 di bawah tabel
```

#### 3. Filter Laporan Berdasarkan Tanggal
```
1. Klik tab "Laporan Berdasarkan Tanggal"
2. Isi "Tanggal Mulai" dan "Tanggal Akhir"
3. Klik "Terapkan Filter"
4. Sistem menampilkan item dalam rentang tanggal tersebut
5. Lihat total nilai periode di bagian bawah
```

#### 4. Export Laporan
```
1. Klik tab "Export & Tools"
2. Pilih salah satu:
   - Export Laporan Gudang ke PDF
   - Export Laporan Nilai Aset ke PDF
   - Print Semua Data (Ctrl+P)
3. Untuk PDF terbaik: gunakan "Print to PDF" dari Print dialog
```

### 📋 Filter yang Tersedia

```javascript
{
  startDate: "2024-01-01",     // Filter awal (tanggal akuisisi)
  endDate: "2024-12-31",       // Filter akhir
  gudang: "Gudang A",          // Filter berdasarkan gudang
  kategori: "Tekstil",          // Filter berdasarkan kategori
  kondisi: "baik"              // Filter berdasarkan kondisi
}
```

---

## 🔗 INTEGRASI KE MENU UTAMA

Untuk menambahkan link ke halaman baru di sidebar/navigation, edit file-file berikut:

### 1. Edit `Template/admin/koleksi.html`
Tambahkan link di navbar:
```html
<a href="dashboard_analytics.html" class="block py-2.5 px-4 rounded-lg text-primary/70 hover:bg-primary/10 hover:text-primary font-medium ease-soft">Analytics</a>
<a href="maintenance.html" class="block py-2.5 px-4 rounded-lg text-primary/70 hover:bg-primary/10 hover:text-primary font-medium ease-soft">Maintenance</a>
<a href="laporan_advanced.html" class="block py-2.5 px-4 rounded-lg text-primary/70 hover:bg-primary/10 hover:text-primary font-medium ease-soft">Laporan Advanced</a>
```

### 2. Edit `Template/dasboard.html`
Tambahkan link ke analytics dashboard di halaman utama dashboard.

---

## ⚙️ REQUIREMENT DATA KOLEKSI

Untuk semua fitur berjalan optimal, pastikan setiap dokumen koleksi memiliki field:

**Minimal Required:**
```javascript
{
  _id: ObjectId,
  nama_koleksi: String,        // ✅ Required
  no_inv: String,              // ✅ Required untuk laporan
  kondisi: String,             // ✅ Required (baik|rusak|perlu perbaikan)
  nilai_aset: Number,          // ✅ Required untuk value analytics
  kategori_id: ObjectId,       // ✅ Required untuk distribusi kategori
  gudang_id: ObjectId,         // ✅ Required untuk distribusi gudang
}
```

**Optional tapi disarankan:**
```javascript
{
  tanggal_akuisisi: Date,           // Untuk filter laporan tanggal
  kategori: {
    _id: ObjectId,
    nama: String
  },
  gudang: {
    _id: ObjectId,
    nama: String
  },
  maintenance_log: [                // Untuk modul maintenance
    {
      jenis_perawatan: String,
      tanggal: Date,
      deskripsi: String,
      teknisi: String,
      biaya: Number
    }
  ],
  next_maintenance_date: Date       // Untuk jadwal perawatan
}
```

---

## 🐛 TROUBLESHOOTING

### 1. Dashboard Analytics tidak menampilkan data
**Solusi:**
- Pastikan field `kondisi` diisi pada semua koleksi
- Cek di browser console untuk error messages
- Refresh halaman (F5)

### 2. Maintenance tidak menyimpan log
**Solusi:**
- Pastikan backend API mendukung PUT request
- Cek struktur data maintenance_log sudah benar
- Lihat response dari backend di Network tab

### 3. Laporan tidak menampilkan item
**Solusi:**
- Pastikan kategori dan gudang sudah ter-populate dengan nama
- Untuk laporan tanggal: pastikan field `tanggal_akuisisi` ada
- Cek filter yang digunakan sudah sesuai

### 4. Export PDF tidak bekerja
**Solusi:**
- Gunakan browser Chrome/Edge untuk hasil terbaik
- Akses Print (Ctrl+P) > Save as PDF
- Alternatif: gunakan "Print to PDF" dari print dialog

---

## 📝 API ENDPOINTS YANG DIGUNAKAN

Semua fitur menggunakan endpoint yang sudah ada:

```
GET  /api/koleksi                 // Fetch semua koleksi
GET  /api/koleksi/{id}            // Fetch detail koleksi
PUT  /api/koleksi/{id}            // Update koleksi (untuk maintenance log)
GET  /api/kategori                // Fetch kategori (opsional)
GET  /api/gudang                  // Fetch gudang (opsional)
```

---

## 🎨 STYLING & DESIGN

Semua halaman menggunakan:
- **Color Scheme**: Primary (#3b6e80), dengan aksen warna (green/red/yellow)
- **Font**: Inter (sans-serif), Playfair Display (serif)
- **Framework**: Tailwind CSS (CDN)
- **Icons**: Unicode emoji untuk visual appeal

---

## 📱 RESPONSIVE DESIGN

Semua halaman responsive dan tested di:
- Desktop (1920x1080)
- Laptop (1366x768)
- Tablet (iPad)
- Mobile akan optimal jika dikembangkan lebih lanjut

---

## 🚀 NEXT STEPS (Saran Pengembangan Lanjutan)

1. **Export Excel**: Tambahkan library SheetJS untuk export ke .xlsx
2. **Charts Library**: Integrasikan Chart.js atau Apex Charts untuk grafik lebih interaktif
3. **Email Notifications**: Notifikasi email untuk item yang perlu dirawat
4. **Mobile App**: Develop halaman mobile-friendly untuk maintenance di lapangan
5. **User Roles**: Implementasi role-based access (Kurator, Teknisi, Admin, Viewer)
6. **Audit Trail**: Catat siapa yang membuat/mengubah data untuk audit

---

## 📞 SUPPORT

Jika ada pertanyaan atau error, cek:
1. Browser console (F12) untuk error messages
2. Network tab untuk response API
3. Pastikan token authentication masih valid
4. Refresh halaman atau clear cache

---

**Dokumentasi Dibuat**: 11 Januari 2026  
**Versi**: 1.0  
**Status**: ✅ Siap Digunakan
