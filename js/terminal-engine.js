/**
 * Terminal Engine - 翻转卡片模拟终端
 * 卡片正面=紧凑学习卡，背面=完整终端（翻转进入）。
 * 纯前端模拟：命令处理器只操作内存虚拟状态，无真实命令/文件/网络访问。
 * 键盘敲击音效：Web Audio 合成，默认开启，可关闭（localStorage 记忆）。
 */
(function () {
  'use strict';

  // ---------- 共享虚拟文件系统工具 ----------
  const VFS = {
    makeFS: function () {
      return {
        tree: {
          '/': {
            type: 'dir',
            children: {
              'home': { type: 'dir', children: {
                'user': { type: 'dir', children: {
                  'projects': { type: 'dir', children: {
                    'website': { type: 'dir', children: {
                      'index.html': { type: 'file', size: 2048, content: '<!DOCTYPE html>\n<html>\n  <head>\n    <title>My Site</title>\n  </head>\n  <body>\n    <h1>Hello World</h1>\n  </body>\n</html>' },
                      'style.css': { type: 'file', size: 1536, content: 'body {\n  margin: 0;\n  font-family: sans-serif;\n  background: #111;\n  color: #eee;\n}\n\nh1 {\n  text-align: center;\n}' },
                      'app.js': { type: 'file', size: 4096, content: '// main entry\nconsole.log("app started");\n\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\ngreet("RickinG");' }
                    } },
                    'notes': { type: 'dir', children: {} }
                  } },
                  'docs': { type: 'dir', children: {
                    'readme.md': { type: 'file', size: 1024, content: '# Field Toolkit\n\nInteractive command learning terminal.\n\n- cd: change directory\n- ls: list files\n- mkdir: make directory\n- pwd: print working directory' },
                    'todo.txt': { type: 'file', size: 512, content: 'TODO list:\n- learn git\n- practice linux\n- build a project' }
                  } },
                  'secret.txt': { type: 'file', size: 128, content: 'ACCESS GRANTED' },
                  'deploy.sh': { type: 'file', size: 768, content: '#!/bin/bash\necho "deploying..."\nnpm run build' }
                } }
              } }
            }
          }
        },
        cwd: '/home/user',
        mode: {}
      };
    },

    resolve: function (fs, p) {
      if (!p || p === '~') p = '/home/user';
      if (p === '/') return '/';
      let parts;
      if (p.startsWith('/')) parts = p.split('/').filter(Boolean);
      else parts = fs.cwd.split('/').filter(Boolean).concat(p.split('/').filter(Boolean));
      const stack = [];
      for (const seg of parts) {
        if (seg === '.') continue;
        if (seg === '..') { stack.pop(); continue; }
        stack.push(seg);
      }
      return '/' + stack.join('/');
    },

    get: function (fs, path) {
      if (path === '/') return fs.tree['/'];
      const parts = path.split('/').filter(Boolean);
      let node = fs.tree['/'];
      for (const seg of parts) {
        if (!node || node.type !== 'dir' || !node.children || !node.children[seg]) return null;
        node = node.children[seg];
      }
      return node;
    },

    parent: function (fs, path) {
      const parts = path.split('/').filter(Boolean);
      const name = parts.pop();
      const parent = VFS.get(fs, '/' + parts.join('/'));
      return { parent, name };
    },

    modeStr: function (fs, node, path) {
      const m = fs.mode[path];
      if (m) return m;
      return node.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--';
    }
  };

  // ---------- 键盘音效（Web Audio 合成） ----------
  const KeySound = {
    ctx: null,
    enabled: true,
    lastPlay: 0,

    init: function () {
      // 从 localStorage 读取偏好
      try {
        const saved = localStorage.getItem('toolkit_keysound');
        this.enabled = saved === null ? true : saved !== 'off';
      } catch (e) { this.enabled = true; }
    },

    getCtx: function () {
      if (!this.ctx) {
        try {
          const AC = window.AudioContext || window.webkitAudioContext;
          if (AC) this.ctx = new AC();
        } catch (e) { return null; }
      }
      return this.ctx;
    },

    // 敲击声：短促的高频 click（合成，无需音频文件）
    play: function () {
      if (!this.enabled) return;
      const now = Date.now();
      if (now - this.lastPlay < 25) return; // 节流，避免连击过密
      this.lastPlay = now;
      const ctx = this.getCtx();
      if (!ctx) return;
      try {
        if (ctx.state === 'suspended') ctx.resume();
        const t = ctx.currentTime;
        // 主体 click
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(2200, t);
        osc.frequency.exponentialRampToValueAtTime(900, t + 0.03);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.05);
        // 低音 body（让声音更"键盘"）
        const osc2 = ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(180, t);
        const g2 = ctx.createGain();
        g2.gain.setValueAtTime(0.03, t);
        g2.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
        osc2.connect(g2).connect(ctx.destination);
        osc2.start(t);
        osc2.stop(t + 0.04);
      } catch (e) { /* ignore */ }
    },

    // 回车音效：稍低频的确认声
    playEnter: function () {
      if (!this.enabled) return;
      const ctx = this.getCtx();
      if (!ctx) return;
      try {
        if (ctx.state === 'suspended') ctx.resume();
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, t);
        osc.frequency.exponentialRampToValueAtTime(260, t + 0.06);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.07, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.08);
      } catch (e) { /* ignore */ }
    },

    toggle: function () {
      this.enabled = !this.enabled;
      try { localStorage.setItem('toolkit_keysound', this.enabled ? 'on' : 'off'); } catch (e) {}
      return this.enabled;
    }
  };

  // ---------- 终端引擎（翻转卡片） ----------
  const Term = {
    // 翻转进入某张卡片的终端（背面）
    open: function (topic) {
      const cfg = (window.TOOLKIT_DATA || {})[topic];
      if (!cfg || !cfg.term) return;
      const card = document.querySelector('.tool-card[data-topic="' + topic + '"]');
      if (!card) return;

      // 初始化独立状态（首次）
      if (!card.__termInited) {
        const init = typeof cfg.term.initialState === 'function' ? cfg.term.initialState() : (cfg.term.initialState || {});
        card.__termState = JSON.parse(JSON.stringify(init));
        card.__termCfg = cfg.term;
        card.__termHistory = [];
        card.__termHistIdx = 0;
        card.__termInited = true;

        // 渲染 banner + hint
        const out = card.querySelector('[data-term-out]');
        const banner = cfg.term.banner;
        if (banner) {
          (Array.isArray(banner) ? banner : [banner]).forEach(l => this.print(card, l, 'text-[var(--t-accent)]'));
        }
        this.print(card, cfg.term.hint || '// 输入 help 查看可用命令。Tab 补全，↑↓ 历史，exit 返回。', 'text-gray-500');
      }

      // 翻转卡片
      const inner = card.querySelector('.tool-card-inner');
      inner.classList.add('flipped');
      this.updatePrompt(card);

      // 聚焦输入
      const input = card.querySelector('[data-term-input]');
      setTimeout(() => input.focus(), 450);
    },

    // 翻回正面
    close: function (card) {
      const inner = card.querySelector('.tool-card-inner');
      inner.classList.remove('flipped');
      const input = card.querySelector('[data-term-input]');
      if (input) input.blur();
    },

    updatePrompt: function (card) {
      const cfg = card.__termCfg;
      const state = card.__termState;
      const p = card.querySelector('[data-term-prompt]');
      if (typeof cfg.prompt === 'function') {
        // 纯文本渲染，杜绝 HTML 注入（prompt 返回纯文本，无标签）
        p.textContent = cfg.prompt(state);
      } else {
        p.textContent = cfg.prompt || 'user@ricking-hq:~$ ';
      }
    },

    print: function (card, text, cls) {
      const out = card.querySelector('[data-term-out]');
      const line = document.createElement('div');
      line.className = 'whitespace-pre-wrap break-words ' + (cls || 'text-gray-300');
      line.innerHTML = this.sanitize(text);
      out.appendChild(line);
      out.scrollTop = out.scrollHeight;
    },

    // HTML 白名单净化：先整体转义，再还原合法 span 标签（内容保持转义）
    // 只允许严格格式 <span class="...">（无额外空格/属性），杜绝属性与标签注入
    sanitize: function (html) {
      // 1. 提取所有严格合法 span 标签
      const tagRe = /<span class="[^"]*">|<\/span>/g;
      const tags = [];
      let m;
      while ((m = tagRe.exec(html)) !== null) tags.push(m[0]);
      // 2. 整体转义（含 & < > " '）
      let out = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      // 3. 按出现顺序把合法 span 标签还原（内容仍是转义态）
      tags.forEach(function (tag) {
        const escTag = tag.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        out = out.replace(escTag, tag);
      });
      return out;
    },

    printLines: function (card, lines) {
      (lines || []).forEach(l => {
        if (l && l.cls) this.print(card, l.text, l.cls);
        else this.print(card, l || '');
      });
    },

    runInput: function (card, inputEl) {
      KeySound.playEnter();
      const raw = inputEl.value.trim();
      inputEl.value = '';
      const cfg = card.__termCfg;
      const state = card.__termState;
      if (!raw) { this.updatePrompt(card); return; }

      const promptStr = (typeof cfg.prompt === 'function' ? cfg.prompt(state) : (cfg.prompt || 'user@ricking-hq:~$ '));
      this.print(card, `<span class="text-[var(--t-success-muted)]">${promptStr}</span> ${this.escapeHtml(raw)}`);

      card.__termHistory.push(raw);
      card.__termHistIdx = card.__termHistory.length;

      const parts = this.tokenize(raw);
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1);

      let handler = null;
      if (cmd === 'git' && args.length) {
        const combined = 'git ' + args[0];
        if (cfg.commands[combined]) { handler = cfg.commands[combined]; args.shift(); }
      }
      if (!handler) handler = cfg.commands[cmd];

      if (cmd === 'help') { this.cmdHelp(card); }
      else if (cmd === 'exit' || cmd === 'quit') { this.print(card, '<span class="text-gray-500">// 返回学习卡</span>'); this.close(card); return; }
      else if (cmd === 'clear') { card.querySelector('[data-term-out]').innerHTML = ''; this.updatePrompt(card); return; }
      else if (handler) {
        try {
          const out = handler.run(state, args, this, card);
          this.printLines(card, out);
        } catch (err) {
          this.print(card, `<span class="text-red-400">error: ${this.escapeHtml(err.message || err)}</span>`);
        }
      } else {
        const all = Object.keys(cfg.commands).map(c => c.split(' ')[0]);
        const guess = all.find(c => c.startsWith(cmd));
        this.print(card, `<span class="text-red-400">bash: ${this.escapeHtml(cmd)}: command not found</span>`);
        if (guess) this.print(card, `<span class="text-yellow-500">// 你是指 "${guess}" 吗？输入 help 查看全部命令。</span>`);
        else this.print(card, '<span class="text-gray-500">// 输入 help 查看可用命令。</span>');
      }
      this.updatePrompt(card);
      card.querySelector('[data-term-out]').scrollTop = card.querySelector('[data-term-out]').scrollHeight;
    },

    cmdHelp: function (card) {
      const cfg = card.__termCfg;
      this.print(card, '// 可用命令:', 'text-[var(--t-accent)]');
      Object.keys(cfg.commands).forEach(c => {
        const d = cfg.commands[c];
        const usage = d.usage || c;
        this.print(card, `  <span class="text-gray-100">${this.escapeHtml(usage)}</span><span class="text-gray-500"> — ${d.desc || ''}</span>`);
      });
      this.print(card, '  <span class="text-gray-100">exit</span><span class="text-gray-500"> — 返回学习卡</span>');
      this.print(card, '  <span class="text-gray-100">clear</span><span class="text-gray-500"> — 清屏</span>');
      if (cfg.helpExtra) this.print(card, '// ' + cfg.helpExtra, 'text-gray-500');
    },

    tabComplete: function (card, inputEl) {
      const cfg = card.__termCfg;
      const state = card.__termState;
      const val = inputEl.value;
      const parts = val.split(/\s+/);
      if (val.endsWith(' ')) return;
      const partial = parts[parts.length - 1] || '';
      const cmds = Object.keys(cfg.commands).map(c => c.split(' ')[0]);
      if (parts.length === 1) {
        const matches = cmds.filter(c => c.startsWith(partial));
        if (matches.length === 1) inputEl.value = matches[0] + ' ';
        else if (matches.length > 1) this.print(card, '// ' + matches.join('  '), 'text-gray-500');
      } else if (cfg.complete && typeof cfg.complete === 'function') {
        const suggestions = cfg.complete(state, parts[0], partial) || [];
        const matches = suggestions.filter(s => s.startsWith(partial));
        if (matches.length === 1) inputEl.value = parts.slice(0, -1).join(' ') + ' ' + matches[0];
        else if (matches.length > 1) this.print(card, '// ' + matches.join('  '), 'text-gray-500');
      }
      this.updatePrompt(card);
    },

    navHist: function (card, inputEl, dir) {
      const hist = card.__termHistory || [];
      if (!hist.length) return;
      card.__termHistIdx += dir;
      if (card.__termHistIdx < 0) card.__termHistIdx = 0;
      if (card.__termHistIdx > hist.length) card.__termHistIdx = hist.length;
      inputEl.value = hist[card.__termHistIdx] || '';
      this.updatePrompt(card);
    },

    tokenize: function (raw) {
      const parts = [];
      const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
      let m;
      while ((m = re.exec(raw)) !== null) {
        parts.push(m[1] !== undefined ? m[1] : (m[2] !== undefined ? m[2] : m[3]));
      }
      return parts;
    },

    escapeHtml: function (s) {
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
  };

  // ---------- 绑定卡片交互 ----------
  function bindCardTerminals() {
    document.querySelectorAll('.tool-card[data-topic]').forEach(card => {
      const topic = card.dataset.topic;
      const cfg = (window.TOOLKIT_DATA || {})[topic];
      if (!cfg) return;

      // 正面：渲染紧凑命令网格（横向多列，命令+解释）
      const frontCmds = card.querySelector('[data-front-cmds]');
      if (frontCmds && cfg.cmds) {
        // 横向网格：3 列布局，命令名 + 中文解释
        const cmds = cfg.cmds;
        const esc = Term.escapeHtml;
        frontCmds.innerHTML = `<div class="grid grid-cols-2 sm:grid-cols-3 gap-x-2 gap-y-1">
          ${cmds.map(c => `
            <div class="min-w-0 leading-tight">
              <div class="text-[10px] font-mono text-[var(--t-accent)] truncate" title="${esc(c.zh)}">${c.cmd}</div>
              <div class="text-[8px] text-gray-500 truncate">${esc(c.zh)}</div>
            </div>`).join('')}
        </div>
        <div class="text-[9px] text-gray-600 mt-1.5">// 共 ${cmds.length} 条命令，翻转终端实操</div>`;
      }

      // 背面输入绑定
      const input = card.querySelector('[data-term-input]');
      if (input) {
        input.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') { e.preventDefault(); Term.runInput(card, input); }
          else if (e.key === 'Tab') { e.preventDefault(); Term.tabComplete(card, input); }
          else if (e.key === 'ArrowUp') { e.preventDefault(); Term.navHist(card, input, -1); }
          else if (e.key === 'ArrowDown') { e.preventDefault(); Term.navHist(card, input, 1); }
          else if (e.key === 'Escape') { Term.close(card); }
          else if (e.key.length === 1) { KeySound.play(); }
        });
        // 移动端软键盘输入：input 事件补音效（keydown 在部分移动浏览器不触发）
        input.addEventListener('input', function (e) {
          if (e.inputType === 'insertText' || e.inputType === 'insertCompositionText') {
            KeySound.play();
          }
        });
      }
    });
  }

  // 全局：翻转卡片
  window.flipCard = function (el) {
    const card = el.closest('.tool-card');
    const inner = card.querySelector('.tool-card-inner');
    if (inner.classList.contains('flipped')) {
      Term.close(card);
    } else {
      Term.open(card.dataset.topic);
    }
  };

  // 全局：切换音效
  window.toggleKeySound = function (btn) {
    const on = KeySound.toggle();
    syncKeySoundBtn(btn);
    if (on) KeySound.play();
    return on;
  };

  // 同步音效按钮 UI（不翻转状态）
  function syncKeySoundBtn(btn) {
    if (!btn) return;
    const on = KeySound.enabled;
    btn.innerHTML = on
      ? '<i class="fa-solid fa-volume-high"></i>'
      : '<i class="fa-solid fa-volume-xmark"></i>';
    btn.title = on ? '键盘音效：开（点击关闭）' : '键盘音效：关（点击开启）';
    btn.classList.toggle('text-gray-500', !on);
    btn.classList.toggle('text-[var(--t-accent)]', on);
  }

  window.TerminalEngine = Term;
  window.VFS = VFS;
  window.KeySound = KeySound;

  // DOM ready
  function init() {
    KeySound.init();
    bindCardTerminals();
    // 同步音效按钮状态（不翻转）
    const btn = document.getElementById('keysound-toggle');
    syncKeySoundBtn(btn);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
