// Halaman laporan: ekspor CSV/PDF dan render tabel koleksi lengkap
import { BASE_URL } from "../utils/config.js";
import { authFetch } from "../utils/auth.js";
import { showAlert } from "../utils/modal.js";

let allKoleksi = [];

const HEADERS = [
  "No",
  "Nama Benda",
  "No Reg",
  "No Inv",
  "Kategori",
  "Asal Koleksi",
  "Bahan",
  "Kondisi",
  "Tanggal Perolehan",
  "Deskripsi",
  "Panjang",
  "Lebar",
  "Tebal",
  "Tinggi",
  "Diameter",
  "Berat",
  "Satuan",
  "Gudang",
  "Rak",
  "Tahap"
];

// Normalisasi bentuk respons API menjadi array data
function normalizeResponse(resp) {
  if (!resp) return [];
  if (Array.isArray(resp)) return resp;
  if (Array.isArray(resp.data)) return resp.data;
  if (resp.data && Array.isArray(resp.data.data)) return resp.data.data;
  if (resp.data) return resp.data;
  return [];
}

// Render tabel laporan di DOM
function renderTable(list = []) {
  const tbody = document.getElementById("laporanBody");
  if (!tbody) return;
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-primary/60 py-6">Tidak ada data koleksi</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map((item, idx) => {
    const gudang = item.tempat_penyimpanan?.gudang?.nama_gudang || item.tempat_penyimpanan?.gudang?.name || "-";
    const rak = item.tempat_penyimpanan?.rak?.nama_rak || item.tempat_penyimpanan?.rak?.name || "-";
    const tahap = item.tempat_penyimpanan?.tahap?.nama_tahap || item.tempat_penyimpanan?.tahap?.name || "-";
    const kategori = item.kategori?.nama_kategori || "-";
    const asal = item.asal_koleksi || item.asal_perolehan || "-";
    const bahan = item.bahan || "-";
    const kondisi = item.kondisi || "-";
    // Format tanggal dengan validasi - hindari Invalid time value error
    const tgl = item.tanggal_perolehan ? (() => {
      try {
        const d = new Date(item.tanggal_perolehan);
        return d.getTime && isNaN(d.getTime()) ? "-" : d.toISOString().split('T')[0];
      } catch {
        return "-";
      }
    })() : "-";
    const desc = item.deskripsi || "-";
    const ukuran = item.ukuran || {};

    return `
      <tr class="hover:bg-primary/[0.02] ease-soft">
        <td class="px-6 py-4 text-center text-sm font-semibold text-primary/90">${idx + 1}</td>
        <td class="px-6 py-4 text-sm text-primary">${item.nama_benda || "-"}</td>
        <td class="px-6 py-4 text-sm text-primary/70">${item.no_reg || "-"}</td>
        <td class="px-6 py-4 text-sm text-primary/70">${item.no_inv || "-"}</td>
        <td class="px-6 py-4 text-sm text-primary/80">${kategori}</td>
        <td class="px-6 py-4 text-sm text-primary/70">${asal}</td>
        <td class="px-6 py-4 text-sm text-primary/70">${bahan}</td>
        <td class="px-6 py-4 text-sm text-primary/70">${kondisi}</td>
        <td class="px-6 py-4 text-sm text-primary/70">${tgl}</td>
        <td class="px-6 py-4 text-sm text-primary/70">${desc}</td>
        <td class="px-6 py-4 text-sm text-primary/70">${ukuran.panjang_keseluruhan || "-"}</td>
        <td class="px-6 py-4 text-sm text-primary/70">${ukuran.lebar || "-"}</td>
        <td class="px-6 py-4 text-sm text-primary/70">${ukuran.tebal || "-"}</td>
        <td class="px-6 py-4 text-sm text-primary/70">${ukuran.tinggi || item.tinggi || "-"}</td>
        <td class="px-6 py-4 text-sm text-primary/70">${ukuran.diameter || "-"}</td>
        <td class="px-6 py-4 text-sm text-primary/70">${ukuran.berat || item.berat || "-"}</td>
        <td class="px-6 py-4 text-sm text-primary/70">${ukuran.satuan || "cm"}</td>
        <td class="px-6 py-4 text-sm text-primary/80">${gudang}</td>
        <td class="px-6 py-4 text-sm text-primary/80">${rak}</td>
        <td class="px-6 py-4 text-sm text-primary/80">${tahap}</td>
      </tr>
    `;
  }).join("");
}

// Ekspor data ke CSV
function exportCSV() {
  if (!allKoleksi.length) {
    showAlert("Tidak ada data untuk diekspor", "warning");
    return;
  }

  const rows = [HEADERS.join(",")];
  allKoleksi.forEach((item, idx) => {
    const gudang = item.tempat_penyimpanan?.gudang?.nama_gudang || item.tempat_penyimpanan?.gudang?.name || "";
    const rak = item.tempat_penyimpanan?.rak?.nama_rak || item.tempat_penyimpanan?.rak?.name || "";
    const tahap = item.tempat_penyimpanan?.tahap?.nama_tahap || item.tempat_penyimpanan?.tahap?.name || "";
    const kategori = item.kategori?.nama_kategori || "";
    const asal = item.asal_koleksi || item.asal_perolehan || "";
    const bahan = item.bahan || "";
    const kondisi = item.kondisi || "";
    // Format tanggal dengan validasi - hindari Invalid time value error
    const tgl = item.tanggal_perolehan ? (() => {
      try {
        const d = new Date(item.tanggal_perolehan);
        return d.getTime && isNaN(d.getTime()) ? "" : d.toISOString().split('T')[0];
      } catch {
        return "";
      }
    })() : "";
    const desc = item.deskripsi || "";
    const ukuran = item.ukuran || {};

    const values = [
      idx + 1,
      item.nama_benda || "",
      item.no_reg || "",
      item.no_inv || "",
      kategori,
      asal,
      bahan,
      kondisi,
      tgl,
      desc,
      ukuran.panjang_keseluruhan || "",
      ukuran.lebar || "",
      ukuran.tebal || "",
      ukuran.tinggi || item.tinggi || "",
      ukuran.diameter || "",
      ukuran.berat || item.berat || "",
      ukuran.satuan || "cm",
      gudang,
      rak,
      tahap
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`);

    rows.push(values.join(","));
  });

  const csvContent = rows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "laporan-koleksi.csv";
  link.click();
  URL.revokeObjectURL(url);
}

// Ekspor data ke PDF (menggunakan jsPDF + autotable)
function exportPDF() {
  if (!allKoleksi.length) {
    showAlert("Tidak ada data untuk diekspor", "warning");
    return;
  }

  if (!window.jspdf || !window.jspdf.jsPDF) {
    showAlert("Library PDF belum dimuat", "error");
    return;
  }

  const doc = new window.jspdf.jsPDF('l', 'pt', 'a4');
  if (typeof doc.autoTable !== 'function') {
    showAlert("Library PDF belum siap", "error");
    return;
  }
  const body = allKoleksi.map((item, idx) => {
    const gudang = item.tempat_penyimpanan?.gudang?.nama_gudang || item.tempat_penyimpanan?.gudang?.name || "";
    const rak = item.tempat_penyimpanan?.rak?.nama_rak || item.tempat_penyimpanan?.rak?.name || "";
    const tahap = item.tempat_penyimpanan?.tahap?.nama_tahap || item.tempat_penyimpanan?.tahap?.name || "";
    const kategori = item.kategori?.nama_kategori || "";
    const asal = item.asal_koleksi || item.asal_perolehan || "";
    const bahan = item.bahan || "";
    const kondisi = item.kondisi || "";
    // Format tanggal dengan validasi - hindari Invalid time value error
    const tgl = item.tanggal_perolehan ? (() => {
      try {
        const d = new Date(item.tanggal_perolehan);
        return d.getTime && isNaN(d.getTime()) ? "" : d.toISOString().split('T')[0];
      } catch {
        return "";
      }
    })() : "";
    const desc = item.deskripsi || "";
    const ukuran = item.ukuran || {};

    return [
      idx + 1,
      item.nama_benda || "",
      item.no_reg || "",
      item.no_inv || "",
      kategori,
      asal,
      bahan,
      kondisi,
      tgl,
      desc,
      ukuran.panjang_keseluruhan || "",
      ukuran.lebar || "",
      ukuran.tebal || "",
      ukuran.tinggi || item.tinggi || "",
      ukuran.diameter || "",
      ukuran.berat || item.berat || "",
      ukuran.satuan || "cm",
      gudang,
      rak,
      tahap
    ];
  });

  doc.text("Laporan Koleksi - Museum Sri Baduga", 40, 30);
  doc.autoTable({
    head: [HEADERS],
    body,
    startY: 50,
    styles: { fontSize: 9, halign: 'left' },
    headStyles: { fillColor: [59, 110, 128], textColor: 255, halign: 'left' },
    alternateRowStyles: { fillColor: [245, 250, 252] }
  });

  doc.save('laporan-koleksi.pdf');
}

// Ambil data koleksi dan isi tabel
async function loadData() {
  try {
    const res = await authFetch(`${BASE_URL}/api/koleksi?populate=ukuran,kategori,tempat_penyimpanan`);
    allKoleksi = normalizeResponse(res);
    renderTable(allKoleksi);
  } catch (err) {
    console.error("Gagal memuat koleksi:", err);
    showAlert("Gagal memuat data koleksi", "error");
  }
}

// Pasang event listener tombol ekspor dan muat data
function init() {
  const btnExcel = document.getElementById("exportExcel");
  const btnPdf = document.getElementById("exportPdf");

  btnExcel?.addEventListener("click", exportCSV);
  btnPdf?.addEventListener("click", exportPDF);

  loadData();
}

document.addEventListener("DOMContentLoaded", init);
