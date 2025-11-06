# 🔧 Quick Environment Setup Guide

## 📋 Status Check:
Berdasarkan logs, masih ada **500 error** di callback yang berarti environment variable belum di-set dengan benar.

## ⚡ Quick Fix Steps:

### 1. File `.env.local` sudah dibuat, sekarang edit:
```bash
# Edit file .env.local yang sudah dibuat
code .env.local
# atau
nano .env.local
```

### 2. Get Google Client Secret:
1. **Buka**: [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. **Cari**: OAuth 2.0 Client ID dengan ID `824219404933-5pd0eo0tsecake1r0li68chst4ht6hfm`
3. **Klik**: Edit (pencil icon)
4. **Copy**: Client Secret (biasanya dimulai dengan `GOCSPX-`)
5. **Replace**: `GOCSPX-YOUR_CLIENT_SECRET_HERE` di `.env.local`

### 3. Contoh isi `.env.local` yang benar:
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=824219404933-5pd0eo0tsecake1r0li68chst4ht6hfm.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=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nsole
```

### 4. Restart development server:
```bash
# Stop current server (Ctrl+C) kemudian:
bun run dev
```

### 5. Test lagi popup URL

## 🚨 Important Notes:

### Pastikan di Google Console sudah ada:
**Authorized redirect URIs:**
```
http://localhost:3000/api/auth/callback
```

**Authorized JavaScript origins:**
```
http://localhost:3000
```

## 🎯 Expected Result setelah fix:
```
✅ GET /api/auth/google/redirect → 302
✅ User login di Google  
✅ GET /api/auth/callback → 200 (bukan 500!)
✅ Success postMessage
✅ Popup auto-close
```

Apa sudah bisa akses Google Console untuk mendapatkan client secret?