// Простая навигация по карусели продуктов
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".testimonials-carousel").forEach((carousel) => {
        const track = carousel.querySelector(".testimonials-track");
        const cards = carousel.querySelectorAll(".testimonial-card");
        const btnPrev = carousel.querySelector(".testimonials-nav-btn[data-dir='prev']");
        const btnNext = carousel.querySelector(".testimonials-nav-btn[data-dir='next']");

        if (!track || !cards.length) return;

        const cardWidth = cards[0].offsetWidth + parseFloat(getComputedStyle(cards[0]).marginRight);

        function updateButtons() {
            const maxScroll = track.scrollWidth - track.clientWidth;
            const current = track.scrollLeft;

            if (current <= 1) {
                btnPrev?.classList.add("is-disabled");
            } else {
                btnPrev?.classList.remove("is-disabled");
            }

            if (current >= maxScroll - 1) {
                btnNext?.classList.add("is-disabled");
            } else {
                btnNext?.classList.remove("is-disabled");
            }
        }

        carousel.querySelectorAll(".testimonials-nav-btn").forEach((btn) => {
            btn.addEventListener("click", function () {
                console.log("Button clicked");
                const dir = this.dataset.dir;
                const delta = dir === "next" ? cardWidth : -cardWidth;

                track.scrollTo({
                    left: track.scrollLeft + delta,
                    behavior: "smooth"
                });

                setTimeout(updateButtons, 300); // mimic jQuery animate callback
            });
        });

        track.addEventListener("scroll", updateButtons);
        updateButtons();
    });
});


// FAQ
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".faq-question").forEach((question) => {
        question.addEventListener("click", function () {
            const item = this.closest(".faq-item");
            const answer = item.querySelector(".faq-answer");
            const icon = this.querySelector(".faq-icon");

            if (item.classList.contains("is-open")) {
                item.classList.remove("is-open");
                this.setAttribute("aria-expanded", "false");
                if (icon) icon.textContent = "+";
                answer.style.maxHeight = "0";
            } else {
                document.querySelectorAll(".faq-item.is-open").forEach((openItem) => {
                    openItem.classList.remove("is-open");
                    openItem.querySelector(".faq-question")?.setAttribute("aria-expanded", "false");
                    const openIcon = openItem.querySelector(".faq-icon");
                    if (openIcon) openIcon.textContent = "+";
                    const openAnswer = openItem.querySelector(".faq-answer");
                    if (openAnswer) openAnswer.style.maxHeight = "0";
                });

                item.classList.add("is-open");
                this.setAttribute("aria-expanded", "true");
                if (icon) icon.textContent = "–";
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });
});


// year control in FAQ
document.addEventListener("DOMContentLoaded", function () {
    const startYear = 2008;
    const currentYear = new Date().getFullYear();
    const years = currentYear - startYear;

    const yearsElement = document.getElementById("years-since-tracker");

    if (yearsElement) {
        yearsElement.textContent = years;
    }
});