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

document.addEventListener("DOMContentLoaded", function () {
    const FAQ_JSON_PATH = "assets/data/faq.json";

    const startYear = 2008;
    const currentYear = new Date().getFullYear();
    const years = currentYear - startYear;

    const faqList = document.getElementById("faq-list");
    if (!faqList) return;

    fetch(FAQ_JSON_PATH)
        .then((res) => {
            if (!res.ok) {
                throw new Error(`Failed to load FAQ: ${res.status}`);
            }
            return res.json();
        })
        .then((data) => {
            // Replace {{years}}
            const processedData = data.map(item => ({
                ...item,
                answer: item.answer.replace(/{{years}}/g, years)
            }));

            // Render
            faqList.innerHTML = processedData.map(item => `
                <article class="faq-item">
                    <button class="faq-question" aria-expanded="false">
                        <span>${item.question}</span>
                        <span class="faq-icon">+</span>
                    </button>
                    <div class="faq-answer">
                        <p>${item.answer}</p>
                    </div>
                </article>
            `).join("");
        })
        .catch((err) => {
            console.error(err);
            faqList.innerHTML = `<p class="faq-error">Не удалось загрузить FAQ</p>`;
        });

    // Accordion (event delegation)
    faqList.addEventListener("click", function (e) {
        const question = e.target.closest(".faq-question");
        if (!question) return;

        const item = question.closest(".faq-item");
        const answer = item.querySelector(".faq-answer");
        const icon = question.querySelector(".faq-icon");

        const isOpen = item.classList.contains("is-open");

        // Close all
        faqList.querySelectorAll(".faq-item.is-open").forEach(openItem => {
            openItem.classList.remove("is-open");

            const q = openItem.querySelector(".faq-question");
            const a = openItem.querySelector(".faq-answer");
            const i = openItem.querySelector(".faq-icon");

            q?.setAttribute("aria-expanded", "false");
            if (i) i.textContent = "+";
            if (a) a.style.maxHeight = "0";
        });

        // Open clicked
        if (!isOpen) {
            item.classList.add("is-open");
            question.setAttribute("aria-expanded", "true");
            if (icon) icon.textContent = "–";
            answer.style.maxHeight = answer.scrollHeight + "px";
        }
    });
});