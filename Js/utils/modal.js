// Custom Modal System dengan tema Museum Sri Baduga
// Primary color: #3b6e80

// ==================== SHOW ALERT ====================
export function showAlert(title, message = '', type = 'info') {
  // Handle both old format (message, type) and new format (title, message, type)
  if (typeof message === 'string' && (message === 'success' || message === 'error' || message === 'warning' || message === 'info')) {
    // Old format: showAlert(message, type)
    type = message;
    message = title;
    title = '';
  }
  const icons = {
    success: `<svg class="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>`,
    error: `<svg class="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>`,
    warning: `<svg class="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>`,
    info: `<svg class="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>`
  };

  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]';
  modal.innerHTML = `
    <div class="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 transform border border-primary/10" style="animation: slideUp 0.3s ease-out;">
      <div class="flex flex-col items-center text-center">
        <div class="mb-4">
          ${icons[type] || icons.info}
        </div>
        ${title ? `<h3 class="text-primary font-semibold text-lg mb-2">${title}</h3>` : ''}
        <p class="text-gray-700 text-base leading-relaxed">${message}</p>
        <button class="mt-6 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium ease-soft shadow-md">
          OK
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => {
    modal.style.animation = 'fadeOut 0.2s ease-out';
    setTimeout(() => modal.remove(), 200);
  };

  modal.querySelector('button').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Auto close setelah 3 detik untuk success messages
  if (type === 'success') {
    setTimeout(closeModal, 3000);
  }
}

// ==================== SHOW CONFIRM ====================
export function showConfirm(message, onConfirm, onCancel = null) {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn';
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 transform animate-scaleIn border border-primary/10">
        <div class="flex flex-col items-center text-center">
          <div class="mb-4">
            <svg class="w-14 h-14 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-primary mb-2">Konfirmasi</h3>
          <p class="text-primary/70 text-base leading-relaxed mb-6">${message}</p>
          <div class="flex gap-3 w-full">
            <button class="cancel-btn flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium ease-soft">
              Batal
            </button>
            <button class="confirm-btn flex-1 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium ease-soft shadow-md">
              Ya, Lanjutkan
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeModal = (confirmed) => {
      modal.classList.add('animate-fadeOut');
      setTimeout(() => modal.remove(), 200);
      resolve(confirmed);
      
      if (confirmed && onConfirm) {
        onConfirm();
      } else if (!confirmed && onCancel) {
        onCancel();
      }
    };

    modal.querySelector('.confirm-btn').addEventListener('click', () => closeModal(true));
    modal.querySelector('.cancel-btn').addEventListener('click', () => closeModal(false));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(false);
    });
  });
}

// ==================== ADD CUSTOM STYLES ====================
if (!document.getElementById('custom-modal-styles')) {
  const style = document.createElement('style');
  style.id = 'custom-modal-styles';
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    
    @keyframes scaleIn {
      from { 
        opacity: 0;
        transform: scale(0.95) translateY(-10px);
      }
      to { 
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    
    .animate-fadeIn {
      animation: fadeIn 0.2s ease-out;
    }
    
    .animate-fadeOut {
      animation: fadeOut 0.2s ease-out;
    }
    
    .animate-scaleIn {
      animation: scaleIn 0.3s ease-out;
    }
    
    .ease-soft {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  `;
  document.head.appendChild(style);
}
