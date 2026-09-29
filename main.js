/* ═══════════════════════════════════════════════════════════
   main.js — preloader, cursor, reveals, tilt, interactions
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  /* ── PRELOADER ─────────────────────────────────────────── */
  const preloader = document.getElementById('preloader');
  const loaderWord = document.getElementById('loader-word');
  const loaderBar = document.getElementById('loader-bar');
  const loaderCount = document.getElementById('loader-count');

  const words = ['hello', 'வணக்கம்', 'नमस्ते', 'world', 'dev/'];
  let wIdx = 0;
  let loadProgress = 0;

  const wordTimer = setInterval(() => {
    wIdx = (wIdx + 1) % words.length;
    if (loaderWord) loaderWord.textContent = words[wIdx];
  }, 420);

  const progTimer = setInterval(() => {
    loadProgress = Math.min(loadProgress + Math.random() * 14 + 4, 100);
    if (loaderBar) loaderBar.style.width = loadProgress + '%';
    if (loaderCount) loaderCount.textContent = String(Math.floor(loadProgress)).padStart(2, '0');
    if (loadProgress >= 100) {
      clearInterval(progTimer);
      clearInterval(wordTimer);
      setTimeout(finishLoad, 350);
    }
  }, 160);

  function finishLoad() {
    if (!preloader) return;
    preloader.classList.add('done');
    document.body.classList.add('loaded');
    setTimeout(() => preloader.remove(), 1000);
    kickIntro();
  }

  /* ── SPLIT TEXT (chars for hero, words for statements) ── */
  function splitChars(el) {
    const text = el.textContent;
    el.textContent = '';
    const frag = document.createDocumentFragment();
    [...text].forEach((ch, i) => {
      const wrap = document.createElement('span');
      wrap.className = 'ch';
      wrap.style.display = 'inline-block';
      wrap.style.transform = 'translateY(110%)';
      wrap.style.transition = `transform 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.028}s`;
      wrap.textContent = ch === ' ' ? '\u00A0' : ch;
      frag.appendChild(wrap);
    });
    el.appendChild(frag);
    el.style.overflow = 'hidden';
  }

  function splitWords(el) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    let idx = 0;
    texts.forEach((node) => {
      const parts = node.textContent.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      parts.forEach((part) => {
        if (!part.trim()) { frag.appendChild(document.createTextNode(part)); return; }
        const span = document.createElement('span');
        span.className = 'w';
        span.style.setProperty('--i', idx++);
        span.textContent = part;
        frag.appendChild(span);
      });
      node.parentNode.replaceChild(frag, node);
    });
  }

  const heroLines = document.querySelectorAll('.hero-title [data-split]');
  heroLines.forEach(splitChars);

  document.querySelectorAll('[data-reveal-words]').forEach(splitWords);

  // footer giant + section titles: words
  document.querySelectorAll('.section-title[data-split], .contact-title[data-split], .footer-giant[data-split]')
    .forEach(splitWords);

  /* ── INTRO AFTER PRELOADER ─────────────────────────────── */
  function kickIntro() {
    heroLines.forEach((el) => {
      el.querySelectorAll('.ch').forEach((ch) => {
        ch.style.transform = 'translateY(0)';
      });
    });
    // trigger hero reveals shortly after
    document.querySelectorAll('.hero .reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('in'), 250 + i * 120);
    });
  }

  /* ── SCROLL REVEALS ────────────────────────────────────── */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );

  document.querySelectorAll('.reveal, [data-reveal-words], .section-title, .contact-title, .footer-giant')
    .forEach((el) => {
      if (el.closest('.hero')) return; // hero handled by intro
      io.observe(el);
    });

  /* ── CUSTOM CURSOR ─────────────────────────────────────── */
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  const label = document.getElementById('cursor-label');

  if (!isTouch && dot && ring) {
    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const ringPos = { x: pos.x, y: pos.y };

    window.addEventListener('pointermove', (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      dot.style.left = pos.x + 'px';
      dot.style.top = pos.y + 'px';
    });

    (function ringLoop() {
      ringPos.x += (pos.x - ringPos.x) * 0.16;
      ringPos.y += (pos.y - ringPos.y) * 0.16;
      ring.style.left = ringPos.x + 'px';
      ring.style.top = ringPos.y + 'px';
      requestAnimationFrame(ringLoop);
    })();

    document.querySelectorAll('[data-hover]').forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('grow'));
      el.addEventListener('mouseleave', () => ring.classList.remove('grow'));
    });

    document.querySelectorAll('[data-cursor]').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        if (label) label.textContent = el.dataset.cursor || 'VIEW';
        ring.classList.add('label');
      });
      el.addEventListener('mouseleave', () => ring.classList.remove('label'));
    });
  }

  /* ── SCROLL PROGRESS BAR ───────────────────────────────── */
  const progress = document.getElementById('progress');
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.width = (scrollY / max) * 100 + '%';
  }, { passive: true });

  /* ── NAV CLOCK ─────────────────────────────────────────── */
  const clockEl = document.getElementById('clock');
  function tickClock() {
    if (!clockEl) return;
    clockEl.textContent = new Date().toLocaleTimeString('en-GB', { hour12: false });
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* ── MENU OVERLAY ──────────────────────────────────────── */
  const toggle = document.getElementById('menu-toggle');
  const overlay = document.getElementById('menu-overlay');
  if (toggle && overlay) {
    toggle.addEventListener('click', () => {
      const open = overlay.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    overlay.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        overlay.classList.remove('open');
        toggle.classList.remove('open');
        document.body.style.overflow = '';
      })
    );
  }

  /* ── COUNTERS ──────────────────────────────────────────── */
  const counters = document.querySelectorAll('[data-count]');
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const dur = 1400;
      const start = performance.now();
      cio.unobserve(el);
      (function step(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(step);
      })(start);
    });
  }, { threshold: 0.6 });
  counters.forEach((c) => cio.observe(c));

  /* ── 3D TILT (portrait + project cards) ────────────────── */
  if (!isTouch && !prefersReduced) {
    document.querySelectorAll('[data-tilt], .tilt').forEach((el) => {
      const strength = el.hasAttribute('data-tilt') ? 10 : 6;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${px * strength}deg) rotateX(${-py * strength}deg) translateY(-4px)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transform = '';
      });
    });
  }

  /* ── MAGNETIC BUTTONS ──────────────────────────────────── */
  if (!isTouch && !prefersReduced) {
    document.querySelectorAll('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transform = '';
      });
    });
  }

  /* ── COPY EMAIL ────────────────────────────────────────── */
  const mail = document.querySelector('.contact-mail');
  if (mail) {
    mail.addEventListener('click', (e) => {
      e.preventDefault();
      const addr = mail.querySelector('.contact-addr').textContent.trim();
      navigator.clipboard?.writeText(addr).then(() => {
        const kicker = mail.querySelector('.contact-kicker');
        const old = kicker.textContent;
        kicker.textContent = '// copied to clipboard ✓';
        setTimeout(() => (kicker.textContent = old), 1600);
      }).catch(() => {
        window.location.href = 'mailto:' + addr;
      });
    });
  }

  /* ── CONTACT FORM (demo handler) ───────────────────────── */
  const form = document.getElementById('contact-form');
  const note = document.getElementById('form-note');
  if (form && note) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      note.hidden = false;
      note.textContent = 'message queued ✓ — wire me to your DRF endpoint!';
      form.reset();
      setTimeout(() => (note.hidden = true), 3200);
    });
  }

  /* ── YEAR ──────────────────────────────────────────────── */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
