/**
 * ╔══════════════════════════════════════════════════╗
 * ║         LIQUIDO ADMIN — Toast Notification       ║
 * ║  Premium glassmorphism design with animations    ║
 * ╚══════════════════════════════════════════════════╝
 *
 * Usage:
 *   AdminToast.show('Message', 'success');   // 'success' | 'error' | 'warning' | 'info'
 *   AdminToast.success('Saved!');
 *   AdminToast.error('Something went wrong');
 *   AdminToast.warning('Check this');
 *   AdminToast.info('FYI');
 */

(function () {
    'use strict';

    // ── Inject CSS once ───────────────────────────────────────────────────────
    if (!document.getElementById('admin-toast-styles')) {
        const style = document.createElement('style');
        style.id = 'admin-toast-styles';
        style.textContent = `
            /* ── Toast Container ── */
            #admin-toast-container {
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 99999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            }

            /* ── Single Toast ── */
            .lq-toast {
                pointer-events: all;
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 14px 18px;
                border-radius: 14px;
                min-width: 280px;
                max-width: 380px;
                position: relative;
                overflow: hidden;
                cursor: pointer;
                user-select: none;

                /* Glassmorphism */
                background: rgba(20, 20, 16, 0.92);
                backdrop-filter: blur(20px) saturate(1.4);
                -webkit-backdrop-filter: blur(20px) saturate(1.4);
                border: 1px solid rgba(255, 255, 255, 0.08);
                box-shadow:
                    0 8px 32px rgba(0, 0, 0, 0.5),
                    0 2px 8px rgba(0, 0, 0, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.05);

                /* Animation */
                animation: lqToastIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
                transform-origin: bottom right;
            }

            .lq-toast.lq-toast-exit {
                animation: lqToastOut 0.3s cubic-bezier(0.4, 0, 1, 1) both;
            }

            @keyframes lqToastIn {
                from {
                    opacity: 0;
                    transform: translateX(40px) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translateX(0) scale(1);
                }
            }

            @keyframes lqToastOut {
                from {
                    opacity: 1;
                    transform: translateX(0) scale(1);
                    max-height: 120px;
                    margin-bottom: 0;
                    padding: 14px 18px;
                }
                to {
                    opacity: 0;
                    transform: translateX(40px) scale(0.92);
                    max-height: 0;
                    margin-bottom: -10px;
                    padding: 0;
                }
            }

            /* ── Left accent border ── */
            .lq-toast::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 3px;
                border-radius: 14px 0 0 14px;
            }

            /* ── Icon wrapper ── */
            .lq-toast-icon {
                width: 34px;
                height: 34px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                font-size: 18px;
            }

            .lq-toast-icon .material-symbols-outlined {
                font-size: 18px;
                font-variation-settings: 'FILL' 1;
            }

            /* ── Content ── */
            .lq-toast-body {
                flex: 1;
                min-width: 0;
            }

            .lq-toast-title {
                font-family: 'Plus Jakarta Sans', sans-serif;
                font-size: 12px;
                font-weight: 700;
                letter-spacing: 0.06em;
                text-transform: uppercase;
                margin-bottom: 2px;
                opacity: 0.6;
            }

            .lq-toast-message {
                font-family: 'Plus Jakarta Sans', sans-serif;
                font-size: 13.5px;
                font-weight: 500;
                color: #f0f0e0;
                line-height: 1.4;
                word-break: break-word;
            }

            /* ── Close btn ── */
            .lq-toast-close {
                opacity: 0;
                background: none;
                border: none;
                cursor: pointer;
                padding: 2px;
                border-radius: 6px;
                color: rgba(255,255,255,0.4);
                transition: opacity 0.15s, color 0.15s, background 0.15s;
                flex-shrink: 0;
                align-self: flex-start;
                margin-top: 0px;
                line-height: 1;
            }
            .lq-toast:hover .lq-toast-close {
                opacity: 1;
            }
            .lq-toast-close:hover {
                color: #fff;
                background: rgba(255,255,255,0.08);
            }
            .lq-toast-close .material-symbols-outlined {
                font-size: 16px;
            }

            /* ── Progress bar ── */
            .lq-toast-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 2px;
                width: 100%;
                animation: lqProgress linear both;
                transform-origin: left;
            }

            @keyframes lqProgress {
                from { transform: scaleX(1); }
                to   { transform: scaleX(0); }
            }

            /* ── Type Variants ── */

            /* SUCCESS */
            .lq-toast-success::before      { background: #4ade80; }
            .lq-toast-success .lq-toast-icon {
                background: rgba(74, 222, 128, 0.12);
                color: #4ade80;
            }
            .lq-toast-success .lq-toast-title   { color: #4ade80; }
            .lq-toast-success .lq-toast-progress { background: #4ade80; }

            /* ERROR */
            .lq-toast-error::before        { background: #f87171; }
            .lq-toast-error .lq-toast-icon {
                background: rgba(248, 113, 113, 0.12);
                color: #f87171;
            }
            .lq-toast-error .lq-toast-title   { color: #f87171; }
            .lq-toast-error .lq-toast-progress { background: #f87171; }

            /* WARNING */
            .lq-toast-warning::before      { background: #F8ED70; }
            .lq-toast-warning .lq-toast-icon {
                background: rgba(248, 237, 112, 0.12);
                color: #F8ED70;
            }
            .lq-toast-warning .lq-toast-title   { color: #F8ED70; }
            .lq-toast-warning .lq-toast-progress { background: #F8ED70; }

            /* INFO */
            .lq-toast-info::before        { background: #60a5fa; }
            .lq-toast-info .lq-toast-icon {
                background: rgba(96, 165, 250, 0.12);
                color: #60a5fa;
            }
            .lq-toast-info .lq-toast-title   { color: #60a5fa; }
            .lq-toast-info .lq-toast-progress { background: #60a5fa; }
        `;
        document.head.appendChild(style);
    }

    // ── Toast Container ───────────────────────────────────────────────────────
    function getContainer() {
        let container = document.getElementById('admin-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'admin-toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    // ── Config per type ───────────────────────────────────────────────────────
    const CONFIG = {
        success: { icon: 'check_circle', label: 'Successo',  duration: 4000 },
        error:   { icon: 'cancel',       label: 'Errore',    duration: 5500 },
        warning: { icon: 'warning',      label: 'Avviso',    duration: 4500 },
        info:    { icon: 'info',         label: 'Info',      duration: 4000 },
    };

    // ── Core show function ────────────────────────────────────────────────────
    function show(message, type = 'success') {
        const cfg = CONFIG[type] || CONFIG.success;
        const container = getContainer();

        // Create toast
        const toast = document.createElement('div');
        toast.className = `lq-toast lq-toast-${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');

        toast.innerHTML = `
            <div class="lq-toast-icon">
                <span class="material-symbols-outlined">${cfg.icon}</span>
            </div>
            <div class="lq-toast-body">
                <div class="lq-toast-title">${cfg.label}</div>
                <div class="lq-toast-message">${message}</div>
            </div>
            <button class="lq-toast-close" aria-label="Chiudi">
                <span class="material-symbols-outlined">close</span>
            </button>
            <div class="lq-toast-progress" style="animation-duration: ${cfg.duration}ms"></div>
        `;

        container.appendChild(toast);

        // Dismiss on click
        const dismiss = () => {
            if (toast.classList.contains('lq-toast-exit')) return;
            toast.classList.add('lq-toast-exit');
            clearTimeout(autoTimer);
            toast.addEventListener('animationend', () => toast.remove(), { once: true });
        };

        toast.querySelector('.lq-toast-close').addEventListener('click', (e) => {
            e.stopPropagation();
            dismiss();
        });
        toast.addEventListener('click', dismiss);

        // Auto dismiss
        const autoTimer = setTimeout(dismiss, cfg.duration);

        // Limit to 5 toasts
        const toasts = container.querySelectorAll('.lq-toast:not(.lq-toast-exit)');
        if (toasts.length > 5) toasts[0].click();
    }

    // ── Public API ────────────────────────────────────────────────────────────
    window.AdminToast = {
        show,
        success: (msg) => show(msg, 'success'),
        error:   (msg) => show(msg, 'error'),
        warning: (msg) => show(msg, 'warning'),
        info:    (msg) => show(msg, 'info'),
    };

})();
