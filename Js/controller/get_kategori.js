import { get } from "https://bukulapak.github.io/api/process.js";
import { addInner } from "https://bukulapak.github.io/element/process.js";
import { isiKategori } from "../Temp/tabel_kategori.js";
import { API_URLS } from "../config/url_kategori.js";

// Ambil data kategori dari API
get(API_URLS.kategori, GetAllCategory);

function GetAllCategory(response) {
  // Ambil array 'data' dari response JSON
  const results = response.data;
  results.forEach(isiRow);
}

function isiRow(value, index) {
  let content = isiKategori
    .replace("#No#", index + 1)
    .replace("#Nama_Kategori#", value.nama_kategori || "-")
    .replace("#Deskripsi#", value.deskripsi || "-");

  addInner("iniTabelKategori", content);
}


// import { get } from "";
// import { isiTabelKategori } from "../Temp/tabel_kategori.js";
// import { API_URLS } from "../config/url_kategori.js";

// // Ganti pemanggilan dan nama fungsi agar tidak bentrok
// get(API_URLS, tampilkanKategori);

// function tampilkanKategori(results) {
//     results.forEach(isiRow);
// }

// function isiRow(value) {
//     let content = 
//         isiTabelKategori
//             .replace("#Nama_Kategori#", value.nama_kategori)
//             .replace("#Deskripsi#", value.deskripsi);

//     addInner("iniTabelKategori", content);
// }
