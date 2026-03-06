/**
 * Achievements - 成就勋章系统
 * 基于 localStorage 追踪解锁状态
 */
window.Achievements = class Achievements {
    static STORAGE_KEY = 'ricking_achievements';

    // 成就定义
    static LIST = [
        { id: 'first_visit', icon: '🔫', threshold: 1, category: 'explore' },
        { id: 'sharpshooter', icon: '🎯', threshold: 50, category: 'game' },
        { id: 'survivor', icon: '🏃', threshold: 1, category: 'game' },
        { id: 'speed_demon', icon: '🏎️', threshold: 1, category: 'game' },
        { id: 'chicken', icon: '🍗', threshold: 1, category: 'secret' },
        { id: 'bilingual', icon: '🌐', threshold: 1, category: 'explore' },
        { id: 'first_project', icon: '⭐', threshold: 1, category: 'milestone' },
        { id: 'locked_1', icon: '❓', threshold: 0, category: 'locked' },
        { id: 'locked_2', icon: '❓', threshold: 0, category: 'locked' },
    ];

    // i18n 名称和描述
    static I18N = {
        zh: {
            first_visit: { name: '初来乍到', desc: '首次访问战术终端' },
            sharpshooter: { name: '神枪手', desc: '特种射击得分 ≥ 50' },
            survivor: { name: '黑区生还者', desc: '物资突围成功通关' },
            speed_demon: { name: '秋名山车神', desc: '载具狂飙成功通关' },
            chicken: { name: '吃鸡大佬', desc: '发现隐藏的科乐美代码' },
            bilingual: { name: '双语精通', desc: '切换过界面语言' },
            first_project: { name: '代码新兵', desc: '拥有第一个项目' },
            locked_1: { name: '???', desc: '尚未解锁' },
            locked_2: { name: '???', desc: '尚未解锁' },
            sectionTitle: '成就勋章',
            unlocked: '已解锁',
            locked: '未解锁',
            progress: '成就进度'
        },
        en: {
            first_visit: { name: 'First Deploy', desc: 'Visit the Tactical Terminal' },
            sharpshooter: { name: 'Sharpshooter', desc: 'Score ≥ 50 in Sniper Ops' },
            survivor: { name: 'Zone Survivor', desc: 'Complete Supply Rush' },
            speed_demon: { name: 'Speed Demon', desc: 'Complete Vehicle Rush' },
            chicken: { name: 'Chicken Dinner', desc: 'Discover the Konami Code' },
            bilingual: { name: 'Bilingual', desc: 'Switch interface language' },
            first_project: { name: 'Code Recruit', desc: 'Own your first project' },
            locked_1: { name: '???', desc: 'Not yet unlocked' },
            locked_2: { name: '???', desc: 'Not yet unlocked' },
            sectionTitle: 'ACHIEVEMENTS',
            unlocked: 'Unlocked',
            locked: 'Locked',
            progress: 'Progress'
        }
    };

    /**
     * 获取所有成就状态
     * @returns {Object} { achievementId: { unlocked: bool, date: string } }
     */
    static getData() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch { return {}; }
    }

    static _save(data) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    }

    /**
     * 解锁成就（幂等）
     * @returns {boolean} true 如果是新解锁
     */
    static unlock(id) {
        const data = this.getData();
        if (data[id]?.unlocked) return false; // 已解锁
        data[id] = { unlocked: true, date: new Date().toLocaleDateString() };
        this._save(data);
        return true;
    }

    /**
     * 检查是否已解锁
     */
    static isUnlocked(id) {
        return !!this.getData()[id]?.unlocked;
    }

    /**
     * 获取解锁数 / 可解锁总数
     */
    static getProgress() {
        const data = this.getData();
        const unlockable = this.LIST.filter(a => a.category !== 'locked');
        const unlocked = unlockable.filter(a => data[a.id]?.unlocked).length;
        return { unlocked, total: unlockable.length };
    }

    /**
     * 初始化 - 自动解锁首次访问 & 代码新兵
     */
    static init() {
        this.unlock('first_visit');
        this.unlock('first_project');
    }

    /**
     * 检查游戏成就（基于 Leaderboard 数据）
     */
    static checkGameAchievements() {
        if (typeof Leaderboard === 'undefined') return;

        // 神枪手：aim 最高分 >= 50
        const aimHigh = Leaderboard.getHighScore('aim');
        if (aimHigh >= 50) this.unlock('sharpshooter');

        // 黑区生还：dodge 有完成记录（存在得分）
        const dodgeScores = Leaderboard.getScores('dodge').filter(e => e.isPlayer);
        if (dodgeScores.length > 0) this.unlock('survivor');

        // 车神：vehicle 有完成记录
        const vehicleScores = Leaderboard.getScores('vehicle').filter(e => e.isPlayer);
        if (vehicleScores.length > 0) this.unlock('speed_demon');
    }

    /**
     * 渲染成就网格到 DOM
     */
    static render(containerId, lang = 'zh') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const data = this.getData();
        const t = this.I18N[lang] || this.I18N.zh;
        const progress = this.getProgress();

        let html = '';
        this.LIST.forEach(ach => {
            const isLocked = ach.category === 'locked';
            const isUnlocked = !isLocked && data[ach.id]?.unlocked;
            const info = t[ach.id] || { name: '???', desc: '' };
            const date = data[ach.id]?.date || '';

            html += `
                <div class="achievement-badge ${isUnlocked ? 'unlocked' : 'locked'}" 
                     title="${info.name}: ${info.desc}${isUnlocked && date ? ' (' + date + ')' : ''}">
                    <span class="achievement-icon">${isLocked ? '🔒' : ach.icon}</span>
                    <span class="achievement-name">${info.name}</span>
                </div>`;
        });

        container.innerHTML = html;

        // 更新进度文字
        const progressEl = document.getElementById('achievement-progress');
        if (progressEl) {
            progressEl.textContent = `${progress.unlocked} / ${progress.total}`;
        }

        // 更新 header 的成就数据牌
        const headerAch = document.getElementById('stats-ach-val');
        if (headerAch) {
            headerAch.textContent = `${progress.unlocked}/${progress.total}`;
        }
    }

    /**
     * 显示解锁通知 Toast
     */
    static showUnlockToast(id, lang = 'zh') {
        const t = this.I18N[lang] || this.I18N.zh;
        const ach = this.LIST.find(a => a.id === id);
        const info = t[id];
        if (!ach || !info) return;

        const toast = document.createElement('div');
        toast.className = 'achievement-toast';
        toast.innerHTML = `
            <span class="achievement-toast-icon">${ach.icon}</span>
            <div>
                <div class="achievement-toast-title">${lang === 'zh' ? '🎖️ 成就解锁！' : '🎖️ Achievement Unlocked!'}</div>
                <div class="achievement-toast-name">${info.name}</div>
            </div>`;
        document.body.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => toast.classList.add('show'));

        // Remove after 3s
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }

    /**
     * 尝试解锁并显示通知
     */
    static tryUnlock(id, lang = 'zh') {
        const isNew = this.unlock(id);
        if (isNew) {
            this.showUnlockToast(id, lang);
            this.render('achievement-grid', lang);
        }
        return isNew;
    }
};
