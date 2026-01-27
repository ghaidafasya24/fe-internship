# 🏗️ Arsitektur JavaScript

## Alur Data Aplikasi

```
┌─────────────────┐
│  HTML (Form)    │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────┐
│  Controller (add-collection.js)  │
│  - Handle user events           │
│  - Read form inputs             │
│  - Call validasi                │
└────────┬────────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│  Utils/validation.js             │
│  - Cek input valid?              │
│  - Sanitasi XSS (escapeHTML)    │
└────────┬───────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│  Utils/auth.js                   │
│  - Ambil token dari cookie       │
│  - Cek token expired?            │
│  - Tambah Authorization header   │
└────────┬───────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│  Config (url_koleksi.js)         │
│  - Ambil endpoint URL            │
└────────┬───────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│  authFetch(url, options)         │
│  - Kirim HTTP request ke backend │
└────────┬───────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│  Backend API (Heroku)            │
│  - Process data                  │
│  - Return JSON response          │
└────────┬───────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│  Controller (handle response)    │
│  - Parse JSON                    │
│  - Check error?                  │
└────────┬───────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│  Utils/modal.js                  │
│  - Tampilkan alert/confirm       │
└────────┬───────────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│  Controller (render UI)          │
│  - Update tabel/modal            │
│  - Refresh data                  │
└──────────────────────────────────┘
```

---

## Folder Structure Detail

### 1. `Js/config/` - Configuration

**Files**:
- `url.js` - Endpoint umum (login, register, profile)
- `url_koleksi.js` - Koleksi & kategori endpoints
- `url_kategori.js` - Kategori endpoint only

**Fungsi**:
- Kumpulan URL endpoint API
- Mudah di-update jika server pindah
- Avoid hardcoding URL di banyak tempat

**Contoh**:
```javascript
export const API_KOLEKSI = {
  GET_KOLEKSI: "https://api.../api/koleksi",
  ADD_KOLEKSI: "https://api.../api/koleksi",
  GET_KATEGORI: "https://api.../api/kategori"
};
```

---

### 2. `Js/controller/` - Business Logic

**Pola MVC**:
- **Model** = Backend API data
- **View** = HTML template
- **Controller** = JavaScript logic yang menghubungkan keduanya

**File-file**:

| File | Fungsi |
|------|--------|
| `tabel_koleksi_updated.js` | Load koleksi, filter, render tabel, detail/edit/hapus |
| `add-collection.js` | Form validation, submit, foto upload |
| `laporan.js` | Fetch all koleksi, render table, export Excel/PDF |
| `reporting.js` | Advanced filter (per gudang, per date range) |
| `kategori.js` | CRUD untuk kategori |
| `dashboard_analytics.js` | Analytics charts (kondisi, nilai, distribusi) |
| `maintenance.js` | Track maintenance history & schedule |
| `Login.js` | Login form handler |
| `register.js` | Register form handler |
| `logout.js` | Logout + redirect |
| `profile.js` | Edit user profile |

**Contoh Alur** (add-collection.js):
```
1. Form DOMContentLoaded
   ↓
2. Populate dropdowns (gudang, kategori, rak, tahap)
   ↓
3. User fill form & submit
   ↓
4. Form submit listener:
   - Validasi all fields (validateText, validateDecimal, dll)
   - Check duplikasi nomor register/inventory (API call)
   - Upload foto (FormData)
   ↓
5. authFetch POST/PUT ke /api/koleksi
   ↓
6. Success → showAlert + refresh tabel
   Error → showAlert + show input error markers
```

---

### 3. `Js/utils/` - Helper Functions

**4 Files**:

#### **auth.js** - Token & Security
- `getToken()` - Ambil JWT dari cookie
- `isTokenExpired()` - Cek token sudah expired?
- `authFetch(url, options)` - Secure fetch dengan token auto-attach
- `logout()` - Hapus token, redirect ke login
- `initActivityTracking()` - Track user activity (30 min idle = auto logout)
- `startTokenExpiryCheck()` - Check token expiry setiap 1 menit

#### **validation.js** - Input Validation & XSS Prevention
- `validateText()` - Validasi teks biasa
- `validateEmail()` - Validasi email
- `validatePassword()` - Min 6 karakter
- `validateNumber()` - Validasi nomor
- `validateDate()` - Validasi tanggal (YYYY-MM-DD)
- `validateDecimal()` - Validasi angka desimal (ukuran, dll)
- `escapeHTML()` - Remove <script>, XSS patterns
- `showInputError()` - Tampil error visual di input
- `clearInputError()` - Hapus error visual
- `attachInputValidation()` - Real-time validation on blur

#### **modal.js** - Dialogs & Alerts
- `showAlert(message, type)` - Alert popup (success/error/warning/info)
- `showConfirm(message, onConfirm, onCancel)` - Konfirmasi dialog
- `showPrompt(message, onConfirm)` - Input text dialog
- `showLoadingModal()` - Loading spinner
- `closeLoadingModal()` - Close loading

#### **config.js** - Global Constants
- `BASE_URL` - Base URL untuk semua API calls

---

### 4. `Js/Temp/` - ⚠️ DEPRECATED

**Jangan pakai!** File-file ini sudah deprecated:
- `tabel_koleksi.js` → Gunakan `controller/tabel_koleksi_updated.js` instead
- `Fetch.js` → Gunakan `utils/auth.js` (`authFetch()` function) instead
- `tabel_kategori.js` → Testing only

---

## Function Call Examples

### Adding New Collection
```javascript
// 1. Validasi
const nameResult = validateText(nameInput.value, { min: 3, max: 100 });
if (!nameResult.valid) {
  showInputError(nameInput, nameResult.error);
  return;
}

// 2. API call
const response = await authFetch(`${BASE_URL}/api/koleksi`, {
  method: 'POST',
  body: JSON.stringify({
    nama_benda: nameResult.value,
    no_register: noRegInput.value,
    // ... other fields
  })
});

// 3. Handle response
if (response.success) {
  showAlert('Koleksi berhasil ditambah!', 'success');
  refreshKoleksiTable(); // Re-render tabel
} else {
  showAlert('Error: ' + response.message, 'error');
}
```

### Real-time Input Validation
```javascript
// Attach ke form field
attachInputValidation(
  document.getElementById('email'),
  'email'
);

// User blur dari field → validasi otomatis
// Valid → hilang error visual
// Invalid → tampil error message di bawah input
```

### Secure API Calls
```javascript
// authFetch otomatis:
// - Ambil token dari cookie
// - Cek token expired? → logout if yes
// - Tambah Authorization header
// - Handle network errors gracefully
// - Check 401/403 → auto logout

const data = await authFetch('/api/koleksi', {
  method: 'GET'
});
// Already handled: auth, token, error
```

---

## Error Handling Flow

```
Try authFetch()
  ├─ Network error (no internet)
  │  └─ Throw: "Network error: gagal menghubungi server..."
  │
  ├─ 401/403 Unauthorized
  │  └─ logout() → redirect ke login
  │
  ├─ 404/500 Server error
  │  └─ Throw: "HTTP 404/500"
  │
  └─ 200 OK → return JSON
       └─ Handle di controller
```

**Controller Error Handling**:
```javascript
try {
  const res = await authFetch(url, options);
  showAlert('Success!', 'success');
  refreshUI();
} catch (error) {
  if (error.message.includes('Network')) {
    showAlert('Koneksi internet tidak stabil', 'error');
  } else {
    showAlert('Error: ' + error.message, 'error');
  }
}
```

---

## Security Measures

1. **Token Management**
   - JWT stored in secure HTTP-only cookies
   - Auto check expiry (frontend + backend)
   - Auto logout after 30 min idle

2. **Input Validation**
   - All user input validated (type, length, format)
   - XSS prevention: `escapeHTML()`
   - Dangerous patterns blocked (scripts, eval, etc)

3. **API Security**
   - All requests signed with Bearer token
   - FormData for file uploads (no JSON)
   - CORS headers validated

4. **Error Handling**
   - Network errors caught gracefully
   - No sensitive data in error messages
   - User-friendly error alerts

---

## Development Workflow

### Adding New Feature
1. Create HTML in `Template/admin/new-feature.html`
2. Create controller in `Js/controller/new-feature.js`
3. Import utils (auth, validation, modal, config)
4. Add API config in `Js/config/url.js` if needed
5. Test in browser
6. Deploy

### Debugging
- Use `console.log()` for debugging
- Use browser DevTools (F12) → Network tab to inspect API calls
- Use DevTools → Console to see errors
- Check cookies: DevTools → Application → Cookies

### Testing
- Test form validation manually
- Test with network offline (DevTools → offline)
- Test with invalid token (clear cookies)
- Test with invalid API response (DevTools mock)

