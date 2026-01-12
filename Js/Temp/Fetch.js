import { API_URLS } from '../config/url.js';

// Mini wrapper fetch dengan header JSON + bearer token
class FetchService {
  // Request dengan header default + error handling ringan
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

      let data;
      try {
        data = await response.json();
      } catch {
        data = { message: 'Response tidak valid' };
      }

      if (!response.ok) {
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

  // Helper registrasi user + auto simpan token jika ada
  async register(userData) {
    try {
      const data = await this.fetchWithConfig(API_URLS.register, {
        method: 'POST',
        body: JSON.stringify(userData),
      });

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
