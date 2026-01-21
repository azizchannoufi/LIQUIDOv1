/**
 * LIQUIDO Component Loader v2.0
 * Enhanced component loading system with caching and error handling
 */

class ComponentLoader {
    constructor() {
        this.cache = new Map();
        this.loading = new Map();
    }

    /**
     * Load an HTML component into a container element
     * @param {string} elementId - ID of the container element
     * @param {string} componentPath - Path to the HTML component file
     * @param {Object} options - Optional configuration
     * @returns {Promise<void>}
     */
    async loadComponent(elementId, componentPath, options = {}) {
        try {
            const container = document.getElementById(elementId);
            if (!container) {
                console.error(`Container element with ID "${elementId}" not found`);
                return;
            }

            // Check cache if enabled
            if (options.cache !== false && this.cache.has(componentPath)) {
                container.innerHTML = this.cache.get(componentPath);
                this._executeCallback(container, componentPath, options);
                return;
            }

            // Prevent duplicate loading
            if (this.loading.has(componentPath)) {
                await this.loading.get(componentPath);
                return this.loadComponent(elementId, componentPath, options);
            }

            // Create loading promise
            const loadingPromise = this._fetchComponent(componentPath);
            this.loading.set(componentPath, loadingPromise);

            const html = await loadingPromise;

            // Cache the component
            if (options.cache !== false) {
                this.cache.set(componentPath, html);
            }

            container.innerHTML = html;
            this._executeCallback(container, componentPath, options);

            // Clean up loading state
            this.loading.delete(componentPath);

        } catch (error) {
            console.error(`Error loading component from ${componentPath}:`, error);
            this.loading.delete(componentPath);
        }
    }

    /**
     * Fetch component HTML from server
     * @private
     */
    async _fetchComponent(componentPath) {
        const response = await fetch(componentPath);
        if (!response.ok) {
            throw new Error(`Failed to load component: ${response.statusText}`);
        }
        return await response.text();
    }

    /**
     * Execute callback and dispatch events
     * @private
     */
    _executeCallback(container, componentPath, options) {
        // Execute callback if provided
        if (options.onLoad && typeof options.onLoad === 'function') {
            options.onLoad(container);
        }

        // Dispatch custom event
        container.dispatchEvent(new CustomEvent('componentLoaded', {
            detail: { componentPath }
        }));
    }

    /**
     * Load multiple components in parallel
     * @param {Array} components - Array of {elementId, componentPath, options} objects
     * @returns {Promise<void[]>}
     */
    async loadComponents(components) {
        const promises = components.map(({ elementId, componentPath, options }) =>
            this.loadComponent(elementId, componentPath, options)
        );
        return await Promise.all(promises);
    }

    /**
     * Clear component cache
     * @param {string} componentPath - Optional specific component to clear
     */
    clearCache(componentPath = null) {
        if (componentPath) {
            this.cache.delete(componentPath);
        } else {
            this.cache.clear();
        }
    }

    /**
     * Preload components for better performance
     * @param {Array<string>} componentPaths - Array of component paths to preload
     */
    async preload(componentPaths) {
        const promises = componentPaths.map(async (path) => {
            if (!this.cache.has(path)) {
                const html = await this._fetchComponent(path);
                this.cache.set(path, html);
            }
        });
        await Promise.all(promises);
    }
}

// Create global instance
const componentLoader = new ComponentLoader();

// Expose global functions for backward compatibility
function loadComponent(elementId, componentPath, options) {
    return componentLoader.loadComponent(elementId, componentPath, options);
}

function loadComponents(components) {
    return componentLoader.loadComponents(components);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ComponentLoader, componentLoader, loadComponent, loadComponents };
}
