const JSON_PATH = "assets/data/readings.json"; // adjust path if needed
const START_INDEX = 1; // which menu item is active on load (0-based)
const ITEM_H = 52; // must match --item-height in CSS
const N_PLACEHOLDER = 0; // filled after JSON loads
let MENU_DATA = [];
let N = 0;
let current = START_INDEX;
let offsetY = 0;
let animTarget = 0;
const vp = document.getElementById("cylinder-viewport");
const panelsWrap = document.getElementById("readings-panels");
let els = [];
let panels = [];
const ANIM_MS = 280;
let rafId = null,
  animStart = null,
  animFrom = 0;

function ease(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function tick(ts) {
  if (!animStart) animStart = ts;
  const t = Math.min((ts - animStart) / ANIM_MS, 1);
  offsetY = animFrom + (animTarget - animFrom) * ease(t);
  render();
  if (t < 1) rafId = requestAnimationFrame(tick);
  else {
    rafId = null;
    animStart = null;
    offsetY = animTarget;
    render();
  }
}

function startAnim(to) {
  animFrom = offsetY;
  animTarget = to;
  animStart = null;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(tick);
}

/* ── NAVIGATION ──────────────────────────────────────── */
function goTo(idx) {
  idx = ((idx % N) + N) % N;
  if (idx === current) return;
  const delta = (() => {
    let d = idx - current;
    if (d > N / 2) d -= N;
    if (d < -N / 2) d += N;
    return d;
  })();
  current = idx;
  startAnim(animTarget - delta * ITEM_H);
  updatePanels();
}

/* ── RENDER CYLINDER ─────────────────────────────────── */
function render() {
  const vpH = vp.offsetHeight || ITEM_H * 3;
  const center = vpH / 2;

  for (let i = 0; i < N; i++) {
    const rawDist = (((i - current) % N) + N) % N;
    const logicalDist = Math.min(rawDist, N - rawDist);

    let slotOffset = 0;
    if (logicalDist !== 0) {
      const wrapped = (((i - current) % N) + N) % N;
      slotOffset = wrapped === N - 1 ? -1 : 1;
      if (logicalDist === 2) slotOffset *= 2;
    }

    const itemY = center + slotOffset * ITEM_H;
    els[i].style.top = itemY - ITEM_H / 2 + "px";
    els[i].style.opacity =
      logicalDist === 0
        ? 1
        : logicalDist === 1
          ? 0.6
          : logicalDist === 2
            ? 0.2
            : 0;

    els[i].classList.remove("is-active", "prev", "next");
    if (logicalDist === 0) els[i].classList.add("is-active");
    else if (logicalDist === 1) {
      const w = (((i - current) % N) + N) % N;
      els[i].classList.add(w === N - 1 ? "prev" : "next");
    }
  }
}

/* ── PANELS ──────────────────────────────────────────── */
function updatePanels() {
  const activeTarget = MENU_DATA[current].id;
  panels.forEach((p) => {
    const on = p.dataset.panel === activeTarget;
    p.classList.toggle("is-active", on);
    if (on) setupCarousel(p);
  });
}

/* ── CAROUSEL ────────────────────────────────────────── */
// function setupCarousel(panel) {
//   const carousel = panel.querySelector("[data-carousel]");
//   if (!carousel || carousel.dataset.ready === "true") return;

//   const track = carousel.querySelector(".readings-track");
//   const cards = Array.from(track.children);
//   const prevBtn = carousel.querySelector('.readings-nav-btn[data-dir="prev"]');
//   const nextBtn = carousel.querySelector('.readings-nav-btn[data-dir="next"]');
//   let idx = 0;

//   function cw() {
//     return (
//       cards[0].offsetWidth + (parseFloat(getComputedStyle(track).gap) || 0)
//     );
//   }

//   function update() {
//     track.style.transform = `translateX(-${idx * cw()}px)`;
//     prevBtn.disabled = idx === 0;
//     nextBtn.disabled = idx >= cards.length - 1;
//     prevBtn.classList.toggle("is-disabled", idx === 0);
//     nextBtn.classList.toggle("is-disabled", idx >= cards.length - 1);
//   }
//   prevBtn.addEventListener("click", () => {
//     if (idx > 0) {
//       idx--;
//       update();
//     }
//   });
//   nextBtn.addEventListener("click", () => {
//     if (idx < cards.length - 1) {
//       idx++;
//       update();
//     }
//   });
//   window.addEventListener("resize", update);
//   carousel.dataset.ready = "true";
//   update();
// }

function setupCarousel(panel) {
  const carousel = panel.querySelector("[data-carousel]");
  if (!carousel || carousel.dataset.ready === "true") return;

  const track = carousel.querySelector(".readings-track");
  const prevBtn = carousel.querySelector('.readings-nav-btn[data-dir="prev"]');
  const nextBtn = carousel.querySelector('.readings-nav-btn[data-dir="next"]');

  let cards = [];
  let idx = 0;

  // =========================
  // STEP SIZE (safe)
  // =========================
  function cw() {
    const first = track.querySelector(".reading-card");
    if (!first) return 0;

    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return first.getBoundingClientRect().width + gap;
  }

  // =========================
  // VISIBLE COUNT (safe + stable)
  // =========================
  function getVisible() {
    const step = cw();
    if (!step) return 1;

    const width = track.getBoundingClientRect().width;
    return Math.max(1, Math.round(width / step));
  }

  // =========================
  // RENDER
  // =========================
  function update(animate = true) {
    const step = cw();

    track.style.transition = animate ? "transform 300ms ease" : "none";
    track.style.transform = `translateX(-${idx * step}px)`;
  }

  // =========================
  // MOVE
  // =========================
  function move(dir) {
    const visible = getVisible();
    idx += dir * visible;
    update(true);
  }

  // =========================
  // LOOP FIX
  // =========================
  function fixLoop() {
    const visible = getVisible();
    const totalOriginal = cards.length - visible * 2;

    if (idx >= totalOriginal + visible) {
      idx = visible;
      update(false);
    }

    if (idx < visible) {
      idx = totalOriginal + visible - 1;
      update(false);
    }
  }

  // =========================
  // INFINITE INIT (SAFE)
  // =========================
  function initInfinite() {
    const originals = Array.from(track.children);
    cards = originals;

    const visible = getVisible();

    if (!visible || cards.length < 2) return;

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

  // =========================
  // EVENTS
  // =========================
  prevBtn?.addEventListener("click", () => move(-1));
  nextBtn?.addEventListener("click", () => move(1));

  track.addEventListener("transitionend", fixLoop);

  window.addEventListener("resize", () => {
    // reset and rebuild safely
    const originals = Array.from(track.querySelectorAll(".reading-card"));

    track.innerHTML = "";
    originals.forEach((c) => track.appendChild(c));

    initInfinite();
  });

  // =========================
  // CRITICAL FIX: WAIT FOR LAYOUT
  // =========================
  carousel.dataset.ready = "true";

  window.addEventListener("load", () => {
    requestAnimationFrame(() => {
      initInfinite();
    });
  });
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
      <p class="readings-panel-subtitle">${panelData.subtitle}</p>
      <div class="readings-panel-category">${panelData.category}</div>
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

  /* nav buttons */
  carousel.innerHTML += `
    <div class="readings-carousel-header">
      <button class="readings-nav-btn" type="button" data-dir="prev" aria-label="Предыдущий расклад">
        <img src="https://res.cloudinary.com/dcstupoud/image/upload/v1775964724/arrow_left_ubopbz.svg" alt="Предыдущий расклад">
      </button>
      <button class="readings-nav-btn" type="button" data-dir="next" aria-label="Следующий расклад">
        <img src="https://res.cloudinary.com/dcstupoud/image/upload/v1775964724/arrow_right_whxl58.svg" alt="Следующий расклад">
      </button>
    </div>`;

  section.appendChild(carousel);
  return section;
}

function buildCard(card) {
  const article = document.createElement("article");
  article.className = "reading-card";

  const hasQuestions = card.questions && card.questions.length > 0;

  const questionsHTML = hasQuestions
    ? `
    <button class="reading-toggle-btn" type="button" aria-expanded="false">
      <img src="assets/images/icons/arrow.svg" alt="Показать список" class="reading-toggle-icon">
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
  document.getElementById("readingsSwitcher").addEventListener("click", (e) => {
    const btn = e.target.closest(".readings-roll-btn");
    if (!btn) return;
    goTo(btn.dataset.dir === "up" ? current - 1 : current + 1);
  });

  let wheelLocked = false;
  document.getElementById("readingsSwitcher").addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      if (wheelLocked) return;
      wheelLocked = true;
      goTo(current + (e.deltaY > 0 ? 1 : -1));
      setTimeout(() => (wheelLocked = false), ANIM_MS + 60);
    },
    {
      passive: false,
    },
  );

  let touchY = null;
  document.getElementById("readingsSwitcher").addEventListener(
    "touchstart",
    (e) => {
      touchY = e.touches[0].clientY;
    },
    {
      passive: true,
    },
  );
  document
    .getElementById("readingsSwitcher")
    .addEventListener("touchend", (e) => {
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
