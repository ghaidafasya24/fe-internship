// Kumpulan endpoint API umum (auth, user)
const API_BASE_URL = 'https://inventorymuseum-de54c3e9b901.herokuapp.com/api';

export const API_URLS = {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/users/register/`,
    updateUsername: `${API_BASE_URL}/users/profile`,
    updatePhone: `${API_BASE_URL}/users/profile`,
    updatePassword: `${API_BASE_URL}/users/update-password`,
    getProfile: `${API_BASE_URL}/users/profile`,
    // kategori: `${API_BASE_URL}/kategori`,
    // Tambahkan endpoint lain yang diperlukan di sini
};

export default API_URLS;