const ThemeToggle = {
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.loadTheme();
                this.setupToggleButton();
                this.updateGlassEffect();
            });
        } else {
            this.loadTheme();
            this.setupToggleButton();
            this.updateGlassEffect();
        }
    },

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        const html = document.documentElement;
        
        if (savedTheme === 'dark') {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
        
        this.updateStyles();
    },

    toggle() {
        const html = document.documentElement;
        const isDark = html.classList.contains('dark');
        
        if (isDark) {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
        
        this.updateStyles();
        this.updateToggleButton();
    },

    updateStyles() {
        const isDark = document.documentElement.classList.contains('dark');
        const body = document.body;
        const glassElements = document.querySelectorAll('.glass-effect');
        const navBars = document.querySelectorAll('nav[class*="bg-primary"]');
        const headers = document.querySelectorAll('header[class*="border-b"]');
        const searchInputs = document.querySelectorAll('input[placeholder*="Cerca"]');
        
        if (isDark) {
            body.classList.remove('bg-white', 'text-background-dark');
            body.classList.add('bg-background-dark', 'text-white');
            
            glassElements.forEach(el => {
                el.style.background = 'rgba(0, 0, 0, 0.85)';
            });
        } else {
            body.classList.remove('bg-background-dark', 'text-white');
            body.classList.add('bg-white', 'text-background-dark');
            
            glassElements.forEach(el => {
                el.style.background = 'rgba(255, 255, 255, 0.85)';
            });
        }
        
        this.updateGlassEffect();
    },

    updateGlassEffect() {
        const isDark = document.documentElement.classList.contains('dark');
        const glassElements = document.querySelectorAll('.glass-effect');
        
        glassElements.forEach(el => {
            if (isDark) {
                el.style.background = 'rgba(0, 0, 0, 0.85)';
            } else {
                el.style.background = 'rgba(255, 255, 255, 0.85)';
            }
        });
    },

    setupToggleButton() {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggle());
            this.updateToggleButton();
        }
    },

    updateToggleButton() {
        const toggleBtn = document.getElementById('theme-toggle');
        if (!toggleBtn) return;
        
        const isDark = document.documentElement.classList.contains('dark');
        const icon = toggleBtn.querySelector('.theme-icon');
        
        if (icon) {
            icon.textContent = isDark ? 'light_mode' : 'dark_mode';
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeToggle;
}

