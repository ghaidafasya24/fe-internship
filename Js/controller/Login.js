// File: /Js/controller/Login.js
import { showAlert } from "../utils/modal.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const loginButton = document.getElementById("loginButton");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      showAlert("Username dan Password harus diisi!", "warning");
      return;
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
          body: JSON.stringify({ username, password })
        }
      );

      const data = await response.json();

      if (response.ok) {

        if (data.token) {
          const expireTime = new Date(Date.now() + 30 * 60 * 1000).toUTCString(); // 30 menit

          // Simpan di cookie
          document.cookie = `token=${data.token}; path=/; expires=${expireTime}; SameSite=None; Secure`;
          // Simpan di localStorage + time expired
          localStorage.setItem("token", data.token);
          localStorage.setItem("token_expires", Date.now() + 30 * 60 * 1000);
        }


        showAlert("Login Berhasil! Selamat datang kembali 👋", "success");

        setTimeout(() => {
          window.location.href = "dasboard.html";
        }, 2000);

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
