// --- 0. 游戏配置常量 (Game Configuration) ---
const GAME_CONFIG = {
    SMOKE: {
        COUNT: 50,
        COLOR: 'rgba(100, 116, 139, ',
        SPEED_X: 1,
        SPEED_Y: 1
    },
    WORDS: {
        zh: ["大吉大利", "今晚吃鸡", "落地成盒", "扶我起来", "有空投", "跑毒", "98K", "三级头", "加油", "Nice!"],
        en: ["Winner Winner", "Chicken Dinner", "Loot Box", "Revive Me", "Airdrop", "Blue Zone", "Kar98k", "Lv3 Helmet", "Let's Go", "Nice!"]
    },
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
        LABELS: {
            zh: ['刚枪 (Code)', '指挥 (Plan)', 'AI Agent', 'Prompt', '跑图 (Ops)', '投掷 (Idea)'],
            en: ['Code', 'Plan', 'AI Agent', 'Prompt', 'Ops', 'Idea']
        },
        DATA: [95, 85, 92, 90, 88, 80],
        COLOR_BG: 'rgba(234, 179, 8, 0.4)',
        COLOR_BORDER: '#EAB308'
    }
};

// --- 多语言配置 (i18n) ---
const I18N = {
    zh: {
        title: "特种兵_RickinG | 个人主页",
        metaDesc: "RickinG 的战术指挥终端。沉浸式 PUBG 风格个人主页，集成作战数据与项目展示。Winner Winner, Chicken Dinner!",
        rank: "SS12 王牌",
        role: "前端突击手",
        tags: {
            react: "⚛️ React 爱好者",
            tailwind: "🌬️ Tailwind 战术",
            python: "🐍 Python 猎手",
            rust: "🦀 Rust 先锋",
            llm: "🤖 LLM 指挥官"
        },
        name: "特种兵_RickinG",
        quote: "落地一把98K，代码一行Bug Free。",
        motto: "<span class=\"text-green-500 mr-2\">//</span>好好学习，天天向上 <span class=\"mx-1 text-gray-700\">|</span> Good Good Study, Day Day Up",
        giteeBtn: "Gitee 仓库",
        githubBtn: "GitHub",
        stats: {
            title: "PLAYER STATS",
            timeLabel: "役期时长",
            timeVal: "16年",
            killLabel: "代码击杀数",
            killVal: "ERROR_0"
        },
        missions: {
            title: "MISSIONS",
            aim: { title: "射击训练场", desc: "反应速度测试" },
            dodge: { title: "空投争夺战", desc: "极限闪避挑战" }
        },
        warehouse: {
            title: "WAREHOUSE",
            legendary: "传说级",
            epic: "史诗级",
            tactical: {
                title: "特种兵战术终端",
                desc: "基于原生 HTML/CSS/JS 打造的沉浸式个人主页。集成 Gitee/GitHub 双战区入口，全套 PUBG 官方战术图标。",
                btnCode: "访问代码",
                btnDemo: "访问页面"
            },
            aqua: {
                title: "AquaInsight 水质分析",
                desc: "AI 驱动的地表水环境监测系统。结合 GIS 与 LLM 技术，深度挖掘气象-水质耦合机理。",
                btnCode: "访问代码",
                btnDemo: "访问页面"
            },
            nextDrop: {
                tag: "NEXT DROP",
                title: "绝密空投物资",
                desc: "下一波信号圈缩圈后投放。包含全新战术装备与功能模块，敬请期待。"
            },
            selectAction: "SELECT ACTION",
            backTip: "点击空白处返回"
        },
        footer: {
            operational: "All Systems Operational.",
            slogan: "Winner Winner, Chicken Dinner!"
        },
        modal: {
            start: "训练开始",
            score: "得分:",
            time: "时间:",
            btn: "START MISSION",
            tip: "<i class=\"fas fa-mouse-pointer mr-1\"></i> 点击/触摸屏幕操作 <span class=\"hidden md:inline mx-2\">|</span> <i class=\"fas fa-volume-up mr-1\"></i> 包含音效"
        },
        game: {
            hit: "HIT!",
            over: "训练结束！",
            score: "最终得分:",
            rank: "评价:",
            ranks: {
                conqueror: "战神 (Conqueror)",
                ace: "王牌 (Ace)",
                crown: "皇冠 (Crown)",
                bronze: "青铜 (Bronze)"
            },
            crash: "空投坠毁！",
            survive: "坚持时间:",
            seconds: "秒"
        },
        signal: {
            title: "SIGNAL FLARE FIRED!",
            desc: "信号弹已升空！空投支援正在路上... 📦<br><span class=\"text-xs text-gray-500\">指挥中心已收到请求 / Command Center Acknowledged</span>",
            pr: "欢迎前往项目仓库提交 <span class=\"text-green-400 font-bold\">Pull Request</span>",
            issue: "或建立 <span class=\"text-yellow-400 font-bold\">Issue</span> 留下您的联系方式",
            copy: "收到 / COPY THAT"
        }
    },
    en: {
        title: "Commando_RickinG | Personal HQ",
        metaDesc: "RickinG's Tactical Command Terminal. Immersive PUBG-style personal homepage with player stats and project showcase. Winner Winner, Chicken Dinner!",
        rank: "SS12 Ace",
        role: "Frontend Assault",
        tags: {
            react: "⚛️ React Enthusiast",
            tailwind: "🌬️ Tailwind Tactics",
            python: "🐍 Python Hunter",
            rust: "🦀 Rust Pioneer",
            llm: "🤖 LLM Commander"
        },
        name: "Commando_RickinG",
        quote: "Drop with a Kar98k, code with zero bugs.",
        motto: "<span class=\"text-green-500 mr-2\">//</span>Study hard, play hard <span class=\"mx-1 text-gray-700\">|</span> See you in the final circle",
        giteeBtn: "Gitee Repo",
        githubBtn: "GitHub",
        stats: {
            title: "PLAYER STATS",
            timeLabel: "Service Time",
            timeVal: "16 Yrs",
            killLabel: "Code Kills",
            killVal: "ERROR_0"
        },
        missions: {
            title: "MISSIONS",
            aim: { title: "Shooting Range", desc: "Reaction Test" },
            dodge: { title: "Airdrop Scramble", desc: "Extreme Evasion" }
        },
        warehouse: {
            title: "WAREHOUSE",
            legendary: "Legendary",
            epic: "Epic",
            tactical: {
                title: "Tactical Terminal",
                desc: "Immersive PUBG-style homepage built with HTML/CSS/JS. Integrated Gitee/GitHub portals and official tactical icons.",
                btnCode: "Code",
                btnDemo: "Demo"
            },
            aqua: {
                title: "AquaInsight Analysis",
                desc: "AI-driven water quality monitoring system. Combining GIS & LLM to uncover meteorological-water coupling mechanisms.",
                btnCode: "Code",
                btnDemo: "Demo"
            },
            nextDrop: {
                tag: "NEXT DROP",
                title: "Top Secret Drop",
                desc: "Arriving after the next circle shrink. Contains new tactical gear and modules. Stay tuned."
            },
            selectAction: "SELECT ACTION",
            backTip: "Click blank area to return"
        },
        footer: {
            operational: "All Systems Operational.",
            slogan: "Winner Winner, Chicken Dinner!"
        },
        modal: {
            start: "MISSION START",
            score: "Score:",
            time: "Time:",
            btn: "START MISSION",
            tip: "<i class=\"fas fa-mouse-pointer mr-1\"></i> Click/Touch to interact <span class=\"hidden md:inline mx-2\">|</span> <i class=\"fas fa-volume-up mr-1\"></i> Sound On"
        },
        game: {
            hit: "HIT!",
            over: "Mission Complete!",
            score: "Final Score:",
            rank: "Rank:",
            ranks: {
                conqueror: "Conqueror",
                ace: "Ace",
                crown: "Crown",
                bronze: "Bronze"
            },
            crash: "Airdrop Crashed!",
            survive: "Time Survived:",
            seconds: "s"
        },
        signal: {
            title: "SIGNAL FLARE FIRED!",
            desc: "Flare gun fired! Airdrop support is incoming... 📦<br><span class=\"text-xs text-gray-500\">Command Center Acknowledged</span>",
            pr: "Submit a <span class=\"text-green-400 font-bold\">Pull Request</span> to the repo",
            issue: "Or open an <span class=\"text-yellow-400 font-bold\">Issue</span> to leave contact info",
            copy: "COPY THAT"
        }
    }
};

let currentLang = 'zh'; // 默认中文

// 检测浏览器语言自动设置
function detectLanguage() {
    const lang = navigator.language || navigator.userLanguage; 
    if (lang.startsWith('en')) {
        setLanguage('en');
    } else {
        setLanguage('zh');
    }
}

function setLanguage(lang) {
    currentLang = lang;
    const t = I18N[lang];

    // 更新页面标题和 meta
    document.title = t.title;
    document.querySelector('meta[name="description"]').setAttribute("content", t.metaDesc);

    // 更新文本内容
    safeSetText('header-rank', t.rank);
    safeSetText('header-role', t.role);
    safeSetText('tag-react', t.tags.react);
    safeSetText('tag-tailwind', t.tags.tailwind);
    safeSetText('tag-python', t.tags.python);
    safeSetText('tag-rust', t.tags.rust);
    safeSetText('tag-llm', t.tags.llm);
    
    safeSetText('header-name', t.name);
    safeSetText('header-quote', `<i class="fas fa-quote-left text-gray-600 mr-2"></i>${t.quote}<i class="fas fa-quote-right text-gray-600 ml-2"></i>`, true);
    safeSetText('header-motto', t.motto, true);
    
    safeSetText('btn-gitee-text', t.giteeBtn);
    safeSetText('btn-github-text', t.githubBtn);
    
    safeSetText('stats-title', t.stats.title);
    safeSetText('stats-time-label', t.stats.timeLabel);
    safeSetText('stats-time-val', t.stats.timeVal);
    safeSetText('stats-kill-label', t.stats.killLabel);
    // stats-kill-val (ERROR_0) 不变

    safeSetText('missions-title', t.missions.title);
    safeSetText('mission-aim-title', t.missions.aim.title);
    safeSetText('mission-aim-desc', t.missions.aim.desc);
    safeSetText('mission-dodge-title', t.missions.dodge.title);
    safeSetText('mission-dodge-desc', t.missions.dodge.desc);

    safeSetText('warehouse-title', t.warehouse.title);
    
    // Tactical Terminal
    safeSetText('card-tactical-tag', t.warehouse.legendary);
    safeSetText('card-tactical-title', t.warehouse.tactical.title);
    safeSetText('card-tactical-desc', t.warehouse.tactical.desc);
    safeSetText('card-tactical-action', t.warehouse.selectAction);
    safeSetText('card-tactical-btn-code', t.warehouse.tactical.btnCode);
    safeSetText('card-tactical-btn-demo', t.warehouse.tactical.btnDemo);
    safeSetText('card-tactical-back-tip', t.warehouse.backTip);

    // AquaInsight
    safeSetText('card-aqua-tag', t.warehouse.epic);
    safeSetText('card-aqua-title', t.warehouse.aqua.title);
    safeSetText('card-aqua-desc', t.warehouse.aqua.desc);
    safeSetText('card-aqua-action', t.warehouse.selectAction);
    safeSetText('card-aqua-btn-code', t.warehouse.aqua.btnCode);
    safeSetText('card-aqua-btn-demo', t.warehouse.aqua.btnDemo);
    safeSetText('card-aqua-back-tip', t.warehouse.backTip);

    // Next Drop
    safeSetText('card-next-tag', t.warehouse.nextDrop.tag);
    safeSetText('card-next-title', t.warehouse.nextDrop.title);
    safeSetText('card-next-desc', t.warehouse.nextDrop.desc);

    // Footer
    safeSetText('footer-operational', `&copy; 2026 RickinG. ${t.footer.operational}`, true);
    safeSetText('footer-slogan', t.footer.slogan);

    // Modal
    safeSetText('modal-game-title', t.modal.start);
    safeSetText('modal-score-label', `${t.modal.score} <span id="modal-score-val" class="text-yellow-400">0</span>`, true);
    safeSetText('modal-timer-label', `${t.modal.time} <span id="modal-timer-val" class="text-red-400">00</span>`, true);
    safeSetText('modal-start-btn', t.modal.btn);
    safeSetText('modal-tip', t.modal.tip, true);

    // 更新图表
    updateChart(lang);
}

function safeSetText(id, text, isHTML = false) {
    const el = document.getElementById(id);
    if (el) {
        if (isHTML) el.innerHTML = text;
        else el.innerText = text;
    }
}

// 更新图表语言
let skillsChart = null;
function updateChart(lang) {
    if (skillsChart) skillsChart.destroy();
    
    if (typeof Chart !== 'undefined') {
        const ctxChart = document.getElementById('skillsChart').getContext('2d');
        skillsChart = new Chart(ctxChart, {
            type: 'radar',
            data: {
                labels: GAME_CONFIG.SKILLS_CHART.LABELS[lang],
                datasets: [{
                    label: lang === 'zh' ? '能力值' : 'Stats',
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
                            label: (item) => `${lang === 'zh' ? '评分' : 'Score'}: ${item.raw} / 100`
                        }
                    }
                }
            }
        });
    }
}

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
    if (e.target.tagName === 'BUTTON' || e.target.closest('a') || e.target.closest('.flip-card')) return;

    const span = document.createElement('span');
    span.className = 'float-text';
    span.style.left = e.pageX + 'px';
    span.style.top = e.pageY + 'px';
    
    // 使用当前语言的词库
    const words = GAME_CONFIG.WORDS[currentLang];
    span.innerText = words[Math.floor(Math.random() * words.length)];
    
    span.style.fontSize = (Math.random() * 10 + 12) + 'px';
    document.body.appendChild(span);

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
let gameTimeouts = []; 

let dodgeMouseHandler = null;
let dodgeTouchHandler = null;

function cleanupGame() {
    gameActive = false;
    
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
    if (gameLoopFrame) {
        cancelAnimationFrame(gameLoopFrame);
        gameLoopFrame = null;
    }
    
    gameTimeouts.forEach(id => clearTimeout(id));
    gameTimeouts = [];
    
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
        container.innerHTML = '';
    }
    
    document.getElementById('modal-start-btn-container').style.display = 'flex';
}

function openGameModal(type) {
    cleanupGame(); 
    currentGameType = type;
    const modal = document.getElementById('game-modal');
    const startBtn = document.getElementById('modal-start-btn');
    
    modal.classList.remove('hidden');
    
    document.getElementById('modal-score-val').innerText = '0';
    document.getElementById('modal-timer-val').innerText = type === 'aim' ? GAME_CONFIG.AIM_GAME.TIME : '0.0s';
    
    if (type === 'aim') {
        startBtn.onclick = initAimGame;
        startBtn.className = "bg-green-600 hover:bg-green-500 text-white font-black text-xl px-8 py-3 rounded clip-path-polygon transition transform hover:scale-110";
    } else {
        startBtn.onclick = initDodgeGame;
        startBtn.className = "bg-blue-600 hover:bg-blue-500 text-white font-black text-xl px-8 py-3 rounded clip-path-polygon transition transform hover:scale-110";
    }
}

function closeGameModal() {
    cleanupGame();
    document.getElementById('game-modal').classList.add('hidden');
}

function safeSetTimeout(fn, delay) {
    const id = setTimeout(() => {
        fn();
    }, delay);
    gameTimeouts.push(id);
    return id;
}

// --- 射击游戏逻辑 ---
function initAimGame() {
    if (gameActive) return; 
    cleanupGame(); 
    
    gameActive = true;
    document.getElementById('modal-start-btn-container').style.display = 'none';
    playSound('shot');
    
    let score = 0;
    let timeLeft = GAME_CONFIG.AIM_GAME.TIME;
    const container = document.getElementById('modal-game-content');
    
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
    
    const spawnLoop = () => {
        if (!gameActive) return;
        spawnAimTarget(container, (points) => {
            score += points;
            document.getElementById('modal-score-val').innerText = score;
            
            const combo = document.createElement('div');
            combo.className = 'absolute text-yellow-300 font-bold text-2xl animate-bounce pointer-events-none';
            combo.style.left = '50%';
            combo.style.top = '10%';
            combo.innerText = I18N[currentLang].game.hit; // 多语言
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
    const t = I18N[currentLang].game;
    alert(`${t.over}\n${t.score} ${score}\n${t.rank} ${getRank(score)}`);
}

function getRank(score) {
    const t = I18N[currentLang].game.ranks;
    if (score > 500) return t.conqueror;
    if (score > 300) return t.ace;
    if (score > 100) return t.crown;
    return t.bronze;
}

// --- 躲避游戏逻辑 ---
function initDodgeGame() {
    if (gameActive) return;
    cleanupGame(); 
    
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

    container.addEventListener('mousemove', dodgeMouseHandler);
    container.addEventListener('touchmove', dodgeTouchHandler, { passive: false });

    const loop = () => {
        if (!gameActive) return;
        
        survivalTime += 0.02;
        document.getElementById('modal-timer-val').innerText = survivalTime.toFixed(1) + I18N[currentLang].game.seconds;
        
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
                const t = I18N[currentLang].game;
                alert(`${t.crash}\n${t.survive} ${survivalTime.toFixed(2)}${t.seconds}`);
                cleanupGame(); 
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

// --- 6. 信号枪逻辑 ---
function fireSignal() {
    playSound('shot');
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in';
    overlay.onclick = (e) => {
        if(e.target === overlay) overlay.remove();
    };

    const t = I18N[currentLang].signal;
    overlay.innerHTML = `
        <div class="bg-gray-800 border-2 border-yellow-500 rounded-lg p-8 max-w-md text-center relative shadow-2xl transform scale-100 transition-transform">
            <div class="absolute -top-10 left-1/2 transform -translate-x-1/2">
                <img src="https://cdn.jsdelivr.net/gh/pubg/api-assets@master/Assets/Item/Weapon/Handgun/Item_Weapon_FlareGun_C.png" class="h-20 w-auto drop-shadow-lg filter brightness-110" alt="Flare Gun">
            </div>
            <h3 class="text-2xl font-black text-yellow-500 mt-8 mb-4">${t.title}</h3>
            <p class="text-gray-300 mb-6 leading-relaxed">
                ${t.desc}
            </p>
            <div class="bg-gray-900/50 p-4 rounded border border-gray-700 mb-6 text-sm text-gray-400 text-left">
                <p class="mb-2"><i class="fas fa-code-branch text-green-400 mr-2"></i> ${t.pr}</p>
                <p><i class="fas fa-comment-dots text-yellow-400 mr-2"></i> ${t.issue}</p>
            </div>
            <button onclick="this.closest('.fixed').remove()" class="bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 px-8 rounded clip-path-polygon transition transform hover:scale-105" aria-label="Close Signal">
                ${t.copy}
            </button>
        </div>
    `;
    document.body.appendChild(overlay);
}

// 初始化时检测语言
detectLanguage();
