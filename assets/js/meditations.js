document.addEventListener("DOMContentLoaded", () => {
  const MEDITATIONS_JSON = "assets/data/neuromeditations.json";

  fetch(MEDITATIONS_JSON)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load meditations: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      const packs = data.packs;
      console.log(packs);

      document.querySelectorAll(".med-packs-carousel").forEach((carousel) => {
        const track = carousel.querySelector(".med-packs-track");
        const btnPrev = carousel.querySelector(
          ".med-packs-nav-btn[data-dir='prev']",
        );
        const btnNext = carousel.querySelector(
          ".med-packs-nav-btn[data-dir='next']",
        );

        if (!track || !btnPrev || !btnNext) return;

        // ── BUILD CARDS FROM JSON ──────────────────────────────
        track.innerHTML = packs
          .map(
            (pack) => `
          <article class="med-packs-card" data-pack-id="${pack.id}">
            <div class="med-packs-card-img-wrap">
              <img
                src="${pack.image}"
                alt="${pack.title}"
                class="med-packs-card-img"
                loading="lazy"
              >
            </div>
            <div class="med-packs-card-content">
              <p class="med-packs-card-badge">Пакет нейромедитаций</p>
              <h3 class="med-packs-card-title">${pack.title}</h3>
              <p class="med-packs-card-desc">${pack.shortDescription}</p>
              <div class="med-packs-card-footer">
                <p class="med-packs-card-price">${pack.price.toLocaleString("ru-RU")} ₽</p>
                <a href="${pack.page}" class="btn-primary med-packs-card-link">
                  Подробнее
                </a>
              </div>
            </div>
          </article>
        `,
          )
          .join("");

        let cards = Array.from(track.querySelectorAll(".med-packs-card"));
        if (!cards.length) return;

        // ── STEP SIZE ─────────────────────────────────────────
        const getStep = () => {
          const firstCard = cards[0];
          if (!firstCard) return 0;
          const cardWidth = firstCard.getBoundingClientRect().width;
          const gap = parseFloat(
            getComputedStyle(track).gap ||
              getComputedStyle(track).columnGap ||
              0,
          );
          return cardWidth + gap;
        };

        // ── VISIBLE COUNT ─────────────────────────────────────
        const getVisibleCount = () => {
          const step = getStep();
          return Math.max(1, Math.round(track.clientWidth / step));
        };

        // ── INFINITE SETUP (CLONES) ───────────────────────────
        const setupInfinite = () => {
          const visible = getVisibleCount();

          const firstClones = cards
            .slice(0, visible)
            .map((c) => c.cloneNode(true));
          const lastClones = cards
            .slice(-visible)
            .map((c) => c.cloneNode(true));

          firstClones.forEach((clone) => track.appendChild(clone));
          lastClones
            .reverse()
            .forEach((clone) => track.insertBefore(clone, track.firstChild));

          // refresh after cloning
          cards = Array.from(track.querySelectorAll(".med-packs-card"));

          track.scrollLeft = getStep() * visible;
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
        const handleInfiniteScroll = () => {
          const step = getStep();
          const visible = getVisibleCount();
          const totalOriginal = cards.length - visible * 2;

          if (track.scrollLeft >= step * (totalOriginal + visible)) {
            track.scrollLeft = step * visible;
          }
          if (track.scrollLeft <= 0) {
            track.scrollLeft = step * totalOriginal;
          }
        };

        // ── EVENTS ────────────────────────────────────────────
        btnPrev.addEventListener("click", () => scrollToDirection("prev"));
        btnNext.addEventListener("click", () => scrollToDirection("next"));
        track.addEventListener("scroll", handleInfiniteScroll, {
          passive: true,
        });
        window.addEventListener("resize", () => location.reload());

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
