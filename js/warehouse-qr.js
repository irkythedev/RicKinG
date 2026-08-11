/**
 * Warehouse QR - 项目卡片二维码弹窗
 * 点击 demo 按钮旁的 QR 图标 → 弹出居中 modal，编码 Demo URL，移动端扫码直达
 * 依赖: js/qrcode.min.js (本地)
 */
(function () {
  'use strict';

  // 项目 demo URL 映射（与卡片按钮一致）
  const DEMO_URLS = {
    tactical: 'https://irky.dev',
    aqua: 'https://wsa.irky.dev',
    echo: 'https://100ye.irky.dev',
    stem: 'https://stem.irky.dev'
  };

  // 项目标题映射
  const TITLES = {
    tactical: 'Tactical Terminal',
    aqua: 'AquaInsight',
    echo: 'Century Echo',
    stem: 'STEM Digital Lab'
  };

  let modalEl = null;
  let qrInstance = null;

  // 注入：访问页面按钮 → 弹出操作面板（QR + 访问 + 复制），去掉独立 QR 按钮
  function injectQrButtons() {
    document.querySelectorAll('.flip-card').forEach(card => {
      const demoBtn = card.querySelector('a[aria-label="View Live Demo"]');
      if (!demoBtn) return;
      // 已绑定过则跳过
      if (demoBtn.dataset.qrBound) return;

      // 根据 demo href 识别项目 key
      const href = demoBtn.getAttribute('href') || '';
      let key = null;
      Object.keys(DEMO_URLS).forEach(k => {
        if (href.includes(DEMO_URLS[k].replace('https://', ''))) key = k;
      });
      if (!key) return;

      // 移除旧的独立 QR 按钮（如果存在）
      const oldTrigger = demoBtn.parentElement.querySelector('.qr-trigger');
      if (oldTrigger) oldTrigger.remove();

      // 访问页面按钮点击 → 打开操作面板（不直接跳转）
      demoBtn.dataset.qrBound = '1';
      demoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openQrModal(key);
      });
    });
  }

  // 打开 QR modal
  function openQrModal(key) {
    const url = DEMO_URLS[key];
    const title = TITLES[key] || key;
    if (!url) return;

    if (!modalEl) buildModal();
    modalEl.classList.remove('hidden');

    // 标题（PUBG 战术准星图标 + 项目名）
    const titleEl = modalEl.querySelector('[data-qr-title]');
    titleEl.innerHTML = '<i class="fas fa-crosshairs text-[var(--t-accent)] mr-2"></i>' + title;

    // URL 文本
    const urlEl = modalEl.querySelector('[data-qr-url]');
    urlEl.textContent = url.replace('https://', '');
    urlEl.href = url;

    // 访问页面按钮（面板内直接跳转）
    const visitBtn = modalEl.querySelector('[data-qr-visit]');
    visitBtn.href = url;

    // 生成二维码（清空重建，避免重复）
    const qrBox = modalEl.querySelector('[data-qr-box]');
    qrBox.innerHTML = '';
    try {
      qrInstance = new QRCode(qrBox, {
        text: url,
        width: 180,
        height: 180,
        colorDark: '#ffffff',
        colorLight: '#0a0e14',
        correctLevel: QRCode.CorrectLevel.M
      });
    } catch (err) {
      qrBox.innerHTML = '<span class="text-red-400 text-xs">QR 生成失败 / QR failed</span>';
    }

    // 复制按钮
    const copyBtn = modalEl.querySelector('[data-qr-copy]');
    copyBtn.onclick = () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
          copyBtn.textContent = '✓ 已复制 / Copied';
          setTimeout(() => { copyBtn.textContent = '复制链接 / Copy'; }, 1500);
        });
      } else {
        const ta = document.createElement('textarea');
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); copyBtn.textContent = '✓ 已复制'; } catch (e) {}
        document.body.removeChild(ta);
        setTimeout(() => { copyBtn.textContent = '复制链接 / Copy'; }, 1500);
      }
    };

    // 显示时聚焦关闭按钮
    modalEl.querySelector('[data-qr-close]').focus();
  }

  // 构建 modal DOM
  function buildModal() {
    modalEl = document.createElement('div');
    modalEl.id = 'warehouse-qr-modal';
    modalEl.className = 'fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-sm hidden p-4';
    modalEl.innerHTML = `
      <div class="glass-panel rounded-xl p-6 max-w-xs w-full relative" onclick="event.stopPropagation()">
        <h3 class="text-base font-bold text-white mb-3 text-center" data-qr-title></h3>
        <div class="flex justify-center mb-4">
          <div data-qr-box class="bg-[#0a0e14] rounded-lg p-3 border border-gray-700"></div>
        </div>
        <div class="text-center mb-4">
          <div class="text-xs text-gray-500 mb-1">扫码访问 / Scan to visit</div>
          <a data-qr-url class="text-sm font-mono text-[var(--t-accent)] hover:underline break-all" target="_blank"></a>
        </div>
        <div class="flex flex-col gap-2">
          <a data-qr-visit class="w-full bg-yellow-600 hover:bg-yellow-500 text-black text-xs font-bold py-2.5 rounded-lg border border-yellow-500 flex items-center justify-center gap-2 transition" target="_blank">
            <i class="fas fa-external-link-alt"></i> 访问页面 / Visit
          </a>
          <div class="flex gap-2 justify-center">
            <button data-qr-copy class="flex-1 text-xs font-mono text-gray-300 hover:text-[var(--t-accent)] border border-gray-700 hover:border-[var(--t-accent)] rounded px-3 py-2 transition-colors">复制链接 / Copy</button>
            <button data-qr-close class="flex-1 text-xs font-mono text-white bg-[var(--t-accent)] hover:opacity-90 rounded px-4 py-2 transition-opacity">关闭 / Close</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modalEl);

    // 关闭交互
    modalEl.addEventListener('click', (e) => { if (e.target === modalEl) modalEl.classList.add('hidden'); });
    modalEl.querySelector('[data-qr-close]').addEventListener('click', () => modalEl.classList.add('hidden'));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalEl && !modalEl.classList.contains('hidden')) {
        modalEl.classList.add('hidden');
      }
    });
  }

  // 初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectQrButtons);
  } else {
    injectQrButtons();
  }
})();
