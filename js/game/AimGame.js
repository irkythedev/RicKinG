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
        this.combo = 0; // Combo counter
        this.gamePhase = 'TEACHING'; // TEACHING, NORMAL, POISON
        this.safeZoneRadius = 1000;

        // Assets
        // We will draw simple shapes for reliability
    }

    start() {
        super.start();
        this.timeLeft = GAME_CONFIG.AIM_GAME.TIME;
        this.ammo = GAME_CONFIG.AIM_GAME.MAX_AMMO;
        this.isReloading = false;
        this.targets = [];
        this.particles = [];
        this.combo = 0;
        this.powerupTimer = 0; // Infinite ammo powerup
        this.windTimer = 0; // Wind event
        this.windStrength = 0;
        this.safeZoneRadius = Math.max('1000', this.width, this.height);

        this.updateUI('timer', this.timeLeft);
        this.updateUI('score', this.score);

        // Use rAF based timer in update loop instead of setInterval to avoid drift
        this.timerAccumulator = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);
        if (!this.gameActive) return;

        // Powerup timer
        if (this.powerupTimer > 0) {
            this.powerupTimer -= deltaTime / 1000;
            if (this.powerupTimer <= 0) this.powerupTimer = 0;
        }

        // Timer Logic & Phase State Mechanism
        this.timerAccumulator += deltaTime;
        while (this.timerAccumulator >= 1000) {
            this.timeLeft--;
            this.updateUI('timer', this.timeLeft);
            this.timerAccumulator -= 1000;
            if (this.timeLeft <= 0) {
                this.end();
                return;
            }
        }

        const passedTime = GAME_CONFIG.AIM_GAME.TIME - this.timeLeft;
        if (passedTime < 5) this.gamePhase = 'TEACHING';
        else if (passedTime < 30) this.gamePhase = 'NORMAL';
        else this.gamePhase = 'POISON';

        // Poison Logic
        if (this.gamePhase === 'POISON') {
            const poisonProgress = (passedTime - 30) / (GAME_CONFIG.AIM_GAME.TIME - 30);
            const startR = Math.max(this.width, this.height);
            const endR = 80; // Final safe zone size
            this.safeZoneRadius = startR - (startR - endR) * poisonProgress;
        }

        // Spawn Targets (vary by phase)
        this.spawnTimer += deltaTime;
        let currentSpawnInterval = GAME_CONFIG.AIM_GAME.SPAWN_INTERVAL;
        if (this.gamePhase === 'TEACHING') currentSpawnInterval *= 1.5; // Slower spawn
        if (this.gamePhase === 'POISON') currentSpawnInterval *= 0.8;   // Faster spawn

        if (this.spawnTimer > currentSpawnInterval) {
            this.spawnTarget();
            this.spawnTimer = 0;
        }

        // Wind logic
        if (this.gamePhase !== 'TEACHING') {
            if (this.windTimer > 0) {
                this.windTimer -= deltaTime / 1000;
                if (this.windTimer <= 0) this.windStrength = 0;
            } else if (Math.random() < 0.002) { // Random wind event
                this.windTimer = 2 + Math.random() * 3;
                this.windStrength = (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random() * 2);
                this.showFloatingText(`WIND ${this.windStrength > 0 ? '>>>' : '<<<'}`, this.width / 2, 80, '#60a5fa');
            }
        }

        // Update Targets
        for (let i = this.targets.length - 1; i >= 0; i--) {
            const t = this.targets[i];

            // Pre-aim tracking
            const dx = this.input.x - t.x;
            const dy = this.input.y - t.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < t.radius) {
                t.hoverTime += deltaTime;
            } else {
                t.hoverTime = 0;
            }

            t.x += t.vx + this.windStrength; // Apply wind
            t.y += t.vy;
            t.life -= deltaTime;

            // Bounce off walls
            if (t.x < t.radius || t.x > this.width - t.radius) t.vx *= -1;
            if (t.y < t.radius || t.y > this.height - t.radius) t.vy *= -1;

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

        // Input Handling (Shooting & Reloading Support for Touch)
        if (this.input.clicked) {
            // If user clicked/tapped inside the bottom HUD area (y > height - 60)
            if (this.input.y > this.height - 60) {
                if (!this.isReloading && this.ammo < GAME_CONFIG.AIM_GAME.MAX_AMMO) {
                    this.reload();
                }
            } else {
                this.shoot();
            }
        }

        // Reload Input (R key for desktop)
        if (this.input.keys['KeyR'] && !this.isReloading && this.ammo < GAME_CONFIG.AIM_GAME.MAX_AMMO) {
            this.reload();
        }
    }

    spawnTarget() {
        let size = 30 + Math.random() * 20;
        let speed = GAME_CONFIG.AIM_GAME.TARGET_SPEED_MIN + Math.random() * (GAME_CONFIG.AIM_GAME.TARGET_SPEED_MAX - GAME_CONFIG.AIM_GAME.TARGET_SPEED_MIN);
        if (this.gamePhase === 'TEACHING') {
            size *= 1.2; // bigger targets
            speed *= 0.6; // slower moves
        }
        const angle = Math.random() * Math.PI * 2;

        // Ensure spawn strictly inside safe zone and outside HUD (bottom 60px)
        let startX = Math.random() * (this.width - size * 2) + size;
        let startY = Math.random() * (this.height - 65 - size * 2) + size; // Leave buffer for bottom HUD

        if (this.gamePhase === 'POISON') {
            const maxR = this.safeZoneRadius * 0.8;
            const r = Math.random() * maxR;
            const theta = Math.random() * Math.PI * 2;
            startX = this.width / 2 + Math.cos(theta) * r;
            startY = this.height / 2 + Math.sin(theta) * r;
            // Guide them towards center
            const centerAngle = Math.atan2(this.height / 2 - startY, this.width / 2 - startX);
            speed += 1;
        }

        let type = 'normal';
        let hp = 1;
        let name = "target_" + Math.floor(Math.random() * 1000);

        if (this.gamePhase !== 'TEACHING') {
            const rand = Math.random();
            if (rand > 0.95) {
                type = 'airdrop'; // Golden moving fast, infinite ammo
                name = 'target_alpha';
                speed *= 1.5;
            } else if (rand > 0.8) {
                type = 'armor'; // Level 3 helmet, needs 2 hits
                name = 'target_beta';
                hp = 2;
                speed *= 0.8;
                size *= 1.1;
            } else if (rand > 0.6) {
                type = 'rare'; // Fast small
            }
        }

        this.targets.push({
            x: startX,
            y: startY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: size / 2,
            type: type,
            hp: hp,
            name: name,
            hoverTime: 0,
            life: this.gamePhase === 'POISON' ? 2000 : 3000
        });
    }

    shoot() {
        if (this.isReloading && this.powerupTimer <= 0) return;

        if (this.ammo <= 0 && this.powerupTimer <= 0) {
            // Auto-reload on dry-fire for mobile friendliness
            this.reload();
            return;
        }

        // Check if cursor is inside poison zone (Penalize missing safe zone)
        if (this.gamePhase === 'POISON') {
            const dx = this.input.x - this.width / 2;
            const dy = this.input.y - this.height / 2;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > this.safeZoneRadius) {
                // Shoot outside safe zone
                if (this.powerupTimer <= 0) this.ammo--;
                playSound('shot');
                this.combo = 0;
                this.showFloatingText("OUT OF BOUNDS", this.input.x, this.input.y, '#9ca3af');
                return; // Auto miss
            }
        }

        if (this.powerupTimer <= 0) this.ammo--;
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

                if (t.type === 'armor' && t.hp > 1) {
                    // Armor hit (first hit)
                    t.hp--;
                    t.radius *= 0.8; // visually reduce size
                    playSound('hit');
                    this.createExplosion(t.x, t.y, '#9ca3af');
                    this.showFloatingText("Armor Broken!", t.x, t.y - 20, '#d1d5db');
                    break;
                }

                this.combo++;

                let points = 10;
                if (t.type === 'rare') points = 50;
                if (t.type === 'armor') points = 80;
                if (t.type === 'airdrop') points = 100;

                let multiplier = 1 + this.combo * 0.1;

                // Pre-aim bonus
                if (t.hoverTime >= 300) {
                    multiplier *= 2;
                    this.showFloatingText("AIM BONUS x2!", t.x, t.y - 40, '#4ade80');
                }

                points = Math.floor(points * multiplier); // Combo & hover bonus

                this.score += points;
                this.updateUI('score', this.score);
                playSound('hit');

                // Screen shake
                this.shake = (t.type === 'rare' || t.type === 'airdrop') ? 15 : 10;

                let particleColor = '#ffffff';
                if (t.type === 'rare') particleColor = '#fbbf24';
                if (t.type === 'airdrop') particleColor = '#eab308';
                if (t.type === 'armor') particleColor = '#ef4444';

                this.createExplosion(t.x, t.y, particleColor);

                // Coding Easter Eggs
                if (this.combo === 3) {
                    console.log("ChickenDinner++;");
                }
                if (t.name === 'target_alpha' || t.name === 'target_beta') {
                    this.showFloatingText(`${t.name}.resolved;`, t.x, t.y + 40, '#a855f7');
                }

                if (t.type === 'airdrop') {
                    this.powerupTimer = 8.0; // 8 seconds of unlimited ammo
                    this.showFloatingText("8s 无限火力!", t.x, t.y - 60, '#eab308');
                    this.ammo = GAME_CONFIG.AIM_GAME.MAX_AMMO;
                } else {
                    this.showFloatingText(`+${points} ${this.combo > 1 ? 'x' + this.combo : ''}`, t.x, t.y - 20, '#fbbf24');
                }

                this.targets.splice(i, 1);
                break; // Only hit one at a time
            }
        }

        if (!hit) {
            this.combo = 0; // Reset combo on miss
            this.createExplosion(this.input.x, this.input.y, '#4b5563'); // small dust
        }
    }

    reload() {
        if (this.powerupTimer > 0) return; // No need to reload
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

        // Draw Poison Overlay if needed
        if (this.gamePhase === 'POISON' || this.gamePhase === 'NORMAL') {
            if (this.safeZoneRadius < Math.max(this.width, this.height)) {
                this.ctx.fillStyle = 'rgba(20, 0, 0, 0.4)';
                this.ctx.beginPath();
                this.ctx.rect(0, 0, this.width, this.height);
                this.ctx.arc(this.width / 2, this.height / 2, Math.max(0, this.safeZoneRadius), 0, Math.PI * 2, true);
                this.ctx.fill();

                // Safe zone border
                this.ctx.strokeStyle = '#ef4444';
                this.ctx.lineWidth = 2;
                this.ctx.setLineDash([10, 10]);
                this.ctx.beginPath();
                this.ctx.arc(this.width / 2, this.height / 2, Math.max(0, this.safeZoneRadius), 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
            }
        }

        // Draw Targets
        this.targets.forEach(t => {
            if (t.type === 'armor' && t.hp > 1 && window.GAME_ASSETS && window.GAME_ASSETS.helmet.complete && window.GAME_ASSETS.helmet.naturalWidth > 0) {
                // Draw armor background circle
                this.ctx.beginPath();
                this.ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = '#4b5563';
                this.ctx.fill();
                this.ctx.strokeStyle = '#fff';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();

                // Draw Level 3 Helmet Icon
                const size = t.radius * 2.5;
                this.ctx.drawImage(window.GAME_ASSETS.helmet, t.x - size / 2, t.y - size / 2, size, size);
                return; // Skip normal drawing
            }

            this.ctx.beginPath();
            this.ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);

            if (t.type === 'airdrop') this.ctx.fillStyle = '#eab308'; // Gold
            else if (t.type === 'rare') this.ctx.fillStyle = '#fbbf24'; // Yellow
            else if (t.type === 'armor') this.ctx.fillStyle = t.hp > 1 ? '#4b5563' : '#ef4444'; // Gray if armored, Red if broken
            else this.ctx.fillStyle = '#ef4444'; // Red (Normal)

            this.ctx.fill();
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Inner circle
            if (t.type !== 'armor' || t.hp === 1) {
                this.ctx.beginPath();
                this.ctx.arc(t.x, t.y, t.radius * 0.6, 0, Math.PI * 2);
                this.ctx.fillStyle = '#fff';
                this.ctx.fill();

                // Bullseye
                this.ctx.beginPath();
                this.ctx.arc(t.x, t.y, t.radius * 0.3, 0, Math.PI * 2);
                this.ctx.fillStyle = '#000';
                this.ctx.fill();
            } else {
                // Draw helmet detail for armor
                this.ctx.fillStyle = '#1f2937';
                this.ctx.fillRect(t.x - t.radius * 0.6, t.y - t.radius * 0.2, t.radius * 1.2, t.radius * 0.4);
            }
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

        super.postDraw();

        // Draw HUD (Ammo)
        this.drawHUD();

        // Draw Crosshair
        this.drawCrosshair();
    }

    drawHUD() {
        // Modern Unified HUD optimized for mixed screen sizes (Mobile + PC)
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, this.height - 60, this.width, 60);
        this.ctx.fillStyle = '#4b5563';
        this.ctx.fillRect(0, this.height - 60, this.width, 2);

        this.ctx.font = 'bold 15px monospace, "Segoe UI", sans-serif'; // Reduced font size for mobile
        this.ctx.textBaseline = 'middle';

        // --- Row 1 (y = height - 40) ---
        // Phase Indicator (Left)
        let phaseColor = '#22c55e';
        let phaseText = 'TEACHING';
        if (this.gamePhase === 'NORMAL') { phaseColor = '#3b82f6'; phaseText = 'COMBAT'; }
        if (this.gamePhase === 'POISON') { phaseColor = '#ef4444'; phaseText = 'RED ZONE'; }

        this.ctx.fillStyle = phaseColor;
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`[${phaseText}]`, 15, this.height - 40);

        // Time (Right)
        this.ctx.fillStyle = this.timeLeft <= 10 ? '#ef4444' : '#fff';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`T-${this.timeLeft}s`, this.width - 15, this.height - 40);

        // --- Row 2 (y = height - 15) ---
        // Ammo (Left)
        this.ctx.textAlign = 'left';
        if (this.powerupTimer > 0) {
            this.ctx.fillStyle = '#eab308'; // Gold
            this.ctx.fillText(`AMMO ∞ (${this.powerupTimer.toFixed(1)}s)`, 15, this.height - 15);
        } else {
            this.ctx.fillStyle = this.ammo === 0 ? '#ef4444' : '#fbbf24';
            this.ctx.fillText(`AMMO ${this.ammo}/${GAME_CONFIG.AIM_GAME.MAX_AMMO} [TAP HUD]`, 15, this.height - 15);
        }

        // Combo & Score Tracking Display (Right)
        if (this.combo > 1) {
            this.ctx.textAlign = 'right';
            this.ctx.fillStyle = '#a855f7';
            this.ctx.fillText(`COMBO x${this.combo}`, this.width - 15, this.height - 15);
        }

        // Reload Hint (Centered above HUD)
        if (this.isReloading) {
            this.ctx.fillStyle = '#fff';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('⚡ RELOADING ⚡', this.width / 2, this.height - 80);
        } else if (this.ammo === 0) {
            this.ctx.fillStyle = '#ef4444';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PRESS R TO RELOAD', this.width / 2, this.height - 80);
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

    get gameActive() {
        return this.gameState === 'PLAYING';
    }

    end() {
        playSound('gameover');
        const lang = window.getComputedLang ? window.getComputedLang() : currentLang;
        const t = I18N[lang].game;

        this.resultData = {
            title: t.over,
            desc: `${t.score} ${this.score}`,
            rank: this.getRank(this.score)
        };

        super.end();
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
