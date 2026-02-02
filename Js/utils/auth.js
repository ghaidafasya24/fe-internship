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
  // Hapus token dari cookie (both root path dan GitHub Pages subdirectory)
  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  document.cookie = "token=; path=/fe-internship/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

  // Clear localStorage data on logout
  localStorage.removeItem("token");
  localStorage.removeItem("token_expires");
  localStorage.removeItem("username");
  localStorage.removeItem("phone");

  // Dapatkan base path untuk GitHub Pages compatibility
  const pathname = window.location.pathname;
  const isGitHubPages = pathname.includes('/fe-internship/');
  const basePath = isGitHubPages ? '/fe-internship' : '';
  const loginPath = basePath + "/Template/login.html";
  
  // Prevent back button dari kembali ke dashboard
  history.replaceState(null, null, loginPath);
  
  // Import modal dynamically
  import('./modal.js').then(({ showAlert }) => {
    showAlert(message, "warning");
    setTimeout(() => {
      window.location.href = loginPath;
    }, 2000);
  }).catch(() => {
    alert(message); 
    window.location.href = loginPath;
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
let tokenRefreshTimer = null;
let lastActivityTime = Date.now();
const IDLE_TIMEOUT = 2 * 60 * 60 * 1000; // 2 jam idle = auto logout
const TOKEN_EXTENSION_DURATION = 2 * 60 * 60 * 1000; // Extend token 2 jam saat ada aktivitas

// Perpanjang token saat ada aktivitas (extend cookie max-age)
function extendTokenExpiry() {
  const token = getToken();
  if (!token) return;
  
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiry = payload.exp * 1000;
    const now = Date.now();
    const timeUntilExpiry = expiry - now;
    
    // Hanya extend jika token masih valid (belum expired)
    if (timeUntilExpiry > 0) {
      // Extend cookie lifetime agar token tetap tersimpan di browser
      // Saat ada aktivitas, perpanjang cookie sampai 2 jam ke depan
      document.cookie = `token=${token}; path=/; max-age=${TOKEN_EXTENSION_DURATION / 1000}`; // 2 jam
      console.log("🔄 Token extended on activity (2 hours)");
    }
  } catch (err) {
    console.error("Error extending token:", err);
  }
}

// Auto refresh token saat akan expired dan user masih aktif
async function autoRefreshToken() {
  const token = getToken();
  if (!token) return;
  
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiry = payload.exp * 1000;
    const now = Date.now();
    const timeUntilExpiry = expiry - now;
    
    // Jika token akan expired dalam 15 menit, coba refresh
    if (timeUntilExpiry > 0 && timeUntilExpiry < 15 * 60 * 1000) {
      console.log("🔄 Token expiring soon, attempting to refresh...");
      
      // Coba endpoint refresh jika tersedia
      try {
        const response = await fetch('https://inventorymuseum-de54c3e9b901.herokuapp.com/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          timeout: 5000
        });
        
        if (response && response.ok) {
          const data = await response.json();
          if (data.token) {
            document.cookie = `token=${data.token}; path=/; max-age=${TOKEN_EXTENSION_DURATION / 1000}`;
            console.log("✅ Token refreshed from server");
          }
        }
      } catch (fetchErr) {
        // Silent fail jika endpoint tidak tersedia
      }
    }
  } catch (err) {
    console.error("Error in autoRefreshToken:", err);
  }
}

// Reset idle timer saat ada aktivitas
function resetIdleTimer() {
  lastActivityTime = Date.now();
  
  // Extend token saat ada aktivitas
  extendTokenExpiry();
  
  if (idleTimer) {
    clearTimeout(idleTimer);
  }
  
  idleTimer = setTimeout(() => {
    logout("Sesi berakhir karena tidak ada aktivitas selama 2 jam.");
  }, IDLE_TIMEOUT);
  
  // Trigger auto refresh check saat ada aktivitas
  autoRefreshToken();
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
  
  console.log("✅ Activity tracking initialized (2 hours idle timeout with auto token refresh)");
}

// Cek token expiry secara periodik - HANYA warning, tidak auto logout jika masih ada aktivitas
export function startTokenExpiryCheck() {
  setInterval(() => {
    const token = getToken();
    if (!token) return;
    
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiry = payload.exp * 1000;
      const now = Date.now();
      const timeUntilExpiry = expiry - now;
      const timeSinceLastActivity = now - lastActivityTime;
      
      // Warning 10 menit sebelum expired
      if (timeUntilExpiry > 0 && timeUntilExpiry < 10 * 60 * 1000 && !window.tokenExpiryWarningShown) {
        window.tokenExpiryWarningShown = true;
        import('./modal.js').then(({ showAlert }) => {
          showAlert("Info", "Sesi Anda akan berakhir dalam 10 menit. Lakukan aktivitas atau simpan pekerjaan Anda.", "warning");
        });
      }
      
      // Auto logout HANYA jika token expired DAN tidak ada aktivitas dalam 30 menit terakhir
      if (timeUntilExpiry <= 0 && timeSinceLastActivity > 30 * 60 * 1000) {
        console.warn("⚠️ Token expired and no recent activity - logging out");
        logout("Sesi Anda telah berakhir karena tidak ada aktivitas. Silakan login kembali.");
      } else if (timeUntilExpiry <= 0) {
        // Jika token expired tapi user baru saja aktif, try auto refresh
        console.log("Token expired but user was recently active, attempting refresh...");
        autoRefreshToken();
      }
    } catch (err) {
      console.error("Error checking token expiry:", err);
    }
  }, 60 * 1000); // Check every 1 minute
  
  console.log("✅ Token expiry check started with auto-refresh on activity");
}
