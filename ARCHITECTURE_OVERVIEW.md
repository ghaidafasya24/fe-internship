# Museum Sri Baduga FE — Architecture Overview

This guide helps you understand folders, files, and how data flows across templates, controllers, utils, and APIs.

## High-Level
- Templates (views) render pages and provide DOM IDs/classes.
- Controllers in `Js/controller/` attach event listeners, perform validation, and call APIs.
- Utils provide shared helpers: auth/token, config, validation, modal.
- Config holds API base URLs and grouped endpoints.
- Temp contains table row templates and list rendering logic.

## Folders
- `Template/` — HTML pages for admin and auth.
  - `admin/koleksi.html`, `admin/kategori.html`, `admin/laporan.html`, etc.
  - `login.html`, `register.html`, `dasboard.html`.
- `Js/controller/` — page-specific logic (controllers).
  - `add-collection.js`, `add-collection-fixed.js` — add/edit collection form.
  - `collections.js` — loads and renders collection list.
  - `kategori.js` — CRUD for categories.
  - `Login.js`, `logout.js`, `profile.js`, `register.js` — auth/profile flows.
  - `laporan.js`, `reporting.js`, `dashboard_analytics.js`, `dashboard_stats.js`, `maintenance.js` — dashboard & reporting.
- `Js/utils/` — shared helpers.
  - `config.js` — `BASE_URL` for all API calls.
  - `auth.js` — `authFetch()`, token cookie management, idle logout.
  - `validation.js` — input validation and realtime field helpers.
  - `modal.js` — UX alerts/confirm dialogs.
- `Js/config/` — grouped endpoint constants.
  - `url.js`, `url_kategori.js`, `url_koleksi.js`.
- `Js/Temp/` — rendering helpers & table components.
  - `tabel_koleksi_updated.js`, `tabel_koleksi.js`, `tabel_kategori.js`.
- `assets/` — images and static assets.
- `index.html` — public landing page.

## Config & URLs
- [Js/utils/config.js](Js/utils/config.js) — `export const BASE_URL = "https://inventorymuseum-de54c3e9b901.herokuapp.com"`.
- [Js/config/url.js](Js/config/url.js) — common endpoints (login, register, profile update).
- [Js/config/url_kategori.js](Js/config/url_kategori.js) — `API_URLS.kategori` endpoint.
- [Js/config/url_koleksi.js](Js/config/url_koleksi.js) — collection and category endpoints for listing/adding.

## Auth & Modals
- [Js/utils/auth.js](Js/utils/auth.js)
  - `getToken()`, `isTokenExpired()`, `logout()`.
  - `authFetch(url, options)` adds headers, handles FormData vs JSON, and auto-logout on 401/403.
  - Idle timeout (30 minutes) and periodic token expiry checks.
- [Js/utils/modal.js](Js/utils/modal.js)
  - `showAlert(message, type)` and `showConfirm(message, onConfirm)` for consistent UX messages.

## Validation
- [Js/utils/validation.js](Js/utils/validation.js)
  - `validateText`, `validateEmail`, `validatePassword`, `validateNumber`, `validateDate`, `validateDecimal`, `validateForm`.
  - `attachInputValidation(input, type, options)` to wire realtime validation on blur/focus.
  - `showInputError`, `clearInputError` to toggle field error visuals.

## Collections (Koleksi)
- View: [Template/admin/koleksi.html](Template/admin/koleksi.html)
  - Provides filters: gudang submenu, kategori select, search input.
  - Table with `tbody#tableKoleksi`; modal form `#addCollectionForm` for add/edit.
- List rendering: [Js/Temp/tabel_koleksi_updated.js](Js/Temp/tabel_koleksi_updated.js)
  - Loads `allKoleksiData`, `allGudangData`, `allKategoriData` via `authFetch(BASE_URL/...)`.
  - Renders rows with action buttons (Detail/Edit/Hapus).
  - Filters by gudang, kategori, and search; re-applies filters on reloads.
  - Exposes `reloadKoleksiData()` for controllers to refresh after mutations.
- Controller: [Js/controller/add-collection.js](Js/controller/add-collection.js)
  - Populates dropdowns (`kategori`, `gudang → rak → tahap`).
  - `window.editKoleksi(id)` loads details, fills form, and shows modal.
  - Submit handler validates fields, checks duplicates (`no_reg`, `no_inv`), builds `FormData`, and calls `POST/PUT /api/koleksi` via `authFetch`.
  - Preserves old image if none selected during edit.
- Alternate controller: [Js/controller/add-collection-fixed.js](Js/controller/add-collection-fixed.js)
  - Similar logic; uses `Swal.fire` for notifications.
- Simple list: [Js/controller/collections.js](Js/controller/collections.js)
  - Example loader using `rowKoleksi()` from `tabel_koleksi_updated.js`.

## Categories (Kategori)
- View: [Template/admin/kategori.html](Template/admin/kategori.html)
  - Form `#formKategori`, modal `#modal`, table body `#iniTabelKategori tbody`.
- Controller: [Js/controller/kategori.js](Js/controller/kategori.js)
  - `getAllKategori()`, `createKategori()`, `updateKategori(id)`, `deleteKategori(id)` using `authFetch`.
  - Validates inputs with `validateText`; realtime `blur` checks; search filter on table rows.
  - Uses `FormData` for `POST/PUT` to minimize `Content-Type` issues.
- Row template: [Js/Temp/tabel_kategori.js](Js/Temp/tabel_kategori.js) — string template for table rows.

## Auth Flow
- Login page: [Template/login.html](Template/login.html)
- Controller: [Js/controller/Login.js](Js/controller/Login.js)
  - Validates username/password then `POST /api/users/login`.
  - Saves token to cookie + localStorage; optional profile fetch for userId; redirects to dashboard.
- Logout: [Js/controller/logout.js](Js/controller/logout.js)
  - Shows confirm modal; clears auth storage; redirects to landing.
- All authenticated API calls use `authFetch()` which auto-injects `Authorization` header and handles token expiry.

## Data Flow (Typical)
1. User opens a Template page (e.g., `koleksi.html`).
2. Page loads controller scripts which attach event listeners and call initial loaders.
3. Controllers call APIs via `authFetch(BASE_URL + endpoint)`.
4. Responses are normalized and fed into table render helpers in `Js/Temp/*`.
5. UI actions (edit/hapus/detail) trigger controller functions (`window.editKoleksi`, `deleteKoleksi`).
6. Mutations (`POST/PUT/DELETE`) refresh data via `reloadKoleksiData()` or full `renderKoleksi()`.

## How To Trace
- Inspect network calls with DevTools while interacting with pages.
- Search symbols like `editKoleksi`, `renderKoleksi`, or `authFetch` across `Js/`.
- Follow DOM IDs in Template files to their usage in controllers.
- Confirm dropdown dependencies: Gudang → Rak → Tahap.

## Practice Tasks
- Add realtime validations on key fields using `attachInputValidation()`.
- Implement image preview on file selection in the add/edit form.
- Add success/error toasts via `modal.js` instead of `alert`.
- Extend filters (e.g., by kondisi or tahun) with `applyFilters()` pattern.
