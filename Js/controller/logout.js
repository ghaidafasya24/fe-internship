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
    // Hapus token dari cookie (support both root & GitHub Pages subdirectory)
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "token=; path=" + window.location.pathname.split('/').slice(0, -1).join('/') + "/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

    // (Opsional) panggil API logout kalau backend punya
    // Clear localStorage data on logout
    localStorage.removeItem("token");
    localStorage.removeItem("token_expires");
    localStorage.removeItem("username");
    localStorage.removeItem("phone");

    // Detect base path (support GitHub Pages subdirectory)
    const basePath = window.location.pathname.includes('/fe-internship') 
      ? '/fe-internship/' 
      : '/';
    const loginPath = basePath + 'index.html';

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
        // redirect after modal hides (use relative path for GitHub Pages compatibility)
        window.location.href = loginPath;
      }, 220);
    } else {
      modal.classList.add('hidden');
      window.location.href = loginPath;
    }
  });
});

