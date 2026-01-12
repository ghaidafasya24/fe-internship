// File: /Js/controller/profile.js — load & update profil user (username/phone/password)
import { showAlert } from "../utils/modal.js";
import { API_URLS } from "../config/url.js";
import { validateText, validateNumber, showInputError, clearInputError } from "../utils/validation.js";

const USER_BASE_URL = "https://inventorymuseum-de54c3e9b901.herokuapp.com/api/users";

function extractProfile(data) {
  const username = data?.username || data?.user?.username || null;
  let phone =
    data?.phone ||
    data?.phone_number ||
    data?.phoneNumber ||
    data?.user?.phone ||
    data?.user?.phone_number ||
    null;

  if (phone) {
    const cleaned = String(phone).trim();
    const normalized = cleaned.startsWith("+")
      ? cleaned
      : cleaned.startsWith("62")
        ? "+" + cleaned
        : cleaned.startsWith("0")
          ? "+62" + cleaned.slice(1)
          : cleaned;
    phone = normalized;
  }

  return { username, phone };
}

document.addEventListener("DOMContentLoaded", () => {
  loadUserProfile();
  setupAccountInfoForm();
});

// Load current user profile info
async function loadUserProfile() {
  const token = localStorage.getItem("token");
  if (!token) {
    showAlert("Silakan login terlebih dahulu", "warning");
    setTimeout(() => {
      window.location.href = "../login.html";
    }, 1500);
    return;
  }

  let username = null;
  let phone = null;

  // Try to fetch from API
  try {
    const response = await fetch(API_URLS.getProfile, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const parsed = extractProfile(data);
      username = parsed.username;
      phone = parsed.phone;

      if (phone) localStorage.setItem("phone", phone);
      if (username) localStorage.setItem("username", username);

      console.log("Profile loaded from API:", data);
    } else {
      console.log("Profile endpoint returned error, will try fallback by userId");
      // Fallback: fetch user by ID if available
      const storedUserId = localStorage.getItem("userId");
      if (storedUserId) {
        try {
          const altRes = await fetch(`${USER_BASE_URL}/${storedUserId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (altRes.ok) {
            const altData = await altRes.json();
            const parsedAlt = extractProfile(altData);
            username = parsedAlt.username || username;
            phone = parsedAlt.phone || phone;

            if (phone) localStorage.setItem("phone", phone);
            if (username) localStorage.setItem("username", username);

            console.log("Profile loaded from fallback /users/:id", altData);
          } else {
            console.log("Fallback /users/:id also failed", altRes.status);
          }
        } catch (fallbackErr) {
          console.error("Fallback fetch by userId failed", fallbackErr);
        }
      }
    }
  } catch (error) {
    console.error("Error loading profile from API:", error);
  }

  // Fallback: Try to get from localStorage
  if (!username) {
    username = localStorage.getItem("username");
  }
  if (!phone) {
    phone = localStorage.getItem("phone");
    // Handle jika phone adalah string kosong, convert menjadi null
    if (phone === "") {
      phone = null;
    }
  }

  console.log("Loaded data - Username:", username, "Phone:", phone);

  // Display username
  const usernameElement = document.getElementById("currentUsername");
  if (usernameElement) {
    usernameElement.textContent = username || "-";
  }

  // Pre-fill account info form dengan current data - Tunggu sampai form muncul
  setTimeout(() => {
    const accountUsernameField = document.getElementById("accountUsername");
    const accountPhoneField = document.getElementById("accountPhone");
    
    console.log("Form fields found - Username:", !!accountUsernameField, "Phone:", !!accountPhoneField);
    
    if (accountUsernameField) {
      accountUsernameField.value = username || "";
      console.log("Username field set to:", accountUsernameField.value);
    }
    if (accountPhoneField) {
      let displayPhone = "";
      if (phone) {
        // Extract phone number without +62 prefix
        if (phone.startsWith("+62")) {
          displayPhone = phone.substring(3);
        } else if (phone.startsWith("62")) {
          displayPhone = phone.substring(2);
        } else {
          displayPhone = phone;
        }
      }
      accountPhoneField.value = displayPhone;
      console.log("Phone field set to:", displayPhone, "(from original:", phone, ")");
    }
  }, 100);
}

// Setup Account Info Form (Combined Username & Phone)
function setupAccountInfoForm() {
  const formAccountInfo = document.getElementById("formAccountInfo");
  if (!formAccountInfo) return;

  const usernameInput = document.getElementById("accountUsername");
  const phoneInput = document.getElementById("accountPhone");

  // Real-time validation on blur
  if (usernameInput) {
    usernameInput.addEventListener("blur", () => {
      const result = validateText(usernameInput.value, {
        min: 3,
        max: 50,
        allowedPattern: /^[a-z0-9._-]+$/,
        allowedMessage: "Username hanya boleh huruf kecil, angka, titik, underscore, atau minus",
      });
      if (!result.valid) {
        showInputError(usernameInput, result.error);
      } else {
        clearInputError(usernameInput);
      }
    });
    usernameInput.addEventListener("focus", () => {
      clearInputError(usernameInput);
    });
  }

  if (phoneInput) {
    phoneInput.addEventListener("blur", () => {
      const result = validateNumber(phoneInput.value, { allowHyphen: true });
      if (!result.valid) {
        showInputError(phoneInput, result.error);
      } else {
        clearInputError(phoneInput);
      }
    });
    phoneInput.addEventListener("focus", () => {
      clearInputError(phoneInput);
    });
  }

  formAccountInfo.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newUsername = usernameInput.value;
    const rawPhone = phoneInput.value;
    const token = localStorage.getItem("token");

    // Validasi username dengan escaping
    const usernameResult = validateText(newUsername, {
      min: 3,
      max: 50,
      allowedPattern: /^[a-z0-9._-]+$/,
      allowedMessage: "Username hanya boleh huruf kecil, angka, titik, underscore, atau minus",
    });
    if (!usernameResult.valid) {
      showInputError(usernameInput, usernameResult.error);
      showAlert(usernameResult.error, "warning");
      return;
    } else {
      clearInputError(usernameInput);
    }

    const normalizedUsername = usernameResult.value.toLowerCase();
    if (usernameResult.value !== normalizedUsername) {
      showInputError(usernameInput, "Username harus lowercase");
      showAlert("Username harus lowercase", "warning");
      return;
    }

    // Validasi nomor telepon
    const phoneResult = validateNumber(rawPhone, { allowHyphen: true });
    if (!phoneResult.valid) {
      showInputError(phoneInput, phoneResult.error);
      showAlert(phoneResult.error, "warning");
      return;
    } else {
      clearInputError(phoneInput);
    }

    const cleanPhone = phoneResult.value.replace(/[\s\-]/g, "");

    const phoneForApi = "62" + cleanPhone;

    // Ambil userId dari token
    let userId = null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userId =
        payload.user_id ||
        payload.id ||
        payload._id ||
        payload.userId ||
        payload.sub;
    } catch {
      userId = localStorage.getItem("userId");
    }

    if (!userId) {
      showAlert("User ID tidak ditemukan, silakan login ulang", "error");
      return;
    }

    const formData = new FormData();
    formData.append("username", normalizedUsername);
    formData.append("phone_number", phoneForApi);

    try {
      const response = await fetch(
        `https://inventorymuseum-de54c3e9b901.herokuapp.com/api/users/${userId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showAlert(data.message || "Gagal update data", "error");
        return;
      }

      // Simpan lokal
      localStorage.setItem("username", normalizedUsername);
      localStorage.setItem("phone", "+62" + cleanPhone);

      document.getElementById("currentUsername").textContent = normalizedUsername;

      showAlert("Profil berhasil diperbarui 🎉", "success");

      setTimeout(() => location.reload(), 1200);
    } catch (err) {
      console.error(err);
      showAlert("Gagal menghubungi server", "error");
    }
  });
}

// Setup Username Update Form (OLD - DEPRECATED)
function setupUsernameForm() {
  const formUsername = document.getElementById("formUsername");
  if (!formUsername) return;
  
  formUsername.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newUsername = document.getElementById("newUsername").value.trim();
    const password = document.getElementById("usernamePassword").value.trim();
    const token = localStorage.getItem("token");

    if (!newUsername || !password) {
      showAlert("Username dan password harus diisi!", "warning");
      return;
    }

    // Validate username format (alphanumeric, underscore, minimum 3 characters)
    const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;
    if (!usernameRegex.test(newUsername)) {
      showAlert("Username harus minimal 3 karakter dan hanya boleh huruf, angka, dan underscore!", "warning");
      return;
    }

    if (!token) {
      showAlert("Token tidak ditemukan. Silakan login kembali.", "error");
      setTimeout(() => {
        window.location.href = "../login.html";
      }, 1500);
      return;
    }

    try {
      const response = await fetch(API_URLS.updateUsername, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: newUsername,
          password: password,
        }),
      });

      console.log("Update username response status:", response.status);
      
      let data = {};
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Response is not JSON:", response.statusText);
      }

      if (response.ok) {
        showAlert("Username berhasil diperbarui! 🎉", "success");
        formUsername.reset();
        
        // Update displayed username
        const usernameElement = document.getElementById("currentUsername");
        if (usernameElement) {
          usernameElement.textContent = newUsername;
        }
      } else {
        showAlert(data.message || `Gagal: ${response.statusText}`, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showAlert("Terjadi kesalahan saat memperbarui username", "error");
    }
  });
}
// Setup Phone Update Form (OLD - DEPRECATED)
function setupPhoneForm() {
  const formPhone = document.getElementById("formPhone");
  if (!formPhone) return;
  
  formPhone.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPhone = document.getElementById("newPhone").value.trim();
    const password = document.getElementById("phonePassword").value.trim();
    const token = localStorage.getItem("token");

    if (!newPhone || !password) {
      showAlert("Nomor telepon dan password harus diisi!", "warning");
      return;
    }

    // Validate phone format (Indonesian phone numbers - only digits after +62)
    const cleanPhone = newPhone.replace(/[\s\-]/g, '');
    const phoneRegex = /^[0-10]{10,12}$/;
    if (!phoneRegex.test(cleanPhone)) {
      showAlert("Format nomor telepon tidak valid! Ketik 10-12 digit tanpa +62 atau 0", "warning");
      return;
    }

    // Format nomor dengan prefix +62
    const formattedPhone = '+62' + cleanPhone;

    if (!token) {
      showAlert("Token tidak ditemukan. Silakan login kembali.", "error");
      setTimeout(() => {
        window.location.href = "../login.html";
      }, 1500);
      return;
    }

    try {
      const response = await fetch(API_URLS.updatePhone, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: formattedPhone,
          password: password,
        }),
      });

      console.log("Update phone response status:", response.status);
      
      let data = {};
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Response is not JSON:", response.statusText);
      }

      if (response.ok) {
        showAlert("Nomor telepon berhasil diperbarui! 🎉", "success");
        formPhone.reset();
        
        // Update localStorage
        localStorage.setItem("phone", formattedPhone);
        
        // Update displayed phone
        const phoneElement = document.getElementById("currentPhone");
        if (phoneElement) {
          phoneElement.querySelector('span').textContent = newPhone;
        }
      } else {
        showAlert(data.message || `Gagal: ${response.statusText}`, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showAlert("Terjadi kesalahan saat memperbarui nomor telepon", "error");
    }
  });
}

// Setup Password Update Form
function setupPasswordForm() {
  const formPassword = document.getElementById("formPassword");
  
  formPassword.addEventListener("submit", async (e) => {
    e.preventDefault();

    const oldPassword = document.getElementById("oldPassword").value.trim();
    const newPassword = document.getElementById("newPassword").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    const token = localStorage.getItem("token");

    if (!oldPassword || !newPassword || !confirmPassword) {
      showAlert("Semua field password harus diisi!", "warning");
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert("Password baru dan konfirmasi tidak cocok!", "warning");
      return;
    }

    if (newPassword.length < 6) {
      showAlert("Password baru minimal 6 karakter!", "warning");
      return;
    }

    if (oldPassword === newPassword) {
      showAlert("Password baru tidak boleh sama dengan password lama!", "warning");
      return;
    }

    if (!token) {
      showAlert("Token tidak ditemukan. Silakan login kembali.", "error");
      setTimeout(() => {
        window.location.href = "../login.html";
      }, 1500);
      return;
    }

    try {
      const response = await fetch(API_URLS.updatePassword, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: oldPassword,
          newPassword: newPassword,
        }),
      });

      console.log("Update password response status:", response.status);
      
      let data = {};
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Response is not JSON:", response.statusText);
      }

      if (response.ok) {
        showAlert("Password berhasil diperbarui! 🎉", "success");
        formPassword.reset();
        
        // Optionally redirect to login after password change
        setTimeout(() => {
          showAlert("Silakan login kembali dengan password baru", "info");
          localStorage.removeItem("token");
          localStorage.removeItem("token_expires");
          window.location.href = "../login.html";
        }, 2000);
      } else {
        showAlert(data.message || `Gagal: ${response.statusText}`, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showAlert("Terjadi kesalahan saat memperbarui password", "error");
    }
  });
}
