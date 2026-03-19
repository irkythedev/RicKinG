/**
 * Gitee Activity Feed — PUBG Tactical Battle Log
 * Fetches public events from Gitee API and renders them in military radio style
 */
window.GiteeActivity = (function () {
    const GITEE_USER = 'K4Ricky2Win';
    const API_BASE = 'https://gitee.com/api/v5';
    const CACHE_KEY = 'ricking_gitee_events';
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    // PUBG Callsigns for tactical flavor (localized)
    const CALLSIGNS = {
        zh: ['P城霸主', 'G港战神', '战术大师', '天选之子', '机瞄专家', '桥头水鬼', '致命快递', '战区医疗兵'],
        en: ['Pochinki Pro', 'Georgopol God', 'Tactical Master', 'Chosen One', 'Iron Sight', 'Bridge Troll', 'Deadly Drop', 'Zone Medic']
    };

    // i18n — military radio style
    const I18N_FEED = {
        zh: {
            title: 'BATTLE LOG',
            heatmapLabel: '📡 近30天作战热力',
            heatmapTotal: (n, u) => u ? `累计火力: ${u.public_repos} 个设施 | 近期行动: ${n} 次` : `近期行动: ${n} 次`,
            statusLive: 'LIVE',
            timeAgo: {
                now: '刚刚',
                min: (n) => `${n}分钟前`,
                hour: (n) => `${n}小时前`,
                day: (n) => `${n}天前`,
            },
            actions: {
                PushEvent: (repo, cs) => `[${cs}] 空投代码包投放至 <a href="https://gitee.com/${repo}" target="_blank">${_repoName(repo)}</a>`,
                IssueEvent: (repo, cs) => `[${cs}] 标记新战区目标 @ <a href="https://gitee.com/${repo}" target="_blank">${_repoName(repo)}</a>`,
                IssueCommentEvent: (repo, cs) => `[${cs}] 战术通讯 @ <a href="https://gitee.com/${repo}" target="_blank">${_repoName(repo)}</a>`,
                PullRequestEvent: (repo, cs) => `[${cs}] 发起合并请求 → <a href="https://gitee.com/${repo}" target="_blank">${_repoName(repo)}</a>`,
                PullRequestCommentEvent: (repo, cs) => `[${cs}] PR 通讯 @ <a href="https://gitee.com/${repo}" target="_blank">${_repoName(repo)}</a>`,
                CreateEvent: (repo, cs) => `[${cs}] 开辟新战线 @ <a href="https://gitee.com/${repo}" target="_blank">${_repoName(repo)}</a>`,
                DeleteEvent: (repo, cs) => `[${cs}] 撤退阵地 @ <a href="https://gitee.com/${repo}" target="_blank">${_repoName(repo)}</a>`,
                StarEvent: (repo, cs) => `[${cs}] 标记空投 ★ <a href="https://gitee.com/${repo}" target="_blank">${_repoName(repo)}</a>`,
                ForkEvent: (repo, cs) => `[${cs}] 复制战术图 @ <a href="https://gitee.com/${repo}" target="_blank">${_repoName(repo)}</a>`,
                MemberEvent: (repo, cs) => `[${cs}] 队伍集结 @ <a href="https://gitee.com/${repo}" target="_blank">${_repoName(repo)}</a>`,
                _default: (repo, cs) => `[${cs}] 战区活动 @ <a href="https://gitee.com/${repo}" target="_blank">${_repoName(repo)}</a>`,
            },
            emptyTitle: '频道静默中...',
            emptyDesc: '近期未检测到行动信号。<br>[ 等待下一次空投 ]',
            errorTitle: '📻 通讯信号中断',
            errorDesc: '无法连接 Gitee 战区，稍后重试。<br>[ SIGNAL LOST ]',
            legend: ['休整', '侦察', '交火', '攻坚', '决赛圈'],
        },
        en: {
            title: 'BATTLE LOG',
            heatmapLabel: '📡 Last 30 Days Ops Heatmap',
            heatmapTotal: (n, u) => u ? `Total Fronts: ${u.public_repos} | Recent Ops: ${n}` : `Recent Ops: ${n}`,
            statusLive: 'LIVE',
            timeAgo: {
                now: 'just now',
                min: (n) => `${n}m ago`,
                hour: (n) => `${n}h ago`,
                day: (n) => `${n}d ago`,
            },
            actions: {
                PushEvent: (repo, cs) => `[${cs}] Airdrop deployed → <a href="https://gitee.com/${repo}" target="_blank">${_repoName(repo)}</a>`,
                IssueEvent: (repo, cs) => `[${cs}] Target marked @ <a href="https://gitee.com/${repo}" target="_blank">${_repoName(repo)}</a>`,
                IssueCommentEvent: (repo, cs) => `[${cs}] Radio chatter @ <a href="https://gitee.com/${repo}" target="_blank">${_repoName(repo)}</a>`,
                PullRequestEvent: (repo, cs) => `[${cs}] Merge request fired → <a href="https://gitee.com/${repo}" target="_blank">${_repoName(repo)}</a>`,
                PullRequestCommentEvent: (repo, cs) => `[${cs}] PR comms @ <a href="https://gitee.com/${repo}" target="_blank">${_repoName(repo)}</a>`,
                CreateEvent: (repo, cs) => `[${cs}] New front opened @ <a href="https://gitee.com/${repo}" target="_blank">${_repoName(repo)}</a>`,
                DeleteEvent: (repo, cs) => `[${cs}] Position abandoned @ <a href="https://gitee.com/${repo}" target="_blank">${_repoName(repo)}</a>`,
                StarEvent: (repo, cs) => `[${cs}] Drop marked ★ <a href="https://gitee.com/${repo}" target="_blank">${_repoName(repo)}</a>`,
                ForkEvent: (repo, cs) => `[${cs}] Tactical map copied @ <a href="https://gitee.com/${repo}" target="_blank">${_repoName(repo)}</a>`,
                MemberEvent: (repo, cs) => `[${cs}] Squad assembled @ <a href="https://gitee.com/${repo}" target="_blank">${_repoName(repo)}</a>`,
                _default: (repo, cs) => `[${cs}] Zone activity @ <a href="https://gitee.com/${repo}" target="_blank">${_repoName(repo)}</a>`,
            },
            emptyTitle: 'Channel Silent...',
            emptyDesc: 'No ops detected in the zone.<br>[ Awaiting next airdrop ]',
            errorTitle: '📻 Signal Lost',
            errorDesc: 'Cannot reach Gitee server. Retrying later.<br>[ COMMS DOWN ]',
            legend: ['Rest', 'Recon', 'Engage', 'Assault', 'Final Circle'],
        }
    };

    // Event type → PUBG-themed icon & css class
    const EVENT_ICONS = {
        PushEvent: { icon: '<i class="fas fa-parachute-box"></i>', cls: 'type-push' },
        IssueEvent: { icon: '<i class="fas fa-crosshairs"></i>', cls: 'type-issue' },
        IssueCommentEvent: { icon: '<i class="fas fa-walkie-talkie"></i>', cls: 'type-comment' },
        PullRequestEvent: { icon: '<i class="fas fa-code-branch"></i>', cls: 'type-pr' },
        PullRequestCommentEvent: { icon: '<i class="fas fa-comment-dots"></i>', cls: 'type-comment' },
        CreateEvent: { icon: '<i class="fas fa-flag"></i>', cls: 'type-create' },
        DeleteEvent: { icon: '<i class="fas fa-skull"></i>', cls: 'type-default' },
        StarEvent: { icon: '<i class="fas fa-star"></i>', cls: 'type-star' },
        ForkEvent: { icon: '<i class="fas fa-map"></i>', cls: 'type-fork' },
        MemberEvent: { icon: '<i class="fas fa-users"></i>', cls: 'type-default' },
    };

    function _repoName(fullName) {
        if (!fullName) return '???';
        const parts = fullName.split('/');
        return parts.length > 1 ? parts[1] : fullName;
    }

    function _timeAgo(dateStr, lang) {
        const t = I18N_FEED[lang]?.timeAgo || I18N_FEED.en.timeAgo;
        const now = Date.now();
        const then = new Date(dateStr).getTime();
        const diff = now - then;
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (mins < 1) return t.now;
        if (mins < 60) return t.min(mins);
        if (hours < 24) return t.hour(hours);
        return t.day(days);
    }

    function _getCallsign(index, lang) {
        const list = CALLSIGNS[lang] || CALLSIGNS.en;
        return list[index % list.length];
    }

    function _getEventRepoName(event) {
        if (event.repo?.full_name) return event.repo.full_name;
        if (event.repo?.name) return event.repo.name;
        return GITEE_USER + '/unknown';
    }

    // ------------ Cache helpers ------------
    function _getCached() {
        try {
            const raw = localStorage.getItem(CACHE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (Date.now() - parsed.ts > CACHE_TTL) return null;
            return parsed.data;
        } catch { return null; }
    }

    function _setCache(data) {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
        } catch { /* noop */ }
    }

    // ------------ Fetch events ------------
    async function fetchEvents() {
        const cached = _getCached();
        if (cached && cached.events !== undefined) return cached;

        try {
            const evResp = await fetch(`${API_BASE}/users/${GITEE_USER}/events/public?limit=30&page=1`, {
                headers: { 'Accept': 'application/json' }
            });
            if (!evResp.ok) throw new Error(`HTTP ${evResp.status}`);
            const events = await evResp.json();

            let user = null;
            try {
                const uResp = await fetch(`${API_BASE}/users/${GITEE_USER}`, {
                    headers: { 'Accept': 'application/json' }
                });
                if (uResp.ok) user = await uResp.json();
            } catch(e) {}

            const data = { events, user };
            _setCache(data);
            return data;
        } catch (err) {
            console.warn('[GiteeActivity] Fetch failed:', err);
            return null;
        }
    }

    // ------------ Render heatmap ------------
    function renderHeatmap(data, lang) {
        const events = data ? data.events : null;
        const user = data ? data.user : null;
        const container = document.getElementById('gitee-heatmap');
        const totalEl = document.getElementById('gitee-heatmap-total');
        const labelEl = document.getElementById('gitee-heatmap-label');
        if (!container) return;

        const t = I18N_FEED[lang] || I18N_FEED.en;
        if (labelEl) labelEl.textContent = t.heatmapLabel;

        // Build daily counts for last 30 days
        const dayCounts = {};
        const now = new Date();
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            dayCounts[key] = 0;
        }

        let totalActions = 0;
        if (events) {
            events.forEach(ev => {
                const key = ev.created_at?.slice(0, 10);
                if (key && dayCounts.hasOwnProperty(key)) {
                    dayCounts[key]++;
                    totalActions++;
                }
            });
        }

        if (totalEl) totalEl.textContent = t.heatmapTotal(totalActions, user);

        // Find max for level scaling
        const counts = Object.values(dayCounts);
        const maxCount = Math.max(...counts, 1);

        let html = '';
        const sortedDays = Object.keys(dayCounts).sort();
        sortedDays.forEach(day => {
            const count = dayCounts[day];
            let level = 0;
            if (count > 0) {
                const ratio = count / maxCount;
                if (ratio <= 0.25) level = 1;
                else if (ratio <= 0.5) level = 2;
                else if (ratio <= 0.75) level = 3;
                else level = 4;
            }
            const dateLabel = new Date(day).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' });
            const levelName = t.legend[level];
            const tip = `${dateLabel} — ${levelName} (${count})`;
            html += `<div class="gitee-heatmap-cell" data-level="${level}" title="${tip}"></div>`;
        });

        // Legend
        html += '<div class="gitee-heatmap-legend">';
        for (let i = 0; i <= 4; i++) {
            html += `<div class="gitee-heatmap-legend-item"><span class="gitee-heatmap-cell-mini" data-level="${i}"></span><span class="gitee-heatmap-legend-text">${t.legend[i]}</span></div>`;
        }
        html += '</div>';

        container.innerHTML = html;
    }

    // ------------ Render feed list ------------
    function renderFeed(events, lang) {
        const container = document.getElementById('gitee-feed');
        if (!container) return;

        const t = I18N_FEED[lang] || I18N_FEED.en;

        if (!events) {
            container.innerHTML = `
                <div class="battlelog-empty">
                    <div class="battlelog-empty-icon">📻</div>
                    <div class="battlelog-empty-title">${t.errorTitle}</div>
                    <div class="battlelog-empty-desc">${t.errorDesc}</div>
                </div>`;
            return;
        }

        if (events.length === 0) {
            container.innerHTML = `
                <div class="battlelog-empty">
                    <div class="battlelog-empty-icon">📻</div>
                    <div class="battlelog-empty-title">${t.emptyTitle}</div>
                    <div class="battlelog-empty-desc">${t.emptyDesc}</div>
                </div>`;
            return;
        }

        const display = events.slice(0, 12);
        let html = '';

        display.forEach((ev, idx) => {
            const type = ev.type || '_default';
            const repoName = _getEventRepoName(ev);
            let iconInfo = EVENT_ICONS[type] || { icon: '<i class="fas fa-bolt"></i>', cls: 'type-default' };
            const callsign = _getCallsign(idx, lang);

            // Extract subtle commit hint for PushEvents
            let commitHint = '';
            if (type === 'PushEvent' && ev.payload?.commits?.length) {
                const lastCommit = ev.payload.commits[ev.payload.commits.length - 1];
                if (lastCommit?.message) {
                    const msg = lastCommit.message.split('\n')[0].substring(0, 50);
                    commitHint = `<div class="gitee-feed-commit-hint">// ${msg}</div>`;

                    // Dynamically change icon based on commit message prefix
                    const lowerMsg = msg.toLowerCase();
                    if (lowerMsg.startsWith('fix') || lowerMsg.startsWith('bug')) {
                        iconInfo = { icon: '<i class="fas fa-wrench"></i>', cls: 'type-push' };
                    } else if (lowerMsg.startsWith('feat') || lowerMsg.startsWith('add') || lowerMsg.startsWith('new')) {
                        iconInfo = { icon: '<i class="fas fa-plus-circle"></i>', cls: 'type-push' };
                    } else if (lowerMsg.startsWith('improve') || lowerMsg.startsWith('refactor') || lowerMsg.startsWith('update')) {
                        iconInfo = { icon: '<i class="fas fa-arrow-up"></i>', cls: 'type-push' };
                    } else if (lowerMsg.startsWith('docs')) {
                        iconInfo = { icon: '<i class="fas fa-book"></i>', cls: 'type-push' };
                    }
                }
            }

            const actionFn = t.actions[type] || t.actions._default;
            const actionText = actionFn(repoName, callsign);
            const timeText = _timeAgo(ev.created_at, lang);

            html += `
                <div class="gitee-feed-item">
                    <div class="gitee-feed-icon ${iconInfo.cls}">${iconInfo.icon}</div>
                    <div class="gitee-feed-body">
                        <div class="gitee-feed-action">${actionText}</div>
                        ${commitHint}
                        <div class="gitee-feed-time"><i class="fas fa-clock" style="margin-right:3px;opacity:0.5"></i>${timeText}</div>
                    </div>
                </div>`;
        });

        container.innerHTML = html;
    }

    // ------------ Update status indicator ------------
    function updateStatus(online, lang) {
        const t = I18N_FEED[lang] || I18N_FEED.en;
        const dot = document.getElementById('gitee-status-dot');
        const text = document.getElementById('gitee-status-text');
        if (dot) {
            const dotSpan = dot.querySelector('span:first-child');
            if (dotSpan) {
                dotSpan.className = `inline-block w-2 h-2 rounded-full ${online ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`;
            }
        }
        if (text) text.textContent = online ? t.statusLive : 'OFFLINE';
    }

    // ------------ Public init & refresh ------------
    async function init(lang) {
        lang = lang || 'en';

        const titleEl = document.getElementById('battlelog-title');
        const t = I18N_FEED[lang] || I18N_FEED.en;
        if (titleEl) titleEl.textContent = t.title;

        const data = await fetchEvents();
        const online = !!data;

        updateStatus(online, lang);
        renderHeatmap(data, lang);
        renderFeed(data ? data.events : null, lang);
    }

    async function refresh(lang) {
        localStorage.removeItem(CACHE_KEY);
        await init(lang);
    }

    return { init, refresh };
})();
