/**
 * blog.js
 * Loads blog-articles.json, renders article cards,
 * handles category filtering, and builds the topics cloud.
 */

(function () {
  "use strict";

  const JSON_PATH = "assets/data/blog_articles.json";
  const BASE_URL = "https://stukserdza.com/";
  const SPARKLE_SVG = `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <path d="M32 8 C35 22, 42 30, 56 32 C42 34, 35 42, 32 56 C29 42, 22 34, 8 32 C22 30, 29 22, 32 8Z" fill="#fde885"/>
  </svg>`;

  /* ── CATEGORY LABELS ───────────────────────────────────── */
  const CATEGORY_LABELS = {
    tarot: "Таро",
    meditations: "Медитации",
    relationships: "Отношения",
    energy: "Энергетика",
    selfdevelopment: "Саморазвитие",
    feminine: "Женская энергия",
    money: "Деньги",
    subconsciousness: "Подсознание",
  };

  /* ── STATE ─────────────────────────────────────────────── */
  let allArticles = [];
  let activeCategory = "all";

  /* ── DOM refs ──────────────────────────────────────────── */
  const grid = document.getElementById("blog-grid");
  const filtersNav = document.getElementById("blog-filters");
  const topicsGrid = document.getElementById("blog-topics-grid");

  /* ── HELPERS ───────────────────────────────────────────── */
  function isNewArticle(releaseDate) {
    if (!releaseDate) return false;
    const diff = (Date.now() - new Date(releaseDate)) / (1000 * 60 * 60 * 24);
    return diff <= 30;
  }

  function buildImage(article, isFeatured) {
    const pic = article.picture || "";
    const alt = article.title;
    if (pic.startsWith("http")) {
      return `<img src="${pic}" alt="${alt}" class="blog-card-img" loading="${isFeatured ? "eager" : "lazy"}">`;
    }
    if (pic) {
      return `<img src="assets/images/blog/${pic}" alt="${alt}" class="blog-card-img" loading="${isFeatured ? "eager" : "lazy"}">`;
    }
    /* fallback placeholder */
    return `<div class="blog-card-img-placeholder" aria-hidden="true">${SPARKLE_SVG}</div>`;
  }

  function buildCard(article, isFeatured) {
    const categoryLabel =
      CATEGORY_LABELS[article.category] || article.label || article.category;
    const newBadge = isNewArticle(article.releaseDate)
      ? `<span class="blog-card-new">NEW</span>`
      : "";
    const featured = isFeatured ? " blog-card--featured" : "";
    const href = article.path || `blog/${article.slug}.html`;

    return `
      <article class="blog-card${featured}" itemscope itemtype="https://schema.org/Article">
        ${buildImage(article, isFeatured)}
        <div class="blog-card-body">
          <div class="blog-card-meta">
            <span class="blog-card-category">${categoryLabel}</span>
            ${newBadge}
          </div>
          <h2 class="blog-card-title" itemprop="headline">${article.title}</h2>
          <p class="blog-card-excerpt" itemprop="description">${article.shortDescription || ""}</p>
          <a href="${href}" class="blog-card-link"
             aria-label="Читать статью: ${article.title}"
             itemprop="url">
            Читать статью
          </a>
        </div>
      </article>`;
  }

  /* ── RENDER GRID ───────────────────────────────────────── */
  function renderGrid(articles) {
    if (!articles.length) {
      grid.innerHTML = `<p class="blog-empty">Статей в этой категории пока нет.</p>`;
      return;
    }

    /* First visible article gets the featured (wide) style */
    grid.innerHTML = articles.map((a, i) => buildCard(a, i === 0)).join("");
  }

  /* ── FILTER ────────────────────────────────────────────── */
  function applyFilter(category) {
    activeCategory = category;

    /* update button states */
    filtersNav.querySelectorAll(".blog-filter-btn").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.category === category);
    });

    const visible =
      category === "all"
        ? allArticles
        : allArticles.filter((a) => a.category === category);

    /* quick fade transition */
    grid.style.opacity = "0";
    grid.style.transition = "opacity 0.2s ease";
    setTimeout(() => {
      renderGrid(visible);
      grid.style.opacity = "1";
    }, 180);
  }

  /* ── TOPICS CLOUD ──────────────────────────────────────── */
  function buildTopics(articles) {
    /* count articles per category */
    const counts = {};
    articles.forEach((a) => {
      counts[a.category] = (counts[a.category] || 0) + 1;
    });

    /* build topic items — clicking filters the grid */
    topicsGrid.innerHTML = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, count]) => {
        const label = CATEGORY_LABELS[cat] || cat;
        const plural = count === 1 ? "статья" : count < 5 ? "статьи" : "статей";
        return `
          <button class="blog-topic-item" data-category="${cat}" aria-label="Показать статьи: ${label}">
            <span class="blog-topic-name">${label}</span>
            <span class="blog-topic-count">${count} ${plural}</span>
          </button>`;
      })
      .join("");

    /* topic click → filter */
    topicsGrid.addEventListener("click", (e) => {
      const btn = e.target.closest(".blog-topic-item");
      if (!btn) return;
      const cat = btn.dataset.category;
      applyFilter(cat);
      /* scroll up to grid */
      document
        .getElementById("articles")
        .scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /* ── FILTER BUTTON EVENTS ──────────────────────────────── */
  filtersNav.addEventListener("click", (e) => {
    const btn = e.target.closest(".blog-filter-btn");
    if (!btn) return;
    applyFilter(btn.dataset.category);
  });

  /* ── FETCH & INIT ──────────────────────────────────────── */
  fetch(JSON_PATH)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then((data) => {
      console.log(data);
      /* only active, approved articles; newest first */
      allArticles = data
        .filter((a) => a.active !== false && a.approved !== false)
        .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));

      renderGrid(allArticles);
      buildTopics(allArticles);
    })
    .catch((err) => {
      console.error("blog.js: failed to load articles", err);
      grid.innerHTML = `<p class="blog-empty">Не удалось загрузить статьи. Обновите страницу.</p>`;
    });
})();
