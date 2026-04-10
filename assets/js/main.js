/**
 * LOADING DOMContentLoaded
 */
document.addEventListener("DOMContentLoaded", function () {
  const REVIEWS_JSON_PATH = "assets/data/reviews.json";

  const carousel = document.querySelector(".testimonials-carousel");
  if (!carousel) return;

  const track = carousel.querySelector("#testimonials-track");
  const btnPrev = carousel.querySelector("[data-dir='prev']");
  const btnNext = carousel.querySelector("[data-dir='next']");

  if (!track) return;

  // Fisher–Yates shuffle
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  fetch(REVIEWS_JSON_PATH)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to load reviews: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      const randomized = shuffle([...data]);

      track.innerHTML = randomized
        .map(
          (item) => `
        <article class="testimonial-card">
            <div class="testimonial-author">${item.author}</div>
            <p class="testimonial-text">${item.text}</p>
        </article>
    `,
        )
        .join("");

      const cards = track.querySelectorAll(".testimonial-card");
      if (!cards.length) return;

      let currentIndex = 0;

      function getCardWidth() {
        return (
          cards[0].offsetWidth +
          parseFloat(getComputedStyle(cards[0]).marginRight || 0)
        );
      }

      function scrollTo(index) {
        const cardWidth = getCardWidth();

        // Going forward from last → go to first
        if (index >= cards.length) {
          // jump instantly without animation
          track.style.scrollBehavior = "auto";
          track.scrollLeft = 0;

          // force reflow (important!)
          track.offsetHeight;

          // restore smooth
          track.style.scrollBehavior = "smooth";

          currentIndex = 0;
          return;
        }

        // Going backward from first → go to last
        if (index < 0) {
          track.style.scrollBehavior = "auto";
          currentIndex = cards.length - 1;
          track.scrollLeft = currentIndex * cardWidth;

          track.offsetHeight;

          track.style.scrollBehavior = "smooth";
          return;
        }

        // Normal movement
        currentIndex = index;
        track.scrollTo({
          left: currentIndex * cardWidth,
          behavior: "smooth",
        });
      }

      btnPrev?.addEventListener("click", () => scrollTo(currentIndex - 1));
      btnNext?.addEventListener("click", () => scrollTo(currentIndex + 1));
    })
    .catch((err) => {
      console.error(err);
      track.innerHTML = `<p class="testimonial-error">Не удалось загрузить отзывы</p>`;
    });

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
      const processedData = data.map((item) => ({
        ...item,
        answer: item.answer.replace(/{{years}}/g, years),
      }));

      // Render
      faqList.innerHTML = processedData
        .map(
          (item) => `
                <article class="faq-item">
                    <button class="faq-question" aria-expanded="false">
                        <span>${item.question}</span>
                        <span class="faq-icon">+</span>
                    </button>
                    <div class="faq-answer">
                        <p>${item.answer}</p>
                    </div>
                </article>
            `,
        )
        .join("");
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
    faqList.querySelectorAll(".faq-item.is-open").forEach((openItem) => {
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
