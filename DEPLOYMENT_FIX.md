# 🔧 Fix "Failed to Fetch" During Login/Signup

## 🔴 Problem
Frontend shows "Failed to fetch" when trying to login/signup because it can't connect to the backend API.

## 🎯 Root Cause
The environment variable `VITE_API_URL` is not being passed to the **Vercel deployment**. 

- ✅ Your local `.env` file has it
- ❌ Vercel build doesn't see it (only sees Vercel environment variables)

---

## ✅ Solution: Set Vercel Environment Variables

### Step 1: Go to Vercel Dashboard
1. Visit [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your project: **"DAagreement"** (or your frontend project name)
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Environment Variables

Add these two variables:

```
Name: VITE_API_URL
Value: https://dagreement.onrender.com

Name: VITE_GOOGLE_CLIENT_ID
Value: 357095799558-j0sipl6qhovh51003ac47nfpimr6hgki.apps.googleusercontent.com
```

**⚠️ IMPORTANT:**
- Select **"Production"** and **"Preview"** (not "Development")
- Click **Save**

### Step 3: Redeploy Vercel

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click **...** → **Redeploy**
   OR
4. Go back to your repo and push a commit:
   ```bash
   git commit --allow-empty -m "chore: redeploy with env vars"
   git push origin main
   ```

### Step 4: Verify Render Backend is Running

Check the Render dashboard:
1. Go to [render.com/dashboard](https://render.com/dashboard)
2. Click your backend service
3. Check if status is **"Live"** (green)
4. Check the **Logs** tab for any errors
5. If red/failed, click **Manual Deploy** → **Deploy latest commit**

### Step 5: Test the Fix

After both are redeployed:
1. Visit your Vercel app: `https://d-agreement.vercel.app`
2. Open **Developer Tools** (F12) → **Network** tab
3. Try logging in
4. Check requests:
   - Should see `POST` to `https://dagreement.onrender.com/api/auth/login`
   - Status should be **200** (success) or **401** (invalid credentials - but not network error)
   - Should NOT see "Failed to fetch" or CORS errors

---

## 🔍 If Still Not Working

### Check 1: Is the API URL correct?
```javascript
// Open browser console (F12) and run:
console.log(import.meta.env.VITE_API_URL)
```
Should output: `https://dagreement.onrender.com`

If it shows `undefined`, the env var isn't loaded. Go back to Step 2.

### Check 2: Is the backend running?
Visit directly in browser: `https://dagreement.onrender.com/health`
- Should return: `{"status": "healthy"}`
- If error/blank, check Render logs

### Check 3: Is CORS configured?
Check [backend/src/index.ts](backend/src/index.ts) - should include:
```typescript
origin: [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001",
  "https://d-agreement.vercel.app",
  "https://dagreement.onrender.com"
],
```

✅ Already configured correctly in the latest push.

---

## 📋 Checklist

- [ ] Set `VITE_API_URL` in Vercel environment
- [ ] Set `VITE_GOOGLE_CLIENT_ID` in Vercel environment  
- [ ] Redeployed Vercel (new deployment created)
- [ ] Checked Render backend is "Live"
- [ ] Cleared browser cache (Ctrl+Shift+Delete)
- [ ] Tried again on different browser/incognito
- [ ] Checked console for `VITE_API_URL` value
- [ ] Tested `/health` endpoint directly

---

## 🆘 Still Not Working?

1. **Clear all browser data:** Ctrl+Shift+Delete → Clear everything → Retry
2. **Check if Render service cold-started:** May take 30-60 seconds after redeploy
3. **Check Vercel build logs:** 
   - Go to Deployments → Click deployment → **View Build Logs**
   - Look for errors about env vars
4. **Verify .env.example is in git:**
   ```bash
   git ls-files | grep "\.env"
   ```
   Should show `.env.example` files (not actual `.env`)

---

## 📱 Example Login Test

After env vars are set:

```
1. Visit: https://d-agreement.vercel.app/login
2. F12 → Network tab
3. Email: test@example.com
4. Password: Test123!
5. Should see request to: https://dagreement.onrender.com/api/auth/login
6. Response: {"error": "Invalid credentials"} (or success if user exists)
```

If you see request to `http://localhost:5000` → env var NOT loaded → redo Step 2.

---
