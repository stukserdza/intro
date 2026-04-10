document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".med-packs-carousel").forEach((carousel) => {
    const track = carousel.querySelector(".med-packs-track");
    let cards = Array.from(carousel.querySelectorAll(".med-packs-card"));

    const btnPrev = carousel.querySelector(
      ".med-packs-nav-btn[data-dir='prev']",
    );
    const btnNext = carousel.querySelector(
      ".med-packs-nav-btn[data-dir='next']",
    );

    if (!track || !cards.length || !btnPrev || !btnNext) return;

    // =========================
    // STEP SIZE CALCULATION
    // =========================
    const getStep = () => {
      const firstCard = cards[0];
      if (!firstCard) return 0;

      const cardWidth = firstCard.getBoundingClientRect().width;
      const styles = getComputedStyle(track);
      const gap = parseFloat(styles.gap || styles.columnGap || 0);

      return cardWidth + gap;
    };

    // =========================
    // VISIBLE CARDS COUNT
    // =========================
    const getVisibleCount = () => {
      const step = getStep();
      return Math.max(1, Math.round(track.clientWidth / step));
    };

    // =========================
    // INFINITE SETUP (CLONES)
    // =========================
    const setupInfinite = () => {
      const visible = getVisibleCount();

      const firstClones = cards
        .slice(0, visible)
        .map((card) => card.cloneNode(true));
      const lastClones = cards
        .slice(-visible)
        .map((card) => card.cloneNode(true));

      firstClones.forEach((clone) => track.appendChild(clone));
      lastClones
        .reverse()
        .forEach((clone) => track.insertBefore(clone, track.firstChild));

      // refresh cards list AFTER cloning
      cards = Array.from(track.querySelectorAll(".med-packs-card"));

      // jump to first real slide
      const step = getStep();
      track.scrollLeft = step * visible;
    };

    // =========================
    // SCROLL LOGIC
    // =========================
    const scrollToDirection = (dir) => {
      const step = getStep();
      const visible = getVisibleCount();

      const delta = (dir === "next" ? 1 : -1) * step * visible;

      track.scrollBy({
        left: delta,
        behavior: "smooth",
      });
    };

    // =========================
    // INFINITE EDGE FIX
    // =========================
    const handleInfiniteScroll = () => {
      const step = getStep();
      const visible = getVisibleCount();

      const totalOriginal = cards.length - visible * 2; // minus clones

      const maxOffset = step * (totalOriginal + visible);

      // right clone zone → jump back
      if (track.scrollLeft >= step * (totalOriginal + visible)) {
        track.scrollLeft = step * visible;
      }

      // left clone zone → jump forward
      if (track.scrollLeft <= 0) {
        track.scrollLeft = step * totalOriginal;
      }
    };

    // =========================
    // BUTTON EVENTS
    // =========================
    btnPrev.addEventListener("click", () => scrollToDirection("prev"));
    btnNext.addEventListener("click", () => scrollToDirection("next"));

    // =========================
    // EVENTS
    // =========================
    track.addEventListener("scroll", handleInfiniteScroll, { passive: true });

    window.addEventListener("resize", () => {
      // optional: re-init on resize for correct layout
      location.reload();
    });

    // =========================
    // INIT
    // =========================
    setupInfinite();
  });
});
