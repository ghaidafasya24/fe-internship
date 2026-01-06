import { API_URLS } from '../config/url.js';

/**
 * Kelas untuk mengelola permintaan HTTP ke API
 */
class FetchService {
  /**
   * Melakukan request ke API dengan konfigurasi default
   * @param {string} url - URL endpoint
   * @param {object} options - Opsi fetch tambahan
   * @returns {Promise} Promise hasil fetch
   */
  async fetchWithConfig(url, options = {}) {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token')
          ? { Authorization: `Bearer ${localStorage.getItem('token')}` }
          : {}),
      },
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });

      // Coba parse JSON, atau tangani jika tidak bisa
      let data;
      try {
        data = await response.json();
      } catch {
        data = { message: 'Response tidak valid' };
      }

      if (!response.ok) {
        // Log detail error untuk debugging
        console.error('API Error Status:', response.status);
        console.error('API Error Response:', data);
        throw new Error(data.message || data.error || `Terjadi kesalahan pada server (${response.status})`);
      }

      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      throw new Error(error.message || 'Koneksi ke server gagal');
    }
  }

  /**
   * Register user baru
   * @param {object} userData - Data registrasi (username, password, phone_number)
   * @returns {Promise} Promise dengan data user baru
   */
  async register(userData) {
    try {
      const data = await this.fetchWithConfig(API_URLS.register, {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      // Jika backend mengembalikan token, simpan otomatis
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      return data;
    } catch (error) {
      throw new Error(error.message || 'Registrasi gagal');
    }
  }
}

// Export instance tunggal
export const fetchService = new FetchService();
export default fetchService;
