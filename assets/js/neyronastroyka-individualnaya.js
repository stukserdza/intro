document.addEventListener("DOMContentLoaded", function () {
  const REVIEWS_JSON_PATH = "../assets/data/neyronastroyka-individualnaya.json";

  const carousel = document.getElementById("med-ind-testimonials-carousel");
  if (!carousel) return;

  const track = carousel.querySelector("#testimonials-track");
  const btnPrev = document.querySelector("[data-dir='prev']");
  const btnNext = document.querySelector("[data-dir='next']");

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
      if (!data || !data.length) return;

      const randomized = shuffle([...data]);

      // Multiply items (clone 3 times) to ensure enough track length for infinite scrolling
      const itemsToRender = [...randomized, ...randomized, ...randomized];

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

      // Start in the middle set of cloned items
      let currentIndex = realCount;

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

      // Initial positioning to center group (without animation)
      requestAnimationFrame(() => {
        track.scrollLeft = currentIndex * getCardStep();
      });

      function scrollTo(targetIndex) {
        const step = getCardStep();

        // Perform smooth scroll to target
        track.scrollTo({
          left: targetIndex * step,
          behavior: "smooth",
        });

        currentIndex = targetIndex;
      }

      // Seamless Reset when reaching edge sets
      let isAdjusting = false;
      track.addEventListener(
        "scroll",
        () => {
          if (isAdjusting) return;

          const step = getCardStep();
          if (step <= 0) return;

          const currentPos = Math.round(track.scrollLeft / step);

          // If scrolled into the first set, jump silently to middle set
          if (currentPos < realCount / 2) {
            isAdjusting = true;
            currentIndex = currentPos + realCount;
            track.scrollLeft = currentIndex * step;
            setTimeout(() => (isAdjusting = false), 50);
          }
          // If scrolled into the last set, jump silently to middle set
          else if (currentPos >= realCount * 2) {
            isAdjusting = true;
            currentIndex = currentPos - realCount;
            track.scrollLeft = currentIndex * step;
            setTimeout(() => (isAdjusting = false), 50);
          } else {
            currentIndex = currentPos;
          }
        },
        { passive: true },
      );

      btnPrev?.addEventListener("click", () => {
        scrollTo(currentIndex - getVisibleCount());
      });

      btnNext?.addEventListener("click", () => {
        scrollTo(currentIndex + getVisibleCount());
      });
    })
    .catch((err) => {
      console.error(err);
      track.innerHTML = `<p class="testimonial-error">Не удалось загрузить отзывы</p>`;
    });
});
