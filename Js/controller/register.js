import { fetchService } from '../Temp/Fetch.js';

// Tampilkan tahun otomatis di footer
document.getElementById('year').textContent = new Date().getFullYear();

// Toggle show/hide password
const toggle = document.getElementById('togglePwd');
const pwd = document.getElementById('password');
if (toggle && pwd) {
  toggle.addEventListener('click', () => {
    const isHidden = pwd.type === 'password';
    pwd.type = isHidden ? 'text' : 'password';
    toggle.textContent = isHidden ? 'Hide' : 'Show';
  });
}

// Submit form register
const form = document.getElementById('registerForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const phone = document.getElementById('phone_number').value.trim();
    const password = document.getElementById('password').value;

    if (username.length < 3) return alert('Username minimal 3 karakter');
    if (!/^[0-9+\-\s]{7,15}$/.test(phone)) return alert('Nomor HP tidak valid');
    if (password.length < 6) return alert('Password minimal 6 karakter');

    const userData = { username, phone_number: phone, password };

    try {
      const result = await fetchService.register(userData);
      alert('✅ Akun berhasil dibuat!\nSelamat datang, ' + result.username);
      window.location.href = './login.html';
    } catch (err) {
      alert('❌ Gagal mendaftar: ' + err.message);
    }
  });
}
