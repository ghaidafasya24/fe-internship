import { isiKoleksi, rowKoleksi } from "../Temp/tabel_koleksi.js";
import { API_KOLEKSI } from "../config/url_koleksi.js";

async function loadKoleksi() {
  const tableBody = document.getElementById("tableKoleksi");
  tableBody.innerHTML = isiKoleksi;

  try {
    const res = await fetch(API_KOLEKSI.GET_KOLEKSI);
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
