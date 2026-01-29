import { BASE_URL } from "../utils/config.js";
import { authFetch } from "../utils/auth.js";
import { showAlert, showConfirm } from "../utils/modal.js";

export { renderKoleksi, attachActionListeners };

// Global variables for filtering CONFIG URL, AUTH,(FETCH AMAN), MODAL (ALERT/CONFIRM)
// 6 VARIAVEL GLOBAL: TEMPAT PENYIMPANAN DATA + FILTER STATUS (PAKAI GLOBAL SUPAYA BISA DI AKSES SEMUA FUNGSI)
let allKoleksiData = [];
let allGudangData = [];
let allKategoriData = [];
let currentFilter = 'all';
let currentCategory = 'all';
let currentSearch = '';

// KECIL -> BESAR HURUP PERTAMA NAMA KOLEKSI
const capFirst = (text = '') => {
  const trimmed = String(text).trim();
  return trimmed ? `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}` : '';
};

// ======================= ROW =======================
// BIKIN SATU BARIS TR DI TABEL BERDASARKAN DATA KOLEKSI
export function rowKoleksi(index, item) {
// Jika ada gambar: buat <img>, kalau tidak ada: buat icon placeholder
  const gambarField = item.gambar || item.foto || item.image;
  const gambarSrc = gambarField ? (gambarField.startsWith('http') ? gambarField : `${BASE_URL}${gambarField}`) : null;
  const gambar = gambarSrc 
    ? `<img src="${gambarSrc}" alt="${item.nama_benda || 'Koleksi'}" class="w-20 h-20 object-cover rounded-lg border border-primary/10 shadow-sm mx-auto">` 
    : `<div class="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center mx-auto">
         <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
         </svg>
       </div>`;

      // KOLOM AKSI DETAIL (HIJAU), EDIT (BIRU), HAPUS (MERAH)
  return `
    <tr class="hover:bg-primary/[0.02] ease-soft border-b border-gray-100">
      <td class="px-6 py-4 text-center text-sm font-medium text-gray-700">${index}</td>
      <td class="px-6 py-4 text-sm text-gray-900 font-medium">${capFirst(item.nama_benda || "-")}</td>
      <td class="px-6 py-4 text-sm text-gray-600">${item.no_reg || "-"}</td>
      <td class="px-6 py-4 text-sm text-gray-600">${item.no_inv || "-"}</td>
      <td class="px-6 py-4">${gambar}</td>
      <td class="px-6 py-4">
        <div class="flex items-center justify-center gap-2">
          <button class="detail-btn bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-semibold ease-soft shadow-sm flex items-center gap-1" data-id="${item._id}" title="Lihat Detail">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Detail
          </button>
          <button class="edit-btn bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-semibold ease-soft shadow-sm flex items-center gap-1" data-id="${item._id}" title="Edit Koleksi">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button class="hapus-btn bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-semibold ease-soft shadow-sm flex items-center gap-1" data-id="${item._id}" title="Hapus Koleksi">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Hapus
          </button>
        </div>
      </td>
    </tr>
  `;
}

// ======================= INITIAL LOAD =======================
async function loadInitialData() {
  try {
    console.log('Starting initial data load...');

    // MENAMPILKAN SEMUA DATA KOLEKSI DARI API DENGAN POPULATE UKURAN, KATEGORI, TEMPAT PENYIMPANAN 
    console.log('Loading ALL koleksi data...');
    const koleksiRes = await authFetch(`${BASE_URL}/api/koleksi?populate[]=ukuran&populate[]=kategori&populate[]=tempat_penyimpanan`);
    const koleksiData = koleksiRes.data || koleksiRes;
    allKoleksiData = Array.isArray(koleksiData) ? koleksiData : (koleksiData.data || []);
    console.log('All koleksi data loaded:', allKoleksiData.length, 'items');

    // Load gudang data (FETCH DARI API GUDANG)
    console.log('Loading gudang data...');
    const gudangRes = await authFetch(`${BASE_URL}/api/gudang`);
    const gudangData = gudangRes.data || gudangRes;
    allGudangData = Array.isArray(gudangData) ? gudangData : (gudangData.data || []);
    console.log('Gudang data loaded:', allGudangData.length, 'items');

    // Load kategori data (FETCH DARI API KATEGORI)
    console.log('Loading kategori data...');
    const kategoriRes = await authFetch(`${BASE_URL}/api/kategori`);
    const kategoriData = kategoriRes.data || kategoriRes;
    allKategoriData = Array.isArray(kategoriData) ? kategoriData : (kategoriData.data || []);
    console.log('Kategori data loaded:', allKategoriData.length, 'items');

    // Tampilkan tombol gudang di sidebar (Semua Gudang + daftar gudang)
    console.log('Populating gudang submenu...');
    populateGudangSubmenu();

    // Isi dropdown kategori filter dengan semua kategori
    console.log('Populating kategori filter (all kategori)...');
    populateKategoriOptions(allKategoriData);

    // Render tabel tabel berdasarkan filter saat ini (awalnya "Semua Gudang")
    console.log('Rendering all data initially...');
    applyFilters();

    // Setup event listener untuk tombol gudang, dropdown kategori, input cari
    console.log('Setting up filter listeners...');
    setupFilterListener();

    // Set initial active state for "Semua Gudang"
    console.log('Setting initial active state...');
    const semuaGudangBtn = document.querySelector('[data-gudang="all"]');
    if (semuaGudangBtn) {
      semuaGudangBtn.classList.remove('hover:bg-blue-100');
      semuaGudangBtn.classList.add('bg-blue-200', 'font-semibold');
      console.log('Initial active state set for "Semua Gudang"');
    }

    console.log('Initial data load completed');

  } catch (err) {
    console.error("🔥 loadInitialData error:", err);
  }
}

// ======================= POPULATE GUDANG SUBMENU SIDEBAR =======================
function populateGudangSubmenu() {
  const gudangContainer = document.querySelector('.gudang-submenu');
  // Hapus isi tapi simpan tombol "Semua Gudang" yang sudah ada
  if (!gudangContainer) {
    console.error('Gudang submenu container not found');
    return;
  }

  console.log('Populating gudang submenu with data:', allGudangData);

  // Clear existing gudang options except "Semua Gudang"
  const allButton = gudangContainer.querySelector('[data-gudang="all"]');
  gudangContainer.innerHTML = '';
  gudangContainer.appendChild(allButton);

  // Sort gudang alphabetically by name
  const sortedGudang = [...allGudangData].sort((a, b) => {
    const nameA = (a.nama_gudang || a.name || '').toLowerCase();
    const nameB = (b.nama_gudang || b.name || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });

  console.log('Sorted gudang:', sortedGudang);

//  Tambah tombol untuk setiap gudang UNTUK SIDEBAR
  sortedGudang.forEach(gudang => {
    const button = document.createElement('button');
    button.className = 'filter-gudang block w-full text-left py-1.5 px-3 rounded text-sm text-primary/70 hover:bg-primary/10 hover:text-primary ease-soft';
    button.setAttribute('data-gudang', gudang._id || gudang.id);
    button.textContent = gudang.nama_gudang || gudang.name;
    gudangContainer.appendChild(button);
    console.log('Added gudang button:', gudang.nama_gudang || gudang.name);
  });
}

// ======================= POPULATE KATEGORI OPTIONS =======================
function populateKategoriOptions(sourceKategori = []) {
  const select = document.getElementById('kategoriFilter');
  if (!select) return;

  const map = new Map();
  sourceKategori.forEach(item => {
    const id = item._id || item.id;
    const name = item.nama_kategori || item.name;
    if (id && name && !map.has(id)) {
      map.set(id, name);
    }
  });

  // Ubah Map ke array, sort abjad
  const categories = Array.from(map.entries()).sort((a, b) => a[1].toLowerCase().localeCompare(b[1].toLowerCase()));

  select.innerHTML = '';
  const optAll = document.createElement('option');
  optAll.value = 'all';
  optAll.textContent = 'Semua Kategori';
  select.appendChild(optAll);

  categories.forEach(([id, name]) => {
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = capFirst(name);
    select.appendChild(opt);
  });

  currentCategory = 'all';
  select.value = 'all';
}

// ======================= SETUP FILTER LISTENER =======================
// Tombol gudang di sidebar: Saat diklik, catat gudang ID ke currentFilter, lalu render ulang tabel.
// Dropdown kategori: Saat berubah, catat kategori ID ke currentCategory, lalu render ulang tabel.
// Input cari: Saat ketik, catat teks ke currentSearch (lowercase), lalu render ulang tabel.
// Semua listener akhirnya memanggil applyFilters() untuk render ulang.
function setupFilterListener() {
  console.log('Setting up filter listeners...');

  // Use event delegation for dynamically created buttons
  const gudangContainer = document.querySelector('.gudang-submenu');
  if (gudangContainer) {
    gudangContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('filter-gudang')) {
        const gudangId = e.target.getAttribute('data-gudang');
        console.log('Filter button clicked via delegation:', gudangId);

        // Update active state first
        console.log('Updating active states...');
        document.querySelectorAll('.filter-gudang').forEach(b => {
          b.classList.remove('bg-blue-200', 'font-semibold');
          b.classList.add('hover:bg-blue-100');
        });
        e.target.classList.remove('hover:bg-blue-100');
        e.target.classList.add('bg-blue-200', 'font-semibold');
        console.log('Active state updated for:', e.target.textContent);

        // Then filter data
        filterByGudang(gudangId);
      }
    });
    console.log('Event delegation set up on gudang container');
  } else {
    console.error('Gudang container not found for event delegation');
  }

  // Kategori filter
  const kategoriSelect = document.getElementById('kategoriFilter');
  if (kategoriSelect) {
    kategoriSelect.addEventListener('change', (e) => {
      currentCategory = e.target.value;
      applyFilters();
    });
  }

  const searchInput = document.getElementById('searchKoleksi');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.toLowerCase();
      applyFilters();
    });
  }
}

// ======================= FILTER BY GUDANG =======================
function filterByGudang(gudangId) {
  console.log('Filtering by gudang:', gudangId);
  currentFilter = gudangId;

  // Rebuild kategori options from full kategori list (complete)
  populateKategoriOptions(allKategoriData);

  // Apply category filter & render
  applyFilters();
}

// ======================= APPLY FILTERS (gudang + kategori) =======================
function getDataByGudang(gudangId) {
  if (gudangId === 'all') return allKoleksiData;
  // Filter: hanya koleksi dengan gudang_id cocok
  return allKoleksiData.filter(item => {
    const itemGudangId = item.tempat_penyimpanan?.gudang?._id || item.tempat_penyimpanan?.gudang?.id;
    return itemGudangId === gudangId;
  });
}

function applyFilters() {
  // FILTER BERDASARKAN GUDANG
  const baseData = getDataByGudang(currentFilter);

  // FILTER BERDASARKAN KATEGORI (JIKA TIDAK "ALL")
  let finalData = baseData;
  if (currentCategory !== 'all') {
    finalData = baseData.filter(item => {
      const catId = item.kategori?._id || item.kategori?.id;
      return catId === currentCategory;
    });
  }

    // Filter berdasarkan carian (cek nama, no_reg, no_inv, kategori, gudang)
  if (currentSearch.trim() !== '') {
    finalData = finalData.filter(item => {
      const term = currentSearch;
      const nama = (item.nama_benda || '').toLowerCase();
      const noReg = (item.no_reg || '').toLowerCase();
      const noInv = (item.no_inv || '').toLowerCase();
      const kat = (item.kategori?.nama_kategori || item.kategori?.name || '').toLowerCase();
      const gud = (item.tempat_penyimpanan?.gudang?.nama_gudang || '').toLowerCase();
      return nama.includes(term) || noReg.includes(term) || noInv.includes(term) || kat.includes(term) || gud.includes(term);
    });
  }
// 4. Render tabel dengan data hasil filter
  renderKoleksi(finalData);

 // 5. Sembunyikan tombol "Tambah Koleksi" jika filter bukan "Semua Gudang"
  const addBtn = document.querySelector('.add-koleksi-btn');
  if (addBtn) {
    addBtn.style.display = currentFilter === 'all' ? 'block' : 'none';
  }
}

// Reload koleksi data from server and re-apply current filters
async function reloadKoleksiData() {
  try {
    const koleksiRes = await authFetch(`${BASE_URL}/api/koleksi?populate[]=ukuran&populate[]=kategori&populate[]=tempat_penyimpanan`);
    const koleksiData = koleksiRes.data || koleksiRes;
    allKoleksiData = Array.isArray(koleksiData) ? koleksiData : (koleksiData.data || []);
    applyFilters();
  } catch (err) {
    console.error("Failed to reload koleksi data:", err);
  }
}

// ======================= RENDER =======================
function renderKoleksi(data = null) {
  const tableBody = document.getElementById("tableKoleksi");
  tableBody.innerHTML = "";

  const dataToRender = data || allKoleksiData;

  // Jika tidak ada data, tampilkan pesan
  if (!dataToRender || dataToRender.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="px-6 py-12 text-center">
          <div class="flex flex-col items-center justify-center gap-3">
            <svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p class="text-lg font-semibold text-gray-600">Tidak Ada Koleksi</p>
            <p class="text-sm text-gray-500">Tidak ada data koleksi untuk kategori atau gudang yang dipilih. Coba ubah filter atau tambahkan koleksi baru.</p>
          </div>
        </td>
      </tr>
    `;
    // Jangan setup action listeners jika tidak ada data
    return;
  }

  // Loop: untuk setiap koleksi, panggil rowKoleksi() dan tambahin HTML ke tabel
  dataToRender.forEach((item, i) => {
    tableBody.innerHTML += rowKoleksi(i + 1, item);
  });

   // Setup tombol detail/edit/hapus di baris-baris baru
  attachActionListeners();
}

// ======================= ACTION LISTENERS =======================
function attachActionListeners() {
  // Untuk setiap tombol "Detail", setup listener click
  document.querySelectorAll('.detail-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      detailKoleksi(id);
    });
  });
// Untuk setiap tombol "Edit", setup listener click → panggil window.editKoleksi(id)
  // (fungsi ini dari add-collection.js, dia yang isi form dan buka modal)
  
  // Untuk setiap tombol "Hapus", setup listener click → tanya konfirmasi, lalu DELETE

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      editKoleksi(id);
    });
  });

  document.querySelectorAll('.hapus-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      deleteKoleksi(id);
    });
  });
}

function detailKoleksi(id) {
  // Ambil data koleksi berdasarkan ID dengan populate
  authFetch(`${BASE_URL}/api/koleksi?populate=ukuran,kategori,tempat_penyimpanan`)
    .then(allData => {
      const data = Array.isArray(allData) ? allData.find(item => item._id === id) : (allData.data ? allData.data.find(item => item._id === id) : null);

      if (!data) {
        showAlert("Data koleksi tidak ditemukan", "error");
        return;
      }

      const item = data;

      // Isi modal dengan data
      document.getElementById('detail_nama_benda').textContent = item.nama_benda || '-';
      document.getElementById('detail_kategori').textContent = item.kategori?.nama_kategori || '-';
      document.getElementById('detail_no_reg').textContent = item.no_reg || '-';
      document.getElementById('detail_no_inv').textContent = item.no_inv || '-';
      document.getElementById('detail_bahan').textContent = item.bahan || '-';
      document.getElementById('detail_kondisi').textContent = item.kondisi || '-';
      document.getElementById('detail_asal_koleksi').textContent = item.asal_koleksi || '-';
      document.getElementById('detail_deskripsi').textContent = item.deskripsi || '-';

      // Tanggal perolehan
      let tanggal = "-";
      if (item.tanggal_perolehan) {
        try {
          const date = new Date(item.tanggal_perolehan);
          if (!isNaN(date.getTime())) {
            tanggal = date.toLocaleDateString("id-ID");
          } else {
            tanggal = item.tanggal_perolehan; // tampilkan as is jika tidak valid
          }
        } catch (e) {
          tanggal = item.tanggal_perolehan; // tampilkan as is jika error
        }
      }
      document.getElementById('detail_tanggal_perolehan').textContent = tanggal;

      // Tempat penyimpanan
      let tempatPenyimpanan = "-";
      if (item.tempat_penyimpanan) {
        const lokasi = `${item.tempat_penyimpanan.gudang?.nama_gudang || "-"} / ${item.tempat_penyimpanan.rak?.nama_rak || "-"} / ${item.tempat_penyimpanan.tahap?.nama_tahap || "-"}`;
        const catatan = item.tempat_penyimpanan.catatan ? ` - ${item.tempat_penyimpanan.catatan}` : "";
        tempatPenyimpanan = lokasi + catatan;
      }
      document.getElementById('detail_tempat_penyimpanan').textContent = tempatPenyimpanan;

      // Ukuran detail (use dynamic units with robust fallbacks)
      const u = item.ukuran || {};
      const satuan = u.satuan || u.satuan_ukuran || item.satuan || item.satuan_ukuran || "cm";
      const satuanBerat = u.satuan_berat || u.satuanBerat || item.satuan_berat || item.satuanBerat || "kg";
      const fmt = (val, unit) => val !== undefined && val !== null && val !== "" ? `${val} ${unit}` : "-";

      document.getElementById('detail_panjang').textContent = fmt(u.panjang_keseluruhan, satuan);
      document.getElementById('detail_lebar').textContent = fmt(u.lebar, satuan);
      document.getElementById('detail_tebal').textContent = fmt(u.tebal, satuan);
      document.getElementById('detail_tinggi').textContent = fmt(u.tinggi ?? item.tinggi, satuan);
      document.getElementById('detail_diameter').textContent = fmt(u.diameter, satuan);
      document.getElementById('detail_berat').textContent = fmt(u.berat ?? item.berat, satuanBerat);

      // Gambar
      const imgElement = document.getElementById('detail_gambar');
      const noImageElement = document.getElementById('no_image');
      const gambarField = item.gambar || item.foto || item.image;
      if (gambarField) {
        // Jika gambar adalah URL relatif, tambahkan BASE_URL
        const gambarUrl = gambarField.startsWith('http') ? gambarField : `${BASE_URL}${gambarField}`;
        imgElement.src = gambarUrl;
        imgElement.style.display = 'block';
        noImageElement.style.display = 'none';
      } else {
        imgElement.style.display = 'none';
        noImageElement.style.display = 'inline';
      }

      // Tampilkan modal
      document.getElementById('detailModal').classList.remove('hidden');
    })
    .catch(err => {
      console.error("Error fetching detail:", err);
      showAlert("Gagal mengambil data detail", "error");
    });
}

function editKoleksi(id) {
  if (window.editKoleksi) {
    window.editKoleksi(id);
  } else {
    showAlert("Fitur edit belum tersedia", "info");
  }
}

async function deleteKoleksi(id) {
  const confirmed = await showConfirm("Apakah Anda yakin ingin menghapus koleksi ini?");
  if (!confirmed) return;

  try {
    await authFetch(`${BASE_URL}/api/koleksi/${id}`, { method: "DELETE" });
    showAlert("Koleksi berhasil dihapus", "success");

    // Remove from allKoleksiData and re-filter
    allKoleksiData = allKoleksiData.filter(item => item._id !== id);
    setTimeout(() => filterByGudang(currentFilter), 1500);
  } catch {
    showAlert("Gagal menghapus koleksi", "error");
  }
}

// ======================= TOGGLE KOLEKSI SUBMENU =======================
// Removed - submenu now always visible

document.addEventListener("DOMContentLoaded", () => {
  loadInitialData();
});

// Expose minimal public API for other modules
window.reloadKoleksiData = reloadKoleksiData;
window.renderKoleksi = renderKoleksi;
