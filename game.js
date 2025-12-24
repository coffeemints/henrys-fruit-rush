// ========================================
// HENRY'S FRUIT RUSH - Main Game File
// ========================================

console.log('🎮 Henry\'s Fruit Rush - Game Initializing...');

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Disable image smoothing for crisp rendering
ctx.imageSmoothingEnabled = false;

// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const FPS = 60;
const FRAME_TIME = 1000 / FPS;

// Fruit types with emojis
const FRUIT_TYPES = [
    { name: 'apple', emoji: '🍎' },
    { name: 'banana', emoji: '🍌' },
    { name: 'orange', emoji: '🍊' },
    { name: 'mango', emoji: '🥭' },
    { name: 'pineapple', emoji: '🍍' }
];

// Obstacle types with emojis (defined BEFORE DIFFICULTY_CONFIGS)
const OBSTACLE_TYPES_EASY = [
    { name: 'meteor', emoji: '☄️' },
    { name: 'cheese', emoji: '🧀' }
];

const OBSTACLE_TYPES_MEDIUM_HARD = [
    { name: 'meteor', emoji: '☄️' },
    { name: 'cheese', emoji: '🧀' },
    { name: 'lightning', emoji: '⚡' }
];

// Game configuration
const DIFFICULTY_CONFIGS = {
    EASY: {
        OBSTACLE_COUNT: 10,
        OBSTACLE_SPEED: 1,
        INITIAL_TIME: 120,
        TIME_BONUS_PER_FRUIT: 5,
        OBSTACLE_TYPES: OBSTACLE_TYPES_EASY
    },
    MEDIUM: {
        OBSTACLE_COUNT: 12,
        OBSTACLE_SPEED: 2,
        INITIAL_TIME: 120,
        TIME_BONUS_PER_FRUIT: 3,
        OBSTACLE_TYPES: OBSTACLE_TYPES_MEDIUM_HARD
    },
    HARD: {
        OBSTACLE_COUNT: 15,
        OBSTACLE_SPEED: 3,
        INITIAL_TIME: 90,
        TIME_BONUS_PER_FRUIT: 2,
        OBSTACLE_TYPES: OBSTACLE_TYPES_MEDIUM_HARD
    }
};

// Current difficulty level
let currentDifficulty = null; // Will be set on difficulty selection

const GAME_CONFIG = {
    PLAYER_SPEED: 4,
    PLAYER_SIZE: 40,
    FRUIT_SIZE: 30,
    OBSTACLE_SIZE: 50,
    HEALTH_PER_FRUIT: 5,
    FRUITS_TO_WIN: 20,
    WARNING_TIME: 30
};

// Game state
let gameState = 'DIFFICULTY_SELECT'; // DIFFICULTY_SELECT, PLAYING, WIN, LOSS
let health = 0;
let fruitsCollected = 0;
let timeRemaining = 0;
let lastFrameTime = 0;
let lastSecondTime = 0;

// Input state
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

// ========================================
// ENTITY CLASSES
// ========================================

// Player (Henry the Dinosaur)
const player = {
    x: 50,
    y: CANVAS_HEIGHT / 2 - GAME_CONFIG.PLAYER_SIZE / 2,
    width: GAME_CONFIG.PLAYER_SIZE,
    height: GAME_CONFIG.PLAYER_SIZE,
    speed: GAME_CONFIG.PLAYER_SPEED,
    emoji: '🦖',
    // Animation properties
    animationFrame: 0, // 0-3 for 4-frame cycle
    animationCounter: 0, // Counts pixels moved to trigger frame change
    direction: 'right', // 'right', 'left', 'up', 'down'
    isMoving: false
};

// Current fruit
let currentFruit = null;

// Obstacles array
let obstacles = [];

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Get random integer between min and max (inclusive)
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Get random item from array
function randomItem(array) {
    return array[randomInt(0, array.length - 1)];
}

// AABB Collision Detection
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Check if position overlaps with any obstacle
function isPositionValid(x, y, width, height, excludeObstacles = []) {
    const testRect = { x, y, width, height };
    
    for (let obstacle of obstacles) {
        if (excludeObstacles.includes(obstacle)) continue;
        if (checkCollision(testRect, obstacle)) {
            return false;
        }
    }
    
    return true;
}

// ========================================
// GAME INITIALIZATION
// ========================================

// Generate obstacles at random positions
function generateObstacles() {
    obstacles = [];
    const diffConfig = DIFFICULTY_CONFIGS[currentDifficulty];
    console.log(`🪨 Generating ${diffConfig.OBSTACLE_COUNT} obstacles (ALL MOVING at ${diffConfig.OBSTACLE_SPEED}px/frame)...`);
    
    let attempts = 0;
    const maxAttempts = 100;
    
    while (obstacles.length < diffConfig.OBSTACLE_COUNT && attempts < maxAttempts) {
        attempts++;
        
        // Random position (avoid edges to ensure playability)
        const x = randomInt(150, CANVAS_WIDTH - GAME_CONFIG.OBSTACLE_SIZE - 150);
        const y = randomInt(50, CANVAS_HEIGHT - GAME_CONFIG.OBSTACLE_SIZE - 50);
        
        // Check if position is valid (doesn't overlap player start or other obstacles)
        const playerStartRect = {
            x: player.x - 50,
            y: player.y - 50,
            width: GAME_CONFIG.PLAYER_SIZE + 100,
            height: GAME_CONFIG.PLAYER_SIZE + 100
        };
        
        const testRect = { x, y, width: GAME_CONFIG.OBSTACLE_SIZE, height: GAME_CONFIG.OBSTACLE_SIZE };
        
        // Don't spawn near player start
        if (checkCollision(testRect, playerStartRect)) {
            continue;
        }
        
        // Don't overlap other obstacles
        if (!isPositionValid(x, y, GAME_CONFIG.OBSTACLE_SIZE, GAME_CONFIG.OBSTACLE_SIZE)) {
            continue;
        }
        
        // ALL obstacles now move
        const direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';
        
        // Create obstacle
        const obstacleType = randomItem(diffConfig.OBSTACLE_TYPES);
        const obstacle = {
            x,
            y,
            width: GAME_CONFIG.OBSTACLE_SIZE,
            height: GAME_CONFIG.OBSTACLE_SIZE,
            type: obstacleType.name,
            emoji: obstacleType.emoji,
            isMoving: true, // ALL obstacles move now
            direction: direction,
            speed: diffConfig.OBSTACLE_SPEED,
            moveDir: 1 // 1 or -1 for direction
        };
        
        // Set patrol range
        if (direction === 'horizontal') {
            obstacle.minX = Math.max(50, x - 100);
            obstacle.maxX = Math.min(CANVAS_WIDTH - GAME_CONFIG.OBSTACLE_SIZE - 50, x + 100);
        } else {
            obstacle.minY = Math.max(50, y - 100);
            obstacle.maxY = Math.min(CANVAS_HEIGHT - GAME_CONFIG.OBSTACLE_SIZE - 50, y + 100);
        }
        
        obstacles.push(obstacle);
        
        const dirText = direction === 'horizontal' ? 'L-R' : 'U-D';
        console.log(`  ✓ Placed ${obstacleType.emoji} at (${x}, ${y}) - ${dirText}`);
    }
    
    console.log(`✅ Generated ${obstacles.length} obstacles`);
}

// Spawn a new fruit at a random position on screen
function spawnNewFruit() {
    const fruitType = randomItem(FRUIT_TYPES);
    
    let attempts = 0;
    const maxAttempts = 50;
    let validPosition = false;
    let x, y;
    
    while (!validPosition && attempts < maxAttempts) {
        attempts++;
        
        // Spawn anywhere on screen with random X and Y
        x = randomInt(20, CANVAS_WIDTH - GAME_CONFIG.FRUIT_SIZE - 20);
        y = randomInt(20, CANVAS_HEIGHT - GAME_CONFIG.FRUIT_SIZE - 20);
        
        // Check if position is valid (not inside obstacle or too close to player)
        const playerDist = Math.hypot(player.x - x, player.y - y);
        validPosition = isPositionValid(x, y, GAME_CONFIG.FRUIT_SIZE, GAME_CONFIG.FRUIT_SIZE) && 
                       playerDist > 80; // Don't spawn too close to player
    }
    
    currentFruit = {
        x,
        y,
        width: GAME_CONFIG.FRUIT_SIZE,
        height: GAME_CONFIG.FRUIT_SIZE,
        type: fruitType.name,
        emoji: fruitType.emoji,
        healthValue: GAME_CONFIG.HEALTH_PER_FRUIT
    };
    
    console.log(`🍎 Spawned ${fruitType.name} at (${x}, ${y})`);
}

// Initialize game
function initGame() {
    console.log(`🎮 Initializing game on ${currentDifficulty} difficulty...`);
    
    const diffConfig = DIFFICULTY_CONFIGS[currentDifficulty];
    
    // Reset game state
    gameState = 'PLAYING';
    health = 0;
    fruitsCollected = 0;
    timeRemaining = diffConfig.INITIAL_TIME;
    lastSecondTime = 0;
    
    // Reset player position
    player.x = 50;
    player.y = CANVAS_HEIGHT / 2 - GAME_CONFIG.PLAYER_SIZE / 2;
    player.animationFrame = 0;
    player.animationCounter = 0;
    player.direction = 'right';
    player.isMoving = false;
    
    // Generate level
    generateObstacles();
    spawnNewFruit();
    
    console.log('✅ Game initialized - Ready to play!');
    console.log(`   Obstacles: ${diffConfig.OBSTACLE_COUNT}`);
    console.log(`   Speed: ${diffConfig.OBSTACLE_SPEED}px/frame`);
    console.log(`   Time: ${diffConfig.INITIAL_TIME}s`);
    console.log(`   Time bonus: +${diffConfig.TIME_BONUS_PER_FRUIT}s per fruit`);
}

// ========================================
// INPUT HANDLING
// ========================================

document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
        e.preventDefault(); // Prevent page scrolling
    }
});

document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
        e.preventDefault();
    }
});

// Handle restart button click
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Difficulty selection
    if (gameState === 'DIFFICULTY_SELECT') {
        const buttonWidth = 400;
        const buttonHeight = 70;
        const buttonX = CANVAS_WIDTH / 2 - buttonWidth / 2;
        const startY = 250;
        const spacing = 90;
        
        // Check Easy button
        if (clickX >= buttonX && clickX <= buttonX + buttonWidth &&
            clickY >= startY && clickY <= startY + buttonHeight) {
            currentDifficulty = 'EASY';
            console.log('🟢 Selected EASY difficulty');
            initGame();
        }
        
        // Check Medium button
        const mediumY = startY + spacing;
        if (clickX >= buttonX && clickX <= buttonX + buttonWidth &&
            clickY >= mediumY && clickY <= mediumY + buttonHeight) {
            currentDifficulty = 'MEDIUM';
            console.log('🟡 Selected MEDIUM difficulty');
            initGame();
        }
        
        // Check Hard button
        const hardY = startY + (2 * spacing);
        if (clickX >= buttonX && clickX <= buttonX + buttonWidth &&
            clickY >= hardY && clickY <= hardY + buttonHeight) {
            currentDifficulty = 'HARD';
            console.log('🔴 Selected HARD difficulty');
            initGame();
        }
    }
    
    // Game over restart - go back to difficulty select
    if (gameState === 'WIN' || gameState === 'LOSS') {
        const buttonX = CANVAS_WIDTH / 2 - 100;
        const buttonY = CANVAS_HEIGHT / 2 + 80;
        const buttonWidth = 200;
        const buttonHeight = 50;
        
        if (clickX >= buttonX && clickX <= buttonX + buttonWidth &&
            clickY >= buttonY && clickY <= buttonY + buttonHeight) {
            console.log('🔄 Returning to difficulty select...');
            gameState = 'DIFFICULTY_SELECT';
            currentDifficulty = null;
        }
    }
});

// ========================================
// UPDATE LOGIC
// ========================================

function handleInput() {
    if (gameState !== 'PLAYING') return;
    
    // Store old position for collision rollback
    const oldX = player.x;
    const oldY = player.y;
    
    // Track if player is moving
    let moved = false;
    let newDirection = player.direction;
    
    // Move player based on input (prioritize horizontal for diagonal)
    if (keys.ArrowLeft || keys.ArrowRight) {
        // Horizontal movement takes priority for direction
        if (keys.ArrowLeft) {
            player.x -= player.speed;
            newDirection = 'left';
            moved = true;
        }
        if (keys.ArrowRight) {
            player.x += player.speed;
            newDirection = 'right';
            moved = true;
        }
    } else {
        // Only check vertical if no horizontal movement
        if (keys.ArrowUp) {
            player.y -= player.speed;
            newDirection = 'up';
            moved = true;
        }
        if (keys.ArrowDown) {
            player.y += player.speed;
            newDirection = 'down';
            moved = true;
        }
    }
    
    // Update direction and animation
    if (moved) {
        player.direction = newDirection;
        player.isMoving = true;
        
        // Update animation frame based on distance moved
        player.animationCounter += player.speed;
        if (player.animationCounter >= 8) { // Change frame every 8 pixels
            player.animationFrame = (player.animationFrame + 1) % 4;
            player.animationCounter = 0;
        }
    } else {
        player.isMoving = false;
        player.animationFrame = 0; // Reset to neutral when not moving
    }
    
    // Clamp to screen bounds
    player.x = Math.max(0, Math.min(CANVAS_WIDTH - player.width, player.x));
    player.y = Math.max(0, Math.min(CANVAS_HEIGHT - player.height, player.y));
    
    // Check collision with obstacles
    for (let obstacle of obstacles) {
        if (checkCollision(player, obstacle)) {
            // Collision detected - revert to old position
            player.x = oldX;
            player.y = oldY;
            player.isMoving = false;
            player.animationFrame = 0;
            break;
        }
    }
}

function updateTimer(deltaTime) {
    if (gameState !== 'PLAYING') return;
    
    lastSecondTime += deltaTime;
    
    // Update timer every second
    if (lastSecondTime >= 1000) {
        timeRemaining--;
        lastSecondTime -= 1000;
        
        if (timeRemaining <= 0) {
            timeRemaining = 0;
            console.log('⏰ TIME UP!');
        }
    }
}

function updateObstacles() {
    if (gameState !== 'PLAYING') return;
    
    for (let obstacle of obstacles) {
        if (!obstacle.isMoving) continue;
        
        // Move obstacle
        if (obstacle.direction === 'horizontal') {
            obstacle.x += obstacle.speed * obstacle.moveDir;
            
            // Bounce at boundaries
            if (obstacle.x <= obstacle.minX) {
                obstacle.x = obstacle.minX;
                obstacle.moveDir = 1;
            } else if (obstacle.x >= obstacle.maxX) {
                obstacle.x = obstacle.maxX;
                obstacle.moveDir = -1;
            }
        } else {
            obstacle.y += obstacle.speed * obstacle.moveDir;
            
            // Bounce at boundaries
            if (obstacle.y <= obstacle.minY) {
                obstacle.y = obstacle.minY;
                obstacle.moveDir = 1;
            } else if (obstacle.y >= obstacle.maxY) {
                obstacle.y = obstacle.maxY;
                obstacle.moveDir = -1;
            }
        }
    }
}

function checkCollisions() {
    if (gameState !== 'PLAYING') return;
    
    const diffConfig = DIFFICULTY_CONFIGS[currentDifficulty];
    
    // Check fruit collection
    if (currentFruit && checkCollision(player, currentFruit)) {
        console.log(`✅ Collected ${currentFruit.emoji}!`);
        console.log(`   Health: ${health}% → ${health + currentFruit.healthValue}%`);
        console.log(`   Time: ${formatTime(timeRemaining)} → ${formatTime(timeRemaining + diffConfig.TIME_BONUS_PER_FRUIT)} (+${diffConfig.TIME_BONUS_PER_FRUIT}s bonus)`);
        
        // Increase health
        health += currentFruit.healthValue;
        fruitsCollected++;
        
        // Add time bonus
        timeRemaining += diffConfig.TIME_BONUS_PER_FRUIT;
        
        // Clamp health to 100%
        health = Math.min(100, health);
        
        // Spawn new fruit
        if (health < 100) {
            spawnNewFruit();
        }
    }
}

function checkWinLoss() {
    if (gameState !== 'PLAYING') return;
    
    const diffConfig = DIFFICULTY_CONFIGS[currentDifficulty];
    
    // Check win condition
    if (health >= 100) {
        gameState = 'WIN';
        console.log('🎉 VICTORY! Henry is full!');
        console.log(`Final time: ${formatTime(diffConfig.INITIAL_TIME - timeRemaining)}`);
    }
    
    // Check loss condition
    if (timeRemaining <= 0 && health < 100) {
        gameState = 'LOSS';
        console.log(`😢 DEFEAT! Time ran out at ${health}% health`);
        console.log(`Fruits collected: ${fruitsCollected} / ${GAME_CONFIG.FRUITS_TO_WIN}`);
    }
}

// ========================================
// RENDERING
// ========================================

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function drawBackground() {
    // Mars-like rocky terrain base
    ctx.fillStyle = '#CC6633';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Add darker rocky patches
    ctx.fillStyle = '#A0522D';
    for (let i = 0; i < 25; i++) {
        const x = (i * 137) % CANVAS_WIDTH;
        const y = (i * 89) % CANVAS_HEIGHT;
        const size = 30 + (i % 3) * 15;
        ctx.fillRect(x, y, size, size);
    }
    
    // Add small scattered rocks (gray/brown)
    ctx.fillStyle = '#8B7355';
    for (let i = 0; i < 40; i++) {
        const x = (i * 163) % CANVAS_WIDTH;
        const y = (i * 127) % CANVAS_HEIGHT;
        const size = 8 + (i % 4) * 4;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Add dark cracks in the terrain
    ctx.strokeStyle = '#663300';
    ctx.lineWidth = 2;
    for (let i = 0; i < 15; i++) {
        const startX = (i * 197) % CANVAS_WIDTH;
        const startY = (i * 151) % CANVAS_HEIGHT;
        const endX = startX + 50 + (i % 3) * 30;
        const endY = startY + (i % 2 === 0 ? 20 : -20);
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }
}

function drawUI() {
    // Set font
    ctx.font = 'bold 20px "Courier New"';
    ctx.textBaseline = 'top';
    
    // Health bar (top-left)
    const healthBarX = 20;
    const healthBarY = 20;
    const healthBarWidth = 200;
    const healthBarHeight = 30;
    
    // Health bar background
    ctx.fillStyle = '#333';
    ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
    
    // Health bar fill
    const fillWidth = (health / 100) * healthBarWidth;
    ctx.fillStyle = health < 50 ? '#ff6b6b' : health < 80 ? '#ffd93d' : '#6bcf7f';
    ctx.fillRect(healthBarX, healthBarY, fillWidth, healthBarHeight);
    
    // Health bar border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
    
    // Health text
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeText(`❤️ ${health}%`, healthBarX + 5, healthBarY + 5);
    ctx.fillText(`❤️ ${health}%`, healthBarX + 5, healthBarY + 5);
    
    // Timer (top-right)
    const timerText = `⏰ ${formatTime(timeRemaining)}`;
    const timerX = CANVAS_WIDTH - 20;
    const timerY = 20;
    
    ctx.textAlign = 'right';
    ctx.fillStyle = timeRemaining <= GAME_CONFIG.WARNING_TIME ? '#ff6b6b' : '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeText(timerText, timerX, timerY);
    ctx.fillText(timerText, timerX, timerY);
    
    ctx.textAlign = 'left'; // Reset alignment
}

// Draw entity using emoji with animation for player
function drawEntity(entity) {
    // Special handling for player with animation
    if (entity === player) {
        drawAnimatedPlayer();
        return;
    }
    
    // Regular emoji rendering for non-player entities
    const fontSize = Math.min(entity.width, entity.height);
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.fillText(
        entity.emoji,
        entity.x + entity.width / 2,
        entity.y + entity.height / 2
    );
}

// Draw animated player with 4-frame walking cycle
function drawAnimatedPlayer() {
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;
    
    ctx.save();
    
    // Translate to player center for rotation/flip
    ctx.translate(centerX, centerY);
    
    // Flip/rotate based on direction
    if (player.direction === 'left') {
        ctx.scale(-1, 1); // Flip horizontally
    } else if (player.direction === 'up') {
        ctx.rotate(-Math.PI / 2); // Rotate 90 degrees counter-clockwise
    } else if (player.direction === 'down') {
        ctx.rotate(Math.PI / 2); // Rotate 90 degrees clockwise
    }
    // 'right' is default, no transformation needed
    
    // Draw dino with animation frame
    const fontSize = player.width;
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Get the appropriate emoji based on animation frame
    let dinoEmoji = '🦖';
    
    // 4-frame walking cycle (only animate if moving)
    if (player.isMoving) {
        // Frame 0 & 2: neutral stance
        // Frame 1: left leg forward (slightly offset)
        // Frame 3: right leg forward (slightly offset)
        
        // Since we can't actually change the emoji legs, we'll add subtle vertical offset
        // to simulate walking bounce
        if (player.animationFrame === 1 || player.animationFrame === 3) {
            ctx.translate(0, -2); // Slight bounce up
        }
    }
    
    ctx.fillText(dinoEmoji, 0, 0);
    
    ctx.restore();
}

function drawGameOverScreen() {
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Game over text
    ctx.font = 'bold 48px "Courier New"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (gameState === 'WIN') {
        // Victory screen
        ctx.fillStyle = '#ffd93d';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        
        const diffConfig = DIFFICULTY_CONFIGS[currentDifficulty];
        const title = '🎉 HENRY IS FULL! 🎉';
        ctx.strokeText(title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
        ctx.fillText(title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
        
        // Stats
        ctx.font = 'bold 24px "Courier New"';
        const timeText = `Completed in ${formatTime(diffConfig.INITIAL_TIME - timeRemaining)}`;
        ctx.strokeText(timeText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.fillText(timeText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        
    } else if (gameState === 'LOSS') {
        // Loss screen
        ctx.fillStyle = '#ff6b6b';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        
        const title = "⏰ TIME'S UP! 😢";
        ctx.strokeText(title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
        ctx.fillText(title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
        
        // Stats
        ctx.font = 'bold 24px "Courier New"';
        ctx.fillStyle = '#ffd93d';
        const healthText = `Health Reached: ${health}%`;
        ctx.strokeText(healthText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);
        ctx.fillText(healthText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);
        
        const fruitsText = `(${fruitsCollected} out of ${GAME_CONFIG.FRUITS_TO_WIN} fruits)`;
        ctx.strokeText(fruitsText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
        ctx.fillText(fruitsText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
    }
    
    // Restart button
    const buttonX = CANVAS_WIDTH / 2 - 100;
    const buttonY = CANVAS_HEIGHT / 2 + 80;
    const buttonWidth = 200;
    const buttonHeight = 50;
    
    ctx.fillStyle = '#6bcf7f';
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    ctx.fillStyle = '#000';
    ctx.font = 'bold 24px "Courier New"';
    ctx.fillText('🔄 Play Again', CANVAS_WIDTH / 2, buttonY + buttonHeight / 2);
}

function drawDifficultySelect() {
    // Draw background first
    drawBackground();
    
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Title
    ctx.font = 'bold 56px "Courier New"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffd93d';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    
    const title = '🦖 HENRY\'S FRUIT RUSH 🍎';
    ctx.strokeText(title, CANVAS_WIDTH / 2, 100);
    ctx.fillText(title, CANVAS_WIDTH / 2, 100);
    
    // Subtitle
    ctx.font = 'bold 28px "Courier New"';
    ctx.fillStyle = '#fff';
    ctx.fillText('SELECT YOUR DIFFICULTY', CANVAS_WIDTH / 2, 180);
    
    // Difficulty buttons
    const buttonWidth = 400;
    const buttonHeight = 70;
    const buttonX = CANVAS_WIDTH / 2 - buttonWidth / 2;
    const startY = 250;
    const spacing = 90;
    
    const difficulties = [
        { name: 'EASY', color: '#6bcf7f', emoji: '🟢', desc: 'Learn to Play' },
        { name: 'MEDIUM', color: '#ffd93d', emoji: '🟡', desc: 'Get Skilled' },
        { name: 'HARD', color: '#ff6b6b', emoji: '🔴', desc: 'Prove Yourself' }
    ];
    
    difficulties.forEach((diff, index) => {
        const y = startY + (index * spacing);
        
        // Button background
        ctx.fillStyle = diff.color;
        ctx.fillRect(buttonX, y, buttonWidth, buttonHeight);
        
        // Button border
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeRect(buttonX, y, buttonWidth, buttonHeight);
        
        // Button text
        ctx.fillStyle = '#000';
        ctx.font = 'bold 32px "Courier New"';
        ctx.fillText(`${diff.emoji} ${diff.name} - ${diff.desc}`, CANVAS_WIDTH / 2, y + buttonHeight / 2);
    });
    
    // Instructions
    ctx.font = 'bold 18px "Courier New"';
    ctx.fillStyle = '#aaa';
    ctx.fillText('Click a difficulty to start!', CANVAS_WIDTH / 2, 530);
}

function render() {
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Show difficulty select screen
    if (gameState === 'DIFFICULTY_SELECT') {
        drawDifficultySelect();
        return;
    }
    
    // Draw game world
    drawBackground();
    
    // Draw obstacles
    for (let obstacle of obstacles) {
        drawEntity(obstacle);
    }
    
    // Draw fruit
    if (currentFruit) {
        drawEntity(currentFruit);
    }
    
    // Draw player
    drawEntity(player);
    
    // Draw UI
    drawUI();
    
    // Draw game over screen if applicable
    if (gameState === 'WIN' || gameState === 'LOSS') {
        drawGameOverScreen();
    }
}

// ========================================
// GAME LOOP
// ========================================

function gameLoop(currentTime) {
    // Calculate delta time
    const deltaTime = currentTime - lastFrameTime;
    
    // Only update if enough time has passed (60 FPS cap)
    if (deltaTime >= FRAME_TIME) {
        lastFrameTime = currentTime - (deltaTime % FRAME_TIME);
        
        // Update
        handleInput();
        updateTimer(deltaTime);
        updateObstacles();
        checkCollisions();
        checkWinLoss();
        
        // Render
        render();
    }
    
    // Schedule next frame
    requestAnimationFrame(gameLoop);
}

// ========================================
// START GAME
// ========================================

window.addEventListener('load', () => {
    console.log('🎮 Game loaded successfully!');
    console.log('📋 Select your difficulty to begin!');
    console.log('---');
    
    // Don't init game yet - show difficulty select first
    requestAnimationFrame(gameLoop);
});
