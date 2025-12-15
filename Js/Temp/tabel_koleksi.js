// koleksi.js (atau tabel_koleksi.js yang kamu pakai)
import { BASE_URL } from "../utils/config.js";

// export { renderKoleksi };

// --- helper: buat string ukuran yang rapi ---
function formatUkuran(ukuran) {
  if (!ukuran || typeof ukuran !== "object") return "-";
  // pakai panjang_keseluruhan x lebar x tebal (tambah satuan cm jika perlu)
  const p = ukuran.panjang_keseluruhan || ukuran.panjang || "-";
  const l = ukuran.lebar || "-";
  const t = ukuran.tebal || ukuran.tinggi || "-";
  return `${p} x ${l} x ${t}`;
}

// --- buat satu row sesuai urutan <th> di HTML ---
export function rowKoleksi(index, item) {
  // pastikan akses ke field-field API yang kamu punya
  const nama = item.nama_benda || item.nama_koleksi || "-";
  const kategoriNama = item.kategori?.nama_kategori || "-";
  const noReg = item.no_reg || item.no_reg || "-";
  const noInv = item.no_inv || item.no_inventaris || "-";
  const bahan = item.bahan || "-";
  const ukuran = formatUkuran(item.ukuran);
  const kondisi = item.kondisi || "-";
  const tahun = item.tanggal_perolehan || item.tahun_perolehan || "-";
  const asal = item.asal_koleksi || item.asal || "-";
  const penyimpanan = item.tempat_penyimpanan || item.tempat || "-";
  const deskripsi = item.deskripsi || item.ket || "-";
  const foto = item.foto || item.gambar || "";

  return `
    <tr class="hover:bg-gray-50">
      <td class="px-4 py-3 border-b text-center">${index}</td>
      <td class="px-4 py-3 border-b">${nama}</td>
      <td class="px-4 py-3 border-b">${kategoriNama}</td>
      <td class="px-4 py-3 border-b">${noReg}</td>
      <td class="px-4 py-3 border-b">${noInv}</td>
      <td class="px-4 py-3 border-b">${bahan}</td>
      <td class="px-4 py-3 border-b">${ukuran}</td>
      <td class="px-4 py-3 border-b">${kondisi}</td>
      <td class="px-4 py-3 border-b">${tahun}</td>
      <td class="px-4 py-3 border-b">${asal}</td>
      <td class="px-4 py-3 border-b">${penyimpanan}</td>
      <td class="px-4 py-3 border-b">${deskripsi}</td>
      <td class="px-4 py-3 border-b text-center">
        ${foto ? `<img src="${foto}" alt="foto" class="h-16 w-16 object-cover rounded mx-auto">` : "-"}
      </td>
      <td class="px-4 py-3 border-b text-center">
        <button class="edit-btn bg-blue-500 text-white px-3 py-1 rounded mr-2" data-id="${item._id || item.id || ''}">Edit</button>
        <button class="hapus-btn bg-red-500 text-white px-3 py-1 rounded" data-id="${item._id || item.id || ''}">Hapus</button>
      </td>
    </tr>
  `;
}

// ======================= LOAD KOLEKSI =======================
export async function renderKoleksi() {
  const tableBody = document.getElementById("tableKoleksi");
  if (!tableBody) {
    console.error("❌ Element #tableKoleksi tidak ditemukan di HTML");
    return;
  }

  // bersihkan (jangan menulis header — header ada di HTML)
  tableBody.innerHTML = "";

  try {
    const res = await fetch(`${BASE_URL}/api/koleksi`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    const data = Array.isArray(json.data) ? json.data : (json || []).data || [];

    if (!data || data.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="14" class="text-center py-6">Tidak ada koleksi ditemukan</td>
        </tr>`;
      return;
    }

    // isi rows
    data.forEach((item, idx) => {
      tableBody.innerHTML += rowKoleksi(idx + 1, item);
    });

    // --- Event delegation untuk tombol Edit / Hapus ---
    // Pastikan hanya dipasang sekali; kalau renderKoleksi dipanggil ulang, event listener tetap sama karena kita attach ke tbody
    tableBody.addEventListener("click", async (ev) => {
      const target = ev.target;
      if (target.matches(".edit-btn")) {
        const id = target.getAttribute("data-id");
        // buka modal & isi data (implementasi edit modal ada di add-collection.js)
        // contoh: import function editKoleksi dari controller add-collection (atau panggil global)
        try {
          // fetch detail
          const r = await fetch(`${BASE_URL}/api/koleksi/${id}`);
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          const detail = await r.json();
          // jika add-collection.js mengekspor fungsi editKoleksi, kamu bisa import secara dinamis:
          const mod = await import("../controller/add-collection.js");
          if (mod.editKoleksi) mod.editKoleksi(detail.data || detail);
        } catch (err) {
          console.error("Gagal load data detail untuk edit:", err);
          alert("Gagal memuat data untuk edit");
        }
      } else if (target.matches(".hapus-btn")) {
        const id = target.getAttribute("data-id");
        if (!confirm("Yakin ingin menghapus koleksi ini?")) return;
        try {
          // Hapus butuh token → gunakan auth endpoint atau endpoint delete sesuai implementasi kamu
          const r = await fetch(`${BASE_URL}/api/koleksi/${id}`, { method: "DELETE" });
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          alert("Koleksi berhasil dihapus");
          // reload daftar
          renderKoleksi();
        } catch (err) {
          console.error("Gagal hapus koleksi:", err);
          alert("Gagal menghapus koleksi");
        }
      }
    }, { once: false });

  } catch (err) {
    console.error("🔥 Error renderKoleksi:", err);
    tableBody.innerHTML = `<tr><td colspan="14" class="text-center py-6">Gagal memuat data koleksi</td></tr>`;
  }
}

// auto-run when page loaded (jika kamu memanggil renderKoleksi hanya dari sini)
document.addEventListener("DOMContentLoaded", renderKoleksi);
