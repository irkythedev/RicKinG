window.BaseGame = class BaseGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.canvas = document.createElement('canvas');
        this.canvas.style.display = 'block';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);

        this.gameState = 'MENU'; // MENU, PLAYING, GAMEOVER
        this.score = 0;
        this.timeLeft = 0;
        this.loopFrame = null;
        this.lastTime = 0;
        this.resultData = {}; // Store result info for display

        // Screen Shake
        this.shake = 0;

        // Input state
        this.input = {
            x: 0,
            y: 0,
            clicked: false,
            keys: {}
        };

        this.resize();
        this.handleResize = this.resize.bind(this);
        window.addEventListener('resize', this.handleResize);

        // Bind input handlers
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);

        // Add event listeners
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        this.canvas.addEventListener('mousedown', this.handleClick);
        this.canvas.addEventListener('touchstart', this.handleClick, { passive: false });
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    resize() {
        if (!this.container) return;
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;

        // Use devicePixelRatio for sharp rendering
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;

        // Reset transform to identity before scaling
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        // Scale context
        this.ctx.scale(dpr, dpr);

        // Redraw if game over to keep result screen correct
        if (this.gameState === 'GAMEOVER') {
            this.drawGameOver();
        }
    }

    start() {
        this.gameState = 'PLAYING';
        this.score = 0;
        this.resize(); // Ensure size is correct on start
        this.lastTime = performance.now();
        this.loopFrame = requestAnimationFrame(this.loop.bind(this));
    }

    loop(timestamp) {
        if (this.gameState === 'MENU') return;

        if (typeof timestamp !== 'number') {
            this.loopFrame = requestAnimationFrame(this.loop.bind(this));
            return;
        }

        const deltaTime = Math.max(0, timestamp - this.lastTime);
        this.lastTime = timestamp;

        if (this.gameState === 'PLAYING') {
            this.update(deltaTime);
        }

        this.draw();

        if (this.gameState === 'GAMEOVER') {
            this.drawGameOver();
        }

        this.input.clicked = false; // Reset click state per frame

        if (this.gameState !== 'MENU') {
            this.loopFrame = requestAnimationFrame(this.loop.bind(this));
        }
    }

    update(deltaTime) {
        if (this.shake > 0) {
            this.shake -= deltaTime * 0.05; // Decay
            if (this.shake < 0) this.shake = 0;
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Apply shake
        if (this.shake > 0) {
            const dx = (Math.random() - 0.5) * this.shake;
            const dy = (Math.random() - 0.5) * this.shake;
            this.ctx.save();
            this.ctx.translate(dx, dy);
        }
    }

    postDraw() {
        if (this.shake > 0) {
            this.ctx.restore();
        }
    }

    drawGameOver() {
        // Semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        const lang = window.getComputedLang ? window.getComputedLang() : currentLang;
        const t = I18N[lang].game;
        const cx = this.width / 2;
        const isSmall = this.width < 500;
        const fontScale = isSmall ? 0.75 : 1;

        this.ctx.textAlign = 'center';

        // === Record breaking banner ===
        if (this._leaderboardResult && this._leaderboardResult.isNewRecord) {
            const msg = Leaderboard.getRecordMessage(lang);
            this.ctx.font = `bold ${Math.round(18 * fontScale)}px "Segoe UI", sans-serif`;
            // Animated golden glow
            const glow = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
            this.ctx.fillStyle = `rgba(234, 179, 8, ${glow})`;
            this.ctx.fillText(msg, cx, this.height * 0.12);
        }

        // === Title ===
        this.ctx.font = `bold ${Math.round(28 * fontScale)}px "Segoe UI", sans-serif`;
        this.ctx.fillStyle = '#ef4444';
        this.ctx.fillText(this.resultData.title || t.over, cx, this.height * 0.22);

        // === Score / Stats ===
        this.ctx.font = `${Math.round(20 * fontScale)}px "Segoe UI", sans-serif`;
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText(this.resultData.desc || `${t.score} ${this.score}`, cx, this.height * 0.30);

        // === Rank badge ===
        if (this.resultData.rank) {
            this.ctx.font = `${Math.round(16 * fontScale)}px "Segoe UI", sans-serif`;
            this.ctx.fillStyle = '#fbbf24';
            this.ctx.fillText(`${t.rank} ${this.resultData.rank}`, cx, this.height * 0.36);
        }

        // === Leaderboard (Top 5) ===
        if (this._leaderboardResult && this._leaderboardResult.entries.length > 0) {
            const entries = this._leaderboardResult.entries.slice(0, 5);
            const startY = this.height * 0.42;
            const lineH = Math.round(22 * fontScale);

            // Header
            this.ctx.font = `bold ${Math.round(13 * fontScale)}px "Segoe UI", sans-serif`;
            this.ctx.fillStyle = '#9CA3AF';
            this.ctx.fillText(lang === 'zh' ? '🏆 排行榜 TOP 5' : '🏆 LEADERBOARD TOP 5', cx, startY);

            entries.forEach((entry, i) => {
                const y = startY + (i + 1) * lineH;
                const isMe = entry.isPlayer && entry.score === this.score;
                const medals = ['🥇', '🥈', '🥉'];
                const medal = i < 3 ? medals[i] : `#${i + 1}`;

                this.ctx.font = `${isMe ? 'bold' : 'normal'} ${Math.round(13 * fontScale)}px "Segoe UI", sans-serif`;
                this.ctx.fillStyle = isMe ? '#FDE047' : (i < 3 ? '#E5E7EB' : '#9CA3AF');

                const displayName = entry.name.length > 12 ? entry.name.slice(0, 12) + '..' : entry.name;
                this.ctx.fillText(`${medal}  ${displayName}   ${entry.score}`, cx, y);
            });

            // My rank if not in top 5
            const myRank = this._leaderboardResult.rank;
            if (myRank > 5) {
                const y = startY + 6 * lineH;
                this.ctx.font = `bold ${Math.round(12 * fontScale)}px "Segoe UI", sans-serif`;
                this.ctx.fillStyle = '#FDE047';
                const playerName = Leaderboard.getPlayerName();
                const dn = playerName.length > 12 ? playerName.slice(0, 12) + '..' : playerName;
                this.ctx.fillText(`#${myRank}  ${dn}   ${this.score}`, cx, y);
            }
        }

        // === Replay Button ===
        const btnW = Math.round(180 * fontScale);
        const btnH = Math.round(44 * fontScale);
        const btnX = cx - btnW / 2;
        const btnY = this.height * 0.88 - btnH;

        this.replayBtnRect = { x: btnX, y: btnY, w: btnW, h: btnH };

        this.ctx.fillStyle = '#eab308';
        this.ctx.beginPath();
        this.ctx.moveTo(btnX + 8, btnY);
        this.ctx.lineTo(btnX + btnW, btnY);
        this.ctx.lineTo(btnX + btnW - 8, btnY + btnH);
        this.ctx.lineTo(btnX, btnY + btnH);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.font = `bold ${Math.round(16 * fontScale)}px "Segoe UI", sans-serif`;
        this.ctx.fillStyle = '#000';
        this.ctx.fillText(t.replay || "PLAY AGAIN", cx, btnY + btnH * 0.65);
    }

    end() {
        this.gameState = 'GAMEOVER';
        // Submit score to leaderboard if gameType is set
        if (this._gameType && typeof Leaderboard !== 'undefined') {
            this._leaderboardResult = Leaderboard.submitScore(this._gameType, this.score);
        }
    }

    cleanup() {
        this.gameState = 'MENU';
        if (this.loopFrame) cancelAnimationFrame(this.loopFrame);

        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);

        if (this.canvas) {
            this.canvas.removeEventListener('mousemove', this.handleMouseMove);
            this.canvas.removeEventListener('touchmove', this.handleTouchMove);
            this.canvas.removeEventListener('mousedown', this.handleClick);
            this.canvas.removeEventListener('touchstart', this.handleClick);
            this.canvas.remove();
        }
        this.container.innerHTML = '';
    }

    // Input Handlers
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.input.x = e.clientX - rect.left;
        this.input.y = e.clientY - rect.top;

        if (this.gameState === 'GAMEOVER' && this.replayBtnRect) {
            if (this.input.x >= this.replayBtnRect.x && this.input.x <= this.replayBtnRect.x + this.replayBtnRect.w &&
                this.input.y >= this.replayBtnRect.y && this.input.y <= this.replayBtnRect.y + this.replayBtnRect.h) {
                this.canvas.style.cursor = 'pointer';
            } else {
                this.canvas.style.cursor = 'default';
            }
        } else {
            this.canvas.style.cursor = 'default';
        }
    }

    handleTouchMove(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        this.input.x = e.touches[0].clientX - rect.left;
        this.input.y = e.touches[0].clientY - rect.top;
    }

    handleClick(e) {
        if (e.type === 'touchstart') e.preventDefault();

        const rect = this.canvas.getBoundingClientRect();
        let clientX = e.clientX;
        let clientY = e.clientY;
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }
        this.input.x = clientX - rect.left;
        this.input.y = clientY - rect.top;

        this.input.clicked = true;

        if (this.gameState === 'GAMEOVER' && this.replayBtnRect) {
            if (this.input.x >= this.replayBtnRect.x && this.input.x <= this.replayBtnRect.x + this.replayBtnRect.w &&
                this.input.y >= this.replayBtnRect.y && this.input.y <= this.replayBtnRect.y + this.replayBtnRect.h) {
                this.start(); // Restart Game
            }
        }
    }

    handleKeyDown(e) {
        this.input.keys[e.code] = true;
    }

    handleKeyUp(e) {
        this.input.keys[e.code] = false;
    }
}
