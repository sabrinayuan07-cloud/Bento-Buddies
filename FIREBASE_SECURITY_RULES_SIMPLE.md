# Firebase Security Rules - Simple Setup

## Why You Need This

The Firebase API key in your code (`AIzaSyDr1_0FfG4NnOHdgVJpZ96EF3dZoLVaP_0`) is PUBLIC - it's in your HTML files.

**This is normal and OK!**

The key is protected by **Firestore Security Rules**, which control who can read/write data.

---

## Current Problem

Right now your Firestore is probably in **"test mode"** which means:
- ⚠️ ANYONE can read ALL your data
- ⚠️ ANYONE can write/delete ANY data
- ⚠️ All user profiles are public to the internet
- ⚠️ Anyone can delete all your meetups

**You need to fix this NOW before deploying!**

---

## Step 1: Check Current Rules

1. Go to https://console.firebase.google.com/
2. Select **bentobuddies-1e6cf**
3. Click **Firestore Database** in left sidebar
4. Click **Rules** tab at the top

You probably see something like this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 1, 20);
    }
  }
}
```

☝️ This means "everyone can read/write until Jan 20, 2025" - **VERY UNSAFE!**

---

## Step 2: Replace with Secure Rules

1. **Delete everything** in the rules editor
2. **Copy and paste** this entire block:

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

    // Check if user is in attendees array
    function isAttendee(attendees) {
      return request.auth.uid in attendees.map(a => a.userId);
    }

    // USERS COLLECTION
    // Anyone logged in can see profiles
    // Only you can edit your own profile
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create, update: if isSignedIn() && isOwner(userId);
      allow delete: if isOwner(userId);
    }

    // MEETUPS COLLECTION
    // Anyone logged in can see meetups
    // Anyone can create a meetup
    // Only creator or attendees can update (to join/leave)
    // Only creator can delete
    match /meetups/{meetupId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() &&
                       request.resource.data.createdBy == request.auth.uid;
      allow update: if isSignedIn() &&
                       (resource.data.createdBy == request.auth.uid ||
                        isAttendee(resource.data.attendees));
      allow delete: if isSignedIn() &&
                       resource.data.createdBy == request.auth.uid;
    }

    // CONVERSATIONS COLLECTION
    // Only the two participants can read/write their conversation
    match /conversations/{conversationId} {
      allow read, write: if isSignedIn() &&
                            request.auth.uid in resource.data.participants;
      allow create: if isSignedIn() &&
                       request.auth.uid in request.resource.data.participants;

      // Messages subcollection
      match /messages/{messageId} {
        allow read, write: if isSignedIn() &&
          request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
      }
    }
  }
}
```

3. Click **Publish** button

---

## Step 3: Verify It Works

### Test 1: Logged In User Can Read
1. Make sure you're logged in to your app
2. Open home page - should load fine ✅
3. Open events page - should show meetups ✅

### Test 2: Logged Out User Cannot Read
1. Log out of your app
2. Try to open home page
3. Should redirect to login ✅

### Test 3: Cannot Edit Other Users
1. Try to manually edit someone else's profile in Firestore
2. Should get "permission denied" error ✅

---

## Step 4: Set Up Storage Rules (For Profile Pictures)

1. Still in Firebase Console
2. Click **Storage** in left sidebar
3. Click **Rules** tab
4. Replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile pictures
    match /profilePictures/{userId}/{fileName} {
      // Anyone can read
      allow read: if request.auth != null;

      // Only owner can upload/update their own pictures
      allow write: if request.auth != null &&
                      request.auth.uid == userId &&
                      request.resource.size < 5 * 1024 * 1024 &&
                      request.resource.contentType.matches('image/.*');
    }
  }
}
```

5. Click **Publish**

---

## What These Rules Do

### Users Collection
```javascript
✅ Logged in users can VIEW all profiles
✅ You can EDIT only YOUR profile
❌ Cannot edit someone else's profile
❌ Logged out users cannot see anything
```

### Meetups Collection
```javascript
✅ Logged in users can VIEW all meetups
✅ Anyone can CREATE a meetup
✅ Creator can DELETE their meetup
✅ Attendees can UPDATE to join/leave
❌ Cannot delete someone else's meetup
❌ Logged out users cannot see meetups
```

### Conversations Collection
```javascript
✅ Only the 2 participants can see their messages
❌ Other users cannot read your private messages
❌ Cannot see conversations you're not in
```

### Storage (Profile Pictures)
```javascript
✅ Anyone can VIEW profile pictures
✅ You can UPLOAD your own picture (max 5MB, images only)
❌ Cannot upload to someone else's folder
❌ Cannot upload non-images
❌ Cannot upload files > 5MB
```

---

## Common Errors After Setting Rules

### Error: "Missing or insufficient permissions"

**This is GOOD!** It means the rules are working.

**Causes:**
1. You're not logged in → Log in and try again
2. Trying to access data you don't own → This is correct behavior

### Error: "Cannot read property 'participants' of undefined"

**Solution:** Make sure conversation exists before accessing it

---

## Summary

After this setup:

✅ **Firebase API key is safe** (protected by these rules)
✅ **Only logged-in users can see data**
✅ **Users can only edit their own data**
✅ **Private conversations stay private**
✅ **Profile pictures are size-limited**

Your app is now secure! 🔒

---

## Next: Restrict Google Maps API Key

Now follow: `GOOGLE_MAPS_API_RESTRICTION.md`
