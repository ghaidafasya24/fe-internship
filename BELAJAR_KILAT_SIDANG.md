# 🚀 BELAJAR KILAT SEMUA FILE & FOLDER - PERSIAPAN SIDANG

---

## 📂 STRUKTUR FOLDER UTAMA

```
fe-internship/
├── index.html                    # Landing page publik
├── Template/                     # Folder HTML templates
│   ├── login.html               # Halaman login
│   ├── register.html            # Halaman register  
│   ├── dasboard.html            # Admin dashboard
│   └── admin/                   # Folder halaman admin
│       ├── koleksi.html         # Kelola koleksi (CRUD)
│       ├── kategori.html        # Kelola kategori
│       ├── laporan.html         # Laporan & export
│       ├── laporan_advanced.html# Laporan advanced
│       ├── dashboard_analytics.html # Analytics
│       ├── maintenance.html      # Maintenance tracking
│       └── profil.html          # User profile
├── Js/                          # Folder JavaScript
│   ├── config/                  # Konfigurasi (API endpoints)
│   ├── controller/              # Business logic (handler setiap halaman)
│   ├── utils/                   # Helper functions (reusable)
│   └── Temp/                    # File deprecated (jangan pakai)
└── assets/                      # Folder gambar, logo, dll
```

---

# 📋 PENJELASAN SETIAP FILE

## A. CONFIG FILES (Js/config/)

### 1. **url.js** 📌
**Fungsi:** Kumpulan endpoint API umum (auth, user)

```javascript
export const API_URLS = {
    login: "https://api.../api/auth/login",
    register: "https://api.../api/users/register/",
    getProfile: "https://api.../api/users/profile",
    updatePassword: "https://api.../api/users/update-password"
};
```

**Cara Pakai:**
```javascript
import { API_URLS } from "../config/url.js";
fetch(API_URLS.login, { method: "POST", ... });
```

**Poin Penting:** Endpoint terpusat, mudah di-maintain, gampang pindah server

---

### 2. **url_koleksi.js** 📦
**Fungsi:** Endpoint koleksi + kategori

```javascript
export const API_KOLEKSI = {
    GET_KOLEKSI: "https://api.../api/koleksi",
    ADD_KOLEKSI: "https://api.../api/koleksi",
    GET_KATEGORI: "https://api.../api/kategori"
};
```

**Dipakai di:** add-collection.js, laporan.js, tabel_koleksi_updated.js

---

### 3. **url_kategori.js** 🏷️
**Fungsi:** Endpoint kategori saja (deprecated, pakai url_koleksi.js)

---

## B. UTILS FILES (Js/utils/) - Helper Reusable

### 1. **auth.js** 🔐 - Authentication & Token Management
**5 Fungsi Utama:**

#### a. `getToken()`
```javascript
// Ambil JWT dari cookie
const token = getToken();
```
- Return token string atau null

#### b. `isTokenExpired()`
```javascript
// Cek apakah token sudah expired
if (isTokenExpired()) {
  logout(); // Auto logout jika expired
}
```
- Decode JWT payload, bandingkan exp time dengan Date.now()

#### c. `logout(message)`
```javascript
// Hapus token + redirect ke login dengan alert
logout("Sesi kamu telah habis");
```
- Hapus cookie di path `/` dan `/fe-internship/` (GitHub Pages compatibility)
- Clear localStorage
- Show alert
- Redirect ke `/Template/login.html` atau `/fe-internship/Template/login.html`

#### d. `authFetch(url, options)`
```javascript
// Fetch dengan auto-inject JWT token + auto logout jika 401/403
const data = await authFetch("/api/koleksi");
```
- Check token expired dulu
- Inject "Authorization: Bearer {token}" header
- Handle 401/403 response → auto logout
- Return JSON response

#### e. `initActivityTracking()` + `startTokenExpiryCheck()`
```javascript
// Auto logout jika idle 30 menit
initActivityTracking();
// Warning 5 menit sebelum token expired
startTokenExpiryCheck();
```
- Track user activity (mouse, keyboard, scroll, touch)
- Auto extend token saat ada aktivitas
- Auto refresh token jika akan expired

**PENTING:** Semua API call di controller harus pakai `authFetch()`, bukan `fetch()` biasa!

---

### 2. **validation.js** ✅ - Input Validation & XSS Prevention
**6 Fungsi Utama:**

#### a. `escapeHTML(text)` - Prevent XSS
```javascript
const safe = escapeHTML("<script>alert('xss')</script>");
// Output: &lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;
```

#### b. `validateText(value, options)`
```javascript
const result = validateText(nama, {
  min: 1,           // Minimal panjang
  max: 100,         // Maksimal panjang
  required: true,   // Wajib diisi?
  allowedPattern: /^[a-z0-9 ]+$/,  // Regex
  allowedMessage: "Hanya huruf & angka"
});

if (result.valid) {
  console.log(result.value);  // Sudah di-escape
} else {
  console.log(result.error);  // Pesan error
}
```

#### c. `validateEmail(email)`
```javascript
const result = validateEmail("user@email.com");
// Return: {valid: true/false, value, error}
```

#### d. `validatePassword(password)`
```javascript
// Minimal 8 karakter, harus punya huruf & angka
const result = validatePassword("pass123");
```

#### e. `validateDecimal(value, min, max)`
```javascript
// Untuk angka desimal (dimensi koleksi)
const result = validateDecimal("12.5", 0, 999);
```

#### f. `validateDate(value)`
```javascript
// Validasi format tanggal
const result = validateDate("2025-01-15");
```

**Bonus:** `showInputError()`, `clearInputError()`, `hasBlacklistedPattern()`

**PENTING:** Selalu validasi input SEBELUM kirim ke API!

---

### 3. **modal.js** 🎯 - Custom Alert/Confirm/Prompt System
**3 Fungsi Utama:**

#### a. `showAlert(title, message, type)`
```javascript
showAlert("Berhasil!", "Koleksi berhasil ditambahkan", "success");
showAlert("Error!", "Gagal mengupdate koleksi", "error");
showAlert("Peringatan", "Sesi akan berakhir dalam 5 menit", "warning");
```
- Type: `success` (hijau), `error` (merah), `warning` (kuning), `info` (biru)
- Auto close setelah 3 detik untuk success

#### b. `showConfirm(message, onConfirm, onCancel)`
```javascript
showConfirm("Apakah kamu yakin hapus?", () => {
  // User klik "Ya"
  deleteKoleksi(id);
}, () => {
  // User klik "Tidak"
  console.log("Dibatalkan");
});
```

#### c. `showPrompt(title, onSubmit)`
```javascript
showPrompt("Masukkan nama kategori baru:", (value) => {
  console.log("User input:", value);
});
```

**PENTING:** Ganti semua `alert()` dan `confirm()` dengan fungsi ini!

---

### 4. **config.js** ⚙️ - Global Configuration
```javascript
export const BASE_URL = "https://inventorymuseum-de54c3e9b901.herokuapp.com";
export const API_BASE = `${BASE_URL}/api`;
```

**Fungsi:** Terpusat base URL untuk semua API call

---

## C. CONTROLLER FILES (Js/controller/) - Business Logic

### 1. **Login.js** 🔑 - Handle Login Form
**Alur:**
1. User input username + password
2. Validasi input (pakai validation.js)
3. POST ke `/api/users/login` dengan fetch biasa
4. Response ada token JWT
5. Simpan token ke cookie (30 menit expiry)
6. Simpan ke localStorage juga
7. Redirect ke dashboard

**Poin Penting:**
- Ada toggle show/hide password
- Input validation sebelum submit
- Token disimpan di cookie + localStorage

---

### 2. **register.js** 📝 - Handle Register Form
**Alur:**
1. User input username + email + password
2. Validasi semua input
3. POST ke `/api/users/register`
4. Jika berhasil → show alert + redirect ke login
5. Jika error → show error message

**Poin Penting:**
- Clear form saat halaman load (security)
- Email format validation
- Password strength validation

---

### 3. **add-collection.js** ➕ - Form Tambah/Edit Koleksi (PALING KOMPLEKS)
**Fitur:**
- Cascading dropdown: Gudang → Rak → Tahap
- Auto-check duplikasi nomor registrasi & inventaris
- Upload foto koleksi
- Edit koleksi (populate form data lama)
- Delete koleksi dengan konfirmasi

**Alur Tambah Koleksi:**
1. Populate dropdown kategori, gudang
2. User fill form
3. Validasi semua field
4. Check duplikasi nomor register/inventory (API call)
5. Upload foto (FormData)
6. POST ke `/api/koleksi`
7. Show alert success + refresh tabel

**Alur Edit:**
1. User klik "Edit" di tabel
2. Populate form dengan data lama
3. User edit field
4. Validasi
5. PUT ke `/api/koleksi/:id` (foto opsional ganti)
6. Success → refresh tabel

**Poin Penting:**
- FormData untuk upload foto (binary data)
- Foto opsional, tapi jika ada upload dulu sebelum POST
- Cascading dropdown bergantung satu sama lain
- Duplikasi check SEBELUM submit

---

### 4. **tabel_koleksi_updated.js** 📊 - Render & Manage Tabel Koleksi
**Fitur:**
- Load & render tabel koleksi
- Filter by gudang, kategori, search text (real-time)
- Button: Edit, Delete, Detail
- Modal detail koleksi
- Pagination (optional)

**Alur:**
1. DOMContentLoaded → load semua koleksi dari API
2. Render tabel dinamis
3. Attach event listener ke filter buttons & input search
4. Saat filter berubah → filter data → re-render tabel
5. User klik tombol:
   - **Edit** → populate form di add-collection.js
   - **Delete** → show confirm → DELETE ke API → refresh tabel
   - **Detail** → show modal dengan semua info koleksi

**Poin Penting:**
- Real-time filter (tidak perlu klik submit)
- XSS protection: escape data sebelum inject ke DOM
- Responsive table (horizontal scroll di mobile)

---

### 5. **kategori.js** 🏷️ - CRUD Kategori
**Alur:**
1. Load & render tabel kategori
2. User klik "Tambah Kategori"
3. Show modal form
4. Validasi input
5. POST ke `/api/kategori`
6. Refresh tabel
7. Auto-update dropdown di add-collection.js

**CRUD:**
- **Create:** Modal form → POST
- **Read:** GET `/api/kategori` → render tabel
- **Update:** Modal edit → PUT
- **Delete:** Confirm → DELETE

---

### 6. **laporan.js** 📈 - Laporan & Export Data
**3 Tab:**

**Tab 1: Data Lengkap**
- Tampil semua koleksi (Foto, Nama, Nomor, Kategori, Gudang, Kondisi, dll)
- Deskripsi collapsible (jika > 140 karakter)
- Export Excel & PDF

**Tab 2: Per Gudang**
- Summary: Gudang | Jumlah | Baik | Rusak | Perlu Perbaiki
- Klik "Detail" → modal dengan item-item per gudang

**Tab 3: Per Tanggal**
- Filter by range tanggal
- Render tabel seperti Data Lengkap
- Export Excel/PDF

**Export Fungsi:**
- **Excel:** Pakai SheetJS library
  ```javascript
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Laporan");
  XLSX.writeFile(wb, "laporan.xlsx");
  ```
- **PDF:** Pakai jsPDF
  ```javascript
  const pdf = new jsPDF();
  pdf.text("Laporan Koleksi", 10, 10);
  // ... add table
  pdf.save("laporan.pdf");
  ```

**Poin Penting:**
- Fetch semua data → process di JavaScript → export
- Format tanggal & currency (Rp)
- Multiple sheets untuk kompleks laporan

---

### 7. **reporting.js** 📊 - Advanced Reporting
**Fitur:**
- Laporan per gudang dengan statistik
- Laporan per kategori
- Filter by date range
- Conditional formatting (warna per kondisi)

**Hampir sama dengan laporan.js, tapi lebih advanced**

---

### 8. **dashboard_analytics.js** 📉 - Analytics Dashboard
**Chart & Statistik:**
1. **Kondisi Barang** - Bar chart (Baik, Rusak, Perlu Perbaiki)
2. **Total Nilai Aset** - Rp currency format
3. **Distribusi Kategori** - Pie chart / Tabel
4. **Distribusi Gudang** - Bar chart
5. **Refresh Button** - Update real-time

**Library:** Chart.js (CDN)

```javascript
new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Baik', 'Rusak', 'Perlu Perbaiki'],
    datasets: [{
      label: 'Jumlah Item',
      data: [50, 10, 5],
      backgroundColor: ['#10b981', '#ef4444', '#f59e0b']
    }]
  }
});
```

---

### 9. **maintenance.js** 🔧 - Maintenance Tracking
**Fitur:**
- List maintenance history
- Add maintenance record
- Track status (Pending, In Progress, Done)
- Schedule maintenance

**Alur:**
1. GET `/api/maintenance` → render tabel
2. User klik "Tambah Maintenance"
3. Modal form (koleksi, tanggal, deskripsi, status)
4. POST ke `/api/maintenance`
5. Refresh tabel

---

### 10. **profile.js** 👤 - User Profile Management
**Fitur:**
- Edit username
- Edit email (jika bisa)
- Edit phone number
- Change password
- Upload foto profil

**Alur:**
1. GET `/api/users/profile` → populate form
2. User edit field
3. Validasi
4. PUT ke `/api/users/profile` atau `/api/users/update-password`
5. Show alert success

---

### 11. **logout.js** 🚪 - Handle Logout
**Alur:**
1. User klik "Logout"
2. Show modal konfirmasi
3. User klik "Ya"
4. Hapus cookie & localStorage
5. Redirect ke landing page

**Poin Penting:**
- Hapus cookie di path `/` dan `/fe-internship/` (GitHub Pages)
- Clear localStorage
- Prevent back button dengan `history.replaceState()`

---

### 12. **get_kategori.js** 🏷️ - Load Kategori (Utility)
**Fungsi:** Fetch kategori dari API + populate dropdown

**Dipakai di:** Dashboard untuk dropdown kategori filter

---

## D. DEPRECATED FILES (Jangan Pakai!)

### 1. **Temp/tabel_koleksi.js** ❌
- Old template untuk render tabel
- Pakai `tabel_koleksi_updated.js` sebaliknya

### 2. **Temp/tabel_kategori.js** ❌
- Old template kategori
- String placeholder tidak reliable

### 3. **Temp/Fetch.js** ❌
- Old fetch wrapper
- Pakai `authFetch()` dari auth.js

### 4. **add-collection-fixed.js** ❌
- Versi lama add-collection
- Pakai `add-collection.js`

---

## E. HTML TEMPLATES

### 1. **index.html** 🏠
- Landing page publik
- Info museum, navigasi
- Link ke login
- Responsive design

### 2. **Template/login.html** 🔑
- Form login (username/password)
- Toggle show/hide password
- Register link
- Styling Tailwind

### 3. **Template/register.html** 📝
- Form register (username, email, password)
- Password validation
- Login link

### 4. **Template/dasboard.html** 📊
- Admin dashboard (overview)
- Statistics cards
- Sidebar navigation
- Quick links

### 5. **Template/admin/koleksi.html** 📦
- Tabel koleksi
- Filter buttons (gudang, kategori)
- Search input
- Button: Tambah, Edit, Delete, Detail
- Modal add/edit form

### 6. **Template/admin/kategori.html** 🏷️
- Tabel kategori
- Button: Tambah, Edit, Delete
- Modal form

### 7. **Template/admin/laporan.html** 📈
- 3 tab (Data Lengkap, Per Gudang, Per Tanggal)
- Export buttons (Excel, PDF)
- Tabel laporan

### 8. **Template/admin/dashboard_analytics.html** 📉
- Charts & analytics
- Statistik kondisi barang
- Distribusi per kategori & gudang

### 9. **Template/admin/maintenance.html** 🔧
- List maintenance
- Add maintenance modal
- Schedule tab

### 10. **Template/admin/profil.html** 👤
- Form edit profile
- Change password
- Upload foto

---

# 🎯 ALUR DATA APLIKASI (PENTING!)

```
┌─────────────────────────────────────────────────────────────┐
│  USER BUKA HALAMAN (misal: koleksi.html)                   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────────┐
│  HTML Load → Script type="module" src="...js"              │
│  (DOMContentLoaded event trigger)                           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────────┐
│  CONTROLLER (tabel_koleksi_updated.js)                      │
│  1. Import auth.js, validation.js, modal.js               │
│  2. Check token (getToken, isTokenExpired)                │
│  3. Fetch data: authFetch("/api/koleksi")                 │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────────┐
│  AUTH.JS (authFetch)                                        │
│  1. Get token dari cookie                                 │
│  2. Check if expired → auto logout?                       │
│  3. Inject "Authorization: Bearer {token}" header         │
│  4. Send HTTP request                                     │
│  5. Handle 401/403 → auto logout                          │
│  6. Return JSON response                                  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────────┐
│  BACKEND API (Heroku)                                       │
│  https://inventorymuseum-de54c3e9b901.herokuapp.com        │
│  GET /api/koleksi → return JSON array                      │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────────┐
│  CONTROLLER (parse response)                               │
│  1. JSON.parse() response                                 │
│  2. Validasi data (ada error?)                            │
│  3. Loop data → render tabel HTML dinamis                 │
│  4. Inject ke DOM                                         │
│  5. Attach event listener ke button Edit/Delete/Detail   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────────┐
│  USER LIHAT TABEL & INTERAKSI                              │
│  - Klik filter → re-render tabel                          │
│  - Klik Edit → populate form add-collection.js            │
│  - Klik Delete → show confirm → DELETE API → refresh      │
│  - Klik Detail → show modal                               │
└─────────────────────────────────────────────────────────────┘
```

---

# 💡 KONSEP PENTING UNTUK SIDANG

## 1. **Separation of Concerns** 🏗️
- **HTML** = Structure (Template/*)
- **CSS** = Styling (Tailwind)
- **JS** = Logic (Js/controller/*, Js/utils/*)
- **Config** = Centralized URLs (Js/config/*)

## 2. **MVC Pattern** 🎨
- **Model** = Backend API data
- **View** = HTML template
- **Controller** = JavaScript logic (Js/controller/*)

## 3. **Security** 🔐
- JWT token untuk auth (HTTP-only cookie better, tapi ini OK)
- Input validation + escaping (XSS prevention)
- HTTPS only (production)
- Auto logout saat token expired

## 4. **ES6 Modules** 📦
```javascript
// Import
import { showAlert } from "../utils/modal.js";
// Export
export function logout() { ... }
```

## 5. **Async/Await** ⏳
```javascript
async function loadData() {
  try {
    const res = await authFetch("/api/koleksi");
    console.log(res);
  } catch (err) {
    showAlert("Error", "Gagal load data", "error");
  }
}
```

## 6. **Error Handling** ⚠️
- Try-catch untuk fetch
- User-friendly error message (via modal.js)
- Console.log untuk debug (development)
- Fallback untuk network error

## 7. **Data Validation** ✅
- Validasi di frontend (UX)
- Validasi di backend (security) ← PENTING!
- Never trust user input

## 8. **Real-time Update** ⚡
- Filter tanpa submit button
- Search dengan input event listener
- Cascading dropdown onChange

---

# 🎤 TIPS MENJAWAB SAAT SIDANG

### Jika ditanya: "Bagaimana cara sistem ini bekerja?"
> "Sistemnya menggunakan pattern MVC. User buka halaman HTML → JavaScript controller load data dari backend API pakai authFetch() (dengan JWT token) → response di-process → render tabel dinamis ke DOM → user bisa interact (filter, edit, delete) → trigger event listener → API call lagi → update UI"

### Jika ditanya: "Bagaimana security?"
> "Security kami handle dengan 3 cara: 1) JWT token di cookie untuk autentikasi, 2) authFetch() yang auto-check token expired & inject Authorization header, 3) Input validation + escapeHTML() untuk prevent XSS attack. Plus token auto-expire 30 menit jika idle"

### Jika ditanya: "Bagaimana kalau jaringan error?"
> "Kita handle dengan try-catch di semua fetch. Kalau network error, kita show user-friendly alert. Kalau API return error (400, 500, dll), kita parse error message & display ke user"

### Jika ditanya: "File apa yang paling penting?"
> "3 file paling penting: 1) auth.js (authentication & token), 2) validation.js (security), 3) modal.js (user feedback). Plus controller files untuk business logic masing-masing halaman"

### Jika ditanya: "Kenapa pakai modular structure?"
> "Supaya maintainable, scalable, dan reusable. Misal: validation.js bisa dipakai di semua form (login, register, koleksi). Modal.js bisa dipakai di semua halaman untuk alert. Controller terpisah per halaman jadi mudah debug & modify"

---

# 📝 CHECKLIST UNTUK SIDANG

- [ ] Hapal 8 fitur utama aplikasi
- [ ] Mengerti alur authentication (login → token → dashboard)
- [ ] Bisa jelaskan add-collection flow (form → validasi → upload → API → refresh)
- [ ] Tahu perbedaan GET/POST/PUT/DELETE
- [ ] Mengerti apa itu JWT token
- [ ] Bisa jelaskan XSS attack & prevention
- [ ] Tahu struktur folder & fungsi setiap file
- [ ] Bisa demo live: login → tambah koleksi → lihat tabel → export laporan
- [ ] Siapkan screenshot backup (internet down?)
- [ ] Hapal 3 file paling penting (auth.js, validation.js, modal.js)

---

# 🚀 GOOD LUCK SIDANG BESOK! 💪

Kamu sudah belajar structured codebase dengan:
✅ Clean architecture (separation of concerns)
✅ Security best practices (JWT, XSS prevention, input validation)
✅ Modern JavaScript (ES6 modules, async/await)
✅ Scalable & maintainable code
✅ Real-world patterns (MVC, API integration)

Percaya diri, jelaskan dengan tenang, & tunjukkan understanding. You got this! 🎉
