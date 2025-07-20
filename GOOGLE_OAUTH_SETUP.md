# Google OAuth Setup Guide for LifeLog AI

## 🔐 Setting Up Google OAuth for Production

To enable real Google sign-in for your LifeLog AI application, follow these steps:

### 1. Create a Google Cloud Console Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select an existing project
3. Give your project a name (e.g., "LifeLog AI")

### 2. Enable Google OAuth API

1. In your Google Cloud Console project
2. Go to "APIs & Services" → "Library"
3. Search for "Google+ API" or "Google Identity"
4. Click "Enable"

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Set the following:
   - **Name**: LifeLog AI Web Client
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000`
     - `http://localhost:3001`
     - `https://yourdomain.com` (for production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google`
     - `http://localhost:3001/api/auth/callback/google`
     - `https://yourdomain.com/api/auth/callback/google` (for production)

### 4. Get Your Credentials

1. After creating, you'll get:
   - **Client ID** (looks like: `123456789-abcdefg.apps.googleusercontent.com`)
   - **Client Secret** (looks like: `GOCSPX-abcdefghijklmnop`)

### 5. Update Your .env File

Replace the placeholder values in your `.env` file:

```env
# Google OAuth - Replace with your real credentials
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here

# Enable Google OAuth in frontend
NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true
```

### 6. Restart Your Application

1. Stop your frontend server (Ctrl+C)
2. Restart with `npm run dev`
3. The Google sign-in button will now appear and work!

## 🔒 Security Notes

- **Never commit real credentials** to version control
- **Use different credentials** for development and production
- **Set up proper domains** in Google Console for production
- **Enable only necessary scopes** (email, profile)

## 🧪 Testing

Once configured:
1. Go to your sign-in page
2. Click "Continue with Google"
3. Complete Google OAuth flow
4. You'll be signed in with your real Google account!

## 🚀 Production Deployment

For production:
1. Update authorized origins with your production domain
2. Use environment variables for credentials
3. Enable HTTPS for security
4. Consider additional security measures
