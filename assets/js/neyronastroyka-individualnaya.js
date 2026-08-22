document.addEventListener("DOMContentLoaded", function () {
  const REVIEWS_JSON_PATH = "../assets/data/neyronastroyka-individualnaya.json";

  const carousel = document.getElementById("med-ind-testimonials-carousel");
  if (!carousel) return;

  const track = carousel.querySelector("#testimonials-track");
  const btnPrev = document.querySelector("[data-dir='prev']");
  const btnNext = document.querySelector("[data-dir='next']");

  if (!track) return;

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  fetch(REVIEWS_JSON_PATH)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load reviews: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      if (!data || !data.length) return;

      const randomized = shuffle([...data]);

      // Clone 5 times instead of 3 to create a wider buffer zone
      const itemsToRender = [
        ...randomized,
        ...randomized,
        ...randomized,
        ...randomized,
        ...randomized,
      ];

      track.innerHTML = itemsToRender
        .map(
          (item) => `
        <article class="testimonial-card">
            <img src="${item.image}" alt="Отзыв клиента" class="testimonial-img" loading="lazy">
        </article>
      `,
        )
        .join("");

      const cards = track.querySelectorAll(".testimonial-card");
      const realCount = randomized.length;

      // Start in the middle set (set #3 out of 5)
      let currentIndex = realCount * 2;

      function getCardStep() {
        const style = getComputedStyle(cards[0]);
        const gap =
          parseFloat(style.marginRight) ||
          parseFloat(getComputedStyle(track).gap) ||
          0;
        return cards[0].offsetWidth + gap;
      }

      function getVisibleCount() {
        const carouselWidth = carousel.offsetWidth;
        const step = getCardStep();
        return Math.max(1, Math.round(carouselWidth / step));
      }

      // Initial centering without animation
      requestAnimationFrame(() => {
        track.scrollLeft = currentIndex * getCardStep();
      });

      function navigate(direction) {
        const step = getCardStep();
        const shift = getVisibleCount();

        // Standardize index within the middle group if user reached cloned edges
        if (currentIndex < realCount) {
          currentIndex += realCount * 2;
          track.scrollLeft = currentIndex * step;
        } else if (currentIndex >= realCount * 3) {
          currentIndex -= realCount * 2;
          track.scrollLeft = currentIndex * step;
        }

        // Force browser layout repaint before starting smooth transition
        void track.offsetWidth;

        // Calculate target position and perform smooth scroll
        const targetIndex =
          direction === "next" ? currentIndex + shift : currentIndex - shift;

        track.scrollTo({
          left: targetIndex * step,
          behavior: "smooth",
        });

        currentIndex = targetIndex;
      }

      btnPrev?.addEventListener("click", () => navigate("prev"));
      btnNext?.addEventListener("click", () => navigate("next"));
    })
    .catch((err) => {
      console.error(err);
      track.innerHTML = `<p class="testimonial-error">Не удалось загрузить отзывы</p>`;
    });
});
