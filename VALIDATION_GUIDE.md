/**
 * PANDUAN PENGGUNAAN VALIDASI INPUT
 * File: Js/utils/validation.js
 * 
 * Validasi ini mencegah:
 * - XSS (Cross-Site Scripting) - injeksi script
 * - SQL Injection - injeksi perintah database
 * - HTML Injection - injeksi tag HTML berbahaya
 * - Overflow attacks - input terlalu panjang
 */

// =====================================================
// 1. CONTOH BASIC: Escape HTML saat render
// =====================================================
import { escapeHTML } from './utils/validation.js';

// WRONG: Langsung append user input ke HTML
// element.innerHTML = userInput; // UNSAFE!

// CORRECT: Escape dulu
// element.textContent = escapeHTML(userInput); // SAFE!

// =====================================================
// 2. CONTOH: Validasi Single Input
// =====================================================
import { validateText, validateEmail, validatePassword } from './utils/validation.js';

// Validasi nama
const namaResult = validateText(inputValue, { min: 3, max: 100 });
if (!namaResult.valid) {
  console.log('Error:', namaResult.error); // "Minimal 3 karakter"
  showErrorMessage(namaResult.error);
} else {
  // Gunakan namaResult.value (sudah escaped)
  submitData({ nama: namaResult.value });
}

// Validasi email
const emailResult = validateEmail(userEmail);
if (!emailResult.valid) {
  console.log('Error:', emailResult.error);
} else {
  submitData({ email: emailResult.value });
}

// Validasi password
const pwResult = validatePassword(userPassword);
if (!pwResult.valid) {
  console.log('Error:', pwResult.error);
}

// =====================================================
// 3. CONTOH: Validasi Form Lengkap
// =====================================================
import { validateForm } from './utils/validation.js';

// Definisikan rules untuk setiap field
const validationRules = {
  nama: { type: 'text', options: { min: 3, max: 100 } },
  email: { type: 'email' },
  password: { type: 'password' },
  phone: { type: 'number', options: { digits: 10 } },
  tanggal_lahir: { type: 'date' },
  umur: { type: 'decimal', options: { min: 1, max: 150, decimals: 0 } },
  kategori_id: { type: 'select', options: { values: ['1', '2', '3'] } }
};

// Submit form
formElement.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Validasi semua field sekaligus
  const result = validateForm({
    nama: document.getElementById('nama').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
    phone: document.getElementById('phone').value,
    tanggal_lahir: document.getElementById('tanggal_lahir').value,
    umur: document.getElementById('umur').value,
    kategori_id: document.getElementById('kategori_id').value
  }, validationRules);

  if (!result.valid) {
    // Ada error
    console.log('Validation errors:', result.errors);
    // Display errors to user...
    return;
  }

  // Semua valid, gunakan result.sanitized
  console.log('Clean data:', result.sanitized);
  await submitData(result.sanitized);
});

// =====================================================
// 4. CONTOH: Visual Error Messaging
// =====================================================
import { showInputError, clearInputError } from './utils/validation.js';

const usernameInput = document.getElementById('username');

// Tampilkan error
showInputError(usernameInput, 'Username sudah terdaftar');

// Hapus error
clearInputError(usernameInput);

// =====================================================
// 5. CONTOH: Real-Time Validation on Blur
// =====================================================
import { attachInputValidation } from './utils/validation.js';

const emailInput = document.getElementById('email');
attachInputValidation(emailInput, 'email');

const passwordInput = document.getElementById('password');
attachInputValidation(passwordInput, 'password');

const phoneInput = document.getElementById('phone');
attachInputValidation(phoneInput, 'number', { digits: 10 });

// =====================================================
// 6. CONTOH IMPLEMENTASI DI FORM LOGIN
// =====================================================
/*
import { validateText, validatePassword, showInputError, clearInputError } from '../utils/validation.js';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');

  const username = usernameInput.value;
  const password = passwordInput.value;

  // Validasi username
  const usernameResult = validateText(username, { min: 3, max: 50 });
  if (!usernameResult.valid) {
    showInputError(usernameInput, usernameResult.error);
    return;
  } else {
    clearInputError(usernameInput);
  }

  // Validasi password
  const passwordResult = validatePassword(password);
  if (!passwordResult.valid) {
    showInputError(passwordInput, passwordResult.error);
    return;
  } else {
    clearInputError(passwordInput);
  }

  // Login dengan data yang sudah validated
  try {
    const response = await fetch('...', {
      method: 'POST',
      body: JSON.stringify({
        username: usernameResult.value,
        password: passwordResult.value
      })
    });
    // ...
  } catch (err) {
    console.error(err);
  }
});
*/

// =====================================================
// 7. CONTOH IMPLEMENTASI DI FORM TAMBAH KOLEKSI
// =====================================================
/*
import { validateForm, showInputError, clearInputError } from '../utils/validation.js';

document.getElementById('koleksiForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const validationRules = {
    nama_benda: { type: 'text', options: { min: 3, max: 200 } },
    no_reg: { type: 'text', options: { min: 1, max: 50 } },
    no_inv: { type: 'text', options: { min: 1, max: 50 } },
    kategori_id: { type: 'select', options: { values: kategoriBaikValues } },
    asal_koleksi: { type: 'text', options: { min: 3, max: 200 } },
    bahan: { type: 'text', options: { min: 1, max: 100 } },
    kondisi: { type: 'text', options: { min: 3, max: 50 } },
    tanggal_perolehan: { type: 'date' },
    deskripsi: { type: 'text', options: { min: 1, max: 1000 } },
    panjang: { type: 'decimal', options: { min: 0, max: 9999, decimals: 2, required: false } },
    lebar: { type: 'decimal', options: { min: 0, max: 9999, decimals: 2, required: false } },
    tinggi: { type: 'decimal', options: { min: 0, max: 9999, decimals: 2, required: false } },
    berat: { type: 'decimal', options: { min: 0, max: 9999, decimals: 2, required: false } }
  };

  const result = validateForm({
    nama_benda: document.getElementById('nama_benda').value,
    no_reg: document.getElementById('no_reg').value,
    no_inv: document.getElementById('no_inv').value,
    kategori_id: document.getElementById('kategori_id').value,
    asal_koleksi: document.getElementById('asal_koleksi').value,
    bahan: document.getElementById('bahan').value,
    kondisi: document.getElementById('kondisi').value,
    tanggal_perolehan: document.getElementById('tanggal_perolehan').value,
    deskripsi: document.getElementById('deskripsi').value,
    panjang: document.getElementById('panjang').value,
    lebar: document.getElementById('lebar').value,
    tinggi: document.getElementById('tinggi').value,
    berat: document.getElementById('berat').value
  }, validationRules);

  if (!result.valid) {
    // Tampilkan error di masing-masing field
    for (const field in result.errors) {
      const inputEl = document.getElementById(field);
      if (inputEl) {
        showInputError(inputEl, result.errors[field]);
      }
    }
    return;
  }

  // Submit dengan data yang sudah aman
  try {
    await authFetch('/api/koleksi', {
      method: 'POST',
      body: JSON.stringify(result.sanitized)
    });
    showAlert('Koleksi berhasil ditambahkan', 'success');
  } catch (err) {
    showAlert('Gagal: ' + err.message, 'error');
  }
});
*/

// =====================================================
// DAFTAR FUNGSI YANG TERSEDIA
// =====================================================
/*
✓ escapeHTML(text) 
  - Escape HTML special characters
  - Gunakan saat render user input ke DOM

✓ validateText(value, options)
  - Validasi text biasa (nama, deskripsi, dll)
  - Options: {min, max, required}

✓ validateEmail(email)
  - Validasi format email

✓ validatePassword(password)
  - Validasi password (min 6, max 128 karakter)

✓ validateNumber(number, options)
  - Validasi nomor (telepon, nomor register, dll)
  - Options: {digits, allowHyphen}

✓ validateDate(dateStr)
  - Validasi tanggal format YYYY-MM-DD

✓ validateDecimal(value, options)
  - Validasi angka desimal (panjang, lebar, dll)
  - Options: {min, max, decimals, required}

✓ validateSelect(value, allowedValues)
  - Validasi dropdown/select value

✓ validateForm(data, rules)
  - Validasi multiple fields sekaligus
  - Return: {valid, errors, sanitized}

✓ showInputError(inputElement, errorMessage)
  - Tampilkan visual error di input (red border + message)

✓ clearInputError(inputElement)
  - Hapus visual error dari input

✓ attachInputValidation(inputElement, type, options)
  - Attach real-time validation on blur/focus
*/

export default {
  escapeHTML,
  validateText,
  validateEmail,
  validatePassword,
  validateNumber,
  validateDate,
  validateDecimal,
  validateSelect,
  validateForm,
  showInputError,
  clearInputError,
  attachInputValidation
};
