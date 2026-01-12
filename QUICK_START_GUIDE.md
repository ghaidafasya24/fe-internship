# QUICK START GUIDE - 3 FITUR BARU

Panduan cepat menggunakan 3 fitur yang baru ditambahkan ke sistem museum.

---

## 🚀 AKSES CEPAT

### 1. Dashboard Analytics
**URL**: `/Template/admin/dashboard_analytics.html`

**Yang Bisa Anda Lihat**:
- Berapa banyak barang yang kondisinya baik/rusak/perlu diperbaiki
- Total nilai uang semua koleksi museum
- Distribusi barang di setiap kategori
- Berapa barang di setiap gudang

**Tombol Penting**: 🔄 Refresh (untuk update data terbaru)

---

### 2. Maintenance & Pemeliharaan
**URL**: `/Template/admin/maintenance.html`

**Yang Bisa Anda Lakukan**:
- Lihat barang mana saja yang rusak atau perlu dirawat
- Catat perawatan yang sudah dilakukan
- Jadwalkan perawatan berikutnya
- Lihat berapa biaya yang sudah dikeluarkan

**Fitur Utama**:
```
🔔 Notifikasi (Barang apa yang perlu dirawat sekarang)
📝 Daftar Maintenance (Riwayat perawatan semua barang)
📅 Jadwal Perawatan (Kapan perlu dirawat lagi)
💵 Laporan Biaya (Total biaya perawatan)
```

---

### 3. Advanced Reporting (Laporan Lanjutan)
**URL**: `/Template/admin/laporan_advanced.html`

**Yang Bisa Anda Dapatkan**:
- Laporan barang di setiap gudang + nilainya
- Top 30 barang paling mahal
- Laporan barang berdasarkan periode tanggal
- Export laporan ke PDF

**Fitur Utama**:
```
📊 Laporan Per Gudang
💎 Laporan Nilai Aset Tertinggi
📅 Laporan Berdasarkan Tanggal (bisa filter)
📤 Export & Tools (Print/PDF)
```

---

## 📋 PANDUAN PENGGUNAAN HARIAN

### Pagi Hari: Cek Status Barang
1. Buka **Dashboard Analytics**
2. Lihat berapa barang yang rusak
3. Buka **Maintenance** untuk lihat notifikasi
4. Prioritaskan barang yang "🔴 Mendesak"

### Siang Hari: Catat Perawatan
1. Buka **Maintenance**
2. Klik tombol "+ Log" untuk barang yang baru dirawat
3. Isi form:
   - Apa yang dikerjakan (Pembersihan/Restorasi/dll)
   - Siapa yang mengerjakan
   - Biaya (jika ada)
   - Kondisi sekarang (Baik/Rusak/Perlu Diperbaiki)
   - Kapan perlu dirawat lagi
4. Klik "Simpan"

### Akhir Hari/Minggu: Buat Laporan
1. Buka **Advanced Reporting**
2. Pilih tab sesuai kebutuhan:
   - Per Gudang (berapa barang & nilainya di tiap tempat)
   - Nilai Aset (top 30 barang paling mahal)
   - Tanggal (barang yang masuk minggu ini)
3. Klik "Export" atau "Print" untuk laporan fisik

---

## 💡 TIPS PENTING

### Dashboard Analytics
- **Refresh**: Klik 🔄 Refresh untuk update data real-time
- **Persentase**: Otomatis dihitung dari total barang
- **Tidak ada action**: Hanya untuk monitoring/lihat-lihat

### Maintenance
- **Notifikasi**: Jangan lewatkan notifikasi barang rusak (🔴)
- **Log Penting**: Setiap perawatan harus dicatat
- **Biaya**: Akan membantu budget planning ke depan
- **Jadwal**: Jangan lupa set jadwal perawatan berikutnya

### Advanced Reporting
- **Filter Tanggal**: Sangat berguna untuk laporan berkala
- **Export PDF**: Tekan Ctrl+P untuk hasil terbaik
- **Detail**: Klik "Lihat Detail" untuk eksplorasi lebih
- **Top 30**: Fokus monitor barang yang paling berharga

---

## ⚡ QUICK ACTIONS

| Action | Caranya |
|--------|---------|
| Lihat barang rusak | Buka Maintenance → Cek notifikasi (🔴) |
| Catat perawatan | Maintenance → Klik "+ Log" |
| Lihat nilai total museum | Dashboard Analytics → Lihat "Total Nilai Aset" |
| Laporan per gudang | Advanced Reporting → Tab "Per Gudang" |
| Laporan bulanan | Advanced Reporting → Tab "Tanggal" → Filter |
| Print laporan | Advanced Reporting → Ctrl+P |

---

## 🎯 USE CASES

### Scenario 1: Barang Rusak Masuk
```
1. Buka Maintenance
2. Lihat notifikasi barang rusak (🔴 Mendesak)
3. Klik "+ Log" pada barang tersebut
4. Catat rencana perbaikan
5. Set jadwal perawatan
```

### Scenario 2: Manager Minta Laporan Minggu Ini
```
1. Buka Advanced Reporting
2. Tab "Tanggal"
3. Set tanggal mulai = Senin minggu ini
4. Set tanggal akhir = Hari ini
5. Klik "Terapkan Filter"
6. Klik "Print" atau "Export PDF"
```

### Scenario 3: Audit Nilai Aset
```
1. Buka Advanced Reporting
2. Tab "Nilai Aset"
3. Lihat Top 30 barang paling mahal
4. Monitor kondisi barang-barang tersebut
5. Prioritaskan perawatan barang berharga
```

### Scenario 4: Evaluasi Kondisi Gudang A
```
1. Buka Advanced Reporting
2. Tab "Per Gudang"
3. Lihat jumlah barang & kondisinya di Gudang A
4. Klik "Lihat Detail" untuk detail tiap barang
5. Buat rencana perawatan yang dibutuhkan
```

---

## 🆘 BANTUAN CEPAT

### "Saya tidak bisa lihat data apa pun"
1. Refresh halaman (tekan F5)
2. Cek apakah sudah login
3. Cek connection ke internet

### "Laporan kosong"
1. Di tab Tanggal: Pastikan ada barang dalam rentang tanggal
2. Di tab Gudang: Pastikan barang punya field gudang
3. Coba refresh data (F5)

### "Tombol tidak bekerja"
1. Pastikan sudah login
2. Cek console browser (F12)
3. Refresh halaman

### "Saya tidak bisa export"
1. Gunakan Ctrl+P untuk print dialog
2. Pilih "Save as PDF"
3. Alternatif: copy data ke Excel manual

---

## 📊 SKENARIO PENGGUNAAN MINGGUAN

### Hari Senin
- [ ] Buka Dashboard Analytics
- [ ] Lihat statistik kondisi barang minggu lalu
- [ ] Cek maintenance yang perlu dilakukan

### Hari Selasa-Jumat
- [ ] Setiap ada barang dirawat: Catat di Maintenance + Log
- [ ] Monitor notifikasi barang rusak
- [ ] Update jadwal perawatan

### Hari Jumat Sore
- [ ] Buka Advanced Reporting
- [ ] Buat laporan minggu ini
- [ ] Print untuk arsip/manager
- [ ] Lihat total biaya perawatan

### Setiap Akhir Bulan
- [ ] Dashboard Analytics: Lihat trend kondisi barang
- [ ] Advanced Reporting: Nilai aset terbaru
- [ ] Maintenance: Laporan biaya sebulan
- [ ] Analisa & planning untuk bulan depan

---

## 🎓 TRAINING NOTES

Jika akan training user lain, highlight:

1. **Dashboard Analytics**
   - Buka halaman
   - Tunjuk statistik & chart
   - Tekan Refresh
   - Jelaskan apa arti setiap warna

2. **Maintenance**
   - Lihat notifikasi barang rusak
   - Demo klik "Lihat Detail"
   - Demo klik "+ Log"
   - Isi form & simpan
   - Tunjuk tab biaya

3. **Advanced Reporting**
   - Lihat laporan per gudang
   - Demo klik "Lihat Detail"
   - Lihat Top 30 barang
   - Demo filter tanggal
   - Demo export/print

---

## 📞 SUPPORT CONTACT

Jika ada masalah teknis:
1. Cek dokumentasi: `FITUR_BARU_DOCUMENTATION.md`
2. Cek console browser (F12)
3. Contact IT/Developer

---

**Version**: 1.0  
**Last Updated**: 11 Januari 2026  
**Status**: Ready to Use ✅
