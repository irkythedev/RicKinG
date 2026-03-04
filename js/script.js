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
        this.vx = (Math.random() - 0.5) * 1; // 水平飘动速度
        this.vy = -Math.random() * 1 - 0.5;  // 上升速度
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
        ctx.fillStyle = `rgba(100, 116, 139, ${this.opacity})`; // 灰蓝色烟雾
        ctx.fill();
    }
}

// 初始化50个粒子
for (let i = 0; i < 50; i++) {
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
const gameWords = ["大吉大利", "今晚吃鸡", "落地成盒", "扶我起来", "有空投", "跑毒", "98K", "三级头", "加油", "Nice!"];

function showClickEffect(e) {
    // 如果点击的是按钮，就不显示特效，避免干扰
    if (e.target.tagName === 'BUTTON' || e.target.closest('a') || e.target.closest('.flip-card')) return;

    const span = document.createElement('span');
    span.className = 'float-text';
    span.style.left = e.pageX + 'px';
    span.style.top = e.pageY + 'px';
    // 随机选择一个词
    span.innerText = gameWords[Math.floor(Math.random() * gameWords.length)];
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
        // 射击声：短促的高频噪声模拟
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.1);
        gainNode.gain.setValueAtTime(0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'hit') {
        // 击中声：清脆的高音
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'gameover') {
        // 结束声：低沉长音
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(50, now + 1);
        gainNode.gain.setValueAtTime(0.5, now);
        gainNode.gain.linearRampToValueAtTime(0.01, now + 1);
        osc.start(now);
        osc.stop(now + 1);
    }
}

// --- 4. 游戏系统 (全屏 Modal 版) ---
let gameTimer = null;
let gameActive = false;
let currentGameType = '';
let gameLoopFrame = null;

// 打开游戏 Modal
function openGameModal(type) {
    currentGameType = type;
    const modal = document.getElementById('game-modal');
    const title = document.getElementById('modal-game-title');
    const startBtn = document.getElementById('modal-start-btn');
    
    modal.classList.remove('hidden');
    
    // 重置 UI
    document.getElementById('modal-score-val').innerText = '0';
    document.getElementById('modal-timer-val').innerText = type === 'aim' ? '10' : '0.0s';
    document.getElementById('modal-start-btn-container').style.display = 'flex';
    document.getElementById('modal-game-content').innerHTML = ''; // 清空旧内容
    
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
    stopGame();
    document.getElementById('game-modal').classList.add('hidden');
}

function stopGame() {
    gameActive = false;
    if (gameTimer) clearInterval(gameTimer);
    if (gameLoopFrame) cancelAnimationFrame(gameLoopFrame);
    document.getElementById('modal-start-btn-container').style.display = 'flex';
}

// --- 射击游戏逻辑 ---
function initAimGame() {
    if (gameActive) return;
    gameActive = true;
    document.getElementById('modal-start-btn-container').style.display = 'none';
    playSound('shot'); // 开始音效
    
    let score = 0;
    let timeLeft = 15; // 增加时间到15秒
    const container = document.getElementById('modal-game-content');
    
    // 倒计时
    const timerInterval = setInterval(() => {
        if (!gameActive) {
            clearInterval(timerInterval);
            return;
        }
        timeLeft--;
        document.getElementById('modal-timer-val').innerText = timeLeft;
        if (timeLeft <= 0) {
            endAimGame(score);
            clearInterval(timerInterval);
        }
    }, 1000);
    
    // 生成目标循环
    const spawnLoop = () => {
        if (!gameActive) return;
        spawnAimTarget(container, (points) => {
            score += points;
            document.getElementById('modal-score-val').innerText = score;
            // 击中特效
            const combo = document.createElement('div');
            combo.className = 'absolute text-yellow-300 font-bold text-2xl animate-bounce pointer-events-none';
            combo.style.left = '50%';
            combo.style.top = '10%';
            combo.innerText = "HIT!";
            container.appendChild(combo);
            setTimeout(() => combo.remove(), 500);
        });
        
        // 动态调整生成速度
        let delay = Math.max(300, 800 - score * 5); 
        setTimeout(spawnLoop, delay);
    };
    spawnLoop();
}

function spawnAimTarget(container, onHit) {
    const target = document.createElement('div');
    // 目标更大了，方便手机点击
    target.className = 'absolute cursor-pointer transform transition active:scale-90 flex items-center justify-center w-20 h-20 bg-transparent';
    
    // 随机平底锅(普通)或M416(高分)
    const isRare = Math.random() > 0.7;
    // 使用官方资源
    const imgSrc = isRare ? 
        'https://cdn.jsdelivr.net/gh/pubg/api-assets@master/Assets/Item/Weapon/Main/Item_Weapon_HK416_C.png' : 
        'https://cdn.jsdelivr.net/gh/pubg/api-assets@master/Assets/Item/Weapon/Melee/Item_Weapon_Pan_C.png';
    
    target.innerHTML = `<img src="${imgSrc}" class="w-full h-full object-contain drop-shadow-2xl filter hover:brightness-125 transition">`;
    
    // 必须减去目标大小
    const maxX = container.offsetWidth - 80;
    const maxY = container.offsetHeight - 80;
    
    target.style.left = Math.random() * maxX + 'px';
    target.style.top = Math.random() * maxY + 'px';

    target.onclick = (e) => {
        e.stopPropagation();
        playSound('hit');
        onHit(isRare ? 50 : 10);
        target.remove();
    };

    container.appendChild(target);

    // 自动消失时间
    setTimeout(() => {
        if (target.parentNode) target.remove();
    }, isRare ? 800 : 1200);
}

function endAimGame(score) {
    gameActive = false;
    playSound('gameover');
    alert(`训练结束！\n最终得分: ${score}\n评价: ${getRank(score)}`);
    stopGame();
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
    gameActive = true;
    document.getElementById('modal-start-btn-container').style.display = 'none';
    playSound('shot'); // 开始音效
    
    const container = document.getElementById('modal-game-content');
    const player = document.createElement('div');
    // 使用空投箱作为玩家
    player.className = 'absolute bottom-4 w-12 h-12 transform -translate-x-1/2 transition-transform duration-75';
    player.innerHTML = '<img src="https://cdn.jsdelivr.net/gh/pubg/api-assets@master/Assets/Icons/CarePackage/CarePackage_Normal.png" class="w-full h-full object-contain drop-shadow-lg">';
    
    // 初始位置
    let playerX = container.offsetWidth / 2;
    player.style.left = playerX + 'px';
    container.appendChild(player);

    let survivalTime = 0;
    let obstacles = [];
    let speed = 3;

    // 触控/鼠标控制
    const updatePlayerPos = (clientX) => {
        const rect = container.getBoundingClientRect();
        let x = clientX - rect.left;
        if (x < 0) x = 0;
        if (x > rect.width) x = rect.width;
        playerX = x;
        player.style.left = x + 'px';
    };

    const mouseHandler = (e) => updatePlayerPos(e.clientX);
    const touchHandler = (e) => {
        e.preventDefault(); 
        updatePlayerPos(e.touches[0].clientX);
    };

    container.addEventListener('mousemove', mouseHandler);
    container.addEventListener('touchmove', touchHandler, { passive: false });

    // 游戏循环
    const loop = () => {
        if (!gameActive) return;
        
        survivalTime += 0.02; // 60fps approx
        document.getElementById('modal-timer-val').innerText = survivalTime.toFixed(1) + 's';
        
        // 难度随时间增加
        speed = 3 + survivalTime * 0.2;

        // 生成障碍物 (平底锅)
        if (Math.random() < 0.05 + (survivalTime * 0.002)) {
            const obs = document.createElement('div');
            obs.className = 'absolute w-10 h-10'; // 稍大的障碍物
            obs.innerHTML = '<img src="https://cdn.jsdelivr.net/gh/pubg/api-assets@master/Assets/Item/Weapon/Melee/Item_Weapon_Pan_C.png" class="w-full h-full object-contain animate-spin">';
            obs.style.top = '-40px';
            obs.style.left = Math.random() * (container.offsetWidth - 40) + 'px';
            container.appendChild(obs);
            obstacles.push({ el: obs, y: -40 });
        }

        // 移动与碰撞
        for (let i = obstacles.length - 1; i >= 0; i--) {
            let obs = obstacles[i];
            obs.y += speed;
            obs.el.style.top = obs.y + 'px';

            // 碰撞检测
            const pRect = player.getBoundingClientRect();
            const oRect = obs.el.getBoundingClientRect();
            
            // 简单的矩形碰撞，略微缩小判定范围以增加容错
            const padding = 10; // 增加内缩，因为图片有透明边缘
            if (!(pRect.right - padding < oRect.left + padding || 
                  pRect.left + padding > oRect.right - padding || 
                  pRect.bottom - padding < oRect.top + padding || 
                  pRect.top + padding > oRect.bottom - padding)) {
                
                // Game Over
                gameActive = false;
                playSound('gameover');
                container.removeEventListener('mousemove', mouseHandler);
                container.removeEventListener('touchmove', touchHandler);
                alert(`空投坠毁！\n坚持时间: ${survivalTime.toFixed(2)}秒`);
                stopGame();
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
const ctxChart = document.getElementById('skillsChart').getContext('2d');
new Chart(ctxChart, {
    type: 'radar',
    data: {
        labels: ['刚枪 (Code)', '指挥 (Plan)', 'AI Agent', 'Prompt', '跑图 (Ops)', '投掷 (Idea)'],
        datasets: [{
            label: '能力值',
            data: [95, 85, 92, 90, 88, 80],
            backgroundColor: 'rgba(234, 179, 8, 0.4)', // 填充色加深
            borderColor: '#EAB308', 
            borderWidth: 2,
            pointBackgroundColor: '#EAB308',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#EAB308',
            pointRadius: 3
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                angleLines: {
                    color: 'rgba(255, 255, 255, 0.1)' 
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)', 
                    circular: true 
                },
                pointLabels: {
                    color: '#9CA3AF', 
                    font: {
                        size: 11, // 移动端适配：稍微调小字体
                        family: "'Segoe UI', sans-serif",
                        weight: 'bold'
                    }
                },
                ticks: {
                    display: false, 
                    backdropColor: 'transparent'
                },
                suggestedMin: 20,
                suggestedMax: 100
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.9)', // 匹配深色主题
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

// --- 6. 信号枪逻辑 ---
function fireSignal() {
    playSound('shot');
    // 创建一个临时的全屏 Overlay
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in';
    // 点击背景关闭
    overlay.onclick = (e) => {
        if(e.target === overlay) overlay.remove();
    };

    overlay.innerHTML = `
        <div class="bg-gray-800 border-2 border-yellow-500 rounded-lg p-8 max-w-md text-center relative shadow-2xl transform scale-100 transition-transform">
            <div class="absolute -top-10 left-1/2 transform -translate-x-1/2">
                <img src="https://cdn.jsdelivr.net/gh/pubg/api-assets@master/Assets/Item/Weapon/Handgun/Item_Weapon_FlareGun_C.png" class="h-20 w-auto drop-shadow-lg filter brightness-110">
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
            <button onclick="this.closest('.fixed').remove()" class="bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 px-8 rounded clip-path-polygon transition transform hover:scale-105">
                收到 / COPY THAT
            </button>
        </div>
    `;
    document.body.appendChild(overlay);
}
