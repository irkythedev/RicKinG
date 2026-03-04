// --- 0. 游戏配置常量 (Game Configuration) ---
const GAME_CONFIG = {
    SMOKE: {
        COUNT: 50,
        COLOR: 'rgba(100, 116, 139, ',
        SPEED_X: 1,
        SPEED_Y: 1
    },
    WORDS: ["大吉大利", "今晚吃鸡", "落地成盒", "扶我起来", "有空投", "跑毒", "98K", "三级头", "加油", "Nice!"],
    AUDIO: {
        SHOT: { FREQ: 150, DURATION: 0.1 },
        HIT: { FREQ: 800, DURATION: 0.1 },
        GAMEOVER: { FREQ: 200, DURATION: 1 }
    },
    AIM_GAME: {
        TIME: 15,
        SPAWN_DELAY_MIN: 300,
        SPAWN_DELAY_MAX: 800,
        SCORE_NORMAL: 10,
        SCORE_RARE: 50
    },
    DODGE_GAME: {
        SPEED_BASE: 3,
        SPEED_INC: 0.2,
        SPAWN_RATE_BASE: 0.05,
        SPAWN_RATE_INC: 0.002
    },
    SKILLS_CHART: {
        LABELS: ['刚枪 (Code)', '指挥 (Plan)', 'AI Agent', 'Prompt', '跑图 (Ops)', '投掷 (Idea)'],
        DATA: [95, 85, 92, 90, 88, 80],
        COLOR_BG: 'rgba(234, 179, 8, 0.4)',
        COLOR_BORDER: '#EAB308'
    }
};

// --- 1. 烟雾背景动画 ---
const canvas = document.getElementById('smoke-canvas');
const ctx = canvas.getContext('2d');
let width, height;
const particles = [];

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * width;
        this.y = height + Math.random() * 100;
        this.vx = (Math.random() - 0.5) * GAME_CONFIG.SMOKE.SPEED_X;
        this.vy = -Math.random() * GAME_CONFIG.SMOKE.SPEED_Y - 0.5;
        this.size = Math.random() * 50 + 20;
        this.opacity = Math.random() * 0.3;
        this.life = Math.random() * 100 + 100;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.opacity -= 0.001;
        if (this.life <= 0 || this.opacity <= 0 || this.y < -50) {
            this.reset();
        }
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `${GAME_CONFIG.SMOKE.COLOR}${this.opacity})`;
        ctx.fill();
    }
}

// 初始化粒子
for (let i = 0; i < GAME_CONFIG.SMOKE.COUNT; i++) {
    particles.push(new Particle());
}

function animateSmoke() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateSmoke);
}
animateSmoke();


// --- 2. 全局点击特效 (漂浮文字) ---
function showClickEffect(e) {
    // 如果点击的是按钮，就不显示特效，避免干扰
    if (e.target.tagName === 'BUTTON' || e.target.closest('a') || e.target.closest('.flip-card')) return;

    const span = document.createElement('span');
    span.className = 'float-text';
    span.style.left = e.pageX + 'px';
    span.style.top = e.pageY + 'px';
    // 随机选择一个词
    span.innerText = GAME_CONFIG.WORDS[Math.floor(Math.random() * GAME_CONFIG.WORDS.length)];
    // 随机大小
    span.style.fontSize = (Math.random() * 10 + 12) + 'px';
    document.body.appendChild(span);

    // 动画结束后删除元素
    setTimeout(() => {
        span.remove();
    }, 1000);
}


// --- 3. 音效系统 (Web Audio API) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    
    if (type === 'shot') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(GAME_CONFIG.AUDIO.SHOT.FREQ, now);
        osc.frequency.exponentialRampToValueAtTime(0.01, now + GAME_CONFIG.AUDIO.SHOT.DURATION);
        gainNode.gain.setValueAtTime(0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + GAME_CONFIG.AUDIO.SHOT.DURATION);
        osc.start(now);
        osc.stop(now + GAME_CONFIG.AUDIO.SHOT.DURATION);
    } else if (type === 'hit') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(GAME_CONFIG.AUDIO.HIT.FREQ, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + GAME_CONFIG.AUDIO.HIT.DURATION);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + GAME_CONFIG.AUDIO.HIT.DURATION);
        osc.start(now);
        osc.stop(now + GAME_CONFIG.AUDIO.HIT.DURATION);
    } else if (type === 'gameover') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(GAME_CONFIG.AUDIO.GAMEOVER.FREQ, now);
        osc.frequency.linearRampToValueAtTime(50, now + GAME_CONFIG.AUDIO.GAMEOVER.DURATION);
        gainNode.gain.setValueAtTime(0.5, now);
        gainNode.gain.linearRampToValueAtTime(0.01, now + GAME_CONFIG.AUDIO.GAMEOVER.DURATION);
        osc.start(now);
        osc.stop(now + GAME_CONFIG.AUDIO.GAMEOVER.DURATION);
    }
}

// --- 4. 游戏系统 (全屏 Modal 版) ---
let gameTimer = null;
let gameActive = false;
let currentGameType = '';
let gameLoopFrame = null;
let gameTimeouts = []; // 存储所有 setTimeout ID

// 事件处理函数引用，用于移除监听器
let dodgeMouseHandler = null;
let dodgeTouchHandler = null;

// 清理游戏状态 (P2 & P0 修复)
function cleanupGame() {
    gameActive = false;
    
    // 清除定时器
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
    if (gameLoopFrame) {
        cancelAnimationFrame(gameLoopFrame);
        gameLoopFrame = null;
    }
    
    // 清除所有 setTimeout
    gameTimeouts.forEach(id => clearTimeout(id));
    gameTimeouts = [];
    
    // 移除事件监听器
    const container = document.getElementById('modal-game-content');
    if (container) {
        if (dodgeMouseHandler) {
            container.removeEventListener('mousemove', dodgeMouseHandler);
            dodgeMouseHandler = null;
        }
        if (dodgeTouchHandler) {
            container.removeEventListener('touchmove', dodgeTouchHandler);
            dodgeTouchHandler = null;
        }
        // 清空内容
        container.innerHTML = '';
    }
    
    // 重置 UI
    document.getElementById('modal-start-btn-container').style.display = 'flex';
}

// 打开游戏 Modal
function openGameModal(type) {
    cleanupGame(); // 确保打开前先清理
    currentGameType = type;
    const modal = document.getElementById('game-modal');
    const title = document.getElementById('modal-game-title');
    const startBtn = document.getElementById('modal-start-btn');
    
    modal.classList.remove('hidden');
    
    // 重置 UI
    document.getElementById('modal-score-val').innerText = '0';
    document.getElementById('modal-timer-val').innerText = type === 'aim' ? GAME_CONFIG.AIM_GAME.TIME : '0.0s';
    
    if (type === 'aim') {
        title.innerText = "🎯 射击训练场";
        startBtn.onclick = initAimGame;
        startBtn.className = "bg-green-600 hover:bg-green-500 text-white font-black text-xl px-8 py-3 rounded clip-path-polygon transition transform hover:scale-110";
    } else {
        title.innerText = "🪂 空投争夺战";
        startBtn.onclick = initDodgeGame;
        startBtn.className = "bg-blue-600 hover:bg-blue-500 text-white font-black text-xl px-8 py-3 rounded clip-path-polygon transition transform hover:scale-110";
    }
}

// 关闭游戏 Modal
function closeGameModal() {
    cleanupGame();
    document.getElementById('game-modal').classList.add('hidden');
}

// 封装 setTimeout 以便清理
function safeSetTimeout(fn, delay) {
    const id = setTimeout(() => {
        fn();
        // 执行后从数组移除 (可选优化，但 simplify 也可以)
    }, delay);
    gameTimeouts.push(id);
    return id;
}

// --- 射击游戏逻辑 ---
function initAimGame() {
    if (gameActive) return; // 防止重复点击
    cleanupGame(); // 再次确保清理
    
    gameActive = true;
    document.getElementById('modal-start-btn-container').style.display = 'none';
    playSound('shot');
    
    let score = 0;
    let timeLeft = GAME_CONFIG.AIM_GAME.TIME;
    const container = document.getElementById('modal-game-content');
    
    // 倒计时
    gameTimer = setInterval(() => {
        if (!gameActive) {
            clearInterval(gameTimer);
            return;
        }
        timeLeft--;
        document.getElementById('modal-timer-val').innerText = timeLeft;
        if (timeLeft <= 0) {
            endAimGame(score);
        }
    }, 1000);
    
    // 生成目标循环
    const spawnLoop = () => {
        if (!gameActive) return;
        spawnAimTarget(container, (points) => {
            score += points;
            document.getElementById('modal-score-val').innerText = score;
            
            const combo = document.createElement('div');
            combo.className = 'absolute text-yellow-300 font-bold text-2xl animate-bounce pointer-events-none';
            combo.style.left = '50%';
            combo.style.top = '10%';
            combo.innerText = "HIT!";
            container.appendChild(combo);
            safeSetTimeout(() => combo.remove(), 500);
        });
        
        let delay = Math.max(GAME_CONFIG.AIM_GAME.SPAWN_DELAY_MIN, GAME_CONFIG.AIM_GAME.SPAWN_DELAY_MAX - score * 5); 
        safeSetTimeout(spawnLoop, delay);
    };
    spawnLoop();
}

function spawnAimTarget(container, onHit) {
    const target = document.createElement('div');
    target.className = 'absolute cursor-pointer transform transition active:scale-90 flex items-center justify-center w-20 h-20 bg-transparent';
    
    const isRare = Math.random() > 0.7;
    const imgSrc = isRare ? 
        'https://cdn.jsdelivr.net/gh/pubg/api-assets@master/Assets/Item/Weapon/Main/Item_Weapon_HK416_C.png' : 
        'https://cdn.jsdelivr.net/gh/pubg/api-assets@master/Assets/Item/Weapon/Melee/Item_Weapon_Pan_C.png';
    
    target.innerHTML = `<img src="${imgSrc}" class="w-full h-full object-contain drop-shadow-2xl filter hover:brightness-125 transition">`;
    
    const maxX = container.offsetWidth - 80;
    const maxY = container.offsetHeight - 80;
    
    target.style.left = Math.random() * maxX + 'px';
    target.style.top = Math.random() * maxY + 'px';

    target.onclick = (e) => {
        e.stopPropagation();
        playSound('hit');
        onHit(isRare ? GAME_CONFIG.AIM_GAME.SCORE_RARE : GAME_CONFIG.AIM_GAME.SCORE_NORMAL);
        target.remove();
    };

    container.appendChild(target);

    safeSetTimeout(() => {
        if (target.parentNode) target.remove();
    }, isRare ? 800 : 1200);
}

function endAimGame(score) {
    cleanupGame();
    playSound('gameover');
    alert(`训练结束！\n最终得分: ${score}\n评价: ${getRank(score)}`);
}

function getRank(score) {
    if (score > 500) return "战神 (Conqueror)";
    if (score > 300) return "王牌 (Ace)";
    if (score > 100) return "皇冠 (Crown)";
    return "青铜 (Bronze)";
}

// --- 躲避游戏逻辑 ---
function initDodgeGame() {
    if (gameActive) return;
    cleanupGame(); // 再次确保清理
    
    gameActive = true;
    document.getElementById('modal-start-btn-container').style.display = 'none';
    playSound('shot');
    
    const container = document.getElementById('modal-game-content');
    const player = document.createElement('div');
    player.className = 'absolute bottom-4 w-12 h-12 transform -translate-x-1/2 transition-transform duration-75';
    player.innerHTML = '<img src="https://cdn.jsdelivr.net/gh/pubg/api-assets@master/Assets/Icons/CarePackage/CarePackage_Normal.png" class="w-full h-full object-contain drop-shadow-lg" alt="Player">';
    
    let playerX = container.offsetWidth / 2;
    player.style.left = playerX + 'px';
    container.appendChild(player);

    let survivalTime = 0;
    let obstacles = [];
    let speed = GAME_CONFIG.DODGE_GAME.SPEED_BASE;

    // 定义事件处理函数
    const updatePlayerPos = (clientX) => {
        const rect = container.getBoundingClientRect();
        let x = clientX - rect.left;
        if (x < 0) x = 0;
        if (x > rect.width) x = rect.width;
        playerX = x;
        player.style.left = x + 'px';
    };

    dodgeMouseHandler = (e) => updatePlayerPos(e.clientX);
    dodgeTouchHandler = (e) => {
        e.preventDefault(); 
        updatePlayerPos(e.touches[0].clientX);
    };

    // 添加监听器
    container.addEventListener('mousemove', dodgeMouseHandler);
    container.addEventListener('touchmove', dodgeTouchHandler, { passive: false });

    // 游戏循环
    const loop = () => {
        if (!gameActive) return;
        
        survivalTime += 0.02;
        document.getElementById('modal-timer-val').innerText = survivalTime.toFixed(1) + 's';
        
        speed = GAME_CONFIG.DODGE_GAME.SPEED_BASE + survivalTime * GAME_CONFIG.DODGE_GAME.SPEED_INC;

        if (Math.random() < GAME_CONFIG.DODGE_GAME.SPAWN_RATE_BASE + (survivalTime * GAME_CONFIG.DODGE_GAME.SPAWN_RATE_INC)) {
            const obs = document.createElement('div');
            obs.className = 'absolute w-10 h-10';
            obs.innerHTML = '<img src="https://cdn.jsdelivr.net/gh/pubg/api-assets@master/Assets/Item/Weapon/Melee/Item_Weapon_Pan_C.png" class="w-full h-full object-contain animate-spin" alt="Obstacle">';
            obs.style.top = '-40px';
            obs.style.left = Math.random() * (container.offsetWidth - 40) + 'px';
            container.appendChild(obs);
            obstacles.push({ el: obs, y: -40 });
        }

        for (let i = obstacles.length - 1; i >= 0; i--) {
            let obs = obstacles[i];
            obs.y += speed;
            obs.el.style.top = obs.y + 'px';

            const pRect = player.getBoundingClientRect();
            const oRect = obs.el.getBoundingClientRect();
            
            const padding = 10;
            if (!(pRect.right - padding < oRect.left + padding || 
                  pRect.left + padding > oRect.right - padding || 
                  pRect.bottom - padding < oRect.top + padding || 
                  pRect.top + padding > oRect.bottom - padding)) {
                
                playSound('gameover');
                alert(`空投坠毁！\n坚持时间: ${survivalTime.toFixed(2)}秒`);
                cleanupGame(); // 游戏结束清理
                return;
            }

            if (obs.y > container.offsetHeight) {
                obs.el.remove();
                obstacles.splice(i, 1);
            }
        }

        gameLoopFrame = requestAnimationFrame(loop);
    };
    loop();
}

// --- 5. 战力雷达图 (样式优化) ---
if (typeof Chart !== 'undefined') {
    const ctxChart = document.getElementById('skillsChart').getContext('2d');
    new Chart(ctxChart, {
        type: 'radar',
        data: {
            labels: GAME_CONFIG.SKILLS_CHART.LABELS,
            datasets: [{
                label: '能力值',
                data: GAME_CONFIG.SKILLS_CHART.DATA,
                backgroundColor: GAME_CONFIG.SKILLS_CHART.COLOR_BG,
                borderColor: GAME_CONFIG.SKILLS_CHART.COLOR_BORDER, 
                borderWidth: 2,
                pointBackgroundColor: GAME_CONFIG.SKILLS_CHART.COLOR_BORDER,
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: GAME_CONFIG.SKILLS_CHART.COLOR_BORDER,
                pointRadius: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)', circular: true },
                    pointLabels: {
                        color: '#9CA3AF', 
                        font: { size: 11, family: "'Segoe UI', sans-serif", weight: 'bold' }
                    },
                    ticks: { display: false, backdropColor: 'transparent' },
                    suggestedMin: 20,
                    suggestedMax: 100
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    titleColor: '#EAB308',
                    bodyColor: '#fff',
                    padding: 8,
                    displayColors: false,
                    callbacks: {
                        title: (items) => items[0].label,
                        label: (item) => `评分: ${item.raw} / 100`
                    }
                }
            }
        }
    });
} else {
    console.error('Chart.js failed to load.');
    const chartContainer = document.getElementById('skillsChart').parentElement;
    chartContainer.innerHTML = '<div class="text-gray-500 text-center flex items-center justify-center h-full">雷达图加载失败 / Radar Chart Load Failed</div>';
}

// --- 6. 信号枪逻辑 ---
function fireSignal() {
    playSound('shot');
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in';
    overlay.onclick = (e) => {
        if(e.target === overlay) overlay.remove();
    };

    overlay.innerHTML = `
        <div class="bg-gray-800 border-2 border-yellow-500 rounded-lg p-8 max-w-md text-center relative shadow-2xl transform scale-100 transition-transform">
            <div class="absolute -top-10 left-1/2 transform -translate-x-1/2">
                <img src="https://cdn.jsdelivr.net/gh/pubg/api-assets@master/Assets/Item/Weapon/Handgun/Item_Weapon_FlareGun_C.png" class="h-20 w-auto drop-shadow-lg filter brightness-110" alt="Flare Gun">
            </div>
            <h3 class="text-2xl font-black text-yellow-500 mt-8 mb-4">SIGNAL FLARE FIRED!</h3>
            <p class="text-gray-300 mb-6 leading-relaxed">
                信号弹已升空！空投支援正在路上... 📦<br>
                <span class="text-xs text-gray-500">指挥中心已收到请求 / Command Center Acknowledged</span>
            </p>
            <div class="bg-gray-900/50 p-4 rounded border border-gray-700 mb-6 text-sm text-gray-400 text-left">
                <p class="mb-2"><i class="fas fa-code-branch text-green-400 mr-2"></i> 欢迎前往项目仓库提交 <span class="text-green-400 font-bold">Pull Request</span></p>
                <p><i class="fas fa-comment-dots text-yellow-400 mr-2"></i> 或建立 <span class="text-yellow-400 font-bold">Issue</span> 留下您的联系方式</p>
            </div>
            <button onclick="this.closest('.fixed').remove()" class="bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 px-8 rounded clip-path-polygon transition transform hover:scale-105" aria-label="Close Signal">
                收到 / COPY THAT
            </button>
        </div>
    `;
    document.body.appendChild(overlay);
}
