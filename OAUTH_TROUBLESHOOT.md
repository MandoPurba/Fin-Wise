# OAuth Login Troubleshooting Steps

## 🔍 Debug Process

### Step 1: Buka Debug Tool
Buka: http://localhost:3000/debug-oauth

### Step 2: Klik "Check Config"
Pastikan:
- ✅ Supabase URL: https://ymaqntblbduhxjldkwqx.supabase.co
- ✅ Supabase Anon Key: SET
- ✅ Current Origin: http://localhost:3000

### Step 3: Test GitHub OAuth
1. Klik "Test GitHub OAuth"
2. Perhatikan logs yang muncul
3. Lihat apakah ada error messages

### Step 4: Periksa Browser Network Tab
1. Buka F12 → Network tab
2. Klik GitHub OAuth
3. Lihat request yang gagal

## 🛠️ Manual Configuration Check

### GitHub OAuth App Settings
```
Homepage URL: http://localhost:3000
Authorization callback URL: https://ymaqntblbduhxjldkwqx.supabase.co/auth/v1/callback
```

### Supabase Dashboard Settings
1. Authentication → Providers → GitHub
   - ✅ Enabled
   - ✅ Client ID filled
   - ✅ Client Secret filled

2. Authentication → URL Configuration
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

## 🚨 Common Issues

### Issue 1: Environment Variables
Check if `.env.local` exists and has correct values:
```
NEXT_PUBLIC_SUPABASE_URL=https://ymaqntblbduhxjldkwqx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Issue 2: GitHub Client ID/Secret Wrong
- Copy fresh Client ID from GitHub
- Generate new Client Secret
- Update in Supabase

### Issue 3: Callback URL Mismatch
- GitHub callback MUST be: `https://ymaqntblbduhxjldkwqx.supabase.co/auth/v1/callback`
- Supabase redirect MUST be: `http://localhost:3000/auth/callback`

## 📋 Testing Checklist

1. [ ] Server running on port 3000
2. [ ] Debug tool shows correct config
3. [ ] GitHub OAuth app configured correctly
4. [ ] Supabase providers enabled
5. [ ] Environment variables loaded
6. [ ] Browser console shows no errors
7. [ ] Network tab shows OAuth redirect

## 🔄 If Still Not Working

Try this complete reset:
1. Delete GitHub OAuth app
2. Create new GitHub OAuth app with exact URLs above
3. Update Supabase with new Client ID/Secret
4. Clear browser cache
5. Test again with debug tool
