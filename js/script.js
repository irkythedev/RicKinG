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
    
    // Add random offset to prevent perfect stacking
    const offsetX = (Math.random() - 0.5) * 40; // -20px to +20px
    const offsetY = (Math.random() - 0.5) * 40;
    
    span.style.left = (e.pageX + offsetX) + 'px';
    span.style.top = (e.pageY + offsetY) + 'px';
    
    const lang = window.getComputedLang ? window.getComputedLang() : currentLang;
    const words = GAME_CONFIG.WORDS[lang];
    span.innerText = words[Math.floor(Math.random() * words.length)];
    
    span.style.fontSize = (Math.random() * 10 + 12) + 'px';
    document.body.appendChild(span);

    setTimeout(() => {
        span.remove();
    }, 1000);
}
// Attach to window for global access
window.addEventListener('click', showClickEffect);


// --- 3. 游戏入口绑定 (Event Delegation) ---
document.addEventListener('click', (e) => {
    const gameBtn = e.target.closest('[data-game]');
    if (gameBtn) {
        const gameType = gameBtn.dataset.game;
        gameManager.openModal(gameType);
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        const gameBtn = e.target.closest('[data-game]');
        if (gameBtn) {
            e.preventDefault(); // Prevent scroll
            const gameType = gameBtn.dataset.game;
            gameManager.openModal(gameType);
        }
    }
});

// Expose closeGameModal globally for the close button in HTML
window.closeGameModal = () => gameManager.closeModal();


// --- 4. 多语言支持 ---

window.setLanguage = function(lang) {
    if (lang !== currentLang) {
        setCurrentLang(lang);
    }
    const t = I18N[lang];
    if (!t) return; // Safety check

    document.title = t.title;
    document.querySelector('meta[name="description"]').setAttribute("content", t.metaDesc);

    const safeSetText = (id, text, isHTML = false) => {
        const el = document.getElementById(id);
        if (el) {
            if (isHTML) el.innerHTML = text;
            else el.innerText = text;
        }
    };

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

    safeSetText('missions-title', t.missions.title);
    safeSetText('mission-aim-title', t.missions.aim.title);
    safeSetText('mission-aim-desc', t.missions.aim.desc);
    safeSetText('mission-dodge-title', t.missions.dodge.title);
    safeSetText('mission-dodge-desc', t.missions.dodge.desc);
    safeSetText('mission-more-title', t.missions.more.title);
    safeSetText('mission-more-desc', t.missions.more.desc);
    safeSetText('mission-more-coming', t.missions.more.coming);

    safeSetText('warehouse-title', t.warehouse.title);
    
    safeSetText('card-tactical-tag', t.warehouse.legendary);
    safeSetText('card-tactical-title', t.warehouse.tactical.title);
    safeSetText('card-tactical-desc', t.warehouse.tactical.desc);
    safeSetText('card-tactical-action', t.warehouse.selectAction);
    safeSetText('card-tactical-btn-code', t.warehouse.tactical.btnCode);
    safeSetText('card-tactical-btn-demo', t.warehouse.tactical.btnDemo);
    safeSetText('card-tactical-back-tip', t.warehouse.backTip);

    safeSetText('card-aqua-tag', t.warehouse.epic);
    safeSetText('card-aqua-title', t.warehouse.aqua.title);
    safeSetText('card-aqua-desc', t.warehouse.aqua.desc);
    safeSetText('card-aqua-action', t.warehouse.selectAction);
    safeSetText('card-aqua-btn-code', t.warehouse.aqua.btnCode);
    safeSetText('card-aqua-btn-demo', t.warehouse.aqua.btnDemo);
    safeSetText('card-aqua-back-tip', t.warehouse.backTip);

    safeSetText('card-next-tag', t.warehouse.nextDrop.tag);
    safeSetText('card-next-title', t.warehouse.nextDrop.title);
    safeSetText('card-next-desc', t.warehouse.nextDrop.desc);

    safeSetText('footer-operational', `&copy; 2026 RickinG. ${t.footer.operational}`, true);
    safeSetText('footer-slogan', t.footer.slogan);

    safeSetText('modal-game-title', t.modal.start);
    safeSetText('modal-score-label', `${t.modal.score} <span id="modal-score-val" class="text-yellow-400">0</span>`, true);
    safeSetText('modal-timer-label', `${t.modal.time} <span id="modal-timer-val" class="text-red-400">00</span>`, true);
    safeSetText('modal-start-btn', t.modal.btn);
    safeSetText('modal-tip', t.modal.tip, true);

    updateChart(lang);
};

function detectLanguage() {
    const lang = navigator.language || navigator.userLanguage; 
    if (lang.startsWith('en')) {
        window.setLanguage('en');
    } else {
        window.setLanguage('zh');
    }
}

// Expose helper to get current lang from config module
window.getComputedLang = () => currentLang;

// --- 5. 战力雷达图 ---
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

// --- 6. 信号枪逻辑 ---
window.fireSignal = function() {
    playSound('shot');
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in';
    overlay.onclick = (e) => {
        if(e.target === overlay) overlay.remove();
    };

    const lang = window.getComputedLang ? window.getComputedLang() : currentLang;
    const t = I18N[lang].signal;
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
};

// --- 7. 创意提交逻辑 ---
window.showIdeaModal = function() {
    playSound('shot');
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in';
    overlay.onclick = (e) => {
        if(e.target === overlay) overlay.remove();
    };

    const lang = window.getComputedLang ? window.getComputedLang() : currentLang;
    const t = I18N[lang].idea;
    const issueLink = "https://github.com/K4Ricky2Win/RicKinG/issues/new"; // Update with actual repo URL if different
    
    overlay.innerHTML = `
        <div class="bg-gray-800 border-2 border-green-500 rounded-lg p-8 max-w-md text-center relative shadow-2xl transform scale-100 transition-transform">
            <div class="absolute -top-10 left-1/2 transform -translate-x-1/2">
                <div class="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center border-4 border-green-500 shadow-lg">
                    <i class="fas fa-lightbulb text-green-400 text-4xl animate-pulse"></i>
                </div>
            </div>
            <h3 class="text-2xl font-black text-green-400 mt-8 mb-4">${t.title}</h3>
            <p class="text-gray-300 mb-6 leading-relaxed">
                ${t.desc}
            </p>
            <a href="${issueLink}" target="_blank" onclick="this.closest('.fixed').remove()" class="inline-block bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded clip-path-polygon transition transform hover:scale-105 no-underline">
                <i class="fab fa-github mr-2"></i> ${t.action}
            </a>
            <div class="mt-4">
                <button onclick="this.closest('.fixed').remove()" class="text-sm text-gray-500 hover:text-gray-300 transition underline">
                    Cancel / 取消
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
};

// 初始化
detectLanguage();