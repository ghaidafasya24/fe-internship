# 📤 GitHub Pages Deployment Guide

## Pre-Deployment Checklist

- [x] All JavaScript files use `.js` extensions in imports
- [x] Relative paths verified and corrected
- [x] Path resolver utility created (`Js/utils/path-resolver.js`)
- [x] Global module loader added (`js-loader.js`)
- [x] Server config file added (`.htaccess`)
- [x] Module loading diagnostics enabled

---

## Step 1: Repository Setup

### Create/Configure GitHub Repository

```bash
# If repo doesn't exist yet
git init
git remote add origin https://github.com/YOUR_USERNAME/fe-internship.git
git branch -M main

# If repo exists
git remote set-url origin https://github.com/YOUR_USERNAME/fe-internship.git
```

### Update Repository Settings

1. Go to **Settings** → **Pages**
2. Under "Build and deployment":
   - Source: **Deploy from a branch**
   - Branch: **main** (or your branch name)
   - Folder: **/ (root)**
3. Click **Save**

---

## Step 2: Verify File Structure

Before deploying, ensure project structure matches:

```
your-repo/
├── index.html                    ✅ Root homepage
├── .htaccess                     ✅ Server config (Apache)
├── js-loader.js                  ✅ Global module loader
├── Js/
│   ├── config/
│   │   ├── url.js               ✅ Correct extension
│   │   ├── url_kategori.js      ✅ Correct extension
│   │   └── url_koleksi.js       ✅ Correct extension
│   ├── controller/
│   │   ├── add-collection.js    ✅ All controllers correct
│   │   ├── add-collection-fixed.js
│   │   ├── Login.js
│   │   └── ... (others)
│   ├── Temp/
│   │   ├── tabel_kategori.js    ✅ Correct extension
│   │   └── ... (others)
│   └── utils/
│       ├── auth.js              ✅ Correct extension
│       ├── config.js            ✅ Correct extension
│       ├── modal.js             ✅ Correct extension
│       ├── path-resolver.js     ✅ NEW - Important!
│       ├── validation.js        ✅ Correct extension
│       └── ... (others)
├── Template/
│   ├── login.html               ✅ Reference OK
│   ├── register.html            ✅ Reference OK
│   ├── dasboard.html            ✅ Reference OK
│   └── admin/
│       ├── koleksi.html         ✅ Reference OK
│       ├── kategori.html        ✅ Reference OK
│       └── ... (others)
└── assets/
    └── images/                  ✅ Static files
```

**⚠️ CRITICAL**: Make sure **file extensions match exactly** (including `.js` on all JS files).

---

## Step 3: Update Base URLs

### For API Configuration

Open `Js/utils/config.js` and verify:

```javascript
// ✅ Correct - should point to your backend
export const BASE_URL = "https://inventorymuseum-de54c3e9b901.herokuapp.com";

// ❌ DON'T use localhost or 127.0.0.1
// export const BASE_URL = "http://localhost:3000";
```

### For Static Assets

Open `index.html` and verify image paths:

```html
<!-- ✅ CORRECT -->
<img src="assets/images/Logo_Real_SriBaduga.png" alt="Logo">

<!-- ❌ AVOID - Absolute Windows paths -->
<!-- <img src="C:\Users\...\assets\images\..." alt="Logo"> -->
```

---

## Step 4: Deployment Commands

### Option A: Using Git (Recommended)

```bash
# Stage all files
git add .

# Commit with message
git commit -m "Deploy to GitHub Pages: Fix module loading for GitHub Pages compatibility"

# Push to main branch
git push origin main

# GitHub Actions will automatically deploy
# Wait 1-2 minutes for site to be live
```

### Option B: Check Deployment Status

```bash
# View GitHub Pages status
git log --oneline | head -5
# Should see your recent commit

# Or check in GitHub web:
# Repository → Settings → Pages → Recent deployments
```

---

## Step 5: Verify Deployment

### Check if Site is Live

1. Go to: `https://YOUR_USERNAME.github.io/fe-internship/`
2. Should see homepage loading
3. Check browser console (F12 → Console tab)

### Check Console Logs

Expected logs when site loads:

```
✅ JS Loader initialized
✅ Module Loader Initialized
✅ Path Resolver loaded
```

### Test Module Loading

1. Open DevTools (F12)
2. Go to **Console** tab
3. Paste and run:

```javascript
// Test path resolver
import { normalizePath } from './Js/utils/path-resolver.js';
console.log(normalizePath('../controller/test'));
// Should output: ../controller/test.js ✅
```

### Check Network Requests

1. Go to **Network** tab
2. Reload page (F5)
3. Look for:
   - ✅ HTML files: Status 200
   - ✅ JS files: Status 200
   - ✅ CSS from CDN: Status 200
   - ❌ Any 404 errors = problematic imports
   - ❌ Any CORS errors = backend issue

---

## Step 6: Troubleshooting

### Issue: "Module not found" Error

**Error message**:
```
Failed to load module: ../controller/some-file
```

**Solution**:
1. Check **exact filename** (case-sensitive on GitHub!)
   - Windows: `Login.js` (with capital L)
   - GitHub Pages: must be `Login.js` (not `login.js`)

2. Verify in file explorer that file exists with exact name

3. Check import statement has `.js` extension

### Issue: CSS/Images Not Loading

**Error**:
```
Failed to load resource: 404
```

**Solution**:
1. Check image path is relative, not absolute Windows path
2. Ensure `assets/` folder exists in root
3. Verify exact folder names (case-sensitive)

### Issue: API Calls Returning 401/403

**Error**:
```
401 Unauthorized
```

**Solution**:
1. Token might be expired - logout and login again
2. Check if backend URL in `config.js` is correct
3. Verify backend is accessible from internet (not localhost)
4. Check CORS is enabled on backend

### Issue: Still Having Problems?

1. **Clear browser cache**: Ctrl+Shift+Del (Windows) or Cmd+Shift+Delete (Mac)
2. **Hard refresh**: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
3. **Check GitHub Pages URL**: Should be `https://username.github.io/repo/`
4. **Wait for deployment**: Sometimes takes 2-5 minutes
5. **Check GitHub Actions**: Settings → Actions for deployment logs

---

## Important Notes

### ⚠️ Case Sensitivity
GitHub Pages (Linux server) is **case-sensitive**:
- `Login.js` ≠ `login.js`
- `Js/` ≠ `js/`
- File must match **exactly**

### ⚠️ File Extensions
All JavaScript imports **MUST** have `.js` extension:
```javascript
// ✅ CORRECT
import { func } from "./module.js";

// ❌ WRONG
import { func } from "./module";
```

### ⚠️ Relative Paths Only
Use only relative paths for local files:
```javascript
// ✅ CORRECT
import { func } from "../utils/helper.js";
import { get } from "https://cdn.example.com/module.js";

// ❌ WRONG
import { func } from "/absolute/path/helper.js";
import { func } from "C:\\Users\\...\\helper.js";
```

### ⚠️ .htaccess Limitations
- `.htaccess` works on **Apache** servers only
- GitHub Pages may use different server
- But path resolver handles this automatically

---

## Success Criteria

✅ You've successfully deployed when:

1. **Site loads** at `https://YOUR_USERNAME.github.io/fe-internship/`
2. **No 404 errors** in Network tab for `.js` files
3. **Console shows** module loading logs
4. **Login page works** and accepts credentials
5. **Dashboard loads** after login (if authenticated)

---

## Rollback (If Needed)

If something goes wrong after deploy:

```bash
# View commit history
git log --oneline

# Go back to previous commit
git revert HEAD

# Or reset to specific commit
git reset --hard COMMIT_HASH

# Push changes
git push origin main
```

---

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [ES Modules in Browsers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Debugging GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)

---

## Support

If you encounter issues not covered here:

1. Check browser console for error messages
2. Check Network tab for failed requests
3. Verify file names (case-sensitive)
4. Ensure backend URL is correct
5. Test with browser cache cleared

---

**Last Updated**: 2026-01-21  
**Status**: ✅ Ready for Deployment
