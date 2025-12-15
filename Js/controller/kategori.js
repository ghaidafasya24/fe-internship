import { API_URLS } from "../config/url_kategori.js";
// import { authFetch, getToken } from "../utils/auth.js";
import { authFetch } from "../utils/auth.js";

// Ambil semua kategori
export async function getAllKategori() {
  try {
    const data = await authFetch(API_URLS.kategori);
    return data; // langsung return json
  } catch (error) {
    console.error("❌ Error getAllKategori:", error.message);
    throw error;
  }
}



// Tambah kategori
async function createKategori() {
  try {
    const namaKategori = document.getElementById("nama_kategori").value.trim();
    const deskripsi = document.getElementById("deskripsi").value.trim();

    if (!namaKategori) throw new Error("Nama kategori wajib diisi");

    const formData = new FormData();
    formData.append("nama_kategori", namaKategori);
    formData.append("deskripsi", deskripsi);

    const response = await authFetch(
      API_URLS.kategori,
      {
        method: "POST",
        body: formData
      }
    );

    console.log("Kategori berhasil dibuat:", response);
    return response;

  } catch (err) {
    console.error("❌ Error createKategori:", err);
    throw err;
  }
}


// Update kategori
export async function updateKategori(id) {
  const namaKategori = document.getElementById("nama_kategori").value.trim();
  const deskripsi = document.getElementById("deskripsi").value.trim();

  const formData = new FormData();
  formData.append("nama_kategori", namaKategori);
  formData.append("deskripsi", deskripsi);

  return await authFetch(`${API_URLS.kategori}/${id}`, {
    method: "PUT",
    body: formData   // ⬅️ pakai FormData
  });
}


// Hapus kategori
export async function deleteKategori(id) {
  try {
    await authFetch(`${API_URLS.kategori}/${id}`, {
      method: "DELETE",
    });

    return true; // cukup tanda sukses
  } catch (error) {
    console.error("❌ Error deleteKategori:", error.message);
    throw error;
  }
}



// Handle form submission untuk tambah/edit kategori
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formKategori");
  const modal = document.getElementById("modal");
  const closeModal = document.getElementById("closeModal");

  if (!form) {
    console.warn("Form kategori tidak ditemukan");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nama_kategori = document.getElementById("nama_kategori").value.trim();
    const deskripsi = document.getElementById("deskripsi").value.trim();

    const formData = {
      nama_kategori: nama_kategori,
      deskripsi: deskripsi
    };

    const editId = modal.dataset.editId;

    try {
      if (editId) {
        console.log("[kategori] EDIT MODE", editId);
        await updateKategori(editId);
        alert("📌 Kategori berhasil diperbarui");
        delete modal.dataset.editId;
      } else {
        console.log("[kategori] CREATE MODE");
        await createKategori();
        alert("✅ Kategori berhasil ditambahkan!");
      }

      form.reset();
      modal.classList.add("hidden");

      // Reload tabel kategori
      location.reload();

    } catch (error) {
      console.error("kategori form error:", error);
      alert("Error: " + error.message);
    }
  });

  if (closeModal) closeModal.addEventListener("click", () => modal.classList.add("hidden"));
});
