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

  /* ---------- IMAGE LOADER (neutral cream skeleton, no blue flash) ---------- */
  doc.querySelectorAll('.ph-img,.proj-img,.svc-img,.review-bg').forEach(function (el) {
    var name = el.getAttribute('data-img');
    if (!name) return;
    var isReviewBg = el.classList.contains('review-bg'); // hover bg: no skeleton/fade (opacity is controlled by :hover)
    if (!isReviewBg) el.classList.add('img-loading');
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
    tryLoad(['assets/images/' + name + '.jpg', 'assets/images/' + name + '.png'], function (src) {
      el.style.backgroundImage = 'url("' + src + '")';
      if (!isReviewBg) { el.classList.remove('img-loading'); el.classList.add('img-loaded'); }
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

  /* ---------- HERO BOOKING FORM (demo handler) ---------- */
  var book = doc.getElementById('bookForm');
  if (book) {
    book.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = doc.getElementById('bookNote');
      var name = book.querySelector('#bn').value.trim();
      var phone = book.querySelector('#bp').value.trim();
      var email = book.querySelector('#be').value.trim();
      if (!name || !phone || !email) {
        note.style.color = '#ff8a70';
        note.textContent = 'Please add your name, phone, and email.';
        return;
      }
      note.style.color = '#86e0c6';
      note.textContent = 'Thanks, ' + name.split(' ')[0] + '. We will call you within 24 hours.';
      book.reset();
      // TODO: wire to real endpoint / email service (Formspree, Netlify, etc.)
    });
  }

  /* ---------- HERO VIDEO (deferred: let the photos load first) ----------
     The 51MB hero film is heavy; loading it immediately starved the small
     photos of bandwidth and left their placeholders showing. So we hold it
     until the page has loaded (poster shows meanwhile), then stream + play. */
  var heroVid = doc.getElementById('heroVideo');
  function loadHeroVideo() {
    if (!heroVid || heroVid.getAttribute('src') || reduce) return;
    // On phones, load the lighter 360p cut to save data and start faster.
    var mobileSrc = heroVid.getAttribute('data-src-mobile');
    var small = window.matchMedia('(max-width: 768px)').matches;
    heroVid.src = (small && mobileSrc) ? mobileSrc : heroVid.getAttribute('data-src');
    var p = heroVid.play(); if (p && p.catch) p.catch(function () {});
  }
  if (doc.readyState === 'complete') setTimeout(loadHeroVideo, 250);
  else window.addEventListener('load', function () { setTimeout(loadHeroVideo, 250); });
  // safety: play any other autoplay videos immediately
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
        // On phones, keep the Why-card posters instead of loading 4 videos (saves data).
        if (v.classList.contains('why-vid') && window.innerWidth < 700) return;
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

  /* ---------- AI BACKYARD VISUALIZER ----------
     Front-end is fully wired (upload, drag/drop, preview, loading, result).
     To make generation REAL, POST the image to an image-to-image AI service
     from a small backend/serverless proxy (to keep the API key secret) and set
     vizOutput.src to the returned image URL. See AI_ENDPOINT below. */
  var AI_ENDPOINT = '/api/generate-pool'; // served by serve.py -> Gemini 3 Pro Image (key stays server-side)
  var vizDrop = doc.getElementById('vizDrop');
  if (vizDrop) {
    var vizFile = doc.getElementById('vizFile');
    var vizPreview = doc.getElementById('vizPreview');
    var vizPreviewImg = doc.getElementById('vizPreviewImg');
    var vizClear = doc.getElementById('vizClear');
    var vizGen = doc.getElementById('vizGenerate');
    var vizPlaceholder = doc.getElementById('vizPlaceholder');
    var vizLoading = doc.getElementById('vizLoading');
    var vizOutput = doc.getElementById('vizOutput');
    var vizTag = doc.getElementById('vizTag');
    var vizOutputClear = doc.getElementById('vizOutputClear');
    var vizRefAdd = doc.getElementById('vizRefAdd');
    var vizRefFile = doc.getElementById('vizRefFile');
    var vizRefPreview = doc.getElementById('vizRefPreview');
    var vizRefImg = doc.getElementById('vizRefImg');
    var vizRefClear = doc.getElementById('vizRefClear');
    var currentFile = null;
    var refDataURL = null;

    function setFile(file) {
      if (!file || file.type.indexOf('image/') !== 0) return;
      currentFile = file;
      vizPreviewImg.src = URL.createObjectURL(file);
      vizDrop.hidden = true; vizPreview.hidden = false; vizGen.disabled = false;
    }
    var vizPlaceholderText = vizPlaceholder.querySelector('p');
    var vizPlaceholderDefault = vizPlaceholderText ? vizPlaceholderText.textContent : '';
    function resetResult() {
      vizOutput.hidden = true; vizTag.hidden = true; vizLoading.hidden = true; vizPlaceholder.hidden = false;
      if (vizOutputClear) vizOutputClear.hidden = true;
      vizPlaceholder.classList.remove('viz-err');
      if (vizPlaceholderText) vizPlaceholderText.textContent = vizPlaceholderDefault;
    }
    function vizError(msg) {
      vizLoading.hidden = true; vizOutput.hidden = true; vizTag.hidden = true;
      if (vizOutputClear) vizOutputClear.hidden = true;
      vizPlaceholder.hidden = false; vizPlaceholder.classList.add('viz-err');
      if (vizPlaceholderText) vizPlaceholderText.textContent = msg;
      vizGen.disabled = false;
    }
    // Downscale the upload before sending (faster + smaller request, better for the API).
    function fileToScaledDataURL(file, maxDim, cb) {
      var img = new Image();
      img.onload = function () {
        var scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        var cw = Math.round(img.width * scale), ch = Math.round(img.height * scale);
        var c = document.createElement('canvas'); c.width = cw; c.height = ch;
        c.getContext('2d').drawImage(img, 0, 0, cw, ch);
        try { cb(c.toDataURL('image/jpeg', 0.9)); }
        catch (e) { cb(null); }
        URL.revokeObjectURL(img.src);
      };
      img.onerror = function () { cb(null); };
      img.src = URL.createObjectURL(file);
    }
    vizDrop.addEventListener('click', function () { vizFile.click(); });
    vizFile.addEventListener('change', function () { setFile(vizFile.files[0]); });
    ['dragover', 'dragenter'].forEach(function (ev) {
      vizDrop.addEventListener(ev, function (e) { e.preventDefault(); vizDrop.classList.add('drag'); });
    });
    ['dragleave', 'dragend'].forEach(function (ev) {
      vizDrop.addEventListener(ev, function () { vizDrop.classList.remove('drag'); });
    });
    vizDrop.addEventListener('drop', function (e) {
      e.preventDefault(); vizDrop.classList.remove('drag');
      if (e.dataTransfer && e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
    });
    vizClear.addEventListener('click', function () {
      currentFile = null; vizFile.value = '';
      vizPreview.hidden = true; vizDrop.hidden = false; vizGen.disabled = true; resetResult();
    });
    // Optional reference / inspiration image (sent alongside the backyard photo).
    if (vizRefAdd) {
      vizRefAdd.addEventListener('click', function () { vizRefFile.click(); });
      vizRefFile.addEventListener('change', function () {
        var f = vizRefFile.files[0];
        if (!f || f.type.indexOf('image/') !== 0) return;
        vizRefImg.src = URL.createObjectURL(f);
        fileToScaledDataURL(f, 768, function (d) { refDataURL = d; });
        vizRefAdd.hidden = true; vizRefPreview.hidden = false;
      });
      vizRefClear.addEventListener('click', function () {
        refDataURL = null; vizRefFile.value = '';
        vizRefPreview.hidden = true; vizRefAdd.hidden = false;
      });
    }
    // Delete (X) the generated render.
    if (vizOutputClear) {
      vizOutputClear.addEventListener('click', function () { vizOutput.removeAttribute('src'); resetResult(); });
    }
    vizGen.addEventListener('click', function () {
      if (!currentFile) return;
      vizPlaceholder.classList.remove('viz-err');
      vizPlaceholder.hidden = true; vizOutput.hidden = true; vizTag.hidden = true; vizLoading.hidden = false;
      if (vizOutputClear) vizOutputClear.hidden = true;
      vizGen.disabled = true;
      if (AI_ENDPOINT) {
        fileToScaledDataURL(currentFile, 1024, function (dataUrl) {
          if (!dataUrl) { vizError('Could not read that image. Try another photo.'); return; }
          fetch(AI_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: dataUrl, mime: 'image/jpeg', reference: refDataURL || '', refMime: 'image/jpeg' })
          })
            .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
            .then(function (res) {
              if (res.ok && res.j && res.j.image) {
                vizLoading.hidden = true;
                vizOutput.src = res.j.image; vizOutput.hidden = false; vizTag.hidden = false;
                if (vizOutputClear) vizOutputClear.hidden = false;
                vizGen.disabled = false;
              } else {
                vizError((res.j && res.j.error) ? res.j.error : 'Generation failed. Please try again.');
              }
            })
            .catch(function () { vizError('Network error. Please try again.'); });
        });
      } else {
        // Demo mode: show a sample luxury-pool rendering until a real AI endpoint is connected.
        setTimeout(function () {
          vizLoading.hidden = true;
          vizOutput.src = 'assets/images/project-04.jpg';
          vizOutput.hidden = false; vizTag.hidden = false; vizGen.disabled = false;
        }, 2200);
      }
    });
  }

  /* ---------- YEAR ---------- */
  var y = doc.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
