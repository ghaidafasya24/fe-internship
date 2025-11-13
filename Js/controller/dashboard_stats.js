import { API_KOLEKSI } from '../config/url_koleksi.js';

async function fetchJsonCount(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    // If API returns array or { data: [...]} or { results: [...] }
    if (Array.isArray(json)) return json.length;
    if (json.data && Array.isArray(json.data)) return json.data.length;
    if (json.results && Array.isArray(json.results)) return json.results.length;
    // if single object, count 1
    if (json && typeof json === 'object') return 1;
    return 0;
  } catch (err) {
    console.error('fetchJsonCount error for', url, err);
    return 0;
  }
}

export async function renderDashboardStats() {
  const elKoleksi = document.getElementById('statKoleksiCount');
  const elKategori = document.getElementById('statKategoriCount');
  const elWithImage = document.getElementById('statWithImageCount');
  if (!elKoleksi || !elKategori || !elWithImage) return;

  // Fetch koleksi list and kategori list in parallel
  try {
    const [koleksiRes, kategoriRes] = await Promise.all([
      fetch(API_KOLEKSI.GET_KOLEKSI),
      fetch(API_KOLEKSI.GET_KATEGORI)
    ]);

    const koleksiJson = koleksiRes.ok ? await koleksiRes.json() : null;
    const kategoriJson = kategoriRes.ok ? await kategoriRes.json() : null;

    // compute counts robustly
    const koleksiCount = Array.isArray(koleksiJson)
      ? koleksiJson.length
      : (koleksiJson && Array.isArray(koleksiJson.data) ? koleksiJson.data.length : (koleksiJson && Array.isArray(koleksiJson.results) ? koleksiJson.results.length : (koleksiJson && typeof koleksiJson === 'object' ? 1 : 0)));

    const kategoriCount = Array.isArray(kategoriJson)
      ? kategoriJson.length
      : (kategoriJson && Array.isArray(kategoriJson.data) ? kategoriJson.data.length : (kategoriJson && Array.isArray(kategoriJson.results) ? kategoriJson.results.length : (kategoriJson && typeof kategoriJson === 'object' ? 1 : 0)));

    // count koleksi that have images
    let withImageCount = 0;
    const koleksiArray = Array.isArray(koleksiJson) ? koleksiJson : (koleksiJson && koleksiJson.data ? koleksiJson.data : (koleksiJson && koleksiJson.results ? koleksiJson.results : []));
    if (Array.isArray(koleksiArray)) {
      withImageCount = koleksiArray.filter(it => it && (it.gambar || it.foto || it.image)).length;
    }

    elKoleksi.textContent = koleksiCount;
    elKategori.textContent = kategoriCount;
    elWithImage.textContent = withImageCount;
  } catch (err) {
    console.error('renderDashboardStats error:', err);
    elKoleksi.textContent = '-';
    elKategori.textContent = '-';
    elWithImage.textContent = '-';
  }
}

// run on load
window.addEventListener('DOMContentLoaded', () => {
  renderDashboardStats();
  // optional: refresh every 60s
  // setInterval(renderDashboardStats, 60000);
});

// expose for manual refresh
window.renderDashboardStats = renderDashboardStats;
