# How to Restrict Google Maps API Key

## Your Google Maps API Key
```
AIzaSyBHplBjzNh6sM6Umtx4bgYJinjHHIaUR28
```

This key is currently in: `maps/maps.html` line 233

---

## Step-by-Step: Restrict This Key

### Step 1: Find Your Google Cloud Project

1. Go to https://console.cloud.google.com/
2. Look at the top navigation bar - there's a project selector dropdown
3. Find the project that has your Google Maps API enabled
   - It might be named differently from your Firebase project
   - Look for the project where you created the Maps API key

**Tip:** If you're not sure which project, do this:
- Click the project dropdown at the top
- You should see a list of all your Google Cloud projects
- The one with Maps API will likely be named something like:
  - "BentoBuddies"
  - "My First Project"
  - Or it could be the same as Firebase: "bentobuddies-1e6cf"

### Step 2: Navigate to API Credentials

1. Once you've selected the correct project
2. In the left sidebar, click **APIs & Services**
3. Click **Credentials**

### Step 3: Find Your Maps API Key

You should see a list of API keys. Look for:
- Key that starts with `AIzaSyBHplBjzNh6sM6Umtx4bgYJinjHHIaUR28`
- Or any key named "Browser key" or "API key"
- Created date might help you identify it

### Step 4: Restrict the Key

1. Click on the key name (or the pencil/edit icon)
2. You'll see "API key" settings page

#### Section 1: Application Restrictions
- Select: **HTTP referrers (web sites)**
- Click **+ ADD AN ITEM**
- Add these one by one:

```
http://localhost:*/*
http://127.0.0.1:*/*
https://localhost:*/*
```

If you're using Live Server in VS Code, add:
```
http://localhost:5500/*
http://127.0.0.1:5500/*
```

When you deploy to Firebase, add:
```
https://bentobuddies-1e6cf.web.app/*
https://bentobuddies-1e6cf.firebaseapp.com/*
```

#### Section 2: API Restrictions
- Select: **Restrict key**
- From the dropdown, select ONLY:
  - ✅ **Maps JavaScript API**
  - ✅ **Places API**
  - ✅ **Geocoding API** (if you use it)

Uncheck everything else!

3. Click **Save** at the bottom

---

## Step 5: Test It Works

1. Open your maps page: `maps/maps.html`
2. Open browser console (F12)
3. You should see the map load normally
4. No errors like "API key invalid" or "RefererNotAllowedMapError"

If you see errors:
- Make sure you added `http://localhost:*/*` to the referrers
- Wait 1-2 minutes for restrictions to take effect
- Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

---

## What If I Can't Find the Project?

If you can't find which Google Cloud project has your Maps API key:

### Method 1: Check the Key in Cloud Console
1. Go to https://console.cloud.google.com/apis/credentials
2. Look at ALL your projects (use project switcher at top)
3. Check each one for API keys matching `AIzaSyBH...`

### Method 2: Create a New Restricted Key
If you can't find the old one, just create a new one:

1. Go to https://console.cloud.google.com/
2. Select ANY project (or create new one)
3. Enable these APIs:
   - Maps JavaScript API
   - Places API
4. Go to Credentials → Create Credentials → API Key
5. Immediately click **Restrict Key**
6. Set up restrictions as shown above
7. Copy the new API key
8. Replace in `maps/maps.html` line 233:

```javascript
// Replace this line:
const API_KEY = 'AIzaSyBHplBjzNh6sM6Umtx4bgYJinjHHIaUR28';

// With your new key:
const API_KEY = 'YOUR_NEW_RESTRICTED_KEY';
```

---

## What About the Firebase API Key?

**Good news:** The Firebase API key (`AIzaSyDr1_0FfG4NnOHdgVJpZ96EF3dZoLVaP_0`) doesn't need manual restriction!

It's automatically protected by:
1. **Firestore Security Rules** (which we'll set up next)
2. **Firebase domain restrictions** (built-in)

The Firebase key is safe to be public as long as you have security rules.

---

## Summary: Which Keys to Restrict Where

| API Key | Where to Restrict | Status |
|---------|------------------|--------|
| Firebase Key<br>`AIzaSyDr1_0Ff...` | Protected by Firestore Rules | ⏳ Next step |
| Google Maps Key<br>`AIzaSyBHplBjzN...` | Google Cloud Console | ⏳ Do this now |

---

## Next Steps After Restricting Maps Key

1. ✅ Restrict Google Maps API key (this guide)
2. ⏳ Set up Firestore Security Rules (next)
3. ⏳ Set up Storage Security Rules

---

## Quick Reference

**Your Keys:**
- Maps API: `AIzaSyBHplBjzNh6sM6Umtx4bgYJinjHHIaUR28`
- Firebase API: `AIzaSyDr1_0FfG4NnOHdgVJpZ96EF3dZoLVaP_0`

**Allowed Domains for Maps Key:**
```
http://localhost:*/*
http://127.0.0.1:*/*
https://bentobuddies-1e6cf.web.app/*
https://bentobuddies-1e6cf.firebaseapp.com/*
```

**APIs to Enable for Maps Key:**
- Maps JavaScript API
- Places API
