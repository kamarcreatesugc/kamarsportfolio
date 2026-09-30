(() => {
  const nav = document.getElementById('nav');
  const toggle = nav.querySelector('.nav__toggle');
  document.getElementById('year').textContent = new Date().getFullYear();

  // Solid nav once past the hero
  const onScroll = () => nav.classList.toggle('is-solid', window.scrollY > window.innerHeight * 0.75);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  nav.querySelectorAll('.nav__links a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }));

  // Scroll reveal
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const siblings = [...e.target.parentElement.children].filter(el => el.classList.contains('reveal'));
      e.target.style.transitionDelay = `${Math.min(siblings.indexOf(e.target), 6) * 70}ms`;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Subtle parallax on the quote background
  const quoteBg = document.querySelector('.quote__bg');
  if (quoteBg && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const quote = quoteBg.parentElement;
    window.addEventListener('scroll', () => {
      const r = quote.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      quoteBg.style.transform = `translateY(${p * -12}%)`;
    }, { passive: true });
  }

  // Lightbox: photos and videos, navigable within their own group
  const lb = document.getElementById('lightbox');
  const stage = lb.querySelector('.lightbox__stage');
  let group = [], index = 0;

  const render = () => {
    const el = group[index];
    stage.innerHTML = '';
    if (el.dataset.video) {
      const v = document.createElement('video');
      v.src = el.dataset.video;
      v.poster = el.querySelector('img').src;
      v.controls = true; v.autoplay = true; v.playsInline = true;
      stage.append(v);
    } else {
      const img = el.querySelector('img').cloneNode();
      img.removeAttribute('loading');
      stage.append(img);
    }
    const multi = group.length > 1;
    lb.querySelector('.lightbox__prev').hidden = !multi;
    lb.querySelector('.lightbox__next').hidden = !multi;
  };
  const open = (el) => {
    const container = el.closest('.reels, .gallery, .ocp') || el.parentElement;
    group = [...container.querySelectorAll('button')];
    index = group.indexOf(el);
    render();
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    lb.querySelector('.lightbox__close').focus();
  };
  const close = () => {
    lb.hidden = true;
    stage.innerHTML = '';
    document.body.style.overflow = '';
    group[index]?.focus();
  };
  const step = (d) => { index = (index + d + group.length) % group.length; render(); };

  document.querySelectorAll('.reel, .gallery__item, [data-video]').forEach(el =>
    el.addEventListener('click', () => open(el)));
  lb.querySelector('.lightbox__close').addEventListener('click', close);
  lb.querySelector('.lightbox__prev').addEventListener('click', () => step(-1));
  lb.querySelector('.lightbox__next').addEventListener('click', () => step(1));
  lb.addEventListener('click', e => { if (e.target === lb || e.target === stage) close(); });
  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
})();
