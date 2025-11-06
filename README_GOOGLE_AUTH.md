# Google Authentication dengan Popup UX

Implementasi ini menyediakan pengalaman pengguna yang lebih baik untuk Google Authentication dengan menggunakan popup window yang otomatis tertutup setelah autentikasi berhasil.

## Fitur Utama

### 🚀 Popup Authentication
- **Tab baru otomatis**: Ketika user klik login, tab baru akan terbuka untuk Google OAuth
- **Auto-close**: Tab akan tertutup otomatis setelah login berhasil/gagal
- **Feedback visual**: Loading state dan pesan status yang jelas
- **Error handling**: Penanganan error yang user-friendly

### 🔒 Keamanan
- **Origin validation**: Pesan popup divalidasi origin-nya
- **Timeout protection**: Popup akan timeout setelah 5 menit
- **State management**: Secure state handling untuk redirect

## Arsitektur

### File Structure
```
src/
├── lib/
│   └── google-auth.ts              # Core popup logic
├── app/api/auth/google/
│   ├── route.ts                    # Original API route
│   ├── redirect/
│   │   └── route.ts               # Popup redirect handler
│   └── popup-callback/
│       └── route.ts               # Popup callback handler
├── components/
│   ├── auth-modal.tsx             # Enhanced auth modal
│   └── auth/
│       ├── one-tap-trigger.tsx    # Google One Tap integration
│       ├── popup-auth-handler.tsx # Popup message handler
│       └── popup-status-indicator.tsx # Visual feedback
└── hooks/
    ├── use-google-auth.ts         # Enhanced auth hook
    └── use-google-one-tap.ts      # One Tap hook
```

### Flow Diagram
```
User clicks login
       ↓
Open popup window (/api/auth/google/redirect)
       ↓
Redirect to Google OAuth
       ↓
Google callback (/api/auth/google/popup-callback)
       ↓
Send success message to parent window
       ↓
Close popup & refresh parent page
```

## Penggunaan

### 1. Basic Usage dalam Component
```tsx
import { useGoogleAuth } from "~/hooks/use-google-auth";

function LoginButton() {
  const { signInWithGoogle, isLoading } = useGoogleAuth({
    onSuccess: () => {
      console.log('Login berhasil!');
    },
    onError: (error) => {
      console.error('Login gagal:', error);
    }
  });

  return (
    <button 
      onClick={() => signInWithGoogle()}
      disabled={isLoading}
    >
      {isLoading ? 'Membuka tab baru...' : 'Login dengan Google'}
    </button>
  );
}
```

### 2. Dengan Status Indicator
```tsx
import { PopupStatusIndicator } from "~/components/auth/popup-status-indicator";

function AuthPage() {
  const [showStatus, setShowStatus] = useState(false);
  const { signInWithGoogle, isLoading } = useGoogleAuth({
    onSuccess: () => setShowStatus(false)
  });

  const handleLogin = () => {
    setShowStatus(true);
    signInWithGoogle();
  };

  return (
    <>
      <button onClick={handleLogin}>Login</button>
      <PopupStatusIndicator 
        isOpen={showStatus} 
        onClose={() => setShowStatus(false)} 
      />
    </>
  );
}
```

### 3. Google One Tap Integration
```tsx
import { OneTapTrigger } from "~/components/auth/one-tap-trigger";

function AuthLayout() {
  return (
    <div>
      {/* One Tap akan otomatis muncul di halaman login */}
      <OneTapTrigger path="/auth/signin" />
      {/* Konten lainnya */}
    </div>
  );
}
```

## Konfigurasi

### Environment Variables
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_google_client_secret
```

### Google OAuth Setup
1. Buat project di Google Cloud Console
2. Enable Google+ API dan Google Identity API
3. Tambahkan authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/popup-callback` (development)
   - `https://yourdomain.com/api/auth/google/popup-callback` (production)

## Customization

### Popup Window Size & Position
```typescript
// di google-auth.ts
const popup = window.open(
  authUrl,
  'google-auth-popup',
  'width=500,height=600,left=' + (screen.width/2 - 250) + ',top=' + (screen.height/2 - 300)
);
```

### Timeout Duration
```typescript
// Ubah timeout dari 5 menit menjadi durasi lain
setTimeout(() => {
  // cleanup
}, 3 * 60 * 1000); // 3 menit
```

### Custom Error Messages
```typescript
// di popup-callback/route.ts
const errorMessages = {
  access_denied: 'Anda menolak akses aplikasi',
  invalid_request: 'Permintaan tidak valid',
  // tambah pesan custom lainnya
};
```

## Troubleshooting

### Popup Diblokir Browser
```typescript
// Tampilkan pesan fallback
if (!popup) {
  alert('Popup diblokir. Silakan izinkan popup untuk situs ini dan coba lagi.');
  return;
}
```

### CORS Issues
Pastikan origin yang benar di popup callback:
```typescript
if (event.origin !== window.location.origin) return;
```

### Multiple Tabs Issue
Implementasi sudah menangani multiple tabs dengan:
- Cleanup listeners saat component unmount
- Origin validation untuk security
- Proper popup reference management

## Testing

### Manual Testing
1. Buka halaman login
2. Klik tombol "Login dengan Google"
3. Verifikasi popup terbuka di posisi tengah
4. Lakukan autentikasi di popup
5. Verifikasi popup tertutup otomatis
6. Verifikasi redirect/refresh di parent page

### Automated Testing (dengan Playwright/Cypress)
```javascript
// Contoh test case
test('Google popup auth flow', async ({ page, context }) => {
  await page.goto('/auth/signin');
  
  // Click login button
  const popupPromise = context.waitForEvent('page');
  await page.click('[data-testid="google-login-btn"]');
  
  // Handle popup
  const popup = await popupPromise;
  await popup.waitForLoadState();
  
  // Verify popup closes after auth
  await popup.waitForEvent('close');
  
  // Verify redirect in main page
  await expect(page).toHaveURL('/dashboard');
});
```

## Performance

### Bundle Size Impact
- Popup logic: ~2KB gzipped
- Google One Tap SDK: ~15KB (loaded async)
- Total tambahan: ~17KB

### Loading Optimizations
- Lazy load Google SDK
- Preconnect ke Google domains
- Minimize popup window size

## Browser Support

### Desktop
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

### Mobile
- ✅ Chrome Mobile
- ✅ Safari iOS (dengan fallback)
- ⚠️  Firefox Mobile (popup might be blocked)

### Fallback Strategy
Jika popup diblokir, otomatis fallback ke redirect-based auth:
```typescript
if (!popup) {
  // Fallback to redirect
  window.location.href = googleAuthUrl;
}
```