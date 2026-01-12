// Endpoint koleksi + kategori untuk dropdown
export const API_KOLEKSI = {
    GET_KOLEKSI: "https://inventorymuseum-de54c3e9b901.herokuapp.com/api/koleksi",
    ADD_KOLEKSI: "https://inventorymuseum-de54c3e9b901.herokuapp.com/api/koleksi",
    GET_KATEGORI: "https://inventorymuseum-de54c3e9b901.herokuapp.com/api/kategori"
};

// Backward-compatible named exports
export const KOLEKSI_URL = API_KOLEKSI.GET_KOLEKSI;
export const KATEGORI_URL = API_KOLEKSI.GET_KATEGORI;
