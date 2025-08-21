# 🔥 Firebase Setup Instructions

To enable real-time multiplayer functionality, you need to set up a Firebase project. Follow these simple steps:

## Step 1: Create Firebase Project

1. Go to **https://console.firebase.google.com**
2. Click **"Create a project"**
3. Name it: `football-tracker` (or any name you prefer)
4. **Disable Google Analytics** (not needed for this app)
5. Click **"Create project"**

## Step 2: Enable Realtime Database

1. In your Firebase console, click **"Realtime Database"** from the left menu
2. Click **"Create Database"**
3. **Choose location**: Select the one closest to you
4. **Security Rules**: Start in **test mode** (we'll secure it later)
5. Click **"Enable"**

## Step 3: Get Configuration

1. Click the **⚙️ Settings gear** → **"Project settings"**
2. Scroll down to **"Your apps"** section
3. Click **"</>"** (Web app icon)
4. Name your app: `football-tracker-web`
5. **Don't check** Firebase Hosting checkbox
6. Click **"Register app"**
7. **Copy the Firebase config object** (looks like this):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB...",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

## Step 4: Update Your App

1. Open `script.js`
2. Find line 2-10 (the Firebase config section)
3. **Replace the demo config** with your real config from Step 3
4. Save the file

## Step 5: Deploy & Test

1. Upload your files to any hosting service (Netlify, Vercel, etc.)
2. Open the site on multiple devices/browsers
3. You should see:
   - ✅ Green "Live & Synchronized" status
   - 👥 User count showing online players
   - Real-time sync when you add players or start matches

## Security Rules (Optional but Recommended)

After testing, secure your database:

1. Go to **Database** → **Rules**
2. Replace with:

```json
{
  "rules": {
    "gameState": {
      ".read": true,
      ".write": true
    },
    "users": {
      ".read": true,
      ".write": true
    }
  }
}
```

## 💡 Quick Test

To verify everything works:

1. Open your site on 2 different browsers/devices
2. Add a player on one device
3. Check if it appears on the other device instantly
4. Start a match and record a goal - should sync everywhere!

## 🆓 Free Tier Limits

Firebase free tier includes:
- ✅ **100 concurrent connections** (plenty for your football games)
- ✅ **1GB storage** (way more than you'll need)
- ✅ **10GB/month bandwidth** (sufficient for 1000+ games)

**Perfect for your football group! 🏆⚽**
