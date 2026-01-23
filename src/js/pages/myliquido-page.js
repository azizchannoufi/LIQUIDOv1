/**
 * MyLiquido Page Logic
 * Handles authentication, modals, and service forms
 */

class MyLiquidoPage {
    constructor() {
        this.currentUser = null;
        this.selectedImageFile = null;
        this.selectedImageUrl = null;
        this.init();
    }

    async init() {
        // Set minimum date for maintenance form
        const dateInput = document.getElementById('maintenance-date');
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

        // Setup image upload handler
        this.setupImageUpload();
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
                    this.showServices();
                } else {
                    // User is signed out
                    this.currentUser = null;
                    this.showAuth();
                }
            });
        } catch (error) {
            console.error('Error initializing auth:', error);
        }
    }

    showAuth() {
        const authSection = document.getElementById('auth-section');
        const servicesSection = document.getElementById('services-section');
        
        if (authSection) authSection.classList.remove('hidden');
        if (servicesSection) servicesSection.classList.add('hidden');
    }

    showServices() {
        const authSection = document.getElementById('auth-section');
        const servicesSection = document.getElementById('services-section');
        
        if (authSection) authSection.classList.add('hidden');
        if (servicesSection) servicesSection.classList.remove('hidden');
    }

    setupModals() {
        const overlay = document.getElementById('modal-overlay');
        const loginModal = document.getElementById('login-modal');
        const signupModal = document.getElementById('signup-modal');
        const btnOpenLogin = document.getElementById('btn-open-login');
        const btnOpenSignup = document.getElementById('btn-open-signup');
        const closeLoginModal = document.getElementById('close-login-modal');
        const closeSignupModal = document.getElementById('close-signup-modal');
        const switchToSignup = document.getElementById('switch-to-signup');
        const switchToLogin = document.getElementById('switch-to-login');

        // Open login modal
        if (btnOpenLogin) {
            btnOpenLogin.addEventListener('click', () => this.openLoginModal());
        }

        // Open signup modal
        if (btnOpenSignup) {
            btnOpenSignup.addEventListener('click', () => this.openSignupModal());
        }

        // Close modals
        if (closeLoginModal) {
            closeLoginModal.addEventListener('click', () => this.closeModals());
        }

        if (closeSignupModal) {
            closeSignupModal.addEventListener('click', () => this.closeModals());
        }

        // Switch between modals
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

        if (signupModal) signupModal.classList.add('hidden');
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

        if (loginModal) loginModal.classList.add('hidden');
        if (signupModal) signupModal.classList.remove('hidden');
        if (overlay) {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        // Clear errors
        this.clearError('signup-error');
    }

    closeModals() {
        const overlay = document.getElementById('modal-overlay');
        const loginModal = document.getElementById('login-modal');
        const signupModal = document.getElementById('signup-modal');

        if (overlay) overlay.classList.remove('active');
        if (loginModal) loginModal.classList.add('hidden');
        if (signupModal) signupModal.classList.add('hidden');
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

        // Product request form
        const productForm = document.getElementById('product-request-form');
        if (productForm) {
            productForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleProductRequest();
            });
        }

        // Maintenance request form
        const maintenanceForm = document.getElementById('maintenance-request-form');
        if (maintenanceForm) {
            maintenanceForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleMaintenanceRequest();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                await this.handleLogout();
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
            this.closeModals();
            this.showSuccess('Accesso effettuato con successo!');
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
            await window.firebaseAuthService.signUp(email, password, name, phone);
            this.closeModals();
            this.showSuccess('Registrazione completata con successo!');
        } catch (error) {
            this.showError('signup-error', error.message);
        } finally {
            this.setFormLoading('signup-form', false);
        }
    }

    async handleProductRequest() {
        if (!this.currentUser) {
            this.showError('product-error', 'Devi essere autenticato per utilizzare questo servizio.');
            return;
        }

        const message = document.getElementById('product-message').value.trim();
        
        if (!this.selectedImageFile && !message) {
            this.showError('product-error', 'Inserisci almeno un\'immagine o un messaggio.');
            return;
        }

        this.clearError('product-error');
        this.setFormLoading('product-request-form', true);

        try {
            let imageUrl = null;

            // Upload image if selected
            if (this.selectedImageFile) {
                const progressBar = document.getElementById('progress-bar');
                const imageProgress = document.getElementById('image-progress');
                
                if (imageProgress) imageProgress.classList.remove('hidden');

                imageUrl = await window.cloudinaryService.uploadProductImage(
                    this.selectedImageFile,
                    this.currentUser.uid,
                    (progress) => {
                        if (progressBar) {
                            progressBar.style.width = `${progress}%`;
                        }
                    }
                );

                if (imageProgress) imageProgress.classList.add('hidden');
            }

            // Generate WhatsApp URL
            const whatsappUrl = await window.myLiquidoServices.requestSpecialProduct(
                this.currentUser.uid,
                imageUrl || '',
                message || 'Nessun messaggio specificato',
                this.currentUser
            );

            // Open WhatsApp
            window.open(whatsappUrl, '_blank');

            // Reset form
            this.resetProductForm();
            this.showSuccess('Richiesta inviata! Apri WhatsApp per completare.');
        } catch (error) {
            this.showError('product-error', error.message);
        } finally {
            this.setFormLoading('product-request-form', false);
        }
    }

    async handleMaintenanceRequest() {
        if (!this.currentUser) {
            this.showError('maintenance-error', 'Devi essere autenticato per utilizzare questo servizio.');
            return;
        }

        const date = document.getElementById('maintenance-date').value;
        const time = document.getElementById('maintenance-time').value;
        const description = document.getElementById('maintenance-description').value.trim();

        // Validate date
        if (!window.myLiquidoServices.validateFutureDate(date)) {
            this.showError('maintenance-error', 'Seleziona una data valida (oggi o nel futuro).');
            return;
        }

        // Validate time
        if (!window.myLiquidoServices.validateTime(time)) {
            this.showError('maintenance-error', 'Seleziona un\'ora valida.');
            return;
        }

        if (!description) {
            this.showError('maintenance-error', 'Inserisci una descrizione del servizio richiesto.');
            return;
        }

        this.clearError('maintenance-error');
        this.setFormLoading('maintenance-request-form', true);

        try {
            // Generate WhatsApp URL
            const whatsappUrl = await window.myLiquidoServices.requestMaintenanceService(
                this.currentUser.uid,
                date,
                time,
                description,
                this.currentUser
            );

            // Open WhatsApp
            window.open(whatsappUrl, '_blank');

            // Reset form
            this.resetMaintenanceForm();
            this.showSuccess('Prenotazione inviata! Apri WhatsApp per completare.');
        } catch (error) {
            this.showError('maintenance-error', error.message);
        } finally {
            this.setFormLoading('maintenance-request-form', false);
        }
    }

    async handleLogout() {
        try {
            await window.firebaseAuthService.signOut();
            this.showSuccess('Logout effettuato con successo!');
        } catch (error) {
            console.error('Error logging out:', error);
            this.showError('maintenance-error', 'Errore durante il logout.');
        }
    }

    setupImageUpload() {
        const imageInput = document.getElementById('product-image');
        const imagePreview = document.getElementById('image-preview');
        const previewImg = document.getElementById('preview-img');
        const removeImageBtn = document.getElementById('remove-image');

        if (imageInput) {
            imageInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    // Validate file
                    const validation = window.cloudinaryService.validateFile(file);
                    if (!validation.valid) {
                        this.showError('product-error', validation.error);
                        imageInput.value = '';
                        return;
                    }

                    this.selectedImageFile = file;

                    // Show preview
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        this.selectedImageUrl = e.target.result;
                        if (previewImg) previewImg.src = e.target.result;
                        if (imagePreview) imagePreview.classList.remove('hidden');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        if (removeImageBtn) {
            removeImageBtn.addEventListener('click', () => {
                this.selectedImageFile = null;
                this.selectedImageUrl = null;
                if (imageInput) imageInput.value = '';
                if (imagePreview) imagePreview.classList.add('hidden');
            });
        }
    }

    resetProductForm() {
        document.getElementById('product-message').value = '';
        this.selectedImageFile = null;
        this.selectedImageUrl = null;
        const imageInput = document.getElementById('product-image');
        const imagePreview = document.getElementById('image-preview');
        if (imageInput) imageInput.value = '';
        if (imagePreview) imagePreview.classList.add('hidden');
    }

    resetMaintenanceForm() {
        document.getElementById('maintenance-date').value = '';
        document.getElementById('maintenance-time').value = '';
        document.getElementById('maintenance-description').value = '';
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

// Initialize page when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new MyLiquidoPage();
    });
} else {
    new MyLiquidoPage();
}

