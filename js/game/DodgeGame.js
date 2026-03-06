window.DodgeGame = class DodgeGame extends BaseGame {
    constructor(containerId, updateUI) {
        super(containerId);
        this._gameType = 'dodge';
        this.updateUI = updateUI;
        this.player = { x: 0, y: 0, width: 40, height: 40, speed: 0 };
        this.items = []; // Falling items
        this.survivalTime = 0;
        this.difficultyMultiplier = 1;
        this.hp = GAME_CONFIG.DODGE_GAME.MAX_HP;
        this.gamePhase = 'TEACHING'; // TEACHING, NORMAL, CLIMAX
        this.timeLeft = GAME_CONFIG.DODGE_GAME.TIME;
        this.particles = [];
        this.grazeCombo = 0;
        this.maxGraze = 0;

        // Pre-load images (simulated with colored rects/text for now to ensure no loading issues)
    }

    start() {
        super.start();
        this.survivalTime = 0;
        this.items = [];
        this.particles = [];
        this.difficultyMultiplier = 1;
        this.hp = GAME_CONFIG.DODGE_GAME.MAX_HP;
        this.timeLeft = GAME_CONFIG.DODGE_GAME.TIME;
        this.gamePhase = 'TEACHING';
        this.player.x = this.width / 2;
        this.player.y = this.height - 80;
        this.player.speed = GAME_CONFIG.DODGE_GAME.PLAYER_SPEED;
        this.player.dash = false;
        this.player.shieldTimer = 0;
        this.player.shieldCooldown = 0;
        this.player.adrenalineTimer = 0; // Speed up and immunity from purple drops
        this.grazeCombo = 0;
        this.maxGraze = 0;

        this.timerAccumulator = 0;

        const lang = window.getComputedLang ? window.getComputedLang() : currentLang;
        this.updateUI('score', this.score);
        this.updateUI('timer', this.timeLeft);

        playSound('shot'); // Start sound
    }

    update(deltaTime) {
        super.update(deltaTime);
        if (!this.gameActive) return;

        const dt = deltaTime / 16.67; // Normalize to ~60fps

        // 1. Update Timer & Phase
        this.survivalTime += deltaTime / 1000;

        this.timerAccumulator += deltaTime;
        while (this.timerAccumulator >= 1000) {
            this.timeLeft--;
            this.updateUI('timer', this.timeLeft);
            this.timerAccumulator -= 1000;
            if (this.timeLeft <= 0) {
                // Win the game technically "Mission Complete"
                this.end('VICTORY');
                return;
            }
        }

        const passedTime = GAME_CONFIG.DODGE_GAME.TIME - this.timeLeft;
        if (passedTime < 5) this.gamePhase = 'TEACHING';
        else if (passedTime < 30) this.gamePhase = 'NORMAL';
        else this.gamePhase = 'CLIMAX';

        this.difficultyMultiplier = 1 + (this.survivalTime * 0.05);
        if (this.gamePhase === 'CLIMAX') this.difficultyMultiplier *= 1.5;

        // Player updates
        if (this.player.shieldCooldown > 0) this.player.shieldCooldown -= deltaTime / 1000;
        if (this.player.shieldTimer > 0) this.player.shieldTimer -= deltaTime / 1000;
        if (this.player.adrenalineTimer > 0) {
            this.player.adrenalineTimer -= deltaTime / 1000;
            if (this.player.adrenalineTimer <= 0) this.player.adrenalineTimer = 0;
        }

        // 2. Player Movement (Mouse/Touch follows x, Keyboard uses arrow keys)
        // Hybrid control: if mouse moved recently, follow mouse. If keys pressed, use keys.

        let moveSpeed = this.player.speed;
        if (this.player.adrenalineTimer > 0) moveSpeed *= 1.6; // Epic speed limit

        // Shield Logic (Space or Tap bottom HUD)
        if (this.input.keys['Space'] || (this.input.clicked && this.input.y > this.height - 60)) {
            if (this.player.shieldCooldown <= 0) {
                this.player.shieldTimer = 0.6;
                this.player.shieldCooldown = 5.0;
                playSound('reload'); // Use some distinct sound
            }
        }

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
        let currentSpawnRate = GAME_CONFIG.DODGE_GAME.SPAWN_RATE * this.difficultyMultiplier;
        if (this.gamePhase === 'TEACHING') currentSpawnRate *= 0.5;
        if (this.gamePhase === 'CLIMAX') currentSpawnRate *= 1.3;

        if (Math.random() < currentSpawnRate) {
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

            // Collision & Graze
            if (this.checkCollision(this.player, item)) {
                this.handleCollision(item);
                this.items.splice(i, 1);
                continue;
            } else if (item.type === 'bomb' && !item.grazed && this.checkGraze(this.player, item)) {
                item.grazed = true;
                this.grazeCombo++;
                if (this.grazeCombo > this.maxGraze) this.maxGraze = this.grazeCombo;

                let points = 20 + this.grazeCombo * 10;
                this.score += points;
                this.updateUI('score', this.score);
                this.showFloatingText(`GRAZE x${this.grazeCombo}`, this.player.x, this.player.y - 30, '#9ca3af');

                // Graze Easter Egg
                if (this.grazeCombo === 5) {
                    this.showFloatingText("if(alive){ loot++ }", this.player.x, this.player.y - 60, '#22c55e');
                }
            }

            // Remove if off screen
            if (item.y > this.height) {
                this.items.splice(i, 1);
            }
        }

        // Update Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.life -= deltaTime;
            p.y += p.vy;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    spawnItem() {
        const rand = Math.random();
        let type = 'bomb';
        let color = '#ef4444'; // Red
        let speed = GAME_CONFIG.DODGE_GAME.ITEM_SPEED_BASE + Math.random() * 2;
        let tracking = false;

        if (rand > 0.98) {
            type = 'epic'; // Purple (adrenaline)
            color = '#a855f7';
        } else if (rand > 0.96) {
            // Medkit (Restore HP) and points
            type = 'medkit';
            color = '#22c55e'; // Green
        } else if (rand > 0.8) {
            type = 'airdrop'; // Good
            color = '#3b82f6'; // Blue
        } else {
            // Bomb variant: Homing Missile
            if (this.gamePhase !== 'TEACHING' && Math.random() > 0.7) {
                tracking = true;
                color = '#7f1d1d'; // Dark Red
                speed *= 0.8; // Slower but tracks
            }
            if (this.gamePhase === 'CLIMAX' && Math.random() > 0.8) {
                speed *= 1.5; // Fast bombs
            }
            if (this.gamePhase === 'TEACHING') {
                speed *= 0.6; // Slow bombs
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
        return dist < (player.width / 2 + item.width / 2);
    }

    checkGraze(player, item) {
        // Graze distance slightly larger than collision box
        const dx = player.x - item.x;
        const dy = player.y - item.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < (player.width / 2 + item.width / 2 + 25);
    }

    showFloatingText(text, x, y, color) {
        this.particles.push({
            x: x,
            y: y,
            vy: -0.5,
            life: 800,
            text: text,
            color: color
        });
    }

    handleCollision(item) {
        if (item.type === 'bomb') {
            if (this.player.shieldTimer > 0) {
                // Deflected by shield
                this.score += 50;
                this.updateUI('score', this.score);
                playSound('hit');
                // Could spawn deflected particles
                return;
            }
            if (this.player.adrenalineTimer > 0) {
                // Immunity
                return;
            }
            this.hp--;
            this.shake = 20;
            this.grazeCombo = 0; // Reset combo
            playSound('hit'); // Change to hurt sound in future
            if (this.hp <= 0) {
                this.hp = 0;
                this.end('CRASH');
            }
        } else if (item.type === 'airdrop') {
            this.score += 100;
            this.updateUI('score', this.score);
            playSound('hit'); // Change to pickup sound
        } else if (item.type === 'medkit') {
            if (this.hp < GAME_CONFIG.DODGE_GAME.MAX_HP) {
                this.hp++;
            }
            this.score += 200;
            this.updateUI('score', this.score);
            playSound('hit');
        } else if (item.type === 'epic') {
            // Purple Drop - Adrenaline Rush!
            this.player.adrenalineTimer = 5.0; // 5 seconds of immunity and speed
            this.score += 500;
            this.updateUI('score', this.score);
            playSound('hit');
        }
    }

    draw() {
        super.draw();

        // Draw Player (Pan)
        this.ctx.save();
        this.ctx.translate(this.player.x, this.player.y);

        // Shield Effect
        if (this.player.shieldTimer > 0) {
            // 平底锅 (Pan) 造型的防御
            this.ctx.save();
            this.ctx.translate(25, -10); // Offset pan to character side
            this.ctx.rotate(Math.PI / 4); // Angled 45 deg

            // Pan Handle
            this.ctx.fillStyle = '#1f2937';
            this.ctx.fillRect(-4, 0, 8, 30);

            // Pan Head
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 18, 0, Math.PI * 2);
            this.ctx.fillStyle = '#374151';
            this.ctx.fill();
            this.ctx.strokeStyle = '#111827';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            this.ctx.restore();

            // Light Blue Shield aura
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 35, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
            this.ctx.fill();
        }

        // Adrenaline Effect
        if (this.player.adrenalineTimer > 0) {
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#a855f7';
        }

        this.ctx.rotate(-0.2);
        this.ctx.fillStyle = '#111827';
        this.ctx.fillRect(6, -5, 24, 10);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 18, 0, Math.PI * 2);
        this.ctx.fillStyle = '#4b5563';
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 12, 0, Math.PI * 2);
        this.ctx.fillStyle = '#9ca3af';
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 3, 0, Math.PI * 2);
        this.ctx.fillStyle = '#f3f4f6';
        this.ctx.fill();
        this.ctx.restore();

        // Draw Items
        this.items.forEach(item => {
            this.ctx.save();
            this.ctx.translate(item.x, item.y);
            this.ctx.rotate(item.angle);

            this.ctx.fillStyle = item.color;
            if (item.type === 'bomb') {
                // Draw Bomb with Grenade Icon
                if (window.GAME_ASSETS && window.GAME_ASSETS.grenade.complete && window.GAME_ASSETS.grenade.naturalWidth > 0) {
                    const size = item.width * 1.5;
                    this.ctx.drawImage(window.GAME_ASSETS.grenade, -size / 2, -size / 2, size, size);
                } else {
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, 15, 0, Math.PI * 2);
                    this.ctx.fillStyle = '#000';
                    this.ctx.fill();
                    this.ctx.fillStyle = '#fff';
                    this.ctx.font = '16px serif';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText('💣', 0, 2);
                }
            } else if (item.type === 'airdrop') {
                // Parachute
                this.ctx.fillStyle = '#e5e7eb';
                this.ctx.beginPath();
                this.ctx.arc(0, -14, 12, Math.PI, 0);
                this.ctx.fill();
                this.ctx.strokeStyle = '#e5e7eb';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(-9, -14);
                this.ctx.lineTo(-12, -2);
                this.ctx.moveTo(9, -14);
                this.ctx.lineTo(12, -2);
                this.ctx.stroke();

                // PUBG Airdrop: Red Box, Blue Tarp
                this.ctx.fillStyle = '#ef4444'; // Red Box
                this.ctx.fillRect(-14, -2, 28, 20);
                this.ctx.fillStyle = '#3b82f6'; // Blue Tarp
                this.ctx.fillRect(-16, -2, 32, 8);
                // Straps
                this.ctx.fillStyle = '#111827';
                this.ctx.fillRect(-3, -2, 6, 20);
            } else if (item.type === 'medkit') {
                if (window.GAME_ASSETS && window.GAME_ASSETS.medkit.complete && window.GAME_ASSETS.medkit.naturalWidth > 0) {
                    const size = item.width * 1.5;
                    this.ctx.drawImage(window.GAME_ASSETS.medkit, -size / 2, -size / 2, size, size);
                } else {
                    this.ctx.fillRect(-15, -12, 30, 24);
                    this.ctx.fillStyle = '#fff';
                    this.ctx.fillRect(-5, -8, 10, 16);
                    this.ctx.fillRect(-10, -3, 20, 6);
                }
            } else if (item.type === 'epic') {
                if (window.GAME_ASSETS && window.GAME_ASSETS.energy.complete && window.GAME_ASSETS.energy.naturalWidth > 0) {
                    const size = item.width * 1.6;
                    this.ctx.drawImage(window.GAME_ASSETS.energy, -size / 2, -size / 2, size, size);
                } else {
                    this.ctx.fillStyle = '#1f2937';
                    this.ctx.beginPath();
                    this.ctx.arc(0, -12, 10, Math.PI, 0);
                    this.ctx.fill();
                    this.ctx.fillStyle = '#9333ea';
                    this.ctx.fillRect(-12, -2, 24, 18);
                    this.ctx.fillStyle = '#d8b4fe';
                    this.ctx.fillRect(-3, -2, 6, 18);
                }
            }

            this.ctx.restore();
        });

        // Draw Particles
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life / 500;
            this.ctx.font = 'bold 16px "Segoe UI"';
            this.ctx.fillStyle = p.color;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(p.text, p.x, p.y);
            this.ctx.globalAlpha = 1;
        });

        // Draw HUD
        this.drawHUD();

        super.postDraw();
    }

    drawHUD() {
        // Modern Unified HUD optimized for mixed screen sizes (Mobile + PC)
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, this.height - 60, this.width, 60);
        this.ctx.fillStyle = '#4b5563';
        this.ctx.fillRect(0, this.height - 60, this.width, 2);

        this.ctx.font = 'bold 15px monospace, "Segoe UI", sans-serif';
        this.ctx.textBaseline = 'middle';

        // --- Row 1 (y = height - 40) ---
        // Phase Indicator (Left)
        let phaseColor = '#22c55e';
        let phaseText = 'TEACHING';
        if (this.gamePhase === 'NORMAL') { phaseColor = '#3b82f6'; phaseText = 'SURVIVAL'; }
        if (this.gamePhase === 'CLIMAX') { phaseColor = '#ef4444'; phaseText = 'RED ZONE'; }

        this.ctx.fillStyle = phaseColor;
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`[${phaseText}]`, 15, this.height - 40);

        // Time Left (Right)
        this.ctx.fillStyle = this.timeLeft <= 10 ? '#ef4444' : '#fff';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`T-${this.timeLeft}s`, this.width - 15, this.height - 40);

        // --- Row 2 (y = height - 15) ---
        // Shield Status (Left)
        this.ctx.textAlign = 'left';
        if (this.player.adrenalineTimer > 0) {
            this.ctx.fillStyle = '#a855f7';
            this.ctx.fillText(`⚡ ADRENALINE (${this.player.adrenalineTimer.toFixed(1)}s)`, 15, this.height - 15);
        } else {
            this.ctx.fillStyle = this.player.shieldCooldown <= 0 ? '#60a5fa' : '#4b5563';
            let cdText = this.player.shieldCooldown <= 0 ? 'READY' : `CD ${this.player.shieldCooldown.toFixed(1)}s`;
            this.ctx.fillText(`🛡️ SHIELD: ${cdText} [TAP HUD]`, 15, this.height - 15);
        }

        // HP (Right) - Hearts representation
        this.ctx.fillStyle = '#ef4444';
        this.ctx.textAlign = 'right';
        let hpStr = '';
        for (let i = 0; i < GAME_CONFIG.DODGE_GAME.MAX_HP; i++) {
            hpStr += (i < this.hp) ? '❤️' : '🖤';
        }
        this.ctx.fillText(`HP: ${hpStr}`, this.width - 15, this.height - 15);
    }

    get gameActive() {
        return this.gameState === 'PLAYING';
    }

    end(reason = 'CRASH') {
        playSound('gameover');
        const lang = window.getComputedLang ? window.getComputedLang() : currentLang;
        const t = I18N[lang].game;

        let rankName = null;
        if (reason === 'VICTORY') {
            rankName = this.hp === GAME_CONFIG.DODGE_GAME.MAX_HP ? 'NoBug Survivor' : 'Survived';
        } else if (this.maxGraze >= 5) {
            rankName = 'NullPointer Dodger';
        }

        this.resultData = {
            title: reason === 'VICTORY' ? 'MISSION COMPLETE' : t.crash,
            desc: `${t.survive} ${this.survivalTime.toFixed(1)}${t.seconds} | ${t.score} ${this.score}`,
            rank: rankName
        };

        super.end();
    }
}
