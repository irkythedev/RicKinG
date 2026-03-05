window.GameManager = class GameManager {
    constructor() {
        this.games = {
            'aim': AimGame,
            'dodge': DodgeGame
        };
        this.currentGame = null;
        this.modal = document.getElementById('game-modal');
        this.startBtnContainer = document.getElementById('modal-start-btn-container');
        this.startBtn = document.getElementById('modal-start-btn');
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
        // Force reflow to enable transition
        void this.modal.offsetWidth;
        this.modal.classList.remove('opacity-0');
        
        this.resetUI(type);
        
        const GameClass = this.games[type];
        if (GameClass) {
            this.currentGame = new GameClass('modal-game-content', this.updateUI.bind(this));
            
            // Setup start button
            this.startBtn.onclick = () => {
                this.startBtnContainer.style.display = 'none';
                this.currentGame.start();
            };
            
            // Customize button style based on game type
            if (type === 'aim') {
                this.startBtn.className = "bg-green-600 hover:bg-green-500 text-white font-black text-xl px-8 py-3 rounded clip-path-polygon transition transform hover:scale-110 mb-4";
            } else {
                this.startBtn.className = "bg-blue-600 hover:bg-blue-500 text-white font-black text-xl px-8 py-3 rounded clip-path-polygon transition transform hover:scale-110 mb-4";
            }
        }
    }

    closeModal() {
        this.cleanup();
        this.modal.classList.add('opacity-0');
        if (this.closeTimeout) clearTimeout(this.closeTimeout);
        this.closeTimeout = setTimeout(() => {
            this.modal.classList.add('hidden');
            this.closeTimeout = null;
        }, 300);
    }

    cleanup() {
        if (this.currentGame) {
            this.currentGame.cleanup();
            this.currentGame = null;
        }
        this.startBtnContainer.style.display = 'flex';
    }

    resetUI(type) {
        document.getElementById('modal-score-val').innerText = '0';
        document.getElementById('modal-timer-val').innerText = type === 'aim' ? GAME_CONFIG.AIM_GAME.TIME : '0.0s';
        
        const title = document.getElementById('modal-game-title');
        // I18N[currentLang] may be undefined if currentLang is not updated correctly in this module scope
        // Use window.getComputedLang() if available, or fallback to currentLang import
        const lang = window.getComputedLang ? window.getComputedLang() : currentLang;
        const t = I18N[lang].missions;
        
        if (type === 'aim') title.innerText = t.aim.title;
        if (type === 'dodge') title.innerText = t.dodge.title;
        
        // Also update button text
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