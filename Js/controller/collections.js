import { rowKoleksi } from "../Temp/tabel_koleksi_updated.js";
import { API_KOLEKSI } from "../config/url_koleksi.js";



async function loadKoleksi() {
  const tableBody = document.getElementById("tableKoleksi");
  tableBody.innerHTML = isiKoleksi;

  try {
   const res = await authFetch(`${API_KOLEKSI.GET_KOLEKSI}?populate=ukuran`, { method: "GET" });
    const result = await res.json();

    if (!result.data) {
      console.warn("Tidak ada data koleksi ditemukan");
      return;
    }
    result.data.forEach((item, index) => {
      tableBody.innerHTML += rowKoleksi(index + 1, item);
    });

  } catch (err) {
    console.error("Error saat load koleksi:", err);
  }
}
document.addEventListener("DOMContentLoaded", loadKoleksi);

