/**
 * Universal JS Loader untuk GitHub Pages
 * Memastikan semua module terpanggil dengan benar
 */

// Deteksi environment
const isGitHubPages = window.location.hostname.includes('github.io') || 
                       window.location.hostname.includes('github.com');

console.log('🔍 Environment:', isGitHubPages ? 'GitHub Pages' : 'Local Development');
console.log('📍 Current URL:', window.location.href);
console.log('📂 Current Path:', window.location.pathname);

/**
 * Utility function untuk normalize path
 */
function getModulePath(relativePath) {
  // Remove leading ../
  let cleanPath = relativePath.replace(/^\.\.\/+/g, '');
  
  // Ensure .js extension
  if (!cleanPath.endsWith('.js')) {
    cleanPath += '.js';
  }
  
  return cleanPath;
}

/**
 * Dynamic module import dengan fallback
 */
async function loadModule(modulePath) {
  try {
    console.log('📦 Loading module:', modulePath);
    const module = await import(modulePath);
    console.log('✅ Module loaded:', modulePath);
    return module;
  } catch (error) {
    console.error('❌ Failed to load module:', modulePath, error);
    // Try alternative path (lowercase)
    const altPath = modulePath.replace(/\/([A-Z])/g, (match, letter) => '/' + letter.toLowerCase());
    try {
      console.log('🔄 Retrying with alternative path:', altPath);
      const module = await import(altPath);
      console.log('✅ Module loaded (alternative):', altPath);
      return module;
    } catch (altError) {
      console.error('❌ Failed to load module (alternative):', altPath, altError);
      throw error;
    }
  }
}

// Export untuk digunakan di file lain
window.jsLoader = {
  loadModule,
  getModulePath,
  isGitHubPages
};

console.log('✅ JS Loader initialized');
