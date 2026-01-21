/**
 * LIQUIDO Form Validation
 * Reusable validation rules and functions
 */

const Validator = {
    /**
     * Validation rules
     */
    rules: {
        required: (value) => {
            return value !== null && value !== undefined && value.toString().trim() !== '';
        },

        email: (value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
        },

        minLength: (value, length) => {
            return value.toString().length >= length;
        },

        maxLength: (value, length) => {
            return value.toString().length <= length;
        },

        min: (value, min) => {
            return parseFloat(value) >= min;
        },

        max: (value, max) => {
            return parseFloat(value) <= max;
        },

        pattern: (value, pattern) => {
            const regex = new RegExp(pattern);
            return regex.test(value);
        },

        phone: (value) => {
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            return phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10;
        },

        url: (value) => {
            try {
                new URL(value);
                return true;
            } catch {
                return false;
            }
        },

        number: (value) => {
            return !isNaN(parseFloat(value)) && isFinite(value);
        },

        integer: (value) => {
            return Number.isInteger(parseFloat(value));
        },

        match: (value, matchValue) => {
            return value === matchValue;
        }
    },

    /**
     * Error messages
     */
    messages: {
        required: 'This field is required',
        email: 'Please enter a valid email address',
        minLength: 'Must be at least {0} characters',
        maxLength: 'Must not exceed {0} characters',
        min: 'Must be at least {0}',
        max: 'Must not exceed {0}',
        pattern: 'Invalid format',
        phone: 'Please enter a valid phone number',
        url: 'Please enter a valid URL',
        number: 'Please enter a valid number',
        integer: 'Please enter a whole number',
        match: 'Values do not match'
    },

    /**
     * Validate a single field
     * @param {string} value - Field value
     * @param {Object} rules - Validation rules
     * @returns {Object} { valid: boolean, errors: Array }
     */
    validateField(value, rules) {
        const errors = [];

        for (const [ruleName, ruleValue] of Object.entries(rules)) {
            if (!this.rules[ruleName]) {
                console.warn(`Validation rule "${ruleName}" not found`);
                continue;
            }

            const isValid = typeof ruleValue === 'boolean' && ruleValue
                ? this.rules[ruleName](value)
                : this.rules[ruleName](value, ruleValue);

            if (!isValid) {
                let message = this.messages[ruleName] || 'Invalid value';
                // Replace placeholders
                message = message.replace('{0}', ruleValue);
                errors.push(message);
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    },

    /**
     * Validate entire form
     * @param {HTMLFormElement} form - Form element
     * @param {Object} validationRules - Rules for each field
     * @returns {Object} { valid: boolean, errors: Object }
     */
    validateForm(form, validationRules) {
        const formData = new FormData(form);
        const errors = {};
        let isValid = true;

        for (const [fieldName, rules] of Object.entries(validationRules)) {
            const value = formData.get(fieldName) || '';
            const result = this.validateField(value, rules);

            if (!result.valid) {
                errors[fieldName] = result.errors;
                isValid = false;
            }
        }

        return { valid: isValid, errors };
    },

    /**
     * Show error message for a field
     * @param {HTMLElement} field - Input field
     * @param {string} message - Error message
     */
    showError(field, message) {
        // Remove existing error
        this.clearError(field);

        // Add error class
        field.classList.add('error', 'border-red-500');

        // Create error message element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message text-red-500 text-xs mt-1';
        errorDiv.textContent = message;
        errorDiv.setAttribute('data-error-for', field.name || field.id);

        // Insert after field
        field.parentNode.insertBefore(errorDiv, field.nextSibling);
    },

    /**
     * Clear error for a field
     * @param {HTMLElement} field - Input field
     */
    clearError(field) {
        field.classList.remove('error', 'border-red-500');

        const errorMsg = field.parentNode.querySelector(
            `[data-error-for="${field.name || field.id}"]`
        );

        if (errorMsg) {
            errorMsg.remove();
        }
    },

    /**
     * Clear all form errors
     * @param {HTMLFormElement} form - Form element
     */
    clearFormErrors(form) {
        const fields = form.querySelectorAll('input, select, textarea');
        fields.forEach(field => this.clearError(field));
    },

    /**
     * Display form errors
     * @param {HTMLFormElement} form - Form element
     * @param {Object} errors - Errors object from validateForm
     */
    displayFormErrors(form, errors) {
        this.clearFormErrors(form);

        for (const [fieldName, fieldErrors] of Object.entries(errors)) {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field && fieldErrors.length > 0) {
                this.showError(field, fieldErrors[0]);
            }
        }
    },

    /**
     * Add custom validation rule
     * @param {string} name - Rule name
     * @param {Function} validator - Validation function
     * @param {string} message - Error message
     */
    addRule(name, validator, message) {
        this.rules[name] = validator;
        this.messages[name] = message;
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Validator;
}
