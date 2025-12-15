// =========================
// 1. getToken
// =========================
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

// =========================
// 2. isTokenExpired
// =========================
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

// =========================
// 3. logout
// =========================
export function logout() {
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  window.location.href = "/Template/login.html";
}

// =========================
// 4. authFetch (dipanggil paling terakhir)
// =========================
export async function authFetch(url, options = {}) 
 {
  const token = localStorage.getItem("token");

  if (!options.headers) options.headers = {};

  // ⛔ Jangan set Content-Type saat body adalah FormData
  if (!(options.body instanceof FormData)) {
    options.headers["Content-Type"] = "application/json";
  }

  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, options);

  if (!res.ok) {
    const body = await res.text();
    console.error("❌ Server Response Body:", body);
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
}
