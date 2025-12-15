import { BASE_URL } from "../utils/config.js";

export{renderKoleksi};

export function rowKoleksi(index, item) {
  const ukuran = item.ukuran
    ? `${item.ukuran.panjang_keseluruhan || "-"} x ${item.ukuran.lebar || "-"} x ${item.ukuran.tebal || "-"} cm`
    : "-";

  return `
    <tr class="hover:bg-gray-100">
      <td class="px-4 py-2 border-b">${index}</td>
      <td class="px-4 py-2 border-b">${item.nama_benda || "-"}</td>
      <td class="px-4 py-2 border-b">${item.kategori?.nama_kategori || "-"}</td>
      <td class="px-4 py-2 border-b">${item.no_reg || "-"}</td>
      <td class="px-4 py-2 border-b">${item.no_inv || "-"}</td>
      <td class="px-4 py-2 border-b">${item.bahan || "-"}</td>
      <td class="px-4 py-2 border-b">${ukuran}</td>
      <td class="px-4 py-2 border-b">${item.kondisi || "-"}</td>
      <td class="px-4 py-2 border-b">${item.tanggal_perolehan || "-"}</td>
      <td class="px-4 py-2 border-b">${item.asal_koleksi || "-"}</td>
      <td class="px-4 py-2 border-b">${item.tempat_penyimpanan || "-"}</td>
      <td class="px-4 py-2 border-b">${item.deskripsi || "-"}</td>
      <td class="px-4 py-2 border-b text-center">
        ${
          item.foto
            ? `<img src="${item.foto}" alt="foto-koleksi" class="h-16 w-16 object-cover rounded-lg mx-auto" />`
            : "-"
        }
      </td>
      <td class="px-4 py-2 border-b text-center">
        <button class="edit-btn bg-blue-500 text-white px-3 py-1 rounded mr-2" data-id="${item._id}">Edit</button>
        <button class="hapus-btn bg-red-500 text-white px-3 py-1 rounded" data-id="${item._id}">Hapus</button>
      </td>
    </tr>
  `;
}

// ======================= LOAD KOLEKSI =======================
async function renderKoleksi() {
  const tableBody = document.getElementById("tableKoleksi");
  if (!tableBody) {
    console.error("❌ Element #tableKoleksi tidak ditemukan di HTML");
    return;
  }

  tableBody.innerHTML = ""; // bersihkan dulu

  console.log("[renderKoleksi] Fetching collections...");

  try {
    const response = await fetch(`${BASE_URL}/api/koleksi`);
    const result = await response.json();

    if (!result.data || result.data.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="14" class="text-center py-4">Tidak ada koleksi ditemukan</td>
        </tr>`;
      return;
    }

    result.data.forEach((item, i) => {
      tableBody.innerHTML += rowKoleksi(i + 1, item);
    });

  } catch (err) {
    console.error("🔥 Error renderKoleksi:", err.message);
  }
}

document.addEventListener("DOMContentLoaded", renderKoleksi);
