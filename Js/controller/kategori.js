import { API_URLS } from '../config/url_kategori.js';

/**
 * Ambil semua kategori dari API
 */
export async function getAllKategori() {
  try {
    const response = await fetch(API_URLS.kategori);
    if (!response.ok) throw new Error(`Gagal mengambil kategori (${response.status})`);
    return await response.json();
  } catch (error) {
    console.error('❌ Error getAllKategori:', error);
    throw error;
  }
}

/**
 * Tambah kategori baru
 * @param {Object} kategoriData - { nama_kategori: "contoh" }
 */
export async function createKategori(kategoriData) {
  try {
    const response = await fetch(API_URLS.kategori, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(kategoriData),
    });
    if (!response.ok) throw new Error(`Gagal menambah kategori (${response.status})`);
    return await response.json();
  } catch (error) {
    console.error('❌ Error createKategori:', error);
    throw error;
  }
}

/**
 * Update kategori berdasarkan ID
 * @param {number|string} id 
 * @param {Object} kategoriData 
 */
export async function updateKategori(id, kategoriData) {
  try {
    const response = await fetch(`${API_URLS.kategori}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(kategoriData),
    });
    if (!response.ok) throw new Error(`Gagal update kategori (${response.status})`);
    return await response.json();
  } catch (error) {
    console.error('❌ Error updateKategori:', error);
    throw error;
  }
}

/**
 * Hapus kategori berdasarkan ID
 */
export async function deleteKategori(id) {
  try {
    const response = await fetch(`${API_URLS.kategori}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Gagal menghapus kategori (${response.status})`);
    return await response.json();
  } catch (error) {
    console.error('❌ Error deleteKategori:', error);
    throw error;
  }
}


// ========== HANDLE FORM SUBMIT ==========
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formKategori');
  const namaInput = document.getElementById('nama_kategori');
  const deskInput = document.getElementById('deskripsi');
  const modal = document.getElementById('modal');
  const closeModal = document.getElementById('closeModal');

  if (!form) return; // pastikan form ada

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nama = namaInput.value.trim();
    const deskripsi = deskInput.value.trim();

    if (!nama) return alert('Nama kategori tidak boleh kosong');
    if (!deskripsi) return alert('Deskripsi tidak boleh kosong');

    const data = { nama_kategori: nama, deskripsi };

    try {
      // jika modal memiliki dataset.editId maka lakukan update
      const editId = modal.dataset.editId;
      if (editId) {
        const updated = await updateKategori(editId, data);
        alert('✅ Kategori berhasil diperbarui');
        // perbarui baris di tabel jika ada
        const row = document.querySelector(`tr[data-row-id="${editId}"]`);
        if (row) {
          row.setAttribute('data-nama', data.nama_kategori);
          row.setAttribute('data-deskripsi', data.deskripsi);
          // update cell texts (No tetap sama)
          const cells = row.querySelectorAll('td');
          if (cells && cells.length >= 3) {
            cells[1].textContent = data.nama_kategori;
            cells[2].textContent = data.deskripsi;
          }
        }
        // clear edit state
        delete modal.dataset.editId;
      } else {
        const result = await createKategori(data);
        alert('✅ Kategori berhasil ditambahkan!');
        console.log('Kategori berhasil ditambahkan:', result);
      }

      // Tutup modal dan reset form
      form.reset();
      modal.classList.add('hidden');
    } catch (err) {
      alert('❌ Gagal menyimpan kategori: ' + (err.message || err));
    }
  });

  // Tutup modal
  if (closeModal) closeModal.addEventListener('click', () => modal.classList.add('hidden'));
});