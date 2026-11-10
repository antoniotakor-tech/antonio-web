// Clickjacking guard (static hosts often cannot send frame-ancestors headers)
try { if (window.top !== window.self) window.top.location = window.self.location.href; } catch (e) { document.documentElement.style.display = 'none'; }

(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // WhatsApp message builder
  var PHONE = '31627162069';
  var TT = {
    it: { hi: 'Ciao Antonio! Vorrei un preventivo per un sito di una pagina.', biz: 'Lavoro: ', zone: 'Zona: ', need: 'Mi serve: ' },
    nl: { hi: 'Hoi Antonio! Ik wil graag een offerte voor een website van één pagina.', biz: 'Werk: ', zone: 'Buurt: ', need: 'Ik heb nodig: ' },
    en: { hi: 'Hi Antonio! I’d like a quote for a one-page website.', biz: 'Work: ', zone: 'Area: ', need: 'I need: ' }
  };
  var T = TT[root.lang] || TT.en;
  var state = { biz: '', need: '', zone: '' };
  function message() {
    var m = T.hi;
    if (state.biz) { m += '\n' + T.biz + state.biz + '.'; }
    if (state.zone) { m += '\n' + T.zone + state.zone + '.'; }
    if (state.need) { m += '\n' + T.need + state.need + '.'; }
    return m;
  }
  function update() {
    var href = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(message());
    var links = document.querySelectorAll('a[data-wa]');
    for (var i = 0; i < links.length; i++) { links[i].setAttribute('href', href); }
    var pv = document.getElementById('preview');
    if (pv) { pv.textContent = message(); }
  }
  var chips = document.querySelectorAll('.chip');
  for (var i = 0; i < chips.length; i++) {
    chips[i].addEventListener('click', function () {
      var g = this.getAttribute('data-group');
      var sib = document.querySelectorAll('.chip[data-group="' + g + '"]');
      var was = this.getAttribute('aria-pressed') === 'true';
      for (var j = 0; j < sib.length; j++) { sib[j].setAttribute('aria-pressed', 'false'); }
      this.setAttribute('aria-pressed', was ? 'false' : 'true');
      state[g] = was ? '' : this.getAttribute('data-value');
      update();
    });
  }
  var zone = document.getElementById('zone');
  if (zone) {
    zone.addEventListener('input', function () {
      state.zone = zone.value.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 40);
      update();
    });
  }
  update();

  // Hero phone: plays once (page, tap, chat). Click replays it. Reduced motion shows the end state.
  var phone = document.getElementById('phone');
  if (phone) {
    if (reduce) { phone.classList.add('final'); }
    else {
      phone.classList.add('play');
      phone.addEventListener('click', function () {
        phone.classList.remove('play');
        void phone.offsetWidth;
        phone.classList.add('play');
      });
    }
  }


  // Works carousel: swipe, arrows, dots, keyboard
  var sc = document.querySelector('.works');
  if (sc) {
    var cards = Array.prototype.slice.call(sc.children);
    var dots = Array.prototype.slice.call(document.querySelectorAll('.car__dot'));
    var prev = document.querySelector('.car__prev');
    var next = document.querySelector('.car__next');
    var pad = function () { return parseFloat(getComputedStyle(sc).paddingLeft) || 0; };
    var current = function () {
      var best = 0, min = Infinity;
      for (var c = 0; c < cards.length; c++) {
        var d = Math.abs(cards[c].offsetLeft - pad() - sc.scrollLeft);
        if (d < min) { min = d; best = c; }
      }
      return best;
    };
    var anim = null;
    var stopAnim = function () {
      if (anim) { cancelAnimationFrame(anim); anim = null; }
      sc.style.scrollSnapType = '';
    };
    var animateTo = function (target) {
      stopAnim();
      if (reduce) { sc.scrollLeft = target; return; }
      var start = sc.scrollLeft, dist = target - start, t0 = null;
      var dur = Math.min(950, 460 + Math.abs(dist) * 0.3);
      sc.style.scrollSnapType = 'none';
      var step = function (t) {
        if (t0 === null) { t0 = t; }
        var k = Math.min(1, (t - t0) / dur);
        var e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        sc.scrollLeft = start + dist * e;
        if (k < 1) { anim = requestAnimationFrame(step); } else { anim = null; sc.style.scrollSnapType = ''; }
      };
      anim = requestAnimationFrame(step);
    };
    var go = function (i) {
      i = Math.max(0, Math.min(cards.length - 1, i));
      animateTo(cards[i].offsetLeft - pad());
    };
    // Depth effect: cards fade and shrink a little when they are not the active one, phone and screen drift apart.
    var fx = function () {
      for (var c = 0; c < cards.length; c++) {
        var o = (cards[c].offsetLeft - pad() - sc.scrollLeft) / Math.max(1, cards[c].offsetWidth);
        cards[c].style.setProperty('--o', Math.max(-1.2, Math.min(1.2, o)).toFixed(3));
        cards[c].style.setProperty('--p', Math.min(1, Math.abs(o)).toFixed(3));
      }
    };
    var mark = function () {
      var i = current();
      for (var j = 0; j < dots.length; j++) {
        dots[j].classList.toggle('on', j === i);
        dots[j].setAttribute('aria-current', j === i ? 'true' : 'false');
      }
      fx();
      if (prev) { prev.disabled = i === 0; }
      if (next) { next.disabled = i === cards.length - 1; }
    };
    var ticking = false;
    sc.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(function () { mark(); ticking = false; }); }
    }, { passive: true });
    if (prev) { prev.addEventListener('click', function () { go(current() - 1); }); }
    if (next) { next.addEventListener('click', function () { go(current() + 1); }); }
    for (var d = 0; d < dots.length; d++) {
      (function (n) { dots[n].addEventListener('click', function () { go(n); }); })(d);
    }
    ['pointerdown', 'wheel', 'touchstart'].forEach(function (ev) { sc.addEventListener(ev, function () { if (anim) { stopAnim(); } }, { passive: true }); });
    sc.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(current() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(current() - 1); }
    });
    // Mouse drag to swipe on desktop
    var down = false, startX = 0, startLeft = 0, moved = false;
    sc.addEventListener('pointerdown', function (e) { if (e.pointerType === 'mouse' && !e.target.closest('a,button')) { down = true; moved = false; startX = e.clientX; startLeft = sc.scrollLeft; sc.style.scrollSnapType = 'none'; sc.style.scrollBehavior = 'auto'; } });
    window.addEventListener('pointermove', function (e) { if (down) { var dx = e.clientX - startX; if (Math.abs(dx) > 4) { moved = true; } sc.scrollLeft = startLeft - dx; } });
    window.addEventListener('pointerup', function () { if (down) { down = false; sc.style.scrollSnapType = ''; sc.style.scrollBehavior = ''; go(current()); } });
    mark();
  }

  // Header shadow after scrolling
  var bar = document.getElementById('topbar');
  function onScroll() { if (bar) { bar.classList.toggle('is-scrolled', window.scrollY > 8); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal text blocks on scroll. Images are never hidden. Everything shows after 2.5 s as a fallback.
  var els = document.querySelectorAll('.head, .tile, .timeline li, .offer, details, .scope__col, .about__text, .work__text, .composer');
  for (var k = 0; k < els.length; k++) { els[k].classList.add('reveal'); }
  function showAll() { for (var n = 0; n < els.length; n++) { els[n].classList.add('in'); } }
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    for (var m = 0; m < els.length; m++) { io.observe(els[m]); }
    setTimeout(showAll, 2500);
  } else { showAll(); }
})();

// "How it works": the steps light up one after another, from the first message to going live
(function () {
  var tl = document.querySelector('.timeline');
  if (!tl) { return; }
  var items = tl.querySelectorAll('li');
  if (!items.length) { return; }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    for (var a = 0; a < items.length; a++) { items[a].classList.add('is-on'); }
    return;
  }
  var i = 0, timer = null;
  function tick() {
    if (i < items.length) { items[i].classList.add('is-on'); i++; return; }
    if (i === items.length + 2) {
      for (var k = 0; k < items.length; k++) { items[k].classList.remove('is-on'); }
      i = 0; return;
    }
    i++;
  }
  var io = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) { if (!timer) { timer = setInterval(tick, 1100); } }
    else if (timer) { clearInterval(timer); timer = null; }
  }, { threshold: 0.2 });
  io.observe(tl);
})();
