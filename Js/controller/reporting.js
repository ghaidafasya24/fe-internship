// Advanced Reporting - Laporan Terpilih, Per Gudang, Nilai Aset, dan Export
import { BASE_URL } from "../utils/config.js";
import { authFetch } from "../utils/auth.js";
import { showAlert } from "../utils/modal.js";
import { escapeHTML } from "../utils/validation.js";
import { API_KOLEKSI } from "../config/url_koleksi.js";

// ============================================
// 1. FETCH DAN FILTER DATA
// ============================================
async function fetchKoleksiWithFilters(filters = {}) {
  try {
    const res = await authFetch(`${API_KOLEKSI.GET_KOLEKSI}?populate=kategori,gudang,ukuran`);
    let koleksi = res?.data ?? res; // authFetch sudah parse JSON
    let items = Array.isArray(koleksi) ? koleksi : (koleksi?.data ?? []);

    // Normalisasi field supaya seragam (backend beberapa versi)
    const normalized = items.map(item => {
      // Untuk filter tanggal, prioritaskan insertion date (createdAt)
      const insertDate = item.createdAt || item.created_at || item.insertedAt || item.inserted_at || null;
      const tgl = insertDate || item.tanggal_perolehan || item.tanggal_akuisisi || item.tanggalPerolehan || item.tanggal || null;
      const gudang = item.tempat_penyimpanan?.gudang?.nama_gudang
        || item.tempat_penyimpanan?.gudang?.NamaGudang
        || item.gudang?.nama
        || item.gudang?.nama_gudang
        || item.gudang?.NamaGudang
        || item.gudang?.namaGudang
        || item.gudang
        || item.gudang_id
        || "Unknown";
      const kategori = item.kategori?.nama_kategori || item.kategori?.nama || item.kategori || item.kategori_id || "";
      const kondisi = item.kondisi || item.kondisi_fisik || "";
      return {
        ...item,
        _tanggal: tgl,
        _gudang: gudang,
        _kategori: kategori,
        _kondisi: kondisi,
      };
    });

    items = normalized;

    // Filter berdasarkan parameter
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      start.setHours(0, 0, 0, 0);
      items = items.filter(item => {
        const itemDate = item._tanggal ? new Date(item._tanggal) : null;
        if (!itemDate) return false;
        itemDate.setHours(0, 0, 0, 0);
        return itemDate >= start;
      });
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      items = items.filter(item => {
        const itemDate = item._tanggal ? new Date(item._tanggal) : null;
        if (!itemDate) return false;
        const itemDateNorm = new Date(itemDate);
        itemDateNorm.setHours(0, 0, 0, 0);
        return itemDateNorm <= end;
      });
    }

    if (filters.gudang) {
      items = items.filter(item => item._gudang === filters.gudang);
    }

    if (filters.kategori) {
      items = items.filter(item => item._kategori === filters.kategori);
    }

    if (filters.kondisi) {
      items = items.filter(item => item._kondisi === filters.kondisi);
    }

    return items;
  } catch (err) {
    console.error("❌ Error fetching filtered data:", err);
    if (err instanceof SyntaxError && err.message.includes('JSON')) {
      console.error("⚠️ Server return HTML bukan JSON. Cek endpoint URL atau koneksi server.");
      showAlert("Gagal fetch data: Endpoint tidak valid atau server error. Coba refresh halaman.", "error");
    } else if (err.message.includes('Network error')) {
      showAlert("Gagal fetch data: Masalah jaringan. Periksa koneksi internet.", "error");
    } else {
      showAlert("Gagal fetch data: " + err.message, "error");
    }
    return [];
  }
}

// Formatter tanggal perolehan dengan fallback aman
function formatTanggalPerolehan(item) {
  const raw = item.tanggal_perolehan || item.tanggal_akuisisi || item.tanggal || item.createdAt || item.created_at || item.insertedAt || item.inserted_at;
  if (!raw) return "-";
  try {
    return new Date(raw).toLocaleDateString('id-ID');
  } catch (e) {
    return "-";
  }
}

// Formatter ukuran ringkas
function formatUkuran(item) {
  const ukuran = item.ukuran || {};
  const parts = [];
  if (ukuran.panjang_keseluruhan || ukuran.panjang) parts.push(`P:${ukuran.panjang_keseluruhan || ukuran.panjang}`);
  if (ukuran.lebar) parts.push(`L:${ukuran.lebar}`);
  if (ukuran.tinggi || item.tinggi) parts.push(`T:${ukuran.tinggi || item.tinggi}`);
  if (ukuran.diameter) parts.push(`D:${ukuran.diameter}`);
  if (ukuran.berat || item.berat) parts.push(`Br:${ukuran.berat || item.berat}`);
  const satuan = ukuran.satuan || item.satuan || 'cm';
  if (!parts.length) return "-";
  return `${parts.join(' | ')} (${satuan})`;
}

// Ambil URL gambar utama jika ada
function getPrimaryImageUrl(item) {
  const kandidat = item.gambar || item.foto || item.foto_utama || item.images || item.image;
  const pick = Array.isArray(kandidat) ? kandidat[0] : kandidat;
  const url = typeof pick === 'string' ? pick : pick?.url;
  return url || null;
}

// Fetch gambar dan ubah ke dataURL agar bisa di-embed ke PDF
async function fetchImageAsDataUrl(url) {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn("Gagal load gambar untuk PDF:", err);
    return null;
  }
}

// Pastikan jsPDF siap pakai (autoTable akan dicek dari instance doc)
async function ensureJsPdfReady() {
  // Tunggu hingga window.jspdf.jsPDF ready (max 10 detik)
  let retries = 0;
  const maxRetries = 50; // 50 x 200ms = 10 seconds
  
  while (retries < maxRetries) {
    if (window.jspdf?.jsPDF) {
      console.log('✅ jsPDF library ready!');
      return window.jspdf;
    }
    
    if (retries === 0) {
      console.log('⏳ Waiting for jsPDF library to load...');
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
    retries++;
  }

  // Jika masih gagal setelah timeout
  console.error('❌ jsPDF library not found after', maxRetries, 'retries');
  console.error('window.jspdf:', window.jspdf);
  throw new Error('Library jsPDF tidak ditemukan. Pastikan koneksi internet aktif dan refresh halaman.');
}

// ============================================
// 2. LOAD DAN RENDER DATA LENGKAP (TAB UTAMA)
// ============================================
export async function loadLaporan() {
  const tbody = document.getElementById("laporanBody");
  if (!tbody) return;
  
  tbody.innerHTML = '<tr><td colspan="21" class="text-center py-4 text-gray-500">Loading...</td></tr>';

  try {
    const items = await fetchKoleksiWithFilters();
    
    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="21" class="text-center py-12">
        <div class="flex flex-col items-center justify-center gap-3">
          <svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p class="text-lg font-semibold text-gray-600">Tidak Ada Data Koleksi</p>
          <p class="text-sm text-gray-500">Belum ada koleksi yang terdaftar di sistem.</p>
        </div>
      </td></tr>`;
      return;
    }

    tbody.innerHTML = items.map((item, idx) => {
      const kategori = item._kategori || "N/A";
      const gudang = item._gudang || "N/A";
      const kondisi = item._kondisi || "N/A";
      const tanggal = item._tanggal ? new Date(item._tanggal).toLocaleDateString('id-ID') : "-";
      const asalKoleksi = item.asal_koleksi || item.asalKoleksi || "-";
      const bahan = item.bahan || "-";
      const deskripsi = item.deskripsi || item.keterangan || "-";
      
      // Ukuran
      const ukuran = item.ukuran || {};
      const panjang = ukuran.panjang || item.panjang || "-";
      const lebar = ukuran.lebar || item.lebar || "-";
      const tebal = ukuran.tebal || item.tebal || "-";
      const tinggi = ukuran.tinggi || item.tinggi || "-";
      const diameter = ukuran.diameter || item.diameter || "-";
      const berat = ukuran.berat || item.berat || "-";
      const satuan = ukuran.satuan || item.satuan || "-";
      
      const rak = item.tempat_penyimpanan?.rak || item.rak || "-";
      const tahap = item.tahap_registrasi || item.tahap || "-";
      
      // Gambar
      const gambarUrl = item.gambar || item.foto || item.foto_utama || (Array.isArray(item.images) && item.images[0]);
      const gambarHTML = gambarUrl 
        ? `<img src="${escapeHTML(gambarUrl)}" alt="Gambar" class="w-12 h-12 object-cover rounded border" onerror="this.parentElement.innerHTML='❌'">`
        : '-';

      return `
        <tr class="hover:bg-gray-50 border-b">
          <td class="px-6 py-3 text-sm text-gray-700 text-center">${idx + 1}</td>
          <td class="px-6 py-3 text-sm font-medium text-gray-900">${escapeHTML(item.nama_benda || "N/A")}</td>
          <td class="px-6 py-3 text-sm text-gray-700">${escapeHTML(item.no_regis || item.no_registrasi || "-")}</td>
          <td class="px-6 py-3 text-sm text-gray-700">${escapeHTML(item.no_inv || item.no_inventaris || "-")}</td>
          <td class="px-6 py-3 text-sm text-gray-700">${escapeHTML(kategori)}</td>
          <td class="px-6 py-3 text-sm text-gray-700">${escapeHTML(asalKoleksi)}</td>
          <td class="px-6 py-3 text-sm text-gray-700">${escapeHTML(bahan)}</td>
          <td class="px-6 py-3 text-sm text-gray-700">${escapeHTML(kondisi)}</td>
          <td class="px-6 py-3 text-sm text-gray-700">${tanggal}</td>
          <td class="px-6 py-3 text-sm text-gray-700">${escapeHTML(deskripsi)}</td>
          <td class="px-6 py-3 text-sm text-gray-700">${gambarHTML}</td>
          <td class="px-6 py-3 text-sm text-gray-700">${panjang}</td>
          <td class="px-6 py-3 text-sm text-gray-700">${lebar}</td>
          <td class="px-6 py-3 text-sm text-gray-700">${tebal}</td>
          <td class="px-6 py-3 text-sm text-gray-700">${tinggi}</td>
          <td class="px-6 py-3 text-sm text-gray-700">${diameter}</td>
          <td class="px-6 py-3 text-sm text-gray-700">${berat}</td>
          <td class="px-6 py-3 text-sm text-gray-700">${satuan}</td>
          <td class="px-6 py-3 text-sm text-gray-700">${escapeHTML(gudang)}</td>
          <td class="px-6 py-3 text-sm text-gray-700">${escapeHTML(rak)}</td>
          <td class="px-6 py-3 text-sm text-gray-700">${escapeHTML(tahap)}</td>
        </tr>
      `;
    }).join('');

  } catch (err) {
    console.error("Gagal memuat koleksi:", err);
    tbody.innerHTML = '<tr><td colspan="21" class="text-center py-4 text-red-500">Error loading data</td></tr>';
    showAlert("Gagal memuat data koleksi", "error");
  }
}

// ============================================
// 3. LOAD DAN RENDER LAPORAN PER GUDANG
// ============================================
export async function loadReportPerGudang() {
  const tableBody = document.getElementById("tableReportPerGudang");
  if (!tableBody) return;

  tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">Loading...</td></tr>';

  try {
    const items = await fetchKoleksiWithFilters();

    // Group by gudang (gunakan _gudang yang sudah dinormalisasi)
    const groupedByGudang = {};
    items.forEach(item => {
      const gudang = item._gudang || "Unknown";
      if (!groupedByGudang[gudang]) {
        groupedByGudang[gudang] = [];
      }
      groupedByGudang[gudang].push(item);
    });

    tableBody.innerHTML = '';
    let rowNum = 1;

    Object.entries(groupedByGudang).forEach(([gudang, gudangItems]) => {
      let totalRusak = 0;
      let totalPerlu = 0;

      gudangItems.forEach(item => {
        const kondisi = (item._kondisi || item.kondisi || "").toLowerCase();
        if (kondisi === "rusak") totalRusak++;
        if (kondisi === "perlu perbaikan") totalPerlu++;
      });

      const row = document.createElement("tr");
      row.className = "border-b hover:bg-gray-50";
      const gudangName = escapeHTML(gudang);
      row.innerHTML = `
        <td class="px-4 py-3 text-sm font-medium text-gray-900">${rowNum}</td>
        <td class="px-4 py-3 text-sm font-semibold text-primary">${gudangName}</td>
        <td class="px-4 py-3 text-sm text-gray-700">${gudangItems.length}</td>
        <td class="px-4 py-3 text-sm">
          <span class="text-red-600 font-semibold mr-2">${totalRusak} Rusak</span>
          <span class="text-yellow-600 font-semibold">${totalPerlu} Perlu Perbaikan</span>
        </td>
        <td class="px-4 py-3 text-sm flex gap-2">
          <button onclick="window.detailReportGudang('${gudangName}')" class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs font-semibold">
            Detail
          </button>
          <button onclick="window.exportGudangToExcel('${gudangName}')" class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs font-semibold">
            Excel
          </button>
          <button onclick="window.exportGudangToPDF('${gudangName}')" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs font-semibold">
            PDF
          </button>
        </td>
      `;
      tableBody.appendChild(row);
      rowNum++;
    });

  } catch (err) {
    console.error("Error loading report per gudang:", err);
    tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-red-500">Error loading data</td></tr>';
  }
}

// ============================================
// 3. DETAIL REPORT GUDANG
// ============================================
export async function detailReportGudang(gudangName) {
  try {
    const items = await fetchKoleksiWithFilters({ gudang: gudangName });

    let html = `
      <div class="text-left space-y-4 max-h-96 overflow-y-auto">
        <div class="mb-4">
          <h3 class="text-lg font-bold text-gray-900 mb-2">Detail Koleksi - ${escapeHTML(gudangName)}</h3>
          <p class="text-sm text-gray-600">Informasi lengkap semua item dalam gudang ini</p>
        </div>
        <table class="w-full text-sm border-collapse">
          <thead class="bg-primary/5 sticky top-0">
            <tr>
              <th class="text-left px-3 py-2 font-semibold text-primary border text-xs">No</th>
              <th class="text-left px-3 py-2 font-semibold text-primary border text-xs">No. Reg</th>
              <th class="text-left px-3 py-2 font-semibold text-primary border text-xs">Nama Benda</th>
              <th class="text-left px-3 py-2 font-semibold text-primary border text-xs">Kategori</th>
              <th class="text-left px-3 py-2 font-semibold text-primary border text-xs">Bahan</th>
              <th class="text-left px-3 py-2 font-semibold text-primary border text-xs">Kondisi</th>
              <th class="text-left px-3 py-2 font-semibold text-primary border text-xs">Rak</th>
              <th class="text-left px-3 py-2 font-semibold text-primary border text-xs">Tahap</th>
            </tr>
          </thead>
          <tbody>
    `;

    items.forEach((item, idx) => {
      const kategori = item._kategori || item.kategori?.nama_kategori || "-";
      const kondisi = item._kondisi || item.kondisi || "-";
      const rak = item.tempat_penyimpanan?.rak?.nama_rak || "-";
      const tahap = item.tempat_penyimpanan?.tahap?.nama_tahap || "-";
      const bahan = item.bahan || "-";
      const noReg = item.no_reg || "-";

      html += `
        <tr class="border-b hover:bg-gray-50">
          <td class="px-3 py-2 text-gray-700 border text-xs font-semibold">${idx + 1}</td>
          <td class="px-3 py-2 text-gray-700 border text-xs">${escapeHTML(noReg)}</td>
          <td class="px-3 py-2 text-gray-800 font-medium border text-xs">${escapeHTML(item.nama_benda || "-")}</td>
          <td class="px-3 py-2 text-gray-700 border text-xs">${escapeHTML(kategori)}</td>
          <td class="px-3 py-2 text-gray-700 border text-xs">${escapeHTML(bahan)}</td>
          <td class="px-3 py-2 border text-xs">
            <span class="px-2 py-1 rounded text-xs font-semibold ${
              kondisi === "baik" ? "bg-green-100 text-green-800" :
              kondisi === "rusak" ? "bg-red-100 text-red-800" :
              kondisi === "perlu perbaikan" ? "bg-yellow-100 text-yellow-800" :
              "bg-gray-100 text-gray-800"
            }">
              ${escapeHTML(kondisi)}
            </span>
          </td>
          <td class="px-3 py-2 text-gray-700 border text-xs">${escapeHTML(rak)}</td>
          <td class="px-3 py-2 text-gray-700 border text-xs">${escapeHTML(tahap)}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
        <div class="border-t pt-3 mt-4 bg-primary/5 p-3 rounded">
          <p class="text-gray-700 font-semibold">Total Item: <span class="text-primary">${items.length}</span></p>
        </div>
      </div>
    `;

    // Show alert dengan close button
    showAlert("Info", `Detail Gudang: ${gudangName}\nTotal Item: ${items.length}\n\nGunakan tombol Export Excel di tab untuk export data gudang ini.`, "info");

  } catch (err) {
    console.error("Error loading detail report:", err);
    showAlert("Error", "Gagal memuat detail laporan", "error");
  }
}

// ============================================
// 4. LAPORAN NILAI ASET
// ============================================
export async function loadReportNilaiAset() {
  const tableBody = document.getElementById("tableReportNilaiAset");
  if (!tableBody) return;

  tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">Loading...</td></tr>';

  try {
    const items = await fetchKoleksiWithFilters();

    const formatter = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    });

    // Sort by nilai_aset desc
    const sorted = items.sort((a, b) => (parseFloat(b.nilai_aset) || 0) - (parseFloat(a.nilai_aset) || 0));

    tableBody.innerHTML = '';

    sorted.slice(0, 30).forEach((item, index) => {
      const nilai = parseFloat(item.nilai_aset) || 0;
      const kategori = item.kategori?.nama || "N/A";

      const row = document.createElement("tr");
      row.className = "border-b hover:bg-gray-50";
      row.innerHTML = `
        <td class="px-4 py-3 text-sm font-medium text-gray-900">${index + 1}</td>
        <td class="px-4 py-3 text-sm font-semibold text-gray-900">${escapeHTML(item.nama_koleksi || "")}</td>
        <td class="px-4 py-3 text-sm text-gray-700">${escapeHTML(kategori)}</td>
        <td class="px-4 py-3 text-sm text-gray-700">${escapeHTML(item.no_inv || "-")}</td>
        <td class="px-4 py-3 text-sm text-right font-bold text-primary">${formatter.format(nilai)}</td>
      `;
      tableBody.appendChild(row);
    });

    // Total row dihapus sesuai permintaan (hapus total nilai aset)

  } catch (err) {
    console.error("Error loading nilai aset report:", err);
    tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-red-500">Error loading data</td></tr>';
  }
}

// ============================================
// 5. LAPORAN DENGAN FILTER TANGGAL
// ============================================
export async function loadReportByDateRange() {
  const filterBtn = document.getElementById("btnApplyDateFilter");
  if (!filterBtn) return;

  filterBtn.addEventListener("click", async () => {
    const startDate = document.getElementById("filterStartDate")?.value;
    const endDate = document.getElementById("filterEndDate")?.value;

    if (!startDate || !endDate) {
      showAlert("Warning", "Pilih tanggal awal dan akhir terlebih dahulu", "warning");
      return;
    }

    const tableBody = document.getElementById("tableReportByDate");
    const tableSection = document.getElementById("dateTableSection");
    if (!tableBody) return;

    // Show table section
    if (tableSection) tableSection.classList.remove("hidden");

    tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">Loading...</td></tr>';

    try {
      const items = await fetchKoleksiWithFilters({ startDate, endDate });

      tableBody.innerHTML = '';

      if (items.length === 0) {
        const formattedStart = new Date(startDate).toLocaleDateString('id-ID');
        const formattedEnd = new Date(endDate).toLocaleDateString('id-ID');
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-12">
          <div class="flex flex-col items-center justify-center gap-3">
            <svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="text-lg font-semibold text-gray-600">Tidak Ada Data dalam Periode Ini</p>
            <p class="text-sm text-gray-500">${formattedStart} - ${formattedEnd}</p>
          </div>
        </td></tr>`;
        return;
      }

      items.forEach((item, index) => {
        // Gunakan insertion date (createdAt) untuk konsistensi dengan filter
        const insertDate = item.createdAt || item.created_at || item.insertedAt || item.inserted_at || item.tanggal_perolehan || item.tanggal_akuisisi;
        const tanggal = insertDate ? new Date(insertDate).toLocaleDateString("id-ID") : "N/A";
        const kategori = item.kategori?.nama || item._kategori || "N/A";
        const kondisi = item._kondisi || item.kondisi || "N/A";

        const row = document.createElement("tr");
        row.className = "border-b hover:bg-gray-50";
        row.innerHTML = `
          <td class="px-4 py-3 text-sm font-medium text-gray-900">${index + 1}</td>
          <td class="px-4 py-3 text-sm">${tanggal}</td>
          <td class="px-4 py-3 text-sm font-semibold text-gray-900">${escapeHTML(item.nama_benda || item.nama_koleksi || "")}</td>
          <td class="px-4 py-3 text-sm text-gray-700">${escapeHTML(kategori)}</td>
          <td class="px-4 py-3 text-sm text-gray-700">${kondisi}</td>
        `;
        tableBody.appendChild(row);
      });

      // Total row dihapus sesuai permintaan (hapus total nilai aset)

    } catch (err) {
      console.error("Error loading date range report:", err);
      tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-red-500">Error loading data</td></tr>';
    }
  });
}

// ============================================
// 4.5 LOAD REPORT BY MONTH (FILTER PER BULAN - BERDASARKAN INSERTION DATE)
// ============================================
export async function loadReportByMonth(month, year) {
  const tableBody = document.getElementById("tableReportByMonth");
  const tableSection = document.getElementById("monthTableSection");
  if (!tableBody) return;

  // Show table section
  if (tableSection) tableSection.classList.remove("hidden");

  tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">Loading...</td></tr>';

  const monthNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                     'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  
  console.log(`Loading report for ${monthNames[parseInt(month)]} ${year} (insertion date)`);

  try {
    // Fetch semua data tanpa filter
    const allItems = await fetchKoleksiWithFilters();
    
    // Filter by insertion date (createdAt/created_at)
    const filteredItems = allItems.filter(item => {
      const insertDate = item.createdAt || item.created_at || item.insertedAt || item.inserted_at;
      if (!insertDate) return false;
      
      const date = new Date(insertDate);
      const itemYear = date.getFullYear();
      const itemMonth = String(date.getMonth() + 1).padStart(2, '0');
      
      return itemYear === parseInt(year) && itemMonth === month;
    });

    console.log(`Found ${filteredItems.length} items for ${monthNames[parseInt(month)]} ${year}`);

    if (filteredItems.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-12">
        <div class="flex flex-col items-center justify-center gap-3">
          <svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-lg font-semibold text-gray-600">Tidak Ada Data Periode Ini</p>
          <p class="text-sm text-gray-500">Tidak ada koleksi untuk ${monthNames[parseInt(month)]} ${year}</p>
        </div>
      </td></tr>`;
      return;
    }

    tableBody.innerHTML = '';
    filteredItems.forEach((item, idx) => {
      // Gunakan insertion date untuk tampilan
      const insertDate = item.createdAt || item.created_at || item.insertedAt || item.inserted_at;
      const tanggal = insertDate ? new Date(insertDate).toLocaleDateString('id-ID') : "-";
      const kategori = item._kategori || item.kategori?.nama_kategori || "N/A";

      const row = document.createElement("tr");
      row.className = "border-b hover:bg-gray-50";
      row.innerHTML = `
        <td class="px-4 py-3 text-sm text-gray-700">${idx + 1}</td>
        <td class="px-4 py-3 text-sm text-gray-700">${tanggal}</td>
        <td class="px-4 py-3 text-sm font-medium text-gray-900">${escapeHTML(item.nama_benda || "N/A")}</td>
        <td class="px-4 py-3 text-sm text-gray-700">${escapeHTML(kategori)}</td>
        <td class="px-4 py-3 text-sm text-gray-700">${item._kondisi || item.kondisi || "N/A"}</td>
      `;
      tableBody.appendChild(row);
    });

  } catch (err) {
    console.error("Error loading month report:", err);
    tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-red-500">Error loading data</td></tr>';
  }
}

// ============================================
// ============================================
// 5. EXPORT PER GUDANG KE EXCEL
// ============================================
export async function exportGudangToExcel(gudangName) {
  try {
    const items = await fetchKoleksiWithFilters({ gudang: gudangName });

    if (items.length === 0) {
      showAlert("Info", "Tidak ada data untuk diexport", "info");
      return;
    }

    // Import XLSX dynamically
    const XLSX = window.XLSX;
    if (!XLSX) {
      showAlert("Error", "Library XLSX belum dimuat. Pastikan sudah include di HTML.", "error");
      return;
    }

    // Prepare data untuk Excel - 11 fields dengan gambar logic correct + Ukuran 1 kolom
    const excelData = items.map((item, idx) => ({
      "No": idx + 1,
      "Nama Benda": item.nama_benda || "",
      "No Reg": item.no_reg || item.no_registrasi || "",
      "No Inv": item.no_inv || item.no_inventaris || "",
      "Kategori": item._kategori || item.kategori?.nama_kategori || "",
      "Asal Koleksi": item.asal_koleksi || item.asalKoleksi || "",
      "Bahan": item.bahan || "",
      "Kondisi": item._kondisi || item.kondisi || "",
      "Tgl Perolehan": item._tanggal ? new Date(item._tanggal).toLocaleDateString('id-ID') : "-",
      "Deskripsi": item.deskripsi || item.keterangan || "",
      "Gambar": (item.gambar || item.foto || item.foto_utama || (Array.isArray(item.images) && item.images[0])) ? "Ada" : "Tidak Ada",
      "Ukuran": formatUkuran(item),
      "Rak": item.tempat_penyimpanan?.rak?.nama_rak || "-"
    }));

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Gudang ${gudangName}`);

    // Auto width columns - 12 fields
    const colWidths = [
      { wch: 5 },  // No
      { wch: 30 }, // Nama Benda
      { wch: 12 }, // No Reg
      { wch: 12 }, // No Inv
      { wch: 18 }, // Kategori
      { wch: 18 }, // Asal Koleksi
      { wch: 12 }, // Bahan
      { wch: 12 }, // Kondisi
      { wch: 15 }, // Tgl Perolehan
      { wch: 25 }, // Deskripsi
      { wch: 10 }, // Gambar
      { wch: 20 }, // Ukuran
      { wch: 15 }  // Rak
    ];
    ws['!cols'] = colWidths;

    // Download
    const filename = `Laporan_Gudang_${gudangName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);

    showAlert("Berhasil", `Data ${items.length} koleksi dari ${gudangName} berhasil diexport`, "success");
  } catch (err) {
    console.error("Error exporting to Excel:", err);
    showAlert("Error", "Gagal export ke Excel: " + err.message, "error");
  }
}

// ============================================
// 6. EXPORT PER GUDANG KE PDF
// ============================================
export async function exportGudangToPDF(gudangName) {
  try {
    // Pastikan jsPDF siap
    const pdfLib = await ensureJsPdfReady();
    const { jsPDF } = pdfLib;
    
    if (!jsPDF) {
      throw new Error("jsPDF class tidak ditemukan");
    }

    const items = await fetchKoleksiWithFilters({ gudang: gudangName });
    
    if (items.length === 0) {
      showAlert("Info", "Tidak ada data untuk diexport", "info");
      return;
    }

    const doc = new jsPDF('l', 'mm', 'a4'); // landscape
    
    // Verifikasi autoTable tersedia di instance doc
    if (typeof doc.autoTable !== 'function') {
      throw new Error("Plugin autoTable tidak ditemukan. Pastikan jspdf-autotable sudah dimuat.");
    }

    // Preload gambar
    const itemsWithImages = await Promise.all(items.map(async (item) => {
      const imgData = await fetchImageAsDataUrl(getPrimaryImageUrl(item));
      return { item, imgData };
    }));

    // Header
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(`LAPORAN KOLEKSI - GUDANG ${gudangName.toUpperCase()}`, 148, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Museum Sri Baduga`, 148, 22, { align: 'center' });
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 148, 28, { align: 'center' });
    doc.text(`Total Koleksi: ${items.length} item`, 148, 34, { align: 'center' });

    // Table data
    const tableData = itemsWithImages.map(({ item, imgData }, idx) => [
      idx + 1,                                                         // No
      item.no_reg || "-",                                              // No. Reg
      item.no_inv || "-",                                              // No. Inventaris
      item.nama_benda || "-",                                          // Nama Benda
      item._kategori || item.kategori?.nama_kategori || "-",          // Kategori
      formatTanggalPerolehan(item),                                    // Tanggal Perolehan
      formatUkuran(item),                                              // Ukuran
      item.deskripsi || item.deskripsi_singkat || item.keterangan || "-", // Deskripsi
      imgData ? " " : "Tidak ada",                                     // Gambar
      item._kondisi || item.kondisi || "-",                            // Kondisi
      item.tempat_penyimpanan?.rak?.nama_rak || "-",                   // Rak
      item.tempat_penyimpanan?.tahap?.nama_tahap || "-"                // Tahap
    ]);

    doc.autoTable({
      startY: 40,
      head: [['No', 'No. Reg', 'No. Inventaris', 'Nama Benda', 'Kategori', 'Tanggal Perolehan', 'Ukuran', 'Deskripsi', 'Gambar', 'Kondisi', 'Rak', 'Tahap']],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        overflow: 'linebreak',
        halign: 'left',
        valign: 'middle',
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [59, 110, 128],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'center',
        valign: 'middle'
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },                               // No
        1: { cellWidth: 18 },                                                 // No. Reg
        2: { cellWidth: 20 },                                                 // No. Inventaris
        3: { cellWidth: 38 },                                                 // Nama Benda
        4: { cellWidth: 24 },                                                 // Kategori
        5: { cellWidth: 23, halign: 'center' },                              // Tanggal Perolehan
        6: { cellWidth: 28 },                                                 // Ukuran
        7: { cellWidth: 45 },                                                 // Deskripsi
        8: { cellWidth: 18, halign: 'center', valign: 'middle', minCellHeight: 18 },  // Gambar
        9: { cellWidth: 18, halign: 'center' },                              // Kondisi
        10:{ cellWidth: 14 },                                                 // Rak
        11:{ cellWidth: 16 }                                                  // Tahap
      },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 8) {
          const imgData = itemsWithImages[data.row.index]?.imgData;
          if (imgData) {
            const cell = data.cell;
            const imgWidth = 16;
            const imgHeight = 13;
            const x = cell.x + (cell.width - imgWidth) / 2;
            const y = cell.y + (cell.height - imgHeight) / 2;
            try {
              doc.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
              // Clear text setelah gambar di-render
              data.cell.text = [];
            } catch (e) {
              console.warn('Gagal render gambar ke PDF:', e);
            }
          }
        }
      }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Halaman ${i} dari ${pageCount}`, 148, doc.internal.pageSize.height - 10, { align: 'center' });
    }

    // Save
    const filename = `Laporan_Gudang_${gudangName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);

    showAlert("Berhasil", `PDF untuk ${gudangName} berhasil didownload`, "success");
  } catch (err) {
    console.error("Error exporting to PDF:", err);
    showAlert("Error", "Gagal export ke PDF: " + err.message, "error");
  }
}

// ============================================
// 7. EXPORT DATA KE PDF (SIMPLE)
// ============================================
export async function exportReportToPDF(reportType = "all") {
  try {
    showAlert("Info", "Fitur export PDF sedang dalam pengembangan. Gunakan Print (Ctrl+P) untuk export ke PDF.", "info");
    
    // Alternatif: Print to PDF menggunakan browser default
    const title = reportType === "gudang" ? "Laporan Per Gudang" : 
                  reportType === "nilai" ? "Laporan Nilai Aset" : 
                  "Laporan Koleksi Museum";

    const printWindow = window.open("", "", "height=600,width=800");
    
    let content = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #3b6e80; text-align: center; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #3b6e80; color: white; }
            .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p>Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}</p>
          <div id="printContent"></div>
          <div class="footer">
            <p>© Museum Sri Baduga. Dokumen ini adalah laporan resmi sistem inventaris museum.</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
      const pdfLib = await ensureJsPdfReady();
      const { jsPDF } = pdfLib || {};
      if (!jsPDF || !pdfLib.autoTable) {
        showAlert("Error", "Library jsPDF belum dimuat. Silakan refresh halaman.", "error");
        return;
      }

      if (items.length === 0) {
        showAlert("Info", "Tidak ada data untuk diexport", "info");
        return;
      }

      const doc = new jsPDF('l', 'mm', 'a4'); // landscape
      if (typeof doc.autoTable !== 'function') {
        showAlert("Error", "Plugin jsPDF AutoTable belum siap.", "error");
        return;
      }


  } catch (err) {
    console.error("Error exporting PDF:", err);
    showAlert("Error", "Gagal export laporan", "error");
  }
}

// ============================================
// 9. EXPORT PER BULAN KE EXCEL (BERDASARKAN INSERTION DATE)
// ============================================
export async function exportPerBulanExcel() {
  try {
    const items = await fetchKoleksiWithFilters();

    if (items.length === 0) {
      showAlert("Info", "Tidak ada data untuk diexport", "info");
      return;
    }

    // Import XLSX dynamically
    const XLSX = window.XLSX;
    if (!XLSX) {
      showAlert("Error", "Library XLSX belum dimuat. Pastikan sudah include di HTML.", "error");
      return;
    }

    // Group by insertion month (createdAt)
    const groupedByMonth = {};
    items.forEach(item => {
      // Use createdAt for insertion date, fallback to tanggal_perolehan
      const insertDate = item.createdAt || item.created_at || item.insertedAt || item.inserted_at || item.tanggal_perolehan;
      if (!insertDate) return;

      const date = new Date(insertDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!groupedByMonth[monthKey]) {
        groupedByMonth[monthKey] = [];
      }
      groupedByMonth[monthKey].push(item);
    });

    // Create workbook with multiple sheets (one per month)
    const workbook = XLSX.utils.book_new();
    const sortedMonths = Object.keys(groupedByMonth).sort();

    sortedMonths.forEach(monthKey => {
      const monthItems = groupedByMonth[monthKey];
      const excelData = monthItems.map((item, idx) => ({
        "No": idx + 1,
        "Nama Benda": item.nama_benda || "",
        "No Reg": item.no_reg || item.no_registrasi || "",
        "No Inv": item.no_inv || item.no_inventaris || "",
        "Kategori": item._kategori || item.kategori?.nama_kategori || "",
        "Asal Koleksi": item.asal_koleksi || item.asalKoleksi || "",
        "Bahan": item.bahan || "",
        "Kondisi": item._kondisi || item.kondisi || "",
        "Tgl Perolehan": item._tanggal ? new Date(item._tanggal).toLocaleDateString('id-ID') : "-",
        "Deskripsi": item.deskripsi || item.keterangan || "",
        "Gambar": (item.gambar || item.foto || item.foto_utama || (Array.isArray(item.images) && item.images[0])) ? "Ada" : "Tidak Ada",
        "Ukuran": formatUkuran(item),
        "Tempat Penyimpanan": (item._gudang || item.gudang?.nama || "") + " / " + (item.tempat_penyimpanan?.rak?.nama_rak || "-")
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const colWidths = [
        { wch: 5 }, { wch: 30 }, { wch: 12 }, { wch: 12 },
        { wch: 18 }, { wch: 18 }, { wch: 12 }, { wch: 12 },
        { wch: 15 }, { wch: 25 }, { wch: 10 }, { wch: 20 }, { wch: 20 }
      ];
      ws['!cols'] = colWidths;

      const monthName = new Date(monthKey + '-01').toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      XLSX.utils.book_append_sheet(workbook, ws, monthKey.substring(5, 7) + '-' + monthKey.substring(0, 4));
    });

    XLSX.writeFile(workbook, `Laporan_Per_Bulan_${new Date().toISOString().split('T')[0]}.xlsx`);
    showAlert("Berhasil", `Laporan per bulan berhasil diexport (${sortedMonths.length} bulan)`, "success");
  } catch (err) {
    console.error("Error exporting per bulan:", err);
    showAlert("Error", "Gagal export per bulan: " + err.message, "error");
  }
}

// ============================================
// 9.3 EXPORT PER BULAN SPESIFIK (SINGLE MONTH - BERDASARKAN INSERTION DATE)
// ============================================
export async function exportPerBulanExcelSingle(month, year) {
  try {
    const monthNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                       'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    console.log(`Exporting data for ${monthNames[parseInt(month)]} ${year}`);

    // Fetch semua data lalu filter by insertion date
    const allItems = await fetchKoleksiWithFilters();
    
    const items = allItems.filter(item => {
      const insertDate = item.createdAt || item.created_at || item.insertedAt || item.inserted_at;
      if (!insertDate) return false;
      
      const date = new Date(insertDate);
      const itemYear = date.getFullYear();
      const itemMonth = String(date.getMonth() + 1).padStart(2, '0');
      
      return itemYear === parseInt(year) && itemMonth === month;
    });

    if (items.length === 0) {
      showAlert("Info", `Tidak ada data untuk ${monthNames[parseInt(month)]} ${year}`, "info");
      return;
    }

    const XLSX = window.XLSX;
    if (!XLSX) {
      alert("Library XLSX belum dimuat. Silakan refresh halaman.");
      return;
    }

    // Prepare Excel data - 11 fields dengan gambar logic correct + Ukuran 1 kolom
    const excelData = items.map((item, idx) => {
      return {
        "No": idx + 1,
        "Nama Benda": item.nama_benda || "",
        "No Reg": item.no_reg || item.no_registrasi || "",
        "No Inv": item.no_inv || item.no_inventaris || "",
        "Kategori": item._kategori || item.kategori?.nama_kategori || "",
        "Asal Koleksi": item.asal_koleksi || item.asalKoleksi || "",
        "Bahan": item.bahan || "",
        "Kondisi": item._kondisi || item.kondisi || "",
        "Tgl Perolehan": item._tanggal ? new Date(item._tanggal).toLocaleDateString('id-ID') : "-",
        "Deskripsi": item.deskripsi || item.keterangan || "",
        "Gambar": (item.gambar || item.foto || item.foto_utama || (Array.isArray(item.images) && item.images[0])) ? "Ada" : "Tidak Ada",
        "Ukuran": formatUkuran(item),
        "Tempat Penyimpanan": (item._gudang || item.gudang?.nama || "") + " / " + (item.tempat_penyimpanan?.rak?.nama_rak || "-")
      };
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    
    const sheetName = `${monthNames[parseInt(month)]} ${year}`;
    
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Column widths - 12 fields
    ws['!cols'] = [
      { wch: 5 }, { wch: 30 }, { wch: 12 }, { wch: 12 },
      { wch: 18 }, { wch: 18 }, { wch: 12 }, { wch: 12 },
      { wch: 15 }, { wch: 25 }, { wch: 10 }, { wch: 20 }, { wch: 20 }
    ];

    const filename = `Laporan_${monthNames[parseInt(month)]}_${year}.xlsx`;
    XLSX.writeFile(wb, filename);
    
    showAlert("Berhasil", `Laporan ${monthNames[parseInt(month)]} ${year} berhasil diexport (${items.length} item)`, "success");
  } catch (err) {
    console.error("Error exporting single month:", err);
    alert("❌ Gagal export: " + err.message);
  }
}

    // ============================================
    // 9.4 EXPORT PER BULAN KE PDF (MENAMBAHKAN GUDANG, UKURAN, GAMBAR, DESKRIPSI, TGL PEROLEHAN)
    // ============================================
    export async function exportPerBulanPDFSingle(month, year) {
      try {
        const monthNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                           'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        const monthLabel = `${monthNames[parseInt(month)]} ${year}`;

        // Ambil semua data lalu filter berdasar insertion date
        const allItems = await fetchKoleksiWithFilters();
        const items = allItems.filter(item => {
          const insertDate = item.createdAt || item.created_at || item.insertedAt || item.inserted_at;
          if (!insertDate) return false;

          const date = new Date(insertDate);
          const itemYear = date.getFullYear();
          const itemMonth = String(date.getMonth() + 1).padStart(2, '0');

          return itemYear === parseInt(year) && itemMonth === month;
        });

        if (items.length === 0) {
          showAlert("Info", `Tidak ada data untuk ${monthLabel}`, "info");
          return;
        }

        // Pastikan jsPDF siap
        const pdfLib = await ensureJsPdfReady();
        const { jsPDF } = pdfLib;
        
        if (!jsPDF) {
          throw new Error("jsPDF class tidak ditemukan");
        }

        const doc = new jsPDF('l', 'mm', 'a4');
        
        // Verifikasi autoTable tersedia di instance doc
        if (typeof doc.autoTable !== 'function') {
          throw new Error("Plugin autoTable tidak ditemukan. Pastikan jspdf-autotable sudah dimuat.");
        }

        // Preload gambar ke dataURL supaya bisa di-embed di PDF
        const itemsWithImages = await Promise.all(items.map(async (item) => {
          const imgData = await fetchImageAsDataUrl(getPrimaryImageUrl(item));
          return { item, imgData };
        }));

        // Siapkan data tabel
        const tableData = itemsWithImages.map(({ item, imgData }, idx) => [
          idx + 1,
          item.nama_benda || "-",
          item.no_reg || "-",
          item._gudang || item.tempat_penyimpanan?.gudang?.nama_gudang || item.gudang?.nama || "-",
          formatTanggalPerolehan(item),
          formatUkuran(item),
          item.deskripsi || item.deskripsi_singkat || item.keterangan || "-",
          imgData ? " " : "Tidak ada", // placeholder; gambar akan di-draw manual
          item._kondisi || item.kondisi || "-"
        ]);

        // Header dokumen
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(`LAPORAN KOLEKSI PER BULAN - ${monthLabel.toUpperCase()}`, 148, 12, { align: 'center' });
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.text(`Total Item: ${items.length}`, 148, 18, { align: 'center' });

        // Tabel utama dengan kolom yang diminta
        doc.autoTable({
          startY: 26,
          head: [['No', 'Nama Benda', 'No. Reg', 'Gudang Penyimpanan', 'Tanggal Perolehan', 'Ukuran', 'Deskripsi', 'Gambar', 'Kondisi']],
          body: tableData,
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
          headStyles: { fillColor: [59, 110, 128], textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [245, 247, 250] },
          columnStyles: {
            0: { cellWidth: 8, halign: 'center' },
            1: { cellWidth: 40 },
            2: { cellWidth: 22 },
            3: { cellWidth: 32 },
            4: { cellWidth: 28 },
            5: { cellWidth: 32 },
            6: { cellWidth: 55 },
            7: { cellWidth: 38, halign: 'center', minCellHeight: 18 },
            8: { cellWidth: 20, halign: 'center' }
          },
          didDrawCell: (data) => {
            if (data.section === 'body' && data.column.index === 7) {
              const imgData = itemsWithImages[data.row.index]?.imgData;
              if (imgData) {
                const cell = data.cell;
                const imgWidth = 20;
                const imgHeight = 15;
                const x = cell.x + (cell.width - imgWidth) / 2;
                const y = cell.y + 2;
                try {
                  doc.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
                } catch (e) {
                  console.warn('Gagal render gambar ke PDF:', e);
                }
              }
            }
          }
        });

        // Footer page number
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.text(`Halaman ${i} dari ${pageCount}`, 148, doc.internal.pageSize.height - 10, { align: 'center' });
        }

        const filename = `Laporan_${monthNames[parseInt(month)]}_${year}.pdf`;
        doc.save(filename);
        showAlert("Berhasil", `PDF ${monthLabel} berhasil diexport (${items.length} item)`, "success");
      } catch (err) {
        console.error("Error exporting single month PDF:", err);
        alert("❌ Gagal export PDF: " + err.message);
      }
    }

// ============================================
// 9.5 EXPORT SEMUA GUDANG KE EXCEL (MULTIPLE SHEETS)
// ============================================
export async function exportAllGudangToExcel() {
  console.log("exportAllGudangToExcel called");
  try {
    // Tunggu sebentar untuk pastikan XLSX sudah ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Cek XLSX library dengan retry mechanism
    let XLSX = window.XLSX;
    
    if (!XLSX) {
      console.log("XLSX not found on first check, waiting...");
      // Tunggu lebih lama
      await new Promise(resolve => setTimeout(resolve, 500));
      XLSX = window.XLSX;
    }
    
    if (!XLSX) {
      console.log("XLSX still not found, trying dynamic load...");
      // Load dinamis jika belum ada
      try {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
          script.onload = () => {
            console.log("XLSX script loaded");
            resolve();
          };
          script.onerror = (err) => {
            console.error("Failed to load XLSX script", err);
            reject(err);
          };
          document.head.appendChild(script);
        });
        
        // Wait longer for library to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
        XLSX = window.XLSX;
      } catch (loadError) {
        console.error("Error loading XLSX:", loadError);
      }
    }

    if (!XLSX) {
      console.error("XLSX still not available after all attempts");
      alert("Library XLSX tidak berhasil dimuat. Silakan refresh halaman (F5) dan coba lagi.");
      return;
    }
    
    console.log("XLSX library ready, version:", XLSX.version);

    const items = await fetchKoleksiWithFilters();
    console.log(`Fetched ${items.length} items`);

    if (items.length === 0) {
      alert("Tidak ada data untuk diexport");
      return;
    }

    // Group by gudang
    const groupedByGudang = {};
    items.forEach(item => {
      const gudang = item._gudang || item.gudang?.nama || item.tempat_penyimpanan?.gudang?.nama_gudang || "Unknown";
      if (!groupedByGudang[gudang]) {
        groupedByGudang[gudang] = [];
      }
      groupedByGudang[gudang].push(item);
    });
    
    console.log(`Grouped into ${Object.keys(groupedByGudang).length} gudang:`, Object.keys(groupedByGudang));

    // Create workbook with multiple sheets (one per gudang)
    const workbook = XLSX.utils.book_new();
    const gudangs = Object.keys(groupedByGudang).sort();

    gudangs.forEach(gudangName => {
      const gudangItems = groupedByGudang[gudangName];
      const excelData = gudangItems.map((item, idx) => ({
        "No": idx + 1,
        "Nama Benda": item.nama_benda || "",
        "No Reg": item.no_reg || item.no_registrasi || "",
        "No Inv": item.no_inv || item.no_inventaris || "",
        "Kategori": item._kategori || item.kategori?.nama_kategori || "",
        "Asal Koleksi": item.asal_koleksi || item.asalKoleksi || "",
        "Bahan": item.bahan || "",
        "Kondisi": item._kondisi || item.kondisi || "",
        "Tgl Perolehan": item._tanggal ? new Date(item._tanggal).toLocaleDateString('id-ID') : "-",
        "Deskripsi": item.deskripsi || item.keterangan || "",
        "Gambar": (item.gambar || item.foto || item.foto_utama || (Array.isArray(item.images) && item.images[0])) ? "Ada" : "Tidak Ada",
        "Ukuran": formatUkuran(item),
        "Rak": item.tempat_penyimpanan?.rak?.nama_rak || "-"
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const colWidths = [
        { wch: 5 }, { wch: 30 }, { wch: 12 }, { wch: 12 },
        { wch: 18 }, { wch: 18 }, { wch: 12 }, { wch: 12 },
        { wch: 15 }, { wch: 25 }, { wch: 10 }, { wch: 20 }, { wch: 15 }
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(workbook, ws, gudangName.substring(0, 31)); // Excel sheet name max 31 chars
    });

    console.log(`Creating workbook with ${gudangs.length} sheets`);
    XLSX.writeFile(workbook, `Laporan_Per_Gudang_${new Date().toISOString().split('T')[0]}.xlsx`);
    console.log("File written successfully");
    showAlert("Berhasil", `Laporan per gudang berhasil diexport (${gudangs.length} gudang)`, "success");
  } catch (err) {
    console.error("Error exporting per gudang:", err);
    alert("❌ Gagal export per gudang: " + err.message);
  }
}

// ============================================
// 10. EXPORT PER TANGGAL KE EXCEL (BERDASARKAN INSERTION DATE)
// ============================================
export async function exportPerTanggalExcel(startDate = null, endDate = null) {
  try {
    const items = await fetchKoleksiWithFilters();

    if (items.length === 0) {
      showAlert("Info", "Tidak ada data untuk diexport", "info");
      return;
    }

    // Import XLSX dynamically
    const XLSX = window.XLSX;
    if (!XLSX) {
      showAlert("Error", "Library XLSX belum dimuat. Pastikan sudah include di HTML.", "error");
      return;
    }

    // Filter by date range if provided
    let filteredItems = items;
    if (startDate || endDate) {
      filteredItems = items.filter(item => {
        const insertDate = item.createdAt || item.created_at || item.insertedAt || item.inserted_at || item.tanggal_perolehan;
        if (!insertDate) return false;

        const itemDate = new Date(insertDate);
        itemDate.setHours(0, 0, 0, 0);

        if (startDate && endDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          return itemDate >= start && itemDate <= end;
        } else if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          return itemDate >= start;
        } else if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          return itemDate <= end;
        }
        return true;
      });
    }

    if (filteredItems.length === 0) {
      showAlert("Info", "Tidak ada data dalam periode yang dipilih", "info");
      return;
    }

    // Group by insertion date (createdAt)
    const groupedByDate = {};
    filteredItems.forEach(item => {
      // Use createdAt for insertion date
      const insertDate = item.createdAt || item.created_at || item.insertedAt || item.inserted_at || item.tanggal_perolehan;
      if (!insertDate) return;

      const date = new Date(insertDate);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format

      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }
      groupedByDate[dateKey].push(item);
    });

    // Create workbook with multiple sheets (one per date)
    const workbook = XLSX.utils.book_new();
    const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(a) - new Date(b));

    sortedDates.forEach(dateKey => {
      const dateItems = groupedByDate[dateKey];
      const excelData = dateItems.map((item, idx) => ({
        "No": idx + 1,
        "Nama Benda": item.nama_benda || "",
        "No Reg": item.no_reg || item.no_registrasi || "",
        "No Inv": item.no_inv || item.no_inventaris || "",
        "Kategori": item._kategori || item.kategori?.nama_kategori || "",
        "Asal Koleksi": item.asal_koleksi || item.asalKoleksi || "",
        "Bahan": item.bahan || "",
        "Kondisi": item._kondisi || item.kondisi || "",
        "Tgl Perolehan": item._tanggal ? new Date(item._tanggal).toLocaleDateString('id-ID') : "-",
        "Deskripsi": item.deskripsi || item.keterangan || "",
        "Gambar": (item.gambar || item.foto || item.foto_utama || (Array.isArray(item.images) && item.images[0])) ? "Ada" : "Tidak Ada",
        "Ukuran": formatUkuran(item),
        "Tempat Penyimpanan": (item._gudang || item.gudang?.nama || "") + " / " + (item.tempat_penyimpanan?.rak?.nama_rak || "-")
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const colWidths = [
        { wch: 5 }, { wch: 30 }, { wch: 12 }, { wch: 12 },
        { wch: 18 }, { wch: 18 }, { wch: 12 }, { wch: 12 },
        { wch: 15 }, { wch: 25 }, { wch: 10 }, { wch: 20 }, { wch: 20 }
      ];
      ws['!cols'] = colWidths;

      const sheetName = dateKey.replace(/-/g, '');
      XLSX.utils.book_append_sheet(workbook, ws, sheetName);
    });

    const dateRangeText = startDate && endDate ? `_${startDate}_sampai_${endDate}` : '';
    XLSX.writeFile(workbook, `Laporan_Per_Tanggal${dateRangeText}_${new Date().toISOString().split('T')[0]}.xlsx`);
    const rangeInfo = startDate && endDate ? ` dari ${startDate} sampai ${endDate}` : '';
    showAlert("Berhasil", `Laporan per tanggal berhasil diexport (${sortedDates.length} tanggal${rangeInfo})`, "success");
  } catch (err) {
    console.error("Error exporting per tanggal:", err);
    showAlert("Error", "Gagal export per tanggal: " + err.message, "error");
  }
}

// ============================================
// 10.5 EXPORT ALL DATA KOLEKSI TO PDF (LENGKAP)
// ============================================
export async function exportAllDataToPDF() {
  console.log('📄 Starting PDF export...');
  
  try {
    // Pastikan jsPDF siap
    console.log('⏳ Ensuring jsPDF ready...');
    const pdfLib = await ensureJsPdfReady();
    const { jsPDF } = pdfLib;
    
    if (!jsPDF) {
      throw new Error('jsPDF class tidak ditemukan');
    }

    console.log('✅ jsPDF ready');
    console.log('📥 Fetching collection data...');

    const items = await fetchKoleksiWithFilters();

    if (items.length === 0) {
      alert("Tidak ada data untuk diexport");
      return;
    }

    // Create PDF dengan landscape mode untuk table lebih lebar
    const doc = new jsPDF('l', 'mm', 'a4'); // landscape
    
    // Verifikasi autoTable tersedia di instance doc
    if (typeof doc.autoTable !== 'function') {
      throw new Error('Plugin autoTable tidak ditemukan. Pastikan jspdf-autotable sudah dimuat.');
    }

    // Header dokumen
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('LAPORAN DATA KOLEKSI LENGKAP', 148, 12, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Museum Sri Baduga', 148, 18, { align: 'center' });
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(`Tanggal: ${dateStr}`, 148, 24, { align: 'center' });
    doc.text(`Total Item: ${items.length}`, 148, 30, { align: 'center' });

    // Preload gambar per item (batch proses untuk performa)
    console.log('Memuat gambar untuk PDF...');
    const itemsWithImages = await Promise.all(items.map(async (item) => {
      const imgData = await fetchImageAsDataUrl(getPrimaryImageUrl(item));
      return { item, imgData };
    }));
    console.log('Gambar selesai dimuat');

    // Prepare table data dengan SEMUA kolom (sesuai tabel HTML) + Gambar
    const tableData = itemsWithImages.map(({ item, imgData }, idx) => {
      // Extract ukuran details
      const ukuran = item.ukuran || {};
      return [
        idx + 1,                                          // No
        item.nama_benda || "-",                          // Nama Benda
        item.no_reg || "-",                              // No Reg
        item.no_inv || "-",                              // No Inv
        item._kategori || "-",                           // Kategori
        item.asal_koleksi || "-",                        // Asal Koleksi
        item.bahan || "-",                               // Bahan
        item._kondisi || "-",                            // Kondisi
        formatTanggalPerolehan(item),                    // Tgl Perolehan
        item.deskripsi || item.deskripsi_singkat || item.keterangan || "-",  // Deskripsi
        imgData ? " " : "Tidak ada",                     // Gambar (space jika ada, atau text)
        formatUkuran(item),                              // Ukuran (gabung semua dimensi)
        item._gudang || "-",                             // Gudang
        item.tempat_penyimpanan?.rak?.nama_rak || "-",   // Rak
        item.tempat_penyimpanan?.tahap?.nama_tahap || "-" // Tahap
      ];
    });

    // Generate table dengan autoTable - 11 KOLOM (INCLUDE GAMBAR DENGAN THUMBNAIL)
    doc.autoTable({
      startY: 35,
      head: [['No', 'Nama Benda', 'No Reg', 'No Inv', 'Kategori', 'Asal Koleksi', 'Bahan', 'Kondisi', 'Tgl Perolehan', 'Deskripsi', 'Gambar', 'Ukuran', 'Gudang', 'Rak', 'Tahap']],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 7,
        cellPadding: 2,
        overflow: 'linebreak',
        halign: 'left'
      },
      headStyles: {
        fillColor: [59, 110, 128],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 7
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },       // No
        1: { cellWidth: 25 },                        // Nama Benda
        2: { cellWidth: 15 },                        // No Reg
        3: { cellWidth: 15 },                        // No Inv
        4: { cellWidth: 18 },                        // Kategori
        5: { cellWidth: 18 },                        // Asal Koleksi
        6: { cellWidth: 15 },                        // Bahan
        7: { cellWidth: 14 },                        // Kondisi
        8: { cellWidth: 18 },                        // Tgl Perolehan
        9: { cellWidth: 28 },                        // Deskripsi
        10:{ cellWidth: 18, halign: 'center', valign: 'middle', minCellHeight: 16 },  // Gambar
        11:{ cellWidth: 25 },                        // Ukuran
        12:{ cellWidth: 15 },                        // Gudang
        13:{ cellWidth: 12 },                        // Rak
        14:{ cellWidth: 12 }                         // Tahap
      },
      // Render gambar sebagai thumbnail di kolom Gambar
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 10) {
          // Kolom Gambar (column 10) - access imgData dari array
          const imgData = itemsWithImages[data.row.index]?.imgData;
          if (imgData) {
            const cell = data.cell;
            const imgWidth = 14;
            const imgHeight = 12;
            const x = cell.x + (cell.width - imgWidth) / 2;
            const y = cell.y + (cell.height - imgHeight) / 2;
            try {
              doc.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
              // Clear text karena sudah di-render gambar
              data.cell.text = [];
            } catch (e) {
              console.warn('Gagal render gambar ke PDF:', e);
              data.cell.text = ['Gagal'];
            }
          }
        }
      }
    });

    // Footer dengan nomor halaman
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Halaman ${i} dari ${pageCount}`, 148, doc.internal.pageSize.height - 10, { align: 'center' });
    }

    // Save
    const filename = `Laporan_Data_Lengkap_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
    showAlert("Berhasil", `Laporan data lengkap berhasil diexport (${items.length} item)`, "success");

  } catch (err) {
    console.error("Error exporting all data PDF:", err);
    alert("❌ Gagal export PDF: " + err.message);
  }
}

// ============================================
// 10.6 EXPORT ALL GUDANG TO PDF (PER GUDANG TERPISAH)
// ============================================
export async function exportAllGudangToPDF() {
  try {
    const pdfLib = await ensureJsPdfReady();
    const { jsPDF } = pdfLib;
    
    if (!jsPDF) {
      throw new Error('jsPDF class tidak ditemukan');
    }

    const items = await fetchKoleksiWithFilters();

    if (items.length === 0) {
      alert("Tidak ada data untuk diexport");
      return;
    }

    // Group by gudang
    const groupedByGudang = {};
    items.forEach(item => {
      const gudang = item._gudang || item.gudang?.nama || item.tempat_penyimpanan?.gudang?.nama_gudang || "Unknown";
      if (!groupedByGudang[gudang]) {
        groupedByGudang[gudang] = [];
      }
      groupedByGudang[gudang].push(item);
    });

    // Create PDF dengan landscape mode untuk table lebih lebar
    const doc = new jsPDF('l', 'mm', 'a4'); // landscape
    
    // Verifikasi autoTable tersedia di instance doc
    if (typeof doc.autoTable !== 'function') {
      throw new Error('Plugin autoTable tidak ditemukan. Pastikan jspdf-autotable sudah dimuat.');
    }
    
    let isFirstPage = true;

    // Iterate setiap gudang (async-friendly loop)
    for (const [gudang, gudangItems] of Object.entries(groupedByGudang)) {
      if (!isFirstPage) {
        doc.addPage();
      }
      isFirstPage = false;

      // Header
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(`LAPORAN KOLEKSI - ${gudang.toUpperCase()}`, 148, 12, { align: 'center' });

      // Tanggal cetak
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      const now = new Date();
      const dateStr = now.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
      doc.text(`Tanggal: ${dateStr}`, 148, 18, { align: 'center' });

      // Preload gambar per item
      const itemsWithImages = await Promise.all(gudangItems.map(async (item) => {
        const imgData = await fetchImageAsDataUrl(getPrimaryImageUrl(item));
        return { item, imgData };
      }));

      // Prepare table data
      const tableData = itemsWithImages.map(({ item, imgData }, idx) => [
        idx + 1,
        item.no_reg || "-",
        item.no_inv || "-",
        item.nama_benda || "-",
        item._kategori || "-",
        formatTanggalPerolehan(item),
        formatUkuran(item),
        item.deskripsi || item.deskripsi_singkat || item.keterangan || "-",
        imgData ? " " : "Tidak ada",
        item._kondisi || "-",
        item.tempat_penyimpanan?.rak?.nama_rak || "-",
        item.tempat_penyimpanan?.tahap?.nama_tahap || "-"
      ]);

      // Generate table dengan autoTable
      doc.autoTable({
          startY: 25,
          head: [['No', 'No. Reg', 'No. Inventaris', 'Nama Benda', 'Kategori', 'Tanggal Perolehan', 'Ukuran', 'Deskripsi', 'Gambar', 'Kondisi', 'Rak', 'Tahap']],
          body: tableData,
          theme: 'grid',
          styles: {
            fontSize: 6,
            cellPadding: 1,
            overflow: 'linebreak',
            halign: 'left'
          },
          headStyles: {
            fillColor: [59, 110, 128], // dark blue
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 6
          },
          columnStyles: {
            0: { cellWidth: 6, halign: 'center' },
            1: { cellWidth: 12 },
            2: { cellWidth: 12 },
            3: { cellWidth: 24 },
            4: { cellWidth: 15 },
            5: { cellWidth: 16 },
            6: { cellWidth: 20 },
            7: { cellWidth: 32 },
            8: { cellWidth: 18, halign: 'center', minCellHeight: 14 },
            9: { cellWidth: 12 },
            10:{ cellWidth: 12 },
            11:{ cellWidth: 12 }
          },
          didDrawCell: (data) => {
            if (data.section === 'body' && data.column.index === 8) {
              const imgData = itemsWithImages[data.row.index]?.imgData;
              if (imgData) {
                const cell = data.cell;
                const imgWidth = 16;
                const imgHeight = 12;
                const x = cell.x + (cell.width - imgWidth) / 2;
                const y = cell.y + 1;
                try {
                  doc.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
                } catch (e) {
                  console.warn('Gagal render gambar ke PDF:', e);
                }
              }
            }
          }
        });
    }

    // Save
    const filename = `Laporan_Per_Gudang_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
    showAlert("Berhasil", `Laporan PDF untuk ${Object.keys(groupedByGudang).length} gudang berhasil didownload`, "success");

  } catch (err) {
    console.error("Error exporting per gudang PDF:", err);
    alert("❌ Gagal export per gudang PDF: " + err.message);
  }
}

// ============================================
// 11. AUTO LOAD
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  loadReportPerGudang();
  loadReportNilaiAset();
  loadReportByDateRange();
});

// Global functions untuk button onclick
window.detailReportGudang = detailReportGudang;
window.exportReportToPDF = exportReportToPDF;
window.exportGudangToExcel = exportGudangToExcel;
window.exportGudangToPDF = exportGudangToPDF;
window.exportPerBulanExcel = exportPerBulanExcel;
window.exportPerBulanExcelSingle = exportPerBulanExcelSingle;
window.exportPerTanggalExcel = exportPerTanggalExcel;
window.exportAllGudangToExcel = exportAllGudangToExcel;
window.exportAllGudangToPDF = exportAllGudangToPDF;
window.exportAllDataToPDF = exportAllDataToPDF;
window.exportPerBulanPDFSingle = exportPerBulanPDFSingle;
