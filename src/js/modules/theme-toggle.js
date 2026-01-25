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
        const savedTheme = localStorage.getItem('theme') || 'dark';
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
        
        // Update body classes for background and text colors
        if (isDark) {
            body.classList.remove('bg-white', 'bg-background-white', 'text-background-dark', 'text-black');
            body.classList.add('bg-background-dark', 'text-white');
        } else {
            body.classList.remove('bg-background-dark', 'text-white');
            body.classList.add('bg-white', 'text-background-dark');
        }
        
        // Update glass effects
        this.updateGlassEffect();
        
        // Trigger a custom event for other components to react
        window.dispatchEvent(new CustomEvent('themechange', {
            detail: { isDark }
        }));
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
        
        // Update borders on glass elements
        const borderElements = document.querySelectorAll('.border-white\\/5, .border-white\\/10, .border-white\\/20');
        borderElements.forEach(el => {
            if (isDark) {
                el.classList.remove('border-black/5', 'border-black/10', 'border-black/20');
                if (!el.classList.contains('border-white/5') && !el.classList.contains('border-white/10') && !el.classList.contains('border-white/20')) {
                    el.classList.add('border-white/5');
                }
            } else {
                el.classList.remove('border-white/5', 'border-white/10', 'border-white/20');
                if (!el.classList.contains('border-black/5') && !el.classList.contains('border-black/10') && !el.classList.contains('border-black/20')) {
                    el.classList.add('border-black/10');
                }
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

