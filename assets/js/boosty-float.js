// boosty on scroll
document.addEventListener('DOMContentLoaded', function () {
    const aside = document.querySelector('.boosty-float');
    const main = document.querySelector('main');
    const footer = document.querySelector('footer');
    const closeBtn = aside.querySelector('.boosty-float-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            aside.classList.add('is-hidden');
            aside.dataset.closedByUser = 'true'; // remember user dismissed it
        });
    }
    if (!aside || !main || !footer) return;

    function toggleBoostyVisibility() {
        if (aside.dataset.closedByUser === 'true') return; // don't show if user dismissed it
        const mainRect = main.getBoundingClientRect();
        const footerRect = footer.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        const isAboveMain = mainRect.top > viewportHeight;
        const isBelowMain = mainRect.bottom <= 0;
        const footerVisible = footerRect.top < viewportHeight;

        if (isAboveMain || isBelowMain || footerVisible) {
            console.log(" if (isAboveMain || isBelowMain || footerVisible) ")
            aside.classList.add('is-hidden');
        } else {
            aside.classList.remove('is-hidden');
        }
    }

    toggleBoostyVisibility();
    window.addEventListener('scroll', toggleBoostyVisibility, {
        passive: true
    });
    window.addEventListener('resize', toggleBoostyVisibility);
});