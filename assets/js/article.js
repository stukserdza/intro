document.addEventListener("DOMContentLoaded", init);

async function init() {
  const SPARKLE = `
    <span class="sparkle" aria-hidden="true">
      <svg viewBox="0 0 64 64">
        <path d="M32 6 C34 18, 38 26, 58 32 C38 38, 34 46, 32 58 C30 46, 26 38, 6 32 C26 26, 30 18, 32 6Z"/>
      </svg>
    </span>`;

  const today = new Date();
  const years = today.getFullYear() - 2008;

  // ✅ КЭШ DOM (очень важно)
  const DOM = {
    figure: document.querySelector(".article-img__wrapper"),
    label: document.querySelector(".article-hero__label"),
    title: document.querySelector(".section-title"),
    meta: document.querySelector(".article-meta span"),
    time: document.querySelector("time"),
    content: document.querySelector(".article-content"),
    signature: document.querySelector(".article-signature h2"),
    tags: document.querySelector(".article-tags"),
  };

  try {
    const res = await fetch("../assets/data/blog_articles.json");
    const articles = await res.json();

    const article = articles.find(
      (a) => a.approved && a.active && a.slug === getSlug(),
    );

    if (!article) return showError();

    injectSEO(article);
    renderHero(article);
    renderContent(article);
    renderFAQ(article);
    renderSignature(article);
    renderTags(article);
  } catch (e) {
    console.error(e);
    showError();
  }

  // =========================
  // RENDER FUNCTIONS
  // =========================

  function renderHero(article) {
    DOM.figure.innerHTML = "";

    const img = create("img", {
      src: article.picture,
      alt: article.title,
      className: "article-hero__image",
    });

    if (isNew(article.releaseDate)) {
      DOM.figure.appendChild(
        create("div", {
          className: "article-img__new-badge",
          textContent: "NEW",
        }),
      );
    }

    DOM.figure.appendChild(img);

    DOM.label.textContent = article.label;
    DOM.title.textContent = article.title;
    DOM.meta.textContent = `${article.readTime} чтения`;

    DOM.time.dateTime = article.releaseDate;
    DOM.time.textContent = formatDate(article.releaseDate);
  }

  function renderContent(article) {
    const fragment = document.createDocumentFragment();

    article.article.article_intro?.forEach((p) =>
      fragment.appendChild(createParagraph(p)),
    );

    article.article.article_base?.forEach((section) => {
      fragment.appendChild(create("h2", { textContent: section.subtitle }));

      section.paragraphs.forEach((p) =>
        fragment.appendChild(createParagraph(p)),
      );
    });

    DOM.content.innerHTML = "";
    DOM.content.appendChild(fragment);
  }

  function renderFAQ(article) {
    const faq = article.article.faq_section;
    if (!faq) return;

    const wrapper = create("div", { className: "faq" });

    faq.faq_base.forEach((f) => {
      const item = create("div", { className: "faq-item" });
      item.append(
        create("h3", { textContent: f.faq_question }),
        create("p", { textContent: f.faq_answer }),
      );
      wrapper.appendChild(item);
    });

    DOM.content.append(create("h2", { textContent: faq.title }), wrapper);
  }

  function renderSignature(article) {
    DOM.signature.textContent = replaceYears(article.signature);
  }

  function renderTags(article) {
    const fragment = document.createDocumentFragment();

    article.tags.forEach((tag, i) => {
      fragment.appendChild(
        create("h2", {
          className: "tag",
          textContent: tag,
        }),
      );

      if (i < article.tags.length - 1) {
        const span = create("span", { className: "tag-dot" });
        span.innerHTML = SPARKLE;
        fragment.appendChild(span);
      }
    });

    DOM.tags.innerHTML = "";
    DOM.tags.appendChild(fragment);
  }

  // =========================
  // SEO
  // =========================

  function injectSEO(article) {
    document.title = `Сурия | Стук сердца | Блог — ${article.title}`;

    setMetaTag("name", "description", article.shortDescription);
    setMetaTag("property", "og:title", article.title);
    setMetaTag("property", "og:description", article.shortDescription);
    setMetaTag("property", "og:url", fullUrl(article.path));
    setMetaTag("property", "og:image", article.picture);

    setMetaTag("name", "twitter:title", article.title);
    setMetaTag("name", "twitter:description", article.shortDescription);
    setMetaTag("name", "twitter:image", article.picture);

    setCanonical(fullUrl(article.path));
  }

  function setMetaTag(attr, key, content) {
    let tag = document.querySelector(`meta[${attr}="${key}"]`);
    if (!tag) {
      tag = create("meta");
      tag.setAttribute(attr, key);
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", content);
  }

  // =========================
  // HELPERS
  // =========================

  function create(tag, props = {}) {
    const el = document.createElement(tag);
    Object.assign(el, props);
    return el;
  }

  function createParagraph(text) {
    return create("p", {
      innerHTML: replaceYears(text),
    });
  }

  function replaceYears(text) {
    return text.replace(/{{years}}/g, years);
  }

  function getSlug() {
    return window.location.pathname.split("/").pop().replace(".html", "");
  }

  function isNew(date) {
    return (today - new Date(date)) / 86400000 <= 30;
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function setCanonical(url) {
    let link = document.querySelector("link[rel='canonical']");
    if (!link) {
      link = create("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = url;
  }

  function fullUrl(path) {
    return `https://stukserdza.com/${path}`;
  }

  function showError() {
    document.querySelector(".article-content").innerHTML =
      "<p>Статья не найдена</p>";
  }
}
