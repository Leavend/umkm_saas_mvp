# 🔧 Environment Variables Setup Check

## Based on the logs, kita bisa lihat bahwa:

### ✅ Yang Sudah Bekerja:
1. **Popup redirect**: `GET /api/auth/google/redirect` → 302 ✅
2. **Google OAuth**: User berhasil login di Google ✅
3. **Authorization code**: Code diterima di callback ✅

### ❌ Yang Masih Error:
1. **Token exchange**: 500 error di `/api/auth/callback` ❌
2. **Environment variables**: Kemungkinan `GOOGLE_OAUTH_CLIENT_SECRET` belum di-set

## 🚀 Fix yang Diperlukan:

### 1. Set Environment Variables
Buat/edit file `.env.local` di root project:

```bash
# .env.local
NEXT_PUBLIC_GOOGLE_CLIENT_ID=824219404933-5pd0eo0tsecake1r0li68chst4ht6hfm.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-google-oauth-client-secret-here
```

### 2. Get Google OAuth Client Secret
1. Buka [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Klik pada OAuth 2.0 Client ID Anda
3. Copy **Client Secret**
4. Paste ke `.env.local`

### 3. Restart Development Server
```bash
# Restart server agar environment variables terbaca
bun run dev
```

### 4. Test Lagi
```javascript
// Test di browser console:
const popup = window.open(
    'http://localhost:3000/api/auth/google/redirect?redirect_to=%2Fid&popup=true&state=%257B%2522redirectTo%2522%253A%2522%252Fid%2522%252C%2522isPopup%2522%253Atrue%257D',
    'test',
    'width=500,height=600'
);

window.addEventListener('message', (e) => {
    console.log('Result:', e.data);
});
```

## 🔍 Expected Flow (setelah fix):
1. ✅ Popup opens
2. ✅ Redirect ke Google OAuth chooser
3. ✅ User login
4. ✅ Callback dengan authorization code
5. ✅ **Token exchange berhasil** ← ini yang kita fix
6. ✅ **Success message ke parent window**
7. ✅ **Popup tertutup otomatis**

## 📝 Debug Checklist:
- [ ] `.env.local` file created
- [ ] `GOOGLE_OAUTH_CLIENT_SECRET` added
- [ ] Development server restarted
- [ ] Browser cache cleared
- [ ] Test popup again

Setelah environment variables di-set dengan benar, popup authentication seharusnya berjalan sempurna! 🎉