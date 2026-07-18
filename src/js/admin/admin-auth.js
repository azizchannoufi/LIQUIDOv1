/**
 * Admin Auth Guard
 * Protects all admin pages - requires Firebase Authentication.
 * Include this script AFTER firebase-config.js on every admin page (except index.html login page).
 *
 * Usage:
 *   <script src="../../src/js/admin/admin-auth.js"></script>
 *
 * Features:
 *  - Redirects unauthenticated users to /admin/index.html
 *  - Exposes window.adminAuth.logout() for the logout button
 *  - Shows a loading overlay while Firebase initialises
 *  - Injects the admin user's email in any element with id="admin-user-email"
 */

(function () {
    'use strict';

    // ── Resolve the path to the login page relative to the current page ──────
    function getLoginUrl() {
        // Works regardless of nesting depth: count path segments to compute ../
        const segments = window.location.pathname.split('/').filter(Boolean);
        // Find "admin" in segments. Everything after it is sub-path depth.
        const adminIndex = segments.indexOf('admin');
        if (adminIndex === -1) return '/admin/index.html';

        const depth = segments.length - adminIndex - 1; // how many folders below /admin/
        const prefix = depth > 0 ? '../'.repeat(depth) : '';
        return prefix + "/";
    }

    // ── Overlay helpers ───────────────────────────────────────────────────────
    function showLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'admin-auth-overlay';
        overlay.style.cssText = [
            'position:fixed', 'inset:0', 'z-index:9999',
            'background:#000', 'display:flex',
            'align-items:center', 'justify-content:center',
            'flex-direction:column', 'gap:16px',
        ].join(';');
        overlay.innerHTML = `
            <div style="width:48px;height:48px;border:3px solid #333;border-top-color:#F8ED70;border-radius:50%;animation:admin-spin 0.8s linear infinite;"></div>
            <p style="color:#888;font-size:13px;font-family:'Plus Jakarta Sans',sans-serif;">Verifying access…</p>
            <style>@keyframes admin-spin{to{transform:rotate(360deg)}}</style>
        `;
        document.body.appendChild(overlay);
        return overlay;
    }

    function removeLoadingOverlay(overlay) {
        if (overlay && overlay.parentNode) {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.3s';
            setTimeout(() => overlay.remove(), 300);
        }
    }

    // ── Main guard ────────────────────────────────────────────────────────────
    async function initAuthGuard() {
        // Show overlay immediately so the page content is hidden during auth check
        const overlay = showLoadingOverlay();

        try {
            // Wait for Firebase to initialise
            const { auth } = await window.firebaseConfig.initializeFirebase();

            if (!auth) {
                console.error('[AdminAuth] Firebase Auth not available.');
                window.location.href = getLoginUrl();
                return;
            }

            // Listen to auth state once
            auth.onAuthStateChanged((user) => {
                if (!user) {
                    // Not logged in → redirect to login
                    window.location.href = getLoginUrl();
                } else {
                    // Logged in → reveal page
                    removeLoadingOverlay(overlay);
                    _injectUserInfo(user);
                    console.log('[AdminAuth] ✓ Authenticated as', user.email);
                }
            });

        } catch (err) {
            console.error('[AdminAuth] Error during auth guard init:', err);
            removeLoadingOverlay(overlay);
            window.location.href = getLoginUrl();
        }
    }

    function _injectUserInfo(user) {
        // Inject email into any labelled element
        document.querySelectorAll('#admin-user-email').forEach(el => {
            el.textContent = user.email || 'Admin';
        });
        // Store for other scripts
        window._adminUser = user;
    }

    // ── Public API ────────────────────────────────────────────────────────────
    window.adminAuth = {
        /**
         * Sign out the current admin user and redirect to login.
         */
        logout: async function () {
            try {
                const { auth } = await window.firebaseConfig.initializeFirebase();
                if (auth) await auth.signOut();
            } catch (e) {
                console.error('[AdminAuth] Logout error:', e);
            } finally {
                window.location.href = getLoginUrl();
            }
        },

        /**
         * Returns the currently signed-in Firebase user, or null.
         */
        getCurrentUser: async function () {
            try {
                const { auth } = await window.firebaseConfig.initializeFirebase();
                return auth ? auth.currentUser : null;
            } catch {
                return null;
            }
        }
    };

    // ── Boot ──────────────────────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAuthGuard);
    } else {
        initAuthGuard();
    }
})();
