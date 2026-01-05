import { BASE_URL } from "../utils/config.js";
import { authFetch } from "../utils/auth.js";

// ================= HELPER =================
function formatUkuran(u) {
  if (!u) return "-";
  const row = (label, value, unit = "cm") => `
    <div class="grid grid-cols-[90px_1fr] gap-2">
      <span class="text-gray-500">${label}</span>
      <span class="text-gray-800 whitespace-nowrap">${value ? value + " " + unit : "-"}</span>
    </div>
  `;
  return `
    <div class="text-sm leading-relaxed space-y-1">
      ${row("Panjang", u.panjang_keseluruhan)}
      ${row("Lebar", u.lebar)}
      ${row("Tinggi", u.tinggi)}
      ${row("Tebal", u.tebal)}
      ${row("Diameter", u.diameter)}
      ${row("Berat", u.berat, "kg")}
    </div>
  `;
}

// ================= ROW =================
export function rowKoleksi(index, item) {
  const tempatPenyimpanan = `
    <div class="space-y-0.5 text-sm">
      <div>🏢 ${item.tempat_penyimpanan?.gudang?.nama_gudang || "-"}</div>
      <div>📦 ${item.tempat_penyimpanan?.rak?.nama_rak || "-"}</div>
      <div>📍 ${item.tempat_penyimpanan?.tahap?.nama_tahap || "-"}</div>
    </div>
  `;
  return `
    <tr class="hover:bg-gray-50 cursor-pointer koleksi-row" data-item='${JSON.stringify(item)}'>
      <td class="px-4 py-3 border-b text-center">${index}</td>
      <td class="px-4 py-3 border-b font-medium">${item.nama_benda || "-"}</td>
      <td class="px-4 py-3 border-b">${item.kategori?.nama_kategori || "-"}</td>
      <td class="px-4 py-3 border-b">${item.no_reg || "-"}</td>
      <td class="px-4 py-3 border-b">${item.no_inv || "-"}</td>
      <td class="px-4 py-3 border-b">${item.bahan || "-"}</td>
      <td class="px-4 py-3 border-b align-top text-center">${formatUkuran(item.ukuran)}</td>
      <td class="px-4 py-3 border-b">${item.kondisi || "-"}</td>
      <td class="px-4 py-3 border-b">${item.tanggal_perolehan || "-"}</td>
      <td class="px-4 py-3 border-b">${item.asal_koleksi || "-"}</td>
      <td class="px-4 py-3 border-b align-top whitespace-normal">${tempatPenyimpanan}</td>
      <td class="px-4 py-3 border-b max-w-xs">
        <p class="line-clamp-2 text-gray-600">${item.deskripsi || "-"}</p>
      </td>
      <td class="px-4 py-3 border-b text-center">
        ${item.foto ? `<img src="${item.foto}" class="h-14 w-14 rounded-lg object-cover mx-auto border">` : "-"}
      </td>
      <td class="px-4 py-3 border-b text-center">
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

// ================= RENDER KOLEKSI =================
export async function renderKoleksi() {
  const tbody = document.getElementById("tableKoleksi");
  if (!tbody) return;

  tbody.innerHTML = "";

  try {
    const res = await fetch(`${BASE_URL}/api/koleksi`);
    const json = await res.json();
    const items = json.data || [];

    items.forEach((item, i) => {
      tbody.innerHTML += rowKoleksi(i + 1, item);
    });

    // event klik row → modal detail
    tbody.querySelectorAll(".koleksi-row").forEach(row => {
      row.addEventListener("click", e => {
        if (e.target.tagName === "BUTTON") return;
        openModalDetail(JSON.parse(row.dataset.item));
      });
    });

    // Attach action listeners
    attachActionListeners();

  } catch (err) {
    console.error("Error fetch koleksi:", err);
  }
}

export { attachActionListeners };

// ================= MODAL DETAIL =================
function openModalDetail(item) {
  const modal = document.getElementById("detailModal");
  const content = document.getElementById("modalContent");
  if (!modal || !content) return;

  content.innerHTML = `
    <div><b>Nama</b><br>${item.nama_benda || "-"}</div>
    <div><b>Kategori</b><br>${item.kategori?.nama_kategori || "-"}</div>
    <div><b>Tempat Penyimpanan</b><br>
      ${item.tempat_penyimpanan?.gudang?.nama_gudang || "-"} /
      ${item.tempat_penyimpanan?.rak?.nama_rak || "-"} /
      ${item.tempat_penyimpanan?.tahap?.nama_tahap || "-"}
    </div>
    <div><b>Deskripsi</b><br>${item.deskripsi || "-"}</div>
    ${item.foto ? `<div><img src="${item.foto}" class="h-48 rounded-lg mx-auto"></div>` : ""}
  `;

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeModalDetail() {
  const modal = document.getElementById("detailModal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

// ================= ACTION LISTENERS =================
function attachActionListeners() {
  document.querySelectorAll('.detail-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const row = e.target.closest('tr');
      const item = JSON.parse(row.dataset.item);
      openModalDetail(item);
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
    renderKoleksi();
  } catch {
    alert("Gagal menghapus koleksi");
  }
}

// ================= DOM READY =================
document.addEventListener("DOMContentLoaded", () => {
  renderKoleksi();

  const closeDetailBtn = document.getElementById("closeDetailModal");
  const modalContent = document.getElementById("modalContent");
  const detailModal = document.getElementById("detailModal");

  if (closeDetailBtn) closeDetailBtn.addEventListener("click", closeModalDetail);
  if (modalContent) modalContent.addEventListener("click", e => e.stopPropagation());
  if (detailModal) detailModal.addEventListener("click", e => {
    if (e.target === detailModal) closeModalDetail();
  });
});
