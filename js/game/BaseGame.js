window.BaseGame = class BaseGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.gameActive = false;
        this.score = 0;
        this.timeLeft = 0;
        this.timer = null;
        this.loopFrame = null;
        this.timeouts = [];
        
        // Bind methods to this
        this.cleanup = this.cleanup.bind(this);
    }

    init() {
        // To be implemented by subclass if needed
    }

    start() {
        this.gameActive = true;
        this.score = 0;
        // Subclass should set timeLeft and start loop
    }

    end() {
        this.gameActive = false;
        this.cleanup();
    }

    cleanup() {
        this.gameActive = false;
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        if (this.loopFrame) {
            cancelAnimationFrame(this.loopFrame);
            this.loopFrame = null;
        }
        
        this.timeouts.forEach(id => clearTimeout(id));
        this.timeouts = [];
        
        if (this.container) {
            this.container.innerHTML = '';
            // Remove event listeners if stored
            if (this.mouseHandler) {
                this.container.removeEventListener('mousemove', this.mouseHandler);
                this.mouseHandler = null;
            }
            if (this.touchHandler) {
                this.container.removeEventListener('touchmove', this.touchHandler);
                this.touchHandler = null;
            }
        }
    }

    safeSetTimeout(fn, delay) {
        const id = setTimeout(() => {
            fn();
        }, delay);
        this.timeouts.push(id);
        return id;
    }
}