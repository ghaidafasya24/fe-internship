// Ambil token dari cookie (key: token)
export function getToken() {
  const name = "token=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(";");

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return null;
}

// Cek apakah token JWT sudah kedaluwarsa
export function isTokenExpired() {
  const token = getToken();
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiry = payload.exp * 1000;
    return Date.now() > expiry;
  } catch {
    return true;
  }
}

// Hapus token + redirect ke login dengan alert
export function logout(message = "Sesi kamu telah habis. Silakan login kembali.") {
  document.cookie =
    "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

  // Import modal dynamically
  import('./modal.js').then(({ showAlert }) => {
    showAlert(message, "warning");
    setTimeout(() => {
      window.location.href = "/Template/login.html";
    }, 2000);
  }).catch(() => {
    alert(message); 
    window.location.href = "/Template/login.html";
  });
}

// Fetch dengan token + auto logout jika token invalid/expired
export async function authFetch(url, options = {}) {
  const token = getToken();

  // ⛔ TOKEN EXPIRED (CEK SEBELUM REQUEST)
  if (isTokenExpired()) {
    console.warn("⚠️ Token expired (frontend check)");
    logout();
    throw new Error("Token expired");
  }

  if (!options.headers) options.headers = {};

  // ⛔ Jangan set Content-Type saat FormData
  if (!(options.body instanceof FormData)) {
    options.headers["Content-Type"] = "application/json";
  }

  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(url, options);
  } catch (err) {
    console.error("❌ Network error during fetch:", err);
    // Beri pesan yang jelas agar caller bisa menampilkan alert yang ramah
    throw new Error("Network error: gagal menghubungi server. Periksa koneksi internet kamu.");
  }

  // 🔥 HANDLE TOKEN INVALID DARI SERVER
  if (res.status === 401 || res.status === 403) {
    console.warn("⚠️ Token invalid / expired (server)");
    logout();
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const body = await res.text();
    console.error("❌ Server Response Body:", body);
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
}

// ============================================
// AUTO LOGOUT SAAT IDLE (NO ACTIVITY)
// ============================================
let idleTimer = null;
let lastActivityTime = Date.now();
const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 menit idle = auto logout

// Reset idle timer saat ada aktivitas
function resetIdleTimer() {
  lastActivityTime = Date.now();
  
  if (idleTimer) {
    clearTimeout(idleTimer);
  }
  
  idleTimer = setTimeout(() => {
    logout("Sesi berakhir karena tidak ada aktivitas selama 30 menit.");
  }, IDLE_TIMEOUT);
}

// Track user activity
export function initActivityTracking() {
  // Events yang dianggap sebagai aktivitas user
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
  
  events.forEach(event => {
    document.addEventListener(event, resetIdleTimer, true);
  });
  
  // Start idle timer
  resetIdleTimer();
  
  console.log("✅ Activity tracking initialized (30 min idle timeout)");
}

// Cek token expiry secara periodik (setiap 1 menit)
export function startTokenExpiryCheck() {
  setInterval(() => {
    if (isTokenExpired()) {
      console.warn("⚠️ Token expired detected");
      logout("Token Anda telah kedaluwarsa. Silakan login kembali.");
    }
  }, 60 * 1000); // Check every 1 minute
  
  console.log("✅ Token expiry check started");
}
