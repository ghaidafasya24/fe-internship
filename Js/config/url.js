// API endpoint configurations
const API_BASE_URL = 'https://inventorymuseum-de54c3e9b901.herokuapp.com/api'; // Ganti dengan base URL API Anda

export const API_URLS = {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/users/register/`,
    // kategori: `${API_BASE_URL}/kategori`,
    // Tambahkan endpoint lain yang diperlukan di sini
};

export default API_URLS;