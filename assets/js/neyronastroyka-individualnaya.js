document.addEventListener("DOMContentLoaded", function () {
  const REVIEWS_JSON_PATH = "../assets/data/neyronastroyka-individualnaya.json";

  const carousel = document.getElementById("med-ind-testimonials-carousel");
  if (!carousel) return;

  const track = carousel.querySelector("#testimonials-track");
  const btnPrev = document.querySelector("[data-dir='prev']");
  const btnNext = document.querySelector("[data-dir='next']");

  console.log(
    "Carousel:",
    carousel,
    "Track:",
    track,
    "Prev Button:",
    btnPrev,
    "Next Button:",
    btnNext,
  );

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

      // Generate image-based cards
      track.innerHTML = randomized
        .map(
          (item) => `
        <article class="testimonial-card">
            <img src="${item.image}" alt="Отзыв клиента" class="testimonial-img" loading="lazy">
        </article>
    `,
        )
        .join("");

      const cards = track.querySelectorAll(".testimonial-card");
      if (!cards.length) return;

      // FIX: Declare currentIndex here!
      let currentIndex = 0;

      function getCardWidth() {
        const style = getComputedStyle(cards[0]);
        // Include right gap/margin if present in CSS
        const gap =
          parseFloat(style.marginRight) ||
          parseFloat(getComputedStyle(track).gap) ||
          0;
        return cards[0].offsetWidth + gap;
      }

      function getVisibleCount() {
        const carouselWidth = carousel.offsetWidth;
        const cardWidth = getCardWidth();
        return Math.max(1, Math.round(carouselWidth / cardWidth));
      }

      function scrollTo(index) {
        const visible = getVisibleCount();
        const maxIndex = cards.length - visible;

        if (index < 0) {
          currentIndex = Math.max(0, maxIndex);
        } else if (index > maxIndex) {
          currentIndex = 0;
        } else {
          currentIndex = index;
        }

        track.scrollTo({
          left: currentIndex * getCardWidth(),
          behavior: "smooth",
        });
      }

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
