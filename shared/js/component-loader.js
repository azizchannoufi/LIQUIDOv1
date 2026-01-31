/**
 * LIQUIDO Component Loader
 * Dynamically loads HTML components into designated containers
 */

/**
 * Load an HTML component into a container element
 * @param {string} elementId - ID of the container element
 * @param {string} componentPath - Path to the HTML component file
 * @param {Object} options - Optional configuration
 */
async function loadComponent(elementId, componentPath, options = {}) {
    try {
        const container = document.getElementById(elementId);
        if (!container) {
            console.error(`Container element with ID "${elementId}" not found`);
            return;
        }

        const response = await fetch(componentPath);
        if (!response.ok) {
            throw new Error(`Failed to load component: ${response.statusText}`);
        }

        const html = await response.text();
        container.innerHTML = html;

        // Execute callback if provided
        if (options.onLoad && typeof options.onLoad === 'function') {
            options.onLoad(container);
        }

        // Dispatch custom event
        container.dispatchEvent(new CustomEvent('componentLoaded', {
            detail: { componentPath }
        }));

    } catch (error) {
        console.error(`Error loading component from ${componentPath}:`, error);
    }
}

/**
 * Load multiple components in parallel
 * @param {Array} components - Array of {elementId, componentPath} objects
 */
async function loadComponents(components) {
    const promises = components.map(({ elementId, componentPath, options }) =>
        loadComponent(elementId, componentPath, options)
    );
    await Promise.all(promises);
}

/**
 * Load the top navigation bar component
 * Automatically prepends the top nav to the body element
 */
async function loadTopNav() {
    try {
        const response = await fetch('../shared/components/public-top-nav.html');
        if (!response.ok) {
            throw new Error(`Failed to load top nav: ${response.statusText}`);
        }

        const html = await response.text();
        document.body.insertAdjacentHTML('afterbegin', html);
    } catch (error) {
        console.error('Error loading top navigation:', error);
    }
}

/**
 * Load the header component
 * Automatically loads after the top nav
 */
async function loadHeader() {
    try {
        const response = await fetch('../shared/components/public-header.html');
        if (!response.ok) {
            throw new Error(`Failed to load header: ${response.statusText}`);
        }

        const html = await response.text();
        // Insert after top nav (which is the first element in body)
        const topNav = document.body.firstElementChild;
        if (topNav) {
            topNav.insertAdjacentHTML('afterend', html);
        } else {
            document.body.insertAdjacentHTML('afterbegin', html);
        }

        // Load header logic script
        const script = document.createElement('script');
        script.src = '../shared/js/header.js';
        document.body.appendChild(script);
    } catch (error) {
        console.error('Error loading header:', error);
    }
}

// Auto-load components when DOM is ready
async function loadComponents() {
    await loadTopNav();
    await loadHeader();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadComponents);
} else {
    loadComponents();
}

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { loadComponent, loadComponents: loadComponentsMultiple, loadTopNav, loadHeader };
}
