import { get } from "https://bukulapak.github.io/api/process.js";
import { addInner } from "https://bukulapak.github.io/element/process.js";
import { iniTabelKategori } from "../Temp/tabel_kategori.js";
import { API_URLS } from "../config/url_kategori.js";
import { deleteKategori } from "./kategori.js";
import { showAlert, showConfirm } from "../utils/modal.js";

console.log("[get_kategori] loaded, API_URLS:", API_URLS);

// Ambil data kategori
get(API_URLS.kategori, renderKategori);

// ===================== RENDER TABLE =====================
function renderKategori(response) {
  console.log("[get_kategori] RESPONSE DITERIMA:", response);

  const results = Array.isArray(response.data) ? response.data : [];

  const tbody = document.querySelector("#iniTabelKategori tbody");
  if (!tbody) return console.error("❌ Element tbody tidak ditemukan");

  tbody.innerHTML = "";

  if (results.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-primary/60">Tidak ada data kategori</td></tr>`;
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

  const tbody = document.querySelector("#iniTabelKategori tbody");
  tbody.insertAdjacentHTML("beforeend", rowHTML);
}

// ===================== DELETE HANDLER =====================
function attachDeleteHandlers() {
  document.querySelectorAll(".btn-delete").forEach(button => {
    if (button.dataset.bindedDelete) return;
    button.dataset.bindedDelete = true;

    button.addEventListener("click", async () => {
      const id = button.getAttribute("data-id");
      const confirmed = await showConfirm("Hapus kategori ini?");
      if (!confirmed) return;

      try {
        await deleteKategori(id);
        button.closest("tr").remove();
        showAlert("Kategori berhasil dihapus", "success");
      } catch (err) {
        showAlert("Gagal menghapus kategori", "error");
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
