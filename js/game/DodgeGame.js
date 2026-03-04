import { BaseGame } from './BaseGame.js';
import { GAME_CONFIG, I18N, currentLang } from '../config.js';
import { playSound } from '../audio.js';

export class DodgeGame extends BaseGame {
    constructor(containerId, updateUI) {
        super(containerId);
        this.updateUI = updateUI;
        this.survivalTime = 0;
        this.obstacles = [];
        this.speed = 0;
    }

    start() {
        super.start();
        this.survivalTime = 0;
        this.obstacles = [];
        this.speed = GAME_CONFIG.DODGE_GAME.SPEED_BASE;
        
        playSound('shot');
        this.initPlayer();
        this.initControls();
        this.startLoop();
    }

    initPlayer() {
        this.player = document.createElement('div');
        this.player.className = 'absolute bottom-4 w-12 h-12 transform -translate-x-1/2 transition-transform duration-75';
        this.player.innerHTML = '<img src="https://cdn.jsdelivr.net/gh/pubg/api-assets@master/Assets/Icons/CarePackage/CarePackage_Normal.png" class="w-full h-full object-contain drop-shadow-lg" alt="Player">';
        
        let playerX = this.container.offsetWidth / 2;
        this.player.style.left = playerX + 'px';
        this.container.appendChild(this.player);
    }

    initControls() {
        const updatePlayerPos = (clientX) => {
            if (!this.player) return;
            const rect = this.container.getBoundingClientRect();
            let x = clientX - rect.left;
            if (x < 0) x = 0;
            if (x > rect.width) x = rect.width;
            this.player.style.left = x + 'px';
        };

        this.mouseHandler = (e) => updatePlayerPos(e.clientX);
        this.touchHandler = (e) => {
            e.preventDefault(); 
            updatePlayerPos(e.touches[0].clientX);
        };

        this.container.addEventListener('mousemove', this.mouseHandler);
        this.container.addEventListener('touchmove', this.touchHandler, { passive: false });
    }

    startLoop() {
        const loop = () => {
            if (!this.gameActive) return;
            
            const lang = window.getComputedLang ? window.getComputedLang() : currentLang;
            
            this.survivalTime += 0.02;
            this.updateUI('timer', this.survivalTime.toFixed(1) + I18N[lang].game.seconds);
            
            this.speed = GAME_CONFIG.DODGE_GAME.SPEED_BASE + this.survivalTime * GAME_CONFIG.DODGE_GAME.SPEED_INC;

            if (Math.random() < GAME_CONFIG.DODGE_GAME.SPAWN_RATE_BASE + (this.survivalTime * GAME_CONFIG.DODGE_GAME.SPAWN_RATE_INC)) {
                this.spawnObstacle();
            }

            this.updateObstacles();
            this.loopFrame = requestAnimationFrame(loop);
        };
        this.loopFrame = requestAnimationFrame(loop);
    }

    spawnObstacle() {
        const obs = document.createElement('div');
        obs.className = 'absolute w-10 h-10';
        obs.innerHTML = '<img src="https://cdn.jsdelivr.net/gh/pubg/api-assets@master/Assets/Item/Weapon/Melee/Item_Weapon_Pan_C.png" class="w-full h-full object-contain animate-spin" alt="Obstacle">';
        obs.style.top = '-40px';
        obs.style.left = Math.random() * (this.container.offsetWidth - 40) + 'px';
        this.container.appendChild(obs);
        this.obstacles.push({ el: obs, y: -40 });
    }

    updateObstacles() {
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            let obs = this.obstacles[i];
            obs.y += this.speed;
            obs.el.style.top = obs.y + 'px';

            if (this.checkCollision(obs.el)) {
                this.end();
                return;
            }

            if (obs.y > this.container.offsetHeight) {
                obs.el.remove();
                this.obstacles.splice(i, 1);
            }
        }
    }

    checkCollision(obsEl) {
        const pRect = this.player.getBoundingClientRect();
        const oRect = obsEl.getBoundingClientRect();
        
        const padding = 10;
        return !(pRect.right - padding < oRect.left + padding || 
                 pRect.left + padding > oRect.right - padding || 
                 pRect.bottom - padding < oRect.top + padding || 
                 pRect.top + padding > oRect.bottom - padding);
    }

    end() {
        super.end();
        playSound('gameover');
        const lang = window.getComputedLang ? window.getComputedLang() : currentLang;
        const t = I18N[lang].game;
        alert(`${t.crash}\n${t.survive} ${this.survivalTime.toFixed(2)}${t.seconds}`);
    }
    
    cleanup() {
        super.cleanup();
        this.obstacles = [];
        this.player = null;
    }
}
