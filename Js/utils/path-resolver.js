/**
 * Path Resolver untuk GitHub Pages Compatibility
 * Menangani case-sensitivity dan path normalization
 */

/**
 * Normalize path untuk module imports
 * @param {string} path - Path relative dari root project
 * @returns {string} Normalized path
 */
export function normalizePath(path) {
  // Ensure forward slashes
  let normalized = path.replace(/\\/g, '/');
  
  // Remove double slashes
  normalized = normalized.replace(/\/+/g, '/');
  
  // Ensure .js extension for ES modules
  if (!normalized.endsWith('.js') && !normalized.includes('?')) {
    normalized += '.js';
  }
  
  return normalized;
}

/**
 * Resolve module path dengan fallback untuk case sensitivity
 * @param {string} modulePath - Path ke module yang ingin di-import
 * @returns {Promise<Module>} Imported module
 */
export async function resolveModule(modulePath) {
  const normalized = normalizePath(modulePath);
  
  try {
    return await import(normalized);
  } catch (error) {
    console.warn(`⚠️ Failed to import ${normalized}, trying alternative case...`);
    
    // Try lowercase variant
    const lowercase = normalized.toLowerCase();
    if (lowercase !== normalized) {
      try {
        return await import(lowercase);
      } catch (altError) {
        console.error(`❌ Failed to import module: ${modulePath}`, error);
        throw error;
      }
    }
    throw error;
  }
}

/**
 * Get script source path relative to document location
 * @param {string} relativePath - Relative path from root
 * @returns {string} Full source path
 */
export function getScriptPath(relativePath) {
  const base = new URL('.', import.meta.url).pathname;
  const normalized = normalizePath(relativePath);
  return new URL(normalized, base).href;
}

/**
 * Initialize module loader with diagnostics
 */
export function initializeModuleLoader() {
  console.log('📦 Module Loader Initialized');
  console.log('📍 Base URL:', import.meta.url);
  console.log('🌐 Environment:', 
    window.location.hostname.includes('github.io') ? 'GitHub Pages' : 'Local'
  );
}

// Log when loader is loaded
console.log('✅ Path Resolver loaded');
