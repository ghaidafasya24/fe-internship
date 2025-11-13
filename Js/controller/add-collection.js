// /Js/controller/add_collection.js
import { KOLEKSI_URL, KATEGORI_URL } from '../config/url_koleksi.js';
import { renderKoleksi } from '../Temp/tabel_koleksi.js';

const form = document.getElementById('addCollectionForm');
const imagePreviewDiv = document.getElementById('imagePreview');
const previewImg = document.getElementById('preview');
const kategoriSelect = document.getElementById('kategori');

// State untuk tracking apakah sedang edit atau add
let editingId = null;

// Log FormData untuk debugging (opsional, bisa dihapus nanti)
function logFormData(fd) {
  const entries = {};
  for (let [key, value] of fd.entries()) {
    entries[key] = value.name ? `[File: ${value.name}]` : value;
  }
  console.log('FormData fields:', entries);
}

// Load kategori dropdown
export async function loadKategori() {
  try {
    const res = await fetch(KATEGORI_URL);
    const data = (await res.json()).data || [];
    kategoriSelect.innerHTML = '<option value="">Pilih kategori</option>';
    data.forEach(k => {
      const opt = document.createElement('option');
      opt.value = k.id;
      opt.textContent = k.nama_kategori;
      kategoriSelect.appendChild(opt);
    });
  } catch (err) {
    kategoriSelect.innerHTML = '<option value="">Gagal memuat kategori</option>';
    console.error(err);
  }
}

// Form submit
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  
  // Log FormData sebelum dikirim (untuk debugging)
  logFormData(fd);

  // timeout helper
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15s

  try {
    // Tentukan URL dan method berdasarkan mode (add vs edit)
    const url = editingId ? `${KOLEKSI_URL}/${editingId}` : KOLEKSI_URL;
    const method = editingId ? 'PUT' : 'POST';
    
    const res = await fetch(url, { method, body: fd, signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      let bodyText = '';
      try { bodyText = await res.text(); } catch (e) { /* ignore */ }
      console.error('Server returned error:', res.status, res.statusText, bodyText);
      throw new Error(`Gagal simpan koleksi (status ${res.status}): ${bodyText}`);
    }

    const msgTipe = editingId ? 'diperbarui' : 'ditambahkan';
    alert(`Koleksi berhasil ${msgTipe}`);
    form.reset();
    imagePreviewDiv.classList.add('hidden');
    editingId = null;
    // Tutup form
    document.getElementById('modal').classList.add('hidden');
    renderKoleksi();

  } catch (err) {
    clearTimeout(timeout);
    // More detailed diagnostics for network errors
    console.error('add-collection error:', err, { name: err.name, message: err.message });
    if (err.name === 'AbortError') {
      alert('Request timeout: tidak dapat terhubung ke server. Coba lagi.');
    } else {
      alert(`Gagal simpan koleksi: ${err.message}`);
    }
  }
});

// Preview gambar
document.getElementById('foto').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    previewImg.src = ev.target.result;
    imagePreviewDiv.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
});

// Load kategori saat halaman dibuka
loadKategori();

// Expose function untuk edit koleksi
export async function editKoleksi(itemData) {
  editingId = itemData.id || itemData._id;
  
  // Isi form dengan data item
  document.getElementById('nama_benda').value = itemData.nama_benda || itemData.nama_koleksi || '';
  document.getElementById('kategori').value = itemData.kategori_id || itemData.kategori?._id || itemData.kategori?.id || '';
  document.getElementById('no_reg').value = itemData.no_reg || itemData.no_registrasi || '';
  document.getElementById('no_inv').value = itemData.no_inv || itemData.no_inventaris || '';
  document.getElementById('bahan').value = itemData.bahan || '';
  document.getElementById('ukuran').value = itemData.ukuran || '';
  document.getElementById('tahun_perolehan').value = itemData.tahun_perolehan || itemData.tahun || '';
  document.getElementById('asal_perolehan').value = itemData.asal_perolehan || itemData.asal || '';
  document.getElementById('tempat_penyimpanan').value = itemData.tempat_penyimpanan || itemData.tempat || '';
  document.getElementById('deskripsi').value = itemData.ket || itemData.deskripsi || '';
  
  // Tampilkan preview jika ada gambar
  if (itemData.foto || itemData.gambar || itemData.image) {
    previewImg.src = itemData.foto || itemData.gambar || itemData.image;
    imagePreviewDiv.classList.remove('hidden');
  }
  
  // Update judul dan button
  const modalTitle = document.querySelector('#modal h3') || document.querySelector('#modal > div > div:first-child h3');
  if (modalTitle) modalTitle.textContent = 'Edit Koleksi';
  
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.textContent = 'Perbarui Koleksi';
  
  // Buka modal
  document.getElementById('modal').classList.remove('hidden');
}

// Reset form mode ketika modal ditutup
document.getElementById('closeModal').addEventListener('click', () => {
  editingId = null;
  form.reset();
  imagePreviewDiv.classList.add('hidden');
  const modalTitle = document.querySelector('#modal h3') || document.querySelector('#modal > div > div:first-child h3');
  if (modalTitle) modalTitle.textContent = 'Tambah Koleksi';
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.textContent = 'Simpan Koleksi';
});
