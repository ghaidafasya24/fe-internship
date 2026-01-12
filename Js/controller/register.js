// File register: handle form pendaftaran user baru
import { fetchService } from '../Temp/Fetch.js';
import { validateText, validatePassword, validateNumber, showInputError, clearInputError } from '../utils/validation.js';

// Show themed result modal
function showResultModal(success, title, message, buttonText = 'OK', onClose = null) {
  const modal = document.getElementById('resultModal');
  const card = document.getElementById('resultCard');
  const successIcon = document.getElementById('successIcon');
  const errorIcon = document.getElementById('errorIcon');
  const resultTitle = document.getElementById('resultTitle');
  const resultMessage = document.getElementById('resultMessage');
  const okButton = document.getElementById('okButtonText');
  const okBtn = document.getElementById('resultOkBtn');

  // Set content
  resultTitle.textContent = title;
  resultMessage.textContent = message;
  okButton.textContent = buttonText;
  
  // Show appropriate icon
  successIcon.classList.toggle('hidden', !success);
  errorIcon.classList.toggle('hidden', success);

  // Show modal with animation
  modal.classList.remove('hidden');
  setTimeout(() => {
    card.classList.remove('scale-95', 'opacity-0');
    card.classList.add('scale-100', 'opacity-100');
  }, 20);

  // Handle close button
  const closeModal = () => {
    card.classList.remove('scale-100', 'opacity-100');
    card.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
      modal.classList.add('hidden');
      if (onClose) onClose();
    }, 200);
  };

  okBtn.onclick = closeModal;
}

// Tampilkan tahun otomatis di footer
document.getElementById('year').textContent = new Date().getFullYear();

// Toggle show/hide password
const toggle = document.getElementById('togglePwd');
const pwd = document.getElementById('password');
if (toggle && pwd) {
  toggle.addEventListener('click', () => {
    const isHidden = pwd.type === 'password';
    pwd.type = isHidden ? 'text' : 'password';
    toggle.textContent = isHidden ? 'Sembunyikan' : 'Tampilkan';
  });
}

// Submit form register
const form = document.getElementById('registerForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usernameInput = document.getElementById('username');
    const phoneInput = document.getElementById('phone_number');
    const passwordInput = document.getElementById('password');

    const username = usernameInput.value;
    const phone = phoneInput.value;
    const password = passwordInput.value;

    // Validasi username dengan escaping
    const usernameResult = validateText(username, {
      min: 3,
      max: 50,
      allowedPattern: /^[a-z0-9._-]+$/,
      allowedMessage: "Username hanya boleh huruf kecil, angka, titik, underscore, atau minus",
    });
    if (!usernameResult.valid) {
      showInputError(usernameInput, usernameResult.error);
      showResultModal(false, 'Username Tidak Valid! ✍️', usernameResult.error, 'Perbaiki');
      return;
    } else {
      clearInputError(usernameInput);
    }

    // Extra safeguard: if input mengandung pola berbahaya, langsung tolak dengan pesan jelas
    if (usernameResult.error && usernameResult.error.includes('pola')) {
      showInputError(usernameInput, usernameResult.error);
      showResultModal(false, 'Input Berbahaya 🚫', usernameResult.error, 'Perbaiki');
      return;
    }

    const normalizedUsername = usernameResult.value.toLowerCase();
    if (usernameResult.value !== normalizedUsername) {
      showInputError(usernameInput, 'Username harus lowercase');
      showResultModal(false, 'Username Harus Lowercase', 'Gunakan huruf kecil semua tanpa huruf besar.', 'Perbaiki');
      return;
    }

    // Validasi nomor telepon
    const phoneResult = validateNumber(phone, { allowHyphen: false });
    if (!phoneResult.valid) {
      showInputError(phoneInput, phoneResult.error);
      showResultModal(false, 'Nomor HP Tidak Valid! 📱', phoneResult.error, 'Perbaiki');
      return;
    } else {
      clearInputError(phoneInput);
    }
    
    // Validasi password
    const passwordResult = validatePassword(password);
    if (!passwordResult.valid) {
      showInputError(passwordInput, passwordResult.error);
      showResultModal(false, 'Password Tidak Valid! 🔑', passwordResult.error, 'Perbaiki');
      return;
    } else {
      clearInputError(passwordInput);
    }

    // Tambahkan prefix +62 ke nomor telepon untuk disimpan di localStorage dan display
    const formattedPhoneForStorage = '+62' + phone;
    // Kirim ke API dengan format 62 (tanpa +)
    const userData = { username: normalizedUsername, phone_number: '62' + phone, password };

    try {
      // Log data yang akan dikirim untuk debugging
      console.log('Mengirim data registrasi:', userData);
      
      const result = await fetchService.register(userData);
      
      // Simpan username dan phone di localStorage (dengan format +62)
      localStorage.setItem("username", normalizedUsername);
      localStorage.setItem("phone", formattedPhoneForStorage);
      
      // Simpan token jika ada dari response
      if (result.token) {
        localStorage.setItem("token", result.token);
      }
      
      showResultModal(true,
        '🎉 Selamat Bergabung!',
        `Hai ${username}, akun museum kamu sudah siap. Mari mulai petualangan budaya bersama!`,
        'Masuk Sekarang',
        () => window.location.href = './login.html'
      );
    } catch (err) {
      console.error('Register error detail:', err);
      showResultModal(false,
        'Ups, Ada Masalah! 😅',
        err.message || 'Gagal membuat akun. Silakan coba lagi ya.',
        'Tutup'
      );
    }
  });
}
