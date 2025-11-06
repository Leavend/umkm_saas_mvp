# 🚨 URGENT: Fix redirect_uri_mismatch

## Problem
```
Error 400: redirect_uri_mismatch
warung visual AI sent an invalid request
```

## Root Cause
URL `http://localhost:3000/api/auth/callback` tidak terdaftar di Google Cloud Console sebagai authorized redirect URI.

## ⚡ IMMEDIATE FIX STEPS:

### 1. Open Google Cloud Console
🔗 [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)

### 2. Find Your OAuth Client
- Look for OAuth 2.0 Client ID associated with "warung visual AI"
- Client ID: `824219404933-5pd0eo0tsecake1r0li68chst4ht6hfm.apps.googleusercontent.com`

### 3. Edit OAuth Client
- Click the **pencil/edit icon** next to your OAuth client
- Scroll down to **"Authorized redirect URIs"**

### 4. Add This EXACT URL:
```
http://localhost:3000/api/auth/callback
```

### 5. Also Add These (for safety):
```
http://127.0.0.1:3000/api/auth/callback
https://localhost:3000/api/auth/callback
```

### 6. Authorized JavaScript Origins
Make sure these are also added:
```
http://localhost:3000
http://127.0.0.1:3000
https://localhost:3000
```

### 7. Save & Wait
- Click **SAVE**
- Wait **2-5 minutes** for changes to propagate
- Clear browser cache
- Test again

## 🧪 Test After Fix

### Browser Console Test:
```javascript
// Test popup
const popup = window.open(
    'http://localhost:3000/api/auth/google/redirect?redirect_to=%2Fid&popup=true&state=%257B%2522redirectTo%2522%253A%2522%252Fid%2522%252C%2522isPopup%2522%253Atrue%257D',
    'test', 
    'width=500,height=600'
);

// Should redirect to Google OAuth chooser WITHOUT error
```

### Expected Flow:
1. ✅ Popup opens → `localhost:3000/api/auth/google/redirect`
2. ✅ Redirects to → `accounts.google.com/o/oauth2/auth/oauthchooseaccount`
3. ✅ User selects Google account
4. ✅ Callback to → `localhost:3000/api/auth/callback` ← **This MUST be in Google Console**
5. ✅ Success message + popup closes

## ⚠️ Common Issues:

### If Still Getting Error:
1. **Double-check spelling** of the redirect URI in Google Console
2. **Wait longer** - Google can take up to 10 minutes to propagate
3. **Clear browser cache completely**
4. **Try incognito/private browsing**
5. **Check the exact protocol** (http vs https)

### If "App Not Verified" Warning:
- Click "Advanced" → "Go to warung visual AI (unsafe)"
- This is normal for development apps

### If Wrong Client ID:
- Make sure environment variable matches:
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=824219404933-5pd0eo0tsecake1r0li68chst4ht6hfm.apps.googleusercontent.com
```

## 📸 Screenshot Guide:
1. Open Google Console → APIs & Services → Credentials
2. Find OAuth 2.0 Client ID
3. Click Edit
4. Scroll to "Authorized redirect URIs"
5. Add the URLs above
6. Save

**This should fix the redirect_uri_mismatch error immediately!** 🎯