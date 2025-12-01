# 🍱 Bento Buddies

**Find your perfect meal companion at UBC!**

Bento Buddies is a social dining platform designed to help UBC students connect over food. Whether you're looking to make new friends, discover restaurants around campus, or simply find someone to grab lunch with between classes—Bento Buddies makes campus dining a social experience.

Built with ❤️ at UBC Hack Camp 2025

---

## ✨ Features

### 🗺️ Interactive Maps
- Explore 45+ restaurants around UBC campus
- Google Maps integration with real restaurant data
- Click-to-view photo galleries for each location
- One-click meetup creation at your favorite spots
- Set date, time, and group size (max 10 people)

### 📅 Events Discovery
- Browse upcoming meetups across campus
- Filter by restaurant, date, or time
- Join existing meetups or create your own
- Real-time availability updates
- Meetup calendar integration

### 💬 Real-time Messaging
- Chat with other students about food plans
- Coordinate meetup details
- Beautiful gradient profile avatars
- Read receipts and typing indicators
- Search conversations

### 👤 Customizable Profile
- Upload profile pictures
- Select up to 3 favorite food emojis
- Add personality tags
- Share fun facts and your "last meal on earth"
- Integrated meetup calendar
- Track your meetup history

### 📊 Platform Analytics
- Live statistics on active users and meetups
- See the most popular restaurants on campus
- Peak dining times visualization
- User demographics breakdown
- Top active users leaderboard

---

## 🛠️ Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript (ES6+)
- Responsive design with mobile-first approach
- Custom CSS animations and transitions
- Google Maps JavaScript API

**Backend & Database:**
- Firebase Authentication (email/password)
- Cloud Firestore (real-time database)
- Firebase Storage (profile pictures)
- Serverless architecture

**APIs & Services:**
- Google Maps API
- Google Places API (restaurant data & photos)

---

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Google Maps API key
- Firebase project configuration

### Local Setup

1. Clone the repository:
```bash
git clone https://github.com/sabrinayuan07-cloud/Bento-Buddies.git
cd Bento-Buddies
```

2. Add your Firebase configuration:
   - Create a `firebase-config.js` file in the root directory
   - Add your Firebase project credentials

3. Add your Google Maps API key:
   - Update the API key in `maps/maps.html` (line 233)

4. Serve the application:
   - Use VS Code Live Server extension, or
   - Use any local HTTP server:
     ```bash
     python -m http.server 8000
     # or
     npx serve
     ```

5. Open `http://localhost:8000` in your browser

---

## 📱 Pages Overview

### Home
The main landing page featuring platform statistics and analytics dashboard. See active users, popular restaurants, peak dining times, and top contributors.

### Maps
Interactive Google Maps interface showing UBC area restaurants. Click any location to view photos, ratings, and details—then create a meetup instantly.

### Events
Discover and join upcoming campus dining events. Filter by preferences, see who's attending, and RSVP with one click.

### Messages
Direct messaging system to coordinate with other students. Chat with potential dining buddies and finalize meetup plans.

### Profile
Your personal hub showing upcoming meetups, past events, and customizable profile information. Edit your preferences and track your social dining journey.

---

## 🎨 Design Philosophy

Bento Buddies features a warm, approachable design with:
- Soft pink color palette (#FFF5F3, #FF93A9, #FFB3C6)
- Smooth animations and transitions
- Modern card-based layouts
- Gradient accents for visual interest
- Responsive design for all screen sizes
- Accessibility-first approach

---

## 🌐 Deployment

To make the website accessible without VS Code:

### Option 1: Firebase Hosting (Recommended - already using Firebase)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Option 2: Netlify
1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import from Git"
4. Select your repository
5. Deploy!

### Option 3: Vercel
```bash
npm i -g vercel
vercel
```

### Option 4: GitHub Pages
1. Go to your repository settings
2. Navigate to "Pages"
3. Select branch to deploy
4. Your site will be live at `username.github.io/repo-name`

---

## 👥 Team

**Bento Buddies** was created by:
- **Bhumika** - Developer
- **Wakana** - Developer
- **Vicky** - Developer
- **Sabrina** - Developer

Built during UBC Hack Camp 2025

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🙏 Acknowledgments

- UBC Hack Camp 2025 organizers
- Google Maps Platform
- Firebase team
- All the amazing UBC restaurants that make campus dining special!

---

**Made with 🍜 at UBC**
