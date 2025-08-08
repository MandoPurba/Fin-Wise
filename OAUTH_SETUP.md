# OAuth Configuration for FinWise

## Supabase OAuth Setup

To fix the OAuth redirect issue, you need to configure the OAuth providers in your Supabase project:

### 1. Configure Site URL in Supabase Dashboard

Go to Authentication > URL Configuration and set:

- **Site URL**: `http://localhost:3000` (for development)
- **Redirect URLs**: Add these URLs:
  - `http://localhost:3000/auth/callback`
  - `https://yourdomain.com/auth/callback` (for production)

### 2. OAuth Provider Configuration

#### Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
6. Copy Client ID and Client Secret to Supabase

#### GitHub OAuth:
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL: `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret to Supabase

#### Discord OAuth:
1. Go to Discord Developer Portal
2. Create new application
3. Go to OAuth2 section
4. Add redirect URI: `https://your-project.supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret to Supabase

### 3. Supabase Configuration

In your Supabase Dashboard:

1. Go to Authentication > Providers
2. Enable the providers you want (Google, GitHub, Discord)
3. Add the Client ID and Client Secret for each provider
4. Save the configuration

### 4. Environment Variables

Make sure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Testing OAuth Flow

1. Click OAuth login button → redirects to provider
2. Authorize the application → redirects to `/auth/callback`
3. Callback exchanges code for session → redirects to `/dashboard`

### Common Issues:

- **Redirect URL mismatch**: Ensure all URLs match exactly
- **Provider not enabled**: Check Supabase provider configuration
- **Invalid credentials**: Verify Client ID/Secret are correct
- **CORS issues**: Ensure Site URL is configured properly

The auth callback route at `/auth/callback` handles the OAuth code exchange and redirects users to the dashboard upon successful authentication.
