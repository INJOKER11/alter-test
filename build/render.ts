import { authors, categories, type Author } from '../src/data/authors.ts';
import { TELEGRAM_URL } from '../src/config.ts';

const escape = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
const paperPlane = '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m21 3-4 18-6-7-8-3L21 3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="m11 14 5-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
const plusIcon = '<svg class="plus-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
const arrowIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const closeIcon = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';

function telegram(label = 'Перейти в Telegram', style = '') {
  const classes = `button telegram ${style}`;
  if (TELEGRAM_URL.trim()) {
    const url = new URL(TELEGRAM_URL);
    if (url.protocol !== 'https:' || !['t.me', 'telegram.me'].includes(url.hostname)) {
      throw new Error('TELEGRAM_URL должен быть HTTPS-адресом t.me или telegram.me');
    }
    return `<a class="${classes}" href="${escape(url.href)}" target="_blank" rel="noopener noreferrer" aria-label="${label} — откроется в новой вкладке">${paperPlane}<span>${label}</span></a>`;
  }
  return `<button type="button" class="${classes}" data-telegram>${paperPlane}<span>${label}</span></button>`;
}

function card(author: Author, index: number) {
  return `<article class="author-card" data-category="${author.category}" aria-labelledby="card-${author.id}">
    <a class="portrait-link" href="#profile-${author.id}" data-profile="${author.id}" aria-label="Открыть профиль: ${author.name}">
      <img src="${author.image}" alt="${author.alt}" width="1200" height="1600" ${index === 0 ? 'fetchpriority="high" loading="eager"' : 'loading="lazy"'} decoding="async" />
      <span class="image-label">${author.category}</span><span class="portrait-index" aria-hidden="true">0${index + 1}</span>
      <span class="portrait-quote">${escape(author.quote)}</span><span class="portrait-open" aria-hidden="true">${plusIcon}</span>
    </a>
    <div class="card-heading"><h3 id="card-${author.id}">${author.name}</h3></div>
    <p class="handle">${author.handle}</p>
    <p class="card-topics">${author.topics}</p>
    <p class="card-description">${author.card}</p>
    <a class="blog-link" href="#profile-${author.id}" data-profile="${author.id}" aria-label="Смотреть блог: ${author.name}">Смотреть блог<span class="link-mark" aria-hidden="true">${arrowIcon}</span></a>
  </article>`;
}

function profile(author: Author, index: number) {
  return `<section id="profile-${author.id}" class="profile-panel" aria-labelledby="profile-title-${author.id}">
    <div class="profile-toolbar"><span class="eyebrow">ALTER / 0${index + 1}</span><div class="profile-actions"><button class="next-author" type="button" data-next="${authors[(index + 1) % authors.length].id}" aria-label="Следующий автор: ${authors[(index + 1) % authors.length].name}" hidden>Далее: ${authors[(index + 1) % authors.length].name}<span aria-hidden="true">0${(index + 1) % authors.length + 1}</span></button><button type="button" class="close-button" data-close hidden aria-label="Закрыть профиль"><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button></div></div>
    <div class="profile-scroll">
      <div class="profile-intro"><img class="profile-portrait" src="${author.image}" alt="${author.alt}" width="1200" height="1600" loading="lazy" decoding="async" />
        <div class="profile-about"><span class="meta-badge">${author.age} ${author.age === 32 ? 'года' : 'лет'}</span><h2 id="profile-title-${author.id}" tabindex="-1">${author.name}</h2><p class="handle">${author.handle}</p><p class="profile-topics">${author.topics}</p></div>
        <blockquote class="profile-quote">${author.quote}</blockquote>
      </div>
      <p class="profile-bio">${author.bio}</p>
      <div class="posts-heading"><h3>Из блога</h3><span>Три истории для знакомства</span></div>
      <div class="posts">${author.posts.map((post, i) => `<article class="post"><span class="post-number" aria-hidden="true">0${i + 1}</span><div><h4>${escape(author.postTitles[i])}</h4><p>${escape(post)}</p></div></article>`).join('')}</div>
    </div>
    <div class="profile-bottom"><span>Продолжим знакомство?</span>${telegram()}</div>
  </section>`;
}

export function renderPage() {
  return `<div class="reading-progress" aria-hidden="true"></div><a class="skip-link" href="#authors">К авторам</a>
  <div class="page-shell">
    <header class="site-header"><a class="wordmark" href="#top" aria-label="ALTER — главная">ALTER<span aria-hidden="true">.</span></a><nav aria-label="Основная навигация"><a class="nav-link" href="#authors">Авторы</a>${telegram('Telegram', 'button-small button-outline')}</nav></header>
    <main id="top">
      <section class="hero" aria-labelledby="hero-title"><div class="hero-topline"><span class="eyebrow">Авторы ALTER</span><span class="hero-edition" aria-hidden="true">ЗНАКОМСТВО / 01</span></div>
        <div class="hero-composition"><h1 id="hero-title"><span class="hero-line">Четыре характера.</span><em class="hero-line">Твой новый интерес.</em></h1><div class="hero-people"><div class="portrait-stack">${authors.map((author,i)=>`<a href="#profile-${author.id}" data-profile="${author.id}" class="mini-portrait mini-${i}" aria-label="Познакомиться: ${author.name}"><img src="${author.image.replace('.webp', '-96.webp')}" srcset="${[96,192,288].map(width => `${author.image.replace('.webp', `-${width}.webp`)} ${width}w`).join(', ')}" sizes="69px" alt="" width="96" height="128" loading="eager" decoding="async"/><span>${author.name}</span></a>`).join('')}</div><p>Четыре взгляда.<br /><span>Какой откликнется тебе?</span></p></div></div>
        <div class="hero-bottom"><p>Город, технологии, стиль и путешествия — знакомься с авторами, за которыми интересно следить.</p><a class="button button-dark" href="#authors">Выбрать автора</a></div>
      </section>
      <section class="catalog" id="authors" aria-labelledby="catalog-title"><div class="catalog-heading"><div class="section-title"><h2 id="catalog-title">Найди свой характер</h2><span class="author-count" aria-label="4 автора">04</span></div><p>Разные взгляды. Есть что обсудить.</p></div>
        <div class="filters" role="group" aria-label="Фильтр по теме" hidden>${categories.map((category, i) => `<button type="button" class="filter" data-filter="${category}" aria-pressed="${i === 0}">${category}</button>`).join('')}</div>
        <p class="sr-only" id="filter-status" role="status" aria-live="polite"></p>
        <div class="author-grid">${authors.map(card).join('')}</div>
      </section>
      <section class="telegram-section" aria-labelledby="telegram-title"><div><span class="eyebrow">Встретимся ближе</span><h2 id="telegram-title">Твоя следующая<br /><em>любимая лента.</em></h2><p>Выбирай близкие темы. Продолжай знакомство в Telegram.</p></div>${telegram('Перейти в Telegram', 'button-coral')}</section>
      <div class="profiles-fallback">${authors.map(profile).join('')}</div>
      <noscript><p class="no-script">Профили и публикации доступны ниже каталога. Для фильтров и открытия профиля в окне включите JavaScript.${TELEGRAM_URL ? '' : ' Ссылка на Telegram пока не добавлена.'}</p></noscript>
    </main>
    <footer class="site-footer"><a class="wordmark footer-logo" href="#top" aria-label="ALTER — к началу">ALTER<span aria-hidden="true">.</span></a><span class="footer-note">Четыре взгляда на мир.</span></footer>
  </div>
  <div class="notice" role="status" aria-live="polite" hidden><p>Ссылка на Telegram пока не добавлена</p><button type="button" data-dismiss-notice aria-label="Закрыть уведомление">${closeIcon}</button></div>`;
}

