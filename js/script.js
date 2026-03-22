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

// --- 战术准星控制系统 (Custom Tactical Cursor) ---
(function initTacticalCursor() {
    // 仅在有高精度鼠标指针的设备（PC端）上启用，防止触屏设备出现乱入的光标
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const cursor = document.getElementById('tactical-cursor');
    if (!cursor) return;
    const recoilWrapper = cursor.querySelector('.cursor-recoil-wrapper');

    // 默认初始居中，防止未移动鼠标前光标闪现到 0,0
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    // 追踪鼠标移动
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        // 使用 translate3d 获得最佳硬件加速性能，减去半个宽度(16px)以强制定心
        cursor.style.transform = `translate3d(${mouseX - 16}px, ${mouseY - 16}px, 0)`;
        
        // 目标锁定状态检测
        const target = e.target;
        const isClickable = target.closest('a, button, [role="button"], .cursor-pointer, .gitee-heatmap-cell, .achievement-badge, .flip-card');
        
        if (isClickable) {
            cursor.classList.add('locked');
        } else {
            cursor.classList.remove('locked');
        }
    });

    // 模拟后坐力散布跳动
    document.addEventListener('mousedown', () => {
        recoilWrapper.classList.remove('firing');
        void recoilWrapper.offsetWidth; // 触发 reflow 重绘，才能保证连续点击能重复播放动画
        recoilWrapper.classList.add('firing');
    });

    recoilWrapper.addEventListener('animationend', () => {
        recoilWrapper.classList.remove('firing');
    });

    // 鼠标离开/进入浏览器窗口区域时，隐藏/显示准星
    document.addEventListener('mouseout', (e) => {
        if (!e.relatedTarget) cursor.style.display = 'none';
    });
    document.addEventListener('mouseover', () => {
        cursor.style.display = '';
    });
})();

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
function bindGameEntrances() {
    const cards = document.querySelectorAll('[data-game]');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const type = card.dataset.game;
            if (type) gameManager.openModal(type);
        });
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const type = card.dataset.game;
                if (type) gameManager.openModal(type);
            }
        });
    });
}

// Expose closeGameModal globally for the close button in HTML
window.closeGameModal = () => gameManager.closeModal();



// --- 一键收藏日志与HUD反馈 (Collect & Loot System) ---
window.collectToBackpack = function() {
    const isCollected = localStorage.getItem('r_collected') === 'true';
    const lang = window.getComputedLang ? window.getComputedLang() : 'zh';

    if (isCollected) {
        window.showTacticalToast(lang === 'zh' ? '长官，该终端已被收入三级包，无需重复拾取！' : 'Terminal already secured in Backpack!');
        return;
    }

    // 视觉反馈更新
    document.getElementById('collect-icon').classList.add('brightness-125');
    const textEl = document.getElementById('collect-text');
    if (textEl) {
        textEl.textContent = lang === 'zh' ? '已被拾取' : 'SECURED';
        textEl.classList.replace('text-gray-500', 'text-yellow-500');
        textEl.classList.replace('opacity-0', 'opacity-100');
        textEl.classList.remove('group-hover:opacity-100');
    }
    document.getElementById('collect-badge').classList.remove('hidden');

    localStorage.setItem('r_collected', 'true');
    
    // HUD 雷达提示
    window.showTacticalToast(lang === 'zh' ? '物资拾取成功！终端已收入三级包安全库。' : 'Loot successful! Terminal secured in Level 3 Backpack.');
};

// HUD 自制 Toast 系统
window.showTacticalToast = function(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-12 left-1/2 transform -translate-x-1/2 -translate-y-4 z-[99999] bg-[#1a1b1e] border-l-4 border-yellow-500 text-white px-6 py-3 shadow-[0_4px_20px_rgba(234,179,8,0.3)] flex items-center gap-3 pointer-events-none opacity-0 transition-all duration-300';
    toast.innerHTML = `
        <i class="fas fa-box-open text-yellow-500 text-xl animate-pulse"></i>
        <span class="font-bold tracking-widest text-sm drop-shadow-md font-mono">${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Fade in
    requestAnimationFrame(() => {
        toast.classList.replace('opacity-0', 'opacity-100');
        toast.classList.replace('-translate-y-4', 'translate-y-0');
    });

    // Destroy
    setTimeout(() => {
        toast.classList.replace('opacity-100', 'opacity-0');
        toast.classList.replace('translate-y-0', '-translate-y-4');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// 页面加载时检查拾取状态
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('r_collected') === 'true') {
        const lang = window.getComputedLang ? window.getComputedLang() : 'zh';
        document.getElementById('collect-icon').classList.add('brightness-125');
        const textEl = document.getElementById('collect-text');
        if (textEl) {
            textEl.textContent = lang === 'zh' ? '已被拾取' : 'SECURED';
            textEl.classList.replace('text-gray-500', 'text-yellow-500');
            textEl.classList.replace('opacity-0', 'opacity-100');
            textEl.classList.remove('group-hover:opacity-100');
        }
        document.getElementById('collect-badge').classList.remove('hidden');
    }
});

// --- 生物特征认证扫描仪 (ID Scan Protocol) ---
window.startIdentifyScan = async function() {
    // 1. 获取访客特征 (客户端)
    const ua = navigator.userAgent;
    let browser = "UAV Unknown System";
    if (ua.indexOf("Firefox") > -1) browser = "Firefox Tactical Optics";
    else if (ua.indexOf("Edg") > -1) browser = "Edge Recon Lens";
    else if (ua.indexOf("Chrome") > -1) browser = "Chrome Scope 8x";
    else if (ua.indexOf("Safari") > -1) browser = "Safari Night Vision";

    let os = "Unknown Territory";
    if (ua.indexOf("Win") > -1) os = "Windows Ground Base";
    else if (ua.indexOf("Mac") > -1) os = "macOS Airborne Unit";
    else if (ua.indexOf("Linux") > -1) os = "Linux Covert Ops";
    else if (ua.indexOf("Android") > -1) os = "Android Mobile Recon";
    else if (ua.indexOf("iPhone") > -1 || ua.indexOf("iPad") > -1) os = "iOS Mobile Recon";
    
    // 2. 创建覆盖层 (不再全屏黑屏遮挡，仅保留极淡的暗化以便聚焦)
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[999999] bg-black/40 backdrop-blur-[2px] flex items-center justify-center font-mono overflow-hidden transition-all duration-300';
    // 点击背景空白处关闭
    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
    };
    
    // 3. 弹窗容器 (迷你版，PUBG UI风格的黄灰配色，类似小面板)
    const terminal = document.createElement('div');
    terminal.className = 'relative w-[85%] max-w-sm border border-gray-600 p-4 md:p-6 shadow-2xl bg-gray-900/95 text-gray-300 rounded-md';
    
    terminal.innerHTML = `
        <div class="absolute inset-0 pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-b before:from-transparent before:via-yellow-500/10 before:to-transparent before:animate-bio-scan overflow-hidden rounded-md"></div>
        <div class="flex items-center gap-3 mb-4 border-b border-gray-700 pb-3 relative z-10 w-full">
            <i class="fas fa-fingerprint text-2xl text-yellow-500 animate-pulse drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]"></i>
            <div>
                <h2 class="text-sm md:text-base font-bold tracking-widest text-yellow-500 m-0 leading-tight">IDENTITY_SCAN</h2>
                <div class="text-[9px] md:text-[10px] text-gray-500 mt-1 uppercase">Tactical Auth Protocol</div>
            </div>
            <button class="ml-auto text-gray-500 hover:text-red-500 transition-colors font-bold text-lg px-2 focus:outline-none" onclick="this.closest('.fixed').remove()">×</button>
        </div>
        <div id="scan-log" class="text-xs space-y-2 h-36 md:h-40 overflow-y-auto relative z-10 tracking-wide pr-2"></div>
        <div class="mt-4 pt-3 border-t border-gray-700 text-[9px] text-gray-500 w-full flex justify-between relative z-10 font-bold uppercase">
            <span>[ Encrypted Connection ]</span>
            <span class="text-yellow-500 animate-pulse">● Secure</span>
        </div>
    `;
    
    overlay.appendChild(terminal);
    document.body.appendChild(overlay);
    
    const logBox = overlay.querySelector('#scan-log');
    
    // 文本机打字机复用器
    const typeWriter = async (text, speed = 20) => {
        const line = document.createElement('div');
        logBox.appendChild(line);
        let i = 0;
        return new Promise(res => {
            const timer = setInterval(() => {
                line.textContent += text.charAt(i);
                logBox.scrollTop = logBox.scrollHeight;
                i++;
                if (i >= text.length) {
                    clearInterval(timer);
                    res();
                }
            }, speed);
        });
    };

    const delay = ms => new Promise(r => setTimeout(r, ms));
    
    await typeWriter("> 初始化身份雷达扫描协议...");
    await delay(300);
    await typeWriter("> 正在锁定目标生物坐标，请求安全放行权限...");
    await delay(500);
    
    let ip = "SIGNAL INTERCEPTED";
    try {
        const res = await fetch('https://api.ipify.org?format=json');
        if (res.ok) {
            const data = await res.json();
            ip = data.ip;
        }
    } catch(e) {}

    await typeWriter(`> [ 雷达追踪 ] IPv4 作战坐标定位: ${ip}`, 15);
    await delay(400);
    await typeWriter(`> [ 硬件防线 ] 终端火力型号: ${os}`, 15);
    await delay(400);
    await typeWriter(`> [ 光学侦查 ] 准镜光学引擎: ${browser}`, 15);
    await delay(600);
    await typeWriter("> 正在拉取国际防务指纹数据库进行比对...");
    await delay(800);
    
    const lineRes = document.createElement('div');
    lineRes.className = 'text-yellow-400 mt-3 mb-2 font-bold animate-pulse text-[13px] border-l-4 border-yellow-400 pl-2 bg-yellow-400/10 py-1';
    lineRes.textContent = ">> 身份标记：[ 友军 ]。欢迎回归！";
    logBox.appendChild(lineRes);
    
    const btnEnter = document.createElement('button');
    btnEnter.className = 'w-full mt-3 bg-yellow-500/20 hover:bg-yellow-500 hover:text-gray-900 border border-yellow-500/50 text-yellow-500 py-1.5 text-xs font-bold tracking-widest transition-colors focus:outline-none rounded-sm uppercase';
    btnEnter.textContent = "确认身份 ( ENTER )";
    btnEnter.onclick = () => overlay.remove();
    logBox.appendChild(btnEnter);

    logBox.scrollTop = logBox.scrollHeight;
};

// --- 4. 多语言支持 ---
window.setLanguage = function (lang) {
    if (lang !== currentLang) {
        setCurrentLang(lang);
    }
    const t = I18N[lang];
    if (!t) return; // Safety check

    document.title = t.title;
    document.querySelector('meta[name="description"]').setAttribute("content", t.metaDesc);

    // Update language switch button label (show target language)
    const langLabel = document.getElementById('lang-switch-label');
    if (langLabel) {
        langLabel.textContent = lang === 'zh' ? 'EN' : '中';
    }

    const safeSetText = (id, text, isHTML = false) => {
        const el = document.getElementById(id);
        if (el) {
            if (isHTML) el.innerHTML = text;
            else el.innerText = text;
        }
    };

    safeSetText('header-rank', t.rank);
    safeSetText('header-role', t.role);
    safeSetText('tag-react-text', t.tags.react);
    safeSetText('tag-tailwind-text', t.tags.tailwind);
    safeSetText('tag-python-text', t.tags.python);
    safeSetText('tag-rust-text', t.tags.rust);
    safeSetText('tag-llm-text', t.tags.llm);
    safeSetText('tag-openclaw-text', t.tags.openclaw);

    safeSetText('header-name', t.name);
    safeSetText('header-quote', `<i class="fas fa-quote-left text-gray-600 mr-2"></i>${t.quote}<i class="fas fa-quote-right text-gray-600 ml-2"></i>`, true);
    safeSetText('header-motto-text', t.motto);

    safeSetText('btn-gitee-text', t.giteeBtn);
    safeSetText('btn-github-text', t.githubBtn);

    safeSetText('stats-title', t.stats.title);
    safeSetText('stats-time-label', t.stats.timeLabel);
    safeSetText('stats-time-val', t.stats.timeVal);
    safeSetText('stats-kill-label', t.stats.killLabel);
    safeSetText('stats-avg-label', t.stats.avgLabel);

    safeSetText('missions-title', t.missions.title);
    safeSetText('mission-aim-title', t.missions.aim.title);
    safeSetText('mission-aim-desc', t.missions.aim.desc);
    safeSetText('mission-dodge-title', t.missions.dodge.title);
    safeSetText('mission-dodge-desc', t.missions.dodge.desc);
    safeSetText('mission-vehicle-title', t.missions.vehicle.title);
    safeSetText('mission-vehicle-desc', t.missions.vehicle.desc);
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

    // New section i18n
    safeSetText('stats-proj-label', t.stats.projLabel);
    safeSetText('stats-ach-label', t.stats.achLabel);
    safeSetText('stats-ai-label', t.stats.aiSynergy);
    safeSetText('achievement-title', t.achievements.title);
    // Gitee Activity Feed update on language switch
    if (typeof GiteeActivity !== 'undefined') {
        GiteeActivity.init(lang);
    }

    // Render achievements
    if (typeof Achievements !== 'undefined') {
        Achievements.checkGameAchievements();
        Achievements.render('achievement-grid', lang);
        // Unlock bilingual achievement on language switch
        if (lang !== (window._initialLang || 'zh')) {
            Achievements.tryUnlock('bilingual', lang);
        }
    }

    safeSetText('modal-game-title', t.modal.start);
    safeSetText('modal-score-label', `${t.modal.score} <span id="modal-score-val" class="text-yellow-400">0</span>`, true);
    safeSetText('modal-timer-label', `${t.modal.time} <span id="modal-timer-val" class="text-red-400">00</span>`, true);
    safeSetText('modal-start-btn', t.modal.btn);
    safeSetText('modal-tip', t.modal.tip, true);

    updateChart(lang);
};

function detectLanguage() {
    // Default to English
    window.setLanguage('en');
}

// Expose helper to get current lang from config module
window.getComputedLang = () => currentLang;

// --- 5. 战力雷达图 (双数据集: 当前 vs 目标) ---
let skillsChart = null;
function updateChart(lang) {
    const cfg = GAME_CONFIG.SKILLS_CHART;
    const currentData = cfg.DATA_CURRENT;
    const targetData = cfg.DATA_TARGET;

    // Language switch: only update labels, no destroy (avoids size jitter)
    if (skillsChart) {
        skillsChart.data.labels = cfg.LABELS[lang];
        skillsChart.data.datasets[0].label = lang === 'zh' ? '当前水平' : 'Current';
        skillsChart.data.datasets[1].label = lang === 'zh' ? '目标水平' : 'Target';
        skillsChart.update('none');
        return;
    }

    if (typeof Chart === 'undefined') return;

    const ctxChart = document.getElementById('skillsChart').getContext('2d');

    // Glow plugin for current-level data points only
    const glowPlugin = {
        id: 'pointGlow',
        afterDatasetsDraw(chart) {
            const meta = chart.getDatasetMeta(0);
            const ctx = chart.ctx;
            meta.data.forEach((point) => {
                ctx.save();
                ctx.beginPath();
                ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
                const grad = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 14);
                grad.addColorStop(0, 'rgba(234, 179, 8, 0.55)');
                grad.addColorStop(1, 'rgba(234, 179, 8, 0)');
                ctx.fillStyle = grad;
                ctx.fill();
                ctx.restore();
            });
        }
    };

    // Radar sweep plugin — draws directly on chart canvas, aligned to chart center/radius
    let sweepAngle = -Math.PI / 2; // start at top (12 o'clock)
    let sweepRaf = null;
    const sweepPlugin = {
        id: 'radarSweep',
        afterDraw(chart) {
            const ctx = chart.ctx;
            const scale = chart.scales.r;
            const cx = scale.xCenter;
            const cy = scale.yCenter;
            const r = scale.drawingArea; // exact outer radius of the chart grid

            // Draw sweep trail (fading arc behind the leading edge)
            const trailSpan = Math.PI / 3; // 60° trail
            const trailGrad = ctx.createConicalGradient
                ? null // not widely supported, use manual approach
                : null;

            ctx.save();
            ctx.globalCompositeOperation = 'source-over';

            // Draw trail arc as a filled sector with gradient opacity
            const steps = 24;
            for (let i = 0; i < steps; i++) {
                const a0 = sweepAngle - trailSpan * (i / steps);
                const a1 = sweepAngle - trailSpan * ((i + 1) / steps);
                const opacity = (1 - i / steps) * 0.18;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.arc(cx, cy, r, a0, a1, true);
                ctx.closePath();
                ctx.fillStyle = `rgba(234, 179, 8, ${opacity})`;
                ctx.fill();
            }

            // Leading edge — bright glowing line
            const edgeX = cx + r * Math.cos(sweepAngle);
            const edgeY = cy + r * Math.sin(sweepAngle);
            const lineGrad = ctx.createLinearGradient(cx, cy, edgeX, edgeY);
            lineGrad.addColorStop(0, 'rgba(234, 179, 8, 0)');
            lineGrad.addColorStop(0.6, 'rgba(234, 179, 8, 0.4)');
            lineGrad.addColorStop(1, 'rgba(253, 224, 71, 0.9)');
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(edgeX, edgeY);
            ctx.strokeStyle = lineGrad;
            ctx.lineWidth = 1.5;
            ctx.shadowColor = 'rgba(234, 179, 8, 0.8)';
            ctx.shadowBlur = 6;
            ctx.stroke();

            // Center dot pulse
            ctx.beginPath();
            ctx.arc(cx, cy, 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(234, 179, 8, 0.7)';
            ctx.shadowBlur = 8;
            ctx.fill();

            ctx.restore();

            // Advance angle and request next frame
            sweepAngle = (sweepAngle + 0.012) % (Math.PI * 2);
            cancelAnimationFrame(sweepRaf);
            sweepRaf = requestAnimationFrame(() => {
                if (chart && chart.canvas) chart.draw();
            });
        },
        destroy() {
            cancelAnimationFrame(sweepRaf);
        }
    };

    skillsChart = new Chart(ctxChart, {
        type: 'radar',
        data: {
            labels: cfg.LABELS[lang],
            datasets: [
                // Dataset 0: Current level
                {
                    label: lang === 'zh' ? '当前水平' : 'Current',
                    data: currentData,
                    backgroundColor: 'rgba(234, 179, 8, 0.18)',
                    borderColor: '#EAB308',
                    borderWidth: 2.5,
                    pointBackgroundColor: '#EAB308',
                    pointBorderColor: '#1F2937',
                    pointBorderWidth: 2,
                    pointHoverBackgroundColor: '#FDE047',
                    pointHoverRadius: 7,
                    pointRadius: 4,
                    fill: true,
                    tension: 0.1
                },
                // Dataset 1: Target level (dashed outline, no fill)
                {
                    label: lang === 'zh' ? '目标水平' : 'Target',
                    data: targetData,
                    backgroundColor: 'rgba(99, 179, 237, 0.06)',
                    borderColor: 'rgba(99, 179, 237, 0.6)',
                    borderWidth: 1.5,
                    borderDash: [5, 4],
                    pointBackgroundColor: 'rgba(99, 179, 237, 0.7)',
                    pointBorderColor: 'transparent',
                    pointBorderWidth: 0,
                    pointHoverBackgroundColor: '#90CDF4',
                    pointHoverRadius: 6,
                    pointRadius: 3,
                    fill: false,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: { top: 4, bottom: 4, left: 8, right: 8 } },
            animation: {
                duration: 1200,
                easing: 'easeOutQuart',
                delay: (ctx) => ctx.dataIndex * 80
            },
            scales: {
                r: {
                    angleLines: { color: 'rgba(234, 179, 8, 0.08)', lineWidth: 1 },
                    grid: { color: 'rgba(234, 179, 8, 0.1)', circular: true, lineWidth: 1 },
                    pointLabels: {
                        color: '#9CA3AF',
                        font: { size: 10, family: "'Segoe UI', sans-serif", weight: 'bold' },
                        padding: 16
                    },
                    ticks: { display: false, backdropColor: 'transparent' },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: '#9CA3AF',
                        font: { size: 10, family: "'Segoe UI', sans-serif" },
                        padding: 12,
                        usePointStyle: true,
                        pointStyleWidth: 8,
                        boxHeight: 6
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#FDE047',
                    bodyColor: '#E5E7EB',
                    titleFont: { family: "'Oswald', 'PingFang SC', sans-serif", size: 11, weight: 'bold', letterSpacing: 1 },
                    bodyFont: { family: "'Oswald', 'PingFang SC', sans-serif", size: 11 },
                    padding: 6,
                    cornerRadius: 0,
                    caretSize: 4,
                    displayColors: false,
                    borderColor: 'rgba(234, 179, 8, 0.8)',
                    borderWidth: 1,
                    callbacks: {
                        title: (items) => `[ TARGET : ${items[0].label} ]`,
                        label: (item) => {
                            const val = item.raw;
                            const currentLang = window.getComputedLang ? window.getComputedLang() : 'zh';
                            const isTarget = item.datasetIndex === 1;
                            const prefix = isTarget
                                ? (currentLang === 'zh' ? '战术目标' : 'TRG.LVL')
                                : (currentLang === 'zh' ? '当前实战' : 'CUR.LVL');
                            return `${prefix}  >>  ${val}`;
                        }
                    }
                }
            },
            interaction: { mode: 'index', intersect: false },
            onHover: (event, elements) => {
                if (event.native) event.native.target.style.cursor = elements.length ? 'pointer' : 'default';
            }
        },
        plugins: [glowPlugin, sweepPlugin]
    });
}



// --- 6. 信号枪逻辑 ---
window.fireSignal = function () {
    playSound('shot');
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in';
    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
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
window.showIdeaModal = function () {
    playSound('shot');
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in';
    overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
    };

    const lang = window.getComputedLang ? window.getComputedLang() : currentLang;
    const t = I18N[lang].idea;
    const issueLink = "https://gitee.com/K4Ricky2Win/RicKinG/issues/new"; // Update to Gitee

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
            <a href="${issueLink}" target="_blank" onclick="this.closest('.fixed').remove()" class="inline-block bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded clip-path-polygon transition transform hover:scale-105 no-underline flex items-center justify-center gap-2">
                <img src="https://gitee.com/favicon.ico" class="h-5 w-5 rounded-full bg-white p-0.5" alt=""> ${t.action}
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
function ensureGameManagerReady() {
    if (!window.gameManager) {
        if (typeof GameManager !== 'undefined') {
            window.gameManager = new GameManager();
        } else {
            return false;
        }
    }
    return true;
}

// --- 8. 滚动入场动画 (Scroll Reveal) ---
function initScrollReveal() {
    const sections = document.querySelectorAll('section, .flip-card, footer');
    sections.forEach((el, i) => {
        el.classList.add('reveal-on-scroll');
        el.style.transitionDelay = `${i * 0.08}s`;
    });
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    sections.forEach(el => observer.observe(el));
}

// --- 9. 鼠标追踪光斑 ---
function initCursorGlow() {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    let mx = 0, my = 0, gx = 0, gy = 0;
    document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });
    function animateGlow() {
        gx += (mx - gx) * 0.08;
        gy += (my - gy) * 0.08;
        glow.style.left = gx + 'px';
        glow.style.top = gy + 'px';
        requestAnimationFrame(animateGlow);
    }
    animateGlow();
    // Hide on mobile / touch
    if ('ontouchstart' in window) glow.style.display = 'none';
}

// --- 10. 3D Tilt 效果 (装备卡片) ---
function initTiltCards() {
    document.querySelectorAll('.flip-card').forEach(card => {
        card.classList.add('tilt-card');
        card.addEventListener('mousemove', (e) => {
            if (card.classList.contains('flipped')) return;
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            if (!card.classList.contains('flipped')) {
                card.style.transform = '';
            }
        });
    });
}

// --- 11. Kill计数器动画 ---
function animateKillCounter() {
    const el = document.getElementById('stats-kill-val');
    if (!el) return;
    const originalText = el.textContent;
    // Rapid number cycling then snap back to ERROR_0
    let frame = 0;
    const totalFrames = 30;
    const chars = '0123456789ABCDEF';
    const animate = () => {
        if (frame < totalFrames) {
            let txt = '';
            for (let i = 0; i < 7; i++) {
                txt += chars[Math.floor(Math.random() * chars.length)];
            }
            el.textContent = txt;
            frame++;
            requestAnimationFrame(animate);
        } else {
            el.textContent = originalText;
            el.classList.add('count-pulse');
            setTimeout(() => el.classList.remove('count-pulse'), 300);
        }
    };
    // Trigger on first visible + re-trigger on hover
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            frame = 0;
            animate();
            observer.disconnect();
        }
    }, { threshold: 0.5 });
    observer.observe(el);
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => { frame = 0; animate(); });
}

// --- 12. Konami Code Easter Egg ---
function initKonamiCode() {
    const sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let idx = 0;
    document.addEventListener('keydown', (e) => {
        if (e.key === sequence[idx]) {
            idx++;
            if (idx === sequence.length) {
                idx = 0;
                triggerChickenDinner();
            }
        } else {
            idx = 0;
        }
    });
}

function triggerChickenDinner() {
    // Golden particle explosion + message
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[200] flex items-center justify-center pointer-events-none';
    overlay.innerHTML = `
        <div class="text-center animate-bounce">
            <div class="text-6xl md:text-8xl mb-4">🍗</div>
            <div class="text-3xl md:text-5xl font-black text-yellow-400 drop-shadow-lg" style="text-shadow: 0 0 30px rgba(234,179,8,0.8)">
                WINNER WINNER<br>CHICKEN DINNER!
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    // Golden confetti
    for (let i = 0; i < 60; i++) {
        const conf = document.createElement('div');
        conf.style.cssText = `
            position:fixed; z-index:201; pointer-events:none;
            width:${Math.random() * 10 + 5}px; height:${Math.random() * 10 + 5}px;
            background: hsl(${40 + Math.random() * 20}, 100%, ${50 + Math.random() * 20}%);
            left:${Math.random() * 100}vw; top:-10px;
            border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
        `;
        document.body.appendChild(conf);
        const dur = 2000 + Math.random() * 2000;
        conf.animate([
            { transform: `translateY(0) rotate(0deg)`, opacity: 1 },
            { transform: `translateY(${window.innerHeight + 50}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
        ], { duration: dur, easing: 'ease-in' }).onfinish = () => conf.remove();
    }
    setTimeout(() => overlay.remove(), 4000);
    // Activate footer easter egg
    const slogan = document.getElementById('footer-slogan');
    if (slogan) { slogan.classList.add('footer-konami', 'activated'); }
    // Unlock chicken dinner achievement
    if (typeof Achievements !== 'undefined') {
        const lang = window.getComputedLang ? window.getComputedLang() : currentLang;
        Achievements.tryUnlock('chicken', lang);
    }
}

// --- 13. 头像 呼吸光效 ---
function initAvatarGlow() {
    const avatar = document.querySelector('header .rounded-full.border-4');
    if (avatar) avatar.classList.add('avatar-glow');
}

// Initialize after DOM is ready to ensure all scripts loaded
window.addEventListener('DOMContentLoaded', () => {
    detectLanguage();
    let retries = 0;
    const maxRetries = 20;
    const tryInit = () => {
        if (ensureGameManagerReady()) {
            bindGameEntrances();
            return;
        }
        retries += 1;
        if (retries < maxRetries) {
            setTimeout(tryInit, 50);
            return;
        }
        console.error('GameManager init failed after retries');
    };
    tryInit();

    // Initialize enhanced interactions
    initScrollReveal();
    initCursorGlow();
    initTiltCards();
    animateKillCounter();
    initKonamiCode();
    initAvatarGlow();

    // Initialize achievements
    if (typeof Achievements !== 'undefined') {
        Achievements.init();
        const initLang = window.getComputedLang ? window.getComputedLang() : 'zh';
        window._initialLang = initLang;
        Achievements.render('achievement-grid', initLang);
    }
});
