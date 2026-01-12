// Dashboard Analytics - Statistik Kondisi, Nilai Koleksi, dan Distribusi
import { BASE_URL } from "../utils/config.js";
import { authFetch } from "../utils/auth.js";
import { API_KOLEKSI } from "../config/url_koleksi.js";

// Fetch semua data koleksi dengan detail lengkap
async function fetchAllKoleksi() {
  try {
    const result = await authFetch(`${API_KOLEKSI.GET_KOLEKSI}?populate=kategori,gudang,ukuran`);
    console.log("API Response:", result);
    
    const data = Array.isArray(result) ? result : (result?.data ?? []);
    console.log("Parsed koleksi data:", data);
    
    // Log sample item untuk debug
    if (data.length > 0) {
      console.log("Sample item:", data[0]);
      console.log("Sample kondisi field:", data[0]?.kondisi);
    }
    
    return data;
  } catch (err) {
    console.error("Error fetch koleksi:", err);
    return [];
  }
}

// ============================================
// 1. STATISTIK KONDISI BARANG
// ============================================
export async function renderStatisticKondisi() {
  console.log("🔄 renderStatisticKondisi called");
  
  const elSangatBaik = document.getElementById("statsSangatBaik");
  const elBaik = document.getElementById("statsBaik");
  const elCukupBaik = document.getElementById("statsCukupBaik");
  const elKurangBaik = document.getElementById("statsKurangBaik");
  const elRusak = document.getElementById("statsRusak");
  const elRusakBerat = document.getElementById("statsRusakBerat");
  const elGantiRugi = document.getElementById("statsGantiRugi");
  const elTotal = document.getElementById("statsKondisiTotal");

  console.log("Elements found:", {
    elSangatBaik: !!elSangatBaik,
    elBaik: !!elBaik,
    elCukupBaik: !!elCukupBaik,
    elKurangBaik: !!elKurangBaik,
    elRusak: !!elRusak,
    elRusakBerat: !!elRusakBerat,
    elGantiRugi: !!elGantiRugi,
    elTotal: !!elTotal
  });

  if (!elSangatBaik || !elBaik || !elCukupBaik || !elKurangBaik || !elRusak || !elRusakBerat || !elGantiRugi || !elTotal) {
    console.error("❌ Beberapa element tidak ditemukan!");
    return;
  }

  try {
    const koleksi = await fetchAllKoleksi();
    console.log("✅ Total koleksi fetched:", koleksi.length);
    
    let sangatBaik = 0, baik = 0, cukupBaik = 0, kurangBaik = 0, rusak = 0, rusakBerat = 0, gantiRugi = 0;

    koleksi.forEach((item, index) => {
      const kondisi = (item.kondisi || "").toLowerCase().trim();
      if (index < 3) { // Log first 3 items only
        console.log(`Item ${index + 1} kondisi:`, item.kondisi, "→", kondisi);
      }
      if (kondisi === "sangat baik") sangatBaik++;
      else if (kondisi === "baik") baik++;
      else if (kondisi === "cukup baik") cukupBaik++;
      else if (kondisi === "kurang baik") kurangBaik++;
      else if (kondisi === "rusak") rusak++;
      else if (kondisi === "rusak berat") rusakBerat++;
      else if (kondisi === "ganti rugi") gantiRugi++;
    });

    const total = sangatBaik + baik + cukupBaik + kurangBaik + rusak + rusakBerat + gantiRugi;

    console.log("📊 Kondisi counts:", { sangatBaik, baik, cukupBaik, kurangBaik, rusak, rusakBerat, gantiRugi, total });

    elSangatBaik.textContent = sangatBaik;
    elBaik.textContent = baik;
    elCukupBaik.textContent = cukupBaik;
    elKurangBaik.textContent = kurangBaik;
    elRusak.textContent = rusak;
    elRusakBerat.textContent = rusakBerat;
    elGantiRugi.textContent = gantiRugi;
    elTotal.textContent = total;

    console.log("✅ Updated all kondisi elements");


    // Render persentase
    const pSangatBaik = total > 0 ? ((sangatBaik / total) * 100).toFixed(1) : 0;
    const pBaik = total > 0 ? ((baik / total) * 100).toFixed(1) : 0;
    const pCukupBaik = total > 0 ? ((cukupBaik / total) * 100).toFixed(1) : 0;
    const pKurangBaik = total > 0 ? ((kurangBaik / total) * 100).toFixed(1) : 0;
    const pRusak = total > 0 ? ((rusak / total) * 100).toFixed(1) : 0;
    const pRusakBerat = total > 0 ? ((rusakBerat / total) * 100).toFixed(1) : 0;
    const pGantiRugi = total > 0 ? ((gantiRugi / total) * 100).toFixed(1) : 0;

    const elPersentase = document.getElementById("statsKondisiPercentage");
    if (elPersentase) {
      elPersentase.innerHTML = `
        <div class="grid grid-cols-4 gap-3 text-sm text-gray-600">
          <div>Sangat Baik: <span class="font-semibold text-emerald-600">${pSangatBaik}%</span></div>
          <div>Baik: <span class="font-semibold text-green-600">${pBaik}%</span></div>
          <div>Cukup Baik: <span class="font-semibold text-lime-600">${pCukupBaik}%</span></div>
          <div>Kurang Baik: <span class="font-semibold text-yellow-600">${pKurangBaik}%</span></div>
          <div>Rusak: <span class="font-semibold text-orange-600">${pRusak}%</span></div>
          <div>Rusak Berat: <span class="font-semibold text-red-600">${pRusakBerat}%</span></div>
          <div>Ganti Rugi: <span class="font-semibold text-gray-600">${pGantiRugi}%</span></div>
        </div>
      `;
    }

    // Render chart kondisi (simple bar chart)
    renderChartKondisi(sangatBaik, baik, cukupBaik, kurangBaik, rusak, rusakBerat, gantiRugi);

  } catch (err) {
    console.error("Error render statistic kondisi:", err);
    elSangatBaik.textContent = "-";
    elBaik.textContent = "-";
    elCukupBaik.textContent = "-";
    elKurangBaik.textContent = "-";
    elRusak.textContent = "-";
    elRusakBerat.textContent = "-";
    elGantiRugi.textContent = "-";
    elTotal.textContent = "-";
  }
}

// Render Chart Kondisi menggunakan Canvas
function renderChartKondisi(sangatBaik, baik, cukupBaik, kurangBaik, rusak, rusakBerat, gantiRugi) {
  const canvas = document.getElementById("chartKondisi");
  if (!canvas) {
    console.error("Canvas chartKondisi tidak ditemukan");
    return;
  }

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const total = sangatBaik + baik + cukupBaik + kurangBaik + rusak + rusakBerat + gantiRugi;
  console.log("Chart data:", { sangatBaik, baik, cukupBaik, kurangBaik, rusak, rusakBerat, gantiRugi, total });
  
  if (total === 0) {
    console.warn("Total kondisi = 0, chart tidak ditampilkan");
    // Tampilkan pesan no data
    ctx.fillStyle = "#6b7280";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Tidak ada data kondisi barang", canvas.width / 2, canvas.height / 2);
    return;
  }

  const barHeight = 40;
  const maxBarWidth = 480;
  const startX = 150;
  const startY = 20;
  const gap = 55;

  const data = [
    { label: "Sangat Baik", value: sangatBaik, color: "#10b981", bgColor: "#d1fae5" },
    { label: "Baik", value: baik, color: "#22c55e", bgColor: "#dcfce7" },
    { label: "Cukup Baik", value: cukupBaik, color: "#84cc16", bgColor: "#ecfccb" },
    { label: "Kurang Baik", value: kurangBaik, color: "#eab308", bgColor: "#fef9c3" },
    { label: "Rusak", value: rusak, color: "#f97316", bgColor: "#fed7aa" },
    { label: "Rusak Berat", value: rusakBerat, color: "#dc2626", bgColor: "#fee2e2" },
    { label: "Ganti Rugi", value: gantiRugi, color: "#6b7280", bgColor: "#e5e7eb" }
  ];

  data.forEach((item, index) => {
    const y = startY + (index * gap);
    const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
    const barWidth = total > 0 ? (item.value / total) * maxBarWidth : 0;

    // Background bar
    ctx.fillStyle = item.bgColor;
    ctx.fillRect(startX, y, maxBarWidth, barHeight);

    // Value bar
    if (barWidth > 0) {
      ctx.fillStyle = item.color;
      ctx.fillRect(startX, y, barWidth, barHeight);
    }

    // Border
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 1;
    ctx.strokeRect(startX, y, maxBarWidth, barHeight);

    // Label
    ctx.fillStyle = "#374151";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(item.label, startX - 10, y + 25);

    // Value and percentage
    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";
    if (barWidth > 60) {
      ctx.fillText(`${item.value} (${percentage}%)`, startX + 10, y + 25);
    } else {
      ctx.fillStyle = "#374151";
      ctx.fillText(`${item.value} (${percentage}%)`, startX + maxBarWidth + 10, y + 25);
    }
  });

  // Title
  ctx.fillStyle = "#111827";
  ctx.font = "bold 14px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Distribusi Kondisi Barang", 10, 12);
}

// ============================================
// 2. DISTRIBUSI KOLEKSI PER KATEGORI
// ============================================
export async function renderDistribusiKategori() {
  const elContainer = document.getElementById("chartDistribusiKategori");
  if (!elContainer) return;

  try {
    const koleksi = await fetchAllKoleksi();
    console.log("Distribusi Kategori - Total items:", koleksi.length);
    
    // Hitung per kategori
    const distribusi = {};
    koleksi.forEach((item, index) => {
      // Cek berbagai kemungkinan field kategori
      let kategori = "Unknown";
      
      if (item.kategori) {
        kategori = item.kategori.nama_kategori || item.kategori.nama || item.kategori.name || item.kategori;
      } else if (item.kategori_id) {
        kategori = item.kategori_id.nama_kategori || item.kategori_id.nama || item.kategori_id.name || item.kategori_id;
      }
      
      // Jika masih object, convert ke string
      if (typeof kategori === 'object' && kategori !== null) {
        kategori = JSON.stringify(kategori);
      }
      
      // Log first item untuk debug
      if (index === 0) {
        console.log("Sample kategori data:", item.kategori);
        console.log("Sample kategori_id data:", item.kategori_id);
        console.log("Resolved kategori:", kategori);
      }
      
      distribusi[kategori] = (distribusi[kategori] || 0) + 1;
    });
    
    console.log("Kategori distribusi:", distribusi);

    // Sort by count descending
    const sorted = Object.entries(distribusi).sort((a, b) => b[1] - a[1]);

    // Render table
    let html = `
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-100">
            <tr>
              <th class="text-left px-4 py-2 font-semibold text-gray-700">Kategori</th>
              <th class="text-right px-4 py-2 font-semibold text-gray-700">Jumlah</th>
              <th class="text-right px-4 py-2 font-semibold text-gray-700">Persentase</th>
            </tr>
          </thead>
          <tbody>
    `;

    const total = koleksi.length || 1;

    sorted.forEach(([kategori, count]) => {
      const percentage = ((count / total) * 100).toFixed(1);
      html += `
        <tr class="border-b hover:bg-gray-50">
          <td class="px-4 py-2 text-gray-800">${kategori}</td>
          <td class="px-4 py-2 text-right font-semibold text-primary">${count}</td>
          <td class="px-4 py-2 text-right">
            <span class="inline-block bg-primary/20 text-primary px-2 py-1 rounded text-xs font-semibold">${percentage}%</span>
          </td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    elContainer.innerHTML = html;

  } catch (err) {
    console.error("Error render distribusi kategori:", err);
    elContainer.innerHTML = "<p class='text-red-500'>Error loading data</p>";
  }
}

// ============================================
// 4. DISTRIBUSI KOLEKSI PER GUDANG
// ============================================
export async function renderDistribusiGudang() {
  const elContainer = document.getElementById("chartDistribusiGudang");
  if (!elContainer) return;

  try {
    const koleksi = await fetchAllKoleksi();
    console.log("Distribusi Gudang - Total items:", koleksi.length);
    
    // Hitung per gudang
    const distribusi = {};
    koleksi.forEach((item, index) => {
      // Prioritas: tempat_penyimpanan (gudang sebenarnya)
      let gudang = "Unknown";
      
      if (item.tempat_penyimpanan) {
        // Jika object, extract dan gabungkan gudang/rak/tahap
        if (typeof item.tempat_penyimpanan === 'object' && item.tempat_penyimpanan !== null) {
          const tp = item.tempat_penyimpanan;
          const namaGudang = tp.gudang?.nama_gudang || tp.gudang?.nama || '';
          const namaRak = tp.rak?.nama_rak || tp.rak?.nama || '';
          const namaTahap = tp.tahap?.nama_tahap || tp.tahap?.nama || '';
          
          // Gabungkan yang ada
          const parts = [namaGudang, namaRak, namaTahap].filter(Boolean);
          gudang = parts.length > 0 ? parts.join(' / ') : 'Unknown';
        } else {
          gudang = item.tempat_penyimpanan;
        }
      } else if (item.gudang) {
        gudang = item.gudang.nama || item.gudang.name || item.gudang;
      } else if (item.gudang_id) {
        gudang = item.gudang_id.nama || item.gudang_id.name || item.gudang_id;
      }
      
      // Log first item untuk debug
      if (index === 0) {
        console.log("Sample tempat_penyimpanan:", item.tempat_penyimpanan);
        console.log("Resolved gudang:", gudang);
      }
      
      distribusi[gudang] = (distribusi[gudang] || 0) + 1;
    });
    
    console.log("Gudang distribusi:", distribusi);

    // Sort by count descending
    const sorted = Object.entries(distribusi).sort((a, b) => b[1] - a[1]);

    // Render bar chart
    let html = `
      <div class="space-y-3">
    `;

    const total = koleksi.length || 1;
    const maxCount = Math.max(...sorted.map(([, count]) => count));

    sorted.forEach(([gudang, count]) => {
      const percentage = ((count / total) * 100).toFixed(1);
      const barWidth = (count / maxCount) * 100;

      html += `
        <div>
          <div class="flex justify-between mb-1">
            <span class="text-sm font-medium text-gray-700">${gudang}</span>
            <span class="text-sm font-semibold text-primary">${count} item</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-primary rounded-full h-2" style="width: ${barWidth}%"></div>
          </div>
        </div>
      `;
    });

    html += `
      </div>
    `;

    elContainer.innerHTML = html;

  } catch (err) {
    console.error("Error render distribusi gudang:", err);
    elContainer.innerHTML = "<p class='text-red-500'>Error loading data</p>";
  }
}

// ============================================
// 5. RENDER SEMUA STATISTIK
// ============================================
export async function renderAllAnalytics() {
  console.log("🚀 Loading all analytics...");
  await Promise.all([
    renderStatisticKondisi(),
    renderDistribusiKategori(),
    renderDistribusiGudang()
  ]);
  console.log("✅ Analytics loaded successfully");
}
