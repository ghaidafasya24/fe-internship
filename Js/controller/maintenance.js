// Modul Maintenance/Pemeliharaan - Schedule, Log History, dan Notifikasi
import { BASE_URL } from "../utils/config.js";
import { authFetch } from "../utils/auth.js";
import { showAlert } from "../utils/modal.js";
import { validateText, validateDate, escapeHTML } from "../utils/validation.js";
import { API_KOLEKSI } from "../config/url_koleksi.js";

// ============================================
// 1. LOAD DAN TAMPILKAN DAFTAR MAINTENANCE
// ============================================
export async function loadMaintenanceList() {
  const tableBody = document.getElementById("tableMaintenanceList");
  if (!tableBody) return;

  tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-gray-500">Loading...</td></tr>';

  try {
    // Fetch maintenance records dari koleksi yang memiliki maintenance log
    const res = await authFetch(`${API_KOLEKSI.GET_KOLEKSI}`);
    const koleksi = await res.json();
    const items = Array.isArray(koleksi) ? koleksi : (koleksi?.data ?? []);

    // Filter items yang memiliki maintenance log
    const maintenanceItems = items.filter(item => item.maintenance_log && item.maintenance_log.length > 0);

    if (maintenanceItems.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-gray-500">Tidak ada riwayat pemeliharaan</td></tr>';
      return;
    }

    tableBody.innerHTML = '';

    maintenanceItems.forEach((item, index) => {
      const latestMaintenance = item.maintenance_log[item.maintenance_log.length - 1];
      const nextSchedule = item.next_maintenance_date 
        ? new Date(item.next_maintenance_date).toLocaleDateString("id-ID")
        : "-";

      const kondisiColor = {
        "baik": "bg-green-100 text-green-800",
        "rusak": "bg-red-100 text-red-800",
        "perlu perbaikan": "bg-yellow-100 text-yellow-800"
      };
      const kondisiClass = kondisiColor[item.kondisi?.toLowerCase()] || "bg-gray-100 text-gray-800";

      const row = document.createElement("tr");
      row.className = "border-b hover:bg-gray-50";
      row.innerHTML = `
        <td class="px-4 py-3 text-sm font-medium text-gray-900">${index + 1}</td>
        <td class="px-4 py-3 text-sm text-gray-700">${escapeHTML(item.nama_koleksi || "-")}</td>
        <td class="px-4 py-3 text-sm">
          <span class="px-2 py-1 rounded text-xs font-semibold ${kondisiClass}">
            ${item.kondisi || "N/A"}
          </span>
        </td>
        <td class="px-4 py-3 text-sm text-gray-700">${escapeHTML(latestMaintenance.jenis_perawatan || "-")}</td>
        <td class="px-4 py-3 text-sm text-gray-700">${new Date(latestMaintenance.tanggal).toLocaleDateString("id-ID")}</td>
        <td class="px-4 py-3 text-sm text-gray-700">${nextSchedule}</td>
        <td class="px-4 py-3 text-sm space-x-2">
          <button onclick="viewMaintenanceDetail('${item._id || item.id}')" class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs font-semibold">
            Lihat
          </button>
          <button onclick="addMaintenanceLog('${item._id || item.id}')" class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs font-semibold">
            + Log
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });

  } catch (err) {
    console.error("Error loading maintenance list:", err);
    tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-red-500">Error loading data</td></tr>';
  }
}

// ============================================
// 2. LIHAT DETAIL MAINTENANCE HISTORY
// ============================================
export async function viewMaintenanceDetail(itemId) {
  try {
    const res = await authFetch(`${API_KOLEKSI.GET_KOLEKSI}/${itemId}`);
    const item = await res.json();

    if (!item.maintenance_log || item.maintenance_log.length === 0) {
      showAlert("Info", "Tidak ada riwayat pemeliharaan untuk item ini", "info");
      return;
    }

    // Build modal content
    let html = `
      <div class="space-y-4">
        <h3 class="text-lg font-bold text-gray-900">${escapeHTML(item.nama_koleksi || "Item")}</h3>
        <div class="text-sm text-gray-600 mb-4">
          <p>No. Registrasi: <span class="font-semibold">${escapeHTML(item.no_reg || "-")}</span></p>
          <p>Kondisi Saat Ini: <span class="font-semibold">${item.kondisi || "N/A"}</span></p>
        </div>
        <div class="border-t pt-4">
          <h4 class="font-semibold text-gray-800 mb-3">Riwayat Perawatan:</h4>
          <div class="space-y-3 max-h-96 overflow-y-auto">
    `;

    item.maintenance_log.forEach((log, idx) => {
      html += `
        <div class="bg-gray-50 p-3 rounded-lg border-l-4 border-primary">
          <div class="flex justify-between items-start">
            <div>
              <p class="font-semibold text-gray-900">${escapeHTML(log.jenis_perawatan || "Perawatan")}</p>
              <p class="text-xs text-gray-600 mt-1">${new Date(log.tanggal).toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <span class="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-semibold">${idx + 1}</span>
          </div>
          <p class="text-sm text-gray-700 mt-2">${escapeHTML(log.deskripsi || "")}</p>
          ${log.teknisi ? `<p class="text-xs text-gray-500 mt-1">Oleh: ${escapeHTML(log.teknisi)}</p>` : ""}
          ${log.biaya ? `<p class="text-sm text-gray-800 mt-1 font-semibold">Biaya: Rp ${parseInt(log.biaya).toLocaleString("id-ID")}</p>` : ""}
        </div>
      `;
    });

    html += `
          </div>
        </div>
      </div>
    `;

    // Tampilkan di modal
    Swal.fire({
      title: "Riwayat Pemeliharaan",
      html: html,
      width: "600px",
      confirmButtonText: "Tutup",
      confirmButtonColor: "#3b6e80"
    });

  } catch (err) {
    console.error("Error viewing maintenance detail:", err);
    showAlert("Error", "Gagal memuat detail pemeliharaan", "error");
  }
}

// ============================================
// 3. TAMBAH LOG PEMELIHARAAN BARU
// ============================================
export async function addMaintenanceLog(itemId) {
  try {
    // Fetch item detail dulu
    const res = await authFetch(`${API_KOLEKSI.GET_KOLEKSI}/${itemId}`);
    const item = await res.json();

    const { value: formData } = await Swal.fire({
      title: "Tambah Log Pemeliharaan",
      html: `
        <div class="text-left space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Item: ${escapeHTML(item.nama_koleksi || "")}</label>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Jenis Perawatan</label>
            <input id="swalJenisPerawatan" class="swal2-input w-full" placeholder="Contoh: Pembersihan, Restorasi, Pengecatan" required />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Tanggal</label>
            <input id="swalTanggal" type="date" class="swal2-input w-full" value="${new Date().toISOString().split('T')[0]}" required />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Deskripsi</label>
            <textarea id="swalDeskripsi" class="swal2-textarea w-full" placeholder="Detail perawatan yang dilakukan..." rows="4"></textarea>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Nama Teknisi</label>
            <input id="swalTeknisi" class="swal2-input w-full" placeholder="Nama teknisi/petugas" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Biaya Perawatan (Opsional)</label>
            <input id="swalBiaya" type="number" class="swal2-input w-full" placeholder="Rp" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Kondisi Setelah Perawatan</label>
            <select id="swalKondisi" class="swal2-input w-full" required>
              <option value="">-- Pilih Kondisi --</option>
              <option value="baik">Baik</option>
              <option value="rusak">Rusak</option>
              <option value="perlu perbaikan">Perlu Perbaikan</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Jadwalkan Perawatan Berikutnya</label>
            <input id="swalNextMaintenance" type="date" class="swal2-input w-full" />
          </div>
        </div>
      `,
      width: "600px",
      focusConfirm: false,
      preConfirm: () => {
        const jenisPerawatan = document.getElementById("swalJenisPerawatan").value.trim();
        const tanggal = document.getElementById("swalTanggal").value;
        const deskripsi = document.getElementById("swalDeskripsi").value.trim();
        const teknisi = document.getElementById("swalTeknisi").value.trim();
        const biaya = document.getElementById("swalBiaya").value || "0";
        const kondisi = document.getElementById("swalKondisi").value;
        const nextMaintenance = document.getElementById("swalNextMaintenance").value;

        if (!jenisPerawatan) {
          Swal.showValidationMessage("Jenis perawatan harus diisi!");
          return false;
        }
        if (!tanggal) {
          Swal.showValidationMessage("Tanggal harus diisi!");
          return false;
        }
        if (!kondisi) {
          Swal.showValidationMessage("Kondisi setelah perawatan harus dipilih!");
          return false;
        }

        return {
          jenisPerawatan,
          tanggal,
          deskripsi,
          teknisi,
          biaya,
          kondisi,
          nextMaintenance
        };
      },
      confirmButtonText: "Simpan",
      confirmButtonColor: "#3b6e80"
    });

    if (!formData) return;

    // Submit ke backend
    const newLog = {
      jenis_perawatan: formData.jenisPerawatan,
      tanggal: formData.tanggal,
      deskripsi: formData.deskripsi,
      teknisi: formData.teknisi,
      biaya: formData.biaya,
    };

    // Update item dengan kondisi baru dan tambah log
    const updatePayload = {
      ...item,
      maintenance_log: [
        ...(item.maintenance_log || []),
        newLog
      ],
      kondisi: formData.kondisi,
      next_maintenance_date: formData.nextMaintenance || null
    };

    const updateRes = await authFetch(`${API_KOLEKSI.GET_KOLEKSI}/${itemId}`, {
      method: "PUT",
      body: JSON.stringify(updatePayload)
    });

    if (updateRes.ok || updateRes.status === 200) {
      showAlert("Sukses", "Log pemeliharaan berhasil ditambahkan!", "success");
      loadMaintenanceList(); // Refresh list
    } else {
      showAlert("Error", "Gagal menyimpan log pemeliharaan", "error");
    }

  } catch (err) {
    console.error("Error adding maintenance log:", err);
    showAlert("Error", "Gagal menambah log pemeliharaan: " + err.message, "error");
  }
}

// ============================================
// 4. LIHAT NOTIFIKASI ITEMS YANG PERLU DIRAWAT
// ============================================
export async function loadMaintenanceNotifications() {
  const notifContainer = document.getElementById("maintenanceNotifications");
  if (!notifContainer) return;

  try {
    const res = await authFetch(`${API_KOLEKSI.GET_KOLEKSI}`);
    const koleksi = await res.json();
    const items = Array.isArray(koleksi) ? koleksi : (koleksi?.data ?? []);

    const today = new Date();
    const notificationItems = [];

    items.forEach(item => {
      // Cari item dengan kondisi rusak atau perlu perbaikan
      const kondisi = (item.kondisi || "").toLowerCase();
      const nextMaintDate = item.next_maintenance_date ? new Date(item.next_maintenance_date) : null;

      if (kondisi === "rusak" || kondisi === "perlu perbaikan" || (nextMaintDate && nextMaintDate <= today)) {
        notificationItems.push({
          item,
          priority: kondisi === "rusak" ? "high" : "medium",
          reason: kondisi === "rusak" ? "Kondisi Rusak" : (kondisi === "perlu perbaikan" ? "Perlu Perbaikan" : "Jadwal Perawatan Overdue")
        });
      }
    });

    if (notificationItems.length === 0) {
      notifContainer.innerHTML = '<div class="p-4 text-green-600 bg-green-50 rounded-lg text-center">✓ Semua item dalam kondisi baik</div>';
      return;
    }

    let html = '<div class="space-y-2">';

    notificationItems.forEach(notif => {
      const priorityColor = notif.priority === "high" ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200";
      const badgeColor = notif.priority === "high" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800";

      html += `
        <div class="p-3 border ${priorityColor} rounded-lg cursor-pointer hover:shadow-md transition" onclick="viewMaintenanceDetail('${notif.item._id || notif.item.id}')">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <p class="font-semibold text-gray-900 text-sm">${escapeHTML(notif.item.nama_koleksi || "Item")}</p>
              <p class="text-xs text-gray-600 mt-1">${escapeHTML(notif.reason)}</p>
            </div>
            <span class="text-xs font-semibold px-2 py-1 rounded ${badgeColor}">
              ${notif.priority === "high" ? "🔴 Mendesak" : "🟡 Segera"}
            </span>
          </div>
        </div>
      `;
    });

    html += '</div>';
    notifContainer.innerHTML = html;

  } catch (err) {
    console.error("Error loading maintenance notifications:", err);
    notifContainer.innerHTML = '<div class="p-4 text-red-600 bg-red-50 rounded-lg">Error loading notifications</div>';
  }
}

// ============================================
// 5. STATISTIK MAINTENANCE
// ============================================
export async function renderMaintenanceStats() {
  const elTotalItems = document.getElementById("statsMaintenanceTotalItems");
  const elItemsDirawat = document.getElementById("statsMaintenanceItemsDirawat");
  const elItemsNeedAttention = document.getElementById("statsMaintenanceItemsNeedAttention");
  const elTotalCost = document.getElementById("statsMaintenanceTotalCost");

  if (!elTotalItems || !elItemsDirawat || !elItemsNeedAttention || !elTotalCost) return;

  try {
    const res = await authFetch(`${API_KOLEKSI.GET_KOLEKSI}`);
    const koleksi = await res.json();
    const items = Array.isArray(koleksi) ? koleksi : (koleksi?.data ?? []);

    let totalItems = items.length;
    let itemsDirawat = items.filter(i => i.maintenance_log && i.maintenance_log.length > 0).length;
    let itemsNeedAttention = items.filter(i => {
      const k = (i.kondisi || "").toLowerCase();
      return k === "rusak" || k === "perlu perbaikan";
    }).length;

    let totalCost = 0;
    items.forEach(item => {
      if (item.maintenance_log && Array.isArray(item.maintenance_log)) {
        item.maintenance_log.forEach(log => {
          totalCost += parseInt(log.biaya || 0);
        });
      }
    });

    const formatter = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    });

    elTotalItems.textContent = totalItems;
    elItemsDirawat.textContent = itemsDirawat;
    elItemsNeedAttention.textContent = itemsNeedAttention;
    elTotalCost.textContent = formatter.format(totalCost);

  } catch (err) {
    console.error("Error rendering maintenance stats:", err);
  }
}

// ============================================
// AUTO LOAD
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  renderMaintenanceStats();
  loadMaintenanceNotifications();
  loadMaintenanceList();
});
