// Validasi & sanitasi input untuk mencegah XSS dan injection attacks

/**
 * Escape HTML special characters untuk mencegah XSS
 * @param {string} text - Text yang akan di-escape
 * @returns {string} Text yang aman dari HTML injection
 */
export function escapeHTML(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return String(text).replace(/[&<>"']/g, (char) => map[char]);
}

// Reusable detection for dangerous patterns (XSS/SQL/command)
const dangerousPatterns = [
  /<script[\s\S]*?<\/script>/gi,
  /<iframe[\s\S]*?<\/iframe>/gi,
  /<embed/i,
  /<object/i,
  /javascript:/i,
  /on\w+\s*=/i,
  /eval\s*\(/i,
  /expression\s*\(/i,
  /<[^>]*href\s*=\s*["`]?javascript:/i,
  /<[^>]*src\s*=\s*["`]?javascript:/i,
  /<[a-z]/i,
  />/g,
  /['"]?\s*(;|--|\/\*|\*\/|xp_|sp_|exec|execute|select|insert|update|delete|drop|create|alter|union|from|where)/i,
  /[`$(){}|;&<>]/,
  /&#x?[0-9a-f]+/i,
];

function hasDangerousPattern(text) {
  const target = String(text || '').toLowerCase();
  return dangerousPatterns.some((p) => p.test(target));
}

/**
 * Validasi dan sanitasi input text biasa (nama, deskripsi, dll)
 * @param {string} value - Input value
 * @param {object} options - {min, max, required, allowedPattern, allowedMessage}
 * @returns {object} {valid, value, error}
 */
export function validateText(value, options = {}) {
  const { min = 1, max = 500, required = true, allowedPattern = null, allowedMessage = null } = options;
  
  if (!value && required) {
    return { valid: false, value: '', error: 'Field tidak boleh kosong' };
  }

  const trimmed = String(value || '').trim();

  if (hasDangerousPattern(trimmed)) {
    return { valid: false, value: trimmed, error: 'Input mengandung karakter atau pola yang tidak diizinkan ⚠️' };
  }

  if (allowedPattern && !allowedPattern.test(trimmed)) {
    return { valid: false, value: trimmed, error: allowedMessage || 'Input mengandung karakter yang tidak diizinkan' };
  }

  if (trimmed.length < min) {
    return { valid: false, value: trimmed, error: `Minimal ${min} karakter` };
  }

  if (trimmed.length > max) {
    return { valid: false, value: trimmed, error: `Maksimal ${max} karakter` };
  }

  return { valid: true, value: escapeHTML(trimmed), error: null };
}

export function hasBlacklistedPattern(value) {
  return hasDangerousPattern(value);
}

/**
 * Validasi email
 * @param {string} email - Email address
 * @returns {object} {valid, value, error}
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const trimmed = String(email || '').trim().toLowerCase();

  if (!trimmed) {
    return { valid: false, value: '', error: 'Email tidak boleh kosong' };
  }

  if (!emailRegex.test(trimmed)) {
    return { valid: false, value: trimmed, error: 'Format email tidak valid' };
  }

  if (trimmed.length > 254) {
    return { valid: false, value: trimmed, error: 'Email terlalu panjang' };
  }

  return { valid: true, value: trimmed, error: null };
}

/**
 * Validasi password
 * @param {string} password - Password
 * @returns {object} {valid, value, error}
 */
export function validatePassword(password) {
  if (!password) {
    return { valid: false, value: '', error: 'Password tidak boleh kosong' };
  }

  if (password.length < 6) {
    return { valid: false, value: '', error: 'Password minimal 6 karakter' };
  }

  if (password.length > 128) {
    return { valid: false, value: '', error: 'Password terlalu panjang' };
  }

  return { valid: true, value: password, error: null };
}

/**
 * Validasi nomor (telepon, nomor register, dll)
 * @param {string} number - Nomor
 * @param {object} options - {digits: true/false, allowHyphen: true/false}
 * @returns {object} {valid, value, error}
 */
export function validateNumber(number, options = {}) {
  const { digits = false, allowHyphen = true } = options;
  const trimmed = String(number || '').trim();

  if (!trimmed) {
    return { valid: false, value: '', error: 'Nomor tidak boleh kosong' };
  }

  if (trimmed.length > 20) {
    return { valid: false, value: trimmed, error: 'Nomor terlalu panjang' };
  }

  // Validasi: hanya angka, dan optional hyphen
  const pattern = allowHyphen ? /^[\d\-]+$/ : /^\d+$/;
  if (!pattern.test(trimmed)) {
    return { valid: false, value: trimmed, error: 'Nomor hanya boleh berisi angka' + (allowHyphen ? ' dan tanda hubung' : '') };
  }

  if (digits && trimmed.replace(/-/g, '').length < digits) {
    return { valid: false, value: trimmed, error: `Nomor harus memiliki minimal ${digits} digit` };
  }

  return { valid: true, value: trimmed, error: null };
}

/**
 * Validasi tanggal
 * @param {string} dateStr - Tanggal dalam format YYYY-MM-DD
 * @returns {object} {valid, value, error}
 */
export function validateDate(dateStr) {
  if (!dateStr) {
    return { valid: false, value: '', error: 'Tanggal tidak boleh kosong' };
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) {
    return { valid: false, value: dateStr, error: 'Format tanggal harus YYYY-MM-DD' };
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return { valid: false, value: dateStr, error: 'Tanggal tidak valid' };
  }

  return { valid: true, value: dateStr, error: null };
}

/**
 * Validasi angka desimal (panjang, lebar, dll)
 * @param {string|number} value - Nilai angka
 * @param {object} options - {min, max, decimals}
 * @returns {object} {valid, value, error}
 */
export function validateDecimal(value, options = {}) {
  const { min = 0, max = 9999, decimals = 2, required = false } = options;
  const trimmed = String(value || '').trim();

  if (!trimmed && required) {
    return { valid: false, value: '', error: 'Nilai tidak boleh kosong' };
  }

  if (!trimmed) {
    return { valid: true, value: '', error: null };
  }

  const num = parseFloat(trimmed);
  if (isNaN(num)) {
    return { valid: false, value: trimmed, error: 'Nilai harus berupa angka' };
  }

  if (num < min) {
    return { valid: false, value: trimmed, error: `Nilai minimal ${min}` };
  }

  if (num > max) {
    return { valid: false, value: trimmed, error: `Nilai maksimal ${max}` };
  }

  const decimalCount = (trimmed.split('.')[1] || '').length;
  if (decimalCount > decimals) {
    return { valid: false, value: trimmed, error: `Maksimal ${decimals} desimal` };
  }

  return { valid: true, value: num.toString(), error: null };
}

/**
 * Validasi dropdown/select
 * @param {string} value - Selected value
 * @param {array} allowedValues - Array nilai yang diizinkan
 * @returns {object} {valid, value, error}
 */
export function validateSelect(value, allowedValues = []) {
  if (!value) {
    return { valid: false, value: '', error: 'Pilihan tidak boleh kosong' };
  }

  if (!allowedValues.includes(value)) {
    return { valid: false, value, error: 'Pilihan tidak valid' };
  }

  return { valid: true, value, error: null };
}

/**
 * Fungsi helper untuk validasi form lengkap dengan multiple fields
 * @param {object} data - Object dengan field: value pairs
 * @param {object} rules - Object dengan field: {type, options} pairs
 * @returns {object} {valid, errors, sanitized}
 */
export function validateForm(data, rules) {
  const errors = {};
  const sanitized = {};

  for (const field in rules) {
    const rule = rules[field];
    const value = data[field];
    let result;

    switch (rule.type) {
      case 'text':
        result = validateText(value, rule.options);
        break;
      case 'email':
        result = validateEmail(value);
        break;
      case 'password':
        result = validatePassword(value);
        break;
      case 'number':
        result = validateNumber(value, rule.options);
        break;
      case 'date':
        result = validateDate(value);
        break;
      case 'decimal':
        result = validateDecimal(value, rule.options);
        break;
      case 'select':
        result = validateSelect(value, rule.options?.values || []);
        break;
      default:
        result = { valid: true, value, error: null };
    }

    if (!result.valid) {
      errors[field] = result.error;
    } else {
      sanitized[field] = result.value;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    sanitized
  };
}

/**
 * Trigger visual error di input field
 * @param {HTMLElement} inputElement - Input element
 * @param {string} errorMessage - Error message
 */
export function showInputError(inputElement, errorMessage) {
  if (!inputElement) return;

  inputElement.classList.add('border-red-500', 'bg-red-50');
  inputElement.classList.remove('border-primary/20');

  let errorDiv = inputElement.nextElementSibling;
  if (!errorDiv || !errorDiv.classList.contains('error-message')) {
    errorDiv = document.createElement('div');
    errorDiv.className = 'error-message text-red-600 text-sm mt-1';
    inputElement.parentNode.insertBefore(errorDiv, inputElement.nextSibling);
  }

  errorDiv.textContent = errorMessage;
  errorDiv.style.display = 'block';
}

/**
 * Hapus error visual dari input field
 * @param {HTMLElement} inputElement - Input element
 */
export function clearInputError(inputElement) {
  if (!inputElement) return;

  inputElement.classList.remove('border-red-500', 'bg-red-50');
  inputElement.classList.add('border-primary/20');

  const errorDiv = inputElement.nextElementSibling;
  if (errorDiv && errorDiv.classList.contains('error-message')) {
    errorDiv.style.display = 'none';
  }
}

/**
 * Attach real-time validation ke input element
 * @param {HTMLElement} inputElement - Input element
 * @param {string} type - Validation type (text, email, password, dll)
 * @param {object} options - Validation options
 */
export function attachInputValidation(inputElement, type = 'text', options = {}) {
  if (!inputElement) return;

  inputElement.addEventListener('blur', () => {
    let result;
    const value = inputElement.value;

    switch (type) {
      case 'email':
        result = validateEmail(value);
        break;
      case 'password':
        result = validatePassword(value);
        break;
      case 'number':
        result = validateNumber(value, options);
        break;
      case 'date':
        result = validateDate(value);
        break;
      case 'decimal':
        result = validateDecimal(value, options);
        break;
      default:
        result = validateText(value, options);
    }

    if (!result.valid) {
      showInputError(inputElement, result.error);
    } else {
      clearInputError(inputElement);
    }
  });

  // Clear error on focus
  inputElement.addEventListener('focus', () => {
    clearInputError(inputElement);
  });
}
