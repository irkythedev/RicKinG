window.BaseGame = class BaseGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);
        
        this.gameActive = false;
        this.score = 0;
        this.timeLeft = 0;
        this.loopFrame = null;
        this.lastTime = 0;
        
        // Input state
        this.input = {
            x: 0,
            y: 0,
            clicked: false,
            keys: {}
        };

        this.resize();
        window.addEventListener('resize', this.resize.bind(this));
        
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
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    start() {
        this.gameActive = true;
        this.score = 0;
        this.resize(); // Ensure size is correct on start
        this.lastTime = performance.now();
        this.loop();
    }

    loop(timestamp) {
        if (!this.gameActive) return;
        
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.draw();
        
        this.input.clicked = false; // Reset click state per frame
        this.loopFrame = requestAnimationFrame(this.loop.bind(this));
    }

    update(deltaTime) {
        // Override
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        // Override
    }

    end() {
        this.gameActive = false;
        if (this.loopFrame) cancelAnimationFrame(this.loopFrame);
        this.cleanup();
    }

    cleanup() {
        this.gameActive = false;
        if (this.loopFrame) cancelAnimationFrame(this.loopFrame);
        
        window.removeEventListener('resize', this.resize);
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        
        if (this.canvas) {
            this.canvas.remove();
        }
        this.container.innerHTML = '';
    }

    // Input Handlers
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.input.x = e.clientX - rect.left;
        this.input.y = e.clientY - rect.top;
    }

    handleTouchMove(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        this.input.x = e.touches[0].clientX - rect.left;
        this.input.y = e.touches[0].clientY - rect.top;
    }

    handleClick(e) {
        if (e.type === 'touchstart') e.preventDefault();
        this.input.clicked = true;
        // Update position for touch tap
        if (e.touches && e.touches.length > 0) {
            const rect = this.canvas.getBoundingClientRect();
            this.input.x = e.touches[0].clientX - rect.left;
            this.input.y = e.touches[0].clientY - rect.top;
        }
    }

    handleKeyDown(e) {
        this.input.keys[e.code] = true;
    }

    handleKeyUp(e) {
        this.input.keys[e.code] = false;
    }
}