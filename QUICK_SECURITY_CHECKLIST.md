# Quick Security Setup (15 Minutes)

## ⚠️ CRITICAL: Do This Before Deploying

Your API keys are currently exposed. Follow these steps to secure them:

---

## Step 1: Restrict Firebase API Key (5 minutes)

### Option A: Firebase Console (Easier)
1. Go to https://console.firebase.google.com/
2. Select project: **bentobuddies-1e6cf**
3. Click gear icon ⚙️ → **Project settings**
4. Scroll to "Your apps" → Web app
5. Click **Restrict key** next to API Key

### Option B: Google Cloud Console (More Control)
1. Go to https://console.cloud.google.com/
2. Select project: **bentobuddies-1e6cf**
3. Navigate to **APIs & Services** → **Credentials**
4. Find key: `AIzaSyDr1_0FfG4NnOHdgVJpZ96EF3dZoLVaP_0`
5. Click **Edit** (pencil icon)
6. Under **Application restrictions**:
   - Select: **HTTP referrers (web sites)**
   - Click **+ ADD AN ITEM**
   - Add these referrers:
     ```
     localhost:*/*
     127.0.0.1:*/*
     http://localhost:*/*
     https://bentobuddies-1e6cf.web.app/*
     https://bentobuddies-1e6cf.firebaseapp.com/*
     ```
7. Click **Save**

---

## Step 2: Restrict Google Maps API Key (5 minutes)

1. Still in Google Cloud Console → **Credentials**
2. Find Maps JavaScript API key: `AIzaSyBHplBjzNh6sM6Umtx4bgYJinjHHIaUR28`
3. Click **Edit**
4. Under **Application restrictions**:
   - Select: **HTTP referrers (web sites)**
   - Add the same referrers as above
5. Under **API restrictions**:
   - Select: **Restrict key**
   - Check only:
     - ✅ Maps JavaScript API
     - ✅ Places API
6. Click **Save**

---

## Step 3: Set Firestore Security Rules (5 minutes)

1. Go to Firebase Console
2. Navigate to **Firestore Database**
3. Click **Rules** tab
4. Replace ALL content with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create, update: if isSignedIn() && isOwner(userId);
      allow delete: if isOwner(userId);
    }

    // Meetups collection
    match /meetups/{meetupId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && request.resource.data.createdBy == request.auth.uid;
      allow update: if isSignedIn() &&
        (resource.data.createdBy == request.auth.uid ||
         request.auth.uid in resource.data.attendees[*].userId);
      allow delete: if isSignedIn() && resource.data.createdBy == request.auth.uid;
    }

    // Conversations collection
    match /conversations/{conversationId} {
      allow read, write: if isSignedIn() &&
        request.auth.uid in resource.data.participants;
      allow create: if isSignedIn() &&
        request.auth.uid in request.resource.data.participants;

      match /messages/{messageId} {
        allow read, write: if isSignedIn() &&
          request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
      }
    }
  }
}
```

5. Click **Publish**

---

## Step 4: Set Storage Security Rules (2 minutes)

1. In Firebase Console, go to **Storage**
2. Click **Rules** tab
3. Replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profilePictures/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                      request.auth.uid == userId &&
                      request.resource.size < 5 * 1024 * 1024 &&
                      request.resource.contentType.matches('image/.*');
    }
  }
}
```

4. Click **Publish**

---

## ✅ Verification Checklist

After completing all steps, verify:

- [ ] Firebase API key is restricted to your domains
- [ ] Google Maps API key is restricted to your domains
- [ ] Firestore rules are published (not in test mode)
- [ ] Storage rules are published
- [ ] Test your app - everything should still work
- [ ] Try accessing from unauthorized domain - should fail

---

## Test Security

### Test 1: Try from different domain
Open browser console, try:
```javascript
fetch('https://firestore.googleapis.com/v1/projects/bentobuddies-1e6cf/databases/(default)/documents/users')
```
Should fail with 403 error ✅

### Test 2: Try unauthorized read
Log out, try to access Firestore directly:
Should be blocked by security rules ✅

---

## If Something Breaks

1. **"Permission denied" errors:**
   - Check Firestore rules are correct
   - Verify you're logged in
   - Check browser console for specific error

2. **"API key invalid" errors:**
   - Make sure you added `localhost` to allowed domains
   - Check both HTTP and HTTPS prefixes
   - Try `http://localhost:5500/*` specifically

3. **Maps not loading:**
   - Verify Maps JavaScript API is enabled
   - Check API key restrictions include your domain
   - Look for errors in browser console

---

## Quick Reference

**Your API Keys:**
- Firebase: `AIzaSyDr1_0FfG4NnOHdgVJpZ96EF3dZoLVaP_0`
- Google Maps: `AIzaSyBHplBjzNh6sM6Umtx4bgYJinjHHIaUR28`

**Your Project:**
- Project ID: `bentobuddies-1e6cf`
- Project URL: https://console.firebase.google.com/project/bentobuddies-1e6cf

**Domains to Whitelist:**
```
localhost:*/*
127.0.0.1:*/*
http://localhost:*/*
https://bentobuddies-1e6cf.web.app/*
https://bentobuddies-1e6cf.firebaseapp.com/*
```

---

## After Security Setup

Once done, you can safely:
- Deploy to production
- Share your app URL
- Push to GitHub (API keys are OK in public repo when restricted)

**Total Time:** ~15 minutes
**Priority:** HIGH - Do before deploying!
