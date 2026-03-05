window.AimGame = class AimGame extends BaseGame {
    constructor(containerId, updateUI) {
        super(containerId);
        this.updateUI = updateUI;
        
        // Game State
        this.targets = [];
        this.particles = []; // For explosions
        this.ammo = GAME_CONFIG.AIM_GAME.MAX_AMMO;
        this.isReloading = false;
        this.spawnTimer = 0;
        
        // Assets (using simple colors/shapes for canvas to ensure performance, or pre-loaded images)
        // We will draw simple shapes for reliability
    }

    start() {
        super.start();
        this.timeLeft = GAME_CONFIG.AIM_GAME.TIME;
        this.ammo = GAME_CONFIG.AIM_GAME.MAX_AMMO;
        this.isReloading = false;
        this.targets = [];
        this.particles = [];
        
        this.updateUI('timer', this.timeLeft);
        this.updateUI('score', this.score);
        
        // Timer countdown
        this.gameTimer = setInterval(() => {
            if (!this.gameActive) {
                clearInterval(this.gameTimer);
                return;
            }
            this.timeLeft--;
            this.updateUI('timer', this.timeLeft);
            if (this.timeLeft <= 0) {
                this.end();
            }
        }, 1000);
    }

    update(deltaTime) {
        if (!this.gameActive) return;

        // Spawn Targets
        this.spawnTimer += deltaTime;
        if (this.spawnTimer > GAME_CONFIG.AIM_GAME.SPAWN_INTERVAL) {
            this.spawnTarget();
            this.spawnTimer = 0;
        }

        // Update Targets
        for (let i = this.targets.length - 1; i >= 0; i--) {
            const t = this.targets[i];
            t.x += t.vx;
            t.y += t.vy;
            t.life -= deltaTime;

            // Bounce off walls
            if (t.x < 0 || t.x > this.width) t.vx *= -1;
            if (t.y < 0 || t.y > this.height) t.vy *= -1;

            if (t.life <= 0) {
                this.targets.splice(i, 1);
            }
        }

        // Update Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= deltaTime;
            p.x += p.vx;
            p.y += p.vy;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        // Input Handling (Shooting)
        if (this.input.clicked) {
            this.shoot();
        }

        // Reload Input (R key)
        if (this.input.keys['KeyR'] && !this.isReloading && this.ammo < GAME_CONFIG.AIM_GAME.MAX_AMMO) {
            this.reload();
        }
    }

    spawnTarget() {
        const size = 30 + Math.random() * 20;
        const speed = GAME_CONFIG.AIM_GAME.TARGET_SPEED_MIN + Math.random() * (GAME_CONFIG.AIM_GAME.TARGET_SPEED_MAX - GAME_CONFIG.AIM_GAME.TARGET_SPEED_MIN);
        const angle = Math.random() * Math.PI * 2;
        
        this.targets.push({
            x: Math.random() * (this.width - size * 2) + size,
            y: Math.random() * (this.height - size * 2) + size,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: size / 2,
            type: Math.random() > 0.8 ? 'rare' : 'normal',
            life: 3000 // 3 seconds
        });
    }

    shoot() {
        if (this.isReloading) return;

        if (this.ammo <= 0) {
            // Play dry fire sound or show message
            this.showFloatingText(I18N[currentLang].game.noAmmo, this.input.x, this.input.y, '#ef4444');
            return;
        }

        this.ammo--;
        playSound('shot');
        
        // Check hits
        let hit = false;
        for (let i = this.targets.length - 1; i >= 0; i--) {
            const t = this.targets[i];
            const dx = this.input.x - t.x;
            const dy = this.input.y - t.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < t.radius) {
                hit = true;
                const points = t.type === 'rare' ? 50 : 10;
                this.score += points;
                this.updateUI('score', this.score);
                playSound('hit');
                this.createExplosion(t.x, t.y, t.type === 'rare' ? '#fbbf24' : '#ffffff');
                this.targets.splice(i, 1);
                break; // Only hit one at a time
            }
        }
    }

    reload() {
        this.isReloading = true;
        playSound('reload'); // Assume we added this sound
        this.showFloatingText(I18N[currentLang].game.reload, this.width / 2, this.height / 2, '#fbbf24');
        
        setTimeout(() => {
            if (!this.gameActive) return;
            this.ammo = GAME_CONFIG.AIM_GAME.MAX_AMMO;
            this.isReloading = false;
        }, GAME_CONFIG.AIM_GAME.RELOAD_TIME);
    }

    createExplosion(x, y, color) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                life: 500,
                color: color,
                size: Math.random() * 3 + 1
            });
        }
    }

    showFloatingText(text, x, y, color) {
        // Simple way: draw text in draw loop for a duration, or just use DOM overlay
        // Since we are in Canvas mode, let's add a text particle
        this.particles.push({
            x: x,
            y: y,
            vx: 0,
            vy: -1,
            life: 800,
            text: text,
            color: color,
            type: 'text'
        });
    }

    draw() {
        super.draw();
        
        // Draw Targets
        this.targets.forEach(t => {
            this.ctx.beginPath();
            this.ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = t.type === 'rare' ? '#fbbf24' : '#ef4444'; // Yellow or Red
            this.ctx.fill();
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Inner circle
            this.ctx.beginPath();
            this.ctx.arc(t.x, t.y, t.radius * 0.6, 0, Math.PI * 2);
            this.ctx.fillStyle = '#fff';
            this.ctx.fill();
            
            // Bullseye
            this.ctx.beginPath();
            this.ctx.arc(t.x, t.y, t.radius * 0.3, 0, Math.PI * 2);
            this.ctx.fillStyle = '#000';
            this.ctx.fill();
        });

        // Draw Particles
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life / 500;
            if (p.type === 'text') {
                this.ctx.font = 'bold 20px "Segoe UI"';
                this.ctx.fillStyle = p.color;
                this.ctx.textAlign = 'center';
                this.ctx.fillText(p.text, p.x, p.y);
            } else {
                this.ctx.fillStyle = p.color;
                this.ctx.fillRect(p.x, p.y, p.size, p.size);
            }
            this.ctx.globalAlpha = 1;
        });

        // Draw HUD (Ammo)
        this.drawHUD();

        // Draw Crosshair
        this.drawCrosshair();
    }

    drawHUD() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(10, this.height - 50, 140, 40);
        
        this.ctx.font = '16px monospace';
        this.ctx.fillStyle = this.ammo === 0 ? '#ef4444' : '#fbbf24';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`AMMO: ${this.ammo} / ${GAME_CONFIG.AIM_GAME.MAX_AMMO}`, 20, this.height - 25);
        
        if (this.isReloading) {
            this.ctx.fillStyle = '#fff';
            this.ctx.fillText('RELOADING...', 20, this.height - 55);
        }
    }

    drawCrosshair() {
        const x = this.input.x;
        const y = this.input.y;
        
        this.ctx.strokeStyle = '#0f0';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 15, 0, Math.PI * 2);
        this.ctx.moveTo(x - 20, y);
        this.ctx.lineTo(x + 20, y);
        this.ctx.moveTo(x, y - 20);
        this.ctx.lineTo(x, y + 20);
        this.ctx.stroke();
    }

    end() {
        super.end();
        clearInterval(this.gameTimer);
        playSound('gameover');
        const lang = window.getComputedLang ? window.getComputedLang() : currentLang;
        const t = I18N[lang].game;
        alert(`${t.over}\n${t.score} ${this.score}\n${t.rank} ${this.getRank(this.score)}`);
    }

    getRank(score) {
        const lang = window.getComputedLang ? window.getComputedLang() : currentLang;
        const t = I18N[lang].game.ranks;
        if (score > 1000) return t.conqueror;
        if (score > 600) return t.ace;
        if (score > 300) return t.crown;
        return t.bronze;
    }
}