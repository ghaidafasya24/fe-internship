// CRUD kategori (ambil, tambah, edit, hapus)
import { API_URLS } from "../config/url_kategori.js";
// import { authFetch, getToken } from "../utils/auth.js";
import { authFetch } from "../utils/auth.js";
import { showAlert } from "../utils/modal.js";
import { validateText, validateForm, showInputError, clearInputError } from "../utils/validation.js";

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



// Tambah kategori dengan validasi
async function createKategori() {
  try {
    const namaKategoriInput = document.getElementById("nama_kategori");
    const deskripsiInput = document.getElementById("deskripsi");

    // Validasi dengan escaping
    const namaResult = validateText(namaKategoriInput.value, {
      min: 3,
      max: 100,
      allowedPattern: /^[A-Za-z0-9\s.,()\-_'"/]+$/,
      allowedMessage: "Nama kategori hanya boleh huruf, angka, spasi, dan tanda baca umum",
    });
    if (!namaResult.valid) {
      showInputError(namaKategoriInput, namaResult.error);
      throw new Error(namaResult.error);
    } else {
      clearInputError(namaKategoriInput);
    }

    const deskResult = validateText(deskripsiInput.value, {
      min: 1,
      max: 500,
      required: false,
      allowedPattern: /^[A-Za-z0-9\s.,()\-_'"/]+$/,
      allowedMessage: "Deskripsi hanya boleh huruf, angka, spasi, dan tanda baca umum",
    });
    if (!deskResult.valid) {
      showInputError(deskripsiInput, deskResult.error);
      throw new Error(deskResult.error);
    } else {
      clearInputError(deskripsiInput);
    }

    const formData = new FormData();
    formData.append("nama_kategori", namaResult.value);
    formData.append("deskripsi", deskResult.value);

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


// Update kategori dengan validasi
export async function updateKategori(id) {
  const namaKategoriInput = document.getElementById("nama_kategori");
  const deskripsiInput = document.getElementById("deskripsi");

  // Validasi dengan escaping
  const namaResult = validateText(namaKategoriInput.value, {
    min: 3,
    max: 100,
    allowedPattern: /^[A-Za-z0-9\s.,()\-_'"/]+$/,
    allowedMessage: "Nama kategori hanya boleh huruf, angka, spasi, dan tanda baca umum",
  });
  if (!namaResult.valid) {
    showInputError(namaKategoriInput, namaResult.error);
    throw new Error(namaResult.error);
  } else {
    clearInputError(namaKategoriInput);
  }

  const deskResult = validateText(deskripsiInput.value, {
    min: 1,
    max: 500,
    required: false,
    allowedPattern: /^[A-Za-z0-9\s.,()\-_'"/]+$/,
    allowedMessage: "Deskripsi hanya boleh huruf, angka, spasi, dan tanda baca umum",
  });
  if (!deskResult.valid) {
    showInputError(deskripsiInput, deskResult.error);
    throw new Error(deskResult.error);
  } else {
    clearInputError(deskripsiInput);
  }

  const formData = new FormData();
  formData.append("nama_kategori", namaResult.value);
  formData.append("deskripsi", deskResult.value);

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



// Filter tabel kategori berdasarkan search input
function setupSearchFilter() {
  const searchInput = document.getElementById("searchKategori");
  const tableBody = document.querySelector("#iniTabelKategori tbody");

  if (!searchInput || !tableBody) return;

  searchInput.addEventListener("keyup", (e) => {
    const searchValue = e.target.value.toLowerCase().trim();
    const rows = tableBody.querySelectorAll("tr");

    rows.forEach((row) => {
      const namaKategori = row.getAttribute("data-nama")?.toLowerCase() || "";
      const deskripsi = row.getAttribute("data-deskripsi")?.toLowerCase() || "";

      // Tampilkan baris jika cocok dengan search, sembunyikan jika tidak
      const matches = namaKategori.includes(searchValue) || deskripsi.includes(searchValue);
      row.style.display = matches ? "" : "none";
    });

    // Tampilkan pesan jika tidak ada hasil
    const visibleRows = tableBody.querySelectorAll("tr:not([style*='display: none'])");
    let noResultsMsg = tableBody.querySelector(".no-results-msg");
    
    if (visibleRows.length === 0) {
      if (!noResultsMsg) {
        noResultsMsg = document.createElement("tr");
        noResultsMsg.className = "no-results-msg";
        noResultsMsg.innerHTML = `<td colspan="4" class="px-6 py-8 text-center text-primary/60">Tidak ada kategori yang sesuai dengan pencarian</td>`;
        tableBody.appendChild(noResultsMsg);
      }
    } else {
      if (noResultsMsg) noResultsMsg.remove();
    }
  });
}

// Handle form submission untuk tambah/edit kategori
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formKategori");
  const modal = document.getElementById("modal");
  const closeModal = document.getElementById("closeModal");
  const namaKategoriInput = document.getElementById("nama_kategori");
  const deskripsiInput = document.getElementById("deskripsi");

  if (!form) {
    console.warn("Form kategori tidak ditemukan");
    return;
  }

  // Real-time validation on blur
  if (namaKategoriInput) {
    namaKategoriInput.addEventListener("blur", () => {
      const result = validateText(namaKategoriInput.value, {
        min: 3,
        max: 100,
        allowedPattern: /^[A-Za-z0-9\s.,()\-_'"/]+$/,
        allowedMessage: "Nama kategori hanya boleh huruf, angka, spasi, dan tanda baca umum",
      });
      if (!result.valid) {
        showInputError(namaKategoriInput, result.error);
      } else {
        clearInputError(namaKategoriInput);
      }
    });
    namaKategoriInput.addEventListener("focus", () => {
      clearInputError(namaKategoriInput);
    });
  }

  if (deskripsiInput) {
    deskripsiInput.addEventListener("blur", () => {
      const result = validateText(deskripsiInput.value, {
        min: 1,
        max: 500,
        required: false,
        allowedPattern: /^[A-Za-z0-9\s.,()\-_'"/]+$/,
        allowedMessage: "Deskripsi hanya boleh huruf, angka, spasi, dan tanda baca umum",
      });
      if (!result.valid) {
        showInputError(deskripsiInput, result.error);
      } else {
        clearInputError(deskripsiInput);
      }
    });
    deskripsiInput.addEventListener("focus", () => {
      clearInputError(deskripsiInput);
    });
  }

  // Setup search filter
  setupSearchFilter();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validasi nama dengan escaping
    const namaResult = validateText(namaKategoriInput.value, {
      min: 3,
      max: 100,
      allowedPattern: /^[A-Za-z0-9\s.,()\-_'"/]+$/,
      allowedMessage: "Nama kategori hanya boleh huruf, angka, spasi, dan tanda baca umum",
    });
    if (!namaResult.valid) {
      showInputError(namaKategoriInput, namaResult.error);
      showAlert(namaResult.error, "warning");
      return;
    } else {
      clearInputError(namaKategoriInput);
    }

    // Validasi deskripsi
    const deskResult = validateText(deskripsiInput.value, {
      min: 1,
      max: 500,
      required: false,
      allowedPattern: /^[A-Za-z0-9\s.,()\-_'"/]+$/,
      allowedMessage: "Deskripsi hanya boleh huruf, angka, spasi, dan tanda baca umum",
    });
    if (!deskResult.valid) {
      showInputError(deskripsiInput, deskResult.error);
      showAlert(deskResult.error, "warning");
      return;
    } else {
      clearInputError(deskripsiInput);
    }

    const nama_kategori = namaResult.value;
    const deskripsi = deskResult.value;

    const editId = modal.dataset.editId;

    try {
      if (editId) {
        console.log("[kategori] EDIT MODE", editId);
        await updateKategori(editId);
        showAlert("📌 Kategori berhasil diperbarui", "success");
        delete modal.dataset.editId;
      } else {
        console.log("[kategori] CREATE MODE");
        await createKategori();
        showAlert("✅ Kategori berhasil ditambahkan!", "success");
      }

      form.reset();
      clearInputError(namaKategoriInput);
      clearInputError(deskripsiInput);
      modal.classList.add("hidden");

      // Reload tabel kategori
      setTimeout(() => location.reload(), 1500);

    } catch (error) {
      console.error("kategori form error:", error);
      showAlert("Error: " + error.message, "error");
    }
  });

  if (closeModal) closeModal.addEventListener("click", () => modal.classList.add("hidden"));
});
