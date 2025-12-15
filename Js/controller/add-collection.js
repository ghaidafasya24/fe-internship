// ======================= IMPORT =======================
import { BASE_URL } from "../utils/config.js";
import { authFetch } from "../utils/auth.js";

// console.log("[DEBUG BODY]", data);

// ======================= PAGE INIT =======================
document.addEventListener("DOMContentLoaded", () => {
  console.log("[add-collection] DOM Loaded");
    loadKategori();
});

// ======================= LOAD KATEGORI =======================
async function loadKategori() {
  const selectKategori = document.getElementById("kategori");
  
  // Cek apakah element ada
  if (!selectKategori) {
    console.warn("[kategori] Element dropdown not found, retrying...");
    setTimeout(loadKategori, 500);
    return;
  }

  try {
    console.log("[kategori] Fetching from:", `${BASE_URL}/api/kategori`);
    const res = await fetch(`${BASE_URL}/api/kategori`)

    if (!res) {
      console.warn("[kategori] No response from authFetch");
      return;
    }

    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }

    const data = await res.json();
    console.log("[kategori] Data received:", data);

    selectKategori.innerHTML = `<option value="">-- Pilih Kategori --</option>`;
    
    // Cek apakah data array
    const items = Array.isArray(data) ? data : (data.data || []);
    
    if (items.length === 0) {
      console.warn("[kategori] No categories found");
      selectKategori.innerHTML += `<option disabled>Tidak ada kategori</option>`;
      return;
    }
    
    items.forEach((item) => {
      const option = document.createElement("option");
      option.value = item._id || item.id;
      option.textContent = item.nama_kategori || item.name || "Unknown";
      selectKategori.appendChild(option);
    });
    
    console.log("[kategori] Dropdown populated with", items.length, "items");

  } catch (error) {
    console.error("[kategori] Error:", error.message);
    selectKategori.innerHTML = `<option value="">-- Error: ${error.message} --</option>`;
  }
}

// ======================= FORM SUBMIT =======================
const formAdd = document.getElementById("addCollectionForm");

formAdd.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(formAdd);
  const data = Object.fromEntries(formData.entries());

  console.log("[ADD COLLECTION] Submitting data:", Object.keys(data));

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), 10000);

  try {
    console.log("[ADD COLLECTION] Calling authFetch to:", `${BASE_URL}/api/koleksi`);
    
    const response = await authFetch(`${BASE_URL}/api/koleksi`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: timeoutController.signal,
    });

    clearTimeout(timeoutId);

    // Check jika authFetch return null (redirect ke login)
    if (!response) {
      console.warn("[ADD COLLECTION] No response from authFetch - redirecting to login");
      return;
    }

    if (!response.ok) {
      const errMessage = await response.text();
      console.error("[ADD COLLECTION] Server returned error:", response.status, errMessage);
      throw new Error(errMessage || `Server error: ${response.status}`);
    }

    const result = await response.json();
    console.log("[ADD COLLECTION] ✅ Success:", result);

    Swal.fire({
      icon: "success",
      title: "Berhasil 🎉",
      text: "Koleksi berhasil ditambahkan!",
      timer: 2000,
      showConfirmButton: false,
    });

    formAdd.reset();
    // Close modal if exists
    const modal = document.getElementById("modal");
    if (modal) modal.classList.add("hidden");

  } catch (err) {
    clearTimeout(timeoutId);
    console.error("[ADD COLLECTION] ❌ Error:", err.message);

    if (err.name === "AbortError") {
      return Swal.fire({
        icon: "warning",
        title: "Timeout",
        text: "Server tidak merespon, coba lagi.",
      });
    }

    Swal.fire({
      icon: "error",
      title: "Gagal Menyimpan",
      text: err.message,
    });
  }
});
