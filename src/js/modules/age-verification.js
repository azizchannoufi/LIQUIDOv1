(function() {
    'use strict';

    const AGE_VERIFICATION_KEY = 'liquido_age_verified';
    const VERIFIED_VALUE = 'true';

    function createAgeVerificationPopup() {
        const overlay = document.createElement('div');
        overlay.id = 'age-verification-overlay';
        overlay.className = 'fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6';
        overlay.style.display = 'flex';

        const popup = document.createElement('div');
        popup.className = 'bg-white rounded-xl max-w-md w-full p-8 md:p-12 text-center space-y-6';
        
        const logoPath = '../assets/images/Goccia LIQUIDO/GOCCIA Y_W.png';
        
        popup.innerHTML = `
            <div class="space-y-4">
                <div class="flex items-center justify-center gap-3 mb-6">
                    <img src="${logoPath}" alt="LIQUIDO Logo" class="h-12 object-contain"/>
                    <h2 class="text-3xl font-black tracking-tighter uppercase" style="color: #333333;">
                        LIQUIDO <span class="font-normal" style="color: #F8ED70;">VAPE SHOP</span>
                    </h2>
                </div>
                
                <h1 class="text-3xl md:text-4xl font-black leading-tight" style="color: #333333;">
                    Benvenuto su Liquidovapeshop.it
                </h1>
                
                <p class="text-base leading-relaxed" style="color: #666666;">
                    Ti ricordiamo che i prodotti e i temi trattati nel nostro sito sono rivolti a un <strong class="font-bold" style="color: #333333;">pubblico di soli fumatori adulti</strong>.
                </p>
                
                <p class="text-base font-medium" style="color: #666666;">
                    Dichiari di essere maggiorenne?
                </p>
            </div>
            
            <div class="flex flex-col gap-4 pt-4">
                <button id="age-verify-yes" class="hover:opacity-90 font-black text-sm uppercase tracking-widest px-8 py-4 rounded-lg transition-all" style="background-color: #F8ED70; color: #333333;">
                    Si ho più di 18 anni
                </button>
                <button id="age-verify-no" class="hover:opacity-90 font-black text-sm uppercase tracking-widest px-8 py-4 rounded-lg transition-all" style="background-color: #333333; color: white;">
                    No, lascio il sito
                </button>
            </div>
        `;

        overlay.appendChild(popup);
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        const yesButton = document.getElementById('age-verify-yes');
        const noButton = document.getElementById('age-verify-no');

        yesButton.addEventListener('click', function() {
            localStorage.setItem(AGE_VERIFICATION_KEY, VERIFIED_VALUE);
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.3s ease-out';
            setTimeout(() => {
                overlay.remove();
                document.body.style.overflow = '';
            }, 300);
        });

        noButton.addEventListener('click', function() {
            alert('Devi essere maggiorenne per accedere a questo sito.');
        });
    }

    function checkAgeVerification() {
        const isVerified = localStorage.getItem(AGE_VERIFICATION_KEY) === VERIFIED_VALUE;
        
        if (!isVerified) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', createAgeVerificationPopup);
            } else {
                createAgeVerificationPopup();
            }
        }
    }

    checkAgeVerification();
})();

