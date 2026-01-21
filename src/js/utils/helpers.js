/**
 * LIQUIDO Utility Functions
 * Reusable helper functions for common operations
 */

const Utils = {
    /**
     * Format price with currency
     * @param {number} price - Price value
     * @param {string} currency - Currency symbol (default: $)
     * @returns {string} Formatted price
     */
    formatPrice(price, currency = '$') {
        return `${currency}${parseFloat(price).toFixed(2)}`;
    },

    /**
     * Format date to readable string
     * @param {Date|string} date - Date to format
     * @param {string} format - Format type ('short', 'long', 'iso')
     * @returns {string} Formatted date
     */
    formatDate(date, format = 'short') {
        const d = new Date(date);

        switch (format) {
            case 'short':
                return d.toLocaleDateString();
            case 'long':
                return d.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            case 'iso':
                return d.toISOString();
            default:
                return d.toLocaleDateString();
        }
    },

    /**
     * Debounce function execution
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function execution
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    throttle(func, limit = 300) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Get query parameter from URL
     * @param {string} param - Parameter name
     * @returns {string|null} Parameter value
     */
    getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    },

    /**
     * Set query parameter in URL
     * @param {string} param - Parameter name
     * @param {string} value - Parameter value
     */
    setQueryParam(param, value) {
        const url = new URL(window.location);
        url.searchParams.set(param, value);
        window.history.pushState({}, '', url);
    },

    /**
     * Generate unique ID
     * @param {string} prefix - Optional prefix
     * @returns {string} Unique ID
     */
    generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Truncate text to specified length
     * @param {string} text - Text to truncate
     * @param {number} length - Max length
     * @param {string} suffix - Suffix to add (default: ...)
     * @returns {string} Truncated text
     */
    truncate(text, length = 100, suffix = '...') {
        if (text.length <= length) return text;
        return text.substring(0, length).trim() + suffix;
    },

    /**
     * Slugify string (convert to URL-friendly format)
     * @param {string} text - Text to slugify
     * @returns {string} Slugified text
     */
    slugify(text) {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-');
    },

    /**
     * Deep clone object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Check if element is in viewport
     * @param {HTMLElement} element - Element to check
     * @returns {boolean} True if in viewport
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    /**
     * Smooth scroll to element
     * @param {string|HTMLElement} target - Element or selector
     * @param {number} offset - Offset from top (default: 0)
     */
    scrollTo(target, offset = 0) {
        const element = typeof target === 'string'
            ? document.querySelector(target)
            : target;

        if (element) {
            const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    },

    /**
     * Local storage helper with JSON support
     */
    storage: {
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('Storage set error:', e);
                return false;
            }
        },

        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.error('Storage get error:', e);
                return defaultValue;
            }
        },

        remove(key) {
            localStorage.removeItem(key);
        },

        clear() {
            localStorage.clear();
        }
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
