# 🔧 Google OAuth Setup - Redirect URI Mismatch Fix

## ❌ Error yang Terjadi:
```
redirect_uri_mismatch
```

**Penyebab:** URL `http://localhost:3000/api/auth/google/popup-callback` belum didaftarkan di Google Cloud Console sebagai authorized redirect URI.

## ✅ Cara Memperbaiki:

### 1. Buka Google Cloud Console
- Pergi ke [Google Cloud Console](https://console.cloud.google.com/)
- Pilih project Anda atau buat project baru

### 2. Enable Google+ API dan Google Identity
- Pergi ke **APIs & Services > Library**
- Cari dan enable:
  - Google+ API
  - Google Identity API
  - Google OAuth2 API

### 3. Konfigurasi OAuth Consent Screen
- Pergi ke **APIs & Services > OAuth consent screen**
- Pilih **External** user type
- Isi informasi aplikasi:
  - App name: "Your App Name"
  - User support email: email Anda
  - Developer contact email: email Anda

### 4. Buat OAuth 2.0 Credentials
- Pergi ke **APIs & Services > Credentials**
- Klik **+ CREATE CREDENTIALS > OAuth client ID**
- Pilih **Web application**

### 5. ⚠️ PENTING: Tambahkan Authorized Redirect URIs
Tambahkan semua URL berikut ke **Authorized redirect URIs**:

**Development:**
```
http://localhost:3000/api/auth/google/callback
http://localhost:3000/api/auth/google/popup-callback
http://127.0.0.1:3000/api/auth/google/callback
http://127.0.0.1:3000/api/auth/google/popup-callback
```

**Production (ganti dengan domain Anda):**
```
https://yourdomain.com/api/auth/google/callback
https://yourdomain.com/api/auth/google/popup-callback
```

### 6. Copy Credentials
- Copy **Client ID** dan **Client Secret**
- Masukkan ke file `.env.local`:

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=824219404933-5pd0eo0tsecake1r0li68chst4ht6hfm.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret-here
```

## 🚀 Test Setelah Setup

### 1. Restart Development Server
```bash
bun run dev
```

### 2. Test URL Lagi
```
http://localhost:3000/api/auth/google/redirect?redirect_to=%2Fid&popup=true&state=%257B%2522redirectTo%2522%253A%2522%252Fid%2522%252C%2522isPopup%2522%253Atrue%257D
```

### 3. Verifikasi di Network Tab
- Buka Developer Tools > Network
- Lihat redirect chain:
  1. `GET /api/auth/google/redirect` → 302
  2. `GET accounts.google.com/o/oauth2/auth/oauthchooseaccount` → 200
  3. User login → redirect ke callback
  4. `GET /api/auth/google/popup-callback?code=...` → 200

## 🔍 Troubleshooting

### Jika Masih Error redirect_uri_mismatch:
1. **Periksa spelling** URL callback di Google Console
2. **Tunggu 5-10 menit** setelah menambah URI (propagation delay)
3. **Clear browser cache** dan cookies
4. **Periksa protocol** (http vs https)
5. **Periksa port** (3000 vs port lain)

### Jika Error invalid_client:
- Pastikan Client ID benar di environment variable
- Pastikan project sudah publish (bukan draft)

### Jika Error access_denied:
- User menolak akses
- Atau OAuth consent screen belum disetup

## 📝 Checklist Lengkap:

- [ ] Google Cloud project created
- [ ] APIs enabled (Google+ API, Google Identity)
- [ ] OAuth consent screen configured
- [ ] OAuth client ID created
- [ ] ✅ **Redirect URIs added ke Google Console**
- [ ] Environment variables set
- [ ] Development server restarted
- [ ] Browser cache cleared

## 🎯 Expected URLs di Google Console:

**Authorized JavaScript origins:**
```
http://localhost:3000
http://127.0.0.1:3000
https://yourdomain.com
```

**Authorized redirect URIs:**
```
http://localhost:3000/api/auth/google/callback
http://localhost:3000/api/auth/google/popup-callback
http://127.0.0.1:3000/api/auth/google/callback
http://127.0.0.1:3000/api/auth/google/popup-callback
https://yourdomain.com/api/auth/google/callback
https://yourdomain.com/api/auth/google/popup-callback
```

Setelah setup ini, popup authentication seharusnya bekerja dengan sempurna! 🎉