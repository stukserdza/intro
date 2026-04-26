/* ── CONFIG ──────────────────────────────────────────────── */
const JSON_PATH = "../assets/data/neuromeditations.json";
const BASE_URL = "https://stukserdza.com/meditations/";

/* ── SPARKLE SVG ─────────────────────────────────────────── */
const SPARKLE = `
    <li class="sparkle" aria-hidden="true">
      <svg viewBox="0 0 64 64">
        <path d="M32 6 C34 18, 38 26, 58 32 C38 38, 34 46, 32 58 C30 46, 26 38, 6 32 C26 26, 30 18, 32 6Z"/>
      </svg>
    </li>`;

/* ── CONTACT HTML ────────────────────────────────────────── */
const CONTACT_HTML = `
    <section id="contact" class="alt contact">
      <div class="container contact-wrapper">
        <div class="contact-text" id="sofia-contact">
          <h2 class="section-title section-title--lined">Готовы сделать первый шаг?</h2>
          <p>Если вы чувствуете, что пришло время менять свою жизнь, важно не оставаться с этим в одиночестве. Я и моя команда рядом, чтобы поддержать вас на этом пути.</p>
          <p>Для консультации или понимания, с чего лучше начать, напишите моей ассистентке Софии в Telegram и Марии в VK, они с теплотой откликнутся, поддержат и мягко направят.</p>
          <a class="contact-highlight" href="https://t.me/sofiya1203" target="_blank" rel="noopener">
            <img src="https://res.cloudinary.com/dcstupoud/image/upload/v1775964725/tg_form_xlg8vi.svg" alt="Contact Sofia TG" />
          </a>
          <a class="contact-highlight" href="https://vk.me/stukserdzavk" target="_blank" rel="noopener">
            <img src="https://res.cloudinary.com/dcstupoud/image/upload/v1775964726/vk_form_z0dx2b.svg" alt="Contact Maria VK" />
          </a>
          <a class="contact-highlight" href="https://wa.me/message/4EWYRWQBFWOBF1" target="_blank" rel="noopener">
            <img src="https://res.cloudinary.com/dcstupoud/image/upload/v1775964727/wa_form_ecbrn5.svg" alt="Contact WhatsApp" />
          </a>
        </div>
        <div class="contact-form-container">
          <form action="https://formspree.io/f/mgowdgyd" method="POST">
            <div>
              <label for="name">Имя</label>
              <input id="name" type="text" name="name" placeholder="Ваше имя" required />
            </div>
            <div>
              <label for="email">Email</label>
              <input id="email" type="email" name="email" placeholder="you@example.com" required />
            </div>
            <div>
              <label for="message">Ваш запрос</label>
              <textarea id="message" name="message" placeholder="Кратко опишите свою ситуацию или вопрос" required></textarea>
            </div>
            <div class="checkbox__container">
              <label class="checkbox__label">
                <input type="checkbox" name="consent" required />
                <span class="checkbox__text">Я согласен(на) на обработку персональных данных</span>
              </label>
            </div>
            <div class="checkbox__container">
              <label class="checkbox__label">
                <input type="checkbox" name="contact" required />
                <span class="checkbox__text">Я ознакомлен(а) с <a href="../privacy.html" target="_blank" rel="noopener" class="link__legal">Политикой конфиденциальности</a> и даю согласие на связь по указанному email</span>
              </label>
            </div>
            <div class="checkbox__container">
              <label class="checkbox__label">
                <input type="checkbox" name="newsletter" required />
                <span class="checkbox__text">Я понимаю, что информация носит информационный и развлекательный характер и не является профессиональной консультацией</span>
              </label>
            </div>
            <div class="contact-form-button-container">
              <button type="submit" class="btn-primary">Отправить запрос</button>
            </div>
          </form>
          <div class="contact-form-disclaimer">
            <p>Отправляя форму, вы подтверждаете согласие с <a href="../privacy.html" target="_blank" class="link__legal" rel="noopener">Политикой конфиденциальности</a> и <a href="../terms-of-service.html" target="_blank" rel="noopener" class="link__legal">условиями использования сайта</a></p>
            <p>Мы не даем гарантий результата. Все рекомендации носят субъективный характер</p>
          </div>
        </div>
      </div>
    </section>`;

/* ── HELPERS ─────────────────────────────────────────────── */
function getSlugFromURL() {
  // e.g. "packs-love.html" → "love"
  const filename = location.pathname.split("/").pop().replace(".html", "");
  return filename.replace("packs-", "");
}

function buildBulletList(items) {
  if (!items || !items.length || items.every((i) => !i)) return "";
  return items
    .flatMap((item, i) => [
      `<li class="how-text-step">${item}</li>`,
      i < items.length - 1 ? SPARKLE : "",
    ])
    .join("");
}

/* ── BUILD "HOW TO LISTEN" with meditation links ─────────── */
function buildHowToListen(pack, allMeditations) {
  if (!pack.howToListen || !pack.howToListen.length) return "";

  // map slug → meditation object for link generation
  const medMap = {};
  allMeditations.forEach((m) => {
    medMap[m.slug] = m;
  });

  // build step items — replace meditation names with links if we can match
  const items = pack.howToListen.map((step) => {
    // find any known meditation title that appears in the step text
    let enriched = step;
    allMeditations.forEach((m) => {
      const plainTitle = m.title
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
      // wrap with link if title appears in quotes
      const quoted = `«${plainTitle}»`;
      if (enriched.includes(quoted)) {
        enriched = enriched.replace(
          quoted,
          `<a href="${m.page.split("/").pop()}" class="how-link" aria-label="Подробнее об аудиопрограмме ${plainTitle}">${quoted}</a>`,
        );
      }
    });
    return enriched;
  });

  const listItems = items
    .flatMap((item, i) => [
      `<li class="how-text-step">${item}</li>`,
      i < items.length - 1 ? SPARKLE : "",
    ])
    .join("");

  return `
      <section class="med-how">
        <div class="med-how-inner">
          <h2 class="section-title">Как слушать:</h2>
          <ul class="med-how-list">${listItems}</ul>
        </div>
      </section>`;
}

/* ── BUILD MEDITATION CARDS from pack.meditations slugs ──── */
function buildMeditationCards(pack, allMeditations) {
  if (!pack.meditations || !pack.meditations.length) return "";

  const medMap = {};
  allMeditations.forEach((m) => {
    medMap[m.slug] = m;
  });

  const cards = pack.meditations
    .map((slugOrRef, stepIndex) => {
      // clean up accidental .html suffix in slug
      const slug = slugOrRef.replace(".html", "");
      const med = medMap[slug];

      // use howItWorks step description if available, else fall back to shortDescriptionCommon
      const stepsObj = pack.howItWorks && pack.howItWorks[0];
      const stepKey = `Шаг ${stepIndex + 1}`;
      const stepData = stepsObj && stepsObj[stepKey];
      const stepDesc = stepData
        ? stepData.discription
        : med
          ? med.shortDescriptionCommon
          : "";
      const stepTitle = stepData
        ? stepData.title
        : med
          ? med.title.replace(/<br\s*\/?>/gi, " ")
          : slug;

      if (!med) {
        // render a placeholder card if meditation not found in JSON
        return `
          <article class="med-card">
            <h3 class="med-card-title">${stepTitle}</h3>
            <p class="med-card-text">${stepDesc}</p>
          </article>`;
      }

      const price = med.price
        ? `<p class="med-card-price">${med.price.toLocaleString("ru-RU")} ₽</p>`
        : "";

      return `
        <article class="med-card">
          <figure class="med-card-figure">
            <img src="${med.image}" alt="${stepTitle} — аудиопрограмма Сурии" class="med-card-image" loading="lazy" />
          </figure>
          <h3 class="med-card-title">${stepTitle}</h3>
          <p class="med-card-text">${stepDesc}</p>
          <div class="med-card-action">
            ${price}
            <a href="${med.page.split("/").pop()}" class="btn-primary med-card-btn"
               aria-label="Подробнее об аудиопрограмме ${stepTitle}">
              Подробнее
            </a>
          </div>
        </article>`;
    })
    .join("");

  return `
      <section class="med-single-section">
        <div class="med-single-wrap">
          <div class="med-card-grid">${cards}</div>
        </div>
      </section>`;
}

/* ── BUILD howItLooks bullets (optional) ────────────────── */
function buildHowItLooks(pack) {
  const points = (pack.howItLooksBooletPoints || []).filter(
    (p) => p && p.trim(),
  );
  if (!points.length || !pack.howItLooksTitle) return "";
  return `
      <section class="med-single-section">
        <div class="med-how-inner">
          <h2 class="section-title">${pack.howItLooksTitle}</h2>
          <ul class="med-how-list med-single-how-list">
            ${buildBulletList(points)}
          </ul>
        </div>
      </section>`;
}

/* ── BUILD effects bullets (optional) ───────────────────── */
function buildEffects(pack) {
  const points = (pack.effectsBooletPoints || []).filter((p) => p && p.trim());
  if (!points.length || !pack.effectsTitle) return "";
  return `
      <section class="med-single-section">
        <div class="med-how-inner">
          <h2 class="section-title">${pack.effectsTitle}</h2>
          <ul class="med-how-list med-single-how-list">
            ${buildBulletList(points)}
          </ul>
        </div>
      </section>`;
}

/* ── BUILD FULL PAGE ─────────────────────────────────────── */
function buildPage(pack, allMeditations) {
  const pageUrl = `${BASE_URL}packs-${pack.slug}.html`;
  const price = pack.price ? `${pack.price.toLocaleString("ru-RU")} ₽` : "";
  const titlePlain = pack.title;

  /* ── SEO ── */
  const seoTitle = `Сурия | Стук сердца | ${pack.meditationHeroBadge} | ${titlePlain}`;
  document.title = seoTitle;
  document.querySelector('meta[name="description"]').content =
    pack.shortDescriptionCommon;
  document.querySelector('link[rel="canonical"]').href = pageUrl;
  document.querySelector('meta[property="og:title"]').content = seoTitle;
  document.querySelector('meta[property="og:description"]').content =
    pack.shortDescriptionCommon;
  document.querySelector('meta[property="og:url"]').content = pageUrl;
  document.querySelector('meta[name="twitter:title"]').content = seoTitle;
  document.querySelector('meta[name="twitter:description"]').content =
    pack.shortDescriptionCommon;

  /* ── problemSectionDescription paragraphs ── */
  const problemParas = (pack.problemSectionDescription || [])
    .map((p) => `<p class="med-section-intro problem">${p}</p>`)
    .join("");

  /* ── instructions ── */
  const instructionsSection = pack.instructions
    ? `<section class="med-single-section">
           <div class="med-how-inner">
             <p class="med-section-intro">${pack.instructions}</p>
           </div>
         </section>`
    : "";
  /* ── how to buy ── */
  const howToBuy = `
  <section class="how-to-buy" id="how-to-buy">
  <div class="how-to-buy-wrapper">
    <h2 class="section-title">Как приобрести нейромедитацию</h2>

    <p class="how-to-buy-lead">
      Готовы начать прямо сейчас?
      <br>
      Нажмите кнопку ниже и получите доступ к нейромедитации через Boosty.
    </p>
    <div class="how-to-buy-btn-container">
      <a href="${pack.boostyLink}" target="_blank" class="btn-primary" aria-label="Преобрести нейромедитацию ${pack.title} на Boosty">
        Приобрести сейчас
      </a>
    </div>

    <div class="how-to-buy-issues">
      <p>
        Если ссылка не открывается или возникают сложности с оплатой — это нормально.
        В некоторых странах (например, США) Boosty может работать нестабильно.
      </p>
      <p>
        В таком случае просто напишите моим помощницам — мы поможем вам получить доступ вручную:
      </p>
      <div class="contact-links">
        <a class="contact-highlight" href="https://t.me/sofiya1203" target="_blank" rel="noopener" aria-label="Перейти в Телеграм и написать Софии ассистенту">
            <img src="https://res.cloudinary.com/dcstupoud/image/upload/v1775964725/tg_form_xlg8vi.svg"
                alt="Contact Sofia TG">
        </a>
        <a class="contact-highlight" href="https://vk.me/stukserdzavk" target="_blank" rel="noopener" aria-label="Перейти в Вконтакте и написать Марии ассистенту">
            <img src="https://res.cloudinary.com/dcstupoud/image/upload/v1775964726/vk_form_z0dx2b.svg"
                alt="Contact Maria VK">
        </a>
        <a class="contact-highlight" href="https://wa.me/message/4EWYRWQBFWOBF1" target="_blank"
            rel="noopener"  aria-label="Перейти в What's up и написать Марии ассистенту">
            <img src="https://res.cloudinary.com/dcstupoud/image/upload/v1775964727/wa_form_ecbrn5.svg"
                alt="Contact Maria What's up">
        </a>
      </div>
    </div>
    <p class="how-to-buy-note">
      Мы ответим, подскажем удобный способ оплаты и мягко проведём вас к практике
    </p>
  </>
</section>
  
  `;
  const html = `
      <!-- Hero -->
      <section class="med-hero" id="hero">
        <div class="container pack-single-hero-inner">
          <div class="container med-hero-grid">
            <div class="med-hero-content">
              <p class="med-hero-badge">${pack.meditationHeroBadge.toUpperCase()}</p>
              <h1 class="section-title">${titlePlain}</h1>
              <p class="med-hero-subtitle">${pack.shortDescriptionHero}</p>
              <div class="med-packs-card-action">
                <p class="med-packs-card-price">${price}</p>
                <a href="#how-to-buy" class="btn-primary med-packs-card-btn"
                   aria-label="Получить полный пакет ${titlePlain}">
                  Получить полный пакет
                </a>
              </div>
            </div>
            <figure class="med-hero-photo-wrap">
              <img src="${pack.image}" class="med-hero-photo"
                   alt="${titlePlain} — пакет аудиопрограмм Сурии" />
            </figure>
          </div>
        </div>
      </section>

      <!-- How to listen -->
      ${buildHowToListen(pack, allMeditations)}

      <!-- Problem description -->
      <section class="med-single-section">
        <div class="med-single-wrap">
          <div class="pack-single-problem-content">
            <h2 class="section-title">${pack.problemSectionTitle}:<br />${pack.problemSectionTitleAccent}</h2>
            ${problemParas}
          </div>
        </div>
      </section>

      <!-- Meditation cards (steps) -->
      ${buildMeditationCards(pack, allMeditations)}

      <!-- How it looks (optional) -->
      ${buildHowItLooks(pack)}

      <!-- Effects (optional) -->
      ${buildEffects(pack)}

      <!-- Instructions -->
      ${instructionsSection}

      <!-- howToBuy -->
      ${howToBuy}

      <!-- Contact -->
      ${CONTACT_HTML}`;

  document.getElementById("pack-main").innerHTML = html;
}

/* ── INIT ────────────────────────────────────────────────── */
const slug = getSlugFromURL();

fetch(JSON_PATH)
  .then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  })
  .then((data) => {
    const allMeditations = data.neuromeditations || data.meditations || [];
    const pack = (data.packs || []).find((p) => p.slug === slug);

    if (!pack) {
      document.getElementById("pack-main").innerHTML = `
          <section class="med-single-section">
            <div class="med-single-wrap">
              <p>Пакет не найден.</p>
              <a href="../meditations.html">← Все медитации</a>
            </div>
          </section>`;
      return;
    }

    buildPage(pack, allMeditations);
  })
  .catch((err) => {
    console.error("Failed to load pack data:", err);
    document.getElementById("pack-main").innerHTML = `
        <section class="med-single-section">
          <div class="med-single-wrap">
            <p>Не удалось загрузить данные. Попробуйте обновить страницу.</p>
          </div>
        </section>`;
  });
