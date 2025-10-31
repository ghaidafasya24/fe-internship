import { fetchService } from '../Temp/Fetch.js';

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

    // Validation with themed modals
    if (username.length < 3) {
      showResultModal(false, 
        'Username Terlalu Pendek! 📏',
        'Nama panggilan kamu minimal 3 karakter ya',
        'Coba Lagi'
      );
      return;
    }
    
    if (!/^[0-9+\-\s]{7,15}$/.test(phone)) {
      showResultModal(false,
        'Nomor HP Tidak Valid! 📱',
        'Pastikan nomor HP kamu sudah benar ya',
        'Perbaiki'
      );
      return;
    }
    
    if (password.length < 6) {
      showResultModal(false,
        'Password Terlalu Pendek! 🔑',
        'Demi keamanan, password minimal 6 karakter ya',
        'Mengerti'
      );
      return;
    }

    const userData = { username, phone_number: phone, password };

    try {
      const result = await fetchService.register(userData);
      showResultModal(true,
        '🎉 Selamat Bergabung!',
        `Hai ${username}, akun museum kamu sudah siap. Mari mulai petualangan budaya bersama!`,
        'Masuk Sekarang',
        () => window.location.href = './login.html'
      );
    } catch (err) {
      showResultModal(false,
        'Ups, Ada Masalah! 😅',
        err.message || 'Gagal membuat akun. Silakan coba lagi ya.',
        'Tutup'
      );
    }
  });
}
