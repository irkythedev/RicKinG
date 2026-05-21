/**
 * RicKinG Theme Manager
 * 
 * Handles theme configuration, switching, and persistence.
 */

const ThemeManager = {
    // Current active theme key
    currentTheme: 'pubg',
    
    // Available themes configuration
    themes: {
        'pubg': {
            name: { zh: '战术猎手', en: 'PUBG Tactical' },
            colors: {
                // Same as defaults in theme-vars.css
                '--t-accent': '#EAB308',
                '--t-accent-rgb': '234, 179, 8',
                '--t-accent-light': '#FDE047',
                '--t-accent-light-rgb': '253, 224, 71',
                '--t-accent-dark': '#CA8A04',
                '--t-accent-dark-rgb': '202, 138, 4',
                '--t-accent-warm': '#fbbf24',
                '--t-accent-warm-rgb': '251, 191, 36',
                
                '--t-danger': '#EF4444',
                '--t-danger-rgb': '239, 68, 68',
                
                '--t-bg-body': '#111827',
                '--t-bg-surface': '#1F2937',
                '--t-bg-surface-rgb': '31, 41, 55',
                '--t-bg-elevated': '#374151',
                '--t-bg-elevated-rgb': '55, 65, 81',
                '--t-bg-deep': '#0F172A',
                '--t-bg-deep-rgb': '15, 23, 42',
                '--t-bg-input': '#111827',
                '--t-bg-input-rgb': '17, 24, 39',
                
                '--t-smoke-rgb': '100, 116, 139',
                '--t-cursor-dot': '#ef4444',
                
                // Keep chart default
                '--t-chart-target-bg': 'rgba(99, 179, 237, 0.06)',
                '--t-chart-target-border': 'rgba(99, 179, 237, 0.6)',
                '--t-chart-target-point': 'rgba(99, 179, 237, 0.7)'
            }
        },
        'cyberpunk': {
            name: { zh: '赛博霓虹', en: 'Cyber Neon' },
            colors: {
                '--t-accent': '#06b6d4', // Cyan
                '--t-accent-rgb': '6, 182, 212',
                '--t-accent-light': '#22d3ee',
                '--t-accent-light-rgb': '34, 211, 238',
                '--t-accent-dark': '#0891b2',
                '--t-accent-dark-rgb': '8, 145, 178',
                '--t-accent-warm': '#e879f9', // Pinkish substitution for warm
                '--t-accent-warm-rgb': '232, 121, 249',
                
                '--t-danger': '#f43f5e', // Rose
                '--t-danger-rgb': '244, 63, 94',
                
                '--t-bg-body': '#0f172a', // Slate instead of Gray
                '--t-bg-surface': '#1e293b',
                '--t-bg-surface-rgb': '30, 41, 59',
                '--t-bg-elevated': '#334155',
                '--t-bg-elevated-rgb': '51, 65, 85',
                '--t-bg-deep': '#020617',
                '--t-bg-deep-rgb': '2, 6, 23',
                '--t-bg-input': '#0f172a',
                '--t-bg-input-rgb': '15, 23, 42',
                
                '--t-smoke-rgb': '6, 182, 212', // Cyan smoke
                '--t-cursor-dot': '#06b6d4',
                
                // Chart colors adjust to neon
                '--t-chart-target-bg': 'rgba(232, 121, 249, 0.06)',
                '--t-chart-target-border': 'rgba(232, 121, 249, 0.6)',
                '--t-chart-target-point': 'rgba(232, 121, 249, 0.7)'
            }
        },
        'hacker': {
            name: { zh: '黑客绿洲', en: 'Hacker Matrix' },
            colors: {
                '--t-accent': '#22c55e', // Green
                '--t-accent-rgb': '34, 197, 94',
                '--t-accent-light': '#4ade80',
                '--t-accent-light-rgb': '74, 222, 128',
                '--t-accent-dark': '#16a34a',
                '--t-accent-dark-rgb': '22, 163, 74',
                '--t-accent-warm': '#15803d',
                '--t-accent-warm-rgb': '21, 128, 61',
                
                '--t-danger': '#ef4444', 
                '--t-danger-rgb': '239, 68, 68',
                
                '--t-bg-body': '#000000', // Pure black
                '--t-bg-surface': '#0a0a0a',
                '--t-bg-surface-rgb': '10, 10, 10',
                '--t-bg-elevated': '#171717',
                '--t-bg-elevated-rgb': '23, 23, 23',
                '--t-bg-deep': '#000000',
                '--t-bg-deep-rgb': '0, 0, 0',
                '--t-bg-input': '#000000',
                '--t-bg-input-rgb': '0, 0, 0',
                
                '--t-smoke-rgb': '34, 197, 94', // Green smoke
                '--t-cursor-dot': '#22c55e',
                
                // Chart colors adjust to hacker
                '--t-chart-target-bg': 'rgba(168, 85, 247, 0.06)',
                '--t-chart-target-border': 'rgba(168, 85, 247, 0.6)',
                '--t-chart-target-point': 'rgba(168, 85, 247, 0.7)'
            }
        }
    },

    /**
     * Initialize theme system
     */
    init: function() {
        const savedTheme = localStorage.getItem('r_theme');
        if (savedTheme && this.themes[savedTheme]) {
            this.applyTheme(savedTheme);
        } else {
            // Default theme requires initialization of variables via JS to ensure TW bridge works correctly
            this.applyTheme('pubg');
        }
    },

    /**
     * Apply a specific theme
     * @param {string} themeKey 
     */
    applyTheme: function(themeKey) {
        if (!this.themes[themeKey]) return;
        
        const themeToApply = this.themes[themeKey];
        const root = document.documentElement;

        // Apply all color variables to :root
        for (const [prop, value] of Object.entries(themeToApply.colors)) {
            root.style.setProperty(prop, value);
        }

        // Set data attribute on body for TW bridge targeting
        document.body.setAttribute('data-theme', themeKey);
        
        this.currentTheme = themeKey;
        localStorage.setItem('r_theme', themeKey);
        
        // Expose to window for Canvas drawings since they cannot use var()
        window.THEME_COLORS = themeToApply.colors;

        // Update Smoke color config if possible
        if (window.GAME_CONFIG && window.GAME_CONFIG.SMOKE) {
            window.GAME_CONFIG.SMOKE.COLOR = `rgba(${themeToApply.colors['--t-smoke-rgb']}, `;
        }
        
        // Ensure chart updates
        if (typeof updateChart === 'function') {
            const lang = window.getComputedLang ? window.getComputedLang() : window.currentLang;
            // Let the chart logic run an update if it uses variables
            // We might have to re-init chart if it relies on hardcoded config colors
            this.updateChartThemeConfig(themeKey);
            updateChart(lang);
        }
        
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: themeKey } }));
    },

    /**
     * Update Chart config with theme specific settings
     */
    updateChartThemeConfig: function(themeKey) {
        if (!window.GAME_CONFIG || !window.GAME_CONFIG.SKILLS_CHART) return;
        
        const theme = this.themes[themeKey];
        const r = theme.colors['--t-accent-rgb'];
        const hex = theme.colors['--t-accent'];
        
        // Update the global config so chart recreate works fine
        window.GAME_CONFIG.SKILLS_CHART.COLOR_BG = `rgba(${r}, 0.4)`;
        window.GAME_CONFIG.SKILLS_CHART.COLOR_BORDER = hex;
        
        // If chart exists, destroy and recreate is often safest for complex plugin changes
        if (window.skillsChart && typeof window.updateChart === 'function') {
            window.skillsChart.destroy();
            window.skillsChart = null; // force recreate
        }
    },

    /**
     * Create floating UI for theme switching
     */
    createSwitcherUI: function() {
        const container = document.createElement('div');
        container.id = 'r-theme-switcher';
        container.className = 'fixed bottom-4 right-4 z-[99] flex flex-col gap-2 items-end group';
        
        const lang = window.getComputedLang ? window.getComputedLang() : 'zh';
        
        // Button to toggle list
        const mainBtn = document.createElement('button');
        mainBtn.className = 'theme-switcher-main-btn w-10 h-10 rounded-full bg-gray-800 border-2 border-gray-600 flex items-center justify-center text-gray-400 hover:text-white hover:border-yellow-500 transition-all shadow-lg focus:outline-none';
        mainBtn.innerHTML = '<i class="fas fa-palette"></i>';
        mainBtn.title = lang === 'zh' ? '切换主题' : 'Switch Theme';
        
        // List wrapper to bridge the hover gap
        const listWrapper = document.createElement('div');
        listWrapper.className = 'absolute bottom-full right-0 pb-3 transition-all duration-300 opacity-0 pointer-events-none translate-y-4 group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0 z-50';

        // List of themes (hidden by default)
        const list = document.createElement('div');
        list.className = 'flex flex-col gap-2 p-2 bg-gray-900/90 border border-gray-700 rounded-lg shadow-xl backdrop-blur-sm max-h-[300px] overflow-y-auto w-max';
        
        // Populate list
        Object.keys(this.themes).forEach(key => {
            const theme = this.themes[key];
            const btn = document.createElement('button');
            const isActive = this.currentTheme === key;
            
            btn.className = `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-semibold transition-colors w-full text-left bg-gray-800/50 hover:bg-gray-700 ${isActive ? 'static-active-theme border border-white/20' : 'border border-transparent'}`;
            // Dynamically set active border style
            if(isActive) {
                 btn.style.borderColor = `rgba(${theme.colors['--t-accent-rgb']}, 0.5)`;
                 btn.style.color = theme.colors['--t-accent'];
            } else {
                 btn.style.color = '#9ca3af'; // gray-400
            }
            
            // Color dot
            const dot = document.createElement('span');
            dot.className = 'w-3 h-3 rounded-full shadow-sm';
            dot.style.backgroundColor = theme.colors['--t-accent'];
            
            const text = document.createElement('span');
            text.textContent = theme.name[lang] || theme.name.zh;
            
            btn.appendChild(dot);
            btn.appendChild(text);
            
            btn.onclick = () => {
                this.applyTheme(key);
                // Refresh UI to show active state
                container.remove();
                this.createSwitcherUI();
            };
            
            list.appendChild(btn);
        });
        
        listWrapper.appendChild(list);
        container.appendChild(listWrapper);
        container.appendChild(mainBtn);
        
        // Ensure language listener is added only once
        if (!this._langListenerAdded) {
            window.addEventListener('languageChanged', () => {
                const btn = document.querySelector('.theme-switcher-main-btn');
                if (btn) {
                    btn.title = window.getComputedLang() === 'zh' ? '切换主题' : 'Switch Theme';
                }
                // We can just recreate the UI to update language
                const oldContainer = document.getElementById('r-theme-switcher');
                if (oldContainer) oldContainer.remove();
                this.createSwitcherUI();
            });
            this._langListenerAdded = true;
        }
        
        document.body.appendChild(container);
    }
};

window.ThemeManager = ThemeManager;
