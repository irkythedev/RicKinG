/**
 * Leaderboard - 排行榜系统
 * 使用 localStorage 存储历史得分，随机生成玩家名，支持破纪录提示
 */
window.Leaderboard = class Leaderboard {
    static STORAGE_KEY = 'ricking_leaderboard';
    static MAX_ENTRIES = 10; // 每个游戏最多保存10条记录
    static PLAYER_NAME_KEY = 'ricking_player_name';

    // 随机生成有趣的玩家名（军事/吃鸡风格）
    static NAMES = {
        prefixes: [
            '钢铁', '闪电', '暗影', '极速', '烈焰',
            '幽灵', '猎鹰', '毒蛇', '雷霆', '狂风',
            '绝地', '天命', '荣耀', '无敌', '传说',
            'Shadow', 'Ghost', 'Fury', 'Storm', 'Blaze',
            'Viper', 'Hawk', 'Omega', 'Alpha', 'Nova'
        ],
        suffixes: [
            '战士', '猎手', '指挥官', '先锋', '狙击手',
            '突击手', '大佬', '传奇', '王牌', '终结者',
            'Killer', 'Pro', 'Master', 'Legend', 'Ace',
            'Boss', 'MVP', 'Elite', 'Titan', 'Warrior'
        ]
    };

    // 破纪录鼓励语
    static RECORD_MSGS = {
        zh: [
            '🏆 新纪录！你就是战场之王！',
            '🔥 无人能挡！新的历史最高分！',
            '💀 对手已读不回！破纪录了！',
            '⚡ 超神了！这就是传说中的大佬！',
            '🎯 精准如神！新纪录诞生！',
            '🍗 大吉大利，破纪录吃鸡！'
        ],
        en: [
            '🏆 NEW RECORD! You are the champion!',
            '🔥 Unstoppable! New all-time high!',
            '💀 They never stood a chance! New record!',
            '⚡ GODLIKE! A legend is born!',
            '🎯 Precision master! New record set!',
            '🍗 Winner Winner, Record Dinner!'
        ]
    };

    /**
     * 获取或生成玩家名
     */
    static getPlayerName() {
        let name = localStorage.getItem(this.PLAYER_NAME_KEY);
        if (!name) {
            name = this.generateName();
            localStorage.setItem(this.PLAYER_NAME_KEY, name);
        }
        return name;
    }

    /**
     * 随机生成一个玩家名
     */
    static generateName() {
        const p = this.NAMES.prefixes;
        const s = this.NAMES.suffixes;
        const prefix = p[Math.floor(Math.random() * p.length)];
        const suffix = s[Math.floor(Math.random() * s.length)];
        const num = Math.floor(Math.random() * 99) + 1;
        return `${prefix}${suffix}${num}`;
    }

    /**
     * 重新生成玩家名
     */
    static rerollName() {
        const name = this.generateName();
        localStorage.setItem(this.PLAYER_NAME_KEY, name);
        return name;
    }

    /**
     * 获取所有排行榜数据
     */
    static getAllData() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    }

    /**
     * 获取某个游戏的排行榜
     * @param {string} gameType - 'aim' | 'dodge' | 'vehicle'
     * @returns {Array} 排名数组 [{name, score, date, isPlayer}]
     */
    static getScores(gameType) {
        const data = this.getAllData();
        return data[gameType] || [];
    }

    /**
     * 获取某个游戏的最高分
     */
    static getHighScore(gameType) {
        const scores = this.getScores(gameType);
        if (scores.length === 0) return 0;
        return scores[0].score;
    }

    /**
     * 提交得分
     * @returns {{ isNewRecord: boolean, rank: number, entries: Array }}
     */
    static submitScore(gameType, score) {
        const data = this.getAllData();
        if (!data[gameType]) data[gameType] = [];

        const playerName = this.getPlayerName();
        const prevHigh = this.getHighScore(gameType);
        const isNewRecord = score > prevHigh && prevHigh > 0;

        // 添加新记录
        const entry = {
            name: playerName,
            score: score,
            date: new Date().toLocaleDateString(),
            isPlayer: true
        };
        data[gameType].push(entry);

        // 如果记录不够多，填充一些NPC分数让排行榜更有趣
        if (data[gameType].filter(e => !e.isPlayer).length < 5) {
            this._seedNPCScores(data, gameType, score);
        }

        // 排序（降序）
        data[gameType].sort((a, b) => b.score - a.score);

        // 截取前 MAX_ENTRIES
        data[gameType] = data[gameType].slice(0, this.MAX_ENTRIES);

        // 保存
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));

        // 计算排名
        const rank = data[gameType].findIndex(e => e === entry || (e.name === entry.name && e.score === entry.score && e.date === entry.date)) + 1;

        return {
            isNewRecord,
            rank: rank > 0 ? rank : data[gameType].length,
            entries: data[gameType]
        };
    }

    /**
     * 往排行榜中塞一些 NPC 分数，让首次体验更有趣
     */
    static _seedNPCScores(data, gameType, playerScore) {
        const baseScores = {
            aim: [45, 72, 38, 55, 28],
            dodge: [35, 58, 22, 48, 15],
            vehicle: [40, 65, 30, 52, 20]
        };
        const bases = baseScores[gameType] || baseScores.aim;

        bases.forEach((base, i) => {
            // 已经有足够NPC则跳过
            if (data[gameType].filter(e => !e.isPlayer).length >= 5) return;

            const variance = Math.floor(Math.random() * 20) - 10;
            const npcScore = Math.max(5, base + variance);
            data[gameType].push({
                name: this.generateName(),
                score: npcScore,
                date: new Date(Date.now() - Math.random() * 7 * 86400000).toLocaleDateString(),
                isPlayer: false
            });
        });
    }

    /**
     * 获取破纪录鼓励语
     */
    static getRecordMessage(lang = 'zh') {
        const msgs = this.RECORD_MSGS[lang] || this.RECORD_MSGS.zh;
        return msgs[Math.floor(Math.random() * msgs.length)];
    }

    /**
     * 获取游戏统计概览
     */
    static getStats(gameType) {
        const scores = this.getScores(gameType);
        const playerScores = scores.filter(e => e.isPlayer);
        if (playerScores.length === 0) return null;

        const allScores = playerScores.map(e => e.score);
        return {
            plays: playerScores.length,
            best: Math.max(...allScores),
            avg: Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length),
            latest: allScores[allScores.length - 1]
        };
    }
};
