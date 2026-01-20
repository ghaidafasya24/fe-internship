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
    alert(`Detail Gudang: ${gudangName}\nTotal Item: ${items.length}\n\nGunakan tombol Export Excel di tab untuk export data gudang ini.`);

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
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">Tidak ada data dalam periode ini</td></tr>';
        return;
      }

      items.forEach((item, index) => {
        // Gunakan insertion date (createdAt) untuk konsistensi dengan filter
        const insertDate = item.createdAt || item.created_at || item.insertedAt || item.inserted_at || item.tanggal_perolehan || item.tanggal_akuisisi;
        const tanggal = insertDate ? new Date(insertDate).toLocaleDateString("id-ID") : "N/A";
        const kategori = item.kategori?.nama || item._kategori || "N/A";

        const row = document.createElement("tr");
        row.className = "border-b hover:bg-gray-50";
        row.innerHTML = `
          <td class="px-4 py-3 text-sm font-medium text-gray-900">${index + 1}</td>
          <td class="px-4 py-3 text-sm">${tanggal}</td>
          <td class="px-4 py-3 text-sm font-semibold text-gray-900">${escapeHTML(item.nama_koleksi || "")}</td>
          <td class="px-4 py-3 text-sm text-gray-700">${escapeHTML(kategori)}</td>
          <td class="px-4 py-3 text-sm text-gray-700">${item.kondisi || "N/A"}</td>
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
      tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-gray-500">Tidak ada data untuk ${monthNames[parseInt(month)]} ${year}</td></tr>`;
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

    // Prepare data untuk Excel
    const excelData = items.map((item, idx) => ({
      "No": idx + 1,
      "No. Registrasi": item.no_reg || "",
      "No. Inventaris": item.no_inv || "",
      "Nama Benda": item.nama_benda || "",
      "Kategori": item._kategori || item.kategori?.nama_kategori || "",
      "Bahan": item.bahan || "",
      "Kondisi": item._kondisi || item.kondisi || "",
      "Asal Koleksi": item.asal_koleksi || "",
      "Gudang": item._gudang || gudangName,
      "Rak": item.tempat_penyimpanan?.rak?.nama_rak || "-",
      "Tahap": item.tempat_penyimpanan?.tahap?.nama_tahap || "-"
    }));

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Gudang ${gudangName}`);

    // Auto width columns
    const colWidths = [
      { wch: 5 },  // No
      { wch: 15 }, // No Reg
      { wch: 15 }, // No Inv
      { wch: 30 }, // Nama
      { wch: 20 }, // Kategori
      { wch: 15 }, // Bahan
      { wch: 15 }, // Kondisi
      { wch: 20 }, // Asal
      { wch: 15 }, // Gudang
      { wch: 15 }, // Rak
      { wch: 15 }  // Tahap
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
    const items = await fetchKoleksiWithFilters({ gudang: gudangName });
    
    if (items.length === 0) {
      showAlert("Info", "Tidak ada data untuk diexport", "info");
      return;
    }

    // Import jsPDF dynamically
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
      showAlert("Error", "Library jsPDF belum dimuat. Pastikan sudah include di HTML.", "error");
      return;
    }

    const doc = new jsPDF('l', 'mm', 'a4'); // landscape

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
    const tableData = items.map((item, idx) => [
      idx + 1,
      item.no_reg || "-",
      item.nama_benda || "-",
      item._kategori || item.kategori?.nama_kategori || "-",
      item._kondisi || item.kondisi || "-",
      item.tempat_penyimpanan?.rak?.nama_rak || "-",
      item.tempat_penyimpanan?.tahap?.nama_tahap || "-"
    ]);

    doc.autoTable({
      startY: 40,
      head: [['No', 'No. Reg', 'Nama Benda', 'Kategori', 'Kondisi', 'Rak', 'Tahap']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [59, 110, 128], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 25 },
        2: { cellWidth: 60 },
        3: { cellWidth: 35 },
        4: { cellWidth: 25, halign: 'center' },
        5: { cellWidth: 30 },
        6: { cellWidth: 30 }
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
        "No. Registrasi": item.no_reg || "",
        "No. Inventaris": item.no_inv || "",
        "Nama Benda": item.nama_benda || "",
        "Kategori": item._kategori || item.kategori?.nama_kategori || "",
        "Bahan": item.bahan || "",
        "Kondisi": item._kondisi || item.kondisi || "",
        "Asal Koleksi": item.asal_koleksi || "",
        "Gudang": item._gudang || item.gudang?.nama || "",
        "Rak": item.tempat_penyimpanan?.rak?.nama_rak || "-",
        "Tanggal Insert": item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : "-"
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const colWidths = [
        { wch: 5 }, { wch: 15 }, { wch: 15 }, { wch: 30 },
        { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 20 },
        { wch: 15 }, { wch: 15 }, { wch: 15 }
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
      alert(`Tidak ada data untuk ${monthNames[parseInt(month)]} ${year}`);
      return;
    }

    const XLSX = window.XLSX;
    if (!XLSX) {
      alert("Library XLSX belum dimuat. Silakan refresh halaman.");
      return;
    }

    // Prepare Excel data
    const excelData = items.map((item, idx) => {
      const insertDate = item.createdAt || item.created_at || item.insertedAt || item.inserted_at || item.tanggal_perolehan;
      const tanggalInsert = insertDate ? new Date(insertDate).toLocaleDateString('id-ID') : "-";
      
      return {
        "No": idx + 1,
        "Tanggal Insert": tanggalInsert,
        "No. Registrasi": item.no_reg || "",
        "No. Inventaris": item.no_inv || "",
        "Nama Benda": item.nama_benda || "",
        "Kategori": item._kategori || item.kategori?.nama_kategori || "",
        "Bahan": item.bahan || "",
        "Kondisi": item._kondisi || item.kondisi || "",
        "Asal Koleksi": item.asal_koleksi || ""
      };
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    
    const sheetName = `${monthNames[parseInt(month)]} ${year}`;
    
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Column widths
    ws['!cols'] = [
      { wch: 5 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 30 },
      { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 20 }
    ];

    const filename = `Laporan_${monthNames[parseInt(month)]}_${year}.xlsx`;
    XLSX.writeFile(wb, filename);
    
    alert(`✅ Laporan ${monthNames[parseInt(month)]} ${year} berhasil diexport (${items.length} item)`);
  } catch (err) {
    console.error("Error exporting single month:", err);
    alert("❌ Gagal export: " + err.message);
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
        "No. Registrasi": item.no_reg || "",
        "No. Inventaris": item.no_inv || "",
        "Nama Benda": item.nama_benda || "",
        "Kategori": item._kategori || item.kategori?.nama_kategori || "",
        "Bahan": item.bahan || "",
        "Kondisi": item._kondisi || item.kondisi || "",
        "Asal Koleksi": item.asal_koleksi || "",
        "Rak": item.tempat_penyimpanan?.rak?.nama_rak || "-",
        "Tahap": item.tempat_penyimpanan?.tahap?.nama_tahap || "-"
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const colWidths = [
        { wch: 5 }, { wch: 15 }, { wch: 15 }, { wch: 30 },
        { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 20 },
        { wch: 15 }, { wch: 15 }
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(workbook, ws, gudangName.substring(0, 31)); // Excel sheet name max 31 chars
    });

    console.log(`Creating workbook with ${gudangs.length} sheets`);
    XLSX.writeFile(workbook, `Laporan_Per_Gudang_${new Date().toISOString().split('T')[0]}.xlsx`);
    console.log("File written successfully");
    alert(`✅ Laporan per gudang berhasil diexport (${gudangs.length} gudang)`);
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
        "No. Registrasi": item.no_reg || "",
        "No. Inventaris": item.no_inv || "",
        "Nama Benda": item.nama_benda || "",
        "Kategori": item._kategori || item.kategori?.nama_kategori || "",
        "Bahan": item.bahan || "",
        "Kondisi": item._kondisi || item.kondisi || "",
        "Asal Koleksi": item.asal_koleksi || "",
        "Gudang": item._gudang || item.gudang?.nama || "",
        "Rak": item.tempat_penyimpanan?.rak?.nama_rak || "-",
        "Tahap": item.tempat_penyimpanan?.tahap?.nama_tahap || "-"
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const colWidths = [
        { wch: 5 }, { wch: 15 }, { wch: 15 }, { wch: 30 },
        { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 20 },
        { wch: 15 }, { wch: 15 }, { wch: 15 }
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
// 10.5 EXPORT ALL GUDANG TO PDF
// ============================================
export async function exportAllGudangToPDF() {
  try {
    // Cek jsPDF library
    if (!window.jspdf) {
      alert("Library jsPDF belum dimuat. Silakan refresh halaman.");
      return;
    }

    const items = await fetchKoleksiWithFilters();

    if (items.length === 0) {
      alert("Tidak ada data untuk diexport");
      return;
    }

    // Import jsPDF dan autotable
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
      alert("Library jsPDF belum dimuat dengan benar. Silakan refresh halaman.");
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
    let isFirstPage = true;

    // Iterate setiap gudang
    Object.entries(groupedByGudang).forEach(([gudang, gudangItems]) => {
      // Tambah halaman jika bukan page pertama
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

      // Prepare table data
      const tableData = gudangItems.map((item, idx) => [
        idx + 1,
        item.no_reg || "-",
        item.no_inv || "-",
        item.nama_benda || "-",
        item._kategori || "-",
        item.bahan || "-",
        item._kondisi || "-",
        item.asal_koleksi || "-",
        item.tempat_penyimpanan?.rak?.nama_rak || "-",
        item.tempat_penyimpanan?.tahap?.nama_tahap || "-"
      ]);

      // Generate table dengan autoTable
      doc.autoTable({
        startY: 25,
        head: [['No', 'No. Reg', 'No. Inventaris', 'Nama Benda', 'Kategori', 'Bahan', 'Kondisi', 'Asal Koleksi', 'Rak', 'Tahap']],
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
          3: { cellWidth: 28 },
          4: { cellWidth: 15 },
          5: { cellWidth: 12 },
          6: { cellWidth: 12 },
          7: { cellWidth: 14 },
          8: { cellWidth: 12 },
          9: { cellWidth: 12 }
        }
      });
    });

    // Save
    const filename = `Laporan_Per_Gudang_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
    alert(`✅ Laporan PDF untuk ${Object.keys(groupedByGudang).length} gudang berhasil didownload`);

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
window.exportPerTanggalExcel = exportPerTanggalExcel;
window.exportAllGudangToExcel = exportAllGudangToExcel;
window.exportAllGudangToPDF = exportAllGudangToPDF;
