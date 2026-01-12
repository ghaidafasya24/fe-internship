// File: /Js/controller/Login.js — handle login form and token storage
import { showAlert } from "../utils/modal.js";
import { validateText, validatePassword, showInputError, clearInputError } from "../utils/validation.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const loginButton = document.getElementById("loginButton");
  const togglePwd = document.getElementById("togglePwd");
  const passwordInput = document.getElementById("password");

  if (togglePwd && passwordInput) {
    togglePwd.addEventListener("click", () => {
      const isHidden = passwordInput.type === "password";
      passwordInput.type = isHidden ? "text" : "password";
      togglePwd.textContent = isHidden ? "Sembunyikan" : "Tampilkan";
    });
  }

  // Submit login form
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usernameInput = document.getElementById("username");
    const username = usernameInput.value;
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

    loginButton.disabled = true;
    loginButton.textContent = "Signing in...";

    try {
      const response = await fetch(
        "https://inventorymuseum-de54c3e9b901.herokuapp.com/api/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: usernameResult.value, password: passwordResult.value })
        }
      );

      const data = await response.json();
      console.log("=== LOGIN API RESPONSE ===");
      console.log(JSON.stringify(data, null, 2));
      console.log("=== ALL AVAILABLE FIELDS ===");
      for (let key in data) {
        console.log(`${key}:`, data[key]);
      }

      if (response.ok) {

        if (data.token) {
          const expireTime = new Date(Date.now() + 30 * 60 * 1000).toUTCString(); // 30 menit

          // Simpan di cookie
          document.cookie = `token=${data.token}; path=/; expires=${expireTime}; SameSite=None; Secure`;
          // Simpan di localStorage + time expired
          localStorage.setItem("token", data.token);
          localStorage.setItem("token_expires", Date.now() + 30 * 60 * 1000);
          
          // Simpan user ID (coba dari berbagai struktur)
          let userId = data.id || (data.user && data.user.id) || (data.user && data.user._id);
          if (userId) {
            localStorage.setItem("userId", userId);
            console.log("✓ User ID saved to localStorage:", userId);
          } else {
            console.error("✗ User ID not found in login response! Attempting to fetch profile...");
            // Fallback: Fetch user profile to get the ID
            try {
              const profileResponse = await fetch(
                "https://inventorymuseum-de54c3e9b901.herokuapp.com/api/users/profile",
                {
                  method: "GET",
                  headers: {
                    Authorization: `Bearer ${data.token}`,
                  },
                }
              );
              if (profileResponse.ok) {
                const profileData = await profileResponse.json();
                console.log("Profile response:", profileData);
                userId = profileData.id || profileData._id || profileData.userId;
                if (userId) {
                  localStorage.setItem("userId", userId);
                  console.log("✓ User ID extracted from profile API:", userId);
                }
              }
            } catch (err) {
              console.error("Failed to fetch profile for userId:", err);
            }
          }
          
          // Simpan username untuk ditampilkan di profil
          localStorage.setItem("username", username);
          
          // Coba ambil phone dari berbagai kemungkinan struktur API response
          let phone = null;
          if (data.phone) {
            phone = data.phone;
          } else if (data.user && data.user.phone) {
            phone = data.user.phone;
          } else if (data.phone_number) {
            phone = data.phone_number;
          } else if (data.user && data.user.phone_number) {
            phone = data.user.phone_number;
          }
          
          // Jika phone ada, simpan. Jika tidak, cek apakah sudah ada di localStorage sebelumnya
          if (phone) {
            localStorage.setItem("phone", phone);
            console.log("Phone saved to localStorage:", phone);
          } else {
            // Cek apakah ada phone di localStorage yang sudah tersimpan sebelumnya
            const existingPhone = localStorage.getItem("phone");
            if (!existingPhone) {
              // Jika tidak ada, set placeholder kosong untuk menghindari null
              localStorage.setItem("phone", "");
              console.log("No phone found, setting empty placeholder");
            }
          }
        }


        showAlert("Login Berhasil! Selamat datang kembali 👋", "success");

        // Cek apakah phone sudah ada di localStorage
        const existingPhone = localStorage.getItem("phone");
        if (!existingPhone) {
          // Jika tidak ada, bawa ke profil page untuk lengkapi phone
          setTimeout(() => {
            window.location.href = "dasboard.html";
            // Setelah masuk, alert akan muncul meminta user lengkapi phone di profil
            setTimeout(() => {
              showAlert("Silakan lengkapi nomor telepon Anda di halaman Profil", "info");
            }, 2500);
          }, 2000);
        } else {
          setTimeout(() => {
            window.location.href = "dasboard.html";
          }, 2000);
        }

      } else {
        showAlert(data.message || "Username atau Password salah.", "error");
      }

    } catch (error) {
      console.error("Error:", error);
      showAlert("Gagal menghubungi server.", "error");

    } finally {
      loginButton.disabled = false;
      loginButton.textContent = "Sign in";
    }
  });
});
