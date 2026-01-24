/**
 * Product Detail Page Logic
 * Handles authentication, modals, and product order for loyal customers
 */

class ProductDetailPage {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    async init() {
        // Set minimum date for order form
        const dateInput = document.getElementById('order-date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.setAttribute('min', today);
        }

        // Initialize Firebase Auth state listener
        await this.initAuth();

        // Setup modal handlers
        this.setupModals();

        // Setup form handlers
        this.setupForms();

        // Setup order button
        this.setupOrderButton();
    }

    async initAuth() {
        try {
            // Listen to auth state changes
            window.firebaseAuthService.onAuthStateChanged(async (user) => {
                if (user) {
                    // User is signed in
                    const userProfile = await window.firebaseAuthService.getUserProfile(user.uid);
                    this.currentUser = {
                        uid: user.uid,
                        email: user.email,
                        ...userProfile
                    };
                } else {
                    // User is signed out
                    this.currentUser = null;
                }
            });
        } catch (error) {
            console.error('Error initializing auth:', error);
        }
    }

    setupOrderButton() {
        const orderButton = document.getElementById('btn-order-loyal');
        if (orderButton) {
            orderButton.addEventListener('click', () => {
                this.handleOrderButtonClick();
            });
        }
    }

    handleOrderButtonClick() {
        if (!this.currentUser) {
            // User not logged in, show login modal
            this.openLoginModal();
        } else {
            // User logged in, show order modal
            this.openOrderModal();
        }
    }

    setupModals() {
        const overlay = document.getElementById('modal-overlay');
        const loginModal = document.getElementById('login-modal');
        const signupModal = document.getElementById('signup-modal');
        const orderModal = document.getElementById('order-modal');
        const closeLoginModal = document.getElementById('close-login-modal');
        const closeSignupModal = document.getElementById('close-signup-modal');
        const closeOrderModal = document.getElementById('close-order-modal');
        const switchToSignup = document.getElementById('switch-to-signup');
        const switchToLogin = document.getElementById('switch-to-login');

        // Close modals
        if (closeLoginModal) {
            closeLoginModal.addEventListener('click', () => this.closeModals());
        }

        if (closeSignupModal) {
            closeSignupModal.addEventListener('click', () => this.closeModals());
        }

        if (closeOrderModal) {
            closeOrderModal.addEventListener('click', () => this.closeModals());
        }

        // Switch between login and signup modals
        if (switchToSignup) {
            switchToSignup.addEventListener('click', () => {
                this.closeModals();
                setTimeout(() => this.openSignupModal(), 150);
            });
        }

        if (switchToLogin) {
            switchToLogin.addEventListener('click', () => {
                this.closeModals();
                setTimeout(() => this.openLoginModal(), 150);
            });
        }

        // Close on overlay click
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeModals();
                }
            });
        }

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModals();
            }
        });
    }

    openLoginModal() {
        const overlay = document.getElementById('modal-overlay');
        const loginModal = document.getElementById('login-modal');
        const signupModal = document.getElementById('signup-modal');
        const orderModal = document.getElementById('order-modal');

        if (signupModal) signupModal.classList.add('hidden');
        if (orderModal) orderModal.classList.add('hidden');
        if (loginModal) loginModal.classList.remove('hidden');
        if (overlay) {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        // Clear errors
        this.clearError('login-error');
    }

    openSignupModal() {
        const overlay = document.getElementById('modal-overlay');
        const loginModal = document.getElementById('login-modal');
        const signupModal = document.getElementById('signup-modal');
        const orderModal = document.getElementById('order-modal');

        if (loginModal) loginModal.classList.add('hidden');
        if (orderModal) orderModal.classList.add('hidden');
        if (signupModal) signupModal.classList.remove('hidden');
        if (overlay) {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        // Clear errors
        this.clearError('signup-error');
    }

    openOrderModal() {
        const overlay = document.getElementById('modal-overlay');
        const loginModal = document.getElementById('login-modal');
        const signupModal = document.getElementById('signup-modal');
        const orderModal = document.getElementById('order-modal');

        if (loginModal) loginModal.classList.add('hidden');
        if (signupModal) signupModal.classList.add('hidden');
        if (orderModal) orderModal.classList.remove('hidden');
        if (overlay) {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        // Clear errors
        this.clearError('order-error');
    }

    closeModals() {
        const overlay = document.getElementById('modal-overlay');
        const loginModal = document.getElementById('login-modal');
        const signupModal = document.getElementById('signup-modal');
        const orderModal = document.getElementById('order-modal');

        if (overlay) overlay.classList.remove('active');
        if (loginModal) loginModal.classList.add('hidden');
        if (signupModal) signupModal.classList.add('hidden');
        if (orderModal) orderModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    setupForms() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLogin();
            });
        }

        // Signup form
        const signupForm = document.getElementById('signup-form');
        if (signupForm) {
            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSignup();
            });
        }

        // Order form
        const orderForm = document.getElementById('order-form');
        if (orderForm) {
            orderForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleOrder();
            });
        }
    }

    async handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        this.clearError('login-error');
        this.setFormLoading('login-form', true);

        try {
            await window.firebaseAuthService.signIn(email, password);
            
            // Update currentUser immediately
            const user = window.firebaseAuthService.getCurrentUser();
            if (user) {
                const userProfile = await window.firebaseAuthService.getUserProfile(user.uid);
                this.currentUser = {
                    uid: user.uid,
                    email: user.email,
                    ...userProfile
                };
            }
            
            this.closeModals();
            // After successful login, show order modal
            setTimeout(() => {
                this.openOrderModal();
            }, 300);
        } catch (error) {
            this.showError('login-error', error.message);
        } finally {
            this.setFormLoading('login-form', false);
        }
    }

    async handleSignup() {
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const phone = document.getElementById('signup-phone').value;
        const password = document.getElementById('signup-password').value;
        const passwordConfirm = document.getElementById('signup-password-confirm').value;

        // Validate passwords match
        if (password !== passwordConfirm) {
            this.showError('signup-error', 'Le password non corrispondono.');
            return;
        }

        // Validate password length
        if (password.length < 6) {
            this.showError('signup-error', 'La password deve contenere almeno 6 caratteri.');
            return;
        }

        this.clearError('signup-error');
        this.setFormLoading('signup-form', true);

        try {
            const userData = await window.firebaseAuthService.signUp(email, password, name, phone);
            
            // Update currentUser immediately
            this.currentUser = {
                uid: userData.uid,
                email: userData.email,
                name: userData.name,
                phone: userData.phone
            };
            
            this.closeModals();
            // After successful signup, show order modal
            setTimeout(() => {
                this.openOrderModal();
            }, 300);
        } catch (error) {
            this.showError('signup-error', error.message);
        } finally {
            this.setFormLoading('signup-form', false);
        }
    }

    async handleOrder() {
        if (!this.currentUser) {
            this.showError('order-error', 'Devi essere autenticato per effettuare un ordine.');
            return;
        }

        const date = document.getElementById('order-date').value;
        const time = document.getElementById('order-time').value;

        // Validate date
        if (!window.myLiquidoServices.validateFutureDate(date)) {
            this.showError('order-error', 'Seleziona una data valida (oggi o nel futuro).');
            return;
        }

        // Validate time
        if (!window.myLiquidoServices.validateTime(time)) {
            this.showError('order-error', 'Seleziona un\'ora valida.');
            return;
        }

        this.clearError('order-error');
        this.setFormLoading('order-form', true);

        try {
            // Extract product information from page
            const productInfo = this.extractProductInfo();

            // Create order and get WhatsApp URL
            const whatsappUrl = await window.myLiquidoServices.createProductOrder(
                this.currentUser.uid,
                productInfo,
                date,
                time,
                this.currentUser
            );

            // Open WhatsApp
            window.open(whatsappUrl, '_blank');

            // Reset form
            this.resetOrderForm();
            this.closeModals();
            this.showSuccess('Ordine creato con successo! Apri WhatsApp per completare.');
        } catch (error) {
            this.showError('order-error', error.message);
        } finally {
            this.setFormLoading('order-form', false);
        }
    }

    extractProductInfo() {
        // Extract product name from h1 in the product section
        const productSection = document.querySelector('.flex.flex-col.gap-8');
        const productNameElement = productSection ? productSection.querySelector('h1') : document.querySelector('h1');
        const productName = productNameElement ? productNameElement.textContent.trim() : 'Prodotto';

        // Extract product description - look for p tag with border-l-4 border-primary
        const productDescElement = productSection ? productSection.querySelector('p.border-l-4') : null;
        const productDescription = productDescElement ? productDescElement.textContent.trim() : '';

        // Extract additional product details from info cards
        const details = {};
        const detailCards = document.querySelectorAll('.bg-surface-dark\\/50, [class*="bg-surface-dark"]');
        detailCards.forEach(card => {
            const labelElement = card.querySelector('[class*="text-\\[10px\\]"], .text-xs');
            const valueElement = card.querySelector('.text-xl, [class*="text-xl"]');
            if (labelElement && valueElement) {
                const label = labelElement.textContent.trim();
                const value = valueElement.textContent.trim();
                if (label && value) {
                    details[label] = value;
                }
            }
        });

        return {
            name: productName,
            description: productDescription,
            details: details
        };
    }

    resetOrderForm() {
        const orderForm = document.getElementById('order-form');
        if (orderForm) {
            orderForm.reset();
        }
    }

    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
    }

    clearError(elementId) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.add('hidden');
        }
    }

    setFormLoading(formId, loading) {
        const form = document.getElementById(formId);
        if (!form) return;

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = loading;
            if (loading) {
                submitBtn.style.opacity = '0.6';
                submitBtn.style.cursor = 'not-allowed';
            } else {
                submitBtn.style.opacity = '1';
                submitBtn.style.cursor = 'pointer';
            }
        }
    }

    showSuccess(message) {
        // Simple success notification (can be enhanced with a toast library)
        alert(message);
    }
}

// Initialize page when DOM and Firebase are ready
function initializePage() {
    // Wait for Firebase config to be available
    if (typeof window.firebaseConfig === 'undefined' || !window.firebaseConfig.initializeFirebase) {
        console.warn('Firebase config not loaded yet, retrying...');
        setTimeout(initializePage, 100);
        return;
    }

    // Wait for Firebase Auth Service to be available
    if (typeof window.firebaseAuthService === 'undefined') {
        console.warn('Firebase Auth Service not loaded yet, retrying...');
        setTimeout(initializePage, 100);
        return;
    }

    new ProductDetailPage();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage();
}

