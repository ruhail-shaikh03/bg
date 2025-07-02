// Game state management
const gameState = {
    playerCount: 0,
    players: [],
    playerPhotos: {},
    stats: {},
    currentScreen: 'playerCountSection'
};

// Title configurations based on player count
const titleConfigs = {
    3: ['Badshah', 'Sepahi', 'Gashti'],
    4: ['Badshah', 'Wazir', 'Dallah', 'Gashti'],
    5: ['Badshah', 'Wazir', 'Sepahi', 'Dallah', 'Gashti'],
    6: ['Badshah', 'Wazir', 'Sepahi', 'Sepahi', 'Dallah', 'Gashti']
};

// Title visual themes
const titleThemes = {
    'Badshah': { icon: '♔', class: 'badshah', description: 'The King' },
    'Wazir': { icon: '♜', class: 'wazir', description: 'The Advisor' },
    'Sepahi': { icon: '⚔', class: 'sepahi', description: 'The Soldier' },
    'Dallah': { icon: '♠', class: 'dallah', description: 'The Pimp' },
    'Gashti': { icon: '♥', class: 'gashti', description: 'The Whore' }
};

// DOM elements
const screens = {
    playerCountSection: document.getElementById('playerCountSection'),
    playerNamesSection: document.getElementById('playerNamesSection'),
    gameSection: document.getElementById('gameSection'),
    statsSection: document.getElementById('statsSection')
};

// Initialize app
function init() {
    loadGameState();
    setupEventListeners();
    showScreen(gameState.currentScreen);
}

// Load game state from localStorage
function loadGameState() {
    const savedState = localStorage.getItem('badshahGashtiState');
    if (savedState) {
        const parsed = JSON.parse(savedState);
        Object.assign(gameState, parsed);
    }
}

// Save game state to localStorage
function saveGameState() {
    localStorage.setItem('badshahGashtiState', JSON.stringify(gameState));
}

// Setup event listeners
function setupEventListeners() {
    // Player count buttons
    document.querySelectorAll('.player-count-btn').forEach(btn => {
        btn.addEventListener('click', handlePlayerCountSelection);
    });

    // Start game button
    document.getElementById('startGameBtn').addEventListener('click', handleStartGame);

    // Round form submission
    document.getElementById('roundForm').addEventListener('submit', handleRoundSubmit);

    // Navigation buttons
    document.getElementById('viewStatsBtn').addEventListener('click', () => showScreen('statsSection'));
    document.getElementById('backToGameBtn').addEventListener('click', () => showScreen('gameSection'));

    // Reset stats button
    document.getElementById('resetStatsBtn').addEventListener('click', handleResetStats);
}

// Handle player count selection
function handlePlayerCountSelection(e) {
    const count = parseInt(e.currentTarget.dataset.count);
    gameState.playerCount = count;
    generateNameInputs(count);
    showScreen('playerNamesSection');
}

// Generate name input fields with photo upload
function generateNameInputs(count) {
    const container = document.getElementById('playerNameInputs');
    container.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const inputGroup = document.createElement('div');
        inputGroup.className = 'name-input-group';
        inputGroup.innerHTML = `
            <div class="player-input-header">
                <div class="photo-upload-container">
                    <input type="file" class="photo-upload-input" id="photo-${i}" 
                           accept="image/*" onchange="handlePhotoUpload(${i})">
                    <label for="photo-${i}" class="photo-upload-label">
                        <img class="photo-preview" id="preview-${i}" style="display:none;">
                        <span class="upload-icon" id="upload-icon-${i}">📷</span>
                    </label>
                </div>
                <label class="name-input-label">Player ${i + 1}</label>
            </div>
            <input type="text" class="name-input" id="player-${i}" 
                   placeholder="Enter name" required autocomplete="off">
        `;
        container.appendChild(inputGroup);
        
        // Load existing photo if available
        if (gameState.playerPhotos && gameState.playerPhotos[i]) {
            displayPhoto(i, gameState.playerPhotos[i]);
        }
    }
}

// Handle photo upload
function handlePhotoUpload(playerIndex) {
    const input = document.getElementById(`photo-${playerIndex}`);
    const file = input.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const photoData = e.target.result;
            if (!gameState.playerPhotos) {
                gameState.playerPhotos = {};
            }
            gameState.playerPhotos[playerIndex] = photoData;
            displayPhoto(playerIndex, photoData);
            saveGameState();
        };
        reader.readAsDataURL(file);
    }
}

// Display uploaded photo
function displayPhoto(playerIndex, photoData) {
    const preview = document.getElementById(`preview-${playerIndex}`);
    const uploadIcon = document.getElementById(`upload-icon-${playerIndex}`);
    
    preview.src = photoData;
    preview.style.display = 'block';
    uploadIcon.style.display = 'none';
}

// Handle start game
function handleStartGame() {
    const inputs = document.querySelectorAll('.name-input');
    const players = [];
    
    // Validate all names are entered
    for (let input of inputs) {
        if (!input.value.trim()) {
            alert('Please enter all player names');
            return;
        }
        players.push(input.value.trim());
    }
    
    gameState.players = players;
    
    // Initialize stats if not exists
    players.forEach(player => {
        if (!gameState.stats[player]) {
            gameState.stats[player] = {};
            titleConfigs[gameState.playerCount].forEach(title => {
                gameState.stats[player][title] = 0;
            });
        }
    });
    
    saveGameState();
    generateRoundForm();
    showScreen('gameSection');
}

// Generate round form with photos
function generateRoundForm() {
    const container = document.getElementById('titleAssignments');
    container.innerHTML = '';
    
    const titles = titleConfigs[gameState.playerCount];
    
    gameState.players.forEach((player, index) => {
        const assignment = document.createElement('div');
        assignment.className = 'title-assignment';
        assignment.id = `assignment-${index}`;
        
        const photoHtml = gameState.playerPhotos && gameState.playerPhotos[index] 
            ? `<img src="${gameState.playerPhotos[index]}" class="player-photo-small" alt="${player}">`
            : '';
        
        assignment.innerHTML = `
            <div class="player-card-header">
                ${photoHtml}
                <div class="player-name">${player}</div>
            </div>
            <select class="title-select" id="title-${index}" required onchange="updateTitleStyling(${index})">
                <option value="">Select title</option>
                ${titles.map(title => `
                    <option value="${title}">
                        ${titleThemes[title].icon} ${title}
                    </option>
                `).join('')}
            </select>
        `;
        container.appendChild(assignment);
    });
}

// Update title styling when selected
function updateTitleStyling(playerIndex) {
    const select = document.getElementById(`title-${playerIndex}`);
    const assignment = document.getElementById(`assignment-${playerIndex}`);
    const selectedTitle = select.value;
    
    // Remove all title classes
    Object.values(titleThemes).forEach(theme => {
        assignment.classList.remove(theme.class);
    });
    
    // Add selected title class
    if (selectedTitle && titleThemes[selectedTitle]) {
        assignment.classList.add(titleThemes[selectedTitle].class);
    }
}

// Handle round submission
function handleRoundSubmit(e) {
    e.preventDefault();
    
    const titleSelects = document.querySelectorAll('.title-select');
    const assignments = {};
    const usedTitles = [];
    
    // Validate all titles are selected and unique
    for (let i = 0; i < titleSelects.length; i++) {
        const select = titleSelects[i];
        const title = select.value;
        
        if (!title) {
            alert('Please assign a title to each player');
            return;
        }
        
        if (usedTitles.includes(title) && title !== 'Sepahi') {
            alert(`${title} has already been assigned. Each title must be unique (except Sepahi).`);
            return;
        }
        
        usedTitles.push(title);
        assignments[gameState.players[i]] = title;
    }
    
    // Validate correct number of each title
    const titleCounts = {};
    usedTitles.forEach(title => {
        titleCounts[title] = (titleCounts[title] || 0) + 1;
    });
    
    const expectedTitles = titleConfigs[gameState.playerCount];
    const expectedCounts = {};
    expectedTitles.forEach(title => {
        expectedCounts[title] = (expectedCounts[title] || 0) + 1;
    });
    
    for (let title in expectedCounts) {
        if (titleCounts[title] !== expectedCounts[title]) {
            alert(`Invalid assignment. Expected ${expectedCounts[title]} ${title}(s), but got ${titleCounts[title] || 0}`);
            return;
        }
    }
    
    // Update stats
    for (let player in assignments) {
        const title = assignments[player];
        gameState.stats[player][title]++;
    }
    
    saveGameState();
    
    // Reset form
    titleSelects.forEach((select, index) => {
        select.value = '';
        updateTitleStyling(index);
    });
    
    // Show success feedback
    showSuccessMessage();
}

// Show success message with vintage style
function showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'success-message';
    message.innerHTML = '✦ Round Locked ✦';
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 1.5rem 3rem;
        border-radius: 8px;
        font-weight: bold;
        z-index: 1000;
        animation: fadeInOut 2s ease;
        text-transform: uppercase;
        letter-spacing: 3px;
        font-family: 'Courier New', monospace;
        border: 3px solid #B8860B;
        box-shadow: 0 0 30px rgba(184,134,11,0.8);
    `;
    
    // Add animation keyframes if not exists
    if (!document.getElementById('success-animation')) {
        const style = document.createElement('style');
        style.id = 'success-animation';
        style.innerHTML = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8) rotate(-5deg); }
                50% { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(5deg); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8) rotate(-5deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 2000);
}

// Generate stats display with photos and title styling
function generateStatsDisplay() {
    const container = document.getElementById('statsDisplay');
    container.innerHTML = '';
    
    gameState.players.forEach((player, playerIndex) => {
        const statsCard = document.createElement('div');
        statsCard.className = 'player-stats-card';
        
        const totalRounds = Object.values(gameState.stats[player]).reduce((a, b) => a + b, 0);
        const photoHtml = gameState.playerPhotos && gameState.playerPhotos[playerIndex]
            ? `<img src="${gameState.playerPhotos[playerIndex]}" class="stats-photo" alt="${player}">`
            : '';
        
        // Find most common title
        let mostCommonTitle = '';
        let maxCount = 0;
        Object.entries(gameState.stats[player]).forEach(([title, count]) => {
            if (count > maxCount) {
                maxCount = count;
                mostCommonTitle = title;
            }
        });
        
        statsCard.innerHTML = `
            <div class="player-stats-header">
                <div class="stats-player-info">
                    ${photoHtml}
                    <div class="player-stats-name">${player}</div>
                </div>
                <div class="expand-icon">▼</div>
            </div>
            <div class="player-stats-summary">
                Total Rounds: ${totalRounds} ${mostCommonTitle ? `| Most: ${titleThemes[mostCommonTitle].icon} ${mostCommonTitle}` : ''}
            </div>
            <div class="player-stats-details">
                ${Object.entries(gameState.stats[player])
                    .map(([title, count]) => `
                        <div class="stat-item ${titleThemes[title].class}">
                            <span class="stat-title">
                                ${titleThemes[title].icon} ${title}
                            </span>
                            <span class="stat-count">${count}</span>
                        </div>
                    `).join('')}
            </div>
        `;
        
        // Add click handler for expand/collapse
        statsCard.addEventListener('click', () => {
            statsCard.classList.toggle('expanded');
        });
        
        container.appendChild(statsCard);
    });
}

// Handle reset stats
function handleResetStats() {
    if (confirm('Are you sure you want to reset all stats? This cannot be undone.')) {
        gameState.stats = {};
        gameState.players = [];
        gameState.playerCount = 0;
        gameState.playerPhotos = {};
        gameState.currentScreen = 'playerCountSection';
        saveGameState();
        showScreen('playerCountSection');
    }
}

// Show screen
function showScreen(screenId) {
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    
    screens[screenId].classList.add('active');
    gameState.currentScreen = screenId;
    
    // Generate stats when showing stats screen
    if (screenId === 'statsSection') {
        generateStatsDisplay();
    }
    
    saveGameState();
}

// Check if returning player
function checkReturningPlayer() {
    if (gameState.players.length > 0) {
        generateRoundForm();
        showScreen('gameSection');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    init();
    checkReturningPlayer();
});