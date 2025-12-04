import { get } from "https://bukulapak.github.io/api/process.js";
import { addInner } from "https://bukulapak.github.io/element/process.js";
import { isiKategori } from "../Temp/tabel_kategori.js";
import { API_URLS } from "../config/url_kategori.js";
import { deleteKategori } from "./kategori.js";

// Ambil data kategori dari API dan render
get(API_URLS.kategori, GetAllCategory);

function GetAllCategory(response) {
  const results = response.data || [];
  // Kosongkan tabel header terlebih dulu (hanya tbody rows kept in element)
  // addInner akan menambahkan ke elemen, jadi pastikan element ada
  const table = document.getElementById('iniTabelKategori');
  if (!table) return;
  // bersihkan isi (kecuali thead) — kita akan menambahkan baris ke element table
  // remove existing rows (keep the thead)
  while (table.rows.length > 1) table.deleteRow(1);

  results.forEach(isiRow);
  attachDeleteHandlersAndEdit();
}

function isiRow(value, index) {
  const id = value._id || value.id || value.nama_kategori || index;
  let content = isiKategori
    .replace(/#ID#/g, id)
    .replace(/#No#/g, index + 1)
    .replace(/#Nama_Kategori#/g, value.nama_kategori || "-")
    .replace(/#Deskripsi#/g, value.deskripsi || "-");

  addInner("iniTabelKategori", content);
}

// Event delegation for delete buttons
function attachDeleteHandlers() {
  const table = document.getElementById('iniTabelKategori');
  if (!table) return;

  table.querySelectorAll('.btn-delete').forEach(btn => {
    if ((btn.dataset && btn.dataset._hasHandler) || btn._hasHandler) return;
    btn.addEventListener('click', async (e) => {
      const id = btn.getAttribute('data-id');
      if (!id) return alert('ID kategori tidak ditemukan');
      if (!confirm('Yakin ingin menghapus kategori ini?')) return;
      try {
        await deleteKategori(id);
        // Hapus baris dari tabel
        const row = btn.closest('tr');
        if (row) row.remove();
        alert('Kategori berhasil dihapus');
      } catch (err) {
        alert('Gagal menghapus kategori: ' + (err.message || err));
      }
    });
    // mark handler attached
    btn._hasHandler = true;
  });
}

// Attach edit handlers: buka modal dan isi form untuk edit
function attachEditHandlers() {
  const table = document.getElementById('iniTabelKategori');
  if (!table) return;

  table.querySelectorAll('.btn-edit').forEach(btn => {
    if ((btn.dataset && btn.dataset._hasHandlerEdit) || btn._hasHandlerEdit) return;
    btn.addEventListener('click', (e) => {
      const id = btn.getAttribute('data-id');
      if (!id) return alert('ID kategori tidak ditemukan');

      // Cari row dan ambil data nama & deskripsi dari atribut data
      const row = btn.closest('tr');
      const nama = row ? row.getAttribute('data-nama') : '';
      const deskripsi = row ? row.getAttribute('data-deskripsi') : '';

      const modal = document.getElementById('modal');
      const namaInput = document.getElementById('nama_kategori');
      const deskInput = document.getElementById('deskripsi');
      if (!modal || !namaInput || !deskInput) return alert('Modal atau input tidak ditemukan');

      // isi form
      namaInput.value = nama || '';
      deskInput.value = deskripsi || '';

      // set edit id di modal dataset
      modal.dataset.editId = id;

      // ubah judul tombol/label jika mau (opsional)
      modal.classList.remove('hidden');
    });
    btn._hasHandlerEdit = true;
  });
}

// After rendering rows attach both handlers
function attachDeleteHandlersAndEdit() {
  attachDeleteHandlers();
  attachEditHandlers();
}


// import { get } from "";
// import { isiTabelKategori } from "../Temp/tabel_kategori.js";
// import { API_URLS } from "../config/url_kategori.js";

// // Ganti pemanggilan dan nama fungsi agar tidak bentrok
// get(API_URLS, tampilkanKategori);

// function tampilkanKategori(results) {
//     results.forEach(isiRow);
// }

// function isiRow(value) {
//     let content = 
//         isiTabelKategori
//             .replace("#Nama_Kategori#", value.nama_kategori)
//             .replace("#Deskripsi#", value.deskripsi);

//     addInner("iniTabelKategori", content);
// }
