(() => {
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const primaryNav = document.querySelector('#primary-nav');
  mobileToggle?.addEventListener('click', () => {
    const open = mobileToggle.getAttribute('aria-expanded') !== 'true';
    mobileToggle.setAttribute('aria-expanded', String(open));
    primaryNav?.classList.toggle('open', open);
  });

  document.querySelectorAll('.menu-trigger').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      const open = trigger.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.menu-trigger').forEach((other) => other.setAttribute('aria-expanded', 'false'));
      trigger.setAttribute('aria-expanded', String(!open));
    });
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.nav-group')) {
      document.querySelectorAll('.menu-trigger').forEach((trigger) => trigger.setAttribute('aria-expanded', 'false'));
    }
  });
  document.querySelectorAll('.primary-nav a').forEach((link) => link.addEventListener('click', () => {
    primaryNav?.classList.remove('open');
    mobileToggle?.setAttribute('aria-expanded', 'false');
  }));

  const slides = [...document.querySelectorAll('.hero-slide')];
  const dots = [...document.querySelectorAll('.hero-dots button')];
  const hero = document.querySelector('.hero');
  const autoplayToggle = document.querySelector('.hero-autoplay-toggle');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeSlide = 0;
  let timer;
  let userPaused = reducedMotion.matches;
  let hovered = false;
  let focused = false;
  const showSlide = (index) => {
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === activeSlide;
      slide.classList.toggle('active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === activeSlide);
      dot.setAttribute('aria-selected', String(i === activeSlide));
    });
  };
  const syncAutoplayButton = () => {
    if (!autoplayToggle) return;
    autoplayToggle.setAttribute('aria-pressed', String(userPaused));
    autoplayToggle.setAttribute('aria-label', userPaused ? 'Resume carousel' : 'Pause carousel');
    autoplayToggle.title = userPaused ? 'Resume carousel' : 'Pause carousel';
    autoplayToggle.textContent = userPaused ? '▶' : 'Ⅱ';
  };
  const resetTimer = () => {
    window.clearInterval(timer);
    if (userPaused || hovered || focused || slides.length < 2) return;
    timer = window.setInterval(() => showSlide(activeSlide + 1), 8500);
  };
  document.querySelector('.hero-prev')?.addEventListener('click', () => { showSlide(activeSlide - 1); resetTimer(); });
  document.querySelector('.hero-next')?.addEventListener('click', () => { showSlide(activeSlide + 1); resetTimer(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { showSlide(i); resetTimer(); }));
  autoplayToggle?.addEventListener('click', () => {
    userPaused = !userPaused;
    syncAutoplayButton();
    resetTimer();
  });
  hero?.addEventListener('mouseenter', () => { hovered = true; resetTimer(); });
  hero?.addEventListener('mouseleave', () => { hovered = false; resetTimer(); });
  hero?.addEventListener('focusin', () => { focused = true; resetTimer(); });
  hero?.addEventListener('focusout', (event) => {
    if (!hero.contains(event.relatedTarget)) {
      focused = false;
      resetTimer();
    }
  });
  reducedMotion.addEventListener?.('change', (event) => {
    if (event.matches) userPaused = true;
    syncAutoplayButton();
    resetTimer();
  });
  syncAutoplayButton();
  resetTimer();

  const scrollByCard = (track, direction) => {
    const firstCard = track?.firstElementChild;
    if (!track || !firstCard) return;
    const style = getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap) || 16;
    track.scrollBy({ left: direction * (firstCard.getBoundingClientRect().width + gap), behavior: 'smooth' });
  };
  document.querySelector('.guide-prev')?.addEventListener('click', () => scrollByCard(document.querySelector('#guide-track'), -1));
  document.querySelector('.guide-next')?.addEventListener('click', () => scrollByCard(document.querySelector('#guide-track'), 1));
  document.querySelector('.deals-prev')?.addEventListener('click', () => scrollByCard(document.querySelector('#deals-track'), -1));
  document.querySelector('.deals-next')?.addEventListener('click', () => scrollByCard(document.querySelector('#deals-track'), 1));

  const renderDeals = async () => {
    const track = document.querySelector('#deals-track');
    if (!track) return;
    try {
      const response = await fetch('/deals.json');
      if (!response.ok) return;
      const deals = await response.json();
      if (!Array.isArray(deals)) return;
      const fragment = document.createDocumentFragment();
      deals.forEach((deal) => {
        const card = document.createElement('article');
        card.className = 'deal-card';
        const image = document.createElement('img');
        image.src = deal.image;
        image.alt = deal.alt || deal.title;
        image.loading = 'lazy';
        const title = document.createElement('p');
        title.textContent = deal.title;
        const link = document.createElement('a');
        link.href = 'https://www.maya.ph/deals';
        link.textContent = 'Check it out ↗';
        card.append(image, title, link);
        fragment.append(card);
      });
      track.replaceChildren(fragment);
    } catch (error) {
      console.warn('Could not load the complete deals list; keeping the featured cards.', error);
    }
  };
  void renderDeals();
})();
