# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bento Buddies is a web application for UBC students to connect for spontaneous or planned meals on campus. The app is built with vanilla HTML, CSS, and JavaScript, using client-side localStorage for data persistence and Google Maps/Places API for restaurant discovery.

## Architecture

### Page Structure

The application consists of 5 main pages, each in its own directory:

- **index/** - Landing page with login/authentication modal
- **home/** - Main dashboard (requires login)
- **maps/** - Restaurant discovery and meetup creation using Google Maps API
- **events/** - View and search upcoming meal meetups
- **messages/** - Direct messaging between users
- **profile/** - User profile management with editable fields

Navigation is shared across all authenticated pages via a consistent nav bar that links between sections.

### Data Flow

**Authentication:**
- Login handled in `index/index.html` stores `isLoggedIn`, `userEmail`, `userName`, and `userPicture` in localStorage
- Google Sign-In integration available (JWT parsing in index.html:108-136)
- Home page checks `isLoggedIn` and redirects to index if false

**User Profiles:**
- Profile data stored in localStorage under key `userProfile`
- Default profile structure in `profile/profile.js:2-13` includes: name, username, year, major, bio, personality tags, funFact, lastMeal, favoriteFoods, profilePicture
- Edit mode toggles between display and input fields for inline editing

**Messaging:**
- Contacts and conversations stored in `messages/messages.js` (currently hardcoded)
- Conversation data keyed by contact ID
- Support for text messages and voice note waveforms

**Events:**
- Event data hardcoded in `events/events.html:74-87`
- Separated into "Happening Today" and "Future Events"
- Auto-scrolling carousel with infinite scroll effect

**Maps/Restaurant Discovery:**
- Google Maps API integration in `maps/maps.js`
- Searches multiple place types and specific keywords around UBC campus (center: 49.2606, -123.2460)
- Selected restaurant details displayed in sidebar card with tabs: Overview, Reviews, About
- Meetup modal validates required fields (date, time, spots) with visual error feedback

### Key Technical Patterns

**Modal Pattern:**
All modals (login, meetup creation, profile editing) follow same pattern:
- `.modal` container with `.modal-content`
- `.active` class toggles visibility
- Click outside to close functionality
- Form validation before submission

**Google Maps Integration:**
- `initMap()` initializes map centered on UBC
- `searchRestaurants()` queries Places API for multiple types and keywords
- `createMarker()` creates map markers, filtering unwanted results
- `selectRestaurant()` handles selection state and fetches place details
- Place details fetched with fields array in `maps.js:142-144`

**State Management:**
- No framework - uses vanilla JS with global variables
- Editing states tracked with boolean flags (e.g., `isEditing` in profile.js)
- Selected items tracked in component-scoped variables (e.g., `selectedMarker`, `selectedPlace` in maps.js)

## Development

### File Organization

Each feature directory contains:
- `*.html` - Page structure and inline JavaScript
- `*.css` - Component-specific styles
- `*.js` - Business logic (where separated from HTML)
- Image assets (PNG files) within the directory

### Navigation Links

Navigation links use relative paths to parent directories:
```html
<a href="../home/home.html"><button>Home</button></a>
```

Note: Some files have inconsistent casing (e.g., `Home.html` vs `home.html`, `Events.html` vs `events.html`). Check existing references when adding new links.

### Google Maps API

The maps page requires Google Maps JavaScript API loaded in HTML:
- Uses Places Service for restaurant search
- Custom markers with circle icons (pink when selected: #FF93A9)
- Search radius: 1500m around UBC center

### LocalStorage Schema

**User Authentication:**
```javascript
localStorage.setItem('isLoggedIn', 'true');
localStorage.setItem('userEmail', email);
localStorage.setItem('userName', name);
localStorage.setItem('userPicture', url);
```

**User Profile:**
```javascript
{
  name: string,
  username: string,
  year: number,
  major: string,
  bio: string,
  personality: string[],
  funFact: string,
  lastMeal: string,
  favoriteFoods: string[],  // max 3 items
  profilePicture: string    // base64 data URL
}
```

### Adding New Features

When adding features:
1. Keep JavaScript inline in HTML if simple, or create separate `.js` file for complex logic
2. Use localStorage for data persistence (no backend)
3. Follow the existing modal pattern for dialogs
4. Maintain navigation consistency across pages
5. Use pink accent color (#FF93A9) for primary actions and highlights
6. Ensure responsive design patterns match existing pages

### Modal Form Validation Pattern

For forms requiring validation (see `maps.js:335-379`):
1. Clear previous errors at start
2. Validate each field individually
3. Add `.error` class to input wrapper and `.show` class to error icon
4. Add `.shake` class with setTimeout for animation
5. Return early if `hasError` is true

## Potential Issues

- File path casing inconsistencies between links (home.html vs Home.html)
- No actual backend - all data is client-side and ephemeral
- Google Maps API key not visible in codebase (must be configured separately)
- Event and message data is hardcoded, not dynamic
- No actual authentication - just localStorage flag checking
