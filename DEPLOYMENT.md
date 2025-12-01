# 🚀 Deployment Guide for Bento Buddies

## Quick Start: Firebase Hosting (Recommended)

Since you're already using Firebase for authentication and database, Firebase Hosting is the easiest option!

### Step 1: Install Firebase CLI

Open your terminal and run:
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

This will open your browser to sign in with your Google account.

### Step 3: Initialize Firebase Hosting

In your project directory:
```bash
cd /Users/sabrinayuan/Documents/HackCamp2025-1
firebase init hosting
```

**When prompted, select:**
- Use existing Firebase project (select your Bento Buddies project)
- Public directory: `.` (just press Enter for current directory)
- Configure as single-page app: `No`
- Set up automatic builds: `No`
- Don't overwrite index.html if asked

### Step 4: Deploy!

```bash
firebase deploy --only hosting
```

Your site will be live at: `https://your-project-name.web.app`

---

## Alternative: Netlify (Easiest - No Command Line!)

### Steps:
1. Go to [netlify.com](https://netlify.com) and sign up/login with GitHub
2. Click **"Add new site"** → **"Import an existing project"**
3. Select **GitHub** and authorize Netlify
4. Choose your **Bento-Buddies** repository
5. Leave settings as default and click **"Deploy"**
6. Your site will be live at `https://your-site-name.netlify.app`

**Bonus:** Every time you push to GitHub, Netlify automatically redeploys! 🎉

---

## Alternative: GitHub Pages (Free & Simple)

### Steps:
1. Go to your GitHub repository: `https://github.com/sabrinayuan07-cloud/Bento-Buddies`
2. Click **Settings** → **Pages** (in left sidebar)
3. Under "Source", select your branch (probably `Sabrina` or `main`)
4. Click **Save**
5. Wait 2-3 minutes
6. Your site will be live at: `https://sabrinayuan07-cloud.github.io/Bento-Buddies/`

**Note:** You'll need to access it at `/index/index.html` or update your file structure.

---

## Alternative: Vercel

### Steps:
1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
cd /Users/sabrinayuan/Documents/HackCamp2025-1
vercel
```

3. Follow prompts and your site will be live!

---

## Recommendation

**For Bento Buddies, I recommend Firebase Hosting because:**
✅ You're already using Firebase
✅ Automatically works with your Firebase backend
✅ Free tier is generous
✅ Custom domain support
✅ Automatic SSL certificates
✅ Global CDN for fast loading
✅ Easy to update: just run `firebase deploy`

---

## After Deployment

1. **Update API Keys**: Make sure your Google Maps API key allows requests from your new domain
2. **Test Everything**: Create a meetup, send messages, update profile
3. **Share the Link**: Send it to friends to test!
4. **Custom Domain** (Optional): You can add a custom domain like `bentobuddies.com`

---

## Troubleshooting

**If pages don't load:**
- Check Firebase Console → Hosting to see deployment status
- Verify all files were uploaded
- Check browser console for errors

**If Firebase features don't work:**
- Add your deployed URL to Firebase Console → Authentication → Authorized domains

**Need help?** Check the Firebase Hosting docs: https://firebase.google.com/docs/hosting

---

**Your website will be accessible from any device with internet! 🌐**
