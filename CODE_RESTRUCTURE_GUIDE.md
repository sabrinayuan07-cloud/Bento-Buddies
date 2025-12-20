# Code Restructure Guide

## Overview

The Bento Buddies codebase has been restructured to follow modern best practices with a clean separation of concerns. This guide explains the new architecture and how to use it.

## New Directory Structure

```
/
├── config/
│   └── firebase-config.js          # Firebase initialization (moved from root)
├── src/
│   ├── services/                   # Firebase operations & business logic
│   │   ├── auth.service.js         # Authentication operations
│   │   ├── user.service.js         # User profile operations
│   │   ├── meetup.service.js       # Meetup CRUD operations
│   │   └── message.service.js      # Messaging operations
│   ├── utils/                      # Reusable utilities
│   │   ├── error-handler.js        # Error handling & user feedback
│   │   ├── validation.js           # Form validation helpers
│   │   └── date-helpers.js         # Date formatting & manipulation
│   ├── pages/                      # Refactored page scripts
│   │   └── maps.js                 # Maps page (refactored)
│   └── components/                 # Future: Reusable UI components
├── assets/                         # Images, fonts (to replace /Images)
├── [Original page directories still exist for migration]
├── index/
├── home/
├── maps/
├── events/
├── messages/
└── profile/
```

## Key Improvements

### 1. Service Layer Pattern

All Firebase operations are now centralized in service files:

**Before:**
```javascript
// Scattered throughout code
const userDoc = await getDoc(doc(db, 'users', userId));
```

**After:**
```javascript
import { getUserProfile } from '../services/user.service.js';
const result = await getUserProfile(userId);
if (result.success) {
    console.log(result.data);
}
```

### 2. Consistent Error Handling

All service functions return a consistent `{ success, data?, error? }` object:

```javascript
const result = await createMeetup(meetupData, currentUser);
if (result.success) {
    showSuccess('Meetup created!');
    console.log('ID:', result.id);
} else {
    showError(result.error);
}
```

### 3. Reusable Utilities

Common operations are now utility functions:

```javascript
import { formatDateTime, isToday } from '../utils/date-helpers.js';
import { validateEmail, validatePassword } from '../utils/validation.js';
import { showError, showSuccess, showLoading } from '../utils/error-handler.js';
```

## Service Layer API Reference

### Auth Service (`auth.service.js`)

```javascript
import {
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    logOut,
    requireAuth,
    getCurrentUser,
    onAuthChange
} from '../services/auth.service.js';

// Sign up with email
const result = await signUpWithEmail(email, password, profileData);

// Sign in
const result = await signInWithEmail(email, password);
const result = await signInWithGoogle();

// Sign out
await logOut();

// Require authentication (redirect if not logged in)
const user = await requireAuth();

// Get current user
const user = getCurrentUser();

// Listen to auth changes
const unsubscribe = onAuthChange((user) => {
    if (user) {
        // User signed in
    } else {
        // User signed out
    }
});
```

### User Service (`user.service.js`)

```javascript
import {
    getUserProfile,
    updateUserProfile,
    updateProfilePicture,
    searchUsers,
    getAllUsers
} from '../services/user.service.js';

// Get user profile
const result = await getUserProfile(userId);

// Update profile
const result = await updateUserProfile(userId, {
    bio: 'New bio',
    major: 'Computer Science'
});

// Update profile picture
const result = await updateProfilePicture(userId, file);

// Search users
const result = await searchUsers('john');
```

### Meetup Service (`meetup.service.js`)

```javascript
import {
    createMeetup,
    getMeetup,
    getMeetups,
    onMeetupsChange,
    joinMeetup,
    leaveMeetup,
    updateMeetup,
    cancelMeetup,
    deleteMeetup,
    getTodayMeetups,
    getUserMeetups
} from '../services/meetup.service.js';

// Create meetup
const meetupData = {
    restaurantName: 'Blue Chip Cafe',
    restaurantAddress: '123 Main St',
    restaurantLocation: { lat: 49.2606, lng: -123.2460 },
    restaurantPlaceId: 'ChIJ...',
    restaurantPhoto: 'https://...',
    date: '2025-01-15',
    time: '12:00',
    maxSpots: 4,
    details: 'Let\'s have lunch!'
};
const result = await createMeetup(meetupData, currentUser);

// Get all meetups
const result = await getMeetups({ status: 'open' });

// Real-time listener
const unsubscribe = onMeetupsChange((meetups) => {
    // Update UI with new meetups
    displayMeetups(meetups);
}, { status: 'open' });

// Join meetup
const result = await joinMeetup(meetupId, currentUser);

// Leave meetup
const result = await leaveMeetup(meetupId, currentUser);

// Get today's meetups
const result = await getTodayMeetups();

// Get user's meetups
const result = await getUserMeetups(userId);
```

### Message Service (`message.service.js`)

```javascript
import {
    getOrCreateConversation,
    getUserConversations,
    onConversationsChange,
    sendMessage,
    getMessages,
    onMessagesChange,
    markConversationAsRead
} from '../services/message.service.js';

// Get or create conversation
const result = await getOrCreateConversation(userId1, userId2);
const conversationId = result.id;

// Send message
await sendMessage(conversationId, senderId, senderName, 'Hello!');

// Real-time message listener
const unsubscribe = onMessagesChange(conversationId, (messages) => {
    displayMessages(messages);
});

// Mark as read
await markConversationAsRead(conversationId, userId);
```

## Utility Functions

### Error Handler (`error-handler.js`)

```javascript
import { showError, showSuccess, showLoading, hideLoading } from '../utils/error-handler.js';

// Show error toast
showError('Something went wrong!');

// Show success toast
showSuccess('Profile updated!');

// Show loading spinner
showLoading('Saving...');
// ... do async work ...
hideLoading();
```

### Validation (`validation.js`)

```javascript
import {
    validateEmail,
    validateUBCEmail,
    validatePassword,
    validateRequired,
    validateNumberRange,
    validateFutureDate,
    showFieldError,
    clearFieldError
} from '../utils/validation.js';

// Validate email
const result = validateEmail(email);
if (!result.valid) {
    showFieldError(inputElement, result.message);
}

// Validate UBC email
if (!validateUBCEmail(email).valid) {
    showError('Must use a UBC email address');
}

// Validate password
const result = validatePassword(password);

// Validate required
const result = validateRequired(value, 'Username');

// Validate number range
const result = validateNumberRange(spots, 1, 10, 'Spots');
```

### Date Helpers (`date-helpers.js`)

```javascript
import {
    getTodayDate,
    formatDate,
    formatTime,
    formatDateTime,
    getRelativeTime,
    isToday,
    isTomorrow
} from '../utils/date-helpers.js';

// Get today's date (YYYY-MM-DD)
const today = getTodayDate();

// Format date
const formatted = formatDate('2025-01-15'); // "Jan 15, 2025"

// Format time
const formatted = formatTime('14:30'); // "2:30 PM"

// Format date and time
const formatted = formatDateTime('2025-01-15', '14:30'); // "Jan 15, 2025 at 2:30 PM"

// Relative time
const relative = getRelativeTime(timestamp); // "2 hours ago"

// Check if today
if (isToday(dateString)) {
    // Show "Today" badge
}
```

## Migration Guide

### Step 1: Update HTML Script Tags

**Old:**
```html
<script src="maps.js"></script>
```

**New:**
```html
<script type="module" src="../src/pages/maps.js"></script>
```

### Step 2: Convert to ES6 Modules

**Old:**
```javascript
// No imports, uses global firebase-config.js

function createMeetup() {
    // Inline Firebase code
    const docRef = await addDoc(collection(db, 'meetups'), data);
}
```

**New:**
```javascript
import { createMeetup } from '../services/meetup.service.js';
import { showSuccess, showError } from '../utils/error-handler.js';

async function handleCreateMeetup() {
    const result = await createMeetup(meetupData, currentUser);
    if (result.success) {
        showSuccess('Meetup created!');
    } else {
        showError(result.error);
    }
}
```

### Step 3: Use Service Functions

Replace direct Firebase calls with service functions:

**Old:**
```javascript
const userDoc = await getDoc(doc(db, 'users', userId));
if (userDoc.exists()) {
    const userData = userDoc.data();
    // Use userData
}
```

**New:**
```javascript
const result = await getUserProfile(userId);
if (result.success) {
    const userData = result.data;
    // Use userData
}
```

## Security Improvements

### Firebase Config

The Firebase config has been moved to `/config/firebase-config.js` with better documentation about API key restrictions.

**Action Required:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to Project Settings > General
3. Under "Your apps" > Web App > API Key
4. Click "Restrict key"
5. Add allowed domains:
   - `localhost`
   - `127.0.0.1`
   - Your production domain (e.g., `bentobuddies.web.app`)

### Google Maps API

**Action Required:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Credentials
3. Find your Maps JavaScript API key
4. Click "Edit API key"
5. Under "Application restrictions":
   - Select "HTTP referrers"
   - Add:
     - `localhost:*/*`
     - `127.0.0.1:*/*`
     - `your-domain.com/*`

## Next Steps

### Pages to Migrate:

1. ✅ **maps.js** - DONE (src/pages/maps.js)
2. ⏳ **index/auth.js** - Use auth.service.js
3. ⏳ **profile/profile-firebase.js** - Use user.service.js
4. ⏳ **messages/messages.js** - Use message.service.js
5. ⏳ **events/events.html** - Extract JS, use meetup.service.js
6. ⏳ **home/home.html** - Extract JS, use all services for real data

### Features to Implement:

1. **Events Page**: Load real meetups from Firestore
2. **Messages Page**: Implement real-time messaging
3. **Home Dashboard**: Calculate real statistics from Firestore
4. **Profile Page**: Show user's upcoming meetups

## Testing the New Structure

### Test Maps Page (Already Migrated):

1. Update `maps/maps.html`:
```html
<script type="module" src="../src/pages/maps.js"></script>
```

2. Open maps page
3. Select a restaurant
4. Create a meetup
5. Check Firestore console - the meetup should be saved!

### Verify Firestore Data:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to Firestore Database
3. You should see collections:
   - `users` (from signup)
   - `meetups` (from creating meetups)

## Troubleshooting

### "Failed to resolve module specifier" Error

Make sure you're using `type="module"` in your script tag:
```html
<script type="module" src="../src/pages/maps.js"></script>
```

### Import Path Errors

Paths are relative to the HTML file, not the JS file:
```javascript
// In src/pages/maps.js
import { createMeetup } from '../services/meetup.service.js';  // ✅ Correct
import { createMeetup } from './services/meetup.service.js';   // ❌ Wrong
```

### Firebase Not Initialized

Make sure firebase-config is imported:
```javascript
import { auth, db } from '../../config/firebase-config.js';
```

## Benefits of New Structure

1. **Maintainability**: Clear separation of concerns
2. **Reusability**: Services and utilities can be used across pages
3. **Testability**: Services can be tested independently
4. **Error Handling**: Consistent error handling across the app
5. **Type Safety**: Clear function signatures and return types
6. **Scalability**: Easy to add new features without duplicating code

## Questions?

Check the service files for detailed JSDoc comments and examples!
