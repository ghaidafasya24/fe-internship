import { BASE_URL } from "../utils/config.js";
import { authFetch } from "../utils/auth.js";

export { renderKoleksi, attachActionListeners };

// Global variables for filtering
let allKoleksiData = [];
let allGudangData = [];
let allKategoriData = [];
let currentFilter = 'all';
let currentCategory = 'all';
let currentSearch = '';

// ======================= ROW =======================
export function rowKoleksi(index, item) {
  const gambarField = item.gambar || item.foto || item.image;
  const gambarSrc = gambarField ? (gambarField.startsWith('http') ? gambarField : `${BASE_URL}${gambarField}`) : null;
  const gambar = gambarSrc ? `<img src="${gambarSrc}" alt="Gambar Koleksi" class="w-16 h-16 object-cover">` : "-";

  return `
    <tr class="hover:bg-gray-100">
      <td class="px-4 py-2 border-b">${index}</td>
      <td class="px-4 py-2 border-b">${item.nama_benda || "-"}</td>
      <td class="px-4 py-2 border-b">${item.no_reg || "-"}</td>
      <td class="px-4 py-2 border-b">${item.no_inv || "-"}</td>
      <td class="px-4 py-2 border-b">${gambar}</td>
      <td class="px-4 py-2 border-b text-center">
        <button class="detail-btn bg-green-500 text-white px-3 py-1 rounded mr-2" data-id="${item._id}">
          Detail
        </button>
        <button class="edit-btn bg-blue-500 text-white px-3 py-1 rounded mr-2" data-id="${item._id}">
          Edit
        </button>
        <button class="hapus-btn bg-red-500 text-white px-3 py-1 rounded" data-id="${item._id}">
          Hapus
        </button>
      </td>
    </tr>
  `;
}

// ======================= INITIAL LOAD =======================
async function loadInitialData() {
  try {
    console.log('Starting initial data load...');

    // Load ALL koleksi data first (without filter)
    console.log('Loading ALL koleksi data...');
    const koleksiRes = await authFetch(`${BASE_URL}/api/koleksi?populate[]=ukuran&populate[]=kategori&populate[]=tempat_penyimpanan`);
    const koleksiData = koleksiRes.data || koleksiRes;
    allKoleksiData = Array.isArray(koleksiData) ? koleksiData : (koleksiData.data || []);
    console.log('All koleksi data loaded:', allKoleksiData.length, 'items');

    // Load gudang data
    console.log('Loading gudang data...');
    const gudangRes = await authFetch(`${BASE_URL}/api/gudang`);
    const gudangData = gudangRes.data || gudangRes;
    allGudangData = Array.isArray(gudangData) ? gudangData : (gudangData.data || []);
    console.log('Gudang data loaded:', allGudangData.length, 'items');

    // Load kategori data
    console.log('Loading kategori data...');
    const kategoriRes = await authFetch(`${BASE_URL}/api/kategori`);
    const kategoriData = kategoriRes.data || kategoriRes;
    allKategoriData = Array.isArray(kategoriData) ? kategoriData : (kategoriData.data || []);
    console.log('Kategori data loaded:', allKategoriData.length, 'items');

    // Populate gudang submenu
    console.log('Populating gudang submenu...');
    populateGudangSubmenu();

    // Populate kategori filter based on all data
    console.log('Populating kategori filter (all kategori)...');
    populateKategoriOptions(allKategoriData);

    // Render initial data with current filters
    console.log('Rendering all data initially...');
    applyFilters();

    // Setup filter listener (after buttons are created)
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

// ======================= POPULATE GUDANG SUBMENU =======================
function populateGudangSubmenu() {
  const gudangContainer = document.querySelector('.gudang-submenu');
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

  // Add gudang options
  sortedGudang.forEach(gudang => {
    const button = document.createElement('button');
    button.className = 'filter-gudang block w-full text-left py-1 px-2 rounded text-sm hover:bg-blue-100';
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

  const categories = Array.from(map.entries()).sort((a, b) => a[1].toLowerCase().localeCompare(b[1].toLowerCase()));

  select.innerHTML = '';
  const optAll = document.createElement('option');
  optAll.value = 'all';
  optAll.textContent = 'Semua Kategori';
  select.appendChild(optAll);

  categories.forEach(([id, name]) => {
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = name;
    select.appendChild(opt);
  });

  currentCategory = 'all';
  select.value = 'all';
}

// ======================= SETUP FILTER LISTENER =======================
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
  return allKoleksiData.filter(item => {
    const itemGudangId = item.tempat_penyimpanan?.gudang?._id || item.tempat_penyimpanan?.gudang?.id;
    return itemGudangId === gudangId;
  });
}

function applyFilters() {
  const baseData = getDataByGudang(currentFilter);

  let finalData = baseData;
  if (currentCategory !== 'all') {
    finalData = baseData.filter(item => {
      const catId = item.kategori?._id || item.kategori?.id;
      return catId === currentCategory;
    });
  }

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

  renderKoleksi(finalData);

  // Show/hide tambah koleksi button
  const addBtn = document.querySelector('.add-koleksi-btn');
  if (addBtn) {
    addBtn.style.display = currentFilter === 'all' ? 'block' : 'none';
  }
}

// ======================= RENDER =======================
function renderKoleksi(data = null) {
  const tableBody = document.getElementById("tableKoleksi");
  tableBody.innerHTML = "";

  const dataToRender = data || allKoleksiData;

  // Render
  dataToRender.forEach((item, i) => {
    tableBody.innerHTML += rowKoleksi(i + 1, item);
  });

  // Attach listeners
  attachActionListeners();
}

// ======================= ACTION LISTENERS =======================
function attachActionListeners() {
  document.querySelectorAll('.detail-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      detailKoleksi(id);
    });
  });

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      editKoleksi(id);
    });
  });

  document.querySelectorAll('.hapus-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
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
        alert("Data koleksi tidak ditemukan");
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
      const tempatPenyimpanan = item.tempat_penyimpanan
        ? `${item.tempat_penyimpanan.gudang?.nama_gudang || "-"} / ${item.tempat_penyimpanan.rak?.nama_rak || "-"} / ${item.tempat_penyimpanan.tahap?.nama_tahap || "-"}`
        : "-";
      document.getElementById('detail_tempat_penyimpanan').textContent = tempatPenyimpanan;

      // Ukuran - jika ada di item langsung
      if (item.ukuran) {
        const u = item.ukuran;
        const ukuranStr = `${u.panjang_keseluruhan ?? "-"} x ${u.lebar ?? "-"} x ${u.tinggi ?? "-"} ${u.satuan ?? "cm"}`;
        document.getElementById('detail_ukuran').textContent = ukuranStr;
      } else {
        document.getElementById('detail_ukuran').textContent = '-';
      }

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
      alert("Gagal mengambil data detail");
    });
}

function editKoleksi(id) {
  if (window.editKoleksi) {
    window.editKoleksi(id);
  } else {
    alert("Fitur edit belum tersedia");
  }
}

async function deleteKoleksi(id) {
  if (!confirm("Apakah Anda yakin ingin menghapus koleksi ini?")) return;

  try {
    await authFetch(`${BASE_URL}/api/koleksi/${id}`, { method: "DELETE" });
    alert("Koleksi berhasil dihapus");

    // Remove from allKoleksiData and re-filter
    allKoleksiData = allKoleksiData.filter(item => item._id !== id);
    filterByGudang(currentFilter);
  } catch {
    alert("Gagal menghapus koleksi");
  }
}

// ======================= TOGGLE KOLEKSI SUBMENU =======================
// Removed - submenu now always visible

document.addEventListener("DOMContentLoaded", () => {
  loadInitialData();
});
