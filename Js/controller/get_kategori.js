import { get } from "https://bukulapak.github.io/api/process.js";
import { addInner } from "https://bukulapak.github.io/element/process.js";
import { iniTabelKategori } from "../Temp/tabel_kategori.js";
import { API_URLS } from "../config/url_kategori.js";
import { deleteKategori } from "./kategori.js";

console.log("[get_kategori] loaded, API_URLS:", API_URLS);

// Ambil data kategori
get(API_URLS.kategori, renderKategori);

// ===================== RENDER TABLE =====================
function renderKategori(response) {
  console.log("[get_kategori] RESPONSE DITERIMA:", response);

  const results = Array.isArray(response.data) ? response.data : [];

  const table = document.getElementById("iniTabelKategori");
  if (!table) return console.error("❌ Element #iniTabelKategori tidak ditemukan");

  while (table.rows.length > 0) table.deleteRow(0);

  if (results.length === 0) {
    addInner("iniTabelKategori",
      `<tr><td colspan="4" class="text-center py-3">Tidak ada data kategori</td></tr>`
    );
    return;
  }

  results.forEach((item, index) => renderRow(item, index));
  attachDeleteHandlers();
  attachEditHandlers();
}

// ===================== ROW TEMPLATE =====================
function renderRow(value, index) {
  const id = value._id || value.id;
  const nama = value.nama_kategori || "-";
  const deskripsi = value.deskripsi || "-";

  let rowHTML = iniTabelKategori
    .replace(/#ID#/g, id)
    .replace(/#No#/g, index + 1)
    .replace(/#Nama_Kategori#/g, nama)
    .replace(/#Deskripsi#/g, deskripsi);

  addInner("iniTabelKategori", rowHTML);
}

// ===================== DELETE HANDLER =====================
function attachDeleteHandlers() {
  document.querySelectorAll(".btn-delete").forEach(button => {
    if (button.dataset.bindedDelete) return;
    button.dataset.bindedDelete = true;

    button.addEventListener("click", async () => {
      const id = button.getAttribute("data-id");
      if (!confirm("Hapus kategori ini?")) return;

      try {
        await deleteKategori(id);
        button.closest("tr").remove();
        alert("Kategori berhasil dihapus");
      } catch (err) {
        alert("Gagal menghapus kategori");
      }
    });
  });
}

// ===================== EDIT HANDLER =====================
function attachEditHandlers() {
  document.querySelectorAll(".btn-edit").forEach(button => {
    if (button.dataset.bindedEdit) return;
    button.dataset.bindedEdit = true;

    button.addEventListener("click", () => {
      const row = button.closest("tr");

      const id = row.dataset.rowId = button.getAttribute("data-id");
      const nama = row.dataset.nama = row.children[1].innerText;
      const deskripsi = row.dataset.deskripsi = row.children[2].innerText;

      const modal = document.getElementById("modal");
      document.getElementById("nama_kategori").value = nama;
      document.getElementById("deskripsi").value = deskripsi;
      modal.dataset.editId = id;
      modal.classList.remove("hidden");
    });
  });
}
