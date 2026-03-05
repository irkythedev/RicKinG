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
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        const lang = window.getComputedLang ? window.getComputedLang() : currentLang;
        const t = I18N[lang].game;

        this.ctx.textAlign = 'center';
        
        // Title
        this.ctx.font = 'bold 32px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#ef4444';
        this.ctx.fillText(this.resultData.title || t.over, this.width / 2, this.height / 2 - 80);
        
        // Score / Stats
        this.ctx.font = '24px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText(this.resultData.desc || `${t.score} ${this.score}`, this.width / 2, this.height / 2 - 30);
        
        // Rank (if exists)
        if (this.resultData.rank) {
            this.ctx.font = '20px "Segoe UI", sans-serif';
            this.ctx.fillStyle = '#fbbf24'; // Yellow
            this.ctx.fillText(`${t.rank} ${this.resultData.rank}`, this.width / 2, this.height / 2 + 10);
        }

        // Replay Button
        const btnW = 200;
        const btnH = 50;
        const btnX = this.width / 2 - btnW / 2;
        const btnY = this.height / 2 + 60;
        
        this.replayBtnRect = { x: btnX, y: btnY, w: btnW, h: btnH };
        
        // Button Shape
        this.ctx.fillStyle = '#eab308'; // Yellow-500
        this.ctx.beginPath();
        this.ctx.moveTo(btnX + 10, btnY);
        this.ctx.lineTo(btnX + btnW, btnY);
        this.ctx.lineTo(btnX + btnW - 10, btnY + btnH);
        this.ctx.lineTo(btnX, btnY + btnH);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Button Text
        this.ctx.font = 'bold 20px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#000';
        this.ctx.fillText(t.replay || "PLAY AGAIN", this.width / 2, btnY + 32);
    }

    end() {
        this.gameState = 'GAMEOVER';
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
