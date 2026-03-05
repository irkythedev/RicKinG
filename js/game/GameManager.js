window.GameManager = class GameManager {
    constructor() {
        this.games = {
            'aim': AimGame,
            'dodge': DodgeGame,
            'vehicle': VehicleGame
        };
        this.currentGame = null;
        this.modal = document.getElementById('game-modal');
        this.startBtnContainer = document.getElementById('modal-start-btn-container');
        this.startBtn = document.getElementById('modal-start-btn');
        this.isOpen = false;
        this.handleKeyDown = (e) => {
            if (e.key === 'Escape' && this.isOpen) this.closeModal();
        };
    }

    openModal(type) {
        if (this.closeTimeout) {
            clearTimeout(this.closeTimeout);
            this.closeTimeout = null;
        }
        if (this.currentGame) {
            this.cleanup();
        }

        this.modal.classList.remove('hidden');
        void this.modal.offsetWidth;
        this.modal.classList.remove('opacity-0');
        this.modal.style.opacity = '1';
        this.modal.style.display = 'flex';
        this.isOpen = true;
        window.addEventListener('keydown', this.handleKeyDown);

        this.resetUI(type);
        this._applyTheme(type);
        this._showLoadingScreen();

        const GameClass = this.games[type];
        if (GameClass) {
            this.currentGame = new GameClass('modal-game-content', this.updateUI.bind(this));

            // Preload all assets, then reveal start button
            this._preloadAssets().then(() => {
                this._showReadyScreen();
                this.startBtn.onclick = () => {
                    this._hideOverlay();
                    this.currentGame.resize();
                    this.currentGame.start();
                };
            });
        }
    }

    // ---- Theme & Loading screen helpers ----

    _applyTheme(type) {
        // Color maps: aim = green, dodge = blue, vehicle = orange
        const themes = {
            aim: { icon: 'text-yellow-500', text: 'text-yellow-400', bar: 'bg-yellow-500', btn: 'bg-yellow-600 hover:bg-yellow-500', iconClass: 'fa-crosshairs' },
            dodge: { icon: 'text-blue-500', text: 'text-blue-400', bar: 'bg-blue-500', btn: 'bg-blue-600 hover:bg-blue-500', iconClass: 'fa-parachute-box' },
            vehicle: { icon: 'text-orange-500', text: 'text-orange-400', bar: 'bg-orange-500', btn: 'bg-orange-600 hover:bg-orange-500', iconClass: 'fa-car' }
        };
        const theme = themes[type] || themes.aim;
        this._currentTheme = theme;

        // Apply to loading icon
        const icon = document.getElementById('modal-loading-icon');
        if (icon) {
            icon.className = `fas ${theme.iconClass} text-6xl ${theme.icon} animate-spin-slow`;
        }

        // Apply to loading text
        const text = document.getElementById('modal-loading-text');
        if (text) {
            text.className = `${theme.text} font-mono text-base tracking-widest animate-pulse`;
        }

        // Apply to progress bar
        const bar = document.getElementById('modal-loading-bar');
        if (bar) {
            bar.className = `h-full ${theme.bar} rounded-full transition-all duration-300`;
        }

        // Apply to start button
        this.startBtn.className = `${theme.btn} text-white font-black text-xl px-8 py-3 rounded clip-path-polygon transition transform hover:scale-110`;
    }

    _showLoadingScreen() {
        const loadingScreen = document.getElementById('modal-loading-screen');
        const readyScreen = document.getElementById('modal-ready-screen');
        if (loadingScreen) { loadingScreen.classList.remove('hidden'); loadingScreen.style.display = 'flex'; }
        if (readyScreen) { readyScreen.classList.add('hidden'); readyScreen.style.display = 'none'; }
        this.startBtnContainer.style.display = 'flex';
        this.startBtnContainer.style.pointerEvents = 'none';
        this._setProgress(0, 0, 0);
    }

    _showReadyScreen() {
        const loadingScreen = document.getElementById('modal-loading-screen');
        const readyScreen = document.getElementById('modal-ready-screen');
        if (loadingScreen) { loadingScreen.classList.add('hidden'); loadingScreen.style.display = 'none'; }
        if (readyScreen) { readyScreen.classList.remove('hidden'); readyScreen.style.display = 'flex'; }
        this.startBtnContainer.style.pointerEvents = 'auto';
    }

    _hideOverlay() {
        this.startBtnContainer.style.display = 'none';
        this.startBtnContainer.style.pointerEvents = 'none';
    }

    _setProgress(loaded, total, pct) {
        const bar = document.getElementById('modal-loading-bar');
        const count = document.getElementById('modal-loading-count');
        const text = document.getElementById('modal-loading-text');
        if (bar) bar.style.width = pct + '%';
        if (count) count.textContent = total > 0 ? `${loaded} / ${total}` : '...';
        if (text) {
            if (pct >= 100) {
                text.textContent = 'READY TO DEPLOY';
                text.classList.remove('animate-pulse');
            } else {
                text.textContent = 'LOADING ASSETS...';
                text.classList.add('animate-pulse');
            }
        }
    }

    /**
     * Preload all HTMLImageElement instances in window.GAME_ASSETS.
     * Resolves when all images are loaded (or on error), with a 6s hard timeout.
     */
    _preloadAssets() {
        return new Promise((resolve) => {
            const assets = window.GAME_ASSETS;
            if (!assets) { this._setProgress(0, 0, 100); setTimeout(resolve, 200); return; }

            const images = Object.values(assets).filter(img => img instanceof HTMLImageElement);
            const total = images.length;
            if (total === 0) { this._setProgress(0, 0, 100); setTimeout(resolve, 200); return; }

            let loaded = 0;
            let resolved = false;
            const TIMEOUT_MS = 6000;

            const tick = () => {
                loaded++;
                const pct = Math.round((loaded / total) * 100);
                this._setProgress(loaded, total, pct);
                if (loaded >= total && !resolved) {
                    resolved = true;
                    setTimeout(resolve, 500); // short pause so user sees 100%
                }
            };

            // Hard timeout - if image server is unreachable, don't block forever
            const timeoutHandle = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    this._setProgress(total, total, 100);
                    document.getElementById('modal-loading-text').textContent = 'ASSETS SKIPPED (OFFLINE)';
                    setTimeout(resolve, 500);
                }
            }, TIMEOUT_MS);

            images.forEach(img => {
                if (img.complete && img.naturalWidth > 0) {
                    // Already loaded from cache
                    tick();
                } else {
                    const onDone = () => {
                        img.removeEventListener('load', onDone);
                        img.removeEventListener('error', onDone);
                        tick();
                    };
                    img.addEventListener('load', onDone);
                    img.addEventListener('error', onDone); // treat error as loaded to avoid hang
                }
            });
        });
    }

    // ---- End Loading helpers ----

    closeModal() {
        this.cleanup();
        this.modal.classList.add('opacity-0');
        this.modal.style.opacity = '0';
        this.isOpen = false;
        window.removeEventListener('keydown', this.handleKeyDown);
        if (this.closeTimeout) clearTimeout(this.closeTimeout);
        this.closeTimeout = setTimeout(() => {
            this.modal.classList.add('hidden');
            this.modal.style.display = 'none';
            this.closeTimeout = null;
        }, 300);
    }

    cleanup() {
        if (this.currentGame) {
            this.currentGame.cleanup();
            this.currentGame = null;
        }
        // Always reset overlay back to loading state ready for next open
        this._showLoadingScreen();
    }

    resetUI(type) {
        document.getElementById('modal-score-val').innerText = '0';
        document.getElementById('modal-timer-val').innerText = type === 'aim' ? GAME_CONFIG.AIM_GAME.TIME : '0.0s';

        const title = document.getElementById('modal-game-title');
        const lang = window.getComputedLang ? window.getComputedLang() : currentLang;
        const t = I18N[lang].missions;

        if (type === 'aim') title.innerText = t.aim.title;
        if (type === 'dodge') title.innerText = t.dodge.title;
        if (type === 'vehicle') title.innerText = t.vehicle.title;

        this.startBtn.innerText = I18N[lang].modal.btn;
    }

    updateUI(type, value) {
        if (type === 'score') {
            document.getElementById('modal-score-val').innerText = value;
        } else if (type === 'timer') {
            document.getElementById('modal-timer-val').innerText = value;
        }
    }
}

window.gameManager = new GameManager();