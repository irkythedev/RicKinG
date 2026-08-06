/**
 * Field Toolkit - 命令学习数据（按主题窗口分组）
 * 每个窗口: cmds(命令卡) + quiz(练习测验)
 */
window.TOOLKIT_DATA = {

  // ============ 窗口1: Git 基础 ============
  git: {
    title: 'Git 基础',
    desc: '版本控制核心命令',
    icon: 'fa-brands fa-git-alt',
    color: '#F05133',
    term: {
      title: 'Git 仓库模拟',
      banner: [
        '<span class="text-[var(--t-accent)]">┌─────────────────────────────────────────────┐</span>',
        '<span class="text-[var(--t-accent)]">│  Git Simulator — 虚拟仓库训练场              │</span>',
        '<span class="text-[var(--t-accent)]">└─────────────────────────────────────────────┘</span>'
      ],
      hint: '// 试试: git status  ·  git add app.js  ·  git commit -m "feat: init"  ·  git log --oneline',
      initialState: {
        branch: 'master',
        remote: 'gitee.com/K4Ricky2Win/demo.git',
        untracked: ['index.html', 'style.css', 'app.js', 'readme.md'],
        modified: [],
        staged: [],
        commits: [],
        pushed: false
      },
      prompt: (s) => `git@repo:~/demo (${s.branch}) $ `,
      complete: (s, cmd, partial) => {
        if (cmd === 'git') {
          const subs = ['add', 'commit', 'status', 'log', 'push', 'pull', 'branch', 'checkout', 'diff', 'init'];
          return subs;
        }
        if (cmd === 'git add') {
          return s.untracked.concat(s.modified);
        }
        return [];
      },
      commands: {
        'git init': {
          usage: 'git init', desc: '初始化仓库',
          run: (s) => [s.commits.length ? 'Reinitialized existing Git repository in ~/demo/.git/' : 'Initialized empty Git repository in ~/demo/.git/']
        },
        'git status': {
          usage: 'git status', desc: '查看仓库状态',
          run: (s) => {
            const out = [];
            out.push(`On branch ${s.branch}`);
            out.push(s.commits.length ? `Your branch is ${s.pushed ? 'up to date with' : 'ahead of'} origin/${s.branch}` : 'No commits yet on ' + s.branch);
            if (!s.untracked.length && !s.modified.length && !s.staged.length) {
              out.push('nothing to commit, working tree clean');
              return out;
            }
            if (s.staged.length) {
              out.push('');
              out.push('Changes to be committed:');
              s.staged.forEach(f => out.push(`  <span class="text-green-400">new file:</span>   ${f}`));
            }
            if (s.modified.length) {
              out.push('');
              out.push('Changes not staged for commit:');
              s.modified.forEach(f => out.push(`  <span class="text-red-400">modified:</span>   ${f}`));
              out.push('  <span class="text-gray-500">(use "git add &lt;file&gt;" to update what will be committed)</span>');
            }
            if (s.untracked.length) {
              out.push('');
              out.push('Untracked files:');
              s.untracked.forEach(f => out.push(`  <span class="text-red-400">${f}</span>`));
              out.push('  <span class="text-gray-500">(use "git add &lt;file&gt;" to include in what will be committed)</span>');
            }
            return out;
          }
        },
        'git add': {
          usage: 'git add <文件|.>', desc: '暂存更改',
          run: (s, a) => {
            const target = a[0];
            if (!target) return ['<span class="text-red-400">Nothing specified, nothing added.</span>'];
            if (target === '.') {
              const files = s.untracked.concat(s.modified);
              if (!files.length) return ['nothing to add'];
              s.staged = s.staged.concat(files);
              s.untracked = [];
              s.modified = [];
              return files.map(f => `<span class="text-green-400">add '${f}'</span>`);
            }
            if (s.untracked.includes(target)) {
              s.staged.push(target);
              s.untracked = s.untracked.filter(f => f !== target);
              return [`<span class="text-green-400">add '${target}'</span>`];
            }
            if (s.modified.includes(target)) {
              s.staged.push(target);
              s.modified = s.modified.filter(f => f !== target);
              return [`<span class="text-green-400">add '${target}'</span>`];
            }
            return [`<span class="text-red-400">fatal: pathspec '${target}' did not match any files</span>`];
          }
        },
        'git commit': {
          usage: 'git commit -m "消息"', desc: '提交到本地',
          run: (s, a) => {
            if (!s.staged.length) return ['<span class="text-red-400">nothing to commit (create/copy files and use "git add" to track)</span>'];
            const msg = a.includes('-m') ? a[a.indexOf('-m') + 1] : (a[0] || 'commit');
            const hash = 'a' + Math.random().toString(16).slice(2, 8);
            s.commits.unshift({ hash, msg, files: [...s.staged] });
            s.staged = [];
            s.pushed = false;
            return [
              `[${s.branch} ${hash}] ${msg}`,
              ` ${s.commits[0].files.length} file(s) changed`,
              `<span class="text-gray-500">// commit 已创建，试试 git log --oneline</span>`
            ];
          }
        },
        'git log': {
          usage: 'git log [--oneline]', desc: '查看提交历史',
          run: (s, a) => {
            if (!s.commits.length) return ['fatal: your current branch has no commits yet'];
            if (a.includes('--oneline')) {
              return s.commits.map(c => `<span class="text-yellow-400">${c.hash}</span> ${c.msg}`);
            }
            return s.commits.map(c => [
              `<span class="text-yellow-400">commit ${c.hash}</span>`,
              `Author: RickinG <rick@demo.dev>`,
              `Date:   ${new Date().toDateString()}`,
              '',
              `    ${c.msg}`,
              ''
            ]).flat();
          }
        },
        'git push': {
          usage: 'git push', desc: '推送到远程',
          run: (s) => {
            if (!s.commits.length) return ['<span class="text-red-400">error: src refspec master does not match any</span>'];
            if (s.pushed) return [`Everything up-to-date (origin/${s.branch})`];
            s.pushed = true;
            return [
              `To ${s.remote}`,
              `   ${s.commits[0].hash}..${s.commits[0].hash}  ${s.branch} -> ${s.branch}`,
              `<span class="text-green-400">✓ push 成功，代码已同步到远程</span>`
            ];
          }
        },
        'git pull': {
          usage: 'git pull', desc: '拉取远程更新',
          run: (s) => {
            if (s.pushed) return ['Already up to date.'];
            if (s.commits.length) {
              s.pushed = true;
              return ['Updating ' + s.commits[0].hash + '..' + s.commits[0].hash, '<span class="text-gray-500">Fast-forward</span>', '<span class="text-green-400">✓ 已与远程同步</span>'];
            }
            return ['There is no tracking information for the current branch.', '<span class="text-gray-500">// 先 git push 建立跟踪</span>'];
          }
        },
        'git branch': {
          usage: 'git branch', desc: '查看分支',
          run: (s) => [`* <span class="text-green-400">${s.branch}</span>`, '<span class="text-gray-500">  (其他分支: feature/login, dev — 可扩展)</span>']
        },
        'git diff': {
          usage: 'git diff', desc: '查看未暂存差异',
          run: (s) => {
            if (!s.modified.length) return ['<span class="text-gray-500">(无未暂存改动)</span>'];
            return s.modified.flatMap(f => [
              `<span class="text-yellow-400">diff --git a/${f} b/${f}</span>`,
              `<span class="text-red-400">- old line in ${f}</span>`,
              `<span class="text-green-400">+ new line in ${f}</span>`,
              ''
            ]);
          }
        },
        'git checkout': {
          usage: 'git checkout <分支>', desc: '切换分支',
          run: (s, a) => {
            const target = a[0];
            if (!target) return ['<span class="text-red-400">fatal: you must specify branch name</span>'];
            if (target === s.branch) return [`Already on '${s.branch}'`];
            s.branch = target;
            return [`Switched to branch '${target}'`, `<span class="text-gray-500">// 虚拟分支切换成功</span>`];
          }
        },
        'git status -s': {
          usage: 'git status -s', desc: '简洁状态',
          run: (s) => {
            const rows = [];
            s.staged.forEach(f => rows.push(`<span class="text-green-400">A  </span> ${f}`));
            s.modified.forEach(f => rows.push(`<span class="text-red-400"> M </span> ${f}`));
            s.untracked.forEach(f => rows.push(`<span class="text-red-400">?? </span> ${f}`));
            return rows.length ? rows : ['(working tree clean)'];
          }
        }
      }
    },
    cmds: [
      { cmd: 'git init', zh: '初始化仓库', desc: '当前目录创建 Git 仓库', ex: ['git init', 'git init my-proj'] },
      { cmd: 'git add', zh: '暂存更改', desc: '把改动加入暂存区', ex: ['git add .', 'git add src/app.js'] },
      { cmd: 'git commit', zh: '提交', desc: '保存为一次提交', ex: ['git commit -m "feat: login"', 'git commit -am "fix: typo"'] },
      { cmd: 'git status', zh: '查看状态', desc: '哪些文件改过未提交', ex: ['git status', 'git status -s'] },
      { cmd: 'git log', zh: '提交历史', desc: '查看提交记录', ex: ['git log --oneline', 'git log --graph'] },
      { cmd: 'git push', zh: '推送到远程', desc: '本地提交上传到远程', ex: ['git push origin master', 'git push -u origin dev'], danger: true },
      { cmd: 'git clone', zh: '克隆仓库', desc: '从远程复制代码', ex: ['git clone <url>'] },
      { cmd: 'git branch', zh: '分支管理', desc: '查看/创建分支', ex: ['git branch', 'git branch dev'] },
      { cmd: 'git checkout', zh: '切换分支', desc: '切换/创建分支', ex: ['git checkout dev', 'git checkout -b feat'] },
      { cmd: 'git merge', zh: '合并分支', desc: '合并到当前分支', ex: ['git merge dev'] },
      { cmd: 'git diff', zh: '查看差异', desc: '查看改动内容', ex: ['git diff', 'git diff --staged'] },
      { cmd: 'git pull', zh: '拉取更新', desc: '拉取远程改动并合并', ex: ['git pull', 'git pull origin main'] }
    ],
    quiz: [
      { q: '把文件加入暂存区用哪个命令？', opts: ['git add .', 'git commit', 'git push'], ans: 0 },
      { q: '查看提交历史的命令是？', opts: ['git status', 'git log', 'git diff'], ans: 1 },
      { q: '把本地提交推送到远程用？', opts: ['git pull', 'git clone', 'git push'], ans: 2 }
    ]
  },

  // ============ 窗口2: 文件与目录 ============
  files: {
    title: '文件与目录',
    desc: 'Linux 文件操作',
    icon: 'fa-solid fa-folder-open',
    color: '#4D88FE',
    term: {
      title: 'Linux 文件系统模拟',
      banner: [
        '<span class="text-[var(--t-accent)]">┌─────────────────────────────────────────────┐</span>',
        '<span class="text-[var(--t-accent)]">│  Linux Terminal Simulator — 文件操作训练场    │</span>',
        '<span class="text-[var(--t-accent)]">└─────────────────────────────────────────────┘</span>'
      ],
      hint: '// 试试: ls -la  ·  cd projects/website  ·  mkdir test  ·  pwd  ·  cat docs/readme.md',
      initialState: () => VFS.makeFS(),
      prompt: (s) => `user@ricking-hq:${s.cwd.replace('/home/user', '~')}$ `,
      complete: (s, cmd, partial) => {
        if (cmd === 'cd' || cmd === 'cat' || cmd === 'ls') {
          const node = VFS.get(s, s.cwd);
          if (node && node.children) return Object.keys(node.children);
        }
        return [];
      },
      commands: {
        ls: {
          usage: 'ls [-la] [路径]', desc: '列出目录内容',
          run: (s, a) => {
            const path = a.length && !a[0].startsWith('-') ? VFS.resolve(s, a[0]) : s.cwd;
            const node = VFS.get(s, path);
            if (!node) return [`<span class="text-red-400">ls: cannot access '${a[0]}': No such file or directory</span>`];
            if (node.type === 'file') return [path];
            const long = a.includes('-l') || a.includes('-la') || a.includes('-al');
            const all = a.includes('-a') || a.includes('-la') || a.includes('-al');
            const names = Object.keys(node.children).sort();
            if (!all) return [names.join('  ') || '(empty)'];
            if (long) {
              const rows = names.map(n => {
                const c = node.children[n];
                const mode = VFS.modeStr(s, c, VFS.resolve(s, path + '/' + n));
                const size = c.type === 'dir' ? '4096' : String(c.size || 0);
                const dirMark = c.type === 'dir' ? '<span class="text-blue-400">' + n + '/</span>' : n;
                return `  <span class="text-gray-500">${mode}  1  user  group  ${size}  Jan 01 12:00</span> ${dirMark}`;
              });
              return ['total ' + names.length, ...rows];
            }
            return [names.join('  ')];
          }
        },
        cd: {
          usage: 'cd [路径]', desc: '切换目录 (.. / ~ / 绝对路径)',
          run: (s, a) => {
            if (!a.length || a[0] === '~') { s.cwd = '/home/user'; return []; }
            const path = VFS.resolve(s, a[0]);
            const node = VFS.get(s, path);
            if (!node) return [`<span class="text-red-400">cd: no such file or directory: ${a[0]}</span>`];
            if (node.type !== 'dir') return [`<span class="text-red-400">cd: not a directory: ${a[0]}</span>`];
            s.cwd = path;
            return [];
          }
        },
        pwd: { usage: 'pwd', desc: '显示当前路径', run: (s) => [s.cwd] },
        mkdir: {
          usage: 'mkdir [-p] <名称>', desc: '创建目录',
          run: (s, a) => {
            const p = a[a.length - 1];
            if (!p) return ['<span class="text-red-400">mkdir: missing operand</span>'];
            const path = VFS.resolve(s, p);
            if (VFS.get(s, path)) return [`<span class="text-red-400">mkdir: cannot create directory '${p}': File exists</span>`];
            const { parent, name } = VFS.parent(s, path);
            if (!parent) return ['<span class="text-red-400">mkdir: cannot create: no such directory</span>'];
            parent.children[name] = { type: 'dir', children: {} };
            return [];
          }
        },
        touch: {
          usage: 'touch <文件>', desc: '创建空文件',
          run: (s, a) => {
            const p = a[0];
            if (!p) return ['<span class="text-red-400">touch: missing operand</span>'];
            const path = VFS.resolve(s, p);
            const { parent, name } = VFS.parent(s, path);
            if (!parent) return ['<span class="text-red-400">touch: cannot create</span>'];
            if (!parent.children[name]) parent.children[name] = { type: 'file', size: 0, content: '' };
            return [];
          }
        },
        cat: {
          usage: 'cat <文件>', desc: '显示文件内容',
          run: (s, a) => {
            if (!a[0]) return ['<span class="text-red-400">cat: missing operand</span>'];
            const node = VFS.get(s, VFS.resolve(s, a[0]));
            if (!node) return [`<span class="text-red-400">cat: ${a[0]}: No such file or directory</span>`];
            if (node.type !== 'file') return [`<span class="text-red-400">cat: ${a[0]}: Is a directory</span>`];
            return [String(node.content || '').split('\n').join('\n')];
          }
        },
        cp: {
          usage: 'cp <源> <目标>', desc: '复制文件',
          run: (s, a) => {
            if (a.length < 2) return ['<span class="text-red-400">cp: missing operand</span>'];
            const src = VFS.get(s, VFS.resolve(s, a[0]));
            if (!src) return [`<span class="text-red-400">cp: cannot stat '${a[0]}': No such file</span>`];
            const dstPath = VFS.resolve(s, a[1]);
            const { parent, name } = VFS.parent(s, dstPath);
            if (!parent) return ['<span class="text-red-400">cp: cannot copy</span>'];
            parent.children[name] = JSON.parse(JSON.stringify(src));
            return [];
          }
        },
        mv: {
          usage: 'mv <源> <目标>', desc: '移动/重命名',
          run: (s, a) => {
            if (a.length < 2) return ['<span class="text-red-400">mv: missing operand</span>'];
            const srcPath = VFS.resolve(s, a[0]);
            const src = VFS.get(s, srcPath);
            if (!src) return [`<span class="text-red-400">mv: cannot stat '${a[0]}': No such file</span>`];
            const dstPath = VFS.resolve(s, a[1]);
            const { parent, name } = VFS.parent(s, dstPath);
            if (!parent) return ['<span class="text-red-400">mv: cannot move</span>'];
            parent.children[name] = src;
            const sp = VFS.parent(s, srcPath);
            delete sp.parent.children[sp.name];
            return [];
          }
        },
        rm: {
          usage: 'rm [-r] <目标>', desc: '⚠️ 删除（危险）',
          run: (s, a) => {
            const target = a.filter(x => !x.startsWith('-')).pop();
            if (!target) return ['<span class="text-red-400">rm: missing operand</span>'];
            const path = VFS.resolve(s, target);
            const node = VFS.get(s, path);
            if (!node) return [`<span class="text-red-400">rm: cannot remove '${target}': No such file</span>`];
            if (node.type === 'dir' && !a.includes('-r')) return [`<span class="text-red-400">rm: cannot remove '${target}': Is a directory (use -r)</span>`];
            const { parent, name } = VFS.parent(s, path);
            delete parent.children[name];
            return [`<span class="text-gray-500">removed '${target}'</span>`];
          }
        },
        grep: {
          usage: 'grep <关键词> <文件>', desc: '在文件中搜索',
          run: (s, a) => {
            if (a.length < 2) return ['<span class="text-red-400">grep: missing pattern</span>'];
            const node = VFS.get(s, VFS.resolve(s, a[1]));
            if (!node || node.type !== 'file') return [`<span class="text-red-400">grep: ${a[1]}: No such file</span>`];
            const lines = String(node.content || '').split('\n');
            const matches = lines.map((l, i) => ({ l, i })).filter(x => x.l.includes(a[0]));
            if (!matches.length) return [];
            return matches.map(m => `<span class="text-gray-500">${m.i + 1}:</span> ${m.l.replace(new RegExp(a[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '<span class="text-yellow-400">' + a[0] + '</span>')}`);
          }
        },
        chmod: {
          usage: 'chmod <模式> <文件>', desc: '修改权限 (755 / +x)',
          run: (s, a) => {
            if (a.length < 2) return ['<span class="text-red-400">chmod: missing operand</span>'];
            const path = VFS.resolve(s, a[1]);
            if (!VFS.get(s, path)) return [`<span class="text-red-400">chmod: cannot access '${a[1]}': No such file</span>`];
            const map = { '7': 'rwx', '6': 'rw-', '5': 'r-x', '4': 'r--', '0': '---' };
            const num = a[0].match(/^[0-7]{3}$/);
            if (num) {
              s.mode[path] = '-' + num[0].split('').map(d => map[d]).join('') + ' ' + num[0];
            } else if (a[0] === '+x') {
              s.mode[path] = '-rwxr-xr-x 755';
            } else if (a[0] === '600') {
              s.mode[path] = '-rw------- 600';
            }
            return [`<span class="text-gray-500">mode of '${a[1]}' changed</span>`];
          }
        },
        head: {
          usage: 'head [-n N] <文件>', desc: '显示文件开头 N 行',
          run: (s, a) => {
            const nIdx = a.indexOf('-n');
            const n = nIdx >= 0 ? parseInt(a[nIdx + 1]) || 10 : 10;
            const file = a[a.length - 1];
            const node = VFS.get(s, VFS.resolve(s, file));
            if (!node || node.type !== 'file') return [`<span class="text-red-400">head: ${file}: No such file</span>`];
            return String(node.content || '').split('\n').slice(0, n);
          }
        },
        tail: {
          usage: 'tail [-n N] <文件>', desc: '显示文件末尾 N 行',
          run: (s, a) => {
            const nIdx = a.indexOf('-n');
            const n = nIdx >= 0 ? parseInt(a[nIdx + 1]) || 10 : 10;
            const file = a[a.length - 1];
            const node = VFS.get(s, VFS.resolve(s, file));
            if (!node || node.type !== 'file') return [`<span class="text-red-400">tail: ${file}: No such file</span>`];
            return String(node.content || '').split('\n').slice(-n);
          }
        }
      }
    },
    cmds: [
      { cmd: 'cd', zh: '切换目录', desc: '进入指定目录', ex: ['cd ~', 'cd ..', 'cd /var/log'] },
      { cmd: 'ls', zh: '列出内容', desc: '显示目录下文件', ex: ['ls -la', 'ls -lh'] },
      { cmd: 'mkdir', zh: '创建目录', desc: '新建目录', ex: ['mkdir images', 'mkdir -p a/b/c'] },
      { cmd: 'pwd', zh: '当前路径', desc: '显示所在绝对路径', ex: ['pwd'] },
      { cmd: 'cp', zh: '复制', desc: '复制文件/目录', ex: ['cp a.txt b.txt', 'cp -r dir/ new/'] },
      { cmd: 'mv', zh: '移动/重命名', desc: '移动或改名', ex: ['mv a.txt b.txt', 'mv f dir/'] },
      { cmd: 'touch', zh: '创建文件', desc: '新建空文件', ex: ['touch app.js'] },
      { cmd: 'cat', zh: '查看内容', desc: '显示文件内容', ex: ['cat readme.md'] },
      { cmd: 'head', zh: '看开头', desc: '显示前 N 行', ex: ['head -n 5 log'] },
      { cmd: 'tail', zh: '看结尾', desc: '显示末尾/实时', ex: ['tail -f log'] },
      { cmd: 'rm', zh: '删除', desc: '⚠️ 删除不可恢复', ex: ['rm old.log', 'rm -rf build/'], danger: true }
    ],
    quiz: [
      { q: '进入上一级目录？', opts: ['cd ..', 'cd ~', 'cd -'], ans: 0 },
      { q: '列出含隐藏文件的全部内容？', opts: ['ls', 'ls -a', 'ls -1'], ans: 1 },
      { q: '递归创建多层目录？', opts: ['mkdir a/b/c', 'mkdir -p a/b/c', 'mkdir -r a/b/c'], ans: 1 }
    ]
  },

  // ============ 窗口3: 网络命令 ============
  network: {
    title: '网络命令',
    desc: '连通性 & 端口排查',
    icon: 'fa-solid fa-network-wired',
    color: '#10B981',
    term: {
      title: '网络诊断模拟',
      banner: [
        '<span class="text-[var(--t-accent)]">┌─────────────────────────────────────────────┐</span>',
        '<span class="text-[var(--t-accent)]">│  Network Simulator — 网络诊断训练场          │</span>',
        '<span class="text-[var(--t-accent)]">└─────────────────────────────────────────────┘</span>'
      ],
      hint: '// 试试: ping baidu.com  ·  curl -I https://example.com  ·  netstat -tlnp  ·  ip a',
      initialState: {
        hosts: {
          'baidu.com': { ip: '39.156.66.10', ms: 23 },
          'example.com': { ip: '93.184.216.34', ms: 180 },
          'gitee.com': { ip: '212.64.63.190', ms: 45 },
          '192.168.1.1': { ip: '192.168.1.1', ms: 1 }
        },
        ports: [
          { proto: 'tcp', addr: '0.0.0.0:22', svc: 'sshd' },
          { proto: 'tcp', addr: '0.0.0.0:80', svc: 'nginx' },
          { proto: 'tcp', addr: '127.0.0.1:3000', svc: 'node' },
          { proto: 'udp', addr: '0.0.0.0:53', svc: 'systemd-resolve' }
        ],
        requests: []
      },
      prompt: (s) => 'user@ricking-hq:~/net$ ',
      commands: {
        ping: {
          usage: 'ping <主机>', desc: '测试连通性',
          run: (s, a) => {
            const h = a[0];
            if (!h) return ['<span class="text-red-400">ping: missing host operand</span>'];
            const host = s.hosts[h];
            if (!host) return [`ping: ${h}: Name or service not known`, '<span class="text-gray-500">// 试试 baidu.com / example.com / gitee.com</span>'];
            const ms = host.ms + Math.floor(Math.random() * 8);
            return [
              `PING ${h} (${host.ip}) 56(84) bytes of data.`,
              `64 bytes from ${host.ip}: icmp_seq=1 ttl=52 time=${ms}.${Math.floor(Math.random()*90)} ms`,
              `64 bytes from ${host.ip}: icmp_seq=2 ttl=52 time=${ms}.${Math.floor(Math.random()*90)} ms`,
              `64 bytes from ${host.ip}: icmp_seq=3 ttl=52 time=${ms}.${Math.floor(Math.random()*90)} ms`,
              `64 bytes from ${host.ip}: icmp_seq=4 ttl=52 time=${ms}.${Math.floor(Math.random()*90)} ms`,
              '',
              `--- ${h} ping statistics ---`,
              `4 packets transmitted, 4 received, 0% packet loss, time 3005ms`,
              `<span class="text-green-400">✓ 网络连通正常</span>`
            ];
          }
        },
        'ip a': {
          usage: 'ip a', desc: '显示 IP 地址',
          run: (s) => [
            '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536',
            '    inet 127.0.0.1/8 scope host lo',
            '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500',
            '    inet <span class="text-green-400">192.168.1.100/24</span> brd 192.168.1.255 scope global eth0',
            '    inet6 fe80::20c:29ff:fe3b:2ec8/64 scope link',
            '3: wlan0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500',
            '    inet <span class="text-gray-500">(down)</span>'
          ]
        },
        ipconfig: {
          usage: 'ipconfig', desc: 'Windows 网络配置',
          run: (s) => [
            'Windows IP Configuration',
            '',
            'Ethernet adapter Ethernet0:',
            '   Connection-specific DNS Suffix  . : local',
            '   IPv4 Address. . . . . . . . . . . : <span class="text-green-400">192.168.1.100</span>',
            '   Subnet Mask . . . . . . . . . . . : 255.255.255.0',
            '   Default Gateway . . . . . . . . . : 192.168.1.1'
          ]
        },
        curl: {
          usage: 'curl <URL>', desc: 'HTTP 请求测试',
          run: (s, a) => {
            const u = a[0];
            if (!u) return ['<span class="text-red-400">curl: try \'curl --help\' for more information</span>'];
            if (a.includes('-I') || a.includes('-i')) {
              return [
                `HTTP/1.1 200 OK`,
                `Server: nginx/1.24.0`,
                `Content-Type: text/html; charset=utf-8`,
                `Content-Length: 15233`,
                `Cache-Control: no-cache`,
                `<span class="text-green-400">✓ 请求成功 (200 OK)</span>`
              ];
            }
            return [
              `<!DOCTYPE html>`,
              `<html>`,
              `  <head><title>${u.replace('https://', '').split('.')[0]}</title></head>`,
              `  <body>`,
              `    <h1>Welcome to ${u}</h1>`,
              `    <p>Simulated HTTP response</p>`,
              `  </body>`,
              `</html>`,
              `<span class="text-gray-500">// 加 -I 只看响应头</span>`
            ];
          }
        },
        netstat: {
          usage: 'netstat [-tlnp]', desc: '查看端口监听',
          run: (s, a) => {
            if (a.includes('-tlnp') || a.includes('-t') || a.includes('-a')) {
              const rows = s.ports.map(p =>
                `<span class="text-gray-500">${p.proto.padEnd(3)}  0      0</span> ${p.addr.padEnd(18)} <span class="text-gray-500">0.0.0.0:*</span>  <span class="text-yellow-400">LISTEN</span>  <span class="text-gray-500">${p.svc}</span>`);
              return ['Active Internet connections (servers and established)', 'Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name', ...rows];
            }
            return s.ports.map(p => `${p.proto}  ${p.addr}  LISTEN  ${p.svc}`);
          }
        },
        ssh: {
          usage: 'ssh <user@host>', desc: '远程登录',
          run: (s, a) => {
            if (!a[0]) return ['<span class="text-red-400">usage: ssh [-p port] user@host</span>'];
            return [
              `The authenticity of host '${a[0].split('@')[1]} (192.168.1.100)' can't be established.`,
              `ED25519 key fingerprint is SHA256:Ab3xY9...`,
              `Are you sure you want to continue connecting? (yes/no)`,
              `<span class="text-gray-500">// 模拟终端不实际连接，输入 yes 演示</span>`
            ];
          }
        },
        traceroute: {
          usage: 'traceroute <主机>', desc: '路由追踪',
          run: (s, a) => {
            const h = a[0];
            if (!h) return ['<span class="text-red-400">traceroute: missing host</span>'];
            const host = s.hosts[h] || { ip: '10.0.0.1' };
            return [
              `traceroute to ${h} (${host.ip}), 30 hops max`,
              ` 1  192.168.1.1 (192.168.1.1)  1.2 ms  1.1 ms  1.3 ms`,
              ` 2  10.10.0.1 (10.10.0.1)  5.4 ms  5.1 ms  5.6 ms`,
              ` 3  172.16.1.254 (172.16.1.254)  12.3 ms  12.1 ms  12.5 ms`,
              ` 4  ${host.ip} (${host.ip})  21.8 ms  21.5 ms  22.0 ms`,
              `<span class="text-green-400">✓ 到达目标 ${h}</span>`
            ];
          }
        },
        dig: {
          usage: 'dig <域名>', desc: 'DNS 查询',
          run: (s, a) => {
            const h = a[0];
            if (!h) return ['<span class="text-red-400">dig: missing host</span>'];
            const host = s.hosts[h] || { ip: '93.184.216.34' };
            return [
              `; <<>> DiG 9.18 <<>> ${h}`,
              `;; QUESTION SECTION:`,
              `;${h}.  IN  A`,
              `;; ANSWER SECTION:`,
              `${h}.  600  IN  A  ${host.ip}`,
              `;; Query time: 12 msec`,
              `<span class="text-green-400">✓ DNS 解析成功</span>`
            ];
          }
        },
        nslookup: {
          usage: 'nslookup <域名>', desc: 'DNS 查询（Windows 风格）',
          run: (s, a) => {
            const h = a[0];
            if (!h) return ['<span class="text-red-400">nslookup: missing host</span>'];
            const host = s.hosts[h] || { ip: '93.184.216.34' };
            return [
              `Server:  localhost`,
              `Address:  127.0.0.1#53`,
              ``,
              `Non-authoritative answer:`,
              `Name:    ${h}`,
              `Address: ${host.ip}`,
              `<span class="text-green-400">✓ 解析完成</span>`
            ];
          }
        },
        wget: {
          usage: 'wget <URL>', desc: '下载文件（模拟）',
          run: (s, a) => {
            const u = a[0];
            if (!u) return ['<span class="text-red-400">wget: missing URL</span>'];
            const fname = u.split('/').pop() || 'index.html';
            return [
              `--2026-08-06 09:00:00--  ${u}`,
              `Resolving ${u.replace('https://', '').split('/')[0]}... 93.184.216.34`,
              `Connecting to ${u.replace('https://', '').split('/')[0]}|93.184.216.34|:443... connected.`,
              `HTTP request sent, awaiting response... 200 OK`,
              `Length: 15233 (15K) [text/html]`,
              `Saving to: '${fname}'`,
              `100%[==================================>] 15,233  --.-K/s   in 0.03s`,
              `<span class="text-green-400">✓ ${fname} 下载完成</span>`
            ];
          }
        },
        ifconfig: {
          usage: 'ifconfig', desc: '查看网卡配置（传统）',
          run: (s) => [
            `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500`,
            `        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255`,
            `        inet6 fe80::20c:29ff:fe3b:2ec8  prefixlen 64  scopeid 0x20<link>`,
            `        ether 00:0c:29:3b:2e:c8  txqueuelen 1000  (Ethernet)`,
            `        RX packets 12345  bytes 2345678 (2.2 MiB)`,
            `        TX packets 6789  bytes 1234567 (1.1 MiB)`,
            ``,
            `lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536`,
            `        inet 127.0.0.1  netmask 255.0.0.0`
          ]
        }
      }
    },
    cmds: [
      { cmd: 'ping', zh: '连通测试', desc: '测试目标是否可达', ex: ['ping baidu.com', 'ping -c 4 1.1.1.1'] },
      { cmd: 'ip a', zh: '查看 IP', desc: '显示网卡地址', ex: ['ip a', 'ip addr show'] },
      { cmd: 'ipconfig', zh: 'Windows IP', desc: 'Windows 下网络配置', ex: ['ipconfig', 'ipconfig /all'] },
      { cmd: 'curl', zh: '请求测试', desc: 'HTTP 请求调试', ex: ['curl https://api.example.com', 'curl -I https://x.com'] },
      { cmd: 'netstat', zh: '端口监听', desc: '查看端口与连接', ex: ['netstat -tlnp', 'netstat -an'] },
      { cmd: 'ssh', zh: '远程登录', desc: 'SSH 连接服务器', ex: ['ssh user@host', 'ssh -p 2222 user@host'] },
      { cmd: 'dig', zh: 'DNS 查询', desc: '查询域名解析', ex: ['dig gitee.com'] },
      { cmd: 'nslookup', zh: 'DNS 查询', desc: '查询域名/IP', ex: ['nslookup baidu.com'] },
      { cmd: 'wget', zh: '下载文件', desc: '从 URL 下载', ex: ['wget https://x.com/a.zip'] },
      { cmd: 'ifconfig', zh: '网卡配置', desc: '查看网卡信息', ex: ['ifconfig', 'ifconfig eth0'] },
      { cmd: 'traceroute', zh: '路由追踪', desc: '追踪数据包路径', ex: ['traceroute baidu.com'] }
    ],
    quiz: [
      { q: '测试网络连通性用？', opts: ['ping', 'netstat', 'curl'], ans: 0 },
      { q: '查看端口监听情况用？', opts: ['ping', 'netstat -tlnp', 'ssh'], ans: 1 },
      { q: '测试 HTTP 接口用？', opts: ['ssh', 'traceroute', 'curl'], ans: 2 }
    ]
  },

  // ============ 窗口4: 文本与搜索 ============
  text: {
    title: '文本与搜索',
    desc: '查看 & 检索文件',
    icon: 'fa-solid fa-magnifying-glass',
    color: '#F59E0B',
    term: {
      title: '文本处理模拟',
      banner: [
        '<span class="text-[var(--t-accent)]">┌─────────────────────────────────────────────┐</span>',
        '<span class="text-[var(--t-accent)]">│  Text Simulator — 文本处理训练场             │</span>',
        '<span class="text-[var(--t-accent)]">└─────────────────────────────────────────────┘</span>'
      ],
      hint: '// 试试: cat docs/readme.md  ·  grep hello projects/website/app.js  ·  head -n 2 docs/todo.txt',
      initialState: () => VFS.makeFS(),
      prompt: (s) => `user@ricking-hq:${s.cwd.replace('/home/user', '~')}$ `,
      commands: {
        cat: {
          usage: 'cat <文件>', desc: '显示文件内容',
          run: (s, a) => {
            if (!a[0]) return ['<span class="text-red-400">cat: missing operand</span>'];
            const node = VFS.get(s, VFS.resolve(s, a[0]));
            if (!node) return [`<span class="text-red-400">cat: ${a[0]}: No such file or directory</span>`];
            if (node.type !== 'file') return [`<span class="text-red-400">cat: ${a[0]}: Is a directory</span>`];
            return [String(node.content || '')];
          }
        },
        head: {
          usage: 'head [-n N] <文件>', desc: '查看文件开头',
          run: (s, a) => {
            const nIdx = a.indexOf('-n');
            const n = nIdx >= 0 ? parseInt(a[nIdx + 1]) || 10 : 10;
            const file = a[a.length - 1];
            const node = VFS.get(s, VFS.resolve(s, file));
            if (!node || node.type !== 'file') return [`<span class="text-red-400">head: ${file}: No such file</span>`];
            return String(node.content || '').split('\n').slice(0, n);
          }
        },
        tail: {
          usage: 'tail [-n N] <文件>', desc: '查看文件末尾',
          run: (s, a) => {
            const nIdx = a.indexOf('-n');
            const n = nIdx >= 0 ? parseInt(a[nIdx + 1]) || 10 : 10;
            const file = a[a.length - 1];
            const node = VFS.get(s, VFS.resolve(s, file));
            if (!node || node.type !== 'file') return [`<span class="text-red-400">tail: ${file}: No such file</span>`];
            return String(node.content || '').split('\n').slice(-n);
          }
        },
        grep: {
          usage: 'grep <关键词> <文件>', desc: '搜索文件内容',
          run: (s, a) => {
            if (a.length < 2) return ['<span class="text-red-400">grep: missing pattern</span>'];
            const node = VFS.get(s, VFS.resolve(s, a[1]));
            if (!node || node.type !== 'file') return [`<span class="text-red-400">grep: ${a[1]}: No such file</span>`];
            const lines = String(node.content || '').split('\n');
            const pat = a[0];
            const esc = pat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const matches = lines.map((l, i) => ({ l, i })).filter(x => x.l.includes(pat));
            if (!matches.length) return [`<span class="text-gray-500">// 未找到 "${pat}"</span>`];
            return matches.map(m => `<span class="text-gray-500">${m.i + 1}:</span> ${m.l.replace(new RegExp(esc, 'g'), '<span class="text-yellow-400">' + pat + '</span>')}`);
          }
        },
        find: {
          usage: 'find <路径> -name <模式>', desc: '查找文件',
          run: (s, a) => {
            const start = a[0] || '.';
            const nameIdx = a.indexOf('-name');
            const pattern = nameIdx >= 0 ? a[nameIdx + 1] : '*';
            const base = VFS.resolve(s, start);
            const results = [];
            const walk = (path, node) => {
              if (node.type !== 'dir' || !node.children) return;
              Object.keys(node.children).forEach(n => {
                const full = path === '/' ? '/' + n : path + '/' + n;
                const child = node.children[n];
                const re = new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
                if (re.test(n)) results.push(full);
                if (child.type === 'dir') walk(full, child);
              });
            };
            const root = VFS.get(s, base);
            if (!root) return [`<span class="text-red-400">find: '${start}': No such file or directory</span>`];
            walk(base, root);
            return results.length ? results : [`<span class="text-gray-500">// 未找到匹配 ${pattern}</span>`];
          }
        },
        wc: {
          usage: 'wc [-l|-w|-c] <文件>', desc: '统计行/词/字符',
          run: (s, a) => {
            const file = a[a.length - 1];
            const node = VFS.get(s, VFS.resolve(s, file));
            if (!node || node.type !== 'file') return [`<span class="text-red-400">wc: ${file}: No such file</span>`];
            const content = String(node.content || '');
            const lines = content ? content.split('\n').length : 0;
            const words = content ? content.split(/\s+/).filter(Boolean).length : 0;
            const chars = content.length;
            if (a.includes('-l')) return [`${lines} ${file}`];
            if (a.includes('-w')) return [`${words} ${file}`];
            if (a.includes('-c')) return [`${chars} ${file}`];
            return [`${lines}  ${words}  ${chars}  ${file}`];
          }
        },
        sort: {
          usage: 'sort <文件>', desc: '按行排序',
          run: (s, a) => {
            const file = a[a.length - 1];
            const node = VFS.get(s, VFS.resolve(s, file));
            if (!node || node.type !== 'file') return [`<span class="text-red-400">sort: ${file}: No such file</span>`];
            return String(node.content || '').split('\n').sort();
          }
        },
        uniq: {
          usage: 'uniq <文件>', desc: '去除连续重复行',
          run: (s, a) => {
            const file = a[a.length - 1];
            const node = VFS.get(s, VFS.resolve(s, file));
            if (!node || node.type !== 'file') return [`<span class="text-red-400">uniq: ${file}: No such file</span>`];
            return String(node.content || '').split('\n').filter((l, i, arr) => i === 0 || l !== arr[i - 1]);
          }
        },
        less: {
          usage: 'less <文件>', desc: '分页查看（模拟）',
          run: (s, a) => {
            const file = a[0];
            const node = VFS.get(s, VFS.resolve(s, file));
            if (!node || node.type !== 'file') return [`<span class="text-red-400">less: ${file}: No such file</span>`];
            return String(node.content || '').split('\n').concat(['<span class="text-gray-500">// (模拟分页，按 q 退出 — 模拟环境直接显示全部)</span>']);
          }
        },
        awk: {
          usage: "awk '{print $N}' <文件>", desc: '按列提取（$1 第一列）',
          run: (s, a) => {
            if (a.length < 2) return ['<span class="text-red-400">awk: missing operand</span>'];
            const prog = a[0];
            const file = a[1];
            const node = VFS.get(s, VFS.resolve(s, file));
            if (!node || node.type !== 'file') return [`<span class="text-red-400">awk: ${file}: No such file</span>`];
            const col = (prog.match(/\$(\d+)/) || [])[1] || '1';
            return String(node.content || '').split('\n').map(l => {
              const parts = l.split(/\s+/);
              return parts[parseInt(col) - 1] || '';
            });
          }
        },
        cut: {
          usage: 'cut -d<分隔符> -f<N> <文件>', desc: '按分隔符切列',
          run: (s, a) => {
            const dIdx = a.indexOf('-d');
            const fIdx = a.indexOf('-f');
            const delim = dIdx >= 0 ? a[dIdx + 1] : ':';
            const field = fIdx >= 0 ? parseInt(a[fIdx + 1]) || 1 : 1;
            const file = a[a.length - 1];
            const node = VFS.get(s, VFS.resolve(s, file));
            if (!node || node.type !== 'file') return [`<span class="text-red-400">cut: ${file}: No such file</span>`];
            return String(node.content || '').split('\n').map(l => {
              const parts = l.split(delim);
              return parts[field - 1] || '';
            });
          }
        }
      }
    },
    cmds: [
      { cmd: 'cat', zh: '显示内容', desc: '输出文件内容', ex: ['cat package.json', 'cat -n app.js'] },
      { cmd: 'head', zh: '头部', desc: '查看前 N 行', ex: ['head -n 20 server.log'] },
      { cmd: 'tail', zh: '尾部', desc: '查看末尾/实时', ex: ['tail -f app.log', 'tail -n 100 log'] },
      { cmd: 'grep', zh: '搜索行', desc: '按关键词过滤', ex: ['grep error server.log', 'grep -rn TODO src/'] },
      { cmd: 'find', zh: '查找文件', desc: '按名/型/大小找', ex: ['find . -name "*.js"', 'find / -size +100M'] },
      { cmd: 'wc', zh: '计数', desc: '行/词/字节数', ex: ['wc -l file.txt', 'wc -c data.bin'] },
      { cmd: 'less', zh: '分页查看', desc: '逐页浏览文件', ex: ['less big.log'] },
      { cmd: 'uniq', zh: '去重', desc: '去除重复行', ex: ['uniq list.txt'] },
      { cmd: 'awk', zh: '文本处理', desc: '按列提取处理', ex: ["awk '{print $1}' f"] },
      { cmd: 'cut', zh: '按列切分', desc: '提取指定列', ex: ['cut -d: -f1 /etc/passwd'] },
      { cmd: 'sort', zh: '排序', desc: '按行排序', ex: ['sort names.txt', 'sort -r scores.txt'] }
    ],
    quiz: [
      { q: '实时跟踪日志文件用？', opts: ['cat', 'tail -f', 'head'], ans: 1 },
      { q: '按关键词搜索文件内容？', opts: ['find', 'grep', 'wc'], ans: 1 },
      { q: '统计文件行数？', opts: ['wc -l', 'cat', 'sort'], ans: 0 }
    ]
  },

  // ============ 窗口5: 权限与压缩 ============
  perm: {
    title: '权限与压缩',
    desc: '权限 & 归档打包',
    icon: 'fa-solid fa-shield-halved',
    color: '#8B5CF6',
    term: {
      title: '权限与压缩模拟',
      banner: [
        '<span class="text-[var(--t-accent)]">┌─────────────────────────────────────────────┐</span>',
        '<span class="text-[var(--t-accent)]">│  Perm & Archive Simulator — 权限/打包训练场   │</span>',
        '<span class="text-[var(--t-accent)]">└─────────────────────────────────────────────┘</span>'
      ],
      hint: '// 试试: ls -la  ·  chmod 755 deploy.sh  ·  tar -czf backup.tar.gz docs/  ·  tar -tzf backup.tar.gz',
      initialState: () => {
        const fs = VFS.makeFS();
        fs.mode['/home/user/deploy.sh'] = '-rwxr-xr-x 755';
        return fs;
      },
      prompt: (s) => `user@ricking-hq:${s.cwd.replace('/home/user', '~')}$ `,
      commands: {
        ls: {
          usage: 'ls [-l] [路径]', desc: '列出目录（含权限）',
          run: (s, a) => {
            const path = a.length && !a[0].startsWith('-') ? VFS.resolve(s, a[0]) : s.cwd;
            const node = VFS.get(s, path);
            if (!node) return ['<span class="text-red-400">ls: no such directory</span>'];
            if (node.type !== 'dir') return [path];
            const long = a.includes('-l') || a.includes('-la');
            const names = Object.keys(node.children).sort();
            if (!long) return [names.join('  ') || '(empty)'];
            const rows = names.map(n => {
              const c = node.children[n];
              const full = VFS.resolve(s, path + '/' + n);
              const mode = VFS.modeStr(s, c, full);
              const size = c.type === 'dir' ? '4096' : String(c.size || 0);
              const mark = c.type === 'dir' ? '<span class="text-blue-400">' + n + '/</span>' : n;
              return `  <span class="text-gray-500">${mode}  1  user  group  ${size}</span>  ${mark}`;
            });
            return ['total ' + names.length, ...rows];
          }
        },
        chmod: {
          usage: 'chmod <模式> <文件>', desc: '修改权限 (755 / +x / 600)',
          run: (s, a) => {
            if (a.length < 2) return ['<span class="text-red-400">chmod: missing operand</span>'];
            const path = VFS.resolve(s, a[1]);
            const node = VFS.get(s, path);
            if (!node) return [`<span class="text-red-400">chmod: cannot access '${a[1]}': No such file</span>`];
            const map = { '7': 'rwx', '6': 'rw-', '5': 'r-x', '4': 'r--', '0': '---' };
            const m = a[0];
            if (/^[0-7]{3}$/.test(m)) {
              s.mode[path] = '-' + m.split('').map(d => map[d]).join('') + ' ' + m;
            } else if (m === '+x') {
              s.mode[path] = '-rwxr-xr-x 755';
            } else if (m === '600') {
              s.mode[path] = '-rw------- 600';
            } else if (m === '644') {
              s.mode[path] = '-rw-r--r-- 644';
            } else {
              return [`<span class="text-red-400">chmod: invalid mode: '${m}'</span>`];
            }
            return [`<span class="text-green-400">mode of '${a[1]}' changed to ${s.mode[path]}</span>`, '<span class="text-gray-500">// 用 ls -l 查看权限变化</span>'];
          }
        },
        chown: {
          usage: 'chown <用户> <文件>', desc: '修改文件属主',
          run: (s, a) => {
            if (a.length < 2) return ['<span class="text-red-400">chown: missing operand</span>'];
            const path = VFS.resolve(s, a[1]);
            if (!VFS.get(s, path)) return [`<span class="text-red-400">chown: cannot access '${a[1]}': No such file</span>`];
            s.mode[path] = s.mode[path] || '-rw-r--r-- 644';
            return [`<span class="text-green-400">changed ownership of '${a[1]}' to ${a[0]}</span>`];
          }
        },
        tar: {
          usage: 'tar [-czf|-xzf|-tzf] <归档> [目录]', desc: '打包/解压/查看归档',
          run: (s, a) => {
            const flag = a[0] || '';
            const archive = a[1];
            const src = a[2];
            if (!archive) return ['<span class="text-red-400">tar: you must specify one of -Acdtrux</span>'];
            s.archives = s.archives || {};
            if (flag.includes('c')) {
              if (!src) return ['<span class="text-red-400">tar: Refusing to remove current directory</span>'];
              const node = VFS.get(s, VFS.resolve(s, src));
              if (!node) return [`<span class="text-red-400">tar: ${src}: Cannot stat: No such file</span>`];
              s.archives[archive] = { src, count: node.children ? Object.keys(node.children).length : 1, created: true };
              return [`<span class="text-green-400">${archive}</span>`, `<span class="text-gray-500">// 归档创建成功，试试 tar -tzf ${archive} 查看内容</span>`];
            }
            if (flag.includes('t')) {
              const aData = s.archives[archive];
              if (!aData) return [`<span class="text-red-400">tar: ${archive}: Cannot open: No such file</span>`];
              return [`${archive}`, `${aData.src}/`, `<span class="text-gray-500">  ${aData.count} 个文件（模拟）</span>`];
            }
            if (flag.includes('x')) {
              const aData = s.archives[archive];
              if (!aData) return [`<span class="text-red-400">tar: ${archive}: Cannot open: No such file</span>`];
              return [`<span class="text-green-400">✓ 已解压 ${archive} → ${aData.src}/</span>`];
            }
            return ['<span class="text-red-400">tar: unknown option</span>'];
          }
        },
        zip: {
          usage: 'zip [-r] <归档.zip> <文件>', desc: 'ZIP 压缩',
          run: (s, a) => {
            const out = a.find(x => x.endsWith('.zip'));
            const src = a.filter(x => !x.endsWith('.zip') && !x.startsWith('-')).pop();
            if (!out) return ['<span class="text-red-400">zip: missing archive name</span>'];
            const node = VFS.get(s, VFS.resolve(s, src || '.'));
            if (!node) return [`<span class="text-red-400">zip: ${src}: No such file</span>`];
            s.archives = s.archives || {};
            s.archives[out] = { src: src || '.', zip: true };
            return [`  adding: ${src || '.'} (stored 0%)`, `<span class="text-green-400">✓ ${out} 创建成功</span>`];
          }
        },
        unzip: {
          usage: 'unzip <归档.zip>', desc: 'ZIP 解压',
          run: (s, a) => {
            const z = a[0];
            if (!z) return ['<span class="text-red-400">unzip: missing archive</span>'];
            const aData = (s.archives || {})[z];
            if (!aData) return [`<span class="text-red-400">unzip: ${z}: No such file</span>`];
            return [`Archive:  ${z}`, `  inflating: ${aData.src}/`, `<span class="text-green-400">✓ 解压完成</span>`];
          }
        },
        sudo: {
          usage: 'sudo <命令>', desc: '以管理员权限执行',
          run: (s, a) => {
            if (!a.length) return ['<span class="text-red-400">sudo: no command specified</span>'];
            return [`<span class="text-gray-500">[sudo] password for user: </span>`, `<span class="text-green-400">✓ 已授权执行: ${a.join(' ')}</span>`];
          }
        },
        ps: {
          usage: 'ps [aux]', desc: '查看进程',
          run: (s, a) => {
            if (a.includes('aux')) {
              return [
                'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND',
                'user         1  0.0  0.1 123456  7890 ?        S   09:00   0:01 node server.js',
                'user         2  0.0  0.2 234567 12345 ?        S   09:01   0:02 nginx: worker',
                'user       123  0.1  0.3 345678 15678 ?        R   10:15   0:05 python app.py',
                'root       456  0.0  0.0  12345  2345 ?        S   09:00   0:00 sshd'
              ];
            }
            return ['  PID TTY          TIME CMD', '    1 ?        00:00:01 node', '    2 ?        00:00:02 nginx', '  123 ?        00:00:05 python'];
          }
        },
        kill: {
          usage: 'kill <PID>', desc: '结束进程',
          run: (s, a) => {
            const pid = a[0];
            if (!pid) return ['<span class="text-red-400">kill: usage: kill [-s sigspec] pid</span>'];
            return [`<span class="text-gray-500">[1]  Terminated  ${pid}</span>`, '<span class="text-gray-500">// 用 ps aux 重新查看</span>'];
          }
        },
        chgrp: {
          usage: 'chgrp <组> <文件>', desc: '修改文件属组',
          run: (s, a) => {
            if (a.length < 2) return ['<span class="text-red-400">chgrp: missing operand</span>'];
            const path = VFS.resolve(s, a[1]);
            if (!VFS.get(s, path)) return [`<span class="text-red-400">chgrp: cannot access '${a[1]}': No such file</span>`];
            s.mode[path] = s.mode[path] || '-rw-r--r-- 644';
            return [`<span class="text-green-400">changed group of '${a[1]}' to ${a[0]}</span>`];
          }
        },
        gzip: {
          usage: 'gzip <文件>', desc: '压缩为 .gz（模拟）',
          run: (s, a) => {
            const f = a[0];
            if (!f) return ['<span class="text-red-400">gzip: missing operand</span>'];
            const node = VFS.get(s, VFS.resolve(s, f));
            if (!node || node.type !== 'file') return [`<span class="text-red-400">gzip: ${f}: No such file</span>`];
            s.archives = s.archives || {};
            s.archives[f + '.gz'] = { src: f, gz: true };
            return [`<span class="text-gray-500">${f}:  ${Math.round((node.size || 100) * 0.6)}% -- replaced with ${f}.gz</span>`];
          }
        },
        gunzip: {
          usage: 'gunzip <文件.gz>', desc: '解压 .gz（模拟）',
          run: (s, a) => {
            const f = a[0];
            if (!f) return ['<span class="text-red-400">gunzip: missing operand</span>'];
            const gz = (s.archives || {})[f];
            if (!gz) return [`<span class="text-red-400">gunzip: ${f}: No such file</span>`];
            return [`<span class="text-green-400">✓ ${f} 解压完成 → ${gz.src}</span>`];
          }
        }
      }
    },
    cmds: [
      { cmd: 'chmod', zh: '修改权限', desc: '数字/符号改权限', ex: ['chmod +x run.sh', 'chmod 755 file', 'chmod 600 key'] },
      { cmd: 'chown', zh: '修改属主', desc: '改变文件所有者', ex: ['chown user file', 'chown -R user:group dir/'] },
      { cmd: 'tar', zh: '归档打包', desc: '创建/解压归档', ex: ['tar -czf a.tar.gz dir/', 'tar -xzf a.tar.gz'] },
      { cmd: 'zip', zh: 'ZIP 压缩', desc: '压缩为 zip', ex: ['zip -r a.zip dir/', 'zip a.zip f1 f2'] },
      { cmd: 'unzip', zh: 'ZIP 解压', desc: '解压 zip 文件', ex: ['unzip a.zip', 'unzip a.zip -d out/'] },
      { cmd: 'sudo', zh: '提权执行', desc: '以管理员运行', ex: ['sudo apt install vim', 'sudo systemctl restart nginx'], danger: true },
      { cmd: 'chgrp', zh: '改属组', desc: '修改文件组', ex: ['chgrp dev file'] },
      { cmd: 'gzip', zh: 'gzip 压缩', desc: '压缩为 .gz', ex: ['gzip app.log'] },
      { cmd: 'gunzip', zh: 'gzip 解压', desc: '解压 .gz 文件', ex: ['gunzip app.log.gz'] },
      { cmd: 'ps', zh: '查看进程', desc: '列出运行进程', ex: ['ps aux', 'ps -ef | grep node'] }
    ],
    quiz: [
      { q: '给脚本加执行权限？', opts: ['chmod 644', 'chmod +x', 'chown'], ans: 1 },
      { q: '压缩目录为 tar.gz？', opts: ['tar -czf', 'tar -xzf', 'unzip'], ans: 0 },
      { q: '查看所有进程？', opts: ['ps aux', 'sudo', 'chmod'], ans: 0 }
    ]
  },

  // ============ 窗口6: Windows 命令 ============
  windows: {
    title: 'Windows 命令',
    desc: 'CMD / PowerShell 基础',
    icon: 'fa-brands fa-windows',
    color: '#4D88FE',
    term: {
      title: 'CMD 模拟器',
      banner: [
        '<span class="text-[var(--t-accent)]">┌─────────────────────────────────────────────┐</span>',
        '<span class="text-[var(--t-accent)]">│  Windows CMD Simulator — CMD 训练场          │</span>',
        '<span class="text-[var(--t-accent)]">└─────────────────────────────────────────────┘</span>'
      ],
      hint: '// 试试: dir  ·  cd /d D:\\  ·  type C:\\readme.txt  ·  findstr error C:\\logs\\app.log  ·  ipconfig',
      initialState: {
        cwd: 'C:\\Users\\RickinG',
        files: {
          'C:\\Users\\RickinG': [
            { name: 'Desktop', dir: true }, { name: 'Documents', dir: true },
            { name: 'Downloads', dir: true }, { name: 'readme.txt', dir: false, content: 'Welcome to CMD simulator!\nTry: type readme.txt' },
            { name: 'config.json', dir: false, content: '{\n  "name": "ricking",\n  "version": "1.0.0"\n}' }
          ],
          'C:\\Users\\RickinG\\Desktop': [
            { name: 'project', dir: true }, { name: 'notes.txt', dir: false, content: 'Meeting notes:\n- fix bug #42\n- deploy v2' }
          ],
          'C:\\Users\\RickinG\\Documents': [
            { name: 'report.docx', dir: false }, { name: 'todo.txt', dir: false, content: 'TODO:\n- learn windows cmd\n- practice findstr' }
          ],
          'C:\\Users\\RickinG\\Downloads': [
            { name: 'installer.exe', dir: false }, { name: 'photo.jpg', dir: false }
          ]
        },
        drives: ['C:', 'D:']
      },
      prompt: (s) => `C:\\Users\\RickinG> `,
      complete: (s, cmd, partial) => {
        if (cmd === 'cd' || cmd === 'type' || cmd === 'dir') {
          const cwd = s.cwd;
          const list = s.files[cwd] || [];
          return list.map(f => f.name);
        }
        return [];
      },
      commands: {
        dir: {
          usage: 'dir', desc: '列出目录内容',
          run: (s) => {
            const list = s.files[s.cwd] || [];
            const dirs = list.filter(f => f.dir);
            const files = list.filter(f => !f.dir);
            return [
              ` Volume in drive C has no label.`,
              ` Volume Serial Number is 1234-ABCD`,
              ``,
              ` Directory of ${s.cwd}`,
              ``,
              ...dirs.map(d => `<span class="text-blue-400">${new Date().toLocaleDateString().padEnd(12)}  12:00    &lt;DIR&gt;          ${d.name}</span>`),
              ...files.map(f => `${new Date().toLocaleDateString().padEnd(12)}  12:00          ${String(f.content ? f.content.length * 2 : 1024).padEnd(12)} ${f.name}`),
              ``,
              `               ${dirs.length} Dir(s)   ${files.length} File(s)`
            ];
          }
        },
        cd: {
          usage: 'cd [目录]  (跨盘: cd /d D:\\)', desc: '切换目录',
          run: (s, a) => {
            if (!a.length) return [s.cwd];
            const target = a[0];
            if (target.startsWith('/d')) { s.cwd = a[1] || 'C:\\'; return []; }
            if (target === '..') {
              const parts = s.cwd.split('\\');
              parts.pop();
              s.cwd = parts.join('\\') || 'C:\\';
              return [];
            }
            const full = s.cwd.endsWith('\\') ? s.cwd + target : s.cwd + '\\' + target;
            // 目录存在判断：files 表里该路径存在（含空目录）
            if (s.files[full] !== undefined) { s.cwd = full; return []; }
            return [`The system cannot find the path specified.`];
          }
        },
        type: {
          usage: 'type <文件>', desc: '显示文件内容',
          run: (s, a) => {
            if (!a[0]) return ['The syntax of the command is incorrect.'];
            const target = a[0].startsWith('C:') ? a[0] : (s.cwd + '\\' + a[0]);
            // 查找文件
            const cwdList = s.files[s.cwd] || [];
            const found = cwdList.find(f => f.name === a[0] && !f.dir);
            if (found && found.content !== undefined) return [found.content];
            if (s.files[target] !== undefined) return [s.files[target].content || ''];
            return ['The system cannot find the file specified.'];
          }
        },
        copy: {
          usage: 'copy <源> <目标>', desc: '复制文件',
          run: (s, a) => {
            if (a.length < 2) return ['The syntax of the command is incorrect.'];
            const src = a[0];
            const dst = a[1];
            const list = s.files[s.cwd] || [];
            const found = list.find(f => f.name === src);
            if (!found) return [`The system cannot find the file specified.`];
            list.push({ ...found, name: dst });
            return [`        1 file(s) copied.`];
          }
        },
        del: {
          usage: 'del <文件>', desc: '删除文件',
          run: (s, a) => {
            if (!a[0]) return ['The syntax of the command is incorrect.'];
            const list = s.files[s.cwd] || [];
            const idx = list.findIndex(f => f.name === a[0] && !f.dir);
            if (idx < 0) return [`Could Not Find ${a[0]}`];
            list.splice(idx, 1);
            return [`        1 file(s) deleted.`];
          }
        },
        mkdir: {
          usage: 'mkdir <目录>', desc: '创建目录',
          run: (s, a) => {
            if (!a[0]) return ['The syntax of the command is incorrect.'];
            const list = s.files[s.cwd] = s.files[s.cwd] || [];
            if (list.some(f => f.name === a[0])) return [`A subdirectory or file ${a[0]} already exists.`];
            list.push({ name: a[0], dir: true });
            return [];
          }
        },
        findstr: {
          usage: 'findstr <关键词> <文件>', desc: '搜索文件文本',
          run: (s, a) => {
            if (a.length < 2) return ['FINDSTR: Bad command line'];
            const target = a[a.length - 1];
            const pat = a[0];
            const list = s.files[s.cwd] || [];
            const found = list.find(f => f.name === target && !f.dir);
            if (!found || found.content === undefined) return ['FINDSTR: Cannot open ' + target];
            const lines = String(found.content).split('\n');
            const matches = lines.filter(l => l.includes(pat));
            return matches.length ? matches : ['FINDSTR: No search matches'];
          }
        },
        ipconfig: {
          usage: 'ipconfig', desc: '网络配置',
          run: () => [
            '',
            'Windows IP Configuration',
            '',
            'Ethernet adapter Ethernet0:',
            '',
            '   Connection-specific DNS Suffix  . : local',
            '   IPv4 Address. . . . . . . . . . . : 192.168.1.100',
            '   Subnet Mask . . . . . . . . . . . : 255.255.255.0',
            '   Default Gateway . . . . . . . . . : 192.168.1.1'
          ]
        },
        cls: {
          usage: 'cls', desc: '清空屏幕',
          run: (s, a, t, card) => { card.querySelector('[data-term-out]').innerHTML = ''; return []; }
        },
        tasklist: {
          usage: 'tasklist', desc: '查看进程',
          run: () => [
            '',
            'Image Name                     PID Session Name        Session#    Mem Usage',
            '========================= ======== ================ =========== ============',
            'System Idle Process              0 Services                   0          8 K',
            'explorer.exe                  1234 Console                   1     45,000 K',
            'node.exe                      5678 Console                   1     89,200 K',
            'chrome.exe                    9012 Console                   1    320,000 K'
          ]
        },
        ver: {
          usage: 'ver', desc: '版本信息',
          run: () => ['', 'Microsoft Windows [Version 10.0.22631.3447]']
        },
        move: {
          usage: 'move <源> <目标>', desc: '移动/重命名文件',
          run: (s, a) => {
            if (a.length < 2) return ['The syntax of the command is incorrect.'];
            const list = s.files[s.cwd] || [];
            const idx = list.findIndex(f => f.name === a[0]);
            if (idx < 0) return [`The system cannot find the file specified.`];
            const item = list.splice(idx, 1)[0];
            list.push({ ...item, name: a[1] });
            return [`        1 file(s) moved.`];
          }
        }
      }
    },
    cmds: [
      { cmd: 'cd', zh: '切换目录', desc: '跨盘符需 /d', ex: ['cd C:\\Users', 'cd /d D:\\proj'] },
      { cmd: 'dir', zh: '列出文件', desc: '等价 Linux ls', ex: ['dir', 'dir /s /b *.js'] },
      { cmd: 'mkdir', zh: '创建目录', desc: '新建目录', ex: ['mkdir assets', 'mkdir a\\b\\c'] },
      { cmd: 'copy', zh: '复制文件', desc: '复制文件', ex: ['copy a.txt b.txt', 'copy *.js dist\\'] },
      { cmd: 'del', zh: '删除文件', desc: '⚠️ 删除不可恢复', ex: ['del old.log', 'del /q *.tmp'], danger: true },
      { cmd: 'type', zh: '显示内容', desc: '等价 Linux cat', ex: ['type package.json'] },
      { cmd: 'findstr', zh: '文本搜索', desc: '等价 Linux grep', ex: ['findstr error app.log', 'findstr /i "GET /api" log'] },
      { cmd: 'cls', zh: '清空屏幕', desc: '等价 Linux clear', ex: ['cls'] },
      { cmd: 'ver', zh: '系统版本', desc: '显示 Windows 版本', ex: ['ver'] },
      { cmd: 'move', zh: '移动文件', desc: '等价 Linux mv', ex: ['move a.txt dir'] },
      { cmd: 'tasklist', zh: '查看进程', desc: '等价 Linux ps', ex: ['tasklist', 'tasklist | findstr node'] }
    ],
    quiz: [
      { q: 'Windows 列出文件用？', opts: ['ls', 'dir', 'cat'], ans: 1 },
      { q: 'Windows 搜索文本用？', opts: ['grep', 'findstr', 'type'], ans: 1 },
      { q: '跨盘符切换目录？', opts: ['cd /d D:\\', 'cd ..', 'cd -'], ans: 0 }
    ]
  }
};
