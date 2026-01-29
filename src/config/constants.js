/**
 * LIQUIDO Application Constants
 * Global configuration and constant values
 */

const CONFIG = {
    // Application Info
    APP_NAME: 'LIQUIDO',
    APP_VERSION: '2.0.0',
    APP_DESCRIPTION: 'Premium Vaping Experience',

    // API Configuration (for future backend integration)
    API: {
        BASE_URL: '/api',
        TIMEOUT: 30000,
        ENDPOINTS: {
            PRODUCTS: '/products',
            BRANDS: '/brands',
            MESSAGES: '/messages',
            AUTH: '/auth'
        }
    },

    // Paths
    PATHS: {
        COMPONENTS: {
            COMMON: '../src/components/common',
            ADMIN: '../src/components/admin'
        },
        ASSETS: {
            IMAGES: '../assets/images',
            ICONS: '../assets/icons',
            FONTS: '../assets/fonts'
        },
        DATA: {
            CATALOG: '../src/data/catalog.json'
        }
    },

    // UI Constants
    UI: {
        ANIMATION_DURATION: 300,
        DEBOUNCE_DELAY: 300,
        ITEMS_PER_PAGE: 12,
        MOBILE_BREAKPOINT: 768,
        TABLET_BREAKPOINT: 1024,
        DESKTOP_BREAKPOINT: 1440
    },

    // Colors (matching Tailwind config)
    COLORS: {
        PRIMARY: '#F8ED70',
        PRIMARY_LIGHT_MODE: '#F5C842',
        BACKGROUND_DARK: '#000000',
        BACKGROUND_LIGHT: '#333333',
        BACKGROUND_LIGHT_MODE: '#FAFAFA',
        CHARCOAL: '#333333',
        WHITE: '#FFFFFF',
        TEXT_SECONDARY: 'rgba(255, 255, 255, 0.7)',
        TEXT_SECONDARY_LIGHT: 'rgba(26, 26, 26, 0.75)'
    },

    // Product Categories
    CATEGORIES: {
        HARDWARE: 'hardware',
        LIQUIDS: 'liquids',
        ACCESSORIES: 'accessories',
        PODS: 'pods'
    },

    // Brand List
    BRANDS: [
        'GeekVape',
        'Vaporesso',
        'Dinner Lady',
        'Voopoo',
        'Smok',
        'Lost Mary'
    ],

    // Validation Rules
    VALIDATION: {
        EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PHONE_PATTERN: /^[\d\s\-\+\(\)]+$/,
        MIN_PASSWORD_LENGTH: 8,
        MAX_MESSAGE_LENGTH: 1000
    },

    // Local Storage Keys
    STORAGE_KEYS: {
        CART: 'liquido_cart',
        USER: 'liquido_user',
        PREFERENCES: 'liquido_preferences',
        AUTH_TOKEN: 'liquido_auth_token'
    },

    // Messages
    MESSAGES: {
        SUCCESS: {
            SAVE: 'Successfully saved!',
            DELETE: 'Successfully deleted!',
            UPDATE: 'Successfully updated!',
            SEND: 'Message sent successfully!'
        },
        ERROR: {
            GENERIC: 'An error occurred. Please try again.',
            NETWORK: 'Network error. Please check your connection.',
            NOT_FOUND: 'Resource not found.',
            UNAUTHORIZED: 'You are not authorized to perform this action.'
        }
    }
};

// Freeze config to prevent modifications
Object.freeze(CONFIG);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
