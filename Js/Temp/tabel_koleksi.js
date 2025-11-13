// /Js/TEMP/tabel_koleksi.js
import { API_KOLEKSI } from '../config/url_koleksi.js';

export async function renderKoleksi() {
  const tbody = document.getElementById('tableKoleksi');
  try {
  const res = await fetch(API_KOLEKSI.GET_KOLEKSI);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const data = Array.isArray(json) ? json : (json.data || json.results || []);

    tbody.innerHTML = '';

    data.forEach((item, i) => {
      const tr = document.createElement('tr');
      // normalize fields from API (some responses use different keys)
      const id = item._id || item.id || item._ID || '';
      const nama = item.nama_koleksi || item.nama_benda || item.nama || '-';
      const kategori = (item.kategori && (item.kategori.nama_kategori || item.kategori.nama_kategori)) || item.kategori || item.kategori_id || '-';
      const no_reg = item.no_registrasi || item.no_reg || item.no_registrasi || '-';
      const no_inv = item.no_inventaris || item.no_inv || '-';
      const bahan = item.bahan || '-';
      const ukuran = item.ukuran || '-';
      const tahun = item.tahun_perolehan || item.tahun || '-';
      const asal = item.asal_perolehan || item.asal || '-';
      const tempat = item.tempat_penyimpanan || item.tempat || '-';
  const deskripsi = item.deskripsi || item.ket || item.keterangan || '-';
  const MAX_DESC = 80;
  const shortDesc = (deskripsi && deskripsi.length > MAX_DESC) ? (deskripsi.slice(0, MAX_DESC) + '...') : deskripsi;
      const gambarSrc = item.gambar || item.foto || item.image || '';

      tr.innerHTML = `
        <td class="px-4 py-2 border-b">${i+1}</td>
        <td class="px-4 py-2 border-b">${nama}</td>
        <td class="px-4 py-2 border-b">${kategori}</td>
        <td class="px-4 py-2 border-b">${no_reg}</td>
        <td class="px-4 py-2 border-b">${no_inv}</td>
        <td class="px-4 py-2 border-b">${bahan}</td>
        <td class="px-4 py-2 border-b">${ukuran}</td>
        <td class="px-4 py-2 border-b">${tahun}</td>
        <td class="px-4 py-2 border-b">${asal}</td>
        <td class="px-4 py-2 border-b">${tempat}</td>
  <td class="px-4 py-2 border-b">${shortDesc}${deskripsi && deskripsi.length > MAX_DESC ? ` <button data-full="${encodeURIComponent(deskripsi)}" class="text-blue-600 underline btn-more">Lihat</button>` : ''}</td>
        <td class="px-4 py-2 border-b">${gambarSrc ? `<img src="${gambarSrc}" class="h-12 w-12 object-cover rounded"/>` : '-'}</td>
        <td class="px-4 py-2 border-b text-center">
          <button data-id="${id}" class="px-2 py-1 bg-yellow-500 text-white rounded mr-2 btn-edit">Edit</button>
          <button data-id="${id}" class="px-2 py-1 bg-red-500 text-white rounded btn-delete">Hapus</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // attach event listeners for dynamic buttons
    tbody.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = btn.getAttribute('data-id');
        if (!id) return alert('ID koleksi tidak tersedia');
        if (!confirm('Hapus koleksi ini?')) return;
        try {
          const delRes = await fetch(`${API_KOLEKSI.ADD_KOLEKSI}/${id}`, { method: 'DELETE' });
          if (!delRes.ok) throw new Error(`HTTP ${delRes.status}`);
          alert('Koleksi dihapus');
          renderKoleksi();
        } catch (err) {
          console.error('Gagal menghapus:', err);
          alert('Gagal menghapus koleksi');
        }
      });
    });

    tbody.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = btn.getAttribute('data-id');
        if (!id) return alert('ID koleksi tidak tersedia');
        
        // Fetch detail koleksi dari API
        try {
          const res = await fetch(`${API_KOLEKSI.ADD_KOLEKSI}/${id}`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const itemData = await res.json();
          
          // Import editKoleksi dari add-collection.js
          const { editKoleksi } = await import('../controller/add-collection.js');
          editKoleksi(itemData);
        } catch (err) {
          console.error('Gagal memuat data untuk edit:', err);
          alert('Gagal memuat data koleksi');
        }
      });
    });
      // more/detail buttons
      tbody.querySelectorAll('.btn-more').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const full = decodeURIComponent(btn.getAttribute('data-full') || '');
          showDetailModal(full);
        });
      });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="13" class="text-center py-4">Gagal memuat data koleksi</td></tr>`;
    console.error('renderKoleksi error:', err);
  }
}

// Jalankan saat import pertama kali
renderKoleksi();

// expose for other modules
window.renderKoleksi = renderKoleksi;

// show detail modal for long descriptions
function showDetailModal(fullText) {
  let modal = document.getElementById('koleksiDetailModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'koleksiDetailModal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
    modal.innerHTML = `
      <div class="bg-white rounded shadow-lg max-w-2xl w-full mx-4 p-4">
        <div class="flex justify-between items-start">
          <h3 class="text-lg font-semibold">Detail Deskripsi</h3>
          <button id="koleksiDetailClose" class="text-gray-600 hover:text-gray-800">&times;</button>
        </div>
        <div id="koleksiDetailContent" class="mt-3 text-sm text-gray-800 whitespace-pre-wrap"></div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#koleksiDetailClose').addEventListener('click', () => {
      modal.remove();
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }
  const content = modal.querySelector('#koleksiDetailContent');
  if (content) content.textContent = fullText || '-';
}
