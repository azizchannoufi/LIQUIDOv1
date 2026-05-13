/**
 * Product Detail Page Logic
 * Handles authentication, modals, and product order for loyal customers
 */

class ProductDetailPage {
    constructor() {
        this.currentUser = null;
        this.productData = null;
        this.init();
    }

    async init() {
        // Hydrate from SSR data if available
        if (window.__INITIAL_PRODUCT_DATA__) {
            this.productData = window.__INITIAL_PRODUCT_DATA__;
            this.renderProductData(this.productData);
        } else {
            // Client-side fallback fetching could go here
            this.fetchAndRenderFallback();
        }

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
        if (this.productData) {
            return {
                name: this.productData.name,
                description: this.productData.description || this.productData.flavorProfile || '',
                details: this.productData.details || {}
            };
        }

        // Fallback to DOM extraction
        const productSection = document.querySelector('.flex.flex-col.gap-8');
        const productNameElement = document.getElementById('product-name') || (productSection ? productSection.querySelector('h1') : document.querySelector('h1'));
        const productName = productNameElement ? productNameElement.textContent.trim() : 'Prodotto';

        const productDescElement = document.getElementById('product-description') || (productSection ? productSection.querySelector('p.border-l-4') : null);
        const productDescription = productDescElement ? productDescElement.textContent.trim() : '';

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

    async fetchAndRenderFallback() {
        // Fallback logic if SSR data is not injected
        try {
            const pathParts = window.location.pathname.split('/');
            const slug = pathParts[pathParts.length - 1];
            if (!slug || slug === 'product-detail.html') return;

            // Wait for catalog service to be available
            if (!window.catalogService) return;

            const allProducts = await window.catalogService.getAllProducts();
            const product = allProducts.find(p => p.id === slug || (p.name && p.name.toLowerCase().replace(/\\s+/g, '-').replace(/[^a-z0-9-]/g, '') === slug));
            
            if (product) {
                this.productData = product;
                this.renderProductData(product);
            }
        } catch (error) {
            console.error('Failed to fetch fallback product data:', error);
        }
    }

    renderProductData(product) {
        // Set breadcrumb
        const breadcrumbName = document.getElementById('breadcrumb-name');
        if (breadcrumbName) breadcrumbName.textContent = product.name;

        // Set Main Image
        const mainImage = document.getElementById('main-product-image');
        const imageUrl = product.imageUrl || (product.images && product.images.length > 0 ? product.images[0] : '../assets/images/placeholder.png');
        if (mainImage) mainImage.src = imageUrl;

        // Tags
        const brandTag = document.getElementById('product-brand-tag');
        if (brandTag) {
            brandTag.textContent = product.brandName || 'LIQUIDO';
            brandTag.classList.remove('hidden');
        }
        
        const lineTag = document.getElementById('product-line-tag');
        if (lineTag) lineTag.textContent = product.lineName || '';

        // Text Content
        const nameEl = document.getElementById('product-name');
        if (nameEl) nameEl.textContent = product.name;

        const descEl = document.getElementById('product-description');
        if (descEl) descEl.textContent = product.description || product.flavorProfile || '';

        // Details grid
        const detailsGrid = document.getElementById('product-details-grid');
        if (detailsGrid) {
            detailsGrid.innerHTML = ''; // clear existing
            const details = product.details || {};
            // Default details if none exist
            if (Object.keys(details).length === 0) {
                if (product.ratio) details['Ratio'] = product.ratio;
                if (product.nicotine) details['Nicotina'] = product.nicotine;
                if (product.bottleSize) details['Formato'] = product.bottleSize;
            }

            const icons = ['science', 'opacity', 'straighten', 'eco', 'inventory_2'];
            let iconIndex = 0;

            for (const [key, value] of Object.entries(details)) {
                if (!value) continue;
                const icon = icons[iconIndex % icons.length];
                iconIndex++;
                
                detailsGrid.innerHTML += \`
                    <div class="bg-surface-dark/50 dark:bg-surface-dark/50 bg-surface-alt/50 border border-white/5 dark:border-white/5 border-black/10 p-5 rounded-xl flex flex-col gap-2">
                        <div class="flex items-center gap-2 text-primary">
                            <span class="material-symbols-outlined text-xl">\${icon}</span>
                            <span class="text-[10px] uppercase font-bold tracking-widest text-[#baba9c] dark:text-[#baba9c] text-slate-600">\${key}</span>
                        </div>
                        <p class="text-background-dark dark:text-white text-xl font-bold">\${value}</p>
                    </div>
                \`;
            }
        }

        // Thumbnails
        const thumbnailsContainer = document.getElementById('product-thumbnails');
        if (thumbnailsContainer && product.images && product.images.length > 0) {
            thumbnailsContainer.innerHTML = '';
            product.images.forEach((imgSrc, index) => {
                const thumbDiv = document.createElement('div');
                thumbDiv.className = 'aspect-square rounded-lg bg-surface-dark dark:bg-surface-dark bg-surface-alt border border-white/5 dark:border-white/5 border-black/10 p-2 cursor-pointer hover:border-primary transition-all overflow-hidden' + (index === 0 ? ' border-primary/20 dark:border-primary/20' : '');
                
                thumbDiv.innerHTML = \`<img src="\${imgSrc}" alt="Thumbnail" class="w-full h-full object-contain" />\`;
                
                thumbDiv.addEventListener('click', () => {
                    if (mainImage) mainImage.src = imgSrc;
                    // Remove highlight from all
                    Array.from(thumbnailsContainer.children).forEach(child => {
                        child.classList.remove('border-primary/20', 'dark:border-primary/20');
                        child.classList.add('border-white/5', 'dark:border-white/5', 'border-black/10');
                    });
                    // Add highlight to clicked
                    thumbDiv.classList.remove('border-white/5', 'dark:border-white/5', 'border-black/10');
                    thumbDiv.classList.add('border-primary/20', 'dark:border-primary/20');
                });

                thumbnailsContainer.appendChild(thumbDiv);
            });
        }
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

