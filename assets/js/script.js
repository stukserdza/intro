/**
 * article.js
 * Renders full JSON structure into the article DOM elements.
 */
(function () {
  "use strict";

  const JSON_PATH = "../assets/data/blog_articles.json";

  function getSlugFromUrl() {
    const path = window.location.pathname;
    const filename = path.substring(path.lastIndexOf("/") + 1);
    return filename.replace(".html", "");
  }

  function renderArticle(data) {
    const slug = getSlugFromUrl();
    const article = data.find((a) => a.slug === slug || a.path.includes(slug));

    if (!article) return;

    // Render Hero Info
    const labelEl = document.querySelector(".article-hero__label");
    const titleEl = document.querySelector(".section-title");
    const signatureEl = document.querySelector(".article-signature h2");
    const contentEl = document.querySelector(".article-content");

    if (labelEl) labelEl.textContent = article.label || article.category;
    if (titleEl) titleEl.textContent = article.title;
    if (signatureEl) signatureEl.textContent = article.signature;

    if (!contentEl || !article.article) return;

    let html = "";

    // 1. Render Intro
    if (article.article.article_intro) {
      html += `<div class="article-intro">`;
      article.article.article_intro.forEach((paragraph) => {
        html += `<p class="lead-paragraph">${paragraph}</p>`;
      });
      html += `</div>`;
    }

    // 2. Render Base Content Sections
    if (article.article.article_base) {
      article.article.article_base.forEach((section) => {
        html += `<section class="article-section">`;
        if (section.subtitle) {
          html += `<h2>${section.subtitle}</h2>`;
        }
        if (section.paragraphs) {
          section.paragraphs.forEach((p) => {
            html += `<p>${p}</p>`;
          });
        }
        html += `</section>`;
      });
    }

    // 3. Render FAQ Section
    if (article.article.faq_section) {
      const faq = article.article.faq_section;
      html += `<section class="article-faq">`;
      if (faq.title) html += `<h2>${faq.title}</h2>`;
      if (faq.faq_base) {
        faq.faq_base.forEach((item) => {
          html += `
            <details class="faq-item">
              <summary><strong>${item.faq_question}</strong></summary>
              <p>${item.faq_answer}</p>
            </details>`;
        });
      }
      html += `</section>`;
    }

    contentEl.innerHTML = html;
  }

  fetch(JSON_PATH)
    .then((res) => res.json())
    .then((data) => renderArticle(data))
    .catch((err) => console.error("Error loading article JSON:", err));
})();
