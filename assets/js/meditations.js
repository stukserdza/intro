/**
 * check release date
 */
function isNew(releaseDate) {
  if (!releaseDate) return false;
  const now = new Date();
  const release = new Date(releaseDate);
  const diffDays = (now - release) / (1000 * 60 * 60 * 24);
  return diffDays <= 30;
}

document.addEventListener("DOMContentLoaded", () => {
  const MEDITATIONS_JSON = "assets/data/neuromeditations.json";

  fetch(MEDITATIONS_JSON)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load meditations: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      // ── FILTER DATA ───────────────────────────────────────────
      const packs = [...data.packs].filter((p) => p.price > 0).reverse();

      const neuromeditations = [...data.neuromeditations]
        .filter((m) => m.price > 0)
        .reverse();

      // ── MEDITATION CARDS ──────────────────────────────────────
      const medCardsContainer = document.getElementById("med-cards-container");
      if (medCardsContainer) {
        medCardsContainer.innerHTML = neuromeditations
          .map((m) => {
            const newLabel = isNew(m.releaseDate)
              ? `<div class="med-card-tag med-card-tag-new">NEW</div>`
              : "";
            return `
              <article class="med-card">
                <figure class="med-card-figure">
                  ${newLabel}
                  <img src="${m.image}" alt="${m.title}" class="med-card-image" loading="lazy">
                </figure>
                <h3 class="med-card-title">${m.title}</h3>
                <p class="med-card-text">${m.shortDescriptionCommon}</p>
                <div class="med-card-action">
                  <p class="med-card-price">${m.price.toLocaleString("ru-RU")} ₽</p>
                  <a href="${m.page}" class="btn-primary" aria-label="Подробнее о ${m.title}">
                    Подробнее
                  </a>
                </div>
              </article>`;
          })
          .join("");
      }

      // ── PACKS CAROUSEL ────────────────────────────────────────
      document.querySelectorAll(".med-packs-carousel").forEach((carousel) => {
        const track = carousel.querySelector(".med-packs-track");
        const btnPrev = carousel.querySelector(
          ".med-packs-nav-btn[data-dir='prev']",
        );
        const btnNext = carousel.querySelector(
          ".med-packs-nav-btn[data-dir='next']",
        );

        if (!track || !btnPrev || !btnNext) return;

        // build pack cards
        track.innerHTML = packs
          .map((pack) => {
            const newLabel = isNew(pack.releaseDate)
              ? `<div class="med-card-tag med-card-tag-new">NEW</div>`
              : "";
            return `
            <article class="med-packs-card" data-pack-id="${pack.id}">
              <div class="med-packs-card-content">
                <figure class="med-card-figure">
                  <div class="med-card-tag">Пакет нейромедитаций</div>
                  ${newLabel}
                  <img src="${pack.image}" alt="${pack.title}" class="med-packs-card-img" loading="lazy">
                </figure>
                <h3 class="med-packs-card-title">${pack.title}</h3>
                <p class="med-packs-card-desc">${pack.shortDescriptionCommon}</p>
                <div class="med-packs-card-footer">
                  <p class="med-packs-card-price">${pack.price.toLocaleString("ru-RU")} ₽</p>
                  <a href="${pack.page}" class="btn-primary med-packs-card-link">Подробнее</a>
                </div>
              </div>
            </article>`;
          })
          .join("");

        let cards = Array.from(track.querySelectorAll(".med-packs-card"));
        if (!cards.length) return;

        // ── HELPERS ───────────────────────────────────────────
        const getStep = () => {
          const card = cards[0];
          if (!card) return 0;
          const cardWidth = card.getBoundingClientRect().width;
          const gap = parseFloat(
            getComputedStyle(track).gap ||
              getComputedStyle(track).columnGap ||
              0,
          );
          return cardWidth + gap;
        };

        const getVisibleCount = () =>
          Math.max(1, Math.round(track.clientWidth / getStep()));

        // ── INFINITE SETUP ────────────────────────────────────
        const setupInfinite = () => {
          const visible = getVisibleCount();

          // clone first N and last N cards
          cards
            .slice(0, visible)
            .map((c) => c.cloneNode(true))
            .forEach((clone) => track.appendChild(clone));

          cards
            .slice(-visible)
            .map((c) => c.cloneNode(true))
            .reverse()
            .forEach((clone) => track.insertBefore(clone, track.firstChild));

          // refresh card list after cloning
          cards = Array.from(track.querySelectorAll(".med-packs-card"));

          // jump to first real card — deferred so layout is ready
          requestAnimationFrame(() => {
            track.scrollLeft = getStep() * visible;
          });
        };

        // ── SCROLL ────────────────────────────────────────────
        const scrollToDirection = (dir) => {
          const step = getStep();
          const visible = getVisibleCount();
          track.scrollBy({
            left: (dir === "next" ? 1 : -1) * step * visible,
            behavior: "smooth",
          });
        };

        // ── INFINITE EDGE FIX ─────────────────────────────────
        let jumpPending = false;

        const handleInfiniteScroll = () => {
          if (jumpPending) return;
          const step = getStep();
          const visible = getVisibleCount();
          const total = cards.length - visible * 2;

          if (track.scrollLeft >= step * (total + visible)) {
            jumpPending = true;
            track.scrollLeft = step * visible;
            jumpPending = false;
          } else if (track.scrollLeft <= 0) {
            jumpPending = true;
            track.scrollLeft = step * total;
            jumpPending = false;
          }
        };

        // ── RESIZE: recalculate scroll position, no reload ────
        let resizeTimer = null;
        const handleResize = () => {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(() => {
            const visible = getVisibleCount();
            // snap back to first real card after resize
            track.scrollLeft = getStep() * visible;
          }, 200); // debounce 200ms — ignores mobile address-bar flicker
        };

        // ── EVENTS ────────────────────────────────────────────
        btnPrev.addEventListener("click", () => scrollToDirection("prev"));
        btnNext.addEventListener("click", () => scrollToDirection("next"));
        track.addEventListener("scroll", handleInfiniteScroll, {
          passive: true,
        });
        window.addEventListener("resize", handleResize);

        // ── INIT ──────────────────────────────────────────────
        setupInfinite();
      });
    })
    .catch((err) => {
      console.error(err);
      document.querySelectorAll(".med-packs-track").forEach((track) => {
        track.innerHTML = `<p class="med-packs-error">Не удалось загрузить пакеты медитаций</p>`;
      });
    });
});
