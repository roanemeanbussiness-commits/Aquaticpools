/* =========================================================
   AQUATIC POOLS ARIZONA — main.js  (v3)
   ========================================================= */
(function () {
  'use strict';
  var doc = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- PRELOADER ---------- */
  var preloader = doc.getElementById('preloader');
  var loadBar = doc.getElementById('loadBar');
  var loadPct = doc.getElementById('loadPct');
  var pct = 0;
  var tick = setInterval(function () {
    pct += Math.max(1, (88 - pct) * 0.06);
    if (pct > 88) pct = 88;
    paint(pct);
  }, 90);
  function paint(v) {
    var r = Math.round(v);
    if (loadBar) loadBar.style.width = r + '%';
    if (loadPct) loadPct.textContent = r + '%';
  }
  function finish() {
    clearInterval(tick);
    var t = setInterval(function () {
      pct += (100 - pct) * 0.25 + 1;
      if (pct >= 100) { pct = 100; clearInterval(t); paint(100); close(); }
      else paint(pct);
    }, 60);
  }
  function close() {
    setTimeout(function () { if (preloader) preloader.classList.add('done'); doc.body.style.overflow = ''; }, 450);
  }
  doc.body.style.overflow = 'hidden';
  var minTime = new Promise(function (res) { setTimeout(res, reduce ? 300 : 1900); });
  var loaded = new Promise(function (res) {
    if (doc.readyState === 'complete') res();
    else window.addEventListener('load', res);
  });
  Promise.all([minTime, loaded]).then(finish);
  setTimeout(function () { if (preloader && !preloader.classList.contains('done')) { clearInterval(tick); paint(100); close(); } }, 6000);

  /* ---------- NAV ---------- */
  var nav = doc.getElementById('nav');
  var burger = doc.getElementById('navBurger');
  var navLinks = doc.getElementById('navLinks');
  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
  if (burger) {
    burger.addEventListener('click', function () {
      burger.classList.toggle('x'); navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { burger.classList.remove('x'); navLinks.classList.remove('open'); });
    });
  }

  /* ---------- REVEAL ON SCROLL ---------- */
  var ioFired = false;
  var io = new IntersectionObserver(function (entries) {
    ioFired = true;
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  doc.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* ---------- COUNT-UP STATS ---------- */
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target, end = +el.getAttribute('data-count'), start = null, dur = 1700;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      cio.unobserve(el);
    });
  }, { threshold: 0.5 });
  doc.querySelectorAll('[data-count]').forEach(function (el) { cio.observe(el); });

  /* ---------- IMAGE LOADER (gallery + about + process) ---------- */
  var fallbacks = [
    'linear-gradient(135deg,#0f8fa3,#122229)', 'linear-gradient(135deg,#0a6b7c,#122229)',
    'linear-gradient(135deg,#122229,#0f8fa3)', 'linear-gradient(135deg,#0a6b7c,#0f8fa3)',
    'linear-gradient(135deg,#114b5f,#122229)', 'linear-gradient(135deg,#0f8fa3,#0a6b7c)'
  ];
  doc.querySelectorAll('.ph-img,.proj-img,.svc-img,.review-bg').forEach(function (el, i) {
    var name = el.getAttribute('data-img');
    if (!name) return;
    el.style.background = fallbacks[i % fallbacks.length];
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
    tryLoad(['assets/images/' + name + '.jpg', 'assets/images/' + name + '.png'], function (src) {
      el.style.backgroundImage = 'url("' + src + '")';
    });
  });
  function tryLoad(sources, ok) {
    var i = 0;
    (function next() {
      if (i >= sources.length) return;
      var img = new Image();
      img.onload = function () { ok(sources[i]); };
      img.onerror = function () { i++; next(); };
      img.src = sources[i];
    })();
  }

  /* ---------- PROJECT VIDEO LIGHTBOX ---------- */
  var lb = doc.getElementById('lightbox');
  var lbVideo = doc.getElementById('lightboxVideo');
  var lbClose = doc.getElementById('lightboxClose');
  function openLightbox(src) {
    lbVideo.src = src;
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    doc.body.style.overflow = 'hidden';
    var p = lbVideo.play(); if (p && p.catch) p.catch(function () {});
  }
  function closeLightbox() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    lbVideo.pause(); lbVideo.removeAttribute('src'); lbVideo.load();
    doc.body.style.overflow = '';
  }
  doc.querySelectorAll('.proj[data-video]').forEach(function (card) {
    card.addEventListener('click', function () { openLightbox(card.getAttribute('data-video')); });
  });
  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lb) lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lb && lb.classList.contains('open')) closeLightbox(); });

  /* ---------- QUOTE FORM (demo handler) ---------- */
  var form = doc.getElementById('quoteForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = doc.getElementById('formNote');
      var name = form.querySelector('#qn').value.trim();
      var phone = form.querySelector('#qp').value.trim();
      var email = form.querySelector('#qe').value.trim();
      if (!name || !phone || !email) {
        note.style.color = 'var(--brand)';
        note.textContent = 'Please add your name, phone, and email so we can reach you.';
        return;
      }
      note.style.color = 'var(--teal-deep)';
      note.textContent = 'Thanks, ' + name.split(' ')[0] + '! We’ll be in touch shortly to schedule your consult.';
      form.reset();
      // TODO: wire to real endpoint / email service (Formspree, Netlify, etc.)
    });
  }

  /* ---------- HERO AUTOPLAY KICK ---------- */
  doc.querySelectorAll('video[autoplay]').forEach(function (v) {
    if (reduce) { v.removeAttribute('autoplay'); v.pause(); return; }
    var p = v.play(); if (p && p.catch) p.catch(function () {});
  });

  /* ---------- LAZY VIDEOS ---------- */
  var vio = new IntersectionObserver(function (entries) {
    ioFired = true;
    entries.forEach(function (en) {
      var v = en.target;
      if (en.isIntersecting) {
        if (!v.src) v.src = v.getAttribute('data-src');
        if (!reduce) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      } else if (!v.paused) { v.pause(); }
    });
  }, { threshold: 0.25, rootMargin: '200px 0px' });
  doc.querySelectorAll('.lazy-video').forEach(function (v) { vio.observe(v); });

  /* ---------- SCROLL ENGINE: bottom-up panels + parallax + progress ----------
     Each panel rises from the bottom as it enters and sinks back as it leaves
     (fully reversible). Positions are cached (measure) so reading them is never
     polluted by the transforms we apply — no feedback jitter. */
  var progress = doc.getElementById('scrollProgress');
  var hero = doc.getElementById('heroVideo');
  var panels = Array.prototype.slice.call(doc.querySelectorAll('main > section:not(.hero), .footer'));
  var ticking = false;
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function measure() {
    // reset transforms, let layout settle, cache each panel's natural doc-top
    panels.forEach(function (p) { p.style.transform = ''; p.style.filter = ''; });
    var sy = window.scrollY;
    panels.forEach(function (p) { p._top = p.getBoundingClientRect().top + sy; });
    scrollEngine();
  }
  function scrollEngine() {
    var vh = window.innerHeight, sy = window.scrollY;
    if (progress) {
      var max = doc.documentElement.scrollHeight - vh;
      progress.style.transform = 'scaleX(' + (max > 0 ? clamp(sy / max) : 0) + ')';
    }
    if (!reduce) {
      if (hero) hero.style.transform = 'translateY(' + (sy * 0.12) + 'px) scale(1.14)';
      panels.forEach(function (p) {
        var top = (p._top || 0) - sy;                       // untransformed viewport top
        var rise = (1 - clamp((vh - top) / (vh * 0.85))) * 72;  // up from the bottom
        var out = clamp((-top) / (vh * 0.7));                   // recede while covered
        p.style.transform = 'translateY(' + rise.toFixed(1) + 'px) scale(' + (1 - out * 0.05).toFixed(3) + ')';
        p.style.filter = out > 0.01 ? 'brightness(' + (1 - out * 0.16).toFixed(3) + ')' : '';
      });
    }
    ticking = false;
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(scrollEngine); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('load', measure);
  measure();
  setTimeout(measure, 1200); // re-measure once images/videos settle heights

  /* ---------- IO FAILSAFE ---------- */
  setTimeout(function () {
    if (ioFired) return;
    doc.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
    doc.querySelectorAll('[data-count]').forEach(function (el) { el.textContent = el.getAttribute('data-count'); });
    doc.querySelectorAll('.lazy-video').forEach(function (v) {
      if (!v.src) v.src = v.getAttribute('data-src');
      if (!reduce) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    });
  }, 2000);

  /* ---------- YEAR ---------- */
  var y = doc.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
