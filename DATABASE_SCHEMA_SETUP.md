# Database Schema Setup - Already Done! ✅

## Good News!

Your database schema is **already defined and working**. It gets created automatically when your app saves data.

---

## Current Database Structure

### 1. Users Collection: `users/{userId}`

**Created by:** `src/services/auth.service.js` when users sign up

**Schema:**
```javascript
{
  // Auto-generated
  id: "auto-generated-user-id",

  // User info
  email: "student@ubc.ca",
  firstName: "John",
  lastName: "Doe",
  name: "John Doe",
  username: "johndoe",

  // Profile details
  year: 2,
  major: "Computer Science",
  bio: "Love trying new restaurants!",
  personality: ["Foodie", "Adventurous", "Social"],
  funFact: "I've tried every sushi place near UBC",
  lastMeal: "Ramen",
  favoriteFoods: ["🍜", "🍕", "🍔"], // Max 3 emojis
  profilePicture: "https://firebasestorage.../image.jpg",

  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Already working in:** Profile page, Home dashboard

---

### 2. Meetups Collection: `meetups/{meetupId}`

**Created by:** `src/services/meetup.service.js` when users create meetups

**Schema:**
```javascript
{
  // Auto-generated
  id: "auto-generated-meetup-id",

  // Creator info
  createdBy: "user-id",
  creatorName: "John Doe",
  creatorPicture: "https://...",

  // Restaurant info
  restaurantName: "Kinton Ramen",
  restaurantAddress: "4288 Main Street, Vancouver",
  restaurantLocation: {
    lat: 49.2606,
    lng: -123.2460
  },
  restaurantPlaceId: "ChIJXxW...", // Google Places ID
  restaurantPhoto: "https://maps.googleapis.com/...",

  // Meetup details
  date: "2025-12-25", // YYYY-MM-DD
  time: "12:00", // HH:MM 24-hour format
  maxSpots: 4,
  details: "Let's try their new menu!",

  // Attendees array
  attendees: [
    {
      userId: "user-id-1",
      name: "John Doe",
      picture: "https://...",
      joinedAt: "2025-12-18T10:30:00Z"
    },
    {
      userId: "user-id-2",
      name: "Jane Smith",
      picture: "https://...",
      joinedAt: "2025-12-18T11:00:00Z"
    }
  ],

  // Status
  status: "open", // "open", "full", "cancelled", "completed"

  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Already working in:** Maps page (creation), Events page (display, join/leave)

---

### 3. Conversations Collection: `conversations/{conversationId}`

**Created by:** `src/services/message.service.js` when users start messaging

**Schema:**
```javascript
{
  // Auto-generated
  id: "auto-generated-conversation-id",

  // Participants (exactly 2 users)
  participants: ["user-id-1", "user-id-2"],

  // Participant details (for quick access)
  participantDetails: {
    "user-id-1": {
      name: "John Doe",
      picture: "https://..."
    },
    "user-id-2": {
      name: "Jane Smith",
      picture: "https://..."
    }
  },

  // Last message info
  lastMessage: "See you at 6!",
  lastMessageTime: Timestamp,

  // Unread counts per user
  unreadCount: {
    "user-id-1": 0,
    "user-id-2": 2
  },

  // Timestamps
  createdAt: Timestamp
}
```

**Already working in:** Messages page (when you implement message creation)

---

### 4. Messages Subcollection: `conversations/{conversationId}/messages/{messageId}`

**Created by:** `src/services/message.service.js` when users send messages

**Schema:**
```javascript
{
  // Auto-generated
  id: "auto-generated-message-id",

  // Sender info
  senderId: "user-id",
  senderName: "John Doe",

  // Message content
  text: "Hey, want to grab lunch?",
  type: "text", // "text", "voice", "image"

  // Optional fields
  voiceNoteUrl: "https://...", // Only if type === "voice"
  imageUrl: "https://...", // Only if type === "image"

  // Status
  read: false,

  // Timestamp
  timestamp: Timestamp
}
```

**Already working in:** Messages page (real-time display)

---

## Verify Your Schema is Working

### Check in Firebase Console

1. Go to: https://console.firebase.google.com/
2. Select: **bentobuddies-1e6cf**
3. Click: **Firestore Database** (left sidebar)
4. You should see these collections:

```
📁 users
   └─ [your-user-id]
       ├─ email: "your@email.com"
       ├─ name: "Your Name"
       └─ ...

📁 meetups
   └─ [meetup-id] (if you created any)
       ├─ restaurantName: "..."
       ├─ date: "2025-12-25"
       └─ attendees: [...]

📁 conversations (empty for now)
```

---

## What You Need to Do Now

### Option 1: Create Test Data (Recommended - 10 minutes)

Let's create some sample data to verify everything works:

#### Step 1: Create Your First Meetup
1. Open: `maps/maps.html`
2. Log in if not already
3. Click a restaurant on the map
4. Click "Create Meetup"
5. Fill out the form:
   - Date: Tomorrow
   - Time: 12:00 PM
   - Spots: 4
   - Details: "Test meetup"
6. Click "Create Meetup"

**Verify:**
- Firebase Console → Firestore → `meetups` collection
- You should see your meetup!

#### Step 2: Join Your Own Meetup
1. Open: `events/events.html`
2. Find your meetup in the carousel
3. Click on it
4. You should already be listed as an attendee ✅

#### Step 3: Check Home Dashboard
1. Open: `home/home.html`
2. Numbers should show:
   - Total Users: 1 (you)
   - Active Users: 1 (you)
   - Meetups: 1 (your test meetup)
3. You should appear in "Most Active Users"

---

### Option 2: Add More Test Users (Advanced - 30 minutes)

If you want to test with multiple users:

1. **Create a second account:**
   - Log out
   - Sign up with different email
   - Create profile

2. **Have second user join your meetup:**
   - Go to Events page
   - Click your meetup
   - Click "Join Meetup"

3. **Verify in Firebase:**
   - Meetup now has 2 attendees
   - Home dashboard shows 2 users

---

## Schema Indexes (Optional - Only if Needed)

Firestore will auto-create indexes for simple queries. You only need manual indexes if:
- Queries fail with "requires an index" error
- You're doing complex multi-field queries

**For now:** Skip this. The app will tell you if an index is needed.

If you get an error, Firebase Console will show a link to auto-create the index.

---

## What's Already Configured

✅ **Collection names** - Defined in service files
✅ **Field types** - TypeScript-style JSDoc comments in services
✅ **Validation** - Built into service layer (e.g., can't join if full)
✅ **Security rules** - Already published!
✅ **Real-time listeners** - Events and messages update automatically

---

## Summary: You're Ready to Use It!

**Phase 1 is DONE!** The schema is:
- ✅ Defined in your service layer code
- ✅ Creates automatically when data is saved
- ✅ Validated by your services
- ✅ Protected by security rules

**Next steps:**
1. Create a test meetup (verify `meetups` collection)
2. Check home dashboard (verify data calculations work)
3. Test join/leave (verify `attendees` array updates)
4. Deploy your app! 🚀

You don't need to manually create collections or documents. Just use your app and the schema creates itself!

---

## If You Want to See Schema Code

The schema definitions are in these files:

**User schema:**
```bash
open src/services/auth.service.js
# Line 35-50: User profile structure
```

**Meetup schema:**
```bash
open src/services/meetup.service.js
# Line 28-51: Meetup structure
```

**Message schema:**
```bash
open src/services/message.service.js
# Line 90-96: Conversation structure
# Line 162-169: Message structure
```

All schemas are documented with comments!
