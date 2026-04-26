/* ── CONFIG ──────────────────────────────────────────────── */
const JSON_PATH = "../assets/data/neuromeditations.json";
const BASE_URL = "https://stukserdza.com/meditations/";
const CONTACT_HTML = `
              <section id="contact" class="alt contact">
            <div class="container contact-wrapper">
                <div class="contact-text" id="sofia-contact">
                    <h2 class="section-title section-title--lined">Готовы сделать первый шаг?</h2>
                    <p>
                        Если вы чувствуете, что пришло время менять свою жизнь, важно не оставаться с этим в
                        одиночестве. Я и моя команда рядом, чтобы поддержать вас на этом пути.
                    </p>
                    <p>
                        Для консультации или понимания, с чего лучше начать,
                        напишите моей ассистентке Софии в Telegram и Марии в VK,
                        они с теплотой откликнутся, поддержат и мягко направят,
                        подсказав, с чего лучше начать ваше знакомство с практикой
                    </p>
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

                <div class="contact-form-container">
                    <form action="https://formspree.io/f/mgowdgyd" method="POST">
                        <div>
                            <label for="name">Имя</label>
                            <input id="name" type="text" name="name" placeholder="Ваше имя" required>
                        </div>
                        <div>
                            <label for="email">Email</label>
                            <input id="email" type="email" name="email" placeholder="you@example.com" required>
                        </div>
                        <div>
                            <label for="message">Ваш запрос</label>
                            <textarea id="message" name="message" placeholder="Кратко опишите свою ситуацию или вопрос"
                                required></textarea>
                        </div>

                        <!-- add 3 required checkboxes -->
                        <div class="checkbox__container">
                            <label class="checkbox__label">
                                <input type="checkbox" name="consent" required>
                                <span class="checkbox__text">Я согласен(на) на обработку персональных данных</span>
                            </label>
                        </div>

                        <div class="checkbox__container">
                            <label class="checkbox__label">
                                <input type="checkbox" name="contact" required>
                                <span class="checkbox__text">
                                    Я ознакомлен(а) с <a href="privacy.html" target="_blank" rel="noopener"
                                        class="link__legal" aria-label="Перейти к нашей политике конфиденциальности">
                                        Политикой
                                        конфиденциальности</a>
                                    и даю согласие на связь по указанному email
                                </span>
                            </label>
                        </div>

                        <div class="checkbox__container">
                            <label class="checkbox__label">
                                <input type="checkbox" name="newsletter" required>
                                <span class="checkbox__text">
                                    Я понимаю, что информация носит информационный и развлекательный характер и не
                                    является профессиональной консультацией
                                </span>
                            </label>
                        </div>
                        <div class="contact-form-button-container">
                            <button type="submit" class="btn-primary">Отправить запрос</button>
                        </div>
                    </form>
                    <div class="contact-form-disclaimer">
                        <p>
Отправляя форму, вы подтверждаете согласие с
                            <a href="privacy.html" target="_blank" class="link__legal" rel=" noopener"
                                aria-label="Перейти к нашей политике конфиденциальности">
                                Политикой конфиденциальности
                            </a>
                            и
                            <a href="terms-of-service.html" target="_blank" rel="noopener" class="link__legal"
                                aria-label="Перейти к нашим условиям использования">
                                условиями использования сайта
                            </a>
                            использования сайта
                        </p>
                        <p>
                            Мы не даем гарантий результата. Все рекомендации носят субъективный характер
                        </p>
                    </div>
                </div>
            </div>
        </section>`;

/* ── SPARKLE SVG ─────────────────────────────────────────── */
const SPARKLE = `
      <li class="sparkle" aria-hidden="true">
        <svg viewBox="0 0 64 64">
          <path d="M32 6 C34 18, 38 26, 58 32 C38 38, 34 46, 32 58 C30 46, 26 38, 6 32 C26 26, 30 18, 32 6Z"/>
        </svg>
      </li>`;

/* ── HELPERS ─────────────────────────────────────────────── */
function getSlugFromURL() {
  // filename without .html  →  e.g. "attract-mine"
  return location.pathname.split("/").pop().replace(".html", "");
}

function buildPackLinks(packs, allPacks) {
  if (!packs || !packs.length) return "";
  const links = packs
    .map((packId) => {
      const pack = allPacks.find((p) => p.slug === packId);
      if (!pack) return "";
      return `<a href="${pack.slug}.html" aria-label="Перейти к пакету ${pack.title}">${pack.title}</a>`;
    })
    .filter(Boolean)
    .join(", ");
  if (!links) return "";
  return `
        <div class="med-hero-included-in-pack">
          <p>Входит в состав пакета</p>
          ${links}
        </div>`;
}

function buildBulletList(items) {
  if (!items || !items.length) return "";
  return items
    .flatMap((item, i) => [
      `<li class="how-text-step">${item}</li>`,
      i < items.length - 1 ? SPARKLE : "",
    ])
    .join("");
}

/* ── BUILD PAGE ──────────────────────────────────────────── */
function buildPage(med, allPacks) {
  const price = med.price
    ? `${med.price.toLocaleString("ru-RU")} ₽`
    : "Бесплатно";
  const pageUrl = `${BASE_URL}${med.slug}.html`;

  /* ── SEO ── */
  document.title = `Сурия | Стук сердца | Нейромедитация | ${med.title.replace(/<br\s*\/?>/gi, " ")}`;
  document.querySelector('meta[name="description"]').content =
    med.shortDescriptionCommon;
  document.querySelector('meta[property="og:title"]').content = document.title;
  document.querySelector('meta[property="og:description"]').content =
    med.shortDescriptionCommon;
  document.querySelector('meta[property="og:url"]').content = pageUrl;
  document.querySelector('meta[name="twitter:title"]').content = document.title;
  document.querySelector('meta[name="twitter:description"]').content =
    med.shortDescriptionCommon;
  document.querySelector('link[rel="canonical"]').href = pageUrl;

  /* ── problemSectionDescription paragraphs ── */
  const problemParas = (med.problemSectionDescription || [])
    .map((p) => `<p class="med-section-intro problem">${p}</p>`)
    .join("");

  /* ── howItLooks bullets (optional section) ── */
  //     For LATER
  const howItLooksSection =
    med.howItLooksBooletPoints && med.howItLooksBooletPoints.length
      ? `<section class="med-single-section">
            <div class="med-how-inner">
              <h2 class="section-title">${med.howItLooksTitle}</h2>
              <ul class="med-how-list med-single-how-list">
                ${buildBulletList(med.howItLooksBooletPoints)}
              </ul>
            </div>
          </section>`
      : "";

  /* ── effectsBooletPoints ── */
  const effectsSection =
    med.effectsBooletPoints && med.effectsBooletPoints.length
      ? `<section class="med-single-section">
            <div class="med-how-inner">
              <h2 class="section-title">${med.effectsTitle}</h2>
              <ul class="med-how-list med-single-how-list">
                ${buildBulletList(med.effectsBooletPoints)}
              </ul>
            </div>
          </section>`
      : "";

  /* ── howItHelps paragraphs ── */
  const howItHelpsParas = (med.howItHelpsBooletPoints || [])
    .map((p) => `<p class="med-section-final">${p}</p>`)
    .join("");

  /* ── instructions ── */
  const instructionsSection = med.instructions
    ? `<section class="med-single-section">
            <div class="med-how-inner">
              <p class="med-section-intro">${med.instructions}</p>
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
      <a href="${med.boostyLink}" target="_blank" class="btn-primary" aria-label="Преобрести нейромедитацию ${med.title} на Boosty">
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
      <div class="how-to-buy-contact-links">
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

  /* ── full HTML ── */
  const html = `
        <!-- Hero -->
        <section class="med-hero" id="hero">
          <div class="container pack-single-hero-inner">
            <div class="container med-hero-grid">
              <div class="med-hero-content med-single-hero-content">
                <p class="med-hero-badge">${med.meditationHeroBadge}</p>
                <h1 class="section-title">${med.title}</h1>
                <p class="med-hero-subtitle med-single-hero-subtitle">${med.shortDescriptionHero}</p>
                <div class="med-packs-card-action">
                  <p class="med-packs-card-price">${price}</p>
                  <a href="#how-to-buy" class="btn-primary med-packs-card-btn"
                     aria-label="Получить медитацию ${med.title.replace(/<br\s*\/?>/gi, " ")}">
                    Получить полную версию
                  </a>
                </div>
                ${buildPackLinks(med.includedInPacks, allPacks)}
              </div>
              <figure class="med-hero-photo-wrap med-single-hero-photo-wrap">
                <img src="${med.image}" class="med-hero-photo"
                     alt="${med.title.replace(/<br\s*\/?>/gi, " ")} — медитация Сурии">
              </figure>
            </div>
          </div>
        </section>

        <!-- Problem description -->
        <section class="med-single-section">
          <div class="med-single-wrap">
            <div class="pack-single-problem-content">
              <h2 class="section-title">${med.problemSectionTitle}:</h2>
              <h2 class="section-title med-title-accent">${med.problemSectionTitleAccent}</h2>
              ${problemParas}
            </div>
          </div>
        </section>


        <!-- Effects -->
        ${effectsSection}

        <!-- How it helps -->
        <section class="med-how-final">
          <div class="med-how-final-wrapper">
            <h2 class="section-title">${med.howItHelpsTitle}</h2>
            ${howItHelpsParas}
          </div>
        </section>

        <!-- Instructions -->
        ${instructionsSection}

        <!-- howToBuy -->
        ${howToBuy}

        <!-- Contact -->
        ${CONTACT_HTML}`;

  document.getElementById("med-main").innerHTML = html;
}

//    FOR LATER:

// <!-- How it looks (optional) -->
//  ${howItLooksSection}
/* ── INIT ────────────────────────────────────────────────── */
const slug = getSlugFromURL();

fetch(JSON_PATH)
  .then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  })
  .then((data) => {
    const med = (data.neuromeditations || data.meditations || []).find(
      (m) => m.slug === slug,
    );

    if (!med) {
      document.getElementById("med-main").innerHTML =
        `<section class="med-single-section"><div class="med-single-wrap">
               <p>Медитация не найдена.</p>
               <a href="../meditations.html">← Все медитации</a>
             </div></section>`;
      return;
    }

    buildPage(med, data.packs || []);
  })
  .catch((err) => {
    console.error("Failed to load meditation data:", err);
    document.getElementById("med-main").innerHTML =
      `<section class="med-single-section"><div class="med-single-wrap">
             <p>Не удалось загрузить данные. Попробуйте обновить страницу.</p>
           </div></section>`;
  });
