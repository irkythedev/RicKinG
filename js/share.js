/**
 * ShareManager for RicKinG Tactical Theme
 * Handles QR code generation and link copying across pages
 */
const ShareManager = {
    modalId: 'r-share-modal',
    qrContainerId: 'r-share-qr',
    qrInstance: null,
    
    i18n: {
        zh: {
            title: '战术情报分享',
            desc: '扫描二维码，或复制加密链接转发',
            copyBtn: '$ ./copy'
        },
        en: {
            title: 'Tactical Intel Share',
            desc: 'Scan QR or copy encrypted link',
            copyBtn: '$ ./copy'
        }
    },

    init: function() {
        this.injectModal();
        this.bindEvents();
        this.updateLanguage(); // init language
    },

    updateLanguage: function() {
        const lang = (typeof window.getComputedLang === 'function') ? window.getComputedLang() : 'zh';
        const t = this.i18n[lang] || this.i18n['zh'];
        
        const titleEl = document.getElementById('r-share-title');
        const descEl = document.getElementById('r-share-desc');
        const copyBtn = document.getElementById('r-share-copy');
        
        if(titleEl) titleEl.textContent = t.title;
        if(descEl) descEl.textContent = t.desc;
        if(copyBtn && copyBtn.innerHTML.trim() === '$ ./copy') {
            copyBtn.innerHTML = t.copyBtn;
        }
    },

    injectModal: function() {
        if (document.getElementById(this.modalId)) return;

        const modalHTML = `
        <div id="${this.modalId}" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 hidden opacity-0 transition-opacity duration-300" role="dialog" aria-modal="true">
            <div class="relative w-11/12 max-w-sm glass-panel border border-[rgba(var(--t-accent-rgb),0.3)] rounded-lg p-6 shadow-2xl flex flex-col items-center transform scale-95 transition-transform duration-300">
                <!-- Close btn -->
                <button id="r-share-close" class="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 focus:outline-none">
                    <i class="fas fa-times"></i>
                </button>
                
                <!-- Title -->
                <div class="flex items-center gap-2 mb-2 w-full justify-center">
                    <i class="fab fa-weixin text-green-500 text-xl"></i>
                    <h3 id="r-share-title" class="text-white font-bold tracking-wider">战术情报分享</h3>
                </div>
                
                <p id="r-share-desc" class="text-xs text-gray-400 mb-6 text-center">扫描二维码，或复制加密链接转发</p>

                <!-- QR Container -->
                <div class="bg-white p-2 rounded mb-6">
                    <div id="${this.qrContainerId}"></div>
                </div>

                <!-- Copy Link row -->
                <div class="w-full flex items-center gap-2 bg-black/50 border border-gray-700 rounded p-1">
                    <input type="text" id="r-share-input" readonly class="bg-transparent text-xs text-gray-300 flex-grow px-2 outline-none font-mono" value="">
                    <button id="r-share-copy" class="text-xs font-mono bg-[rgba(var(--t-accent-rgb),0.1)] text-[var(--t-accent)] hover:bg-[rgba(var(--t-accent-rgb),0.2)] px-3 py-1.5 rounded transition-colors whitespace-nowrap">
                        $ ./copy
                    </button>
                </div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    bindEvents: function() {
        const modal = document.getElementById(this.modalId);
        const closeBtn = document.getElementById('r-share-close');
        const copyBtn = document.getElementById('r-share-copy');
        
        closeBtn.addEventListener('click', () => this.close());
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.close();
        });

        // Close on Esc
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                this.close();
            }
        });

        copyBtn.addEventListener('click', () => this.copyLink());

        // Listen for language changes globally
        window.addEventListener('languageChanged', () => {
            this.updateLanguage();
        });
    },

    open: function() {
        const modal = document.getElementById(this.modalId);
        const input = document.getElementById('r-share-input');
        const currentUrl = window.location.href;
        
        // Set link
        input.value = currentUrl;

        // Generate QR
        const qrContainer = document.getElementById(this.qrContainerId);
        if (!this.qrInstance) {
            qrContainer.innerHTML = '';
            // Make sure QRCode library is loaded
            if (typeof QRCode !== 'undefined') {
                this.qrInstance = new QRCode(qrContainer, {
                    text: currentUrl,
                    width: 180,
                    height: 180,
                    colorDark : "#000000",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.M
                });
            } else {
                qrContainer.innerHTML = '<span class="text-red-500 text-xs">ERR: QRCode lib not loaded</span>';
            }
        } else {
            this.qrInstance.makeCode(currentUrl);
        }

        // Show modal
        modal.classList.remove('hidden');
        // Trigger reflow
        void modal.offsetWidth;
        modal.classList.remove('opacity-0');
        modal.querySelector('.glass-panel').classList.remove('scale-95');
        modal.querySelector('.glass-panel').classList.add('scale-100');
    },

    close: function() {
        const modal = document.getElementById(this.modalId);
        modal.classList.add('opacity-0');
        modal.querySelector('.glass-panel').classList.remove('scale-100');
        modal.querySelector('.glass-panel').classList.add('scale-95');
        
        setTimeout(() => {
            modal.classList.add('hidden');
            // reset copy button text if needed
            const copyBtn = document.getElementById('r-share-copy');
            if (copyBtn) {
                copyBtn.innerHTML = '$ ./copy';
                copyBtn.classList.remove('text-green-400', 'border-green-500');
            }
        }, 300);
    },

    copyLink: function() {
        const input = document.getElementById('r-share-input');
        const copyBtn = document.getElementById('r-share-copy');
        
        navigator.clipboard.writeText(input.value).then(() => {
            copyBtn.innerHTML = 'COPIED!';
            copyBtn.classList.add('text-green-400', 'border-green-500');
            setTimeout(() => {
                copyBtn.innerHTML = '$ ./copy';
                copyBtn.classList.remove('text-green-400', 'border-green-500');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy', err);
            copyBtn.innerHTML = 'ERR';
        });
    }
};

window.addEventListener('DOMContentLoaded', () => {
    ShareManager.init();
});
