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

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { loadComponent, loadComponents };
}
