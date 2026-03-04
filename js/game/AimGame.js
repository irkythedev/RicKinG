import { BaseGame } from './BaseGame.js';
import { GAME_CONFIG, I18N, currentLang } from '../config.js';
import { playSound } from '../audio.js';

export class AimGame extends BaseGame {
    constructor(containerId, updateUI) {
        super(containerId);
        this.updateUI = updateUI; // Callback to update score/timer UI
    }

    start() {
        super.start();
        this.timeLeft = GAME_CONFIG.AIM_GAME.TIME;
        
        // Start Timer
        this.updateUI('timer', this.timeLeft);
        this.updateUI('score', this.score);
        
        this.timer = setInterval(() => {
            if (!this.gameActive) {
                clearInterval(this.timer);
                return;
            }
            this.timeLeft--;
            this.updateUI('timer', this.timeLeft);
            if (this.timeLeft <= 0) {
                this.end();
            }
        }, 1000);

        this.spawnLoop();
        playSound('shot');
    }

    spawnLoop() {
        if (!this.gameActive) return;
        this.spawnTarget((points) => {
            this.score += points;
            this.updateUI('score', this.score);
            
            // Get latest lang
            const lang = window.getComputedLang ? window.getComputedLang() : currentLang;
            
            const combo = document.createElement('div');
            combo.className = 'absolute text-yellow-300 font-bold text-2xl animate-bounce pointer-events-none';
            combo.style.left = '50%';
            combo.style.top = '10%';
            combo.innerText = I18N[lang].game.hit;
            this.container.appendChild(combo);
            this.safeSetTimeout(() => combo.remove(), 500);
        });
        
        let delay = Math.max(GAME_CONFIG.AIM_GAME.SPAWN_DELAY_MIN, GAME_CONFIG.AIM_GAME.SPAWN_DELAY_MAX - this.score * 5); 
        this.safeSetTimeout(() => this.spawnLoop(), delay);
    }

    spawnTarget(onHit) {
        const target = document.createElement('div');
        target.className = 'absolute cursor-pointer transform transition active:scale-90 flex items-center justify-center w-20 h-20 bg-transparent';
        
        const isRare = Math.random() > 0.7;
        const imgSrc = isRare ? 
            'https://cdn.jsdelivr.net/gh/pubg/api-assets@master/Assets/Item/Weapon/Main/Item_Weapon_HK416_C.png' : 
            'https://cdn.jsdelivr.net/gh/pubg/api-assets@master/Assets/Item/Weapon/Melee/Item_Weapon_Pan_C.png';
        
        target.innerHTML = `<img src="${imgSrc}" class="w-full h-full object-contain drop-shadow-2xl filter hover:brightness-125 transition">`;
        
        const maxX = this.container.offsetWidth - 80;
        const maxY = this.container.offsetHeight - 80;
        
        target.style.left = Math.random() * maxX + 'px';
        target.style.top = Math.random() * maxY + 'px';

        target.onclick = (e) => {
            e.stopPropagation();
            playSound('hit');
            onHit(isRare ? GAME_CONFIG.AIM_GAME.SCORE_RARE : GAME_CONFIG.AIM_GAME.SCORE_NORMAL);
            target.remove();
        };

        this.container.appendChild(target);

        this.safeSetTimeout(() => {
            if (target.parentNode) target.remove();
        }, isRare ? 800 : 1200);
    }

    end() {
        super.end();
        playSound('gameover');
        const lang = window.getComputedLang ? window.getComputedLang() : currentLang;
        const t = I18N[lang].game;
        alert(`${t.over}\n${t.score} ${this.score}\n${t.rank} ${this.getRank(this.score)}`);
    }

    getRank(score) {
        const lang = window.getComputedLang ? window.getComputedLang() : currentLang;
        const t = I18N[lang].game.ranks;
        if (score > 500) return t.conqueror;
        if (score > 300) return t.ace;
        if (score > 100) return t.crown;
        return t.bronze;
    }
}
