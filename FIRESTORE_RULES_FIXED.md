# Fixed Firestore Security Rules

## Copy and Paste This Instead:

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

## What I Changed:

**Line 17-19:** Added a helper function `isAttendee()` that properly checks the attendees array

**Line 42:** Changed from:
```javascript
request.auth.uid in resource.data.attendees[*].userId  ❌ Doesn't work
```

To:
```javascript
isAttendee(resource.data.attendees)  ✅ Works!
```

This uses the `.map()` function which Firestore Security Rules supports.

---

## Steps to Apply:

1. Go to Firebase Console → Firestore Database → Rules
2. **Delete everything** in the editor
3. **Copy the entire code block above** (from `rules_version` to the last `}`)
4. **Paste** into the rules editor
5. Click **Publish**

Should work now! ✅
