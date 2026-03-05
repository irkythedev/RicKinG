window.DodgeGame = class DodgeGame extends BaseGame {
    constructor(containerId, updateUI) {
        super(containerId);
        this.updateUI = updateUI;
        this.player = { x: 0, y: 0, width: 40, height: 40, speed: 0 };
        this.items = []; // Falling items
        this.survivalTime = 0;
        this.difficultyMultiplier = 1;
        
        // Pre-load images (simulated with colored rects/text for now to ensure no loading issues)
    }

    start() {
        super.start();
        this.survivalTime = 0;
        this.items = [];
        this.difficultyMultiplier = 1;
        this.player.x = this.width / 2;
        this.player.y = this.height - 60;
        this.player.speed = GAME_CONFIG.DODGE_GAME.PLAYER_SPEED;
        this.player.dash = false;
        
        playSound('shot'); // Start sound
    }

    update(deltaTime) {
        if (!this.gameActive) return;
        
        const dt = deltaTime / 16.67; // Normalize to ~60fps
        
        // 1. Update Timer & Difficulty
        this.survivalTime += deltaTime / 1000;
        this.difficultyMultiplier = 1 + (this.survivalTime * 0.05);
        
        const lang = window.getComputedLang ? window.getComputedLang() : currentLang;
        this.updateUI('timer', this.survivalTime.toFixed(1) + I18N[lang].game.seconds);

        // 2. Player Movement (Mouse/Touch follows x, Keyboard uses arrow keys)
        // Hybrid control: if mouse moved recently, follow mouse. If keys pressed, use keys.
        
        let moveSpeed = this.player.speed;
        
        // Dash (Shift or double tap logic could be added)
        if (this.input.keys['ShiftLeft'] || this.input.keys['ShiftRight']) {
            moveSpeed *= 2;
            this.player.dash = true;
        } else {
            this.player.dash = false;
        }

        if (this.input.keys['ArrowLeft'] || this.input.keys['KeyA']) {
            this.player.x -= moveSpeed * dt;
        } else if (this.input.keys['ArrowRight'] || this.input.keys['KeyD']) {
            this.player.x += moveSpeed * dt;
        } else {
            // Smooth follow mouse/touch x
            const targetX = this.input.x;
            const diff = targetX - this.player.x;
            if (Math.abs(diff) > 2) {
                this.player.x += diff * 0.2 * dt; // Lerp
            }
        }

        // Clamp player
        const half = this.player.width / 2;
        if (this.player.x < half) this.player.x = half;
        if (this.player.x > this.width - half) this.player.x = this.width - half;

        // 3. Spawn Items
        if (Math.random() < GAME_CONFIG.DODGE_GAME.SPAWN_RATE * this.difficultyMultiplier) {
            this.spawnItem();
        }

        // 4. Update Items
        for (let i = this.items.length - 1; i >= 0; i--) {
            let item = this.items[i];
            item.y += item.speed * this.difficultyMultiplier * dt;
            item.angle += 0.05;

            // Tracking logic
            if (item.tracking) {
                const diffX = this.player.x - item.x;
                item.x += Math.sign(diffX) * 1 * dt; // Slow tracking
            }

            // Collision
            if (this.checkCollision(this.player, item)) {
                this.handleCollision(item);
                this.items.splice(i, 1);
                continue;
            }

            // Remove if off screen
            if (item.y > this.height) {
                this.items.splice(i, 1);
            }
        }
    }

    spawnItem() {
        const rand = Math.random();
        let type = 'bomb';
        let color = '#ef4444'; // Red
        let speed = GAME_CONFIG.DODGE_GAME.ITEM_SPEED_BASE + Math.random() * 2;
        let tracking = false;
        
        if (rand > 0.85) { // Adjusted rates
            type = 'airdrop'; // Good
            color = '#3b82f6'; // Blue
        } else if (rand > 0.96) {
            type = 'medkit'; // Very Good
            color = '#22c55e'; // Green
        } else {
            // Bomb variant: Homing Missile (Rarely appears after 20s)
            if (this.survivalTime > 20 && Math.random() > 0.7) {
                tracking = true;
                color = '#7f1d1d'; // Dark Red
                speed *= 0.8; // Slower but tracks
            }
        }

        this.items.push({
            x: Math.random() * (this.width - 40) + 20,
            y: -30,
            width: 30,
            height: 30,
            type: type,
            color: color,
            speed: speed,
            angle: 0,
            tracking: tracking
        });
    }

    checkCollision(player, item) {
        // Simple circle/box collision
        const dx = player.x - item.x;
        const dy = player.y - item.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < (player.width/2 + item.width/2);
    }

    handleCollision(item) {
        if (item.type === 'bomb') {
            this.end();
        } else if (item.type === 'airdrop') {
            this.score += 100;
            this.updateUI('score', this.score);
            playSound('hit');
        } else if (item.type === 'medkit') {
            this.score += 500;
            this.updateUI('score', this.score);
            playSound('hit');
        }
    }

    draw() {
        super.draw();

        // Draw Player
        this.ctx.save();
        this.ctx.translate(this.player.x, this.player.y);
        
        // Draw simple player character (Yellow box with helmet style)
        this.ctx.fillStyle = '#eab308';
        this.ctx.fillRect(-20, -20, 40, 40);
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(-15, -15, 10, 5); // Visor
        this.ctx.fillRect(5, -15, 10, 5);
        
        this.ctx.restore();

        // Draw Items
        this.items.forEach(item => {
            this.ctx.save();
            this.ctx.translate(item.x, item.y);
            this.ctx.rotate(item.angle);
            
            this.ctx.fillStyle = item.color;
            if (item.type === 'bomb') {
                // Draw Bomb (Circle)
                this.ctx.beginPath();
                this.ctx.arc(0, 0, 15, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.fillStyle = '#000';
                this.ctx.font = '16px serif'; // Ensure font is set for emoji
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('💣', 0, 2); // Center emoji
            } else if (item.type === 'airdrop') {
                // Draw Box
                this.ctx.fillRect(-15, -15, 30, 30);
                this.ctx.fillStyle = '#fff';
                this.ctx.fillRect(-15, -5, 30, 10); // Strap
            } else {
                // Medkit
                this.ctx.fillRect(-15, -12, 30, 24);
                this.ctx.fillStyle = '#fff';
                this.ctx.fillRect(-5, -8, 10, 16);
                this.ctx.fillRect(-10, -3, 20, 6);
            }
            
            this.ctx.restore();
        });
    }

    end() {
        playSound('gameover');
        const lang = window.getComputedLang ? window.getComputedLang() : currentLang;
        const t = I18N[lang].game;
        
        this.resultData = {
            title: t.crash,
            desc: `${t.survive} ${this.survivalTime.toFixed(2)}${t.seconds}`,
            rank: null
        };
        
        super.end();
    }
}
