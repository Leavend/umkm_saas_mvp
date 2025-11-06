# 🧪 Google Popup Authentication Testing Guide

## URL Analysis

### URL yang Anda berikan:
```
http://localhost:3000/api/auth/google/redirect?redirect_to=%2Fid&popup=true&state=%257B%2522redirectTo%2522%253A%2522%252Fid%2522%252C%2522isPopup%2522%253Atrue%257D
```

### Parameter Breakdown:
- **Base URL**: `http://localhost:3000/api/auth/google/redirect`
- **redirect_to**: `%2Fid` → `/id`
- **popup**: `true`
- **state**: `%257B%2522redirectTo%2522%253A%2522%252Fid%2522%252C%2522isPopup%2522%253Atrue%257D`

### State Parameter Decoding:
```
Step 1: %7B%22redirectTo%22%3A%22%2Fid%22%2C%22isPopup%22%3Atrue%7D
Step 2: {"redirectTo":"/id","isPopup":true}
```

## 🚀 Testing Methods

### 1. Manual Browser Testing
```javascript
// Paste di browser console untuk test manual
const popup = window.open(
    'http://localhost:3000/api/auth/google/redirect?redirect_to=%2Fid&popup=true&state=%257B%2522redirectTo%2522%253A%2522%252Fid%2522%252C%2522isPopup%2522%253Atrue%257D',
    'google-auth-test',
    'width=500,height=600,left=' + (screen.width/2 - 250) + ',top=' + (screen.height/2 - 300)
);

// Listen for messages
window.addEventListener('message', (event) => {
    console.log('Received message:', event.data);
    if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        console.log('✅ Auth successful!');
        popup.close();
    } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        console.log('❌ Auth failed:', event.data.error);
        popup.close();
    }
});
```

### 2. Using Test File
Buka file `tmp_rovodev_test_popup.html` di browser untuk interface testing yang lengkap.

### 3. Component Integration Test
```tsx
// Test dalam React component
import { useGoogleAuth } from "~/hooks/use-google-auth";

function TestComponent() {
    const { signInWithGoogle, isLoading } = useGoogleAuth({
        redirectPath: "/id",
        onSuccess: () => console.log("Success!"),
        onError: (error) => console.error("Error:", error)
    });

    return (
        <button onClick={() => signInWithGoogle()} disabled={isLoading}>
            {isLoading ? "Membuka popup..." : "Test Google Auth"}
        </button>
    );
}
```

## 🔍 What to Expect

### 1. Normal Flow:
1. ✅ Popup window terbuka (500x600px, di tengah layar)
2. ✅ Redirect ke Google OAuth
3. ✅ User login di Google
4. ✅ Callback ke `/api/auth/google/popup-callback`
5. ✅ Token exchange & verification
6. ✅ Success message ke parent window
7. ✅ Popup tertutup otomatis
8. ✅ Parent window receive success event

### 2. Error Scenarios:
- **Popup Blocked**: Error message + fallback suggestion
- **User Cancels**: "Authentication cancelled" message
- **OAuth Error**: Specific error dari Google
- **Token Exchange Fail**: "Failed to exchange authorization code"
- **Timeout**: Auto-close after 5 minutes

## 🐛 Debugging Checklist

### Environment Variables:
```bash
# Check these are set:
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_google_client_secret
```

### Network Tab Monitoring:
1. `GET /api/auth/google/redirect` → Should redirect to Google
2. `GET accounts.google.com/o/oauth2/v2/auth` → Google OAuth page
3. `GET /api/auth/google/popup-callback?code=...` → Callback with auth code
4. `POST oauth2.googleapis.com/token` → Token exchange
5. Browser console shows authentication result

### Console Logs:
```javascript
// Check for these logs:
"Google user authenticated: { sub, email, name, picture }"
"Received message: { type: 'GOOGLE_AUTH_SUCCESS', redirectTo: '/id' }"
```

## 🔧 Common Issues & Solutions

### Issue 1: Popup Blocked
**Symptoms**: `popup` is null, no window opens
**Solution**: 
```javascript
if (!popup) {
    alert('Popup diblokir. Silakan izinkan popup dan coba lagi.');
    // Fallback to redirect
    window.location.href = authUrl;
}
```

### Issue 2: CORS Errors
**Symptoms**: "Access to fetch at 'oauth2.googleapis.com' blocked by CORS"
**Solution**: This is normal for Google OAuth, browser handles it

### Issue 3: Invalid Client ID
**Symptoms**: "invalid_client" error from Google
**Solution**: Check Google Cloud Console OAuth setup

### Issue 4: Redirect URI Mismatch
**Symptoms**: "redirect_uri_mismatch" from Google
**Solution**: Add `http://localhost:3000/api/auth/google/popup-callback` to authorized URIs

### Issue 5: State Mismatch
**Symptoms**: Can't parse state parameter
**Solution**: Check double-encoding in URL generation

## 📊 Success Metrics

### Performance:
- Popup opens in < 1 second
- Google OAuth loads in < 2 seconds
- Token exchange completes in < 3 seconds
- Total flow time < 10 seconds

### UX Quality:
- Clear loading states
- Proper error messages in Indonesian
- Smooth popup positioning
- Auto-cleanup on completion

### Security:
- Origin validation works
- Token verification successful
- No sensitive data in URL params
- Proper session creation

## 🎯 Next Steps After Testing

### If Working:
1. ✅ Integrate with production Google OAuth app
2. ✅ Add session persistence
3. ✅ Implement user profile management
4. ✅ Add analytics tracking
5. ✅ Deploy to staging environment

### If Issues Found:
1. 🔍 Check browser console for errors
2. 🔍 Verify environment variables
3. 🔍 Test Google OAuth config
4. 🔍 Review callback URL setup
5. 🔍 Debug state parameter encoding