# Security Setup Guide

## Critical: Secure Your API Keys

Your Firebase and Google Maps API keys are currently exposed in client-side code. This is normal for these services, but you **MUST** restrict them to prevent abuse.

## Firebase Security

### Step 1: Restrict Firebase API Keys

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **bentobuddies-1e6cf**
3. Click the gear icon ⚙️ > **Project settings**
4. Scroll to "Your apps" section
5. Find your Web App
6. Click **Restrict key** next to your API Key

### Step 2: Configure Application Restrictions

In Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **bentobuddies-1e6cf**
3. Navigate to **APIs & Services** > **Credentials**
4. Find the API key starting with `AIzaSyDr1_0FfG4NnOHdgVJpZ96EF3dZoLVaP_0`
5. Click **Edit**
6. Under **Application restrictions**:
   - Select **HTTP referrers (web sites)**
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

### Step 3: Set Up Firestore Security Rules

1. In Firebase Console, go to **Firestore Database**
2. Click on the **Rules** tab
3. Replace with these production rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      // Anyone authenticated can read profiles
      allow read: if isSignedIn();

      // Only owner can create/update their profile
      allow create: if isSignedIn() && isOwner(userId);
      allow update: if isSignedIn() && isOwner(userId);

      // Only owner can delete their profile
      allow delete: if isOwner(userId);
    }

    // Meetups collection
    match /meetups/{meetupId} {
      // Anyone authenticated can read meetups
      allow read: if isSignedIn();

      // Anyone authenticated can create meetups
      allow create: if isSignedIn() &&
                       request.resource.data.createdBy == request.auth.uid;

      // Only creator or attendees can update
      allow update: if isSignedIn() &&
                       (resource.data.createdBy == request.auth.uid ||
                        request.auth.uid in resource.data.attendees[*].userId);

      // Only creator can delete
      allow delete: if isSignedIn() && resource.data.createdBy == request.auth.uid;
    }

    // Conversations collection
    match /conversations/{conversationId} {
      // Only participants can read/write conversations
      allow read, write: if isSignedIn() &&
                            request.auth.uid in resource.data.participants;

      // Allow creation if current user is a participant
      allow create: if isSignedIn() &&
                       request.auth.uid in request.resource.data.participants;

      // Messages subcollection
      match /messages/{messageId} {
        // Only conversation participants can read/write messages
        allow read, write: if isSignedIn() &&
          request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
      }
    }
  }
}
```

4. Click **Publish**

### Step 4: Set Up Storage Security Rules

1. In Firebase Console, go to **Storage**
2. Click on the **Rules** tab
3. Replace with these rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile pictures
    match /profilePictures/{userId}/{fileName} {
      // Anyone authenticated can read
      allow read: if request.auth != null;

      // Only owner can upload/update/delete their pictures
      allow write: if request.auth != null && request.auth.uid == userId;

      // Validate file is an image and under 5MB
      allow write: if request.resource.size < 5 * 1024 * 1024 &&
                      request.resource.contentType.matches('image/.*');
    }

    // Prevent all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

4. Click **Publish**

## Google Maps API Security

### Step 1: Restrict Google Maps API Key

Your Maps API key is embedded in `maps/maps.html`. Restrict it:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Find your Maps JavaScript API key
4. Click **Edit**
5. Under **Application restrictions**:
   - Select **HTTP referrers (web sites)**
   - Add the same referrers as above:
     ```
     localhost:*/*
     127.0.0.1:*/*
     http://localhost:*/*
     https://bentobuddies-1e6cf.web.app/*
     https://bentobuddies-1e6cf.firebaseapp.com/*
     ```

### Step 2: Restrict API Permissions

1. Still in the API key settings
2. Under **API restrictions**:
   - Select **Restrict key**
   - Select only:
     - Maps JavaScript API
     - Places API
     - Geocoding API (if you use it)
3. Click **Save**

## Email Verification (Recommended)

### Require UBC Email Addresses

Update your signup process to only allow `@ubc.ca` or `@student.ubc.ca` emails:

```javascript
// In src/services/auth.service.js, add to signUpWithEmail:
import { validateUBCEmail } from '../utils/validation.js';

export async function signUpWithEmail(email, password, profileData) {
    // Validate UBC email
    if (!validateUBCEmail(email).valid) {
        return {
            success: false,
            error: 'Please use a UBC email address (@ubc.ca or @student.ubc.ca)'
        };
    }

    // ... rest of function
}
```

### Enable Email Verification

1. In Firebase Console, go to **Authentication**
2. Click **Templates** tab
3. Customize the email verification template
4. In your signup code, send verification email:

```javascript
import { sendEmailVerification } from 'firebase/auth';

// After creating user
await sendEmailVerification(userCredential.user);
```

## Additional Security Best Practices

### 1. Rate Limiting

Consider adding Firebase App Check to prevent abuse:

1. In Firebase Console, go to **App Check**
2. Register your web app
3. Use reCAPTCHA v3 for web
4. Enforce App Check for:
   - Firestore
   - Storage
   - Functions (when you add them)

### 2. Input Sanitization

Always sanitize user input before displaying:

```javascript
// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Use when displaying user content
element.textContent = userInput; // Safe (uses textContent, not innerHTML)
element.innerHTML = escapeHtml(userInput); // Safe (escaped)
```

### 3. Content Security Policy

Add to your HTML `<head>`:

```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://www.gstatic.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https: blob:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.cloudfunctions.net;
    frame-src 'none';
">
```

### 4. HTTPS Only

When deploying:

1. Always use HTTPS (Firebase Hosting does this automatically)
2. Set Firestore rules to require auth
3. Never expose sensitive data in client code

### 5. Monitor Usage

1. Set up billing alerts in Google Cloud Console
2. Monitor Firebase usage in Firebase Console
3. Check for unusual activity regularly

## Checklist

Before deploying to production:

- [ ] Restricted Firebase API key to your domains
- [ ] Set up Firestore security rules
- [ ] Set up Storage security rules
- [ ] Restricted Google Maps API key
- [ ] Enabled email verification (optional)
- [ ] Added UBC email validation (optional)
- [ ] Set up Firebase App Check (recommended)
- [ ] Added Content Security Policy headers
- [ ] Tested all security rules
- [ ] Set up usage monitoring and alerts

## Testing Security Rules

Use the Firebase Console Rules Playground:

1. Go to **Firestore Database** > **Rules**
2. Click **Rules Playground**
3. Test scenarios:
   - Unauthenticated user trying to read profiles (should fail)
   - User trying to update someone else's profile (should fail)
   - User trying to read meetups (should succeed if authenticated)
   - User trying to delete others' meetups (should fail)

## Emergency: If Keys Are Compromised

If you accidentally commit API keys to GitHub:

1. **Immediately rotate keys:**
   - Firebase: Generate new API key in Project Settings
   - Google Maps: Create new API key in Cloud Console

2. **Delete old keys**

3. **Update your code with new keys**

4. **Force push to GitHub to remove from history:**
   ```bash
   git filter-branch --force --index-filter \
   "git rm --cached --ignore-unmatch firebase-config.js" \
   --prune-empty --tag-name-filter cat -- --all
   ```

5. **Check GitHub's "security" tab for leaked secrets alerts**

## Support

If you need help:
- [Firebase Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Google Maps API Security](https://developers.google.com/maps/api-security-best-practices)
