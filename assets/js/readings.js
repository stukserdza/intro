const JSON_PATH = "assets/data/readings.json"; // adjust path if needed
const START_INDEX = 1; // which menu item is active on load (0-based)
const ITEM_H = 52; // must match --item-height in CSS
let MENU_DATA = [];
let N = 0;
let current = START_INDEX;
let offsetY = 0;
let animTarget = 0;

const panelsWrap = document.getElementById("readings-panels");
const vp = document.getElementById("readingsViewport"); // Cylinder container element

let els = [];
let panels = [];
const ANIM_MS = 280;
let rafId = null,
  animStart = null,
  animFrom = 0;

/* ── CYLINDER RENDER & NAVIGATION LOGIC ───────────────── */
function render() {
  if (!els.length) return;
  els.forEach((el, index) => {
    el.classList.toggle("is-active", index === current);
    el.style.transform = `translateY(${offsetY + index * ITEM_H}px)`;
  });
}

function updatePanels() {
  panels.forEach((panel, idx) => {
    panel.classList.toggle("is-active", idx === current);
  });
}

function animate(timestamp) {
  if (!animStart) animStart = timestamp;
  const progress = Math.min((timestamp - animStart) / ANIM_MS, 1);
  const easeProgress = 0.5 - Math.cos(progress * Math.PI) / 2; // Ease in-out

  offsetY = animFrom + (animTarget - animFrom) * easeProgress;
  render();

  if (progress < 1) {
    rafId = requestAnimationFrame(animate);
  } else {
    rafId = null;
    animStart = null;
  }
}

function goTo(index) {
  if (index < 0 || index >= N || index === current) return;
  current = index;
  animFrom = offsetY;
  animTarget = -current * ITEM_H;

  if (rafId) cancelAnimationFrame(rafId);
  animStart = null;
  rafId = requestAnimationFrame(animate);

  updatePanels();
}

/* ── CAROUSEL ────────────────────────────────────────── */
function setupCarousel(panel) {
  const carousel = panel.querySelector("[data-carousel]");
  if (!carousel || carousel.dataset.ready === "true") return;

  const track = carousel.querySelector(".readings-track");
  const prevBtn = carousel.querySelector('.readings-nav-btn[data-dir="prev"]');
  const nextBtn = carousel.querySelector('.readings-nav-btn[data-dir="next"]');
  const navHeader = carousel.querySelector(".readings-carousel-header");

  let cards = Array.from(track.children);
  let idx = 0;

  // Single or zero cards: hide controls and return early
  if (cards.length <= 1) {
    if (navHeader) navHeader.style.display = "none";
    carousel.dataset.ready = "true";
    return;
  }

  // STEP SIZE
  function cw() {
    const first = track.querySelector(".reading-card");
    if (!first) return 0;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return first.getBoundingClientRect().width + gap;
  }

  // VISIBLE COUNT
  function getVisible() {
    const step = cw();
    if (!step) return 1;
    const width = track.getBoundingClientRect().width;
    return Math.max(1, Math.round(width / step));
  }

  // RENDER
  function update(animate = true) {
    const step = cw();
    track.style.transition = animate ? "transform 300ms ease" : "none";
    track.style.transform = `translateX(-${idx * step}px)`;
  }

  // MOVE
  function move(dir) {
    const visible = getVisible();
    idx += dir * visible;
    update(true);
  }

  // LOOP FIX
  function fixLoop() {
    const visible = getVisible();
    const totalOriginal = cards.length - visible * 2;

    if (totalOriginal <= 0) return; // Guard for non-cloned short lists

    if (idx >= totalOriginal + visible) {
      idx = visible;
      update(false);
    }

    if (idx < visible) {
      idx = totalOriginal + visible - 1;
      update(false);
    }
  }

  // INFINITE INIT
  function initInfinite() {
    const originals = Array.from(track.children);
    cards = originals;

    const visible = getVisible();

    // Prevent over-cloning if visible cards count is >= total cards available
    if (!visible || originals.length <= visible) {
      idx = 0;
      update(false);
      return;
    }

    const firstClones = originals
      .slice(0, visible)
      .map((c) => c.cloneNode(true));
    const lastClones = originals.slice(-visible).map((c) => c.cloneNode(true));

    lastClones
      .reverse()
      .forEach((c) => track.insertBefore(c, track.firstChild));
    firstClones.forEach((c) => track.appendChild(c));

    cards = Array.from(track.children);

    requestAnimationFrame(() => {
      idx = visible;
      update(false);
    });
  }

  // EVENTS
  prevBtn?.addEventListener("click", () => move(-1));
  nextBtn?.addEventListener("click", () => move(1));
  track.addEventListener("transitionend", fixLoop);

  window.addEventListener("resize", () => {
    const originals = Array.from(track.querySelectorAll(".reading-card"));
    track.innerHTML = "";
    originals.forEach((c) => track.appendChild(c));
    initInfinite();
  });

  carousel.dataset.ready = "true";

  // Execute immediately if DOM is ready, or on load
  if (document.readyState === "complete") {
    requestAnimationFrame(initInfinite);
  } else {
    window.addEventListener("load", () => {
      requestAnimationFrame(initInfinite);
    });
  }
}

/* ── BUILD DOM FROM JSON ─────────────────────────────── */
function buildPanel(panelData) {
  const section = document.createElement("div");
  section.className = "readings-panel";
  section.dataset.panel = panelData.id;

  /* head */
  section.innerHTML = `
    <div class="section-title readings-panel-head">
      <h2 class="readings-panel-title">${panelData.title}</h2>
    </div>`;

  /* carousel */
  const carousel = document.createElement("div");
  carousel.className = "readings-carousel";
  carousel.setAttribute("data-carousel", "");

  const viewport = document.createElement("div");
  viewport.className = "readings-viewport";

  const track = document.createElement("div");
  track.className = "readings-track";

  panelData.cards.forEach((card) => {
    track.appendChild(buildCard(card));
  });

  viewport.appendChild(track);
  carousel.appendChild(viewport);

  /* nav buttons (safely appended without breaking viewport references) */
  if (panelData.cards.length > 1) {
    const navHeader = document.createElement("div");
    navHeader.className = "readings-carousel-header";
    navHeader.innerHTML = `
      <button class="readings-nav-btn" type="button" data-dir="prev" aria-label="Предыдущий расклад">
        <img src="https://res.cloudinary.com/dcstupoud/image/upload/v1775964724/arrow_left_ubopbz.svg" alt="Предыдущий расклад">
      </button>
      <button class="readings-nav-btn" type="button" data-dir="next" aria-label="Следующий расклад">
        <img src="https://res.cloudinary.com/dcstupoud/image/upload/v1775964724/arrow_right_whxl58.svg" alt="Следующий расклад">
      </button>`;
    carousel.appendChild(navHeader);
  }

  section.appendChild(carousel);
  return section;
}

function buildCard(card) {
  const article = document.createElement("article");
  article.className = "reading-card";

  const questionsCount = card.questions ? card.questions.length : 0;

  const questionsHTML =
    questionsCount > 0
      ? `
    <button class="reading-toggle-btn" type="button" aria-expanded="false">
      <img src="https://res.cloudinary.com/dcstupoud/image/upload/v1775964724/arrow_cnfjpu.svg" alt="Показать список" class="reading-toggle-icon">
    </button>
    <ul class="reading-questions">
      ${card.questions.map((q) => `<li>${q}</li>`).join("")}
    </ul>`
      : "";

  article.innerHTML = `
    <h3 class="reading-title">${card.title}</h3>
    <p class="reading-text">${card.text}</p>
    ${questionsHTML}
    <div class="reading-footer">
      <p class="reading-price">${card.price}</p>
      <a href="#contact" class="btn-primary reading-link" aria-label="Запросить расклад">
        Запросить расклад
      </a>
    </div>`;

  return article;
}

function buildCylinder() {
  if (!vp) return;
  els = MENU_DATA.map((item, i) => {
    const btn = document.createElement("button");
    btn.className = "readings-roll-item";
    btn.textContent = item.label;
    btn.type = "button";
    btn.addEventListener("click", () => {
      if (i !== current) goTo(i);
    });
    vp.appendChild(btn);
    return btn;
  });
}

/* ── EVENTS ──────────────────────────────────────────── */
function bindEvents() {
  const switcher = document.getElementById("readingsSwitcher");
  if (!switcher) return;

  switcher.addEventListener("click", (e) => {
    const btn = e.target.closest(".readings-roll-btn");
    if (!btn) return;
    goTo(btn.dataset.dir === "up" ? current - 1 : current + 1);
  });

  let wheelLocked = false;
  switcher.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      if (wheelLocked) return;
      wheelLocked = true;
      goTo(current + (e.deltaY > 0 ? 1 : -1));
      setTimeout(() => (wheelLocked = false), ANIM_MS + 60);
    },
    { passive: false },
  );

  let touchY = null;
  switcher.addEventListener(
    "touchstart",
    (e) => {
      touchY = e.touches[0].clientY;
    },
    { passive: true },
  );
  switcher.addEventListener("touchend", (e) => {
    if (touchY === null) return;
    const dy = touchY - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 20) goTo(current + (dy > 0 ? 1 : -1));
    touchY = null;
  });

  /* toggle expand/collapse questions */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".reading-toggle-btn");
    if (!btn) return;
    const card = btn.closest(".reading-card");
    const list = card && card.querySelector(".reading-questions");
    if (!list) return;
    const isOpen = btn.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", isOpen);
    list.classList.toggle("is-open", isOpen);
  });
}

/* ── INIT ────────────────────────────────────────────── */
fetch(JSON_PATH)
  .then((r) => r.json())
  .then((data) => {
    MENU_DATA = data;
    N = data.length;
    current = Math.min(START_INDEX, N - 1);

    /* build panels */
    data.forEach((panelData) => {
      const el = buildPanel(panelData);
      panelsWrap.appendChild(el);
    });
    panels = Array.from(panelsWrap.querySelectorAll(".readings-panel"));

    /* build cylinder */
    buildCylinder();

    /* set initial scroll position */
    offsetY = -current * ITEM_H;
    animTarget = offsetY;

    /* initialise */
    panels.forEach(setupCarousel);
    render();
    updatePanels();
    bindEvents();
  })
  .catch((err) => console.error("Failed to load readings.json:", err));
