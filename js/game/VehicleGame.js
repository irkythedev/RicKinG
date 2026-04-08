window.VehicleGame = class VehicleGame extends BaseGame {
    constructor(containerId, updateUI) {
        super(containerId);
        this._gameType = 'vehicle';
        this.updateUI = updateUI;
        this.player = { x: 0, y: 0, width: 36, height: 60, speed: 0 };
        this.obstacles = [];
        this.particles = [];
        this.roadLines = [];
        this.survivalTime = 0;
        this.hp = GAME_CONFIG.VEHICLE_GAME.MAX_HP;
        this.timeLeft = GAME_CONFIG.VEHICLE_GAME.TIME;
        this.gamePhase = 'TEACHING';
        this.roadSpeed = GAME_CONFIG.VEHICLE_GAME.ROAD_SPEED_BASE;
        this.turboTimer = 0;
        this.blueZoneY = 0; // Rises from bottom during FINAL_PUSH
        this.cleanDriveTime = 0; // Easter egg tracker
    }

    start() {
        super.start();
        this.survivalTime = 0;
        this.obstacles = [];
        this.particles = [];
        this.hp = GAME_CONFIG.VEHICLE_GAME.MAX_HP;
        this.timeLeft = GAME_CONFIG.VEHICLE_GAME.TIME;
        this.gamePhase = 'TEACHING';
        this.roadSpeed = GAME_CONFIG.VEHICLE_GAME.ROAD_SPEED_BASE;
        this.turboTimer = 0;
        this.blueZoneY = 0;
        this.cleanDriveTime = 0;
        this.timerAccumulator = 0;

        // Center player
        this.player.x = this.width / 2;
        this.player.y = this.height - 100;
        this.player.speed = GAME_CONFIG.VEHICLE_GAME.PLAYER_SPEED;

        // Init road lines
        this.roadLines = [];
        for (let i = 0; i < 20; i++) {
            this.roadLines.push({ y: i * 40 });
        }

        this.updateUI('score', this.score);
        this.updateUI('timer', this.timeLeft);
        playSound('shot');
    }

    update(deltaTime) {
        super.update(deltaTime);
        if (!this.gameActive) return;

        const dt = deltaTime / 16.67;

        // 1. Timer & Phase
        this.survivalTime += deltaTime / 1000;
        this.timerAccumulator += deltaTime;
        while (this.timerAccumulator >= 1000) {
            this.timeLeft--;
            this.updateUI('timer', this.timeLeft);
            this.timerAccumulator -= 1000;
            if (this.timeLeft <= 0) {
                this.end('EXTRACTION');
                return;
            }
        }

        const passedTime = GAME_CONFIG.VEHICLE_GAME.TIME - this.timeLeft;
        if (passedTime < 8) this.gamePhase = 'TEACHING';
        else if (passedTime < 35) this.gamePhase = 'HIGHWAY';
        else this.gamePhase = 'FINAL_PUSH';

        // Road speed scales with phase
        let targetSpeed = GAME_CONFIG.VEHICLE_GAME.ROAD_SPEED_BASE;
        if (this.gamePhase === 'HIGHWAY') targetSpeed += 2 + passedTime * 0.08;
        if (this.gamePhase === 'FINAL_PUSH') targetSpeed += 4 + passedTime * 0.1;
        if (this.turboTimer > 0) targetSpeed *= 1.8;
        this.roadSpeed += (targetSpeed - this.roadSpeed) * 0.05;

        // Turbo
        if (this.turboTimer > 0) {
            this.turboTimer -= deltaTime / 1000;
            if (this.turboTimer <= 0) this.turboTimer = 0;
        }

        // Blue Zone (FINAL_PUSH: creeps up from bottom)
        if (this.gamePhase === 'FINAL_PUSH') {
            const pushProgress = (passedTime - 35) / 25; // 0 to 1
            this.blueZoneY = this.height * 0.4 * Math.min(pushProgress, 1);
        }
        // Blue zone damage
        if (this.blueZoneY > 0 && this.player.y > this.height - this.blueZoneY) {
            this.hp -= deltaTime / 2000; // Slow drain
            if (this.hp <= 0) {
                this.hp = 0;
                this.end('WRECKED');
                return;
            }
        }

        // 2. Player Movement
        let moveSpeed = this.player.speed;
        if (this.turboTimer > 0) moveSpeed *= 1.3;

        if (this.input.keys['ArrowLeft'] || this.input.keys['KeyA']) {
            this.player.x -= moveSpeed * dt;
        } else if (this.input.keys['ArrowRight'] || this.input.keys['KeyD']) {
            this.player.x += moveSpeed * dt;
        } else {
            // Touch/mouse follow
            const targetX = this.input.x;
            const diff = targetX - this.player.x;
            if (Math.abs(diff) > 3) {
                this.player.x += diff * 0.15 * dt;
            }
        }
        // Vertical slight control
        if (this.input.keys['ArrowUp'] || this.input.keys['KeyW']) {
            this.player.y -= moveSpeed * 0.5 * dt;
        } else if (this.input.keys['ArrowDown'] || this.input.keys['KeyS']) {
            this.player.y += moveSpeed * 0.5 * dt;
        }

        // Clamp
        const hw = this.player.width / 2;
        const roadLeft = this.width * 0.12;
        const roadRight = this.width * 0.88;
        this.player.x = Math.max(roadLeft + hw, Math.min(roadRight - hw, this.player.x));
        this.player.y = Math.max(60, Math.min(this.height - 70, this.player.y));

        // 3. Road Lines scroll
        this.roadLines.forEach(l => {
            l.y += this.roadSpeed * dt;
            if (l.y > this.height) l.y -= this.height + 40;
        });

        // 4. Spawn Obstacles
        let spawnRate = GAME_CONFIG.VEHICLE_GAME.SPAWN_RATE;
        if (this.gamePhase === 'TEACHING') spawnRate *= 0.4;
        if (this.gamePhase === 'HIGHWAY') spawnRate *= 1.2;
        if (this.gamePhase === 'FINAL_PUSH') spawnRate *= 1.5;

        if (Math.random() < spawnRate) {
            this.spawnObstacle();
        }

        // 5. Update Obstacles
        let hitThisFrame = false;
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const ob = this.obstacles[i];
            ob.y += (ob.type === 'oncoming' ? this.roadSpeed * 1.5 : this.roadSpeed * 0.4) * dt;

            // Collision
            if (this.checkCollision(this.player, ob)) {
                this.handleCollision(ob);
                this.obstacles.splice(i, 1);
                if (ob.type === 'barrier' || ob.type === 'oncoming') hitThisFrame = true;
                continue;
            }

            if (ob.y > this.height + 50) {
                this.obstacles.splice(i, 1);
            }
        }

        // Clean drive easter egg
        if (!hitThisFrame) {
            this.cleanDriveTime += deltaTime / 1000;
            if (Math.floor(this.cleanDriveTime) === 5 && Math.floor(this.cleanDriveTime - deltaTime / 1000) < 5) {
                this.showFloatingText("while(driving){ score++ }", this.player.x, this.player.y - 50, '#22c55e');
            }
        } else {
            this.cleanDriveTime = 0;
        }

        // 6. Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.life -= deltaTime;
            p.y += p.vy;
            if (p.vx) p.x += p.vx;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    spawnObstacle() {
        const roadLeft = this.width * 0.15;
        const roadRight = this.width * 0.85;
        const laneWidth = (roadRight - roadLeft) / GAME_CONFIG.VEHICLE_GAME.LANE_COUNT;
        const lane = Math.floor(Math.random() * GAME_CONFIG.VEHICLE_GAME.LANE_COUNT);
        const x = roadLeft + lane * laneWidth + laneWidth / 2;

        const rand = Math.random();
        let type, color, w, h;

        if (rand > 0.95) {
            type = 'turbo'; color = '#a855f7'; w = 25; h = 25;
        } else if (rand > 0.88) {
            type = 'fuel'; color = (window.THEME_COLORS ? window.THEME_COLORS['--t-accent'] : '#eab308'); w = 25; h = 25;
        } else if (rand > 0.80) {
            type = 'parts'; color = '#3b82f6'; w = 25; h = 25;
        } else if (rand > 0.55 && this.gamePhase !== 'TEACHING') {
            type = 'oncoming'; color = '#ef4444'; w = 30; h = 50;
        } else {
            type = 'barrier'; color = '#6b7280'; w = 40; h = 20;
        }

        this.obstacles.push({
            x, y: -50, width: w, height: h,
            type, color
        });
    }

    checkCollision(player, ob) {
        return Math.abs(player.x - ob.x) < (player.width / 2 + ob.width / 2) &&
            Math.abs(player.y - ob.y) < (player.height / 2 + ob.height / 2);
    }

    handleCollision(ob) {
        if (ob.type === 'barrier' || ob.type === 'oncoming') {
            if (this.turboTimer > 0) {
                // Smash through!
                this.score += 30;
                this.updateUI('score', this.score);
                this.createExplosion(ob.x, ob.y, ob.color);
                return;
            }
            this.hp--;
            this.shake = 15;
            this.cleanDriveTime = 0;
            playSound('hit');
            this.createExplosion(ob.x, ob.y, '#ef4444');
            if (this.hp <= 0) {
                this.hp = 0;
                this.end('WRECKED');
            }
        } else if (ob.type === 'fuel') {
            this.score += 100;
            this.updateUI('score', this.score);
            playSound('hit');
            this.showFloatingText('+100 ⛽', ob.x, ob.y, (window.THEME_COLORS ? window.THEME_COLORS['--t-accent'] : '#eab308'));
        } else if (ob.type === 'parts') {
            this.score += 200;
            this.updateUI('score', this.score);
            playSound('hit');
            this.showFloatingText('+200 🔧', ob.x, ob.y, '#3b82f6');
        } else if (ob.type === 'turbo') {
            this.turboTimer = 3.0;
            this.score += 300;
            this.updateUI('score', this.score);
            playSound('hit');
            this.showFloatingText('TURBO BOOST!', ob.x, ob.y - 30, '#a855f7');
        }
    }

    createExplosion(x, y, color) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 400, color, size: Math.random() * 3 + 1
            });
        }
    }

    showFloatingText(text, x, y, color) {
        this.particles.push({ x, y, vx: 0, vy: -0.8, life: 800, text, color });
    }

    draw() {
        super.draw();

        const roadLeft = this.width * 0.12;
        const roadRight = this.width * 0.88;
        const roadW = roadRight - roadLeft;

        // Draw road background
        this.ctx.fillStyle = '#1c1917';
        this.ctx.fillRect(roadLeft, 0, roadW, this.height);

        // Road edges
        this.ctx.fillStyle = '#f59e0b';
        this.ctx.fillRect(roadLeft - 4, 0, 4, this.height);
        this.ctx.fillRect(roadRight, 0, 4, this.height);

        // Dashed center lines
        this.ctx.strokeStyle = '#fbbf24';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([20, 20]);
        const lanes = GAME_CONFIG.VEHICLE_GAME.LANE_COUNT;
        for (let i = 1; i < lanes; i++) {
            const lx = roadLeft + (roadW / lanes) * i;
            this.ctx.beginPath();
            this.roadLines.forEach(l => {
                this.ctx.moveTo(lx, l.y);
                this.ctx.lineTo(lx, l.y + 15);
            });
            this.ctx.stroke();
        }
        this.ctx.setLineDash([]);

        // Blue Zone overlay (from bottom)
        if (this.blueZoneY > 0) {
            const grad = this.ctx.createLinearGradient(0, this.height, 0, this.height - this.blueZoneY);
            grad.addColorStop(0, 'rgba(59, 130, 246, 0.6)');
            grad.addColorStop(1, 'rgba(59, 130, 246, 0)');
            this.ctx.fillStyle = grad;
            this.ctx.fillRect(0, this.height - this.blueZoneY, this.width, this.blueZoneY);

            // Blue zone line
            this.ctx.strokeStyle = '#3b82f6';
            this.ctx.lineWidth = 3;
            this.ctx.setLineDash([8, 8]);
            this.ctx.beginPath();
            this.ctx.moveTo(0, this.height - this.blueZoneY);
            this.ctx.lineTo(this.width, this.height - this.blueZoneY);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }

        // Draw obstacles
        this.obstacles.forEach(ob => {
            this.ctx.save();
            this.ctx.translate(ob.x, ob.y);

            if (ob.type === 'barrier') {
                // Road barrier
                this.ctx.fillStyle = '#4b5563';
                this.ctx.fillRect(-ob.width / 2, -ob.height / 2, ob.width, ob.height);
                this.ctx.fillStyle = '#fbbf24';
                this.ctx.fillRect(-ob.width / 2, -2, ob.width, 4); // Yellow stripe
            } else if (ob.type === 'oncoming') {
                // Oncoming car (red)
                this.ctx.fillStyle = '#991b1b';
                this.ctx.fillRect(-ob.width / 2, -ob.height / 2, ob.width, ob.height);
                // Windshield
                this.ctx.fillStyle = '#93c5fd';
                this.ctx.fillRect(-ob.width / 2 + 4, -ob.height / 2 + 4, ob.width - 8, 12);
                // Headlights
                this.ctx.fillStyle = '#fbbf24';
                this.ctx.fillRect(-ob.width / 2, ob.height / 2 - 6, 8, 6);
                this.ctx.fillRect(ob.width / 2 - 8, ob.height / 2 - 6, 8, 6);
            } else if (ob.type === 'fuel') {
                if (window.GAME_ASSETS && window.GAME_ASSETS.fuel.complete && window.GAME_ASSETS.fuel.naturalWidth > 0) {
                    this.ctx.drawImage(window.GAME_ASSETS.fuel, -18, -18, 36, 36);
                } else {
                    this.ctx.fillStyle = (window.THEME_COLORS ? window.THEME_COLORS['--t-accent'] : '#eab308');
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, 14, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.fillStyle = '#fff';
                    this.ctx.font = 'bold 14px monospace';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText('⛽', 0, 0);
                }
            } else if (ob.type === 'parts') {
                this.ctx.fillStyle = '#2563eb';
                this.ctx.fillRect(-12, -12, 24, 24);
                this.ctx.fillStyle = '#bfdbfe';
                this.ctx.fillRect(-3, -12, 6, 24);
                this.ctx.fillRect(-12, -3, 24, 6);
            } else if (ob.type === 'turbo') {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, 14, 0, Math.PI * 2);
                this.ctx.fillStyle = '#7c3aed';
                this.ctx.fill();
                this.ctx.fillStyle = '#e9d5ff';
                this.ctx.font = 'bold 16px monospace';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('⚡', 0, 1);
            }

            this.ctx.restore();
        });

        // Draw Player Vehicle (top-down Dacia/Jeep)
        this.ctx.save();
        this.ctx.translate(this.player.x, this.player.y);

        if (this.turboTimer > 0) {
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = '#a855f7';
        }

        // Vehicle body
        this.ctx.fillStyle = '#f97316'; // Orange
        this.ctx.fillRect(-this.player.width / 2, -this.player.height / 2, this.player.width, this.player.height);

        // Roof
        this.ctx.fillStyle = '#ea580c';
        this.ctx.fillRect(-this.player.width / 2 + 5, -this.player.height / 2 + 10, this.player.width - 10, this.player.height - 25);

        // Windshield (front)
        this.ctx.fillStyle = '#93c5fd';
        this.ctx.fillRect(-this.player.width / 2 + 6, -this.player.height / 2 + 4, this.player.width - 12, 10);

        // Rear window
        this.ctx.fillStyle = '#60a5fa';
        this.ctx.fillRect(-this.player.width / 2 + 8, this.player.height / 2 - 12, this.player.width - 16, 8);

        // Headlights
        this.ctx.fillStyle = '#fef08a';
        this.ctx.fillRect(-this.player.width / 2, -this.player.height / 2, 6, 4);
        this.ctx.fillRect(this.player.width / 2 - 6, -this.player.height / 2, 6, 4);

        // Tail lights
        this.ctx.fillStyle = '#ef4444';
        this.ctx.fillRect(-this.player.width / 2, this.player.height / 2 - 4, 6, 4);
        this.ctx.fillRect(this.player.width / 2 - 6, this.player.height / 2 - 4, 6, 4);

        // Turbo exhaust particles
        if (this.turboTimer > 0) {
            this.ctx.fillStyle = 'rgba(168, 85, 247, 0.6)';
            for (let i = 0; i < 3; i++) {
                const ex = (Math.random() - 0.5) * 12;
                const ey = this.player.height / 2 + Math.random() * 15;
                this.ctx.beginPath();
                this.ctx.arc(ex, ey, 3 + Math.random() * 4, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        this.ctx.restore();

        // Draw Particles
        this.particles.forEach(p => {
            this.ctx.globalAlpha = Math.max(0, p.life / 500);
            if (p.text) {
                this.ctx.font = 'bold 16px "Segoe UI", monospace';
                this.ctx.fillStyle = p.color;
                this.ctx.textAlign = 'center';
                this.ctx.fillText(p.text, p.x, p.y);
            } else {
                this.ctx.fillStyle = p.color;
                this.ctx.fillRect(p.x, p.y, p.size, p.size);
            }
            this.ctx.globalAlpha = 1;
        });

        // Draw HUD
        this.drawHUD();

        super.postDraw();
    }

    drawHUD() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, this.height - 60, this.width, 60);
        this.ctx.fillStyle = '#4b5563';
        this.ctx.fillRect(0, this.height - 60, this.width, 2);

        this.ctx.font = 'bold 15px monospace, "Segoe UI", sans-serif';
        this.ctx.textBaseline = 'middle';

        // Row 1 - Phase + Time
        let phaseColor = '#22c55e';
        let phaseText = 'TEACHING';
        if (this.gamePhase === 'HIGHWAY') { phaseColor = '#f59e0b'; phaseText = 'HIGHWAY'; }
        if (this.gamePhase === 'FINAL_PUSH') { phaseColor = '#ef4444'; phaseText = 'FINAL PUSH'; }

        this.ctx.fillStyle = phaseColor;
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`[${phaseText}]`, 15, this.height - 40);

        this.ctx.fillStyle = this.timeLeft <= 10 ? '#ef4444' : '#fff';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`T-${this.timeLeft}s`, this.width - 15, this.height - 40);

        // Row 2 - Turbo/Speed + HP
        this.ctx.textAlign = 'left';
        if (this.turboTimer > 0) {
            this.ctx.fillStyle = '#a855f7';
            this.ctx.fillText(`⚡ TURBO (${this.turboTimer.toFixed(1)}s)`, 15, this.height - 15);
        } else {
            this.ctx.fillStyle = '#f59e0b';
            this.ctx.fillText(`🚗 SPEED: ${Math.round(this.roadSpeed * 10)} km/h`, 15, this.height - 15);
        }

        // HP hearts
        this.ctx.fillStyle = '#ef4444';
        this.ctx.textAlign = 'right';
        let hpStr = '';
        let displayHp = Math.ceil(this.hp);
        for (let i = 0; i < GAME_CONFIG.VEHICLE_GAME.MAX_HP; i++) {
            hpStr += (i < displayHp) ? '❤️' : '🖤';
        }
        this.ctx.fillText(`HP: ${hpStr}`, this.width - 15, this.height - 15);
    }

    get gameActive() {
        return this.gameState === 'PLAYING';
    }

    end(reason = 'WRECKED') {
        playSound('gameover');
        const lang = window.getComputedLang ? window.getComputedLang() : currentLang;
        const t = I18N[lang].game;

        let title = reason === 'EXTRACTION' ? t.extraction : t.wrecked;
        let rankName = null;
        if (reason === 'EXTRACTION') {
            rankName = this.hp >= GAME_CONFIG.VEHICLE_GAME.MAX_HP ? 'Speed Demon' : 'Road Survivor';
        } else if (this.survivalTime > 30) {
            rankName = 'Highway Legend';
        }

        this.resultData = {
            title: title,
            desc: `${t.survive} ${this.survivalTime.toFixed(1)}${t.seconds} | ${t.score} ${this.score}`,
            rank: rankName
        };

        super.end();
    }
}
