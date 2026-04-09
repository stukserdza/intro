const DIAG_JSON = 'assets/data/diagnostics.json';

function buildDiagCard(card) {
    const article = document.createElement('article');
    article.className = 'diag-card';

    const pointsHTML = card.points
        .map(p => `<li>${p}</li>`)
        .join('');

    article.innerHTML = `
    <div class="diag-card-img-wrap">
      <figure class="diag-card-figure">
        <img src="${card.image}" alt="${card.imageAlt}" class="diag-card-image" loading="lazy">
      </figure>
      <p class="diag-card-tag">${card.tag}</p>
    </div>
    <div class="diag-card-content">
      <h3 class="diag-card-title">${card.title}</h3>
      <p class="diag-card-text">${card.text}</p>
      <ul class="diag-points">${pointsHTML}</ul>
      <div class="diag-card-footer">
        <div class="diag-price-wrap">
          <p class="diag-price">${card.price}</p>
        </div>
        <a href="#contact" class="btn-primary" aria-label="${card.ariaLabel || 'Записаться на диагностику'}">
          Записаться на диагностику
        </a>
      </div>
    </div>`;

    return article;
}

fetch(DIAG_JSON)
    .then(r => r.json())
    .then(data => {
        const container = document.getElementById('diagnostics-cards-container');
        if (!container) return;
        const fragment = document.createDocumentFragment();
        data.forEach(card => fragment.appendChild(buildDiagCard(card)));
        container.appendChild(fragment);
    })
    .catch(err => console.error('Failed to load diagnostics.json:', err));