# Google OAuth Setup Guide for Aurora Chat

## 🔧 Setup Instructions

### 1. Create Google OAuth Credentials

1. **Go to Google Cloud Console**: [console.cloud.google.com](https://console.cloud.google.com)
2. **Create a new project** or select existing project
3. **Enable Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Authorized origins: `http://localhost:3000` (for development)
   - Copy the **Client ID**

### 2. Configure Environment Variables

**Backend (.env.server):**
```bash
GOOGLE_CLIENT_ID=your_actual_google_client_id_here
```

**Frontend (.env.development):**
```bash
REACT_APP_GOOGLE_CLIENT_ID=your_actual_google_client_id_here
```

### 3. Restart Your Servers

```bash
# Restart backend
pkill -f token-server
yarn server:dev

# Restart frontend (if needed)
yarn start
```

## 🚀 How Google Login Works

### User Experience:
1. **User visits login page** → Sees "Sign in with Google" button
2. **Clicks Google button** → Google popup opens
3. **Signs in with Google** → Returns to Aurora Chat
4. **Automatically logged in** → No password needed!

### Technical Flow:
1. **Google OAuth** → Returns JWT credential
2. **Backend verifies** → Validates with Google
3. **Extracts user info** → Name, email, profile picture
4. **Creates Stream user** → UUID-based ID + Google profile
5. **Returns Stream token** → User authenticated

## 👤 User Creation (Google OAuth):

### Automatic User Data:
- **User ID**: `user-1725817234-a8f3k9x2` (UUID-based)
- **Name**: From Google profile
- **Email**: From Google account  
- **Avatar**: Google profile picture (or generated)
- **Role**: `user` (default, can be changed by admin)

### Benefits:
- ✅ **No passwords** to manage
- ✅ **Secure authentication** via Google
- ✅ **Profile pictures** automatically imported
- ✅ **Email verification** handled by Google
- ✅ **UUID-based IDs** for privacy

## 🔐 Security Features:

- **Server-side verification** of Google tokens
- **No Google secrets** exposed to client
- **Automatic user creation** in Stream
- **Role-based access** (admin/user)
- **Secure token generation** for Stream

## 🎯 Next Steps:

1. **Get Google Client ID** from Google Cloud Console
2. **Update environment files** with real Client ID
3. **Test Google login** flow
4. **Deploy with production domain** for public use

Your Aurora Chat now supports both traditional and Google OAuth login! 🎉
