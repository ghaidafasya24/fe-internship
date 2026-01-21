// File: /Js/controller/logout.js — modal konfirmasi logout dan pembersihan token

document.addEventListener("DOMContentLoaded", () => {
  const logoutButton = document.getElementById("logoutButton");
  const modal = document.getElementById("logoutModal");
  const confirmBtn = document.getElementById("confirmLogout");
  const cancelBtn = document.getElementById("cancelLogout");

  if (!logoutButton || !modal) return;

  // Saat tombol logout diklik → tampilkan modal
  logoutButton.addEventListener("click", (e) => {
    e.preventDefault();
    // show modal with entry animation
    modal.classList.remove("hidden");
    const card = document.getElementById('logoutCard');
    if (card) {
      // start from scaled down / transparent then animate to full
      card.classList.remove('scale-100','opacity-100');
      card.classList.add('scale-95','opacity-0');
      // allow next tick then animate to visible
      setTimeout(() => {
        card.classList.remove('scale-95','opacity-0');
        card.classList.add('scale-100','opacity-100');
      }, 20);
    }
  });

  // Jika user klik "Batal"
  cancelBtn.addEventListener("click", () => {
    // hide with reverse animation
    const card = document.getElementById('logoutCard');
    if (card) {
      card.classList.remove('scale-100','opacity-100');
      card.classList.add('scale-95','opacity-0');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 200);
    } else {
      modal.classList.add('hidden');
    }
  });

  // Jika user klik "Logout"
  confirmBtn.addEventListener("click", () => {
    // Hapus token dari cookie (both root path dan GitHub Pages subdirectory)
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "token=; path=/fe-internship/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

    // Clear localStorage data on logout
    localStorage.removeItem("token");
    localStorage.removeItem("token_expires");
    localStorage.removeItem("username");
    localStorage.removeItem("phone");

    // Detect if running on GitHub Pages (by checking pathname)
    const pathname = window.location.pathname;
    const isGitHubPages = pathname.includes('/fe-internship/');
    const loginPath = isGitHubPages ? '/fe-internship/index.html' : '/index.html';

    // Prevent back button dari kembali ke dashboard
    history.replaceState(null, null, loginPath);

    /*
    fetch("https://inventorymuseum-de54c3e9b901.herokuapp.com/api/users/logout", {
      method: "POST",
      credentials: "include"
    });
    */

    // Tutup modal dengan animasi lalu redirect ke landing page
    const card = document.getElementById('logoutCard');
    if (card) {
      card.classList.remove('scale-100','opacity-100');
      card.classList.add('scale-95','opacity-0');
      setTimeout(() => {
        modal.classList.add('hidden');
        // redirect after modal hides
        window.location.href = loginPath;
      }, 220);
    } else {
      modal.classList.add('hidden');
      window.location.href = loginPath;
    }
  });
});

