# Firebase Authentication Setup Guide

## What's Been Implemented

Your Bento Buddies app now has **real Firebase authentication** with the following features:

### Authentication
- ✅ Email/Password signup and login
- ✅ Google Sign-In integration
- ✅ Password validation (minimum 8 characters)
- ✅ Automatic redirect on login/logout
- ✅ Protected routes (must be logged in to access app)

### User Profiles
- ✅ Multi-step signup wizard (3 steps)
- ✅ User profile data stored in Firestore database
- ✅ Profile picture upload to Firebase Storage
- ✅ Food emoji preferences (up to 3)
- ✅ Personality tags
- ✅ Bio, fun fact, last meal fields

### Security
- ✅ Real authentication (no more localStorage hacks!)
- ✅ Secure password storage
- ✅ Firebase handles all security
- ✅ Session management

## Files Created/Modified

### New Files:
- `firebase-config.js` - Firebase initialization and exports
- `index/auth.js` - Authentication logic (login, signup, Google Sign-In)
- `index/signup.css` - Signup modal styles
- `profile/profile-firebase.js` - Firebase-enabled profile management
- `FIREBASE_SETUP.md` - This file

### Modified Files:
- `index/index.html` - Added signup modal and Google Sign-In button
- `home/home.html` - Updated to use Firebase auth check
- `profile/profile.html` - Updated to use profile-firebase.js

## How to Test

### 1. Serve the App Locally

Firebase requires the app to be served over HTTP (not file://). Use a local server:

**Option A: Python**
```bash
# Python 3
cd /Users/sabrinayuan/Documents/HackCamp2025-1
python3 -m http.server 8000

# Then visit: http://localhost:8000/index/index.html
```

**Option B: VS Code Live Server**
1. Install "Live Server" extension in VS Code
2. Right-click `index/index.html`
3. Select "Open with Live Server"

**Option C: Node.js http-server**
```bash
npm install -g http-server
cd /Users/sabrinayuan/Documents/HackCamp2025-1
http-server -p 8000

# Then visit: http://localhost:8000/index/index.html
```

### 2. Test Signup Flow

1. Click "Log In" button on landing page
2. Click "Sign up" link at bottom of login modal
3. Complete the 3-step signup wizard:
   - **Step 1**: Enter email and password (min 8 chars)
   - **Step 2**: Enter name, year, and major
   - **Step 3**: Add bio, personality tags, food emojis, profile picture (all optional)
4. Click "Create Account"
5. You should be redirected to the home page

### 3. Test Login Flow

1. Log out (you'll need to add a logout button - see below)
2. Click "Log In" button
3. Enter your email and password
4. Click "Log In"
5. You should be redirected to home page

### 4. Test Google Sign-In

1. Click "Log In" button
2. Click "Sign in with Google"
3. Select your Google account
4. You should be redirected to home page

### 5. Test Profile Page

1. Navigate to Profile page
2. Your profile data from signup should be displayed
3. Click "Edit" to modify your profile
4. Make changes and click "Save Changes"
5. Changes should be persisted in Firebase

## Adding Logout Functionality

You'll need to add a logout button to your navigation. Here's how:

### Option 1: Add to Navigation Bar

Edit the navigation in `home/home.html`, `maps/maps.html`, `events/events.html`, `messages/messages.html`, and `profile/profile.html`:

```html
<nav>
    <div class="nav-container">
        <a href="../home/home.html"><button>Home</button></a>
        <a href="../maps/maps.html"><button>Maps</button></a>
        <a href="../events/events.html"><button>Events</button></a>
        <a href="../messages/messages.html"><button>Messages</button></a>
        <a href="../profile/profile.html"><button>Profile</button></a>
        <button class="logout-btn" id="logoutBtn" style="margin-left: auto; background: #ff5252; color: white;">Logout</button>
    </div>
</nav>

<script type="module">
    import { auth, signOut } from '../firebase-config.js';

    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        try {
            await signOut(auth);
            window.location.href = '../index/index.html';
        } catch (error) {
            console.error('Error signing out:', error);
        }
    });
</script>
```

## Troubleshooting

### Error: "Firebase: Error (auth/unauthorized-domain)"
**Solution**: Add your local server URL to authorized domains:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your "bento-buddies" project
3. Go to Authentication > Settings > Authorized domains
4. Add `localhost` if not already there

### Error: "Module not found" or CORS errors
**Solution**: Make sure you're serving the app over HTTP (not opening files directly)

### Google Sign-In doesn't work
**Solution**:
1. Check that Google Sign-In is enabled in Firebase Console > Authentication > Sign-in method
2. Make sure you selected a support email when enabling Google Sign-In
3. Add your domain to authorized domains

### Profile picture not uploading
**Solution**:
1. Check Firebase Console > Storage to ensure it's enabled
2. Verify Storage rules allow uploads (should be in test mode for now)

### Can't access Firestore data
**Solution**:
1. Check Firebase Console > Firestore Database to ensure it's enabled
2. Verify Firestore rules allow read/write (should be in test mode for now)

## Firebase Console Links

- **Authentication**: https://console.firebase.google.com/project/bento-buddies/authentication/users
- **Firestore Database**: https://console.firebase.google.com/project/bento-buddies/firestore
- **Storage**: https://console.firebase.google.com/project/bento-buddies/storage

## Security Notes

⚠️ **Important for Production:**

Currently, Firestore and Storage are in "test mode" which allows anyone to read/write. Before going to production:

1. Update Firestore rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

2. Update Storage rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profilePictures/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Next Steps

1. Test the complete authentication flow
2. Add logout buttons to all pages
3. Update other pages (maps, events, messages) to use Firebase auth
4. Consider implementing password reset functionality
5. Add user profile completion percentage
6. Implement social features (friends, meetup creation, etc.)

## Data Structure

### Firestore User Document (`users/{uid}`)
```javascript
{
  email: string,
  firstName: string,
  lastName: string,
  name: string,
  username: string,
  year: string,
  major: string,
  bio: string,
  personality: string[],
  funFact: string,
  lastMeal: string,
  favoriteFoods: string[],  // Array of emoji strings
  profilePicture: string,   // Firebase Storage URL
  createdAt: string         // ISO timestamp
}
```

### Firebase Storage Structure
```
profilePictures/
  {userId}/  - User's profile picture file
```
