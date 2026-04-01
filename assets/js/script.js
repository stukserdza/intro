document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function (event) {
            const hash = this.hash;

            if (hash && document.querySelector(hash)) {
                event.preventDefault();

                document.querySelector(hash).scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                history.pushState(null, '', hash);
            }
        });
    });

    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('nav');

    if (hamburger && nav) {
        hamburger.addEventListener('click', function () {
            nav.classList.toggle('active');

            const expanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', String(!expanded));
        });
    }
});

// boosty on scroll

document.addEventListener('DOMContentLoaded', function () {
    const aside = document.querySelector('.boosty-float');
    const main = document.querySelector('main');
    const footer = document.querySelector('footer');

    if (!aside || !main || !footer) return;

    function toggleBoostyVisibility() {
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