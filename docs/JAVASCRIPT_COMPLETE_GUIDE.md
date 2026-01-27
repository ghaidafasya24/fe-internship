# 📚 Penjelasan Lengkap SEMUA FILE JavaScript

**Total Files**: 25 JavaScript files  
**Struktur**: 4 folders (config, controller, utils, Temp)  

---

## 🗂️ STRUKTUR OVERVIEW

```
Js/
├── config/ (3 files) - Konfigurasi API endpoints
├── controller/ (14 files) - Business logic per halaman/fitur
├── utils/ (4 files) - Helper functions reusable
└── Temp/ (4 files) ⚠️ DEPRECATED - jangan pakai
```

---

# 1️⃣ FOLDER `config/` - Konfigurasi API

**Fungsi**: Kumpulan endpoint URL API  
**Kegunaan**: Mudah di-update jika server pindah  

---

## File: `url.js` 🔧

**Apa**: Endpoint umum (login, register, profile, user)  
**Size**: Kecil (~15 lines)  
**Status**: ✅ Active

**Isi**:
```javascript
const API_BASE_URL = 'https://inventorymuseum-de54c3e9b901.herokuapp.com/api';

export const API_URLS = {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/users/register/`,
    updateUsername: `${API_BASE_URL}/users/profile`,
    updatePhone: `${API_BASE_URL}/users/profile`,
    updatePassword: `${API_BASE_URL}/users/update-password`,
    getProfile: `${API_BASE_URL}/users/profile`,
};
```

**Dipakai oleh**:
- `Login.js` - Login form
- `register.js` - Register form
- `profile.js` - Edit profile
- `logout.js` - Logout

**Kapan Edit**:
- Tambah endpoint user baru
- Ganti server API

---

## File: `url_koleksi.js` 🔧

**Apa**: Endpoint koleksi & kategori (untuk dropdown, tabel, CRUD)  
**Size**: Kecil (~10 lines)  
**Status**: ✅ Active (PENTING!)

**Isi**:
```javascript
export const API_KOLEKSI = {
    GET_KOLEKSI: "https://inventorymuseum.../api/koleksi",
    ADD_KOLEKSI: "https://inventorymuseum.../api/koleksi",
    GET_KATEGORI: "https://inventorymuseum.../api/kategori"
};

export const KOLEKSI_URL = API_KOLEKSI.GET_KOLEKSI;
export const KATEGORI_URL = API_KOLEKSI.GET_KATEGORI;
```

**Dipakai oleh**:
- `add-collection.js` - Tambah/edit koleksi
- `tabel_koleksi_updated.js` - Tampil tabel koleksi
- `reporting.js` - Laporan lanjutan
- `laporan.js` - Laporan lengkap

**Kapan Edit**:
- Koleksi endpoint berubah
- Tambah endpoint koleksi baru

**⚠️ IMPORTANT**: File ini harus benar karena dipakai di banyak tempat!

---

## File: `url_kategori.js` 🔧

**Apa**: Endpoint kategori saja  
**Size**: Sangat kecil  
**Status**: ✅ Active (jarang dipakai)

**Dipakai oleh**:
- `kategori.js` - CRUD kategori (optional)

**Catatan**: Bisa pakai `url_koleksi.js` juga untuk kategori.

---

## 📊 Struktur Folder config/

```
config/
├── url.js                    ← Auth endpoints
├── url_koleksi.js           ← Koleksi + kategori endpoints [IMPORTANT]
└── url_kategori.js          ← Kategori only
```

---

# 2️⃣ FOLDER `controller/` - Business Logic

**Fungsi**: Logika aplikasi, handle user events, API calls, render UI  
**Pola**: 1 file per halaman/fitur  
**Pakai**: ES6 modules (`import`/`export`)

---

## 📋 DAFTAR SEMUA FILE CONTROLLER

| File | Fungsi | Size | Status |
|------|--------|------|--------|
| **add-collection.js** | Tambah/edit koleksi form | 581 lines | ✅ Active |
| **tabel_koleksi_updated.js** | Load, filter, render tabel koleksi | 466 lines | ✅ Active |
| **laporan.js** | Laporan lengkap + export Excel/PDF | 274 lines | ✅ Active |
| **reporting.js** | Laporan lanjutan (per gudang, date) | 250+ lines | ✅ Active |
| **kategori.js** | CRUD kategori | Medium | ✅ Active |
| **dashboard_analytics.js** | Analytics charts & stats | Medium | ✅ Active |
| **maintenance.js** | Track maintenance history | Medium | ✅ Active |
| **profile.js** | Edit user profile | Small | ✅ Active |
| **Login.js** | Login form handler | Medium | ✅ Active |
| **register.js** | Register form handler | Medium | ✅ Active |
| **logout.js** | Logout + clear token | Small | ✅ Active |
| **add-collection-fixed.js** | Old version | - | ❌ Deprecated |
| **collections.js** | Old version | - | ❌ Deprecated |
| **dashboard_stats.js** | Old version | - | ❌ Deprecated |
| **get_kategori.js** | Old version | - | ❌ Deprecated |

---

## 🎯 Penjelasan FILE-BY-FILE

### 1. **add-collection.js** - Form Tambah/Edit Koleksi

**Fungsi**: Menangani form tambah koleksi baru & edit koleksi existing

**Alur**:
```
Page Load (DOMContentLoaded)
    ↓
Setup form fields (nama, nomor, kategori, dll)
    ↓
Fetch dropdown data (gudang, kategori, rak, tahap)
    ↓
User isi form & submit
    ↓
Validasi semua fields (validateText, validateNumber, dll)
    ↓
Check duplikasi nomor register/inventory (API call)
    ↓
Upload foto (jika ada)
    ↓
POST/PUT ke /api/koleksi
    ↓
Success: Show alert, reload tabel
Error: Show error per field
```

**Key Functions**:
- `checkDuplicateNumbers(noReg, noInv)` - Check duplikasi
- `setupDropdowns()` - Populate dropdown gudang, kategori, dll
- Form submit handler - Validasi & upload

**Pakai**:
- `validateText()` dari utils/validation.js
- `validateNumber()` dari utils/validation.js
- `validateDecimal()` dari utils/validation.js
- `authFetch()` dari utils/auth.js
- `showAlert()` dari utils/modal.js
- Endpoint dari config/url_koleksi.js

**Tampilan**: Form modal di Template/admin/koleksi.html

---

### 2. **tabel_koleksi_updated.js** - Render & Filter Tabel Koleksi

**Fungsi**: Tampilkan koleksi dalam tabel, filter, detail, edit, hapus

**Alur**:
```
Page Load
    ↓
Fetch semua data:
├─ koleksi dari /api/koleksi
├─ gudang dari /api/gudang
└─ kategori dari /api/kategori
    ↓
Render tabel dengan data awal
Render sidebar filter buttons (per gudang)
    ↓
User filter:
├─ Click gudang button (sidebar)
├─ Select kategori (dropdown)
└─ Type search text
    ↓
Re-render tabel dengan filter applied
    ↓
User klik action button:
├─ Detail → Show detail modal
├─ Edit → Populate form modal (call add-collection.js)
└─ Hapus → Delete confirmation → DELETE API call
    ↓
Refresh tabel
```

**Key Functions**:
- `loadInitialData()` - Fetch semua data awal
- `populateGudangSubmenu()` - Render sidebar filter buttons
- `applyFilters()` - 3-stage filter (gudang → kategori → search)
- `renderKoleksi()` - Render tabel rows
- `detailKoleksi()` - Show detail modal
- `editKoleksi()` - Populate edit form
- `deleteKoleksi()` - Delete dengan confirm

**Pakai**:
- `authFetch()` dari utils/auth.js
- `showAlert()` dari utils/modal.js
- Endpoint dari config/url_koleksi.js

**Tampilan**: Table di Template/admin/koleksi.html

---

### 3. **laporan.js** - Laporan Lengkap & Export

**Fungsi**: Tampilkan semua koleksi dalam laporan, export Excel/PDF

**Alur**:
```
Page Load
    ↓
Fetch semua koleksi dari /api/koleksi
    ↓
Render tabel dengan deskripsi collapsible
(jika deskripsi > 140 char, tampil "Lihat selengkapnya")
    ↓
User klik Export Excel / PDF
    ↓
Build data array dari tabel
Export ke file (XLSX / PDF)
Download ke browser
```

**Key Functions**:
- `renderTable(list)` - Render tabel dengan collapsible deskripsi
- `exportCSV()` - Export ke CSV
- `exportPDF()` - Export ke PDF (jsPDF library)
- `exportExcel()` - Export ke XLSX (XLSX library)

**Pakai**:
- `authFetch()` dari utils/auth.js
- Libraries: `jsPDF`, `XLSX`

**Tampilan**: Tabel di Template/admin/laporan.html (Tab 1: Data Lengkap)

---

### 4. **reporting.js** - Laporan Lanjutan (Per Gudang, Per Tanggal)

**Fungsi**: Advanced filter & reporting per gudang atau date range

**Alur**:
```
Tab 2: Per Gudang
    ↓
Fetch semua koleksi
Group by gudang
    ↓
Render summary tabel: gudang, jumlah item, kondisi breakdown
    ↓
User klik "Detail" per gudang
    ↓
Show modal dengan:
├─ Statistik kondisi (cards)
└─ Tabel item per gudang
    ↓
Export per gudang (Excel / PDF)

---

Tab 3: Berdasarkan Tanggal
    ↓
User input: Start Date, End Date
    ↓
Filter koleksi dengan tanggal dalam range
    ↓
Render tabel (sama seperti laporan lengkap)
    ↓
Export Excel / PDF
```

**Key Functions**:
- `loadReportPerGudang()` - Load & render gudang report
- `detailReportGudang()` - Show gudang detail modal
- `loadReportPerTanggal()` - Filter by date range
- `exportGudangToExcel()` - Export per gudang

**Pakai**:
- `authFetch()` dari utils/auth.js
- `showAlert()` dari utils/modal.js
- Libraries: `XLSX`

**Tampilan**: Tabs di Template/admin/laporan.html (Tab 2 & 3)

---

### 5. **kategori.js** - CRUD Kategori

**Fungsi**: Manage kategori (Create, Read, Update, Delete)

**Alur**:
```
Page Load
    ↓
Fetch semua kategori
    ↓
Render tabel: nama, jumlah item, aksi buttons
    ↓
User action:
├─ Tambah → Show form modal
├─ Edit → Populate form modal
├─ Hapus → Delete confirmation
└─ Detail → Show detail
    ↓
API call (POST/PUT/DELETE)
    ↓
Refresh tabel
```

**Pakai**:
- `authFetch()` dari utils/auth.js
- `validateText()` dari utils/validation.js
- Endpoint dari config/url_kategori.js atau url_koleksi.js

**Tampilan**: Table di Template/admin/kategori.html

---

### 6. **dashboard_analytics.js** - Analytics Dashboard

**Fungsi**: Tampilkan statistik, charts, distribusi

**Fitur**:
- Statistik kondisi barang (Baik, Rusak, Perlu Perbaiki) → Bar chart
- Total nilai koleksi → Summary card
- Distribusi per kategori → Table + percentage
- Distribusi per gudang → Bar chart

**Alur**:
```
Page Load
    ↓
Fetch semua koleksi
    ↓
Calculate statistics:
├─ Count by kondisi
├─ Sum total nilai
└─ Count by kategori/gudang
    ↓
Render charts (Chart.js atau Canvas)
Render tables
    ↓
User klik Refresh
    ↓
Fetch latest data & re-render
```

**Pakai**:
- `authFetch()` dari utils/auth.js
- Library: Chart.js (untuk charts)

**Tampilan**: Dashboard di Template/admin/dashboard_analytics.html

---

### 7. **maintenance.js** - Maintenance Tracking

**Fungsi**: Track & manage maintenance history

**Fitur**:
- Lihat item yang perlu dirawat (kondisi "Perlu Diperbaiki")
- Catat maintenance baru
- View maintenance history
- Total biaya maintenance

**Alur**:
```
Page Load
    ↓
Fetch maintenance history
Fetch koleksi dengan kondisi "Perlu Diperbaiki"
    ↓
Render:
├─ Items to maintain (tabel)
├─ Maintenance history (tabel)
└─ Cost summary (card)
    ↓
User catat maintenance baru
    ↓
Form submit → Validasi → POST /api/maintenance
    ↓
Refresh tabel
```

**Pakai**:
- `authFetch()` dari utils/auth.js
- `validateText()`, `validateDate()` dari utils/validation.js

**Tampilan**: Page di Template/admin/maintenance.html

---

### 8. **profile.js** - Edit User Profile

**Fungsi**: Manage user profile (username, email, phone)

**Alur**:
```
Page Load
    ↓
Fetch user profile dari /api/users/profile
    ↓
Populate form dengan data lama
    ↓
User edit field & submit
    ↓
Validasi input
    ↓
PUT /api/users/profile
    ↓
Success: Refresh data, show alert
Error: Show error message
```

**Pakai**:
- `authFetch()` dari utils/auth.js
- `validateText()`, `validateEmail()` dari utils/validation.js

**Tampilan**: Form di Template/admin/profil.html

---

### 9. **Login.js** - Login Form Handler

**Fungsi**: Proses login user

**Alur**:
```
Page Load
    ↓
Setup form listener
    ↓
User input email & password
    ↓
Form submit:
├─ Validasi email format
├─ Validasi password not empty
│
├─ POST /api/auth/login
│   {email, password}
│
├─ Server return JWT token
│
├─ Frontend store token di cookie
│
└─ Redirect ke /Template/admin/dasboard.html
    ↓
If error:
├─ Show error message
└─ Keep di login page
```

**Pakai**:
- `validateEmail()` dari utils/validation.js
- `fetch()` (plain, not authFetch - karena belum login)
- Endpoint dari config/url.js

**Tampilan**: Form di Template/login.html

---

### 10. **register.js** - Register Form Handler

**Fungsi**: Register user baru

**Alur**:
```
Page Load
    ↓
Setup form listener
    ↓
User input: email, username, password, confirm password
    ↓
Form submit:
├─ Validasi email format
├─ Validasi password (min 6 char)
├─ Validasi password match
├─ Check username available (optional API call)
│
├─ POST /api/users/register
│
├─ Success: Show alert, redirect ke login
└─ Error: Show error message
```

**Pakai**:
- `validateEmail()`, `validatePassword()` dari utils/validation.js
- Endpoint dari config/url.js

**Tampilan**: Form di Template/register.html

---

### 11. **logout.js** - Logout Handler

**Fungsi**: Clear token & redirect ke login

**Alur**:
```
User klik Logout button
    ↓
Show confirmation dialog
    ↓
If confirm:
├─ Clear token cookie
├─ Show alert message
└─ Redirect ke /Template/login.html
```

**Pakai**:
- `logout()` dari utils/auth.js (atau manual implementation)

**Tampilan**: Button di navbar/header semua halaman admin

---

### 12-15. **OLD/DEPRECATED FILES**

❌ **add-collection-fixed.js**
- Old version sudah di-fix di `add-collection.js`
- Jangan pakai

❌ **collections.js**
- Old version diganti dengan `tabel_koleksi_updated.js`
- Jangan pakai

❌ **dashboard_stats.js**
- Merged ke `dashboard_analytics.js`
- Jangan pakai

❌ **get_kategori.js**
- Logic sudah di `kategori.js`
- Jangan pakai

---

## 📊 Controller Files Hierarchy

```
koleksi.html
├─ tabel_koleksi_updated.js
│  ├─ Load koleksi
│  ├─ Render tabel
│  ├─ Filter
│  ├─ Detail/Edit/Hapus
│  └─ Call add-collection.js saat edit
│
└─ add-collection.js
   ├─ Form validation
   ├─ Foto upload
   ├─ Duplikasi check
   ├─ POST/PUT /api/koleksi
   └─ Reload tabel (call tabel_koleksi_updated.js)

---

laporan.html
├─ Tab 1: laporan.js
│  ├─ Load all koleksi
│  ├─ Render tabel
│  └─ Export Excel/PDF
│
├─ Tab 2&3: reporting.js
│  ├─ Advanced filter
│  ├─ Per gudang / per date
│  └─ Export
│
└─ Shared styling

---

kategori.html
└─ kategori.js
   ├─ Load kategori
   ├─ Render tabel
   ├─ CRUD operations
   └─ Validasi

---

dashboard_analytics.html
└─ dashboard_analytics.js
   ├─ Load koleksi
   ├─ Calculate stats
   ├─ Render charts
   └─ Render tables

---

maintenance.html
└─ maintenance.js
   ├─ Load maintenance history
   ├─ Load items to maintain
   ├─ Render tables
   └─ CRUD maintenance
```

---

# 3️⃣ FOLDER `utils/` - Helper Functions

**Fungsi**: Reusable functions yang dipakai di banyak file  
**Pakai**: Import ke controller files  
**Penting**: Jangan di-edit sembarangan (bisa break banyak file)

---

## 📋 DAFTAR UTILS

| File | Fungsi | Active |
|------|--------|--------|
| **auth.js** | Token, logout, authFetch | ✅ |
| **validation.js** | Input validation, XSS prevention | ✅ |
| **modal.js** | Alert/confirm/prompt dialogs | ✅ |
| **config.js** | Global constants (BASE_URL) | ✅ |

---

## Penjelasan DETAIL

### 1. **auth.js** - Token & Authentication

**Exports** (functions yang bisa di-import):
```javascript
export function getToken()              // Ambil JWT dari cookie
export function isTokenExpired()        // Cek token expired?
export function logout(message)         // Clear token + redirect
export async function authFetch(...)    // Secure fetch + token auto-attach
export function initActivityTracking()  // Track idle activity
export function startTokenExpiryCheck() // Check expiry setiap 1 min
```

**Fungsi Penting**:

#### `getToken()`
```javascript
// Ambil JWT token dari browser cookie
// Return: string token atau null jika tidak ada
const token = getToken();
// Result: "eyJhbGciOiJIUzI1NiIs..."
```

#### `isTokenExpired()`
```javascript
// Cek apakah token sudah kedaluwarsa
// Decode JWT payload → cek exp field
// Return: boolean (true = expired)
if (isTokenExpired()) {
  logout(); // Auto logout
}
```

#### `authFetch(url, options)` ⭐ PENTING
```javascript
// Secure fetch wrapper
// Otomatis: attach token + handle errors
// Return: Promise<JSON response>

const data = await authFetch(`${BASE_URL}/api/koleksi`, {
  method: 'POST',
  body: JSON.stringify({nama: 'Keramik'})
});

// Otomatis:
// ✅ Ambil token dari cookie
// ✅ Cek expired? → logout jika yes
// ✅ Tambah header Authorization: Bearer {token}
// ✅ Catch network error → show friendly message
// ✅ Check 401/403 → auto logout
// ✅ Return parsed JSON
```

#### `logout(message)`
```javascript
// Hapus token cookie
// Show alert message
// Redirect ke login page setelah 2 detik

logout("Sesi kamu telah habis");
```

#### `initActivityTracking()`
```javascript
// Track user activity (mouse, keyboard, touch)
// Reset idle timer setiap ada activity
// Jika idle 30 menit → auto logout

// Call ini di dashboard page load:
document.addEventListener('DOMContentLoaded', () => {
  initActivityTracking();
});
```

#### `startTokenExpiryCheck()`
```javascript
// Check token expiry setiap 1 menit (background)
// Jika expired → auto logout
// Prevent user surprise saat token suddenly invalid

document.addEventListener('DOMContentLoaded', () => {
  startTokenExpiryCheck();
});
```

**Dipakai oleh**: Semua controller files

---

### 2. **validation.js** - Input Validation & XSS Prevention

**Exports**:
```javascript
export function validateText(value, options)      // Validasi text
export function validateEmail(email)              // Validasi email
export function validatePassword(password)        // Validasi password
export function validateNumber(number, options)   // Validasi nomor
export function validateDate(dateStr)             // Validasi tanggal
export function validateDecimal(value, options)   // Validasi desimal
export function validateSelect(value, values)     // Validasi dropdown
export function validateForm(data, rules)         // Bulk validation
export function escapeHTML(text)                  // Sanitasi XSS
export function showInputError(inputEl, msg)     // Show error visual
export function clearInputError(inputEl)         // Clear error visual
export function attachInputValidation(...)       // Real-time validation
```

**Fungsi Penting**:

#### `validateText(value, options)` ⭐
```javascript
const result = validateText(userInput, {
  min: 3,                    // Minimal 3 karakter
  max: 100,                  // Maksimal 100 karakter
  required: true,            // Wajib diisi
  allowedPattern: /^[a-z]+$/,// Custom regex (optional)
  allowedMessage: "..."      // Custom error message
});

// Return: {valid, value, error}
// {valid: true, value: "Koleksi Museum", error: null}
// {valid: false, value: "x", error: "Minimal 3 karakter"}
```

#### `validateEmail(email)` ⭐
```javascript
const result = validateEmail("user@example.com");
// Check: Format valid? Length not > 254?
// Return: {valid, value, error}
```

#### `validatePassword(password)`
```javascript
const result = validatePassword("mypassword123");
// Check: Min 6 char? Not > 128 char?
// Return: {valid, value, error}
```

#### `validateNumber(number, options)`
```javascript
const result = validateNumber("087712345678", {
  digits: 10,        // Min 10 digit
  allowHyphen: true  // Allow 123-456-789
});
```

#### `validateDate(dateStr)`
```javascript
const result = validateDate("2025-01-26");
// Format: YYYY-MM-DD
// Check: Valid date?
// Return: {valid, value, error}
```

#### `validateDecimal(value, options)`
```javascript
const result = validateDecimal("25.5", {
  min: 0,
  max: 1000,
  decimals: 2,  // Max 2 decimal places
  required: true
});
```

#### `escapeHTML(text)` ⭐ PENTING - XSS Prevention
```javascript
const safe = escapeHTML("<script>alert('hacked')</script>");
// Result: "&lt;script&gt;alert(&#39;hacked&#39;)&lt;/script&gt;"

// Gunakan sebelum display user input di HTML:
element.innerHTML = escapeHTML(userGeneratedText);
```

#### `showInputError(inputElement, errorMessage)`
```javascript
const input = document.getElementById("nama");
showInputError(input, "Nama minimal 3 karakter");
// Visual: Input border berubah merah, error message muncul
```

#### `clearInputError(inputElement)`
```javascript
clearInputError(input);
// Visual: Hilangkan border merah dan error message
```

#### `attachInputValidation(inputElement, type, options)`
```javascript
// Real-time validation (blur on field)
attachInputValidation(
  document.getElementById("email"),
  "email"
);

// User blur dari field:
// ✅ Validate otomatis
// ✅ Show/clear error automatically
```

#### `validateForm(data, rules)` - Bulk Validation
```javascript
const result = validateForm(
  {
    nama: "Koleksi",
    email: "user@example.com",
    no_reg: "REG001"
  },
  {
    nama: {type: 'text', options: {min: 3, max: 100}},
    email: {type: 'email'},
    no_reg: {type: 'number'}
  }
);

// Return: {valid, errors, sanitized}
// {
//   valid: true,
//   errors: {},
//   sanitized: {nama: "Koleksi", email: "user@example.com", ...}
// }
```

**Dangerous Patterns yang Diblok**:
```javascript
❌ <script> tags
❌ <iframe> tags
❌ javascript: URLs
❌ eval() function
❌ SQL injection keywords: SELECT, INSERT, DELETE, DROP
❌ HTML entities
❌ Command injection: ; | & < > {} etc
```

**Dipakai oleh**: add-collection.js, Login.js, register.js, profile.js, dll

---

### 3. **modal.js** - Alert & Dialog System

**Exports**:
```javascript
export function showAlert(message, type)           // Alert popup
export function showConfirm(message, onConfirm)   // Confirm dialog
export function showPrompt(message, onConfirm)    // Input dialog
export function showLoadingModal()                // Loading spinner
export function closeLoadingModal()               // Close loading
```

**Fungsi Penting**:

#### `showAlert(message, type)` ⭐
```javascript
// Types: 'success', 'error', 'warning', 'info'

showAlert("Koleksi berhasil disimpan!", "success");
// Auto-close setelah 3 detik

showAlert("Gagal menyimpan", "error");
// Manual close - user klik OK

showAlert("Apakah yakin?", "warning");
showAlert("Proses berlangsung...", "info");
```

#### `showConfirm(message, onConfirm, onCancel)`
```javascript
showConfirm(
  "Apakah kamu yakin hapus koleksi ini?",
  () => {
    // User klik YES
    deleteKoleksi();
  },
  () => {
    // User klik NO
    console.log("Dibatalkan");
  }
);
```

#### `showPrompt(message, onConfirm)`
```javascript
showPrompt(
  "Masukkan nama kategori baru:",
  (value) => {
    console.log("User input:", value);
    // value = text yang user ketik
  }
);
```

#### `showLoadingModal()` & `closeLoadingModal()`
```javascript
// Saat API call:
showLoadingModal(); // Show spinner

try {
  const data = await authFetch(url, options);
  closeLoadingModal();
  showAlert("Success!", "success");
} catch (error) {
  closeLoadingModal();
  showAlert("Error!", "error");
}
```

**Styling**: Tailwind CSS, primary color theme, responsive

**Dipakai oleh**: Semua controller files

---

### 4. **config.js** - Global Configuration

**Exports**:
```javascript
export const BASE_URL = "https://inventorymuseum-de54c3e9b901.herokuapp.com";
```

**Fungsi**: Base URL untuk semua API calls

**Pakai**:
```javascript
import { BASE_URL } from "../utils/config.js";

const response = await authFetch(`${BASE_URL}/api/koleksi`);
```

**Dipakai oleh**: Semua controller files

**Kapan Edit**: Jika backend server pindah

---

## 📊 Utils Import Pattern

```javascript
// Standard import di setiap controller file:
import { BASE_URL } from "../utils/config.js";
import { authFetch } from "../utils/auth.js";
import { validateText, escapeHTML } from "../utils/validation.js";
import { showAlert, showConfirm } from "../utils/modal.js";

document.addEventListener('DOMContentLoaded', async () => {
  // Setup logic
});
```

---

# 4️⃣ FOLDER `Temp/` - ⚠️ DEPRECATED

**Status**: ❌ JANGAN PAKAI!  
**Fungsi**: Backup file lama yang sudah replace

---

## File-file Deprecated

| File | Alasan | Gunakan Sebaliknya |
|------|--------|------------------|
| **Fetch.js** | Old fetch wrapper | `authFetch()` dari `utils/auth.js` |
| **tabel_koleksi.js** | Old render logic | `tabel_koleksi_updated.js` dari `controller/` |
| **tabel_kategori.js** | Testing only | Not in production |
| **tabel_koleksi_updated.js** | Backup version | Main version di `controller/` |

**⚠️ WARNING**: Jangan import dari folder Temp!

```javascript
// ❌ JANGAN PAKAI
import { something } from "../Temp/Fetch.js";

// ✅ GUNAKAN INI
import { authFetch } from "../utils/auth.js";
```

---

# 📊 COMPLETE FILE DEPENDENCY DIAGRAM

```
┌──────────────────────────────────────────────────────────────────┐
│                      Templates (HTML)                            │
│  login.html | register.html | admin/koleksi.html | laporan.html │
└──────────────────┬──────────────────────────────────────────────┘
                   │
        ┌──────────┼──────────┬──────────┬──────────┐
        │          │          │          │          │
        ↓          ↓          ↓          ↓          ↓
    ┌────────┐ ┌──────┐ ┌──────────────┐ ┌────────────┐
    │ Login  │ │Regis-│ │ tabel_koleksi│ │ laporan.js │
    │  .js   │ │ter.js│ │ _updated.js  │ │ reporting.│
    │ logout │ │profile│ │add-collection│ │js        │
    │ .js    │ │ .js  │ │    .js       │ │kategori.js│
    └──┬─────┘ └──┬───┘ │ kategori.js  │ │maintenance│
       │          │     │dashboard_    │ │.js       │
       │          │     │analytics.js  │ └─────┬────┘
       │          │     └──┬───────────┘       │
       │          │        │                   │
       └────────┬─────────┘────────────────────┘
                │
    ┌───────────┴──────────────────────────────────────┐
    │                    UTILS                         │
    │  auth.js  validation.js  modal.js  config.js    │
    └────────────────────┬─────────────────────────────┘
                         │
    ┌────────────────────┴──────────────────┐
    │           CONFIG                      │
    │ url.js url_koleksi.js url_kategori.js│
    └───────────────────────────────────────┘
                         │
                         ↓
              ┌──────────────────────┐
              │   Backend API        │
              │  (Heroku)            │
              │ /api/koleksi         │
              │ /api/kategori        │
              │ /api/auth/login      │
              └──────────────────────┘
```

---

# 🚀 QUICK START - BAGAIMANA NAVIGASI FILE

### Skenario 1: Mau Tambah Feature Koleksi
1. Buka `controller/add-collection.js` - Form logic
2. Buka `controller/tabel_koleksi_updated.js` - Display logic
3. Check `utils/validation.js` - Validasi fields
4. Check `config/url_koleksi.js` - API endpoint

### Skenario 2: Mau Debug Login Error
1. Buka `controller/Login.js` - Login logic
2. Check `utils/auth.js` - Token handling
3. Check `config/url.js` - Login endpoint
4. Check browser Network tab (DevTools)

### Skenario 3: Mau Tambahin Validasi Custom
1. Buka `utils/validation.js`
2. Add function: `export function validateMyField(...)`
3. Import di controller file yang butuh
4. Use: `const result = validateMyField(value)`

### Skenario 4: Mau Edit Laporan
1. Buka `controller/laporan.js` - Laporan lengkap
2. Buka `controller/reporting.js` - Advanced laporan
3. Check export functions (Excel/PDF)

---

# 📚 REFERENCE CHEAT SHEET

## Import Patterns

```javascript
// ALWAYS use these:
import { BASE_URL } from "../utils/config.js";
import { authFetch } from "../utils/auth.js";
import { validateText, escapeHTML } from "../utils/validation.js";
import { showAlert } from "../utils/modal.js";

// Config endpoints:
import { API_KOLEKSI } from "../config/url_koleksi.js";
import { API_URLS } from "../config/url.js";

// NEVER use from Temp:
// ❌ import from "../Temp/...";
```

## Function Usage Quick Reference

```javascript
// Validation
const {valid, value, error} = validateText(input, {min:3, max:100});
if (!valid) showAlert(error, 'error'); return;

// Safe API call
const data = await authFetch(`${BASE_URL}/api/koleksi`);

// Safe output
element.innerHTML = escapeHTML(userInput);

// User feedback
showAlert("Berhasil!", "success");
showConfirm("Yakin?", onYes, onNo);
```

---

**Last Updated**: January 27, 2026  
**Total JS Files**: 25  
**Active Files**: 18  
**Deprecated Files**: 7
