# 🚀 PRODUCTION DEPLOYMENT CHECKLIST

## ✅ CRITICAL ISSUES FIXED

### 1. ❌ HARDCODED LOCALHOST BUG - FIXED ✅
**File:** `frontend/src/pages/SignAgreement.tsx` Line 42
- **Issue:** Fetching from `http://localhost:5000` instead of environment variable
- **Fix:** Changed to use `import.meta.env.VITE_API_URL`
- **Status:** ✅ FIXED

---

## 🔧 FRONTEND DEPLOYMENT (Vercel)

### Step 1: Set Environment Variables in Vercel

Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

Add these for **Production** and **Preview**:

```
VITE_API_URL=https://dagreement.onrender.com
VITE_GOOGLE_CLIENT_ID=357095799558-j0sipl6qhovh51003ac47nfpimr6hgki.apps.googleusercontent.com
```

### Step 2: Redeploy Frontend

Push a new commit or manually redeploy:
```bash
git add .
git commit -m "fix: use environment variable for API URL in SignAgreement"
git push origin main
```

Or in Vercel Dashboard: Click **Deployments** → Find latest → **Redeploy**

### Step 3: Verify Frontend Deployment

Visit: `https://d-aagreement.vercel.app`
- ✅ Check Console (F12) for correct API URL
- ✅ Test Login/Signup
- ✅ Test Signing Flow (public page)

---

## 🗄️ BACKEND DEPLOYMENT (Render)

### Step 1: Configure Environment Variables in Render

Go to **Render Dashboard** → Your Backend Service → **Environment**

Add these variables:

```env
# SERVER
PORT=5000
NODE_ENV=production

# DATABASE (PostgreSQL - Render Internal Database or External)
DB_HOST=<your-postgres-host>
DB_PORT=5432
DB_NAME=agreement_tracker
DB_USER=<your-db-user>
DB_PASSWORD=<your-db-password>
DB_SSL=require
DB_POOL_SIZE=20

# JWT (CRITICAL - Generate new secure key!)
JWT_SECRET=<GENERATE-NEW-RANDOM-256-BIT-HEX-KEY>

# GOOGLE OAUTH
GOOGLE_CLIENT_ID=357095799558-j0sipl6qhovh51003ac47nfpimr6hgki.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-google-secret>

# EMAIL (Brevo/Sendinblue)
BREVO_API_KEY=<your-brevo-api-key>
GMAIL_EMAIL=noreply@digitalagreement.com

# FRONTEND URL (for generating signing links)
FRONTEND_URL=https://d-aagreement.vercel.app
```

### Step 2: Generate Secure JWT_SECRET

Run this command in terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as `JWT_SECRET` in Render.

### Step 3: Get Brevo API Key

1. Visit: https://app.brevo.com/settings/keys/api
2. Copy your API key
3. Paste it as `BREVO_API_KEY` in Render

### Step 4: Deploy Backend

In Render Dashboard:
1. Go to your backend service
2. Click **Manual Deploy** → **Deploy latest commit**
3. Wait for deployment to complete (check logs)

### Step 5: Verify Backend is Running

Visit: `https://dagreement.onrender.com/health`
- Should return: `{"status": "healthy"}`

If fails, check Render logs for errors.

---

## 🔍 VERIFICATION CHECKLIST

### Frontend Checks
- [ ] VITE_API_URL environment variable is set in Vercel
- [ ] Vercel deployment shows latest commit
- [ ] Visit `https://d-aagreement.vercel.app`
- [ ] Open DevTools (F12) → Console → Check API_BASE_URL is correct
- [ ] Login/Signup works (should call `https://dagreement.onrender.com/api/auth/...`)
- [ ] Signing page works (public route, no auth needed)

### Backend Checks
- [ ] All environment variables set in Render
- [ ] Health check passes: `https://dagreement.onrender.com/health`
- [ ] Check Render logs for any startup errors
- [ ] Database connection is working (check logs for "Database initialized")
- [ ] CORS is configured for Vercel domain

### Integration Checks
- [ ] Sign up on frontend
- [ ] Receive confirmation email
- [ ] Create agreement
- [ ] Send agreement (recipient receives email)
- [ ] Sign agreement (public page works)
- [ ] Receive signed confirmation

---

## 🆘 TROUBLESHOOTING

### "Failed to fetch" in browser console

**Causes:**
1. ❌ API_BASE_URL not set in Vercel env vars
2. ❌ Backend not running on Render
3. ❌ CORS not configured
4. ❌ Frontend using old `localhost:5000` URL

**Solutions:**
1. Go to Vercel Settings → Environment Variables
2. Add `VITE_API_URL=https://dagreement.onrender.com`
3. Redeploy Vercel
4. Check backend health: `https://dagreement.onrender.com/health`
5. Check backend logs in Render for errors

### Email not sending

**Causes:**
1. ❌ `BREVO_API_KEY` not set
2. ❌ Invalid Brevo API key
3. ❌ `FRONTEND_URL` not set (affects email links)

**Solutions:**
1. Get API key from: https://app.brevo.com/settings/keys/api
2. Add to Render environment: `BREVO_API_KEY=your-key`
3. Set `FRONTEND_URL=https://d-aagreement.vercel.app`
4. Redeploy backend

### Database connection errors

**Causes:**
1. ❌ Wrong DB credentials
2. ❌ Database doesn't exist
3. ❌ SSL not configured properly

**Solutions:**
1. Verify credentials in Render environment
2. Create database if not exists
3. Try setting `DB_SSL=require` or `DB_SSL=disable`
4. Check Render logs: `tail logs`

### JWT signature errors

**Causes:**
1. ❌ `JWT_SECRET` not set
2. ❌ Different secrets on different deployments
3. ❌ Too short secret (needs 32+ chars)

**Solutions:**
1. Generate new: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. Set same secret in all environments
3. Make sure it's at least 32 characters

---

## 📝 ENVIRONMENT VARIABLES REFERENCE

### Required for ALL deployments
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - "production" or "development"
- `JWT_SECRET` - Cryptographic key for tokens (MUST BE 32+ chars)
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Database
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - OAuth
- `BREVO_API_KEY` - Email service
- `FRONTEND_URL` - Frontend domain for email links

### Optional
- `DB_SSL` - "require" or "disable" (default: false)
- `DB_POOL_SIZE` - Connection pool size (default: 20)
- `GMAIL_EMAIL` - Sender email (default: digitalagreement.system@gmail.com)

---

## 🚨 BEFORE GOING LIVE

1. ✅ Test all features on production URLs
2. ✅ Check error logs in Render
3. ✅ Test with real email sending
4. ✅ Verify PDF generation works
5. ✅ Test signing with different browsers
6. ✅ Ensure HTTPS is enforced
7. ✅ Check that Vercel redirects HTTP → HTTPS
8. ✅ Verify email links work in production
9. ✅ Test Google OAuth login
10. ✅ Check database backups are configured

---

## 📞 SUPPORT

If issues persist:
1. Check Render logs: Go to backend service → Logs
2. Check Vercel logs: Go to project → Deployments → Logs
3. Check browser console (F12) for errors
4. Verify all env vars are set (Vercel + Render)
5. Try manual redeploy: Clear cache → Redeploy
