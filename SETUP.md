# Sem III Tracker — Setup & Deployment Guide

## What you need
- A GitHub account (you already have one)
- A Google account (for Firebase + Sign-In)
- Node.js installed (check with `node -v` in terminal)

---

## Step 1 — Firebase project (≈15 min, one-time)

1. Go to https://console.firebase.google.com
2. Click **"Add project"** → name it (e.g. `sem3-tracker`) → disable Google Analytics → **Create**
3. Once created, click the **Web** icon (`</>`) to add a web app
4. Give it a nickname → **Register app** → copy the config values shown

### Enable Google Sign-In
1. Left sidebar → **Build → Authentication**
2. **Get started** → **Sign-in method** tab → **Google** → Enable → Save

### Enable Firestore
1. Left sidebar → **Build → Firestore Database**
2. **Create database** → **Start in production mode** → pick a region (closest to India: `asia-south1`) → **Enable**

### Set Firestore Security Rules
In Firestore → **Rules** tab, paste this and **Publish**:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
This means: only you can read/write your own data.

---

## Step 2 — Configure the app

1. In the project folder, copy `.env.example` to a new file called `.env`:
   ```
   cp .env.example .env
   ```

2. Open `.env` and paste in your Firebase config values:
   ```
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=sem3-tracker.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=sem3-tracker
   VITE_FIREBASE_STORAGE_BUCKET=sem3-tracker.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc...
   ```

3. Install dependencies (only needed once):
   ```
   npm install
   ```

4. Test locally:
   ```
   npm run dev
   ```
   Open the URL shown (usually http://localhost:5173). Sign in with Google. You should see the batch selection screen.

---

## Step 3 — Deploy to GitHub Pages

### First time

1. Create a new repo on GitHub (e.g. `sem3-tracker`) — set it to **Private**

2. In your project folder, run:
   ```
   git init
   git add .
   git commit -m "Initial build"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/sem3-tracker.git
   git push -u origin main
   ```

3. Install the GitHub Pages deploy tool:
   ```
   npm install --save-dev gh-pages
   ```

4. Add this to `package.json` in the `"scripts"` section:
   ```json
   "deploy": "npm run build && gh-pages -d dist"
   ```

5. Deploy:
   ```
   npm run deploy
   ```

6. Go to GitHub → your repo → **Settings → Pages** → Source: `gh-pages` branch → **Save**

7. Your app URL will be: `https://YOUR_USERNAME.github.io/sem3-tracker/`

### After any code update
```
npm run deploy
```
That's it. Data in Firestore is unaffected — code and data are completely separate.

---

## Step 4 — Add to phone homescreen

**On Android (Chrome):**
1. Open your GitHub Pages URL in Chrome
2. Sign in
3. Tap the three-dot menu → **Add to Home screen** → **Add**
4. The app icon appears on your homescreen and opens as a standalone app (no browser bar)

**On iPhone (Safari):**
1. Open the URL in Safari (must be Safari, not Chrome)
2. Tap the Share button (box with arrow) → **Add to Home Screen** → **Add**

---

## Firebase authorized domains (important)

After deploying, you need to tell Firebase that your GitHub Pages URL is allowed to use Sign-In:

1. Firebase Console → **Authentication → Settings → Authorized domains**
2. Click **Add domain** → paste `YOUR_USERNAME.github.io` → **Add**

Without this, Google Sign-In will fail on the deployed app.

---

## Troubleshooting

**"auth/unauthorized-domain" error on sign-in:**
→ You haven't added your GitHub Pages domain to Firebase authorized domains (see above).

**Blank screen after deploy:**
→ Check browser console (F12) for errors. Usually a missing .env variable or wrong `base` in vite.config.js.

**Data not loading / Firestore errors:**
→ Check Firestore Security Rules are published correctly.

**Sign-in popup blocked:**
→ iOS Safari sometimes blocks popups. Try the redirect sign-in flow — let me know and I'll add a fallback.

---

## Updating the app in future

If you find a bug or want a change:
1. Make the code change (or ask me to)
2. Run `npm run deploy`
3. App updates live within ~2 minutes
4. Your data is untouched — it lives in Firestore, not in the code

---

## Local dev (for testing before deploying)
```
npm run dev
```
Uses your `.env` file. Changes appear instantly without rebuilding.
