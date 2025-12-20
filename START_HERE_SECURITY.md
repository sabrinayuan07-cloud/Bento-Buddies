# Security Setup - Start Here!

## You're Right - Let Me Clarify!

You have **2 different API keys** from **2 different places**:

### 🔑 Key #1: Firebase API Key
- **Key:** `AIzaSyDr1_0FfG4NnOHdgVJpZ96EF3dZoLVaP_0`
- **Where it came from:** Firebase project
- **Where to "restrict" it:** Set up Firestore Security Rules (not manual restriction)
- **File:** `FIREBASE_SECURITY_RULES_SIMPLE.md` ← Do this first!

### 🗺️ Key #2: Google Maps API Key
- **Key:** `AIzaSyBHplBjzNh6sM6Umtx4bgYJinjHHIaUR28`
- **Where it came from:** Google Cloud Console (separate from Firebase)
- **Where to restrict it:** Google Cloud Console → APIs & Services → Credentials
- **File:** `GOOGLE_MAPS_API_RESTRICTION.md` ← Do this second!

---

## 2-Step Simple Plan

### Step 1: Protect Your Data (5 minutes) - DO THIS FIRST! ⚠️

**Why:** Right now ANYONE on the internet can read/delete all your data

**What to do:**
1. Open `FIREBASE_SECURITY_RULES_SIMPLE.md`
2. Go to Firebase Console → Firestore Database → Rules
3. Copy-paste the rules I provided
4. Click Publish

**This protects:**
- User profiles
- Meetups
- Messages
- Profile pictures

### Step 2: Restrict Maps Key (5 minutes) - DO THIS SECOND

**Why:** Prevent other websites from using your Maps API key (costs you money)

**What to do:**
1. Open `GOOGLE_MAPS_API_RESTRICTION.md`
2. Go to Google Cloud Console → APIs & Services → Credentials
3. Find your Maps API key
4. Add domain restrictions

---

## Can't Find Your Maps API Key in Google Cloud?

Don't worry! Here's what to do:

### Option A: Find the Original Key

1. Go to https://console.cloud.google.com/
2. Click the project dropdown at the very top
3. Look through ALL your projects
4. In each project, go to APIs & Services → Credentials
5. Look for key starting with `AIzaSyBH...`

### Option B: Create a New Key (Easier!)

If you can't find it, just create a new restricted key:

1. Go to https://console.cloud.google.com/apis/credentials
2. Make sure you're in ANY project (or create a new one)
3. Click **+ CREATE CREDENTIALS** → **API Key**
4. A popup shows your new key - **Copy it!**
5. Immediately click **RESTRICT KEY**
6. Under "Application restrictions":
   - Select: **HTTP referrers**
   - Add: `http://localhost:*/*`
   - Add: `https://bentobuddies-1e6cf.web.app/*`
7. Under "API restrictions":
   - Select: **Restrict key**
   - Check: Maps JavaScript API
   - Check: Places API
8. Click **Save**
9. Replace the old key in `maps/maps.html` line 233

---

## Quick Test Checklist

After both steps, verify:

### Test 1: App Still Works
- [ ] Open maps/maps.html → Map loads ✅
- [ ] Open events/events.html → Events show ✅
- [ ] Open home/home.html → Stats load ✅

### Test 2: Security Works
- [ ] Log out → Try to access home page → Should redirect to login ✅
- [ ] Open Firebase Console → Firestore rules show "Published" ✅

---

## Priority Order

**Do in this order:**

1. ✅ Read this file (START_HERE_SECURITY.md)
2. ⏳ Follow FIREBASE_SECURITY_RULES_SIMPLE.md (5 min)
3. ⏳ Follow GOOGLE_MAPS_API_RESTRICTION.md (5 min)
4. ✅ Test your app
5. ✅ Deploy!

---

## Still Confused?

**Just do this:**

1. **Firebase Console** (https://console.firebase.google.com/)
   - Project: bentobuddies-1e6cf
   - Go to: Firestore Database → Rules
   - Paste rules from `FIREBASE_SECURITY_RULES_SIMPLE.md`
   - Click Publish
   - ✅ Done!

2. **Google Cloud Console** (https://console.cloud.google.com/)
   - Go to: APIs & Services → Credentials
   - Find key: `AIzaSyBH...` (or create new one)
   - Add domain restrictions
   - ✅ Done!

That's it! Your app is secure.

---

## Files to Read (In Order)

1. **This file** ← You are here!
2. `FIREBASE_SECURITY_RULES_SIMPLE.md` ← Do next (copy-paste rules)
3. `GOOGLE_MAPS_API_RESTRICTION.md` ← Then this (restrict Maps key)

Ignore the other security files for now - these 3 are all you need!
