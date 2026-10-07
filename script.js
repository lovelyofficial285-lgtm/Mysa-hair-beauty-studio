/* ================================================================
   HAIR BY SUELA — vanilla JS
   nav shrink · collapse · scrollspy · reveals · lightbox · form
   ================================================================ */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- year ---------------- */
  var yr = $('#year');
  if (yr) yr.textContent = String(new Date().getFullYear());

  /* ---------------- navbar: transparent → solid ---------------- */
  var nav = $('#mainNav');
  function onScroll () { nav.classList.toggle('solid', window.scrollY > 50); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------------- close mobile collapse on link tap ---------------- */
  var menu = $('#navMenu');
  $$('#navMenu .nav-link, #navMenu .eh-book').forEach(function (l) {
    l.addEventListener('click', function () {
      if (menu.classList.contains('show')) {
        bootstrap.Collapse.getOrCreateInstance(menu).hide();
      }
    });
  });

  /* ---------------- scrollspy ---------------- */
  var spyLinks = $$('[data-spy]');
  var spyMap = {};
  spyLinks.forEach(function (l) { spyMap[l.getAttribute('data-spy')] = l; });
  var spyObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var link = spyMap[e.target.id];
      if (link && e.isIntersecting) {
        spyLinks.forEach(function (l) { l.classList.remove('active'); });
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-38% 0px -57% 0px' });
  ['home', 'about', 'services', 'gallery', 'contact'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) spyObs.observe(el);
  });

  /* ---------------- fade-in on scroll ---------------- */
  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal]').forEach(function (el) { revealObs.observe(el); });

  /* ---------------- gallery lightbox (pure vanilla) ---------------- */
  var lb = $('#lightbox'), lbImg = $('#lbImg'), lbCount = $('#lbCount');
  var items = $$('.g-item');
  var data = items.map(function (f) {
    var img = $('img', f);
    return { src: img.src, alt: img.alt || f.getAttribute('data-alt') };
  });
  var lbIndex = 0;

  function show (i) {
    lbIndex = (i + data.length) % data.length;
    lbImg.src = data[lbIndex].src;
    lbImg.alt = data[lbIndex].alt;
    lbCount.textContent = (lbIndex + 1) + ' / ' + data.length;
  }
  function open (i) {
    show(i);
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lb-lock');
    $('.lb-close').focus();
  }
  function close () {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lb-lock');
  }
  items.forEach(function (f, i) {
    f.addEventListener('click', function () { open(i); });
    f.setAttribute('tabindex', '0');
    f.setAttribute('role', 'button');
    f.setAttribute('aria-label', 'View image: ' + data[i].alt);
    f.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
    });
  });
  $('.lb-close').addEventListener('click', close);
  $('.lb-next').addEventListener('click', function () { show(lbIndex + 1); });
  $('.lb-prev').addEventListener('click', function () { show(lbIndex - 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') show(lbIndex + 1);
    if (e.key === 'ArrowLeft') show(lbIndex - 1);
  });
  var swX = null;
  lb.addEventListener('touchstart', function (e) { swX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (swX === null) return;
    var dx = e.changedTouches[0].clientX - swX;
    if (dx < -50) show(lbIndex + 1);
    else if (dx > 50) show(lbIndex - 1);
    swX = null;
  }, { passive: true });

  /* ---------------- contact form — client-side validation only ---------------- */
  var form = $('#contactForm');
  var toast = $('#toast'), toastMsg = $('#toastMsg'), toastT = null;
  function showToast (msg) {
    toastMsg.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toast.classList.remove('show'); }, 4200);
  }

  function fieldOf (el) { return el.closest('.f-field'); }
  function setErr (el, on) {
    el.classList.toggle('f-err', on);
    if (fieldOf(el)) fieldOf(el).classList.toggle('err', on);
  }

  var validators = [
    { el: $('#cName'),  test: function (v) { return v.trim().length >= 2; } },
    { el: $('#cEmail'), test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); } },
    { el: $('#cMsg'),   test: function (v) { return v.trim().length > 2; } }
  ];
  validators.forEach(function (v) {
    v.el.addEventListener('input', function () { setErr(v.el, false); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true, firstBad = null;
    validators.forEach(function (v) {
      var pass = v.test(v.el.value);
      setErr(v.el, !pass);
      if (!pass) { ok = false; if (!firstBad) firstBad = v.el; }
    });
    if (!ok) {
      showToast('A few details need attention.');
      if (firstBad) firstBad.focus();
      return;
    }

    var payload = {
      name:    $('#cName').value.trim(),
      email:   $('#cEmail').value.trim(),
      message: $('#cMsg').value.trim(),
      sentAt:  new Date().toISOString()
    };

    var btn = $('#cSubmit');
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Sending…';

    /* simulated submit — no backend */
    setTimeout(function () {
      console.log('[Suela contact request]', payload);
      $('#confirmText').textContent = 'Thank you, ' + payload.name.split(' ')[0] + ' — Suela will reply to your message at ' + payload.email + ' shortly.';
      form.style.display = 'none';
      $('#formConfirm').classList.add('show');
      $('#formConfirm').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      showToast('Message sent — talk soon!');
      btn.disabled = false;
      btn.querySelector('span').textContent = 'Send Message';
    }, 800);
  });

  $('#sendAgain').addEventListener('click', function () {
    $('#formConfirm').classList.remove('show');
    form.reset();
    form.style.display = '';
    form.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  });
})();
