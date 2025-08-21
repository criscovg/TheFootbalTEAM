// Firebase Configuration
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCV6xPahxFAJS2F7SqR5KJfEwfm8oJj0uE",
  authDomain: "footbal-team-c5be0.firebaseapp.com",
  databaseURL: "https://footbal-team-c5be0-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "footbal-team-c5be0",
  storageBucket: "footbal-team-c5be0.firebasestorage.app",
  messagingSenderId: "743510243228",
  appId: "1:743510243228:web:82356ec42d6aef1ba73a59",
  measurementId: "G-9DZF28VCFB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// User session management
let currentUserId = 'user_' + Math.random().toString(36).substr(2, 9);
let usersRef = database.ref('users');
let gameRef = database.ref('gameState');

// Global variables
let matchDuration = 10; // Default 10 minutes
let matchTime = 600; // Current time in seconds
let isMatchRunning = false;
let matchTimer = null;
let playerPool = []; // All available players
let teams = []; // Array of team objects
let overallPlayerStats = {}; // Persistent stats across all matches
let currentMatchStats = {}; // Stats for current match only
let events = [];
let teamFormations = {}; // Store formations for each team
let currentFormationTeam = 0; // Currently selected team in formation manager
let currentScoreMode = 'goal'; // 'goal' or 'assist'

// Funny team names for grown-up male friends
const funnyTeamNames = [
    "Beer Bellies FC", "The Dad Bods", "Weekend Warriors", "The Lawn Mowers", 
    "Couch Potatoes United", "The Receding Hairlines", "Mortgage FC", 
    "The Spare Tire Society", "Midlife Crisis FC", "The Grill Masters",
    "Back Pain United", "The Wise Guys", "Beer League Legends", 
    "The Old School", "Pub Crawlers FC", "The Weekend Heroes",
    "Coffee Addicts FC", "The Tool Shed", "Garage Sale Giants", 
    "The Snoring Squad", "Remote Control FC", "The Couch Commanders",
    "BBQ Mafia", "The Lawn Chair Brigade", "Stubble Trouble FC",
    "The Beer Garden", "Netflix & Skill", "The Belly Laughs",
    "Sofa So Good FC", "The Grill Sergeants", "Dad Joke United"
];

// Formation templates for 5+1 (6-a-side) football
const formations = {
    '2-2-1': [
        // Goalkeeper
        { position: 'GK', x: 50, y: 90 },
        // Defenders (2)
        { position: 'LB', x: 30, y: 70 },
        { position: 'RB', x: 70, y: 70 },
        // Midfielders (2)
        { position: 'LM', x: 30, y: 45 },
        { position: 'RM', x: 70, y: 45 },
        // Forward (1)
        { position: 'ST', x: 50, y: 20 }
    ],
    '1-3-1': [
        // Goalkeeper
        { position: 'GK', x: 50, y: 90 },
        // Defender (1)
        { position: 'CB', x: 50, y: 70 },
        // Midfielders (3)
        { position: 'LM', x: 20, y: 45 },
        { position: 'CM', x: 50, y: 50 },
        { position: 'RM', x: 80, y: 45 },
        // Forward (1)
        { position: 'ST', x: 50, y: 20 }
    ],
    '2-1-2': [
        // Goalkeeper
        { position: 'GK', x: 50, y: 90 },
        // Defenders (2)
        { position: 'LB', x: 30, y: 70 },
        { position: 'RB', x: 70, y: 70 },
        // Midfielder (1)
        { position: 'CM', x: 50, y: 45 },
        // Forwards (2)
        { position: 'LW', x: 35, y: 20 },
        { position: 'RW', x: 65, y: 20 }
    ],
    '1-2-2': [
        // Goalkeeper
        { position: 'GK', x: 50, y: 90 },
        // Defender (1)
        { position: 'CB', x: 50, y: 70 },
        // Midfielders (2)
        { position: 'LM', x: 30, y: 45 },
        { position: 'RM', x: 70, y: 45 },
        // Forwards (2)
        { position: 'LW', x: 35, y: 20 },
        { position: 'RW', x: 65, y: 20 }
    ],
    '1-4-0': [
        // Goalkeeper
        { position: 'GK', x: 50, y: 90 },
        // Defender (1)
        { position: 'CB', x: 50, y: 75 },
        // Midfielders (4)
        { position: 'LM', x: 15, y: 50 },
        { position: 'LCM', x: 35, y: 55 },
        { position: 'RCM', x: 65, y: 55 },
        { position: 'RM', x: 85, y: 50 }
    ],
    '0-3-2': [
        // Goalkeeper
        { position: 'GK', x: 50, y: 90 },
        // Midfielders (3)
        { position: 'LM', x: 25, y: 60 },
        { position: 'CM', x: 50, y: 65 },
        { position: 'RM', x: 75, y: 60 },
        // Forwards (2)
        { position: 'LW', x: 35, y: 25 },
        { position: 'RW', x: 65, y: 25 }
    ]
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    console.log('JavaScript loaded successfully!');
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    updateTimerDisplay();
    updateMatchStatus('Ready to Start');
    renderPlayerPool();
    renderAllTeams();
    updateLeaderboard();
}

function setupEventListeners() {
    // Timer controls
    document.getElementById('startBtn').addEventListener('click', startMatch);
    document.getElementById('pauseBtn').addEventListener('click', pauseMatch);
    document.getElementById('resetBtn').addEventListener('click', resetMatch);
    
    // Duration selector
    document.getElementById('durationSelect').addEventListener('change', function() {
        matchDuration = parseInt(this.value);
        if (!isMatchRunning) {
            matchTime = matchDuration * 60;
            updateTimerDisplay();
        }
    });
    
    // Quick actions
    document.getElementById('randomizeBtn').addEventListener('click', randomizeTeams);
    document.getElementById('newMatchBtn').addEventListener('click', newMatch);
    
    // Modal controls
    document.getElementById('playerNameInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            confirmAddToPool();
        }
    });
    
    // Close modals when clicking outside
    document.getElementById('playerModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
    
    document.getElementById('teamCreatorModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeTeamCreatorModal();
        }
    });
    
    document.getElementById('formationModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeFormationModal();
        }
    });
}

// Timer Functions
function startMatch() {
    if (teams.length < 2) {
        alert('Please create at least 2 teams before starting the match!');
        return;
    }
    
    // Check if all teams have players
    const emptyTeams = teams.filter(team => team.players.length === 0);
    if (emptyTeams.length > 0) {
        alert('All teams must have at least one player!');
        return;
    }
    
    isMatchRunning = true;
    updateMatchStatus('Match in Progress');
    
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;
    
    // Save match state to Firebase
    saveMatchState();
    
    // Re-render all teams to update button states
    renderAllTeams();
    
    // Show live scoreboard and quick scoring
    showLiveScoreboard();
    showQuickScoringInterface();
    
    startMatchTimer();
    
    addEvent('Match started!', 'system');
    saveEvents();
}

function pauseMatch() {
    isMatchRunning = false;
    clearInterval(matchTimer);
    updateMatchStatus('Match Paused');
    
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    
    // Save match state to Firebase
    saveMatchState();
    
    // Re-render all teams to update button states
    renderAllTeams();
    
    // Update scoreboard and scoring interface
    showLiveScoreboard();
    showQuickScoringInterface();
    
    addEvent('Match paused', 'system');
    saveEvents();
}

function resetMatch() {
    isMatchRunning = false;
    clearInterval(matchTimer);
    matchTime = matchDuration * 60;
    updateTimerDisplay();
    updateMatchStatus('Ready to Start');
    
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    
    // Reset scores but keep players
    resetScores();
    clearEvents();
    
    // Re-render all teams to update button states
    renderAllTeams();
    
    // Hide scoreboard and scoring interface
    hideLiveScoreboard();
    hideQuickScoringInterface();
    
    addEvent('Match reset', 'system');
}

function endMatch() {
    isMatchRunning = false;
    clearInterval(matchTimer);
    updateMatchStatus('Match Finished');
    
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = true;
    
    // Get scores from all teams
    const teamScores = teams.map(team => {
        const scoreElement = document.getElementById(`score${team.id}`);
        return {
            name: team.name,
            score: scoreElement ? parseInt(scoreElement.textContent) : 0
        };
    });
    
    // Find winner
    const maxScore = Math.max(...teamScores.map(t => t.score));
    const winners = teamScores.filter(t => t.score === maxScore);
    
    let result = '';
    if (winners.length === 1) {
        result = `${winners[0].name} wins!`;
    } else {
        result = `It's a draw between ${winners.map(w => w.name).join(', ')}!`;
    }
    
    const scoresText = teamScores.map(t => `${t.name}: ${t.score}`).join(', ');
    
    // Re-render all teams to update button states
    renderAllTeams();
    
    // Hide scoreboard and scoring interface
    hideLiveScoreboard();
    hideQuickScoringInterface();
    
    addEvent(`Match finished! ${result} (${scoresText})`, 'system');
    updateLeaderboard();
}

function updateTimerDisplay() {
    const minutes = Math.floor(matchTime / 60);
    const seconds = matchTime % 60;
    const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('timer').textContent = display;
    
    // Change color when time is running low
    const timerElement = document.getElementById('timer');
    if (matchTime <= 60) {
        timerElement.style.color = '#e74c3c';
        timerElement.style.animation = 'pulse 1s infinite';
    } else {
        timerElement.style.color = '#e74c3c';
        timerElement.style.animation = 'none';
    }
}

function updateMatchStatus(status) {
    document.getElementById('matchStatus').textContent = status;
}

// Player Pool Management
function addToPlayerPool() {
    console.log('addToPlayerPool function called');
    document.getElementById('playerNameInput').value = '';
    document.getElementById('playerModal').style.display = 'block';
    document.getElementById('playerNameInput').focus();
}

function confirmAddToPool() {
    const playerName = document.getElementById('playerNameInput').value.trim();
    
    if (!playerName) {
        alert('Please enter a player name!');
        return;
    }
    
    // Check if player already exists in pool
    if (playerPool.includes(playerName)) {
        alert('Player already exists in the pool! Please choose a different name.');
        return;
    }
    
    // Add player to pool
    playerPool.push(playerName);
    
    // Initialize overall player stats if doesn't exist
    if (!overallPlayerStats[playerName]) {
        overallPlayerStats[playerName] = {
            totalGoals: 0,
            totalAssists: 0,
            matchesPlayed: 0
        };
    }
    
    // Save to Firebase
    savePlayerPool();
    savePlayerStats();
    
    renderPlayerPool();
    updateLeaderboard();
    closeModal();
    
    addEvent(`${playerName} added to player pool`, 'system');
}

function closeModal() {
    document.getElementById('playerModal').style.display = 'none';
}

function renderPlayerPool() {
    const container = document.getElementById('playerPool');
    
    if (playerPool.length === 0) {
        container.innerHTML = '<p class="no-players">No players added yet. Add players to start creating teams!</p>';
        return;
    }
    
    container.innerHTML = '';
    
    playerPool.forEach(playerName => {
        const playerCard = createPoolPlayerCard(playerName);
        container.appendChild(playerCard);
    });
}

function createPoolPlayerCard(playerName) {
    const card = document.createElement('div');
    card.className = 'pool-player-card';
    
    const stats = overallPlayerStats[playerName];
    const totalPoints = stats.totalGoals + stats.totalAssists;
    
    card.innerHTML = `
        <div class="pool-player-name">${playerName}</div>
        <div class="pool-player-stats">
            Goals: ${stats.totalGoals} | Assists: ${stats.totalAssists}
        </div>
        <div class="pool-player-total">Total: ${totalPoints} points</div>
    `;
    
    return card;
}

function renderTeam(team) {
    const container = document.getElementById(`players${team}`);
    container.innerHTML = '';
    
    currentMatchPlayers[team].forEach(playerName => {
        const playerCard = createMatchPlayerCard(playerName, team);
        container.appendChild(playerCard);
    });
}

function createMatchPlayerCard(playerName, teamId) {
    const card = document.createElement('div');
    card.className = 'player-card';
    
    const matchStats = currentMatchStats[playerName] || { goals: 0, assists: 0 };
    
    // Get player position if assigned
    const teamFormation = teamFormations[teamId];
    const position = teamFormation && teamFormation.positions[playerName] ? teamFormation.positions[playerName] : 'No Position';
    
    console.log('Creating player card for:', playerName, 'isMatchRunning:', isMatchRunning);
    
    card.innerHTML = `
        <div class="player-info">
            <div class="player-name">${playerName}</div>
            <div class="player-position">Position: ${position}</div>
            <div class="player-stats">Match Goals: ${matchStats.goals} | Match Assists: ${matchStats.assists}</div>
        </div>
        <div class="player-actions">
            <button class="btn btn-small btn-goal" onclick="recordGoal('${playerName}')" ${!isMatchRunning ? 'disabled' : ''}>
                ⚽ Goal
            </button>
            <button class="btn btn-small btn-assist" onclick="recordAssist('${playerName}')" ${!isMatchRunning ? 'disabled' : ''}>
                🅰️ Assist
            </button>
        </div>
    `;
    
    return card;
}

// Event Recording
function recordGoal(playerName) {
    console.log('Recording goal for:', playerName, 'Match running:', isMatchRunning);
    
    if (!isMatchRunning) {
        alert('Match must be running to record events!');
        return;
    }
    
    // Initialize match stats if doesn't exist
    if (!currentMatchStats[playerName]) {
        currentMatchStats[playerName] = { goals: 0, assists: 0 };
    }
    
    // Update current match stats
    currentMatchStats[playerName].goals++;
    
    // Update overall stats
    overallPlayerStats[playerName].totalGoals++;
    
    // Find player's team
    const playerTeam = teams.find(team => team.players.includes(playerName));
    if (!playerTeam) {
        alert('Player not found in any team!');
        return;
    }
    
    // Update score
    const scoreElement = document.getElementById(`score${playerTeam.id}`);
    const currentScore = parseInt(scoreElement.textContent);
    scoreElement.textContent = currentScore + 1;
    
    // Re-render team to update stats
    renderTeamPlayers(playerTeam);
    renderPlayerPool();
    
    // Add event
    const timeDisplay = document.getElementById('timer').textContent;
    addEvent(`⚽ ${playerName} scored for ${playerTeam.name}!`, 'goal', timeDisplay);
    
    // Save to Firebase
    saveCurrentMatchStats();
    savePlayerStats();
    saveEvents();
    
    // Update scoreboard
    if (isMatchRunning) {
        renderLiveScoreboard();
    }
    
    updateLeaderboard();
}

function recordAssist(playerName) {
    if (!isMatchRunning) {
        alert('Match must be running to record events!');
        return;
    }
    
    console.log('Recording assist for:', playerName);
    
    // Initialize match stats if doesn't exist
    if (!currentMatchStats[playerName]) {
        currentMatchStats[playerName] = { goals: 0, assists: 0 };
    }
    
    // Update current match stats
    currentMatchStats[playerName].assists++;
    
    // Update overall stats
    overallPlayerStats[playerName].totalAssists++;
    
    // Find player's team
    const playerTeam = teams.find(team => team.players.includes(playerName));
    if (!playerTeam) {
        alert('Player not found in any team!');
        return;
    }
    
    // Re-render team to update stats
    renderTeamPlayers(playerTeam);
    renderPlayerPool();
    
    // Add event
    const timeDisplay = document.getElementById('timer').textContent;
    addEvent(`🅰️ ${playerName} made an assist for ${playerTeam.name}!`, 'assist', timeDisplay);
    
    // Save to Firebase
    saveCurrentMatchStats();
    savePlayerStats();
    saveEvents();
    
    // Update scoreboard
    if (isMatchRunning) {
        renderLiveScoreboard();
    }
    
    updateLeaderboard();
}

function addEvent(text, type, time = null) {
    const event = {
        text: text,
        type: type,
        time: time || new Date().toLocaleTimeString(),
        timestamp: new Date()
    };
    
    events.unshift(event); // Add to beginning of array
    renderEvents();
}

function renderEvents() {
    const container = document.getElementById('eventsList');
    
    if (events.length === 0) {
        container.innerHTML = '<p class="no-events">No events yet. Start the match to begin tracking!</p>';
        return;
    }
    
    container.innerHTML = '';
    
    events.slice(0, 10).forEach(event => { // Show only last 10 events
        const eventElement = document.createElement('div');
        eventElement.className = `event-item ${event.type}-event`;
        
        eventElement.innerHTML = `
            <span class="event-text">${event.text}</span>
            <span class="event-time">${event.time}</span>
        `;
        
        container.appendChild(eventElement);
    });
}

function clearEvents() {
    events = [];
    renderEvents();
}

// Score Management
function updateScores() {
    teams.forEach(team => {
        const scoreElement = document.getElementById(`score${team.id}`);
        if (scoreElement) {
            scoreElement.textContent = '0';
        }
    });
}

function resetScores() {
    updateScores();
    
    // Reset current match stats but keep overall stats
    currentMatchStats = {};
    
    // Re-render all teams
    renderAllTeams();
}

// Leaderboard
function updateLeaderboard() {
    showStats('total'); // Default to total points view
}

function showStats(type) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${type}Tab`).classList.add('active');
    
    const container = document.getElementById('leaderboardList');
    
    if (Object.keys(overallPlayerStats).length === 0) {
        container.innerHTML = '<p class="no-stats">Add players and start tracking to see statistics!</p>';
        return;
    }
    
    // Create array of players with their overall stats
    const playersArray = Object.keys(overallPlayerStats).map(name => {
        const stats = overallPlayerStats[name];
        let sortValue = 0;
        
        switch(type) {
            case 'goals':
                sortValue = stats.totalGoals;
                break;
            case 'assists':
                sortValue = stats.totalAssists;
                break;
            case 'total':
                sortValue = stats.totalGoals + stats.totalAssists;
                break;
        }
        
        return {
            name: name,
            goals: stats.totalGoals,
            assists: stats.totalAssists,
            total: stats.totalGoals + stats.totalAssists,
            sortValue: sortValue,
            matchesPlayed: stats.matchesPlayed
        };
    });
    
    // Sort by the selected stat
    playersArray.sort((a, b) => b.sortValue - a.sortValue);
    
    // Render leaderboard
    container.innerHTML = '';
    
    playersArray.forEach((player, index) => {
        const item = document.createElement('div');
        item.className = `leaderboard-item ${index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : ''}`;
        
        let displayValue = '';
        switch(type) {
            case 'goals':
                displayValue = `${player.goals} goals`;
                break;
            case 'assists':
                displayValue = `${player.assists} assists`;
                break;
            case 'total':
                displayValue = `${player.total} points`;
                break;
        }
        
        item.innerHTML = `
            <span class="player-rank">#${index + 1}</span>
            <span class="player-leaderboard-name">${player.name}</span>
            <span class="player-points">${displayValue}</span>
        `;
        
        container.appendChild(item);
    });
}

// Team Management Functions
function openTeamCreator() {
    console.log('openTeamCreator function called');
    if (playerPool.length < 2) {
        alert('You need at least 2 players in the pool to create teams!');
        return;
    }
    
    document.getElementById('teamCreatorModal').style.display = 'block';
    updateTeamCreator();
}

function updateTeamCreator() {
    const teamCount = parseInt(document.getElementById('teamCount').value);
    renderCreatorAvailablePlayersList();
    renderCreatorTeamsSection(teamCount);
}

function renderCreatorAvailablePlayersList() {
    const container = document.getElementById('creatorAvailablePlayersList');
    container.innerHTML = '';
    
    // Get players not assigned to any team
    const assignedPlayers = teams.flatMap(team => team.players);
    const availablePlayers = playerPool.filter(player => !assignedPlayers.includes(player));
    
    if (availablePlayers.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #7f8c8d;">All players have been assigned</p>';
        return;
    }
    
    availablePlayers.forEach(playerName => {
        const item = document.createElement('div');
        item.className = 'available-player-item';
        item.onclick = () => assignPlayerToTeam(playerName);
        
        const stats = overallPlayerStats[playerName];
        const totalPoints = stats.totalGoals + stats.totalAssists;
        
        item.innerHTML = `
            <div>
                <div class="available-player-name">${playerName}</div>
                <div class="available-player-stats">Goals: ${stats.totalGoals} | Assists: ${stats.totalAssists} | Total: ${totalPoints}</div>
            </div>
        `;
        
        container.appendChild(item);
    });
}

function renderCreatorTeamsSection(teamCount) {
    const container = document.getElementById('creatorTeamsSection');
    container.innerHTML = '';
    
    for (let i = 0; i < teamCount; i++) {
        const teamDiv = document.createElement('div');
        teamDiv.className = 'creator-team';
        teamDiv.innerHTML = `
            <h4>Team ${i + 1} <span id="creatorTeamCount${i}">(0)</span></h4>
            <div id="creatorTeamList${i}" class="creator-team-list">
                <!-- Players will be added here -->
            </div>
        `;
        container.appendChild(teamDiv);
    }
    
    // Update existing teams display
    teams.forEach((team, index) => {
        if (index < teamCount) {
            updateCreatorTeamDisplay(index);
        }
    });
}

function assignPlayerToTeam(playerName) {
    const teamCount = parseInt(document.getElementById('teamCount').value);
    
    // Find team with least players
    let targetTeamIndex = 0;
    let minPlayers = Infinity;
    
    for (let i = 0; i < teamCount; i++) {
        const teamPlayerCount = teams[i] ? teams[i].players.length : 0;
        if (teamPlayerCount < minPlayers) {
            minPlayers = teamPlayerCount;
            targetTeamIndex = i;
        }
    }
    
    // Ensure team exists
    if (!teams[targetTeamIndex]) {
        const funnyName = getRandomTeamName();
        teams[targetTeamIndex] = {
            id: targetTeamIndex + 1,
            name: funnyName,
            players: [],
            formation: '2-2-1',
            positions: {}
        };
    }
    
    // Add player to team
    teams[targetTeamIndex].players.push(playerName);
    
    // Update displays
    renderCreatorAvailablePlayersList();
    updateCreatorTeamDisplay(targetTeamIndex);
}

function updateCreatorTeamDisplay(teamIndex) {
    const team = teams[teamIndex];
    if (!team) return;
    
    const countElement = document.getElementById(`creatorTeamCount${teamIndex}`);
    const listElement = document.getElementById(`creatorTeamList${teamIndex}`);
    
    if (countElement) {
        countElement.textContent = `(${team.players.length})`;
    }
    
    if (listElement) {
        listElement.innerHTML = '';
        team.players.forEach(playerName => {
            const item = document.createElement('div');
            item.className = 'selected-player-item';
            item.innerHTML = `
                <span class="selected-player-name">${playerName}</span>
                <button class="remove-player-btn" onclick="removeFromCreatorTeam('${playerName}', ${teamIndex})">×</button>
            `;
            listElement.appendChild(item);
        });
    }
}

function removeFromCreatorTeam(playerName, teamIndex) {
    if (teams[teamIndex]) {
        teams[teamIndex].players = teams[teamIndex].players.filter(p => p !== playerName);
        renderCreatorAvailablePlayersList();
        updateCreatorTeamDisplay(teamIndex);
    }
}

function autoAssignPlayers() {
    const teamCount = parseInt(document.getElementById('teamCount').value);
    
    // Clear existing teams
    teams.length = 0;
    
    // Create teams with funny names
    for (let i = 0; i < teamCount; i++) {
        const funnyName = getRandomTeamName();
        teams.push({
            id: i + 1,
            name: funnyName,
            players: [],
            formation: '2-2-1',
            positions: {}
        });
    }
    
    // Shuffle players and distribute
    const shuffledPlayers = [...playerPool];
    for (let i = shuffledPlayers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledPlayers[i], shuffledPlayers[j]] = [shuffledPlayers[j], shuffledPlayers[i]];
    }
    
    // Distribute players evenly
    shuffledPlayers.forEach((player, index) => {
        const teamIndex = index % teamCount;
        teams[teamIndex].players.push(player);
    });
    
    // Update displays
    renderCreatorAvailablePlayersList();
    renderCreatorTeamsSection(teamCount);
}

function confirmTeamCreation() {
    const teamCount = parseInt(document.getElementById('teamCount').value);
    
    // Validate teams
    const validTeams = teams.filter(team => team && team.players.length > 0);
    if (validTeams.length < 2) {
        alert('You need at least 2 teams with players!');
        return;
    }
    
    // Remove empty teams
    teams.splice(0, teams.length, ...validTeams);
    
    // Re-index teams and assign new funny names
    teams.forEach((team, index) => {
        team.id = index + 1;
        team.name = getRandomTeamName();
    });
    
    // Reset match stats
    currentMatchStats = {};
    
    // Initialize team formations
    teams.forEach(team => {
        if (!teamFormations[team.id]) {
            teamFormations[team.id] = {
                formation: '2-2-1',
                positions: {}
            };
        }
    });
    
    // Update matches played for selected players
    teams.forEach(team => {
        team.players.forEach(playerName => {
            overallPlayerStats[playerName].matchesPlayed++;
        });
    });
    
    // Save to Firebase
    saveTeams();
    savePlayerStats();
    saveCurrentMatchStats();
    
    // Render teams
    renderAllTeams();
    
    // Enable formation manager
    document.getElementById('formationBtn').disabled = false;
    
    // Close modal
    closeTeamCreatorModal();
    
    addEvent(`${teams.length} teams created successfully!`, 'system');
}

function closeTeamCreatorModal() {
    document.getElementById('teamCreatorModal').style.display = 'none';
}

// Team rendering functions
function renderAllTeams() {
    const container = document.getElementById('teamsContainer');
    
    if (teams.length === 0) {
        container.innerHTML = '<p class="no-teams">No teams created yet. Click "Create Teams" to start!</p>';
        return;
    }
    
    container.innerHTML = '';
    
    teams.forEach(team => {
        const teamDiv = createTeamElement(team);
        container.appendChild(teamDiv);
    });
}

function createTeamElement(team) {
    const teamDiv = document.createElement('div');
    teamDiv.className = `team team-${team.id}`;
    teamDiv.id = `team${team.id}`;
    
    teamDiv.innerHTML = `
        <div class="team-header">
            <h2>${team.name}</h2>
            <div class="team-score" id="score${team.id}">0</div>
        </div>
        <div class="players-list" id="players${team.id}">
            <!-- Players will be added dynamically -->
        </div>
    `;
    
    // Render team players
    renderTeamPlayers(team);
    
    return teamDiv;
}

function renderTeamPlayers(team) {
    const container = document.getElementById(`players${team.id}`);
    if (!container) return;
    
    container.innerHTML = '';
    
    team.players.forEach(playerName => {
        const playerCard = createMatchPlayerCard(playerName, team.id);
        container.appendChild(playerCard);
    });
}

function selectPlayerForTeam(playerName) {
    // Simple alternating assignment, but user can modify
    if (selectedTeamA.length <= selectedTeamB.length && selectedTeamA.length < 6) {
        selectedTeamA.push(playerName);
    } else if (selectedTeamB.length < 6) {
        selectedTeamB.push(playerName);
    } else {
        alert('Both teams are full (6 players each)!');
        return;
    }
    
    renderSelectedTeams();
    renderAvailablePlayersList();
    updateTeamCounts();
}

function removeFromTeam(playerName, team) {
    if (team === 'A') {
        selectedTeamA = selectedTeamA.filter(p => p !== playerName);
    } else {
        selectedTeamB = selectedTeamB.filter(p => p !== playerName);
    }
    
    renderSelectedTeams();
    renderAvailablePlayersList();
    updateTeamCounts();
}

function renderSelectedTeams() {
    // Render Team A
    const containerA = document.getElementById('selectedTeamA');
    containerA.innerHTML = '';
    selectedTeamA.forEach(playerName => {
        const item = document.createElement('div');
        item.className = 'selected-player-item';
        item.innerHTML = `
            <span class="selected-player-name">${playerName}</span>
            <button class="remove-player-btn" onclick="removeFromTeam('${playerName}', 'A')">×</button>
        `;
        containerA.appendChild(item);
    });
    
    // Render Team B
    const containerB = document.getElementById('selectedTeamB');
    containerB.innerHTML = '';
    selectedTeamB.forEach(playerName => {
        const item = document.createElement('div');
        item.className = 'selected-player-item';
        item.innerHTML = `
            <span class="selected-player-name">${playerName}</span>
            <button class="remove-player-btn" onclick="removeFromTeam('${playerName}', 'B')">×</button>
        `;
        containerB.appendChild(item);
    });
}

function updateTeamCounts() {
    document.getElementById('teamACount').textContent = `(${selectedTeamA.length}/6)`;
    document.getElementById('teamBCount').textContent = `(${selectedTeamB.length}/6)`;
}

function confirmTeamSelection() {
    if (selectedTeamA.length === 0 || selectedTeamB.length === 0) {
        alert('Both teams must have at least one player!');
        return;
    }
    
    // Set current match players
    currentMatchPlayers.A = [...selectedTeamA];
    currentMatchPlayers.B = [...selectedTeamB];
    
    // Reset match stats
    currentMatchStats = {};
    
    // Update matches played for selected players
    [...selectedTeamA, ...selectedTeamB].forEach(playerName => {
        overallPlayerStats[playerName].matchesPlayed++;
    });
    
    // Render teams
    renderTeam('A');
    renderTeam('B');
    
    // Close modal
    closeTeamSelectionModal();
    
    addEvent(`Teams created! Team A: ${selectedTeamA.length} players, Team B: ${selectedTeamB.length} players`, 'system');
}

function closeTeamSelectionModal() {
    document.getElementById('teamSelectionModal').style.display = 'none';
}

function randomizeTeams() {
    if (teams.length === 0) {
        alert('Create teams first before randomizing!');
        return;
    }
    
    // Get all current players
    const allCurrentPlayers = teams.flatMap(team => team.players);
    
    if (allCurrentPlayers.length < 2) {
        alert('You need at least 2 players to randomize teams!');
        return;
    }
    
    // Shuffle array
    for (let i = allCurrentPlayers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allCurrentPlayers[i], allCurrentPlayers[j]] = [allCurrentPlayers[j], allCurrentPlayers[i]];
    }
    
    // Clear current teams
    teams.forEach(team => {
        team.players = [];
    });
    
    // Distribute players evenly across teams
    allCurrentPlayers.forEach((playerName, index) => {
        const teamIndex = index % teams.length;
        teams[teamIndex].players.push(playerName);
    });
    
    // Reset match stats
    currentMatchStats = {};
    
    // Re-render all teams
    renderAllTeams();
    
    addEvent('Teams have been randomized!', 'system');
}

// Formation Management Functions
function openFormationManager() {
    if (teams.length === 0) {
        alert('Create teams first!');
        return;
    }
    
    document.getElementById('formationModal').style.display = 'block';
    renderFormationTabs();
    currentFormationTeam = 0;
    showTeamFormation(0);
}

function renderFormationTabs() {
    const container = document.getElementById('formationTabs');
    container.innerHTML = '';
    
    teams.forEach((team, index) => {
        const tab = document.createElement('button');
        tab.className = `formation-tab ${index === 0 ? 'active' : ''}`;
        tab.textContent = team.name;
        tab.onclick = () => showTeamFormation(index);
        container.appendChild(tab);
    });
}

function showTeamFormation(teamIndex) {
    currentFormationTeam = teamIndex;
    const team = teams[teamIndex];
    
    // Update active tab
    document.querySelectorAll('.formation-tab').forEach((tab, index) => {
        tab.classList.toggle('active', index === teamIndex);
    });
    
    // Get team formation
    const teamFormation = teamFormations[team.id] || { formation: '4-4-2', positions: {} };
    
    // Update formation selector
    document.getElementById('formationSelect').value = teamFormation.formation;
    
    // Render formation field
    renderFormationField(team, teamFormation);
    
    // Render unassigned players
    renderUnassignedPlayers(team, teamFormation);
}

function renderFormationField(team, teamFormation) {
    const container = document.getElementById('formationField');
    container.innerHTML = '';
    
    const formationTemplate = formations[teamFormation.formation];
    
    formationTemplate.forEach((position, index) => {
        const slot = document.createElement('div');
        slot.className = 'position-slot';
        slot.style.left = `${position.x}%`;
        slot.style.top = `${position.y}%`;
        slot.style.transform = 'translate(-50%, -50%)';
        
        // Find player assigned to this position
        const assignedPlayer = Object.keys(teamFormation.positions).find(
            player => teamFormation.positions[player] === position.position
        );
        
        if (assignedPlayer) {
            slot.classList.add('occupied');
            slot.textContent = assignedPlayer;
            slot.onclick = () => removePlayerFromPosition(assignedPlayer);
        } else {
            slot.textContent = position.position;
            slot.onclick = () => selectPositionForAssignment(position.position);
        }
        
        container.appendChild(slot);
    });
}

function renderUnassignedPlayers(team, teamFormation) {
    const container = document.getElementById('unassignedList');
    container.innerHTML = '';
    
    // Get players not assigned to positions
    const assignedPlayers = Object.keys(teamFormation.positions);
    const unassignedPlayers = team.players.filter(player => !assignedPlayers.includes(player));
    
    if (unassignedPlayers.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #7f8c8d;">All players are assigned to positions</p>';
        return;
    }
    
    unassignedPlayers.forEach(playerName => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'unassigned-player';
        playerDiv.textContent = playerName;
        playerDiv.onclick = () => selectPlayerForAssignment(playerName);
        container.appendChild(playerDiv);
    });
}

let selectedPlayerForPosition = null;
let selectedPositionForPlayer = null;

function selectPlayerForAssignment(playerName) {
    // Clear previous selections
    document.querySelectorAll('.unassigned-player').forEach(p => p.classList.remove('selected'));
    document.querySelectorAll('.position-slot').forEach(p => p.classList.remove('selected'));
    
    selectedPlayerForPosition = playerName;
    selectedPositionForPlayer = null;
    
    // Highlight selected player
    event.target.classList.add('selected');
    
    // Show available positions
    highlightAvailablePositions();
}

function selectPositionForAssignment(position) {
    if (!selectedPlayerForPosition) {
        alert('Please select a player first!');
        return;
    }
    
    const team = teams[currentFormationTeam];
    if (!teamFormations[team.id]) {
        teamFormations[team.id] = { formation: '4-4-2', positions: {} };
    }
    
    // Assign player to position
    teamFormations[team.id].positions[selectedPlayerForPosition] = position;
    
    // Clear selections
    selectedPlayerForPosition = null;
    selectedPositionForPlayer = null;
    
    // Re-render formation
    showTeamFormation(currentFormationTeam);
}

function removePlayerFromPosition(playerName) {
    const team = teams[currentFormationTeam];
    if (teamFormations[team.id] && teamFormations[team.id].positions[playerName]) {
        delete teamFormations[team.id].positions[playerName];
        showTeamFormation(currentFormationTeam);
    }
}

function highlightAvailablePositions() {
    const team = teams[currentFormationTeam];
    const teamFormation = teamFormations[team.id] || { formation: '4-4-2', positions: {} };
    const assignedPositions = Object.values(teamFormation.positions);
    
    document.querySelectorAll('.position-slot').forEach(slot => {
        const position = slot.textContent;
        if (!assignedPositions.includes(position)) {
            slot.classList.add('available');
        }
    });
}

function changeFormation() {
    const team = teams[currentFormationTeam];
    const newFormation = document.getElementById('formationSelect').value;
    
    if (!teamFormations[team.id]) {
        teamFormations[team.id] = { formation: newFormation, positions: {} };
    } else {
        teamFormations[team.id].formation = newFormation;
        // Clear positions when changing formation
        teamFormations[team.id].positions = {};
    }
    
    showTeamFormation(currentFormationTeam);
}

function autoAssignFormation() {
    const team = teams[currentFormationTeam];
    if (!team) return;
    
    const teamFormation = teamFormations[team.id] || { formation: '2-2-1', positions: {} };
    const formationTemplate = formations[teamFormation.formation];
    
    // Clear existing positions
    teamFormations[team.id] = {
        formation: teamFormation.formation,
        positions: {}
    };
    
    // Get available players (limit to 6 for 5+1 format)
    const availablePlayers = team.players.slice(0, 6);
    
    // Auto-assign players to positions
    formationTemplate.forEach((position, index) => {
        if (index < availablePlayers.length) {
            teamFormations[team.id].positions[availablePlayers[index]] = position.position;
        }
    });
    
    // Re-render formation
    showTeamFormation(currentFormationTeam);
    
    addEvent(`Auto-assigned positions for ${team.name}`, 'system');
}

function saveFormations() {
    // Update all team players to reflect position changes
    teams.forEach(team => {
        renderTeamPlayers(team);
    });
    
    closeFormationModal();
    addEvent('Team formations saved!', 'system');
}

function closeFormationModal() {
    document.getElementById('formationModal').style.display = 'none';
    selectedPlayerForPosition = null;
    selectedPositionForPlayer = null;
}

// New Match
function newMatch() {
    if (confirm('Start a new match? This will reset match scores but keep overall player statistics and current teams.')) {
        resetMatch();
        addEvent('New match ready to start!', 'system');
    }
}

// Live Scoreboard Functions
function showLiveScoreboard() {
    if (teams.length === 0 || !isMatchRunning) {
        hideLiveScoreboard();
        return;
    }
    
    document.getElementById('liveScoreboard').style.display = 'block';
    renderLiveScoreboard();
}

function hideLiveScoreboard() {
    document.getElementById('liveScoreboard').style.display = 'none';
}

function renderLiveScoreboard() {
    const container = document.getElementById('scoreboardGrid');
    container.innerHTML = '';
    
    teams.forEach((team, index) => {
        const teamElement = createScoreboardTeamElement(team);
        container.appendChild(teamElement);
        
        // Add VS separator between teams (except after the last team)
        if (index < teams.length - 1) {
            const vsElement = document.createElement('div');
            vsElement.className = 'scoreboard-vs';
            vsElement.textContent = 'VS';
            container.appendChild(vsElement);
        }
    });
}

function createScoreboardTeamElement(team) {
    const teamDiv = document.createElement('div');
    teamDiv.className = `scoreboard-team team-${team.id}`;
    
    const currentScore = document.getElementById(`score${team.id}`)?.textContent || '0';
    
    teamDiv.innerHTML = `
        <div class="scoreboard-team-name">${team.name}</div>
        <div class="scoreboard-team-score">${currentScore}</div>
    `;
    
    return teamDiv;
}

function getRandomTeamName() {
    const usedNames = teams.map(team => team.name);
    const availableNames = funnyTeamNames.filter(name => !usedNames.includes(name));
    
    if (availableNames.length === 0) {
        // If all names are used, pick a random one anyway
        return funnyTeamNames[Math.floor(Math.random() * funnyTeamNames.length)];
    }
    
    return availableNames[Math.floor(Math.random() * availableNames.length)];
}

// Quick Scoring Interface Functions
let quickScoreMode = 'goal';

function showQuickScoringInterface() {
    if (teams.length === 0 || !isMatchRunning) {
        hideQuickScoringInterface();
        return;
    }
    
    document.getElementById('quickScoringInterface').style.display = 'block';
    renderQuickScoringTeams();
}

function hideQuickScoringInterface() {
    document.getElementById('quickScoringInterface').style.display = 'none';
}

function setQuickScoreMode(mode) {
    quickScoreMode = mode;
    
    // Update button states
    document.getElementById('goalModeBtn').classList.toggle('active', mode === 'goal');
    document.getElementById('assistModeBtn').classList.toggle('active', mode === 'assist');
    
    // Update player button styles
    updateQuickPlayerButtonModes();
}

function renderQuickScoringTeams() {
    const container = document.getElementById('quickScoringTeams');
    container.innerHTML = '';
    
    teams.forEach(team => {
        const teamElement = createQuickTeamElement(team);
        container.appendChild(teamElement);
    });
}

function createQuickTeamElement(team) {
    const teamDiv = document.createElement('div');
    teamDiv.className = `quick-team team-${team.id}`;
    
    teamDiv.innerHTML = `
        <div class="quick-team-header">${team.name}</div>
        <div class="quick-players-list" id="quickPlayers${team.id}">
            <!-- Players will be added here -->
        </div>
    `;
    
    // Add players
    const playersContainer = teamDiv.querySelector(`#quickPlayers${team.id}`);
    team.players.forEach(playerName => {
        const playerBtn = createQuickPlayerButton(playerName);
        playersContainer.appendChild(playerBtn);
    });
    
    return teamDiv;
}

function createQuickPlayerButton(playerName) {
    const btn = document.createElement('button');
    btn.className = `quick-player-btn ${quickScoreMode}-mode`;
    btn.textContent = playerName;
    btn.onclick = () => handleQuickScore(playerName);
    
    return btn;
}

function updateQuickPlayerButtonModes() {
    document.querySelectorAll('.quick-player-btn').forEach(btn => {
        btn.className = `quick-player-btn ${quickScoreMode}-mode`;
    });
}

function handleQuickScore(playerName) {
    console.log(`Quick scoring: ${quickScoreMode} for ${playerName}`);
    
    if (quickScoreMode === 'goal') {
        recordGoal(playerName);
    } else {
        recordAssist(playerName);
    }
    
    // Refresh the interface after scoring
    setTimeout(() => {
        renderLiveScoreboard();
        renderQuickScoringTeams();
        updateQuickPlayerButtonModes();
    }, 100);
}

// Add CSS animation for timer pulse
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);

// ===============================
// FIREBASE REAL-TIME FUNCTIONALITY
// ===============================

// Initialize Firebase connection and sync
function initializeFirebase() {
    console.log('Initializing Firebase connection...');
    updateConnectionStatus('connecting', 'Connecting...');
    
    // Register this user as online
    registerUser();
    
    // Listen for connection state
    database.ref('.info/connected').on('value', (snapshot) => {
        if (snapshot.val() === true) {
            console.log('Connected to Firebase');
            updateConnectionStatus('online', 'Live & Synchronized');
            
            // Set up real-time listeners
            setupRealTimeListeners();
        } else {
            console.log('Disconnected from Firebase');
            updateConnectionStatus('offline', 'Offline');
        }
    });
    
    // Load initial game state
    loadGameState();
}

// Register current user and manage online presence
function registerUser() {
    const userRef = usersRef.child(currentUserId);
    
    // Set user as online
    userRef.set({
        online: true,
        lastSeen: firebase.database.ServerValue.TIMESTAMP
    });
    
    // Remove user when they disconnect
    userRef.onDisconnect().remove();
    
    // Listen to online users count
    usersRef.on('value', (snapshot) => {
        const users = snapshot.val() || {};
        const onlineCount = Object.keys(users).length;
        updateUserCount(onlineCount);
    });
}

// Update connection status indicator
function updateConnectionStatus(status, text) {
    const statusElement = document.getElementById('connectionStatus');
    const textElement = document.getElementById('statusText');
    
    statusElement.className = `status-indicator ${status}`;
    textElement.textContent = text;
}

// Update online user count
function updateUserCount(count) {
    const userCountElement = document.getElementById('userCount');
    userCountElement.textContent = `👥 ${count} online`;
}

// Set up real-time listeners for game state
function setupRealTimeListeners() {
    // Listen for player pool changes
    gameRef.child('playerPool').on('value', (snapshot) => {
        const data = snapshot.val() || [];
        if (JSON.stringify(data) !== JSON.stringify(playerPool)) {
            playerPool = data;
            renderPlayerPool();
            console.log('Player pool updated from server');
        }
    });
    
    // Listen for teams changes
    gameRef.child('teams').on('value', (snapshot) => {
        const data = snapshot.val() || [];
        if (JSON.stringify(data) !== JSON.stringify(teams)) {
            teams = data;
            renderAllTeams();
            updateTeamCreator();
            if (isMatchRunning) {
                showLiveScoreboard();
                showQuickScoringInterface();
            }
            console.log('Teams updated from server');
        }
    });
    
    // Listen for match state changes
    gameRef.child('matchState').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const wasRunning = isMatchRunning;
            isMatchRunning = data.isRunning || false;
            matchTime = data.time || 600;
            matchDuration = data.duration || 10;
            
            // Update UI elements
            updateTimerDisplay();
            updateMatchControls();
            
            // Handle match state transitions
            if (isMatchRunning && !wasRunning) {
                console.log('Match started by another player');
                if (!matchTimer) {
                    startMatchTimer();
                }
                showLiveScoreboard();
                showQuickScoringInterface();
            } else if (!isMatchRunning && wasRunning) {
                console.log('Match paused/stopped by another player');
                if (matchTimer) {
                    clearInterval(matchTimer);
                    matchTimer = null;
                }
                hideQuickScoringInterface();
            }
            
            renderAllTeams();
        }
    });
    
    // Listen for player stats changes
    gameRef.child('playerStats').on('value', (snapshot) => {
        const data = snapshot.val() || {};
        if (JSON.stringify(data) !== JSON.stringify(overallPlayerStats)) {
            overallPlayerStats = data;
            updateLeaderboard();
            console.log('Player stats updated from server');
        }
    });
    
    // Listen for current match stats
    gameRef.child('currentMatchStats').on('value', (snapshot) => {
        const data = snapshot.val() || {};
        currentMatchStats = data;
        renderAllTeams();
        if (isMatchRunning) {
            renderLiveScoreboard();
            renderQuickScoringTeams();
        }
    });
    
    // Listen for events
    gameRef.child('events').on('value', (snapshot) => {
        const data = snapshot.val() || [];
        if (JSON.stringify(data) !== JSON.stringify(events)) {
            events = data;
            updateEventLog();
            console.log('Events updated from server');
        }
    });
}

// Load initial game state from Firebase
function loadGameState() {
    gameRef.once('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            console.log('Loading game state from server...');
            
            // Load all data
            playerPool = data.playerPool || [];
            teams = data.teams || [];
            overallPlayerStats = data.playerStats || {};
            currentMatchStats = data.currentMatchStats || {};
            events = data.events || [];
            
            // Load match state
            const matchState = data.matchState || {};
            isMatchRunning = matchState.isRunning || false;
            matchTime = matchState.time || 600;
            matchDuration = matchState.duration || 10;
            
            // Update duration selector
            document.getElementById('durationSelect').value = matchDuration;
            
            // Render everything
            renderPlayerPool();
            renderAllTeams();
            updateLeaderboard();
            updateEventLog();
            updateTimerDisplay();
            updateMatchControls();
            
            // If match is running, start the timer
            if (isMatchRunning) {
                startMatchTimer();
                showLiveScoreboard();
                showQuickScoringInterface();
            }
            
            console.log('Game state loaded successfully');
        } else {
            console.log('No existing game state found');
        }
    });
}

// Save game state to Firebase
function saveGameState() {
    const gameState = {
        playerPool: playerPool,
        teams: teams,
        playerStats: overallPlayerStats,
        currentMatchStats: currentMatchStats,
        events: events,
        matchState: {
            isRunning: isMatchRunning,
            time: matchTime,
            duration: matchDuration
        },
        lastUpdated: firebase.database.ServerValue.TIMESTAMP
    };
    
    gameRef.set(gameState).catch(error => {
        console.error('Error saving game state:', error);
    });
}

// Timer synchronization for users joining mid-match
function startMatchTimer() {
    if (matchTimer) {
        clearInterval(matchTimer);
    }
    
    let timerTicks = 0;
    matchTimer = setInterval(function() {
        matchTime--;
        updateTimerDisplay();
        timerTicks++;
        
        // Save to Firebase every 5 seconds to reduce bandwidth
        if (timerTicks % 5 === 0) {
            saveMatchState();
        }
        
        if (matchTime <= 0) {
            endMatch();
        }
    }, 1000);
}

function updateMatchControls() {
    document.getElementById('startBtn').disabled = isMatchRunning;
    document.getElementById('pauseBtn').disabled = !isMatchRunning;
}

// Save specific data sections
function savePlayerPool() {
    gameRef.child('playerPool').set(playerPool);
}

function saveTeams() {
    gameRef.child('teams').set(teams);
}

function savePlayerStats() {
    gameRef.child('playerStats').set(overallPlayerStats);
}

function saveCurrentMatchStats() {
    gameRef.child('currentMatchStats').set(currentMatchStats);
}

function saveMatchState() {
    gameRef.child('matchState').set({
        isRunning: isMatchRunning,
        time: matchTime,
        duration: matchDuration
    });
}

function saveEvents() {
    gameRef.child('events').set(events);
}

// Initialize Firebase when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing Firebase...');
    initializeFirebase();
});
