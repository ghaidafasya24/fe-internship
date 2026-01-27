# 🏛️ Museum Sri Baduga - Sistem Inventaris Digital

Aplikasi web untuk manajemen dan inventarisasi koleksi museum dengan fitur analytics, pelaporan, dan maintenance tracking.

---

## 📋 Daftar Isi
1. [Quick Start](#-quick-start)
2. [Dokumentasi Detail](#-dokumentasi-lengkap-di-folder-docs)
3. [Struktur Folder](#-struktur-folder)
4. [Panduan JavaScript](#-panduan-javascript)
5. [API Endpoints](#-api-endpoints)
6. [Fitur Utama](#-fitur-utama)
7. [FAQ & Troubleshooting](#-faq--troubleshooting)

---

## 🚀 Quick Start

### Setup Awal
```bash
# 1. Clone repository (jika belum)
git clone <repo-url>

# 2. Buka file index.html di browser
# atau jalankan local server:
python -m http.server 8000
# Akses: http://localhost:8000
```

### Login Admin
```
URL: /Template/login.html
Email: admin@museum.com (sesuai backend)
Password: password
```

### Halaman Utama
- **Dashboard**: `/Template/admin/dasboard.html` - Overview statistik
- **Koleksi**: `/Template/admin/koleksi.html` - Manage koleksi CRUD
- **Laporan**: `/Template/admin/laporan.html` - Laporan lengkap + export
- **Analytics**: `/Template/admin/dashboard_analytics.html` - Analytics mendalam
- **Perawatan**: `/Template/admin/maintenance.html` - Track maintenance

---

## � Dokumentasi Lengkap di Folder `docs/`

**Untuk informasi lengkap, baca dokumentasi di folder `docs/`:**

| Dokumen | Untuk | Isi |
|---------|-------|-----|
| [**docs/INDEX.md**](docs/INDEX.md) | Overview semua docs | Navigation map, reading path, cross-references |
| [**docs/FOLDER_GUIDE.md**](docs/FOLDER_GUIDE.md) | Navigate struktur folder | Folder breakdown, file guide, when to modify what |
| [**docs/ARCHITECTURE.md**](docs/ARCHITECTURE.md) | Understand alur & design | Data flow diagram, function examples, error handling |
| [**docs/FEATURES.md**](docs/FEATURES.md) | Detail setiap fitur | 8 fitur dengan penjelasan detail + cara pakai |
| [**docs/API.md**](docs/API.md) | API reference | Semua endpoint dengan request/response examples |

**→ Mulai dari [docs/INDEX.md](docs/INDEX.md) untuk overview!**

---

```
fe-internship/
├── index.html                          # Landing page publik
├── Js/
│   ├── config/                         # 🔧 Konfigurasi API
│   │   ├── url.js                      # Endpoint auth, user
│   │   ├── url_koleksi.js             # Endpoint koleksi & kategori
│   │   └── url_kategori.js            # Endpoint kategori
│   │
│   ├── controller/                     # 🎮 Business Logic
│   │   ├── add-collection.js          # Form tambah/edit koleksi
│   │   ├── tabel_koleksi_updated.js   # Render & filter tabel koleksi
│   │   ├── laporan.js                 # Laporan data lengkap
│   │   ├── reporting.js               # Laporan advanced (per gudang/tanggal)
│   │   ├── dashboard_analytics.js     # Analytics dashboard
│   │   ├── maintenance.js             # Manage perawatan
│   │   ├── kategori.js                # CRUD kategori
│   │   ├── Login.js                   # Login flow
│   │   ├── register.js                # Register flow
│   │   ├── logout.js                  # Logout
│   │   └── profile.js                 # Edit profile user
│   │
│   ├── utils/                          # 🔧 Helper Functions (reusable)
│   │   ├── auth.js                    # Token, logout otomatis, authFetch()
│   │   ├── validation.js              # Validasi input + sanitasi XSS
│   │   ├── modal.js                   # Alert/confirm/prompt dialogs
│   │   └── config.js                  # Konstanta global (BASE_URL)
│   │
│   └── Temp/                           # 📦 File deprecated/testing (jangan pakai)
│       ├── tabel_koleksi.js           # DEPRECATED - gunakan tabel_koleksi_updated.js
│       ├── Fetch.js                   # DEPRECATED - gunakan authFetch dari utils
│       └── tabel_kategori.js          # Testing only
│
├── Template/
│   ├── login.html                      # Login page
│   ├── register.html                   # Register page
│   ├── dasboard.html                   # Admin dashboard
│   └── admin/
│       ├── koleksi.html               # Koleksi management
│       ├── kategori.html              # Kategori management
│       ├── laporan.html               # Report viewer
│       ├── laporan_advanced.html       # Advanced reports
│       ├── dashboard_analytics.html    # Analytics dashboard
│       ├── maintenance.html            # Maintenance tracking
│       └── profil.html                # User profile
│
├── assets/
│   └── images/                         # Gambar, logo, struktur org
│
├── docs/                               # 📚 Dokumentasi
│   ├── ARCHITECTURE.md                # Penjelasan arsitektur
│   ├── FEATURES.md                    # Penjelasan fitur
│   ├── API.md                         # API endpoints
│   └── FOLDER_GUIDE.md                # Panduan struktur folder
│
└── .htaccess                          # Apache routing config
```

---

## 🎯 Panduan JavaScript

### Struktur File JavaScript

#### 1️⃣ **config/** - Konfigurasi API
- **Fungsi**: Menyimpan URL/endpoint API
- **Files**: `url.js`, `url_koleksi.js`, `url_kategori.js`
- **Contoh**:
  ```javascript
  export const API_KOLEKSI = {
    GET_KOLEKSI: "https://api.../api/koleksi",
    ADD_KOLEKSI: "https://api.../api/koleksi",
    GET_KATEGORI: "https://api.../api/kategori"
  };
  ```

#### 2️⃣ **controller/** - Business Logic
- **Fungsi**: Menangani interaksi user dengan data (CRUD)
- **Pola**: User event → validasi → API call → render UI
- **Contoh File**:
  - `tabel_koleksi_updated.js` - Load koleksi, filter, render tabel, detail/edit/hapus
  - `add-collection.js` - Form validation, submit, handle foto upload
  - `laporan.js` - Fetch semua koleksi, render tabel, export Excel/PDF
  - `reporting.js` - Advanced filter (per gudang, per tanggal)

#### 3️⃣ **utils/** - Helper Functions
- **Fungsi**: Fungsi reusable yang dipakai di banyak file
- **File**:
  - `auth.js` - Token management, `authFetch()`, logout otomatis
  - `validation.js` - Validasi input (text, email, number, date, dll)
  - `modal.js` - Alert/confirm/prompt dialogs
  - `config.js` - `BASE_URL` dan konstanta global

#### 4️⃣ **Temp/** - ⚠️ DEPRECATED
- **Jangan pakai!** File lama yang sudah replace
- Gunakan versi updated dari controller/ atau utils/

### Alur Data Aplikasi

```
Browser (HTML Form)
    ↓
Controller (add-collection.js, laporan.js)
    ↓ Validasi input
Utils/validation.js → Sanitasi XSS
    ↓
Utils/auth.js → Cek token, tambah Authorization header
    ↓
Config (url.js) → Ambil endpoint URL
    ↓
authFetch(url) → Kirim ke API Backend
    ↓
Backend (Heroku) → Process & return JSON
    ↓
Controller → Parse response
    ↓
Render UI (Modal/Alert/Table)
```

---

## 🔌 API Endpoints

### Backend URL
```
Base: https://inventorymuseum-de54c3e9b901.herokuapp.com
```

### Koleksi
```
GET    /api/koleksi              - Ambil semua koleksi
POST   /api/koleksi              - Tambah koleksi baru
PUT    /api/koleksi/:id          - Edit koleksi
DELETE /api/koleksi/:id          - Hapus koleksi
```

### Kategori
```
GET    /api/kategori             - Ambil semua kategori
POST   /api/kategori             - Tambah kategori
PUT    /api/kategori/:id         - Edit kategori
DELETE /api/kategori/:id         - Hapus kategori
```

### Gudang
```
GET    /api/gudang               - Ambil gudang
GET    /api/gudang/:id/rak       - Ambil rak per gudang
GET    /api/gudang/:id/rak/:rak_id/tahap - Ambil tahap
```

### Auth
```
POST   /api/auth/login           - Login
POST   /api/users/register       - Register
GET    /api/users/profile        - Ambil profile
PUT    /api/users/profile        - Edit profile
PUT    /api/users/update-password - Ganti password
```

---

## ⭐ Fitur Utama

### 1. Manajemen Koleksi
- ✅ Lihat semua koleksi dalam tabel
- ✅ Filter per gudang, kategori, search text
- ✅ Tambah koleksi baru (dengan upload foto)
- ✅ Edit koleksi (update semua field)
- ✅ Hapus koleksi
- ✅ Lihat detail koleksi (modal)

### 2. Laporan & Export
- ✅ Laporan lengkap semua koleksi
- ✅ Laporan per gudang (breakdown per lokasi)
- ✅ Laporan per tanggal (range date filter)
- ✅ Export Excel (XLSX)
- ✅ Export PDF (jsPDF)
- ✅ Deskripsi panjang collapsible (Lihat selengkapnya)

### 3. Analytics
- ✅ Statistik kondisi barang (Baik/Rusak/Perlu Perbaiki)
- ✅ Total nilai koleksi (rupiah)
- ✅ Distribusi per kategori
- ✅ Distribusi per gudang
- ✅ Bar chart visualisasi

### 4. Perawatan (Maintenance)
- ✅ Track maintenance history
- ✅ Schedule perawatan berikutnya
- ✅ Log biaya perawatan
- ✅ Status tracking

### 5. Auth & Security
- ✅ Login/Register
- ✅ JWT Token management
- ✅ Auto logout (30 min idle + token expiry)
- ✅ Input sanitasi (prevent XSS)
- ✅ Network error handling
- ✅ Validation real-time

---

## 🛠️ Developer Guide

### Menambah Feature Baru

#### Step 1: Buat Controller
```javascript
// Js/controller/my-feature.js
import { BASE_URL } from "../utils/config.js";
import { authFetch } from "../utils/auth.js";
import { showAlert } from "../utils/modal.js";
import { validateText } from "../utils/validation.js";

document.addEventListener('DOMContentLoaded', () => {
  // Init logic
});
```

#### Step 2: Validasi Input
```javascript
const result = validateText(userInput, { min: 3, max: 100 });
if (!result.valid) {
  showAlert(result.error, 'error');
  return;
}
```

#### Step 3: API Call (Aman)
```javascript
try {
  const response = await authFetch(`${BASE_URL}/api/endpoint`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  showAlert('Berhasil!', 'success');
} catch (error) {
  showAlert('Error: ' + error.message, 'error');
}
```

#### Step 4: Add ke Template
```html
<!-- Template/admin/my-feature.html -->
<script src="../../Js/controller/my-feature.js"></script>
```

### Best Practices
1. ✅ Selalu validasi input sebelum kirim ke API
2. ✅ Gunakan `authFetch()` bukan `fetch()` biasa (untuk auto token+logout)
3. ✅ Tampilkan loading/alert saat process
4. ✅ Handle error gracefully
5. ✅ Escape HTML output (gunakan `escapeHTML()`)
6. ✅ Jangan hardcode URL - pakai config files

---

## ❓ FAQ & Troubleshooting

### Q: Koleksi tidak muncul di tabel?
**A**: 
1. Cek console (F12) untuk error message
2. Pastikan `url_koleksi.js` punya endpoint yang benar
3. Cek backend API apakah response valid JSON
4. Gunakan browser DevTools → Network tab untuk lihat request/response

### Q: Form submit error "Network error"?
**A**:
1. Cek internet connection
2. Cek endpoint di `url_koleksi.js` sudah benar
3. Cek CORS settings di backend
4. Lihat browser console untuk detail error

### Q: Token expired, tapi user masih bisa akses?
**A**:
1. Token check terjadi di `auth.js` (`isTokenExpired()`)
2. Check dilakukan: sebelum request (frontend) + saat response 401/403 (server)
3. Jika masih error, clear cookies: DevTools → Application → Cookies → hapus "token"

### Q: Mau ganti backend URL?
**A**: Edit di `Js/utils/config.js`:
```javascript
export const BASE_URL = "https://new-server.com";
```

### Q: Mau tambah validasi custom?
**A**: Di `Js/utils/validation.js`:
```javascript
export function validateMyField(value) {
  // ... logic
  return { valid: true/false, value, error: message };
}
```

---

## 📞 Support
- **Backend Developer**: Tanyakan untuk API issues
- **Issues**: Cek browser console (F12) untuk error details
- **Questions**: Refer ke `docs/` folder untuk penjelasan detail

---

**Last Updated**: January 27, 2026
**Version**: 2.0 (Cleanup Release)
