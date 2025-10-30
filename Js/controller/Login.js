// File: /Js/controller/Login.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const loginButton = document.getElementById("loginButton");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Ambil nilai input username dan password
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      alert("Please fill in both username and password.");
      return;
    }

    // Ubah teks tombol selama proses login
    loginButton.disabled = true;
    loginButton.textContent = "Signing in...";

    try {
      // Kirim request ke API login
      const response = await fetch(
        "https://inventorymuseum-de54c3e9b901.herokuapp.com/api/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
          credentials: "include", // penting jika backend kirim cookie
        }
      );

      const data = await response.json();

      if (response.ok) {
        // alert("Login successful!");

        // Simpan token ke cookie (kalau backend tidak otomatis kirim cookie)
        if (data.token) {
          document.cookie = `token=${data.token}; path=/; expires=${new Date(
            Date.now() + 60 * 60 * 1000
          ).toUTCString()};`;
        }

        // Redirect otomatis ke halaman berikutnya
        window.location.href = "landingpage.html";
      } else {
        alert(data.message || "Invalid username or password.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while connecting to the server.");
    } finally {
      // Kembalikan tombol ke kondisi semula
      loginButton.disabled = false;
      loginButton.textContent = "Sign in";
    }
  });
});
