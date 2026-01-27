# 📚 Panduan Struktur Folder

## Ringkasan Struktur

```
fe-internship/
├── 📄 README.md                    ← START HERE! Dokumentasi utama
├── 📄 index.html                   ← Landing page publik
├── 📁 docs/                        ← 📚 Dokumentasi (Anda di sini)
│   ├── ARCHITECTURE.md             ← Penjelasan alur & struktur
│   ├── FEATURES.md                 ← Penjelasan setiap fitur
│   └── FOLDER_GUIDE.md             ← Panduan ini
├── 📁 Js/                          ← Semua JavaScript
│   ├── config/                     ← 🔧 Konfigurasi API endpoints
│   ├── controller/                 ← 🎮 Business logic
│   ├── utils/                      ← 🛠️ Helper functions reusable
│   └── Temp/                       ← ⚠️ File deprecated (jangan pakai)
├── 📁 Template/                    ← HTML pages
│   ├── login.html                  ← Login page
│   ├── register.html               ← Register page
│   ├── dasboard.html               ← Admin dashboard
│   └── admin/                      ← Admin pages
│       ├── koleksi.html
│       ├── kategori.html
│       ├── laporan.html
│       ├── laporan_advanced.html
│       ├── dashboard_analytics.html
│       ├── maintenance.html
│       └── profil.html
└── 📁 assets/
    └── images/                     ← Gambar, logo, etc
```

---

## 1️⃣ Root Level Files

### `README.md` ⭐ START HERE
- Dokumentasi utama
- Quick start, folder overview, feature list
- API endpoints, troubleshooting

### `index.html`
- Landing page publik (bukan admin)
- Struktur organisasi, fitur overview
- Contact form
- Tidak perlu login

### `.htaccess`
- Apache routing configuration
- URL rewriting rules

---

## 2️⃣ `Js/` - JavaScript Organization

### `Js/config/` - Konfigurasi API

**Files**:
- `url.js` - Auth & user endpoints
- `url_koleksi.js` - Koleksi & kategori endpoints (PENTING!)
- `url_kategori.js` - Kategori endpoint only

**Kapan Edit**:
- Ganti server/backend URL
- Tambah endpoint baru

**Contoh**:
```javascript
// url_koleksi.js
export const API_KOLEKSI = {
  GET_KOLEKSI: "https://api.../api/koleksi",
  ADD_KOLEKSI: "https://api.../api/koleksi",
  GET_KATEGORI: "https://api.../api/kategori"
};
```

---

### `Js/controller/` - Business Logic

**Pola**: 1 file per halaman/fitur

**Active Files** (✅ Gunakan ini):
| File | Untuk |
|------|-------|
| `tabel_koleksi_updated.js` | Load, filter, render koleksi table |
| `add-collection.js` | Tambah/edit koleksi form |
| `laporan.js` | Laporan data lengkap & export |
| `reporting.js` | Laporan advanced (per gudang, date) |
| `kategori.js` | CRUD kategori |
| `dashboard_analytics.js` | Analytics charts & stats |
| `maintenance.js` | Track maintenance |
| `Login.js` | Login form |
| `register.js` | Register form |
| `logout.js` | Logout handler |
| `profile.js` | Edit user profile |

**Deprecated Files** (❌ Jangan pakai):
| File | Alasan |
|------|--------|
| `add-collection-fixed.js` | Sudah fix di add-collection.js |
| `collections.js` | Sudah fix di tabel_koleksi_updated.js |
| `dashboard_stats.js` | Merged ke dashboard_analytics.js |
| `get_kategori.js` | Logic moved ke kategori.js |

---

### `Js/utils/` - Helper Functions

**4 Essential Files** (✅ Pakai semua):

#### `auth.js` - Token & Security
```javascript
import { getToken, isTokenExpired, authFetch, logout } from "../utils/auth.js";
import { initActivityTracking, startTokenExpiryCheck } from "../utils/auth.js";
```
- Manage JWT tokens
- Secure API calls
- Auto logout (idle + expired)

#### `validation.js` - Input Validation
```javascript
import { 
  validateText, validateEmail, validatePassword,
  validateNumber, validateDate, validateDecimal,
  escapeHTML, showInputError, clearInputError
} from "../utils/validation.js";
```
- Validasi input (berbagai tipe)
- XSS prevention
- Real-time validation

#### `modal.js` - Dialogs
```javascript
import { showAlert, showConfirm, showPrompt } from "../utils/modal.js";
import { showLoadingModal, closeLoadingModal } from "../utils/modal.js";
```
- Alert popups
- Confirm dialogs
- Loading spinners

#### `config.js` - Global Constants
```javascript
import { BASE_URL } from "../utils/config.js";
```
- Base URL API
- Global settings

---

### `Js/Temp/` - ⚠️ DEPRECATED

**❌ JANGAN PAKAI!** File-file ini sudah deprecated:

| File | Alasan | Gunakan Sebaliknya |
|------|--------|------------------|
| `Fetch.js` | Old fetch wrapper | `authFetch()` dari utils/auth.js |
| `tabel_koleksi.js` | Old render logic | `tabel_koleksi_updated.js` |
| `tabel_kategori.js` | Testing only | Lepas dari production |

Folder ini hanya untuk backup. Jangan import dari sini.

---

## 3️⃣ `Template/` - HTML Pages

### Root Level
```
Template/
├── login.html          ← Login page (public)
├── register.html       ← Register page (public)
└── dasboard.html       ← Admin dashboard (protected)
```

### `Template/admin/` - Protected Pages
Semua halaman di sini memerlukan login:

```
admin/
├── koleksi.html               ← Manage koleksi (CRUD)
├── kategori.html              ← Manage kategori (CRUD)
├── laporan.html               ← Reports (3 tabs)
├── laporan_advanced.html       ← Advanced reports (backup)
├── dashboard_analytics.html    ← Analytics dashboard
├── maintenance.html            ← Maintenance tracking
└── profil.html                ← User profile edit
```

**Bagaimana cara script diload**:
Setiap HTML page punya `<script>` tag di bawah yang load controller:
```html
<!-- Di Template/admin/koleksi.html -->
<script src="../../Js/controller/tabel_koleksi_updated.js" type="module"></script>
<script src="../../Js/controller/add-collection.js" type="module"></script>
```

Controller akan:
1. Auto-run saat page load
2. Setup event listeners
3. Load initial data dari API

---

## 4️⃣ `assets/` - Static Assets

### `assets/images/`
- Logo
- Struktur organisasi chart
- Koleksi photos
- Default placeholders

**Naming Convention**:
- Use kebab-case: `struktur-organisasi.webp`
- Use descriptive names: `foto-koleksi-1.jpg`

---

## 🔄 Data Flow Path

### Contoh: Tambah Koleksi

```
1. User buka Template/admin/koleksi.html
   ↓
2. Page load → JS otomatis jalankan add-collection.js (DOMContentLoaded)
   ↓
3. Form fields di-populate dengan dropdown data (gudang, kategori)
   ├─ Fetch dari /api/gudang, /api/kategori
   ├─ Using authFetch() dari utils/auth.js
   ├─ Using BASE_URL dari utils/config.js
   └─ Using endpoint dari config/url_koleksi.js
   ↓
4. User isi form & klik submit
   ├─ add-collection.js catch form submit event
   ├─ Validasi inputs dengan validation.js
   ├─ Check duplikasi nomor (API call)
   ├─ Upload foto (FormData)
   └─ POST ke /api/koleksi using authFetch()
   ↓
5. API Response
   ├─ Success → Show alert, reload tabel
   └─ Error → Show error message per field
   ↓
6. Tabel reload triggered
   ├─ tabel_koleksi_updated.js.reloadKoleksiData()
   ├─ Fetch latest data dari /api/koleksi
   └─ Re-render tabel dengan item baru
```

---

## 📋 Checklist: Gimana Setup Awal

- [ ] Read `README.md` (di root)
- [ ] Understand `docs/ARCHITECTURE.md` (alur & struktur)
- [ ] Read `docs/FEATURES.md` (setiap fitur dijelasin)
- [ ] Understand `docs/FOLDER_GUIDE.md` (panduan ini)
- [ ] Open `Js/config/url_koleksi.js` → Check endpoint URL benar?
- [ ] Open `Js/utils/config.js` → Check BASE_URL benar?
- [ ] Open `Template/admin/koleksi.html` → Test di browser
- [ ] Open DevTools (F12) → Check Network tab untuk API calls
- [ ] Check Console → Ada error? Debug dulu sebelum develop

---

## 🚀 Kapan Memodifikasi Apa

### Tambah Fitur Baru
```
1. Create Template/admin/my-feature.html
2. Create Js/controller/my-feature.js (with imports)
3. Add endpoint ke Js/config/url.js (if needed)
4. Test di browser (DevTools Network tab)
5. Import utils (auth, validation, modal, config)
6. Handle errors gracefully (try/catch)
```

### Ganti Backend Server
```
1. Edit Js/utils/config.js → BASE_URL
2. Test semua API calls di DevTools
3. Check CORS errors
4. Update Js/config/*.js jika endpoint berubah
```

### Ubah Form Validation
```
1. Edit Js/utils/validation.js
2. Add new validate function atau update existing
3. Import di controller yang relevant
4. Test form submit dengan invalid input
```

### Tambah Alert/Dialog
```
1. Use showAlert() dari utils/modal.js
2. Types: 'success', 'error', 'warning', 'info'
3. Auto-close untuk success (3 detik)
4. Manual close untuk other types
```

### Debug API Issues
```
1. Open DevTools (F12)
2. Go to Network tab
3. Perform action (submit form, load page)
4. Check request URL, method, headers
5. Check response status, body
6. Check Console tab untuk JavaScript errors
7. Common issues:
   - 404: Endpoint URL salah
   - 401: Token invalid/expired
   - 400: Validation error (bad request)
   - 500: Backend error
```

---

## 📝 File Import Patterns

### Controller Files (Standard)
```javascript
// Template/admin/koleksi.html
import { BASE_URL } from "../utils/config.js";
import { authFetch } from "../utils/auth.js";
import { validateText, escapeHTML } from "../utils/validation.js";
import { showAlert, showConfirm } from "../utils/modal.js";
import { API_KOLEKSI } from "../config/url_koleksi.js";

document.addEventListener('DOMContentLoaded', async () => {
  // Logic here
});
```

### Never Import From
```javascript
// ❌ JANGAN IMPORT dari Js/Temp/
import { something } from "../Temp/Fetch.js";  // ❌ DEPRECATED
import { renderKoleksi } from "../Temp/tabel_koleksi.js";  // ❌ OLD VERSION
```

---

## 🎯 Quick Reference

| Butuh | Cari di |
|------|--------|
| Tambah endpoint API | `Js/config/url_*.js` |
| Tambah validasi | `Js/utils/validation.js` |
| Tambah alert/dialog | `Js/utils/modal.js` |
| Secure API call | `Js/utils/auth.js` (authFetch) |
| Token management | `Js/utils/auth.js` |
| Global settings | `Js/utils/config.js` |
| Koleksi logic | `Js/controller/tabel_koleksi_updated.js` |
| Laporan logic | `Js/controller/laporan.js` atau `reporting.js` |
| Form tambah/edit | `Js/controller/add-collection.js` |
| Analytics | `Js/controller/dashboard_analytics.js` |
| Maintenance | `Js/controller/maintenance.js` |
| HTML pages | `Template/` dan `Template/admin/` |
| Gambar/assets | `assets/images/` |

---

## 💡 Tips & Tricks

1. **Always use `authFetch()` for API calls** - bukan `fetch()` biasa
   - Otomatis attach token
   - Otomatis logout jika 401/403
   - Graceful error handling

2. **Always validate input before API call**
   - Use `validateText()`, `validateEmail()`, etc
   - Show error di input field
   - Prevent invalid data ke backend

3. **Always escape output dari API**
   - Use `escapeHTML()` untuk user-generated content
   - Prevent XSS attacks

4. **Use meaningful variable names**
   - `const koleksiItem` bukan `const item`
   - `const isFormValid` bukan `const valid`

5. **Add comments untuk logic kompleks**
   ```javascript
   // Check duplikasi nomor register via API
   // Return {exists: true/false, skipped: true if network error}
   const dupCheck = await checkDuplicateNumbers(noReg, noInv);
   ```

6. **Test dengan DevTools offline**
   - DevTools → Network tab → Offline checkbox
   - Test network error handling
   - Ensure graceful fallback

---

**Last Updated**: January 27, 2026
**Version**: 2.0 (Cleanup & Organization)
