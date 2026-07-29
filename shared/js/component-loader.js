/**
 * Helper to resolve relative path based on location and component loader script tag
 */
function resolveAssetPath(relativePath) {
    const loaderScript = document.querySelector('script[src*="component-loader.js"]');
    let prefix = '';
    if (loaderScript) {
        const src = loaderScript.getAttribute('src');
        if (src.startsWith('../')) {
            prefix = '../';
        } else if (src.startsWith('./')) {
            prefix = './';
        }
    }
    const cleanPath = relativePath.replace(/^(\.\/|\.\.\/)+/, '');
    return prefix ? prefix + cleanPath : cleanPath;
}

/**
 * Robust fetch component HTML trying multiple potential path strategies
 */
async function fetchComponentHtml(relativePath, cacheBuster = '') {
    const primary = resolveAssetPath(relativePath);
    const clean = relativePath.replace(/^(\.\/|\.\.\/)+/, '');
    const candidatePaths = Array.from(new Set([
        primary,
        './' + clean,
        '../' + clean,
        '/' + clean
    ]));

    for (const path of candidatePaths) {
        try {
            const res = await fetch(path + cacheBuster);
            if (res.ok) {
                return await res.text();
            }
        } catch (e) {
            // try next candidate path
        }
    }
    throw new Error(`Failed to fetch component from paths: ${candidatePaths.join(', ')}`);
}

/**
 * Load script asynchronously and return Promise
 */
function loadScriptAsync(src) {
    return new Promise((resolve) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
            if (existing.dataset.loaded === 'true' || typeof firebase !== 'undefined') {
                resolve();
            } else {
                existing.addEventListener('load', () => resolve(), { once: true });
                existing.addEventListener('error', () => resolve(), { once: true });
            }
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            script.dataset.loaded = 'true';
            resolve();
        };
        script.onerror = () => resolve();
        document.body.appendChild(script);
    });
}

/**
 * Helper to initialize and bind StoreInfoService to the page
 */
async function loadStoreInfoService() {
    try {
        if (typeof firebase === 'undefined') {
            await loadScriptAsync('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
            await loadScriptAsync('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js');
        }

        if (typeof initializeFirebase === 'undefined') {
            await loadScriptAsync(resolveAssetPath('src/js/services/firebase-config.js'));
        }

        if (!window.storeInfoService) {
            await loadScriptAsync(resolveAssetPath('src/js/services/store-info-service.js'));
        }

        if (window.storeInfoService) {
            await window.storeInfoService.init();
            window.storeInfoService.applyToPage();
        }
    } catch (e) {
        console.warn('loadStoreInfoService error:', e);
    }
}

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

        const cacheBuster = '?v=' + new Date().getTime();
        const html = await fetchComponentHtml(componentPath, cacheBuster);
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
async function loadComponentsInParallel(components) {
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
        const cacheBuster = '?v=' + new Date().getTime();
        const html = await fetchComponentHtml('shared/components/public-top-nav.html', cacheBuster);
        document.body.insertAdjacentHTML('afterbegin', html);

        // Fetch store info from Firebase and apply topbar promo text / store hours
        loadStoreInfoService();
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
        const cacheBuster = '?v=' + new Date().getTime();
        const html = await fetchComponentHtml('shared/components/public-header.html', cacheBuster);
        
        const topNav = document.body.firstElementChild;
        if (topNav) {
            topNav.insertAdjacentHTML('afterend', html);
        } else {
            document.body.insertAdjacentHTML('afterbegin', html);
        }

        // Load header logic script
        const headerScriptPath = resolveAssetPath('shared/js/header.js');
        loadScriptAsync(headerScriptPath);

        // Load search dependencies lazily (for live search dropdown)
        if (typeof firebase === 'undefined') {
            loadScriptAsync('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
            loadScriptAsync('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js');
        }
        loadScriptAsync(resolveAssetPath('src/js/services/firebase-config.js'));
        loadScriptAsync(resolveAssetPath('src/js/services/firebase-catalog-service.js'));
        loadScriptAsync(resolveAssetPath('src/js/services/search-service.js'));

    } catch (error) {
        console.error('Error loading header:', error);
    }
}

/**
 * Load the footer component
 * Automatically appends to the main element or body
 */
async function loadFooter() {
    try {
        const cacheBuster = '?v=' + new Date().getTime();
        const html = await fetchComponentHtml('shared/components/public-footer.html', cacheBuster);
        const main = document.querySelector('main');
        if (main) {
            main.insertAdjacentHTML('afterend', html);
        } else {
            document.body.insertAdjacentHTML('beforeend', html);
        }

        // Ensure site-texts-service is loaded
        if (!window.siteTextsService) {
            if (typeof firebase === 'undefined') {
                await loadScriptAsync('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
                await loadScriptAsync('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js');
            }
            await loadScriptAsync(resolveAssetPath('src/js/services/firebase-config.js'));
            await loadScriptAsync(resolveAssetPath('src/js/services/site-texts-service.js'));
        }

        // Apply dynamic texts to footer if site-texts-service is loaded
        if (window.siteTextsService) {
            try {
                const texts = await window.siteTextsService.loadTexts();
                document.querySelectorAll('[data-text-key]').forEach(el => {
                    const key = el.getAttribute('data-text-key');
                    const parts = key.split('.');
                    let val = texts;
                    for (const p of parts) val = val && val[p];
                    if (val !== undefined && val !== null) {
                        if (el.hasAttribute('data-text-html')) {
                            el.innerHTML = String(val).replace(/\n/g, '<br>');
                        } else {
                            el.textContent = val;
                        }
                    }
                });
            } catch (e) { /* silently fail */ }
        }
    } catch (error) {
        console.error('Error loading footer:', error);
    }
}

/**
 * Load the cookie banner component
 * Automatically appends to the body
 */
async function loadCookieBanner() {
    try {
        const cacheBuster = '?v=' + new Date().getTime();
        const html = await fetchComponentHtml('shared/components/cookie-banner.html', cacheBuster);
        document.body.insertAdjacentHTML('beforeend', html);

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const scripts = tempDiv.querySelectorAll('script');

        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));
            document.body.appendChild(newScript);
        });

    } catch (error) {
        console.error('Error loading cookie banner:', error);
    }
}

// Auto-load components when DOM is ready
async function loadComponents() {
    await loadTopNav();
    await loadHeader();
    await loadFooter();
    await loadCookieBanner();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadComponents);
} else {
    loadComponents();
}

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { loadComponent, loadComponents: loadComponentsInParallel, loadTopNav, loadHeader, loadFooter, loadCookieBanner };
}
