window.currentLang = 'zh';

window.setCurrentLang = function (lang) {
    window.currentLang = lang;
}

// --- 游戏配置常量 (Game Configuration) ---
window.GAME_CONFIG = {
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
        RELOAD: { FREQ: 400, DURATION: 0.3 }, // 新增换弹音效
        EXPLOSION: { FREQ: 100, DURATION: 0.5 }, // 新增爆炸音效
        GAMEOVER: { FREQ: 200, DURATION: 1 }
    },
    // --- 升级版射击游戏配置 (v2) ---
    AIM_GAME: {
        TIME: 60, // 增加到 60 秒
        MAX_AMMO: 7,
        RELOAD_TIME: 1000,
        TARGET_SPEED_MIN: 1,
        TARGET_SPEED_MAX: 3,
        SPAWN_INTERVAL: 600
    },
    // --- 升级版躲避游戏配置 (v2) ---
    DODGE_GAME: {
        TIME: 60, // 目标存活 60 秒
        MAX_HP: 3, // 加入血量机制
        PLAYER_SPEED: 8,
        GRAVITY: 0.2,
        SPAWN_RATE: 0.03,
        ITEM_SPEED_BASE: 2,
        ITEM_SPEED_MAX: 8
    },
    // --- 载具狂飙 (Vehicle Rush) ---
    VEHICLE_GAME: {
        TIME: 60,
        MAX_HP: 3,
        PLAYER_SPEED: 6,
        ROAD_SPEED_BASE: 3,
        ROAD_SPEED_MAX: 10,
        SPAWN_RATE: 0.04,
        LANE_COUNT: 5
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

// --- 加载游戏内部使用的吃鸡图标资源 ---
window.GAME_ASSETS = {
    helmet: new Image(),
    grenade: new Image(),
    medkit: new Image(),
    energy: new Image()
};
// 利用 icons8 提供的一些现成高清小图标
window.GAME_ASSETS.helmet.src = 'https://img.icons8.com/color/96/pubg-helmet.png';
window.GAME_ASSETS.grenade.src = 'https://img.icons8.com/color/96/grenade.png';
window.GAME_ASSETS.medkit.src = 'https://img.icons8.com/color/96/first-aid-kit.png';
window.GAME_ASSETS.energy.src = 'https://img.icons8.com/color/96/energy-drink.png';
window.GAME_ASSETS.fuel = new Image();
window.GAME_ASSETS.fuel.src = 'https://img.icons8.com/color/96/gas-station.png';

// --- 多语言配置 (i18n) ---
window.I18N = {
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
        motto: "好好学习，天天向上",
        giteeBtn: "Gitee 仓库",
        githubBtn: "GitHub",
        stats: {
            title: "PLAYER STATS",
            timeLabel: "役期时长",
            timeVal: "16年",
            killLabel: "代码击杀数",
            killVal: "ERROR_0",
            avgLabel: "综合评分",
            projLabel: "项目数",
            achLabel: "成就"
        },
        missions: {
            title: "MISSIONS",
            aim: { title: "特种射击", desc: "移动靶 / 换弹机制" },
            dodge: { title: "物资突围", desc: "拾取空投 / 躲避轰炸" },
            vehicle: { title: "载具狂飙", desc: "俯视飙车 / 蓝圈追击" },
            more: { title: "更多任务", desc: "提交你的战略创意", coming: "COMING SOON" }
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
        achievements: {
            title: "成就勋章"
        },
        battlelog: {
            title: "BATTLE LOG",
            emptyTitle: "通讯频道建设中...",
            emptyDesc: "情报正在收集中，战术笔记即将发布。<br>[ 空投区即将开放 ]"
        },
        modal: {
            start: "任务开始",
            score: "得分:",
            time: "时间:",
            btn: "START MISSION",
            tip: "<i class=\"fas fa-mouse-pointer mr-1\"></i> 点击/触摸屏幕操作 <span class=\"hidden md:inline mx-2\">|</span> <i class=\"fas fa-volume-up mr-1\"></i> 包含音效"
        },
        game: {
            hit: "命中!",
            reload: "换弹中...",
            noAmmo: "没子弹了! (按 R 换弹)",
            over: "任务结束！",
            score: "最终得分:",
            rank: "评价:",
            ranks: {
                conqueror: "无敌战神 (Conqueror)",
                ace: "超级王牌 (Ace)",
                crown: "荣耀皇冠 (Crown)",
                bronze: "热血青铜 (Bronze)"
            },
            crash: "被轰炸区击中！",
            survive: "生存时间:",
            seconds: "秒",
            replay: "重新开始",
            wrecked: "载具损毁！",
            extraction: "成功撤离！"
        },
        signal: {
            title: "SIGNAL FLARE FIRED!",
            desc: "信号弹已升空！空投支援正在路上... 📦<br><span class=\"text-xs text-gray-500\">指挥中心已收到请求 / Command Center Acknowledged</span>",
            pr: "欢迎前往项目仓库提交 <span class=\"text-green-400 font-bold\">Pull Request</span>",
            issue: "或建立 <span class=\"text-yellow-400 font-bold\">Issue</span> 留下您的联系方式",
            copy: "收到 / COPY THAT"
        },
        idea: {
            title: "NEW MISSION REQUEST!",
            desc: "指挥官，请指示下一个任务目标！🫡<br><span class=\"text-xs text-gray-500\">Tell us what game you want to play next.</span>",
            action: "前往 Gitee Issue 提交创意"
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
        motto: "Good Good Study, Day Day Up",
        giteeBtn: "Gitee Repo",
        githubBtn: "GitHub",
        stats: {
            title: "PLAYER STATS",
            timeLabel: "Service Time",
            timeVal: "16 Yrs",
            killLabel: "Code Kills",
            killVal: "ERROR_0",
            avgLabel: "Overall Score",
            projLabel: "Projects",
            achLabel: "Badges"
        },
        missions: {
            title: "MISSIONS",
            aim: { title: "Sniper Ops", desc: "Moving Targets / Reload" },
            dodge: { title: "Supply Rush", desc: "Loot Drops / Dodge Bombs" },
            vehicle: { title: "Vehicle Rush", desc: "Top-Down Driving / Blue Zone" },
            more: { title: "More Missions", desc: "Submit your game ideas", coming: "COMING SOON" }
        },
        warehouse: {
            title: "WAREHOUSE",
            legendary: "Legendary",
            epic: "Epic",
            tactical: {
                title: "Tactical Terminal",
                desc: "Immersive PUBG-style homepage built with HTML/CSS/JS. Integrated Gitee/GitHub portals and official tactical icons.",
                btnCode: "Code",
                btnDemo: "Visit"
            },
            aqua: {
                title: "AquaInsight Analysis",
                desc: "AI-driven water quality monitoring system. Combining GIS & LLM to uncover meteorological-water coupling mechanisms.",
                btnCode: "Code",
                btnDemo: "Visit"
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
        achievements: {
            title: "ACHIEVEMENTS"
        },
        battlelog: {
            title: "BATTLE LOG",
            emptyTitle: "Channel Initializing...",
            emptyDesc: "Intel is being gathered, tactical notes incoming.<br>[ Drop Zone Opening Soon ]"
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
            reload: "RELOADING...",
            noAmmo: "NO AMMO! (Press R)",
            over: "Mission Complete!",
            score: "Final Score:",
            rank: "Rank:",
            ranks: {
                conqueror: "Conqueror",
                ace: "Ace",
                crown: "Crown",
                bronze: "Bronze"
            },
            crash: "Hit by Bomb!",
            survive: "Time Survived:",
            seconds: "s",
            replay: "PLAY AGAIN",
            wrecked: "VEHICLE WRECKED!",
            extraction: "EXTRACTION COMPLETE!"
        },
        signal: {
            title: "SIGNAL FLARE FIRED!",
            desc: "Flare gun fired! Airdrop support is incoming... 📦<br><span class=\"text-xs text-gray-500\">Command Center Acknowledged</span>",
            pr: "Submit a <span class=\"text-green-400 font-bold\">Pull Request</span> to the repo",
            issue: "Or open an <span class=\"text-yellow-400 font-bold\">Issue</span> to leave contact info",
            copy: "COPY THAT"
        },
        idea: {
            title: "NEW MISSION REQUEST!",
            desc: "Commander, awaiting your orders for the next mission! 🫡",
            action: "Submit Idea on Gitee Issue"
        }
    }
};