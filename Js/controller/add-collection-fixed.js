// Form tambah/edit koleksi (varian fixed)
import { BASE_URL } from "../utils/config.js";
import { authFetch } from "../utils/auth.js";
import { validateText, validateDate, validateDecimal, escapeHTML, showInputError, clearInputError } from "../utils/validation.js";

document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 add-collection loaded");

  const form = document.getElementById("addCollectionForm");

  const kategoriSelect = document.getElementById("kategori");
  const gudangSelect = document.getElementById("gudang");
  const rakSelect = document.getElementById("rak");
  const tahapSelect = document.getElementById("tahap");

  const lokasiDisplay = document.getElementById("lokasi_display");
  const tempatInput = document.getElementById("tempat_penyimpanan");

  let isEdit = false;
  let editId = null;
  let oldGambar = null;  // Store old image for edit

  // Cek duplikasi nomor registrasi & inventaris
  async function checkDuplicateNumbers(noReg, noInv, ignoreId = null) {
    const res = await authFetch(`${BASE_URL}/api/koleksi`);
    const raw = res?.data ?? res;
    const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
    const normalizedReg = String(noReg || "").trim().toLowerCase();
    const normalizedInv = String(noInv || "").trim().toLowerCase();

    for (const item of list) {
      const id = item._id || item.id;
      if (ignoreId && id === ignoreId) continue;

      const itemReg = String(item.no_reg || "").trim().toLowerCase();
      if (normalizedReg && itemReg === normalizedReg) {
        return { exists: true, field: "no_reg" };
      }

      const itemInv = String(item.no_inv || "").trim().toLowerCase();
      if (normalizedInv && itemInv === normalizedInv) {
        return { exists: true, field: "no_inv" };
      }
    }

    return { exists: false };
  }

  /* ================= LOAD KATEGORI ================= */
  const kategoriRes = await authFetch(`${BASE_URL}/api/kategori`);
  const kategoriData = kategoriRes.data || kategoriRes;

  kategoriSelect.innerHTML = `<option value="">-- Pilih Kategori --</option>`;
  kategoriData.forEach(k => {
    kategoriSelect.innerHTML += `
      <option value="${k.id || k._id}">${k.nama_kategori}</option>
    `;
  });

  /* ================= LOAD GUDANG ================= */
  async function loadGudang() {
    const res = await authFetch(`${BASE_URL}/api/gudang`);
    const data = res.data || res;

    gudangSelect.innerHTML = `<option value="">-- Pilih Gudang --</option>`;
    rakSelect.innerHTML = `<option value="">-- Pilih Rak --</option>`;
    tahapSelect.innerHTML = `<option value="">-- Pilih Tahap --</option>`;

    data.forEach(g => {
      gudangSelect.innerHTML += `
        <option value="${g.id || g._id}">${g.nama_gudang}</option>
      `;
    });
  }

  await loadGudang();

  /* ================= GUDANG → RAK ================= */
  gudangSelect.addEventListener("change", async () => {
    const gudangId = gudangSelect.value;

    rakSelect.innerHTML = `<option value="">-- Pilih Rak --</option>`;
    tahapSelect.innerHTML = `<option value="">-- Pilih Tahap --</option>`;

    if (!gudangId) return;

    const res = await authFetch(`${BASE_URL}/api/rak?gudang_id=${gudangId}`);
    const data = res.data || res;

    data.forEach(r => {
      rakSelect.innerHTML += `
        <option value="${r.id || r._id}">${r.nama_rak}</option>
      `;
    });

    updateLokasi();
  });

  /* ================= RAK → TAHAP ================= */
  rakSelect.addEventListener("change", async () => {
    const rakId = rakSelect.value;

    tahapSelect.innerHTML = `<option value="">-- Pilih Tahap --</option>`;
    if (!rakId) return;

    const res = await authFetch(`${BASE_URL}/api/tahap?rak_id=${rakId}`);
    const data = res.data || res;

    data.forEach(t => {
      tahapSelect.innerHTML += `
        <option value="${t.id || t._id}">${t.nama_tahap}</option>
      `;
    });

    updateLokasi();
  });

  tahapSelect.addEventListener("change", updateLokasi);

  /* ================= EDIT KOLEKSI ================= */
  window.editKoleksi = async function(id) {
    try {
      // Fetch all collections and find the one with matching ID
      const res = await authFetch(`${BASE_URL}/api/koleksi?populate[]=ukuran&populate[]=kategori&populate[]=tempat_penyimpanan`);
      const allData = res.data || res;
      const data = Array.isArray(allData) ? allData.find(item => item._id === id) : (allData.data ? allData.data.find(item => item._id === id) : null);

      if (!data) {
        throw new Error("Koleksi tidak ditemukan");
      }

      // Populate form
      document.getElementById("nama_benda").value = data.nama_benda || "";
      document.getElementById("no_reg").value = data.no_reg || "";
      document.getElementById("no_inv").value = data.no_inv || "";
      document.getElementById("asal_perolehan").value = data.asal_koleksi || "";
      document.getElementById("bahan").value = data.bahan || "";
      document.getElementById("kondisi").value = data.kondisi || "";
      // Tanggal perolehan - handle invalid dates
      let tanggalValue = "";
      if (data.tanggal_perolehan) {
        try {
          const date = new Date(data.tanggal_perolehan);
          if (!isNaN(date.getTime())) {
            tanggalValue = date.toISOString().split('T')[0];
          }
        } catch (e) {
          console.warn("Invalid date format:", data.tanggal_perolehan);
        }
      }
      document.getElementById("tahun_perolehan").value = tanggalValue;
      document.getElementById("deskripsi").value = data.deskripsi || "";

      // Ukuran
      const ukuran = data.ukuran || {};
      console.log("Ukuran data:", ukuran);
      document.getElementById("panjang_keseluruhan").value = ukuran.panjang_keseluruhan || "";
      document.getElementById("lebar").value = ukuran.lebar || "";
      document.getElementById("tebal").value = ukuran.tebal || "";
      document.getElementById("tinggi").value = ukuran.tinggi || data.tinggi || "";
      document.getElementById("diameter").value = ukuran.diameter || "";
      document.getElementById("berat").value = ukuran.berat || data.berat || "";
      document.getElementById("satuan_ukuran").value = ukuran.satuan || ukuran.satuan_ukuran || "cm";
      const satuanBeratSelect = document.getElementById("satuan_berat");
      if (satuanBeratSelect) {
        satuanBeratSelect.value = ukuran.satuan_berat || ukuran.satuanBerat || "kg";
      }

      // Kategori
      kategoriSelect.value = data.kategori?.id || data.kategori?._id || "";

      // Gudang, Rak, Tahap
      const gudangId = data.tempat_penyimpanan?.gudang?.id || data.tempat_penyimpanan?.gudang?._id;
      const rakId = data.tempat_penyimpanan?.rak?.id || data.tempat_penyimpanan?.rak?._id;
      const tahapId = data.tempat_penyimpanan?.tahap?.id || data.tempat_penyimpanan?.tahap?._id;

      gudangSelect.value = gudangId || "";
      if (gudangId) {
        // Load rak for this gudang
        const resRak = await authFetch(`${BASE_URL}/api/rak?gudang_id=${gudangId}`);
        const rakData = resRak.data || resRak;
        rakSelect.innerHTML = `<option value="">-- Pilih Rak --</option>`;
        rakData.forEach(r => {
          rakSelect.innerHTML += `<option value="${r.id || r._id}">${r.nama_rak}</option>`;
        });
        rakSelect.value = rakId || "";
      }

      if (rakId) {
        // Load tahap for this rak
        const resTahap = await authFetch(`${BASE_URL}/api/tahap?rak_id=${rakId}`);
        const tahapData = resTahap.data || resTahap;
        tahapSelect.innerHTML = `<option value="">-- Pilih Tahap --</option>`;
        tahapData.forEach(t => {
          tahapSelect.innerHTML += `<option value="${t.id || t._id}">${t.nama_tahap}</option>`;
        });
        tahapSelect.value = tahapId || "";
      }

      updateLokasi();

      // Gambar - tampilkan jika ada dan simpan path lama
      const gambarField = data.gambar || data.foto || data.image;
      oldGambar = gambarField;  // Save old image path for later
      if (gambarField) {
        const gambarUrl = gambarField.startsWith('http') ? gambarField : `${BASE_URL}${gambarField}`;
        document.getElementById("preview").src = gambarUrl;
        document.getElementById("imagePreview").classList.remove("hidden");
      } else {
        document.getElementById("imagePreview").classList.add("hidden");
      }

      // Change modal title
      document.getElementById("modalTitle").textContent = "Edit Koleksi";
      document.getElementById("modal").classList.remove("hidden");

      isEdit = true;
      editId = id;

    } catch (err) {
      console.error("Error loading koleksi for edit:", err);
      Swal.fire("Error", "Gagal memuat data koleksi", "error");
    }
  };

  /* ================= LOKASI DISPLAY ================= */
  function updateLokasi() {
    const gudangText = gudangSelect.options[gudangSelect.selectedIndex]?.text || "-";
    const rakText = rakSelect.options[rakSelect.selectedIndex]?.text || "-";
    const tahapText = tahapSelect.options[tahapSelect.selectedIndex]?.text || "-";

    const lokasi = `${gudangText} / ${rakText} / ${tahapText}`;
    lokasiDisplay.textContent = lokasi;
    tempatInput.value = lokasi;
  }

  /* ================= SUBMIT ================= */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const kategori = kategoriSelect.value;
    const gudang = gudangSelect.value;
    const rak = rakSelect.value;
    const tahap = tahapSelect.value;
    const noRegInput = document.getElementById("no_reg");
    const namaBeInput = document.getElementById("nama_benda");
    const noInvInput = document.getElementById("no_inv");

    // Validasi nama benda dengan escaping
    const namaBeResult = validateText(namaBeInput.value, {
      min: 3,
      max: 200,
      allowedPattern: /^[A-Za-z0-9\s.,()\-_'"/]+$/,
      allowedMessage: "Nama hanya boleh huruf, angka, spasi, dan tanda baca umum",
    });
    if (!namaBeResult.valid) {
      showInputError(namaBeInput, namaBeResult.error);
      return;
    } else {
      clearInputError(namaBeInput);
    }

    // Validasi no registrasi dengan escaping
    const noRegResult = validateText(noRegInput.value, {
      min: 1,
      max: 50,
      allowedPattern: /^[A-Za-z0-9\s./_-]+$/,
      allowedMessage: "No. registrasi hanya boleh huruf, angka, spasi, titik, slash, underscore, atau minus",
    });
    if (!noRegResult.valid) {
      showInputError(noRegInput, noRegResult.error);
      return;
    } else {
      clearInputError(noRegInput);
    }

    // Validasi no inventaris
    const noInvResult = validateText(noInvInput.value, {
      min: 1,
      max: 50,
      allowedPattern: /^[A-Za-z0-9\s./_-]+$/,
      allowedMessage: "No. inventaris hanya boleh huruf, angka, spasi, titik, slash, underscore, atau minus",
    });
    if (!noInvResult.valid) {
      showInputError(noInvInput, noInvResult.error);
      return;
    } else {
      clearInputError(noInvInput);
    }

    // Pastikan nomor unik (abaikan id yang sedang diedit)
    const duplicateCheck = await checkDuplicateNumbers(
      noRegResult.value,
      noInvResult.value,
      isEdit ? editId : null
    );

    if (duplicateCheck.exists) {
      const msg = duplicateCheck.field === "no_reg"
        ? "Nomor registrasi sudah terdaftar"
        : "Nomor inventaris sudah terdaftar";

      const target = duplicateCheck.field === "no_reg" ? noRegInput : noInvInput;
      showInputError(target, msg);
      Swal.fire("Duplikasi", msg, "warning");
      return;
    }

    if (!kategori) {
      Swal.fire("Error", "Kategori wajib dipilih", "error");
      return;
    }

    // Build ukuran with canonical + alias keys for best compatibility
    const unitUkuran = document.getElementById("satuan_ukuran").value || null;
    const unitBeratEl = document.getElementById("satuan_berat");
    const unitBerat = unitBeratEl ? (unitBeratEl.value || null) : null;
    
    // Validasi ukuran fields
    const panjangInput = document.getElementById("panjang_keseluruhan");
    const lebarInput = document.getElementById("lebar");
    const tinggiInput = document.getElementById("tinggi");
    const beratInput = document.getElementById("berat");

    if (panjangInput.value) {
      const panjangResult = validateDecimal(panjangInput.value, { min: 0, max: 9999, decimals: 2, required: false });
      if (!panjangResult.valid) {
        showInputError(panjangInput, panjangResult.error);
        return;
      } else {
        clearInputError(panjangInput);
      }
    }

    if (lebarInput.value) {
      const lebarResult = validateDecimal(lebarInput.value, { min: 0, max: 9999, decimals: 2, required: false });
      if (!lebarResult.valid) {
        showInputError(lebarInput, lebarResult.error);
        return;
      } else {
        clearInputError(lebarInput);
      }
    }

    if (tinggiInput.value) {
      const tinggiResult = validateDecimal(tinggiInput.value, { min: 0, max: 9999, decimals: 2, required: false });
      if (!tinggiResult.valid) {
        showInputError(tinggiInput, tinggiResult.error);
        return;
      } else {
        clearInputError(tinggiInput);
      }
    }

    if (beratInput.value) {
      const beratResult = validateDecimal(beratInput.value, { min: 0, max: 9999, decimals: 2, required: false });
      if (!beratResult.valid) {
        showInputError(beratInput, beratResult.error);
        return;
      } else {
        clearInputError(beratInput);
      }
    }

    const ukuran = {
      panjang_keseluruhan: document.getElementById("panjang_keseluruhan").value || null,
      lebar: document.getElementById("lebar").value || null,
      tebal: document.getElementById("tebal").value || null,
      tinggi: document.getElementById("tinggi").value || null,
      diameter: document.getElementById("diameter").value || null,
      berat: document.getElementById("berat").value || null,
      // length units
      satuan: unitUkuran,
      satuan_ukuran: unitUkuran,
      // weight units
      satuan_berat: unitBerat,
      satuanBerat: unitBerat,
    };

    document.getElementById("json").value = JSON.stringify(ukuran);

    const formData = new FormData(form);
    formData.set("kategori_id", kategori);
    formData.set("gudang_id", gudang);
    formData.set("rak_id", rak);
    formData.set("tahap_id", tahap);
    formData.set("no_reg", noRegResult.value);
    formData.set("no_inv", noInvResult.value);

    // Set ukuran fields explicitly (including both unit key variants)
    [
      "panjang_keseluruhan","lebar","tebal","tinggi","diameter","berat","satuan","satuan_ukuran","satuan_berat","satuanBerat"
    ].forEach(key => {
      if (ukuran[key] !== null && ukuran[key] !== "") {
        formData.set(key, ukuran[key]);
      }
    });

    // Keep nested ukuran JSON for any backend that reads the object form
    formData.set("ukuran", JSON.stringify(ukuran));

    // Ensure deskripsi is sent
    const deskripsi = document.getElementById("deskripsi")?.value || "";
    if (deskripsi) formData.set("deskripsi", deskripsi);

    // Handle gambar - keep old image if no new file selected (edit mode)
    const fileInput = document.querySelector('input[name="gambar"]');
    if (isEdit && fileInput && (!fileInput.files || fileInput.files.length === 0) && oldGambar) {
      // No new file selected in edit mode, keep old image path
      formData.set("gambar", oldGambar);
      console.log("Using old gambar:", oldGambar);
    }

    console.log("📤 DATA DIKIRIM:");
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    try {
      let response;
      if (isEdit) {
        response = await authFetch(`${BASE_URL}/api/koleksi/${editId}`, {
          method: "PUT",
          body: formData,
        });
      } else {
        response = await authFetch(`${BASE_URL}/api/koleksi`, {
          method: "POST",
          body: formData,
        });
      }

      Swal.fire("Berhasil 🎉", isEdit ? "Koleksi berhasil diupdate" : "Koleksi berhasil ditambahkan", "success");

      // Immediately refresh list so new data appears without manual reload
      if (window.reloadKoleksiData) {
        window.reloadKoleksiData();
      } else if (window.loadKoleksi) {
        window.loadKoleksi();
      } else if (window.renderKoleksi) {
        window.renderKoleksi();
      }

      form.reset();
      updateLokasi();
      document.getElementById("modal").classList.add("hidden");

      // Reset edit mode
      isEdit = false;
      editId = null;
      oldGambar = null;
      document.getElementById("modalTitle").textContent = "Tambah Koleksi";

    } catch (err) {
      Swal.fire("Gagal", err.message, "error");
    }
  });
});
