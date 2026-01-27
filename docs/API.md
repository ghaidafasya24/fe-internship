# 🔌 API Reference

## Base URL
```
https://inventorymuseum-de54c3e9b901.herokuapp.com
```

---

## Auth Endpoints

### Login
```http
POST /api/auth/login

Headers:
  Content-Type: application/json

Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response 200:
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "username": "john_doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}

Response 400:
{
  "success": false,
  "message": "Invalid email or password"
}
```

### Register
```http
POST /api/users/register

Headers:
  Content-Type: application/json

Body:
{
  "email": "newuser@example.com",
  "username": "john_doe",
  "password": "password123"
}

Response 201:
{
  "success": true,
  "message": "User registered successfully"
}

Response 400:
{
  "success": false,
  "message": "Email already registered"
}
```

---

## User Endpoints

### Get Profile
```http
GET /api/users/profile

Headers:
  Authorization: Bearer {token}
  Content-Type: application/json

Response 200:
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "username": "john_doe",
    "phone": "08123456789",
    "createdAt": "2025-01-01T10:00:00Z"
  }
}

Response 401:
{
  "success": false,
  "message": "Unauthorized"
}
```

### Update Profile
```http
PUT /api/users/profile

Headers:
  Authorization: Bearer {token}
  Content-Type: application/json

Body:
{
  "username": "new_username",
  "email": "newemail@example.com",
  "phone": "08987654321"
}

Response 200:
{
  "success": true,
  "message": "Profile updated successfully"
}
```

### Update Password
```http
PUT /api/users/update-password

Headers:
  Authorization: Bearer {token}
  Content-Type: application/json

Body:
{
  "oldPassword": "oldpass123",
  "newPassword": "newpass456"
}

Response 200:
{
  "success": true,
  "message": "Password updated successfully"
}

Response 400:
{
  "success": false,
  "message": "Old password is incorrect"
}
```

---

## Koleksi Endpoints

### Get All Koleksi
```http
GET /api/koleksi

Headers:
  Authorization: Bearer {token}

Query Params (optional):
  - gudang_id=123
  - kategori_id=456
  - search=text
  - limit=10
  - offset=0

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "kol_001",
      "nama_benda": "Keramik Putih",
      "no_register": "REG001",
      "no_inventory": "INV001",
      "kategori_id": "kat_001",
      "kategori": {
        "id": "kat_001",
        "nama": "Keramik"
      },
      "gudang_id": "gud_001",
      "gudang": {
        "id": "gud_001",
        "nama": "Gudang Utama"
      },
      "rak_id": "rak_001",
      "rak": "A1",
      "tahap": "Level 1",
      "deskripsi": "Keramik putih dari era...",
      "panjang": 25.5,
      "lebar": 15.0,
      "tinggi": 10.0,
      "kondisi": "Baik",
      "foto_url": "https://api.../uploads/kol_001.jpg",
      "createdAt": "2025-01-01T10:00:00Z",
      "updatedAt": "2025-01-20T15:30:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 10
}

Response 401:
{
  "success": false,
  "message": "Unauthorized"
}
```

### Get Single Koleksi
```http
GET /api/koleksi/:id

Response 200:
{
  "success": true,
  "data": {
    // Same as above single item
  }
}

Response 404:
{
  "success": false,
  "message": "Koleksi not found"
}
```

### Create Koleksi
```http
POST /api/koleksi

Headers:
  Authorization: Bearer {token}
  Content-Type: multipart/form-data

Body (Form Data):
  - nama_benda: "Keramik Putih"
  - no_register: "REG001"
  - no_inventory: "INV001"
  - kategori_id: "kat_001"
  - gudang_id: "gud_001"
  - rak_id: "rak_001"
  - tahap: "Level 1"
  - deskripsi: "Keramik putih dari..."
  - panjang: "25.5"
  - lebar: "15.0"
  - tinggi: "10.0"
  - kondisi: "Baik"
  - foto: (File object)

Response 201:
{
  "success": true,
  "message": "Koleksi created successfully",
  "data": {
    // Full koleksi object
  }
}

Response 400:
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "nama_benda": "Nama tidak boleh kosong",
    "no_register": "Nomor register sudah ada"
  }
}
```

### Update Koleksi
```http
PUT /api/koleksi/:id

Headers:
  Authorization: Bearer {token}
  Content-Type: multipart/form-data

Body (Form Data):
  (Same fields as Create, all optional except some required)
  - nama_benda: "Keramik Putih Baru"
  - foto: (File object, optional)
  - ... other fields

Response 200:
{
  "success": true,
  "message": "Koleksi updated successfully",
  "data": {
    // Updated koleksi object
  }
}

Response 404:
{
  "success": false,
  "message": "Koleksi not found"
}
```

### Delete Koleksi
```http
DELETE /api/koleksi/:id

Headers:
  Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "message": "Koleksi deleted successfully"
}

Response 404:
{
  "success": false,
  "message": "Koleksi not found"
}
```

### Check Duplicate Number
```http
POST /api/koleksi/check-duplicate

Headers:
  Authorization: Bearer {token}
  Content-Type: application/json

Body:
{
  "no_register": "REG001",
  "no_inventory": "INV001",
  "exclude_id": "kol_001"  // Optional: untuk exclude saat edit
}

Response 200:
{
  "success": true,
  "data": {
    "exists": false,
    "message": "Number available"
  }
}

Response 200:
{
  "success": true,
  "data": {
    "exists": true,
    "message": "Number already used"
  }
}
```

---

## Kategori Endpoints

### Get All Kategori
```http
GET /api/kategori

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "kat_001",
      "nama": "Keramik",
      "deskripsi": "Koleksi keramik",
      "jumlah_item": 25,
      "createdAt": "2025-01-01T10:00:00Z"
    }
  ]
}
```

### Create Kategori
```http
POST /api/kategori

Headers:
  Authorization: Bearer {token}
  Content-Type: application/json

Body:
{
  "nama": "Keramik",
  "deskripsi": "Koleksi keramik"
}

Response 201:
{
  "success": true,
  "data": {
    // Full kategori object
  }
}

Response 400:
{
  "success": false,
  "message": "Kategori name already exists"
}
```

### Update Kategori
```http
PUT /api/kategori/:id

Headers:
  Authorization: Bearer {token}
  Content-Type: application/json

Body:
{
  "nama": "Keramik Tradisional"
}

Response 200:
{
  "success": true,
  "data": {
    // Updated kategori object
  }
}
```

### Delete Kategori
```http
DELETE /api/kategori/:id

Headers:
  Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "message": "Kategori deleted successfully"
}

Response 400:
{
  "success": false,
  "message": "Cannot delete kategori with items"
}
```

---

## Gudang Endpoints

### Get All Gudang
```http
GET /api/gudang

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "gud_001",
      "nama": "Gudang Utama",
      "lokasi": "Jl. Cikole 21",
      "kapasitas": 1000,
      "jumlah_item": 250,
      "createdAt": "2025-01-01T10:00:00Z"
    }
  ]
}
```

### Get Rak by Gudang
```http
GET /api/gudang/:gudang_id/rak

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "rak_001",
      "gudang_id": "gud_001",
      "nama": "A1",
      "kapasitas": 50,
      "jumlah_item": 25
    }
  ]
}
```

### Get Tahap by Rak
```http
GET /api/gudang/:gudang_id/rak/:rak_id/tahap

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "tahap_001",
      "rak_id": "rak_001",
      "nama": "Level 1",
      "kapasitas": 10,
      "jumlah_item": 5
    }
  ]
}
```

---

## Laporan Endpoints

### Get Report Data
```http
GET /api/laporan/koleksi

Query Params (optional):
  - start_date=2025-01-01
  - end_date=2025-01-31
  - gudang_id=gud_001
  - kategori_id=kat_001
  - kondisi=Baik

Response 200:
{
  "success": true,
  "data": [
    // Same koleksi format, filtered
  ],
  "summary": {
    "total_item": 150,
    "total_nilai": 500000000,
    "rata_nilai": 3333333,
    "breakdown_kondisi": {
      "Baik": 120,
      "Rusak": 20,
      "Perlu Perbaiki": 10
    }
  }
}
```

### Get Per Gudang Report
```http
GET /api/laporan/per-gudang

Response 200:
{
  "success": true,
  "data": [
    {
      "gudang_id": "gud_001",
      "gudang_nama": "Gudang Utama",
      "total_item": 250,
      "breakdown": {
        "Baik": 200,
        "Rusak": 30,
        "Perlu Perbaiki": 20
      },
      "items": [
        // Array of koleksi items in this gudang
      ]
    }
  ]
}
```

---

## Maintenance Endpoints

### Get Maintenance History
```http
GET /api/maintenance

Query Params (optional):
  - koleksi_id=kol_001
  - start_date=2025-01-01
  - end_date=2025-01-31

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "maint_001",
      "koleksi_id": "kol_001",
      "koleksi_nama": "Keramik Putih",
      "jenis_perawatan": "Pembersihan",
      "tanggal": "2025-01-20",
      "catatan": "Dibersihkan dengan hati-hati",
      "biaya": 50000,
      "createdAt": "2025-01-20T10:00:00Z"
    }
  ],
  "summary": {
    "total_maintenance": 15,
    "total_biaya": 750000
  }
}
```

### Create Maintenance
```http
POST /api/maintenance

Headers:
  Authorization: Bearer {token}
  Content-Type: application/json

Body:
{
  "koleksi_id": "kol_001",
  "jenis_perawatan": "Pembersihan",
  "tanggal": "2025-01-20",
  "catatan": "Dibersihkan dengan hati-hati",
  "biaya": 50000
}

Response 201:
{
  "success": true,
  "data": {
    // Full maintenance object
  }
}
```

---

## Common Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "field_name": "Error message"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## How to Use in Frontend

### Simple GET Request
```javascript
import { authFetch } from "../utils/auth.js";
import { BASE_URL } from "../utils/config.js";

try {
  const response = await authFetch(`${BASE_URL}/api/koleksi`, {
    method: 'GET'
  });
  console.log(response.data);
} catch (error) {
  console.error('Error:', error.message);
}
```

### POST with Data
```javascript
try {
  const response = await authFetch(`${BASE_URL}/api/koleksi`, {
    method: 'POST',
    body: JSON.stringify({
      nama_benda: "Keramik",
      no_register: "REG001"
    })
  });
  showAlert('Success!', 'success');
} catch (error) {
  showAlert('Error: ' + error.message, 'error');
}
```

### POST with File Upload
```javascript
const formData = new FormData();
formData.append('nama_benda', 'Keramik');
formData.append('foto', fileInputElement.files[0]);

try {
  const response = await authFetch(`${BASE_URL}/api/koleksi`, {
    method: 'POST',
    body: formData
    // Note: Don't set Content-Type header, browser will do it
  });
} catch (error) {
  console.error('Upload error:', error.message);
}
```

### With Query Parameters
```javascript
const params = new URLSearchParams({
  kategori_id: 'kat_001',
  limit: 10,
  offset: 0
});

const response = await authFetch(
  `${BASE_URL}/api/koleksi?${params}`,
  { method: 'GET' }
);
```

---

**Last Updated**: January 27, 2026
**API Version**: 1.0
