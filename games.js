/**
 * HanhChi Arcade - 5 Mini Games Center
 * Built for Hanh Chi's Personal Portfolio
 */

document.addEventListener('DOMContentLoaded', () => {
    // Global Elements
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const gameOverlay = document.getElementById('game-overlay');
    const startBtn = document.getElementById('start-game-btn');
    const overlayTitle = document.getElementById('overlay-title');
    const overlayDesc = document.getElementById('overlay-desc');
    const scoreVal = document.getElementById('game-score');
    const highscoreVal = document.getElementById('game-highscore');
    const timerVal = document.getElementById('game-timer');
    const timerContainer = document.getElementById('game-timer-container');
    const gameTitleEl = document.getElementById('current-game-title');
    const selectButtons = document.querySelectorAll('.game-select-btn');
    const mobileControls = document.getElementById('mobile-controls');
    const controlGroups = document.querySelectorAll('.mobile-game-controls .control-group');

    // Canvas scaling for high-DPI displays
    const width = 600;
    const height = 400;
    canvas.width = width;
    canvas.height = height;

    // Game Manager State
    let activeGame = 'catcher';
    let isPlaying = false;
    let score = 0;
    let highscores = {
        catcher: localStorage.getItem('hs_catcher') || 0,
        memory: localStorage.getItem('hs_memory') || 0,
        karate: localStorage.getItem('hs_karate') || 0,
        runner: localStorage.getItem('hs_runner') || 0,
        tictactoe: localStorage.getItem('hs_tictactoe') || 0
    };

    let gameLoopId = null;
    let gameTimerId = null;
    let remainingTime = 30;

    // Keys state
    const keys = {};

    // Touch controls helper
    const activeTouchControls = {
        left: false,
        right: false,
        jump: false
    };

    // Load Highscores to UI
    function updateHighscoreDisplay() {
        highscoreVal.textContent = highscores[activeGame];
    }
    updateHighscoreDisplay();

    // Event Listeners for Game Selection
    selectButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('active')) return;
            
            // Stop current game
            stopGame();

            selectButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            activeGame = btn.getAttribute('data-game');
            updateGameInfo();
        });
    });

    // Update Game Info Panel & Overlay
    const gameInfo = {
        catcher: {
            title: "Hứng Bánh Donut 🍩",
            desc: "Điều khiển Hamster bằng phím mũi tên Trái/Phải (hoặc nút bấm trên điện thoại) để hứng Donut rơi xuống. Tránh Donut đen bị cháy nhé!",
            timer: 30,
            hasTimer: true
        },
        memory: {
            title: "Trí Nhớ Siêu Đẳng 🧩",
            desc: "Lật các ô thẻ bài trên màn hình để tìm các cặp hình giống nhau liên quan đến sở thích của Hạnh Chi trong thời gian ngắn nhất!",
            timer: 45,
            hasTimer: true
        },
        karate: {
            title: "Karate Chặt Gỗ 🥋",
            desc: "Dùng phím mũi tên Trái/Phải để chặt các khúc gỗ ở chân cây. Hãy phản xạ thật nhanh để né tránh các cành cây gỗ đập trúng đầu nhé!",
            timer: 0,
            hasTimer: false
        },
        runner: {
            title: "Hamster Chạy Bộ 🐹",
            desc: "Dùng phím Lên / Space (hoặc bấm nút Nhảy) để giúp Hamster nhảy qua các chướng ngại vật như cây cán bột, đai đen Karate. Sống sót càng lâu điểm càng cao!",
            timer: 0,
            hasTimer: false
        },
        tictactoe: {
            title: "Cờ Caro 3x3 ❌",
            desc: "Đấu cờ Caro 3x3 kinh điển với chú Hamster thông minh. Bạn đi trước với quân Donut 🍩, Hamster là quân Cookie 🍪. Xếp đủ 3 hàng thẳng để thắng!",
            timer: 0,
            hasTimer: false
        }
    };

    function updateGameInfo() {
        const info = gameInfo[activeGame];
        gameTitleEl.textContent = info.title;
        overlayTitle.textContent = info.title;
        overlayDesc.textContent = info.desc;
        
        // Timer display
        if (info.hasTimer) {
            timerContainer.style.display = 'inline-block';
            timerVal.textContent = info.timer;
        } else {
            timerContainer.style.display = 'none';
        }
        
        scoreVal.textContent = 0;
        updateHighscoreDisplay();
        
        // Show start overlay
        gameOverlay.style.opacity = 1;
        gameOverlay.style.pointerEvents = 'auto';

        // Toggle mobile control group
        controlGroups.forEach(group => group.classList.remove('active'));
        const activeGroup = document.getElementById(`control-${activeGame}`);
        if (activeGroup) {
            activeGroup.classList.add('active');
        }

        // Draw initial static screens
        drawStaticMenu();
    }

    function drawStaticMenu() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "#1e1e2f";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        ctx.fillRect(20, 20, width - 40, height - 40);

        ctx.font = "bold 20px Outfit, sans-serif";
        ctx.fillStyle = "#ffb5a7";
        ctx.textAlign = "center";
        ctx.fillText("HanhChi Arcade Cabinet", width / 2, 80);

        ctx.font = "14px Inter, sans-serif";
        ctx.fillStyle = "#a2d2ff";
        ctx.fillText("Bấm nút bắt đầu để chơi game này!", width / 2, 200);

        // Simple vector icons based on active game
        ctx.font = "60px Arial";
        let icon = "🎮";
        if (activeGame === 'catcher') icon = "🍩";
        if (activeGame === 'memory') icon = "🧩";
        if (activeGame === 'karate') icon = "🥋";
        if (activeGame === 'runner') icon = "🐹";
        if (activeGame === 'tictactoe') icon = "❌";
        ctx.fillText(icon, width / 2, 280);
    }

    // Keyboard Input Listeners
    window.addEventListener('keydown', e => {
        keys[e.code] = true;
        // Prevent default spacebar/arrow scrolling inside game canvas section
        if (isPlaying && (e.code === 'Space' || e.code.startsWith('Arrow'))) {
            e.preventDefault();
        }
    });

    window.addEventListener('keyup', e => {
        keys[e.code] = false;
    });

    // Touch controls button bindings
    document.getElementById('btn-move-left').addEventListener('mousedown', () => activeTouchControls.left = true);
    document.getElementById('btn-move-left').addEventListener('mouseup', () => activeTouchControls.left = false);
    document.getElementById('btn-move-left').addEventListener('touchstart', (e) => { e.preventDefault(); activeTouchControls.left = true; });
    document.getElementById('btn-move-left').addEventListener('touchend', () => activeTouchControls.left = false);

    document.getElementById('btn-move-right').addEventListener('mousedown', () => activeTouchControls.right = true);
    document.getElementById('btn-move-right').addEventListener('mouseup', () => activeTouchControls.right = false);
    document.getElementById('btn-move-right').addEventListener('touchstart', (e) => { e.preventDefault(); activeTouchControls.right = true; });
    document.getElementById('btn-move-right').addEventListener('touchend', () => activeTouchControls.right = false);

    document.getElementById('btn-chop-left').addEventListener('click', () => {
        if (isPlaying && activeGame === 'karate') karateChop('left');
    });
    document.getElementById('btn-chop-right').addEventListener('click', () => {
        if (isPlaying && activeGame === 'karate') karateChop('right');
    });

    document.getElementById('btn-jump').addEventListener('click', () => {
        if (isPlaying && activeGame === 'runner') activeTouchControls.jump = true;
    });

    // Handle Canvas Click (primarily for Memory Match and Tic-Tac-Toe)
    canvas.addEventListener('click', e => {
        if (!isPlaying) return;
        const rect = canvas.getBoundingClientRect();
        const clickX = (e.clientX - rect.left) * (width / rect.width);
        const clickY = (e.clientY - rect.top) * (height / rect.height);
        
        handleGameClick(clickX, clickY);
    });

    // Start Game Action
    startBtn.addEventListener('click', startGame);

    function startGame() {
        isPlaying = true;
        score = 0;
        scoreVal.textContent = 0;
        gameOverlay.style.opacity = 0;
        gameOverlay.style.pointerEvents = 'none';

        const info = gameInfo[activeGame];
        if (info.hasTimer) {
            remainingTime = info.timer;
            timerVal.textContent = remainingTime;
            clearInterval(gameTimerId);
            gameTimerId = setInterval(() => {
                remainingTime--;
                timerVal.textContent = remainingTime;
                if (remainingTime <= 0) {
                    endGame(true);
                }
            }, 1000);
        }

        // Initialize specific game state
        initGame();

        // Start Loop
        cancelAnimationFrame(gameLoopId);
        gameLoopId = requestAnimationFrame(loop);
    }

    function stopGame() {
        isPlaying = false;
        clearInterval(gameTimerId);
        cancelAnimationFrame(gameLoopId);
    }

    function endGame(completed = false) {
        stopGame();
        
        // Check Highscore
        if (score > highscores[activeGame]) {
            highscores[activeGame] = score;
            localStorage.setItem(`hs_${activeGame}`, score);
            updateHighscoreDisplay();
        }

        // Show Overlay with score summary
        overlayTitle.textContent = completed ? "Hoàn Thành! 🎉" : "Game Over! 💀";
        overlayDesc.innerHTML = `Bạn đạt được: <strong>${score} điểm</strong>.<br>${completed ? "Tuyệt vời quá bạn ơi! Chơi lại để phá kỷ lục nhé!" : "Tiếc quá, hãy thử lại để đạt điểm cao hơn nhé!"}`;
        startBtn.textContent = "Chơi Lại";
        
        gameOverlay.style.opacity = 1;
        gameOverlay.style.pointerEvents = 'auto';
    }

    // Main Game Loop
    function loop() {
        if (!isPlaying) return;

        update();
        draw();

        gameLoopId = requestAnimationFrame(loop);
    }

    // ----------------------------------------------------
    // GAME MODULES IMPLEMENTATIONS
    // ----------------------------------------------------
    let gameState = {};

    function initGame() {
        gameState = {};
        
        if (activeGame === 'catcher') {
            gameState = {
                player: { x: width / 2 - 40, y: height - 60, w: 80, h: 50, speed: 7 },
                donuts: [],
                spawnTimer: 0,
                spawnRate: 40 // frames
            };
        } 
        
        else if (activeGame === 'memory') {
            const symbols = ['🍩', '🥋', '🐹', '🍰', '🏫', '🎓', '💖', '🍪'];
            const deck = [...symbols, ...symbols];
            // Shuffle
            for (let i = deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [deck[i], deck[j]] = [deck[j], deck[i]];
            }
            
            const cards = [];
            const cols = 4;
            const rows = 4;
            const cardW = 90;
            const cardH = 75;
            const gap = 15;
            const startX = (width - (cols * cardW + (cols - 1) * gap)) / 2;
            const startY = (height - (rows * cardH + (rows - 1) * gap)) / 2 + 20;

            for (let i = 0; i < deck.length; i++) {
                const col = i % cols;
                const row = Math.floor(i / cols);
                cards.push({
                    id: i,
                    symbol: deck[i],
                    x: startX + col * (cardW + gap),
                    y: startY + row * (cardH + gap),
                    w: cardW,
                    h: cardH,
                    isFlipped: false,
                    isMatched: false
                });
            }

            gameState = {
                cards: cards,
                selected: [],
                lockBoard: false,
                matchesFound: 0
            };
        } 
        
        else if (activeGame === 'karate') {
            // Stack of blocks. Top block goes up.
            const blocks = [];
            for (let i = 0; i < 6; i++) {
                blocks.push(getRandomBlock(i === 0)); // Bottom block never has branch
            }

            gameState = {
                playerSide: 'left',
                blocks: blocks,
                timeBar: 100, // percentage
                timeDrainRate: 0.15,
                gameSpeed: 1.0
            };
        } 
        
        else if (activeGame === 'runner') {
            gameState = {
                hamster: { x: 50, y: height - 100, w: 50, h: 50, vy: 0, gravity: 0.7, jumpForce: -12, isJumping: false },
                obstacles: [],
                spawnTimer: 0,
                spawnRate: 90,
                frameCounter: 0
            };
        } 
        
        else if (activeGame === 'tictactoe') {
            gameState = {
                board: Array(9).fill(null), // O = Donut, X = Cookie
                playerSymbol: 'O',
                aiSymbol: 'X',
                turn: 'player',
                winner: null,
                winningLine: null
            };
        }
    }

    function getRandomBlock(noBranch = false) {
        if (noBranch) return { branch: null };
        const rand = Math.random();
        if (rand < 0.35) return { branch: 'left' };
        if (rand < 0.7) return { branch: 'right' };
        return { branch: null };
    }

    // UPDATE LOGIC TICK
    function update() {
        if (activeGame === 'catcher') {
            // Player movement
            const player = gameState.player;
            if (keys['ArrowLeft'] || activeTouchControls.left) {
                player.x -= player.speed;
            }
            if (keys['ArrowRight'] || activeTouchControls.right) {
                player.x += player.speed;
            }
            // Constraint within board
            if (player.x < 0) player.x = 0;
            if (player.x > width - player.w) player.x = width - player.w;

            // Spawning Donuts
            gameState.spawnTimer++;
            if (gameState.spawnTimer >= gameState.spawnRate) {
                gameState.spawnTimer = 0;
                // Donut type
                const isBurnt = Math.random() < 0.22;
                const isMatcha = Math.random() > 0.6;
                gameState.donuts.push({
                    x: Math.random() * (width - 30) + 10,
                    y: -20,
                    r: 15,
                    speed: Math.random() * 3 + 3,
                    isBurnt: isBurnt,
                    isMatcha: isMatcha
                });
            }

            // Update & check collisions of donuts
            for (let i = gameState.donuts.length - 1; i >= 0; i--) {
                const donut = gameState.donuts[i];
                donut.y += donut.speed;

                // Collision with ground
                if (donut.y > height + 20) {
                    gameState.donuts.splice(i, 1);
                    continue;
                }

                // Collision with player basket
                if (donut.y + donut.r >= player.y &&
                    donut.x >= player.x &&
                    donut.x <= player.x + player.w) {
                    
                    if (donut.isBurnt) {
                        score = Math.max(0, score - 5);
                    } else if (donut.isMatcha) {
                        score += 15;
                    } else {
                        score += 10;
                    }
                    scoreVal.textContent = score;
                    gameState.donuts.splice(i, 1);
                }
            }
        } 
        
        else if (activeGame === 'karate') {
            // Drain time bar
            gameState.timeBar -= gameState.timeDrainRate * gameState.gameSpeed;
            if (gameState.timeBar <= 0) {
                endGame(false);
            }
            // Gradually increase speed
            gameState.gameSpeed += 0.0001;

            // Keyboard binds
            if (keys['ArrowLeft']) {
                keys['ArrowLeft'] = false; // prevents auto-repeating
                karateChop('left');
            }
            if (keys['ArrowRight']) {
                keys['ArrowRight'] = false;
                karateChop('right');
            }
        } 
        
        else if (activeGame === 'runner') {
            const hamster = gameState.hamster;
            gameState.frameCounter++;
            
            // Jump
            if ((keys['Space'] || keys['ArrowUp'] || activeTouchControls.jump) && !hamster.isJumping) {
                hamster.vy = hamster.jumpForce;
                hamster.isJumping = true;
                activeTouchControls.jump = false;
            }

            // Gravity physics
            hamster.vy += hamster.gravity;
            hamster.y += hamster.vy;

            // Collision with ground
            const groundY = height - 90;
            if (hamster.y > groundY) {
                hamster.y = groundY;
                hamster.vy = 0;
                hamster.isJumping = false;
            }

            // Obstacle spawning
            gameState.spawnTimer++;
            if (gameState.spawnTimer >= gameState.spawnRate) {
                gameState.spawnTimer = 0;
                // Random spawn rate to vary gaps
                gameState.spawnRate = Math.floor(Math.random() * 50) + 70;
                
                // Obstacle types: spike (Karate board) or baker roller
                const isRoller = Math.random() > 0.5;
                gameState.obstacles.push({
                    x: width + 20,
                    y: height - 90 + (isRoller ? 10 : 20),
                    w: isRoller ? 30 : 20,
                    h: isRoller ? 30 : 20,
                    speed: 5.5 + (score * 0.005),
                    isRoller: isRoller
                });
            }

            // Update obstacles & check collisions
            for (let i = gameState.obstacles.length - 1; i >= 0; i--) {
                const obs = gameState.obstacles[i];
                obs.x -= obs.speed;

                // Remove out of screen obstacles
                if (obs.x < -40) {
                    gameState.obstacles.splice(i, 1);
                    score += 5;
                    scoreVal.textContent = score;
                    continue;
                }

                // Check collision
                if (obs.x < hamster.x + hamster.w - 10 &&
                    obs.x + obs.w > hamster.x + 10 &&
                    obs.y < hamster.y + hamster.h - 5 &&
                    obs.y + obs.h > hamster.y + 5) {
                    endGame(false);
                }
            }
        }
    }

    // Handles user actions for Tic-Tac-Toe and Memory Match
    function handleGameClick(cx, cy) {
        if (activeGame === 'memory') {
            if (gameState.lockBoard) return;
            
            const cards = gameState.cards;
            for (let card of cards) {
                if (card.isFlipped || card.isMatched) continue;

                // Check if card is clicked
                if (cx >= card.x && cx <= card.x + card.w &&
                    cy >= card.y && cy <= card.y + card.h) {
                    
                    card.isFlipped = true;
                    gameState.selected.push(card);

                    // Check if two cards are flipped
                    if (gameState.selected.length === 2) {
                        gameState.lockBoard = true;
                        
                        const [card1, card2] = gameState.selected;
                        if (card1.symbol === card2.symbol) {
                            // Match!
                            card1.isMatched = true;
                            card2.isMatched = true;
                            gameState.selected = [];
                            gameState.lockBoard = false;
                            gameState.matchesFound++;
                            
                            score += 20;
                            scoreVal.textContent = score;

                            // Victory condition
                            if (gameState.matchesFound === 8) {
                                endGame(true);
                            }
                        } else {
                            // Not a match, flip back after 0.8s
                            setTimeout(() => {
                                card1.isFlipped = false;
                                card2.isFlipped = false;
                                gameState.selected = [];
                                gameState.lockBoard = false;
                            }, 800);
                        }
                    }
                    break;
                }
            }
        } 
        
        else if (activeGame === 'tictactoe') {
            if (gameState.turn !== 'player' || gameState.winner) return;

            // Identify clicked board cell
            const startX = width / 2 - 150;
            const startY = height / 2 - 130;
            const cellSize = 100;

            for (let i = 0; i < 9; i++) {
                if (gameState.board[i]) continue;

                const col = i % 3;
                const row = Math.floor(i / 3);
                const cellX = startX + col * cellSize;
                const cellY = startY + row * cellSize;

                if (cx >= cellX && cx <= cellX + cellSize &&
                    cy >= cellY && cy <= cellY + cellSize) {
                    
                    // Place army
                    gameState.board[i] = gameState.playerSymbol;
                    checkTicTacToeState();

                    if (!gameState.winner) {
                        gameState.turn = 'ai';
                        // AI moves with 0.5s delay
                        setTimeout(aiTicTacToeMove, 500);
                    }
                    break;
                }
            }
        }
    }

    // AI logic for Tic-Tac-Toe
    function aiTicTacToeMove() {
        if (!isPlaying || activeGame !== 'tictactoe' || gameState.winner) return;

        const board = gameState.board;
        let move = -1;

        // 1. Can AI win on this turn?
        move = findTicTacToeWinningMove(gameState.aiSymbol);
        
        // 2. Can AI block player from winning?
        if (move === -1) {
            move = findTicTacToeWinningMove(gameState.playerSymbol);
        }

        // 3. Fallback: random move
        if (move === -1) {
            const empties = [];
            for (let i = 0; i < 9; i++) {
                if (!board[i]) empties.push(i);
            }
            if (empties.length > 0) {
                move = empties[Math.floor(Math.random() * empties.length)];
            }
        }

        if (move !== -1) {
            board[move] = gameState.aiSymbol;
            checkTicTacToeState();
            gameState.turn = 'player';
        }
    }

    function findTicTacToeWinningMove(symbol) {
        const board = gameState.board;
        const winLines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
            [0, 4, 8], [2, 4, 6]             // diagonals
        ];

        for (let line of winLines) {
            const [a, b, c] = line;
            if (board[a] === symbol && board[b] === symbol && !board[c]) return c;
            if (board[a] === symbol && board[c] === symbol && !board[b]) return b;
            if (board[b] === symbol && board[c] === symbol && !board[a]) return a;
        }
        return -1;
    }

    function checkTicTacToeState() {
        const board = gameState.board;
        const winLines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
            [0, 4, 8], [2, 4, 6]             // diagonals
        ];

        for (let line of winLines) {
            const [a, b, c] = line;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                gameState.winner = board[a];
                gameState.winningLine = line;
                break;
            }
        }

        // Draw?
        if (!gameState.winner && board.every(cell => cell !== null)) {
            gameState.winner = 'draw';
        }

        if (gameState.winner) {
            if (gameState.winner === gameState.playerSymbol) {
                score = 50; // Win points
                scoreVal.textContent = score;
                setTimeout(() => endGame(true), 1200);
            } else if (gameState.winner === 'draw') {
                score = 20; // Draw points
                scoreVal.textContent = score;
                setTimeout(() => endGame(true), 1200);
            } else {
                score = 0; // Lose
                scoreVal.textContent = score;
                setTimeout(() => endGame(false), 1200);
            }
        }
    }

    // Chop Wood Action
    function karateChop(side) {
        if (!isPlaying || activeGame !== 'karate') return;

        // Change side
        gameState.playerSide = side;

        // Check if player hits branch
        const bottomBlock = gameState.blocks[0];
        if (bottomBlock.branch === side) {
            // Collision with branch! Game Over
            endGame(false);
            return;
        }

        // Chop success! Remove bottom block, slide tree down, add new top block
        gameState.blocks.shift();
        gameState.blocks.push(getRandomBlock(false));

        // Recheck if new bottom block branch hits player
        const nextBlock = gameState.blocks[0];
        if (nextBlock.branch === side) {
            endGame(false);
            return;
        }

        // Add score and restore time bar
        score += 10;
        scoreVal.textContent = score;
        gameState.timeBar = Math.min(100, gameState.timeBar + 6);
    }

    // DRAW GRAPHICS RENDER
    function draw() {
        ctx.clearRect(0, 0, width, height);

        // Dark retro background
        ctx.fillStyle = "#161621";
        ctx.fillRect(0, 0, width, height);

        if (activeGame === 'catcher') {
            // Draw floor
            ctx.fillStyle = "#2d2d3e";
            ctx.fillRect(0, height - 10, width, 10);

            // Draw player (Hamster vector shape)
            const player = gameState.player;
            
            // Glow effect
            ctx.shadowBlur = 15;
            ctx.shadowColor = "#ffb5a7";

            // Head/Body
            ctx.fillStyle = "#f8d7da";
            ctx.beginPath();
            ctx.ellipse(player.x + player.w/2, player.y + 25, player.w/2 - 2, 22, 0, 0, 2 * Math.PI);
            ctx.fill();

            // Ears
            ctx.fillStyle = "#f5b7b1";
            ctx.beginPath();
            ctx.arc(player.x + 15, player.y + 8, 8, 0, 2 * Math.PI);
            ctx.arc(player.x + player.w - 15, player.y + 8, 8, 0, 2 * Math.PI);
            ctx.fill();

            // Reset glow
            ctx.shadowBlur = 0;

            // Eyes
            ctx.fillStyle = "#2d3748";
            ctx.beginPath();
            ctx.arc(player.x + 24, player.y + 20, 4, 0, 2 * Math.PI);
            ctx.arc(player.x + player.w - 24, player.y + 20, 4, 0, 2 * Math.PI);
            ctx.fill();

            // Cheeks
            ctx.fillStyle = "#ffb5a7";
            ctx.beginPath();
            ctx.arc(player.x + 16, player.y + 26, 5, 0, 2 * Math.PI);
            ctx.arc(player.x + player.w - 16, player.y + 26, 5, 0, 2 * Math.PI);
            ctx.fill();

            // Basket container rim
            ctx.fillStyle = "#b5e2fa";
            ctx.fillRect(player.x - 4, player.y - 4, player.w + 8, 8);

            // Falling Donuts
            gameState.donuts.forEach(donut => {
                ctx.save();
                
                ctx.shadowBlur = 8;
                ctx.shadowColor = donut.isBurnt ? "#000000" : (donut.isMatcha ? "#a8dadc" : "#ffb5a7");

                // Main Circle
                ctx.fillStyle = donut.isBurnt ? "#2d2d2d" : (donut.isMatcha ? "#99e2b4" : "#ffcad4");
                ctx.beginPath();
                ctx.arc(donut.x, donut.y, donut.r, 0, 2 * Math.PI);
                ctx.fill();

                // Inner Hole
                ctx.fillStyle = "#161621";
                ctx.beginPath();
                ctx.arc(donut.x, donut.y, donut.r / 3, 0, 2 * Math.PI);
                ctx.fill();

                // Sprinkles (if not burnt)
                if (!donut.isBurnt) {
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(donut.x - 6, donut.y - 6, 3, 1.5);
                    ctx.fillStyle = "#ffe83f";
                    ctx.fillRect(donut.x + 3, donut.y + 2, 3, 1.5);
                    ctx.fillStyle = "#ff5d8f";
                    ctx.fillRect(donut.x - 3, donut.y + 5, 1.5, 3);
                }

                ctx.restore();
            });
        } 
        
        else if (activeGame === 'memory') {
            const cards = gameState.cards;
            cards.forEach(card => {
                if (card.isMatched) {
                    // Transparent match state
                    ctx.strokeStyle = "rgba(162, 210, 255, 0.2)";
                    ctx.lineWidth = 1;
                    ctx.strokeRect(card.x, card.y, card.w, card.h);
                    return;
                }

                if (card.isFlipped) {
                    // Card Front
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(card.x, card.y, card.w, card.h);
                    ctx.strokeStyle = "#ffe83f";
                    ctx.lineWidth = 3;
                    ctx.strokeRect(card.x, card.y, card.w, card.h);

                    // Symbol text
                    ctx.font = "32px Arial";
                    ctx.textAlign = "center";
                    ctx.fillStyle = "#000000";
                    ctx.fillText(card.symbol, card.x + card.w/2, card.y + card.h/2 + 10);
                } else {
                    // Card Back
                    ctx.fillStyle = "#2d2d3e";
                    ctx.fillRect(card.x, card.y, card.w, card.h);
                    ctx.strokeStyle = "#a2d2ff";
                    ctx.lineWidth = 2;
                    ctx.strokeRect(card.x, card.y, card.w, card.h);

                    // Cute question mark
                    ctx.font = "24px Outfit, sans-serif";
                    ctx.textAlign = "center";
                    ctx.fillStyle = "#a2d2ff";
                    ctx.fillText("?", card.x + card.w/2, card.y + card.h/2 + 8);
                }
            });
        } 
        
        else if (activeGame === 'karate') {
            // Draw Tree Trunk Center Column
            const trunkX = width / 2 - 35;
            const trunkW = 70;
            const blockH = 50;

            // Draw stack of blocks (bottom to top)
            for (let i = 0; i < gameState.blocks.length; i++) {
                const block = gameState.blocks[i];
                const blockY = height - 90 - (i * blockH);

                // Draw Wood block
                ctx.fillStyle = "#8b5a2b";
                ctx.fillRect(trunkX, blockY, trunkW, blockH);
                ctx.strokeStyle = "#5c3a21";
                ctx.lineWidth = 2;
                ctx.strokeRect(trunkX, blockY, trunkW, blockH);

                // Texture lines on wood
                ctx.strokeStyle = "#704829";
                ctx.beginPath();
                ctx.moveTo(trunkX + 15, blockY + 10);
                ctx.lineTo(trunkX + 15, blockY + 40);
                ctx.moveTo(trunkX + 45, blockY + 5);
                ctx.lineTo(trunkX + 45, blockY + 45);
                ctx.stroke();

                // Draw branches
                if (block.branch) {
                    ctx.fillStyle = "#a2754f";
                    const isLeft = block.branch === 'left';
                    const branchX = isLeft ? trunkX - 70 : trunkX + trunkW;
                    const branchY = blockY + 12;
                    const branchW = 70;
                    const branchH = 20;

                    ctx.fillRect(branchX, branchY, branchW, branchH);
                    ctx.strokeStyle = "#5c3a21";
                    ctx.strokeRect(branchX, branchY, branchW, branchH);

                    // Red tip warning for threat
                    ctx.fillStyle = "#ff5d8f";
                    const tipX = isLeft ? branchX : branchX + branchW - 10;
                    ctx.fillRect(tipX, branchY, 10, branchH);
                }
            }

            // Draw floor/dirt
            ctx.fillStyle = "#2d2d3e";
            ctx.fillRect(0, height - 40, width, 40);

            // Draw Time bar at top
            ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
            ctx.fillRect(width / 2 - 100, 20, 200, 15);
            ctx.fillStyle = gameState.timeBar < 25 ? "#ff5d8f" : "#99e2b4";
            ctx.fillRect(width / 2 - 100, 20, (gameState.timeBar / 100) * 200, 15);

            // Draw player (Chop pose)
            const isLeft = gameState.playerSide === 'left';
            const playerX = isLeft ? trunkX - 60 : trunkX + trunkW + 20;
            const playerY = height - 95;

            // Draw simple cute Karate Gi player
            ctx.fillStyle = "#ffffff"; // Gi jacket
            ctx.beginPath();
            ctx.arc(playerX + 20, playerY, 15, 0, 2 * Math.PI); // Head
            ctx.fill();

            // Head cover hair
            ctx.fillStyle = "#2d3748";
            ctx.beginPath();
            ctx.arc(playerX + 20, playerY - 4, 15, Math.PI, 2 * Math.PI);
            ctx.fill();

            // Body
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(playerX + 5, playerY + 15, 30, 45);
            
            // Karate Belt (Yellow Belt)
            ctx.fillStyle = "#ffe83f";
            ctx.fillRect(playerX + 3, playerY + 35, 34, 7);

            // Chop arm
            ctx.strokeStyle = "#f8d7da";
            ctx.lineWidth = 6;
            ctx.beginPath();
            if (isLeft) {
                ctx.moveTo(playerX + 25, playerY + 22);
                ctx.lineTo(playerX + 50, playerY + 20); // chopping right towards tree
            } else {
                ctx.moveTo(playerX + 15, playerY + 22);
                ctx.lineTo(playerX - 10, playerY + 20); // chopping left towards tree
            }
            ctx.stroke();
        } 
        
        else if (activeGame === 'runner') {
            // Draw sky/background objects
            ctx.fillStyle = "#1e1e2f";
            ctx.fillRect(0, 0, width, height - 90);

            // Draw ground
            ctx.fillStyle = "#2c2c38";
            ctx.fillRect(0, height - 90, width, 90);
            ctx.fillStyle = "#a2d2ff"; // ground lines
            ctx.fillRect(0, height - 90, width, 4);

            // Draw Hamster Runner
            const hamster = gameState.hamster;
            ctx.save();

            // Running oscillation
            const offset = hamster.isJumping ? 0 : Math.sin(gameState.frameCounter * 0.25) * 3;

            // Head/Body
            ctx.fillStyle = "#f8d7da";
            ctx.beginPath();
            ctx.ellipse(hamster.x + 25, hamster.y + 25 + offset, 23, 20, 0, 0, 2 * Math.PI);
            ctx.fill();

            // Hair/Cap
            ctx.fillStyle = "#f5b7b1";
            ctx.beginPath();
            ctx.arc(hamster.x + 10, hamster.y + 12 + offset, 6, 0, 2 * Math.PI);
            ctx.arc(hamster.x + 40, hamster.y + 12 + offset, 6, 0, 2 * Math.PI);
            ctx.fill();

            // Eye
            ctx.fillStyle = "#2d3748";
            ctx.beginPath();
            ctx.arc(hamster.x + 36, hamster.y + 22 + offset, 3.5, 0, 2 * Math.PI);
            ctx.fill();

            // Feet
            ctx.fillStyle = "#ffe5d9";
            if (!hamster.isJumping) {
                const footOffset = Math.sin(gameState.frameCounter * 0.25) * 5;
                ctx.fillRect(hamster.x + 12, hamster.y + 42 + footOffset, 8, 8);
                ctx.fillRect(hamster.x + 28, hamster.y + 42 - footOffset, 8, 8);
            } else {
                ctx.fillRect(hamster.x + 12, hamster.y + 42, 8, 6);
                ctx.fillRect(hamster.x + 28, hamster.y + 42, 8, 6);
            }

            ctx.restore();

            // Draw Obstacles
            gameState.obstacles.forEach(obs => {
                ctx.save();
                
                ctx.shadowBlur = 10;
                ctx.shadowColor = obs.isRoller ? "#ffcad4" : "#ffe83f";

                if (obs.isRoller) {
                    // Draw Rolling pin (Baker roller)
                    ctx.fillStyle = "#e8e8e8";
                    ctx.fillRect(obs.x, obs.y + 8, obs.w, 14);
                    // Handles
                    ctx.fillStyle = "#8b5a2b";
                    ctx.fillRect(obs.x - 8, obs.y + 12, 8, 6);
                    ctx.fillRect(obs.x + obs.w, obs.y + 12, 8, 6);
                } else {
                    // Draw Karate Training Board
                    ctx.fillStyle = "#e9c46a";
                    ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
                    ctx.strokeStyle = "#8b5a2b";
                    ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
                    // Split line in middle showing crackable board
                    ctx.strokeStyle = "#e76f51";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(obs.x + obs.w / 2, obs.y);
                    ctx.lineTo(obs.x + obs.w / 2, obs.y + obs.h);
                    ctx.stroke();
                }

                ctx.restore();
            });
        } 
        
        else if (activeGame === 'tictactoe') {
            const startX = width / 2 - 150;
            const startY = height / 2 - 130;
            const cellSize = 100;

            // Draw grid lines
            ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
            ctx.lineWidth = 6;
            ctx.lineCap = "round";

            // Verticals
            ctx.beginPath();
            ctx.moveTo(startX + cellSize, startY);
            ctx.lineTo(startX + cellSize, startY + 300);
            ctx.moveTo(startX + 2 * cellSize, startY);
            ctx.lineTo(startX + 2 * cellSize, startY + 300);
            
            // Horizontals
            ctx.moveTo(startX, startY + cellSize);
            ctx.lineTo(startX + 300, startY + cellSize);
            ctx.moveTo(startX, startY + 2 * cellSize);
            ctx.lineTo(startX + 300, startY + 2 * cellSize);
            ctx.stroke();

            // Draw marks
            const board = gameState.board;
            for (let i = 0; i < 9; i++) {
                if (!board[i]) continue;

                const col = i % 3;
                const row = Math.floor(i / 3);
                const cellX = startX + col * cellSize;
                const cellY = startY + row * cellSize;
                const centerX = cellX + cellSize / 2;
                const centerY = cellY + cellSize / 2;

                ctx.save();
                ctx.shadowBlur = 8;

                if (board[i] === 'O') {
                    // Draw Donut 🍩 (O)
                    ctx.shadowColor = "#ffcad4";
                    ctx.fillStyle = "#ffcad4";
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
                    ctx.fill();
                    
                    // inner hole
                    ctx.fillStyle = "#161621";
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
                    ctx.fill();

                    // frosting sprinkles
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(centerX - 10, centerY - 10, 3, 2);
                    ctx.fillStyle = "#ffe83f";
                    ctx.fillRect(centerX + 6, centerY + 6, 3, 2);
                } else {
                    // Draw Cookie 🍪 (X)
                    ctx.shadowColor = "#ffe83f";
                    ctx.fillStyle = "#e9c46a";
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
                    ctx.fill();

                    // chocolate chips
                    ctx.fillStyle = "#5c3a21";
                    ctx.fillRect(centerX - 12, centerY - 8, 4, 4);
                    ctx.fillRect(centerX + 8, centerY - 12, 4, 4);
                    ctx.fillRect(centerX - 4, centerY + 10, 4, 4);
                    ctx.fillRect(centerX + 10, centerY + 8, 4, 4);
                    ctx.fillRect(centerX - 2, centerY - 2, 4, 4);
                }
                ctx.restore();
            }

            // Draw winning line if exists
            if (gameState.winner && gameState.winner !== 'draw' && gameState.winningLine) {
                const [a, b, c] = gameState.winningLine;
                const startCol = a % 3;
                const startRow = Math.floor(a / 3);
                const endCol = c % 3;
                const endRow = Math.floor(c / 3);

                const lineStartX = startX + startCol * cellSize + cellSize / 2;
                const lineStartY = startY + startRow * cellSize + cellSize / 2;
                const lineEndX = startX + endCol * cellSize + cellSize / 2;
                const lineEndY = startY + endRow * cellSize + cellSize / 2;

                ctx.strokeStyle = "#ff5d8f";
                ctx.lineWidth = 10;
                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(lineStartX, lineStartY);
                ctx.lineTo(lineEndX, lineEndY);
                ctx.stroke();
            }
        }
    }

    // Default Initialization
    updateGameInfo();
});
