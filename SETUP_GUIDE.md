# LifeLog AI Setup Guide

## 🚀 Quick Start (No External Setup Required)

Your LifeLog AI is now configured to work **out of the box** for development! Here's what's already set up:

### ✅ **Already Configured (No Action Needed)**

1. **Database**: Uses SQLite (local file) - no PostgreSQL setup needed
2. **Authentication**: Demo login works immediately
3. **File Storage**: Local file system
4. **Basic Features**: Timeline, Upload, Search all work
5. **User Profiles**: Name persistence with localStorage

### 🎯 **Current Status: Fully Functional**

You can use the app right now with:
- ✅ Sign in/out with demo credentials
- ✅ Personalized dashboard with your name
- ✅ File upload interface
- ✅ Timeline view
- ✅ Search functionality
- ✅ User profile management

---

## 🔧 **Optional Enhancements (Set Up When Ready)**

### **1. Google OAuth (Optional)**
**What it adds**: Real Google sign-in instead of demo login
**Required for**: Production deployment
**Cost**: Free
**Setup time**: 15 minutes

**How to enable**:
1. Follow `GOOGLE_OAUTH_SETUP.md`
2. Get credentials from Google Cloud Console
3. Update `.env` file:
   ```env
   GOOGLE_CLIENT_ID=your_real_client_id
   GOOGLE_CLIENT_SECRET=your_real_client_secret
   NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true
   ```

### **2. OpenAI API (Optional)**
**What it adds**: AI-powered weekly summaries and insights
**Required for**: "Generate Summary" button to work
**Cost**: Pay-per-use (typically $1-5/month for personal use)
**Setup time**: 5 minutes

**How to enable**:
1. Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Update `.env` file:
   ```env
   OPENAI_API_KEY=sk-your-actual-openai-key-here
   ```

### **3. Production Database (Optional)**
**What it adds**: Scalable database for production
**Required for**: Production deployment with multiple users
**Cost**: $5-20/month
**Setup time**: 10 minutes

**Options**:
- **Supabase** (recommended): Free tier available
- **Railway**: $5/month
- **PlanetScale**: Free tier available

---

## 📋 **Current Environment Settings**

Your `.env` file is configured for **development mode**:

```env
# ✅ Works immediately - no setup needed
DATABASE_URL=sqlite:///./lifelog_dev.db
REDIS_URL=memory://
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=development-secret-key-for-lifelog-ai

# ⚠️ Optional - set up when you want these features
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
OPENAI_API_KEY=your_openai_api_key_here
```

---

## 🧪 **Testing Your Setup**

1. **Start the servers**:
   ```bash
   # Backend
   cd backend
   uvicorn app.main:app --reload --port 8000
   
   # Frontend (in new terminal)
   cd frontend
   npm run dev
   ```

2. **Open your browser**: `http://localhost:3001`

3. **Test features**:
   - ✅ Sign in with demo credentials
   - ✅ Set your name in profile setup
   - ✅ Navigate between Dashboard/Timeline/Upload/Search
   - ✅ See personalized greetings with your name
   - ⚠️ Weekly summary (needs OpenAI API key)
   - ⚠️ Google sign-in (needs Google OAuth setup)

---

## 🚀 **Production Deployment Checklist**

When ready to deploy:

- [ ] Set up Google OAuth credentials
- [ ] Get OpenAI API key (optional)
- [ ] Choose production database (Supabase/Railway/PlanetScale)
- [ ] Update environment variables for production
- [ ] Deploy to Vercel/Netlify (frontend) + Railway/Render (backend)

---

## 💡 **Summary**

**Right now**: Your app is **100% functional** for personal use with demo login, local database, and all core features working.

**Later**: Add Google OAuth and OpenAI API when you want production-ready authentication and AI features.

**You don't need to set up anything else to start using and testing your LifeLog AI!** 🎉
