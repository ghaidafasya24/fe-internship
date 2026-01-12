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
    let koleksi = await res.json();
    let items = Array.isArray(koleksi) ? koleksi : (koleksi?.data ?? []);

    // Filter berdasarkan parameter
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      items = items.filter(item => {
        const itemDate = item.tanggal_akuisisi ? new Date(item.tanggal_akuisisi) : null;
        return itemDate && itemDate >= start;
      });
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      items = items.filter(item => {
        const itemDate = item.tanggal_akuisisi ? new Date(item.tanggal_akuisisi) : null;
        return itemDate && itemDate <= end;
      });
    }

    if (filters.gudang) {
      items = items.filter(item => {
        const gudang = item.gudang?.nama || item.gudang_id || "";
        return gudang === filters.gudang;
      });
    }

    if (filters.kategori) {
      items = items.filter(item => {
        const kategori = item.kategori?.nama || item.kategori_id || "";
        return kategori === filters.kategori;
      });
    }

    if (filters.kondisi) {
      items = items.filter(item => item.kondisi === filters.kondisi);
    }

    return items;
  } catch (err) {
    console.error("Error fetching filtered data:", err);
    return [];
  }
}

// ============================================
// 2. LOAD DAN RENDER LAPORAN PER GUDANG
// ============================================
export async function loadReportPerGudang() {
  const tableBody = document.getElementById("tableReportPerGudang");
  if (!tableBody) return;

  tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-gray-500">Loading...</td></tr>';

  try {
    const items = await fetchKoleksiWithFilters();

    // Group by gudang
    const groupedByGudang = {};
    items.forEach(item => {
      const gudang = item.gudang?.nama || "Unknown";
      if (!groupedByGudang[gudang]) {
        groupedByGudang[gudang] = [];
      }
      groupedByGudang[gudang].push(item);
    });

    tableBody.innerHTML = '';
    let rowNum = 1;

    Object.entries(groupedByGudang).forEach(([gudang, gudangItems]) => {
      let totalNilai = 0;
      let totalRusak = 0;
      let totalPerlu = 0;

      gudangItems.forEach(item => {
        totalNilai += parseFloat(item.nilai_aset) || 0;
        const kondisi = (item.kondisi || "").toLowerCase();
        if (kondisi === "rusak") totalRusak++;
        if (kondisi === "perlu perbaikan") totalPerlu++;
      });

      const formatter = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      });

      const row = document.createElement("tr");
      row.className = "border-b hover:bg-gray-50";
      row.innerHTML = `
        <td class="px-4 py-3 text-sm font-medium text-gray-900">${rowNum}</td>
        <td class="px-4 py-3 text-sm font-semibold text-primary">${escapeHTML(gudang)}</td>
        <td class="px-4 py-3 text-sm text-gray-700">${gudangItems.length}</td>
        <td class="px-4 py-3 text-sm text-gray-700">${formatter.format(totalNilai)}</td>
        <td class="px-4 py-3 text-sm">
          <span class="text-red-600 font-semibold mr-2">${totalRusak} Rusak</span>
          <span class="text-yellow-600 font-semibold">${totalPerlu} Perlu Perbaikan</span>
        </td>
        <td class="px-4 py-3 text-sm">
          <button onclick="detailReportGudang('${escapeHTML(gudang)}')" class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs font-semibold">
            Lihat Detail
          </button>
        </td>
      `;
      tableBody.appendChild(row);
      rowNum++;
    });

  } catch (err) {
    console.error("Error loading report per gudang:", err);
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-red-500">Error loading data</td></tr>';
  }
}

// ============================================
// 3. DETAIL REPORT GUDANG
// ============================================
export async function detailReportGudang(gudangName) {
  try {
    const items = await fetchKoleksiWithFilters({ gudang: gudangName });

    const formatter = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    });

    let html = `
      <div class="text-left space-y-4 max-h-96 overflow-y-auto">
        <h3 class="text-lg font-bold text-gray-900">Detail Koleksi - ${escapeHTML(gudangName)}</h3>
        <table class="w-full text-sm border-collapse">
          <thead class="bg-gray-100">
            <tr>
              <th class="text-left px-3 py-2 font-semibold text-gray-700 border">No</th>
              <th class="text-left px-3 py-2 font-semibold text-gray-700 border">Nama</th>
              <th class="text-left px-3 py-2 font-semibold text-gray-700 border">Kategori</th>
              <th class="text-left px-3 py-2 font-semibold text-gray-700 border">Kondisi</th>
              <th class="text-right px-3 py-2 font-semibold text-gray-700 border">Nilai</th>
            </tr>
          </thead>
          <tbody>
    `;

    let totalNilai = 0;
    items.forEach((item, idx) => {
      const nilai = parseFloat(item.nilai_aset) || 0;
      totalNilai += nilai;
      const kategori = item.kategori?.nama || "N/A";
      const kondisi = item.kondisi || "N/A";

      html += `
        <tr class="border">
          <td class="px-3 py-2 text-gray-700">${idx + 1}</td>
          <td class="px-3 py-2 text-gray-800 font-medium">${escapeHTML(item.nama_koleksi || "")}</td>
          <td class="px-3 py-2 text-gray-700">${escapeHTML(kategori)}</td>
          <td class="px-3 py-2">
            <span class="px-2 py-1 rounded text-xs font-semibold ${
              kondisi === "baik" ? "bg-green-100 text-green-800" :
              kondisi === "rusak" ? "bg-red-100 text-red-800" :
              "bg-yellow-100 text-yellow-800"
            }">
              ${kondisi}
            </span>
          </td>
          <td class="px-3 py-2 text-right font-semibold text-primary">${formatter.format(nilai)}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
        <div class="border-t pt-3 mt-4">
          <p class="font-bold text-gray-900">Total Nilai: <span class="text-primary">${formatter.format(totalNilai)}</span></p>
          <p class="text-gray-700 mt-1">Total Item: <span class="font-semibold">${items.length}</span></p>
        </div>
      </div>
    `;

    Swal.fire({
      title: `Laporan ${gudangName}`,
      html,
      width: "800px",
      confirmButtonText: "Tutup",
      confirmButtonColor: "#3b6e80"
    });

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
    let totalNilai = 0;

    sorted.slice(0, 30).forEach((item, index) => {
      const nilai = parseFloat(item.nilai_aset) || 0;
      totalNilai += nilai;
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

    // Tambah total row
    const totalRow = document.createElement("tr");
    totalRow.className = "bg-gray-100 font-bold";
    totalRow.innerHTML = `
      <td colspan="4" class="px-4 py-3 text-sm text-right">TOTAL (Top 30):</td>
      <td class="px-4 py-3 text-sm text-right text-primary">${formatter.format(totalNilai)}</td>
    `;
    tableBody.appendChild(totalRow);

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
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-gray-500">Loading...</td></tr>';

    try {
      const items = await fetchKoleksiWithFilters({ startDate, endDate });

      const formatter = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      });

      tableBody.innerHTML = '';
      let totalNilai = 0;

      if (items.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-gray-500">Tidak ada data dalam periode ini</td></tr>';
        return;
      }

      items.forEach((item, index) => {
        const nilai = parseFloat(item.nilai_aset) || 0;
        totalNilai += nilai;
        const tanggal = item.tanggal_akuisisi ? new Date(item.tanggal_akuisisi).toLocaleDateString("id-ID") : "N/A";
        const kategori = item.kategori?.nama || "N/A";

        const row = document.createElement("tr");
        row.className = "border-b hover:bg-gray-50";
        row.innerHTML = `
          <td class="px-4 py-3 text-sm font-medium text-gray-900">${index + 1}</td>
          <td class="px-4 py-3 text-sm">${tanggal}</td>
          <td class="px-4 py-3 text-sm font-semibold text-gray-900">${escapeHTML(item.nama_koleksi || "")}</td>
          <td class="px-4 py-3 text-sm text-gray-700">${escapeHTML(kategori)}</td>
          <td class="px-4 py-3 text-sm text-gray-700">${item.kondisi || "N/A"}</td>
          <td class="px-4 py-3 text-sm text-right font-bold text-primary">${formatter.format(nilai)}</td>
        `;
        tableBody.appendChild(row);
      });

      // Total row
      const totalRow = document.createElement("tr");
      totalRow.className = "bg-gray-100 font-bold";
      totalRow.innerHTML = `
        <td colspan="5" class="px-4 py-3 text-sm text-right">TOTAL:</td>
        <td class="px-4 py-3 text-sm text-right text-primary">${formatter.format(totalNilai)}</td>
      `;
      tableBody.appendChild(totalRow);

    } catch (err) {
      console.error("Error loading date range report:", err);
      tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-red-500">Error loading data</td></tr>';
    }
  });
}

// ============================================
// 6. EXPORT DATA KE PDF (SIMPLE)
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
    
    // Copy table content ke print window jika ada tabel terbuka
    setTimeout(() => {
      const table = document.querySelector("table");
      if (table) {
        const contentDiv = printWindow.document.getElementById("printContent");
        contentDiv.innerHTML = table.outerHTML;
      }
      printWindow.print();
    }, 250);

  } catch (err) {
    console.error("Error exporting PDF:", err);
    showAlert("Error", "Gagal export laporan", "error");
  }
}

// ============================================
// 7. AUTO LOAD
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  loadReportPerGudang();
  loadReportNilaiAset();
  loadReportByDateRange();
});

// Global functions untuk button onclick
window.detailReportGudang = detailReportGudang;
window.exportReportToPDF = exportReportToPDF;
