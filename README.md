# ⚽ Football Match Tracker

A comprehensive, one-page web application for tracking football matches between friends on a 5+1 synthetic field.

## 🎯 Key Features

### Match Management
- **Customizable Timer**: Choose from 10, 15, 20, 25, 30, 45, or 60-minute matches
- **Live Scoreboard**: Real-time team scores displayed prominently
- **Quick Score Entry**: Easy-to-use interface for recording goals and assists
- **Team Formation Management**: Visual field with 6 different 5+1 formations

### Player & Team System
- **Player Pool**: Create a roster of available players
- **Multi-Team Support**: Create multiple teams (not just 2)
- **Auto Team Balance**: Automatically distribute players across teams
- **Formation Assignment**: Assign players to specific positions with visual feedback
- **Funny Team Names**: Randomly generated hilarious names for grown-up friends

### Statistics & Tracking
- **Persistent Player Stats**: Track goals, assists, and matches across all games
- **Live Event Logging**: Real-time match events with timestamps
- **Overall Leaderboard**: See top performers across all matches
- **Match-Specific Stats**: Current game statistics separate from overall stats

### User Experience
- **Mobile-First Design**: Optimized for phones and tablets
- **One-Click Scoring**: Switch between goal/assist mode and click player names
- **Visual Feedback**: Color-coded teams, hover effects, and intuitive icons
- **No Installation**: Pure HTML/CSS/JavaScript - works in any browser

## 🚀 Quick Start

### Option 1: Local File
1. Download all files (`index.html`, `style.css`, `script.js`)
2. Open `index.html` in any modern web browser
3. Start playing!

### Option 2: Local Server (Recommended)
1. Open terminal/command prompt in the project folder
2. Run: `python -m http.server 8000`
3. Visit: `http://localhost:8000`

## 📱 How to Use

### Setup Phase
1. **Add Players**: Click "Add New Player" to build your player pool
2. **Create Teams**: Use "Create Teams" to form balanced teams
3. **Set Formation**: Click "Manage Formations" to assign positions
4. **Choose Duration**: Select match length (10-60 minutes)

### During Match
1. **Start Timer**: Click "Start Match" - scoreboard and scoring interface appear
2. **Record Events**: 
   - Toggle between "⚽ Record Goal" and "🅰️ Record Assist"
   - Click any player's name to record the event
   - Scores update instantly
3. **Monitor**: Watch the live scoreboard and timer

### After Match
- View updated leaderboard with persistent stats
- Create new teams for next match
- Reset for another game with same teams

## 🏟️ Formation System

Choose from 6 different 5+1 formations:
- **2-2-1**: Balanced formation
- **1-3-1**: Midfield control
- **2-1-2**: Attacking setup
- **1-2-2**: Wing play focus
- **1-4-0**: All midfield
- **0-3-2**: Ultra attacking

## 🎮 Team Names

Teams get random funny names like:
- "Beer Bellies FC"
- "The Dad Bods" 
- "Weekend Warriors"
- "Midlife Crisis FC"
- "Netflix & Skill"
- ...and many more!

## 🛠️ Technical Details

- **Pure Web Technologies**: HTML5, CSS3, ES6 JavaScript
- **No Dependencies**: Works offline after initial load
- **Responsive Design**: 320px+ screen support
- **Browser Storage**: Uses localStorage for persistence
- **Cross-Platform**: Works on desktop, tablet, and mobile

## 📋 File Structure

```
FootbalTeam/
├── index.html      # Main application structure
├── style.css       # Responsive styling & animations
├── script.js       # All game logic & functionality
└── README.md       # Documentation
```

## 🎯 Perfect For

- **Synthetic Field Football**: Designed specifically for 5+1 format
- **Friend Groups**: Funny team names and social features
- **Tournament Play**: Multi-team support with persistent stats
- **Mobile Use**: Easy touch interface during games
- **Quick Setup**: No accounts, installation, or internet required

## 🔧 Customization

### Match Duration
Change available durations in the HTML select options or modify JavaScript timer logic.

### Team Names
Add your own funny names to the `funnyTeamNames` array in `script.js`.

### Formations
Modify the `formations` object in `script.js` to add custom 5+1 formations.

### Styling
Update team colors, fonts, and animations in `style.css`.

## 📞 Support

This is a simple, self-contained web app. If you need modifications:
1. All code is readable and well-commented
2. Use browser developer tools to debug
3. Modify the source files directly

---

**Have fun and may the best team win!** ⚽🏆

*Made with ❤️ for football friends who take their weekend games seriously (but not too seriously)*