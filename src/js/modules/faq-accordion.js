/**
 * FAQ Accordion Module
 * Handles the interactive FAQ accordion functionality
 */

(function () {
    'use strict';

    function initFAQAccordion() {
        // Select all FAQ items
        const faqItems = document.querySelectorAll('.faq-item');

        if (faqItems.length === 0) return;

        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');

            if (!question || !answer) return;

            // Remove existing listeners to avoid duplicates (if re-initialized)
            const newQuestion = question.cloneNode(true);
            question.parentNode.replaceChild(newQuestion, question);

            newQuestion.addEventListener('click', (e) => {
                e.preventDefault();

                // Check if this item is currently active
                const isCurrentlyActive = item.classList.contains('active');

                // First, close ALL items (including this one)
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    if (otherAnswer) {
                        otherAnswer.classList.remove('active');
                    }
                });

                // If it wasn't active before, open it now
                // (If it WAS active, we just leave it closed from the step above)
                if (!isCurrentlyActive) {
                    item.classList.add('active');
                    answer.classList.add('active');
                }
            });
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFAQAccordion);
    } else {
        initFAQAccordion();
    }
})();
