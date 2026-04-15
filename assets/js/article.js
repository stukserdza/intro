document.addEventListener("DOMContentLoaded", async () => {
  /* ── SPARKLE SVG ─────────────────────────────────────────── */
  const SPARKLE = `
      <span class="sparkle" aria-hidden="true">
        <svg viewBox="0 0 64 64">
          <path d="M32 6 C34 18, 38 26, 58 32 C38 38, 34 46, 32 58 C30 46, 26 38, 6 32 C26 26, 30 18, 32 6Z"/>
        </svg>
      </span>`;

  const startYear = 2008;
  const currentYear = new Date().getFullYear();
  const years = currentYear - startYear;
  try {
    const response = await fetch("../assets/data/blog_articles.json");
    const articles = await response.json();
    const validArticles = articles.filter((article) => {
      return article.approved === true && article.active === true;
    });
    // 1. GET SLUG FROM URL
    const path = window.location.pathname;
    const fileName = path.split("/").pop().replace(".html", "");
    const article = validArticles.find((a) => a.slug === fileName);
    function isNewArticle(dateString) {
      const articleDate = new Date(dateString);
      const diffTime = today - articleDate;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      return diffDays <= 30;
    }
    if (!article) {
      console.error("Article not found");
      return;
    }
    const today = new Date();

    // =========================
    // ✅ HEAD SEO INJECTION
    // =========================
    document.title = `Сурия | Стук сердца | Блог — ${article.title}`;

    setMeta("description", article.shortDescription);

    setMetaProperty("og:title", article.title);
    setMetaProperty("og:description", article.shortDescription);
    setMetaProperty("og:url", `https://stukserdza.com/${article.path}`);
    setMetaProperty("og:image", article.picture);

    setMeta("twitter:title", article.title);
    setMeta("twitter:description", article.shortDescription);
    setMeta("twitter:image", article.picture);

    setCanonical(`https://stukserdza.com/${article.path}`);

    // =========================
    // ✅ HERO SECTION
    // =========================
    const figure = document.querySelector(".article-img__wrapper");

    // clear in case something exists
    figure.innerHTML = "";

    const img = document.createElement("img");
    img.src = article.picture;
    img.alt = article.title;
    img.className = "article-hero__image";
    // NEW badge (top-right)
    if (isNewArticle(article.releaseDate)) {
      const badge = document.createElement("div");
      badge.className = "article-img__new-badge";
      badge.textContent = "NEW";

      figure.appendChild(badge);
    }
    figure.appendChild(img);
    document.querySelector(".article-hero__label").textContent = article.label;
    document.querySelector(".section-title").textContent = article.title;

    document.querySelector(".article-meta span").textContent =
      article.readTime + " чтения";

    const timeEl = document.querySelector("time");
    timeEl.setAttribute("datetime", article.releaseDate);
    timeEl.textContent = formatDate(article.releaseDate);

    // =========================
    // ✅ ARTICLE CONTENT
    // =========================
    const contentContainer = document.querySelector(".article-content");
    contentContainer.innerHTML = "";

    // INTRO
    article.article.article_intro?.forEach((p) => {
      contentContainer.appendChild(createParagraph(p));
    });

    // BASE SECTIONS
    article.article.article_base?.forEach((section) => {
      const h2 = document.createElement("h2");
      h2.textContent = section.subtitle;
      contentContainer.appendChild(h2);

      section.paragraphs.forEach((p) => {
        contentContainer.appendChild(createParagraph(p));
      });
    });

    // =========================
    // ✅ FAQ
    // =========================
    if (article.article.faq_section) {
      const faqTitle = document.createElement("h2");
      faqTitle.textContent = article.article.faq_section.title;
      contentContainer.appendChild(faqTitle);

      const faqWrapper = document.createElement("div");
      faqWrapper.className = "faq";

      article.article.faq_section.faq_base.forEach((faq) => {
        const item = document.createElement("div");
        item.className = "faq-item";

        const q = document.createElement("h3");
        q.textContent = faq.faq_question;

        const a = document.createElement("p");
        a.textContent = faq.faq_answer;

        item.appendChild(q);
        item.appendChild(a);
        faqWrapper.appendChild(item);
      });

      contentContainer.appendChild(faqWrapper);
    }

    // =========================
    // ✅ SIGNATURE
    // =========================
    const signature = document.querySelector(".article-signature h2");
    signature.textContent = replaceYears(article.signature);

    // =========================
    // ✅ TAGS
    // =========================
    const tagsContainer = document.querySelector(".article-tags");
    tagsContainer.innerHTML = "";
    article.tags.forEach((tag, index) => {
      const isLast = index === article.tags.length - 1;
      const tagH2 = document.createElement("h2");
      tagH2.className = "tag";
      tagH2.textContent = tag;
      tagsContainer.appendChild(tagH2);
      if (!isLast) {
        const span = document.createElement("span");
        span.className = "tag-dot";
        span.innerHTML = SPARKLE;
        tagsContainer.appendChild(span);
      }
    });
  } catch (err) {
    console.error("Error loading article:", err);
  }

  // =========================
  // HELPERS
  // =========================

  function createParagraph(text) {
    const p = document.createElement("p");
    p.innerHTML = replaceYears(text);
    return p;
  }

  function replaceYears(text) {
    return text.replace(/{{years}}/g, years);
  }

  function setMeta(name, content) {
    let tag = document.querySelector(`meta[name="${name}"]`);
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", name);
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", content);
  }

  function setMetaProperty(property, content) {
    let tag = document.querySelector(`meta[property="${property}"]`);
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("property", property);
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", content);
  }

  function setCanonical(url) {
    let link = document.querySelector("link[rel='canonical']");
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", url);
  }

  function formatDate(dateString) {
    const date = new Date(dateString);

    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
});
