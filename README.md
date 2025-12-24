# 🦖 Henry's Fruit Rush

A fast-paced arcade game where Henry the Dinosaur must collect 20 fruits on a Martian terrain while avoiding moving obstacles!

## 🎮 Game Description

Henry is a hungry dinosaur stranded on Mars! Help him collect fruits to fill his health bar to 100% before time runs out. Navigate through a rocky Martian landscape filled with moving meteors, cheese blocks, and lightning bolts. The faster you collect fruits, the more time you gain!

## 🕹️ How to Play

### Controls
- **Arrow Keys (↑ ↓ ← →)**: Move Henry in any direction
- **Mouse Click**: Select difficulty level and restart game

### Objective
- Collect **20 fruits** to reach **100% health**
- Each fruit gives **+5% health** and bonus time
- Avoid obstacles - they will block your movement
- Beat the clock!

### Gameplay Mechanics

**Fruit Collection:**
- 5 fruit types appear randomly: 🍎 Apple, 🍌 Banana, 🍊 Orange, 🥭 Mango, 🍍 Pineapple
- Fruits spawn anywhere on the map
- Collect a fruit to make a new one appear
- Each fruit adds +5% to health bar

**Time Bonuses:**
- Collecting fruits extends your time
- Bonus amount depends on difficulty level
- Race against the clock!

**Obstacles:**
- **ALL obstacles move** - they patrol back and forth
- Obstacles vary by difficulty: ☄️ Meteors, 🧀 Cheese, ⚡ Lightning
- Can't pass through obstacles
- Plan your route carefully!

## 🎯 Difficulty Levels

### 🟢 EASY - Learn to Play
- **Obstacles:** 10 (☄️ Meteors, 🧀 Cheese)
- **Speed:** Slow (1 px/frame)
- **Starting Time:** 120 seconds (2:00)
- **Time Bonus:** +5 seconds per fruit
- **Total Possible Time:** 220 seconds (3:40)

Perfect for learning the game mechanics and obstacle patterns.

### 🟡 MEDIUM - Get Skilled
- **Obstacles:** 12 (☄️ Meteors, 🧀 Cheese, ⚡ Lightning)
- **Speed:** Medium (2 px/frame) - 2x faster than Easy
- **Starting Time:** 120 seconds (2:00)
- **Time Bonus:** +3 seconds per fruit
- **Total Possible Time:** 180 seconds (3:00)

Faster obstacles require better timing and route planning.

### 🔴 HARD - Prove Yourself
- **Obstacles:** 15 (☄️ Meteors, 🧀 Cheese, ⚡ Lightning)
- **Speed:** Fast (3 px/frame) - 3x faster than Easy
- **Starting Time:** 90 seconds (1:30)
- **Time Bonus:** +2 seconds per fruit
- **Total Possible Time:** 130 seconds (2:10)

Maximum challenge! Tight time limit with fast-moving obstacles. Only for experts!

## 🎨 Game Features

- **Mars Rocky Terrain:** Reddish-orange Martian surface with cracks and scattered rocks
- **Animated Dinosaur:** Henry's legs move as he walks and he faces the direction he's moving
- **Dynamic Obstacles:** All obstacles patrol in horizontal or vertical patterns
- **Difficulty Selection:** Choose your challenge level before each game
- **Visual Feedback:** Health bar with color progression, timer warning at 30 seconds
- **Retro Pixel Art Style:** Emoji-based graphics with crisp rendering

## 🚀 Play the Game

### Option 1: Play Locally
1. Download all files: `index.html`, `game.js`, `style.css`
2. Open `index.html` in your web browser (Chrome, Firefox, Safari, or Edge)
3. Select difficulty and start playing!

### Option 2: Play Online
Visit the live game at: `[Your GitHub Pages URL will be here]`

## 📦 Deployment Instructions (GitHub Pages)

Follow these steps to deploy Henry's Fruit Rush to GitHub Pages:

### Prerequisites
- A GitHub account (create one at https://github.com if you don't have one)
- Git installed on your computer (download from https://git-scm.com)

### Step 1: Create a New Repository
1. Go to https://github.com and log in
2. Click the **+** icon in the top-right corner
3. Select **New repository**
4. Name your repository: `henrys-fruit-rush`
5. Make it **Public**
6. Click **Create repository**

### Step 2: Upload Game Files
You have two options:

#### Option A: Using GitHub Web Interface (Easiest)
1. On your new repository page, click **uploading an existing file**
2. Drag and drop these 3 files:
   - `index.html`
   - `game.js`
   - `style.css`
3. Scroll down and click **Commit changes**

#### Option B: Using Git Command Line
```bash
# Navigate to your game folder
cd path/to/henrys-fruit-rush

# Initialize git repository
git init

# Add all files
git add index.html game.js style.css README.md

# Commit files
git commit -m "Initial commit: Henry's Fruit Rush"

# Add remote repository (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/henrys-fruit-rush.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Click **Pages** (left sidebar)
4. Under **Source**, select **main** branch
5. Click **Save**
6. Wait 1-2 minutes for deployment

### Step 4: Access Your Game
Your game will be live at:
```
https://YOUR-USERNAME.github.io/henrys-fruit-rush/
```

### Step 5: Share Your Game! 🎉
Copy the URL and share it with friends and family!

## 🔧 Technical Details

- **Platform:** Web Browser (HTML5 Canvas)
- **Technology:** Vanilla JavaScript, HTML5, CSS3
- **Framework:** None - Pure JavaScript
- **Performance:** 60 FPS game loop using requestAnimationFrame
- **Compatibility:** Works on all modern browsers (Chrome, Firefox, Safari, Edge)

## 📊 File Structure

```
henrys-fruit-rush/
│
├── index.html          # Main HTML file
├── game.js             # Game logic and rendering
├── style.css           # Styling and layout
└── README.md           # This file
```

## 🎓 Learning Resources

Want to understand how the game works?

- **Game Loop:** 60 FPS update cycle using `requestAnimationFrame`
- **Collision Detection:** AABB (Axis-Aligned Bounding Box) algorithm
- **State Management:** Finite state machine (DIFFICULTY_SELECT → PLAYING → WIN/LOSS)
- **Animation:** Frame-based animation tied to movement speed
- **Input Handling:** Event-driven keyboard controls

## 🐛 Troubleshooting

**Game shows only green/orange screen:**
- Make sure all 3 files are in the same folder
- Check browser console (F12) for errors
- Try a different browser

**Controls not working:**
- Click on the game canvas to give it focus
- Make sure you've selected a difficulty level
- Try refreshing the page

**Obstacles not moving:**
- This is intentional - start a new game to see them move
- All obstacles patrol continuously during gameplay

## 🎯 Tips & Strategies

- **Easy Mode:** Take your time, learn obstacle patterns
- **Medium Mode:** Plan your route ahead, collect fruits quickly
- **Hard Mode:** Constant movement required, prioritize closest fruits
- **General:** Use the time bonuses strategically - don't let the timer get too low!

## 🏆 Credits

**Created by:**
- **Henry Unidad**
- **Noelle Roque**

Built with ❤️ as a learning project to explore game development fundamentals.

## 📝 Version History

- **v1.3** (Current) - Added Mars terrain, dino animation, difficulty levels
- **v1.2** - Added moving obstacles and time bonuses
- **v1.1** - Added difficulty selection screen
- **v1.0** - Initial release with core gameplay

## 📄 License

This game is free to play and share. Feel free to fork and modify for educational purposes!

---

**Enjoy playing Henry's Fruit Rush! 🦖🍎**

*If you find any bugs or have suggestions, feel free to open an issue on GitHub!*
