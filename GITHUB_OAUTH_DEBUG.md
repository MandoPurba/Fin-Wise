# GitHub OAuth Troubleshooting untuk FinWise

## Langkah-langkah Setup GitHub OAuth

### 1. GitHub Developer Settings
1. Buka https://github.com/settings/developers
2. Klik "New OAuth App"
3. Isi form dengan data berikut:
   - **Application name**: FinWise (atau nama yang diinginkan)
   - **Homepage URL**: `http://localhost:3001`
   - **Authorization callback URL**: **PENTING** - gunakan URL Supabase callback:
     ```
     https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
     ```
     Contoh: `https://ymaqntblbduhxjldkwqx.supabase.co/auth/v1/callback`

4. Klik "Register application"
5. Copy **Client ID** dan generate **Client Secret**

### 2. Supabase Configuration
1. Buka Supabase Dashboard → Authentication → Providers
2. Cari **GitHub** dan enable
3. Masukkan:
   - **Client ID** dari GitHub
   - **Client Secret** dari GitHub
4. **Redirect URL** akan otomatis terisi (harus sama dengan yang di GitHub)
5. Klik Save

### 3. Supabase URL Configuration
1. Di Supabase Dashboard → Authentication → URL Configuration
2. **Site URL**: `http://localhost:3001` (sesuai port server development)
3. **Redirect URLs**: Tambahkan:
   ```
   http://localhost:3001/auth/callback
   ```

### 4. Environment Variables
Pastikan file `.env.local` berisi:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Testing & Debugging

### 1. Test OAuth Flow
1. Buka http://localhost:3001/auth/login
2. Klik "GitHub" button
3. Perhatikan URL yang terbuka - harus mengarah ke GitHub
4. Authorize aplikasi di GitHub
5. Harus redirect ke `/auth/callback` lalu ke `/dashboard`

### 2. Check Console Logs
Buka Developer Tools → Console untuk melihat log debug:
- OAuth Callback logs
- Session Exchange logs
- Error messages

### 3. Common Issues & Solutions

#### Issue: "Invalid redirect_uri"
**Solution**: Pastikan Authorization callback URL di GitHub settings sama persis dengan Supabase callback URL

#### Issue: "Client not found"
**Solution**: 
- Pastikan Client ID benar di Supabase
- Pastikan Client Secret benar dan tidak expired

#### Issue: "Access denied"
**Solution**: 
- User membatalkan authorization di GitHub
- Coba lagi dengan mengklik "Authorize"

#### Issue: "Session exchange failed"
**Solution**:
- Check environment variables
- Pastikan Supabase URL dan anon key benar

#### Issue: "Callback error"
**Solution**:
- Pastikan Site URL di Supabase sesuai dengan development server (port 3001)
- Check redirect URLs configuration

### 4. Verification Checklist

✅ GitHub OAuth App created dengan callback URL Supabase
✅ GitHub Provider enabled di Supabase dengan Client ID/Secret yang benar
✅ Site URL di Supabase sesuai development server
✅ Environment variables correct
✅ Development server running di port 3001
✅ Browser dapat akses localhost:3001

### 5. Debug Commands

Jika masih error, jalankan:
```bash
# Check if environment variables loaded
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Check server logs
pnpm dev
```

Lihat console logs di browser dan terminal untuk error messages yang spesifik.
