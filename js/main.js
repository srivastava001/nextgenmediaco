/* NextGenMediaCo site script.
   Content (plans, portfolio, FAQ, etc.) is loaded from /content/*.json,
   which you edit through the admin panel at /admin. */
(function () {
  'use strict';
  var root = document.documentElement;
  var page = root.dataset.page || '';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); }
  function fmt(n) { return Number(n || 0).toLocaleString('en-IN'); }

  /* ---------- Content loading ---------- */
  var cache = {};
  function load(name) {
    if (cache[name]) return cache[name];
    var fallback = function () { return (window.NGM_CONTENT || {})[name] || null; };
    if (location.protocol === 'file:') return (cache[name] = Promise.resolve(fallback()));
    return (cache[name] = fetch('content/' + name + '.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .catch(fallback));
  }

  /* ---------- Intro ---------- */
  var intro = $('.intro');
  if (intro) {
    if (root.classList.contains('intro-on')) setTimeout(function () { intro.remove(); root.classList.remove('intro-on'); }, 1800);
    else intro.remove();
  }

  /* ---------- Page curtain between pages ---------- */
  document.addEventListener('click', function (e) {
    if (reduce || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest('a[href]');
    if (!a || a.target || a.hasAttribute('download')) return;
    var url = new URL(a.href, location.href);
    if (!/^(https?|file):$/.test(url.protocol) || url.origin !== location.origin) return;
    if (url.pathname === location.pathname) return;
    e.preventDefault();
    document.body.classList.add('leaving');
    setTimeout(function () { location.href = url.href; }, 380);
  });
  window.addEventListener('pageshow', function (e) { if (e.persisted) document.body.classList.remove('leaving'); });

  /* ---------- Split headings into words ---------- */
  $$('.split').forEach(function (el) {
    var text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.innerHTML = text.split(/\s+/).map(function (w, i) { return '<span class="w" aria-hidden="true" style="--d:' + i + '">' + esc(w) + '</span>'; }).join(' ');
  });

  /* ---------- Stagger + reveal ---------- */
  function stagger(scope) {
    $$('[data-stagger]', scope).forEach(function (p) {
      Array.prototype.forEach.call(p.children, function (c, i) {
        c.style.setProperty('--i', i);
        if (c.classList.contains('bubble')) {
          c.style.setProperty('--f', (4 + Math.random() * 3).toFixed(2) + 's');
          c.style.setProperty('--fd', (-Math.random() * 5).toFixed(2) + 's');
        }
      });
    });
  }
  function countUp(el) {
    if (el.dataset.done) return; el.dataset.done = '1';
    var end = +el.dataset.count;
    if (reduce) { el.textContent = fmt(end); return; }
    var t0 = performance.now(), d = 1300;
    (function f(t) {
      var k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(Math.round(end * e));
      if (k < 1) requestAnimationFrame(f);
    })(t0);
  }
  function reveal(el) { el.classList.add('in'); $$('[data-count]', el).forEach(countUp); }
  var io = null;
  function observe(scope) {
    stagger(scope);
    var t = $$('[data-fx], .bubbles, .steps-wrap', scope).filter(function (e) { return !e.dataset.obs; });
    t.forEach(function (e) { e.dataset.obs = '1'; });
    if (!('IntersectionObserver' in window) || reduce) { t.forEach(reveal); return; }
    if (!io) io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    t.forEach(function (e) { io.observe(e); });
  }
  $$('.nav ul li').forEach(function (li, i) { li.style.setProperty('--i', i); });

  /* ---------- Header playbar + timecode ---------- */
  var playbar = $('.playbar'), tc = $('.tc'), ticking = false;
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function onScroll() {
    var max = document.documentElement.scrollHeight - innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    if (playbar) playbar.style.setProperty('--p', p.toFixed(4));
    var total = p * 60, s = Math.floor(total), f = Math.floor((total - s) * 25);
    if (tc) tc.textContent = '00:00:' + pad(s) + ':' + pad(f);
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var nav = $('.nav'), mb = $('.menu-btn');
  function setMenu(open) {
    if (!nav) return;
    nav.classList.toggle('open', open);
    mb.setAttribute('aria-expanded', open);
    mb.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (mb) mb.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  window.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Settings: emails, WhatsApp, socials ---------- */
  function waLink(num, text) { return 'https://wa.me/' + String(num).replace(/\D/g, '') + '?text=' + encodeURIComponent(text || "Hi, I'd like to know more about your Reels plans."); }
  load('settings').then(function (s) {
    if (!s) return;
    $$('[data-email]').forEach(function (a) {
      var v = s[a.dataset.email]; if (!v) return;
      a.href = 'mailto:' + v + (a.dataset.subject ? '?subject=' + encodeURIComponent(a.dataset.subject) : '');
      if (!a.hasAttribute('data-keep')) a.textContent = v;
    });
    if (s.whatsapp) $$('[data-wa]').forEach(function (a) { a.href = waLink(s.whatsapp, a.dataset.wa); a.hidden = false; var p = a.closest('[data-wa-wrap]'); if (p) p.hidden = false; });
    if (s.whatsapp) $$('[data-wa-text]').forEach(function (el) { el.textContent = '+' + String(s.whatsapp).replace(/\D/g, ''); });
    $$('[data-social]').forEach(function (a) { var v = s[a.dataset.social]; if (v) { a.href = v; a.parentElement.hidden = false; } });
    if (s.whatsapp || s.instagram || s.facebook || s.youtube) $$('[data-follow]').forEach(function (el) { el.hidden = false; });
    $$('[data-setting]').forEach(function (el) { var v = s[el.dataset.setting]; if (v) { el.textContent = v; var w = el.closest('[data-if]'); if (w) w.hidden = false; } });
  });

  /* ---------- Home: phones, timeline, tilt ---------- */
  function initReels() {
    var DUR = 2800;
    $$('.reel').forEach(function (reel, r) {
      var slides = $$('.slide', reel), segs = $$('.bars span', reel), cur = 0;
      if (slides.length < 2) return;
      reel.style.setProperty('--dur', DUR + 'ms');
      function go() {
        var prev = slides[cur]; cur = (cur + 1) % slides.length; var next = slides[cur];
        prev.classList.remove('active'); prev.classList.add('leave'); next.classList.add('active');
        setTimeout(function () { prev.classList.add('reset'); prev.classList.remove('leave'); void prev.offsetWidth; prev.classList.remove('reset'); }, 750);
        segs.forEach(function (s, i) { s.classList.remove('now', 'done'); if (i < cur) s.classList.add('done'); });
        void segs[cur].offsetWidth; segs[cur].classList.add('now');
      }
      var delay = parseFloat(getComputedStyle(root).getPropertyValue('--intro')) * 1000 + 900 + r * 700;
      setTimeout(function () {
        segs[0].classList.add('now');
        setInterval(function () { if (!document.hidden) go(); }, DUR);
      }, delay);
    });
    var stage = $('.hero'), phones = $('.reels');
    if (stage && phones && matchMedia('(hover: hover)').matches) {
      stage.addEventListener('mousemove', function (e) {
        var b = stage.getBoundingClientRect();
        var x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5;
        phones.style.transform = 'perspective(900px) rotateY(' + (x * 10).toFixed(2) + 'deg) rotateX(' + (-y * 6).toFixed(2) + 'deg)';
      });
      stage.addEventListener('mouseleave', function () { phones.style.transform = ''; });
    }
  }
  var run = $('.run'); if (run) run.innerHTML += run.innerHTML;
  var wave = $('.wave');
  if (wave) {
    var bars = '';
    for (var i = 0; i < 140; i++) bars += '<i style="--h:' + Math.min(100, 20 + Math.abs(Math.sin(i * 0.35)) * 55 + Math.random() * 25).toFixed(0) + '%"></i>';
    wave.innerHTML = bars + bars;
  }

  /* ---------- Before / after slider ---------- */
  $$('.ba').forEach(function (ba) {
    var input = $('input', ba), touched = false;
    function set(v) { ba.style.setProperty('--pos', v + '%'); }
    input.addEventListener('input', function () { touched = true; set(input.value); });
    if (reduce || !('IntersectionObserver' in window)) return;
    var o = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return; o.disconnect();
      var keys = [50, 80, 22, 50], t0 = null, seg = 700;
      function step(t) {
        if (touched) return;
        if (!t0) t0 = t;
        var k = (t - t0) / seg, idx = Math.floor(k);
        if (idx >= keys.length - 1) { set(50); input.value = 50; return; }
        var e = k - idx; e = e < 0.5 ? 2 * e * e : 1 - Math.pow(-2 * e + 2, 2) / 2;
        var v = keys[idx] + (keys[idx + 1] - keys[idx]) * e;
        set(v); input.value = v; requestAnimationFrame(step);
      }
      setTimeout(function () { requestAnimationFrame(step); }, 500);
    }, { threshold: 0.5 });
    o.observe(ba);
  });

  /* ---------- Renderers ---------- */
  var ICONS = {
    hammer: '<svg class="shape" width="70" height="70" viewBox="0 0 70 70"><rect x="30" y="8" width="10" height="44" rx="3" fill="#10224A"/><rect x="14" y="4" width="42" height="16" rx="4" fill="#10224A"/></svg>',
    paint: '<svg class="shape" width="70" height="70" viewBox="0 0 70 70"><rect x="12" y="14" width="46" height="8" rx="3" fill="#10224A"/><path d="M16 22h38l-5 40H21z" fill="#10224A"/><path d="M30 30c0 9 7 9 7 20" stroke="#FFE08A" stroke-width="5" fill="none" stroke-linecap="round"/></svg>',
    gift: '<svg class="shape" width="70" height="70" viewBox="0 0 70 70"><rect x="10" y="26" width="50" height="36" rx="4" fill="#fff"/><rect x="6" y="18" width="58" height="12" rx="3" fill="#fff"/><rect x="31" y="18" width="8" height="44" fill="#C2410C"/></svg>',
    house: '<svg class="shape" width="90" height="80" viewBox="0 0 90 80"><path d="M45 6 84 38H74v36H16V38H6z" fill="#fff"/><rect x="38" y="50" width="14" height="24" fill="#2E5BFF"/></svg>',
    plot: '<svg class="shape" width="80" height="80" viewBox="0 0 80 80"><rect x="6" y="6" width="32" height="32" rx="3" fill="#fff" opacity=".6"/><rect x="42" y="6" width="32" height="32" rx="3" fill="#fff" opacity=".6"/><rect x="6" y="42" width="32" height="32" rx="3" fill="#fff" opacity=".6"/><rect x="42" y="42" width="32" height="32" rx="3" fill="#10224A"/></svg>',
    calendar: '<svg class="shape" width="76" height="76" viewBox="0 0 76 76"><rect x="8" y="12" width="60" height="56" rx="6" fill="#fff"/><rect x="8" y="12" width="60" height="14" rx="6" fill="#FFB400"/><path d="M24 46l9 9 19-19" stroke="#10224A" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    target: '<svg class="shape" width="70" height="70" viewBox="0 0 70 70"><circle cx="35" cy="35" r="24" fill="#fff"/><circle cx="35" cy="35" r="10" fill="#FF7A59"/></svg>',
    cake: '<svg class="shape" width="70" height="70" viewBox="0 0 70 70"><path d="M14 34h42l-6 28H20z" fill="#10224A"/><path d="M12 34c0-14 10-22 23-22s23 8 23 22z" fill="#fff"/><circle cx="35" cy="10" r="5" fill="#E5484D"/></svg>',
    scissors: '<svg class="shape" width="70" height="70" viewBox="0 0 70 70"><circle cx="20" cy="52" r="10" fill="none" stroke="#10224A" stroke-width="5"/><circle cx="50" cy="52" r="10" fill="none" stroke="#10224A" stroke-width="5"/><path d="M26 44 50 8M44 44 20 8" stroke="#10224A" stroke-width="5" stroke-linecap="round"/></svg>',
    bag: '<svg class="shape" width="70" height="70" viewBox="0 0 70 70"><path d="M12 24h46l-4 40H16z" fill="#fff"/><path d="M24 26V18a11 11 0 0 1 22 0v8" stroke="#10224A" stroke-width="5" fill="none"/></svg>'
  };
  var PLAY = '<span class="play" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24"><path d="M7 4l14 8-14 8z" fill="#10224A"/></svg></span>';
  function ytId(u) { var m = String(u || '').match(/(?:shorts\/|v=|youtu\.be\/|embed\/)([\w-]{6,})/); return m && m[1]; }
  function igPath(u) { var m = String(u || '').match(/instagram\.com\/(reel|reels|p)\/([\w-]+)/); return m && ((m[1] === 'reels' ? 'reel' : m[1]) + '/' + m[2]); }

  function workCard(it) {
    var kind = it.kind || 'concept', embed = '', thumb = '', label = 'Concept';
    if (kind === 'youtube' && ytId(it.url)) { var id = ytId(it.url); embed = 'https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0'; thumb = 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'; label = 'YouTube'; }
    if (kind === 'instagram' && igPath(it.url)) { embed = 'https://www.instagram.com/' + igPath(it.url) + '/embed'; label = 'Instagram'; }
    var tagName = embed ? 'button' : 'div';
    var attrs = embed ? ' type="button" data-embed="' + esc(embed) + '" aria-label="Play ' + esc(it.title) + '"' : '';
    if (!embed) kind = 'concept';
    var img = it.image ? '<div class="thumb" style="background-image:url(\'' + esc(it.image) + '\')"></div>' : (thumb ? '<div class="thumb" style="background-image:url(\'' + thumb + '\')"></div>' : '');
    return '<article class="wcard" data-fx="rise" data-ind="' + esc(it.industry) + '">' +
      '<' + tagName + ' class="wphone"' + attrs + ' style="--a:' + esc(it.color1 || '#FFB400') + ';--b:' + esc(it.color2 || '#10224A') + '">' +
      '<div class="scene"></div>' + img +
      '<div class="bars"><span><i></i></span><span><i></i></span><span><i></i></span></div>' +
      (kind === 'concept' && !img ? (ICONS[it.icon] || ICONS.target) : '') + (embed ? PLAY : '') +
      (it.badge ? '<span class="price">' + esc(it.badge) + '</span>' : '') +
      (img && embed ? '' : '<div class="tag"><b>' + esc(it.title) + '</b>' + esc(it.caption) + '</div>') +
      '</' + tagName + '>' +
      '<p class="wmeta"><span class="kind' + (kind !== 'concept' ? ' live' : '') + '">' + label + '</span>' + esc(it.industry) + '</p>' +
      (img && embed ? '<span class="wtitle">' + esc(it.title) + '</span>' : '') +
      '</article>';
  }

  var viewer = $('.viewer');
  function openViewer(src) {
    if (!viewer || !viewer.showModal) { window.open(src.replace('?autoplay=1&rel=0', ''), '_blank'); return; }
    $('.frame', viewer).innerHTML = '<iframe src="' + esc(src) + '" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="Video"></iframe>';
    viewer.showModal();
  }
  if (viewer) {
    viewer.addEventListener('close', function () { $('.frame', viewer).innerHTML = ''; });
    viewer.addEventListener('click', function (e) { if (e.target === viewer || e.target.closest('.close')) viewer.close(); });
  }
  document.addEventListener('click', function (e) { var b = e.target.closest('[data-embed]'); if (b) openViewer(b.dataset.embed); });

  function renderWork(el) {
    var limit = +el.dataset.limit || 0;
    load('portfolio').then(function (d) {
      var items = (d && d.items) || [];
      if (limit) {
        var real = items.filter(function (x) { return x.kind && x.kind !== 'concept'; });
        items = (real.length >= limit ? real : real.concat(items.filter(function (x) { return !x.kind || x.kind === 'concept'; }))).slice(0, limit);
      }
      el.innerHTML = items.map(workCard).join('');
      observe(el.parentElement);
      var bar = $('[data-filters]');
      if (bar && !limit) {
        var inds = []; items.forEach(function (x) { if (x.industry && inds.indexOf(x.industry) < 0) inds.push(x.industry); });
        bar.innerHTML = ['All'].concat(inds).map(function (n, i) { return '<button type="button" aria-pressed="' + (i === 0) + '" data-f="' + esc(n) + '">' + esc(n) + '</button>'; }).join('');
        bar.addEventListener('click', function (e) {
          var b = e.target.closest('button'); if (!b) return;
          $$('button', bar).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
          var f = b.dataset.f;
          $$('.wcard', el).forEach(function (c) {
            var show = f === 'All' || c.dataset.ind === f;
            if (show) { c.classList.remove('gone', 'out'); c.classList.remove('back'); void c.offsetWidth; c.classList.add('back'); }
            else { c.classList.add('out'); setTimeout(function () { if (c.classList.contains('out')) c.classList.add('gone'); }, 300); }
          });
        });
      }
    });
  }

  function planCard(p, setup, compact) {
    var cta = compact ? 'See plan details' : (p.cta || 'Choose ' + p.name);
    var href = compact ? 'pricing.html' : 'contact.html?plan=' + encodeURIComponent(p.name);
    return '<div class="plan' + (p.popular ? ' featured' : '') + '" data-fx="rise" data-reels="' + (+p.reels || 0) + '">' +
      (p.popular ? '<span class="badge">Most popular</span>' : '') +
      '<h3>' + esc(p.name) + '</h3><p class="for">' + esc(p.for) + '</p>' +
      '<p class="amount">₹<span data-count="' + (+p.price || 0) + '">' + fmt(p.price) + '</span> <small>/ month</small></p>' +
      '<p class="setup">One-time setup: ₹' + fmt(setup) + '</p>' +
      (compact ? '<p class="reels-n">' + esc(p.reels) + ' Reels per month</p>'
        : '<ul>' + (p.features || []).map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>') +
      '<a class="btn ' + (p.popular ? 'btn-main' : 'btn-alt') + '" href="' + href + '">' + esc(cta) + '</a></div>';
  }
  function renderPlans(el) {
    var compact = el.hasAttribute('data-compact');
    load('plans').then(function (d) {
      if (!d) return;
      var plans = d.plans || [];
      el.innerHTML = plans.map(function (p) { return planCard(p, d.setup_fee, compact); }).join('');
      $$('[data-plans-note]').forEach(function (n) { n.textContent = d.note || ''; });
      observe(el.parentElement);
      initPicker(plans);
    });
  }

  function initPicker(plans) {
    var box = $('.picker'); if (!box || !plans.length) return;
    var range = $('input', box), week = $('.week', box), out = $('.pick-out', box);
    var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    week.innerHTML = days.map(function (d) { return '<span>' + d + '</span>'; }).join('');
    var order = [0, 3, 5, 1, 4, 2, 6];
    var sorted = plans.slice().sort(function (a, b) { return a.reels - b.reels; });
    function update() {
      var n = +range.value, need = Math.round(n * 4.3);
      $$('span', week).forEach(function (s, i) { s.classList.toggle('on', order.indexOf(i) < n); });
      var fit = sorted.filter(function (p) { return +p.reels >= need; })[0];
      var extra = '';
      if (!fit) { fit = sorted[sorted.length - 1]; extra = ' For more than ' + fit.reels + ' a month, ask us for a custom quote.'; }
      out.innerHTML = 'About <b>' + need + ' Reels a month</b>. The <b>' + esc(fit.name) + '</b> plan fits you.' + esc(extra);
      $$('.plans .plan').forEach(function (c) {
        var on = +c.dataset.reels === +fit.reels;
        if (on && !c.classList.contains('pick')) { c.classList.remove('pick'); void c.offsetWidth; }
        c.classList.toggle('pick', on);
      });
    }
    range.addEventListener('input', update);
    update();
  }

  function renderFaq(el) {
    load('faq').then(function (d) {
      var items = (d && d.items) || [];
      if (!items.length) { var s = el.closest('section'); if (s) s.hidden = true; return; }
      el.innerHTML = items.map(function (q, i) {
        return '<div class="faq-item" data-fx="rise"><button class="faq-q" type="button" aria-expanded="false" aria-controls="faq-' + i + '">' + esc(q.q) + '<i aria-hidden="true"></i></button>' +
          '<div class="faq-a" id="faq-' + i + '" role="region"><div><p>' + esc(q.a) + '</p></div></div></div>';
      }).join('');
      observe(el);
      el.addEventListener('click', function (e) {
        var b = e.target.closest('.faq-q'); if (!b) return;
        var item = b.parentElement, open = !item.classList.contains('open');
        item.classList.toggle('open', open); b.setAttribute('aria-expanded', open);
      });
    });
  }

  function renderQuotes(el) {
    load('testimonials').then(function (d) {
      var items = (d && d.items) || [];
      var sec = el.closest('section');
      if (!items.length) { if (sec) sec.hidden = true; return; }
      if (sec) sec.hidden = false;
      el.innerHTML = items.map(function (q) { return '<figure class="quote" data-fx="rise" style="margin:0"><p>' + esc(q.quote) + '</p><b>' + esc(q.name) + '</b><span>' + esc(q.business) + '</span></figure>'; }).join('');
      observe(el.parentElement);
    });
  }

  function renderIndustries(el) {
    var colors = ['c1', 'c2', 'c4', 'c3', 'c5', 'c6'];
    load('industries').then(function (d) {
      var items = (d && d.items) || [];
      el.innerHTML = items.map(function (x, i) { return '<div class="bubble b-' + esc(x.size || 'm') + ' ' + colors[i % colors.length] + '">' + esc(x.name) + '</div>'; }).join('');
      el.dataset.obs = '';
      observe(el.parentElement);
    });
  }

  function renderCareers(el) {
    load('careers').then(function (d) {
      if (!d) return;
      if (!d.open) {
        el.innerHTML = '<div class="closed" data-fx="rise"><h2 style="margin:0 auto 8px">No open roles right now</h2><p style="margin:0;color:var(--slate)">We post new internships here first. You can still send your CV and sample edits to <a class="textlink" href="mailto:' + esc(d.apply_email) + '">' + esc(d.apply_email) + '</a>.</p></div>';
        observe(el); return;
      }
      var li = function (arr) { return (arr || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join(''); };
      var mail = 'mailto:' + esc(d.apply_email) + '?subject=' + encodeURIComponent('Application: ' + (d.title || 'Internship'));
      el.innerHTML = '<div class="careers-box" data-fx="zoom">' +
        '<div class="careers-side" data-fx="left"><h2 data-fx="title">' + esc(d.title) + '</h2>' +
        '<p class="stipend">₹<span data-count="' + (+d.stipend || 0) + '">' + fmt(d.stipend) + '</span></p><p class="meta">' + esc(d.stipend_note) + '</p>' +
        '<a class="btn btn-main" href="' + mail + '">Apply by email</a></div>' +
        '<div class="careers-main" data-fx="right"><h3>What you will do</h3><ul>' + li(d.tasks) + '</ul>' +
        '<h3>Skills we need</h3><ul class="skills">' + li(d.skills) + '</ul>' +
        '<h3>What you get</h3><ul>' + li(d.benefits) + '</ul>' +
        '<p style="margin:0;color:var(--slate)">' + esc(d.how_to_apply) + ' <a class="textlink" href="mailto:' + esc(d.apply_email) + '">' + esc(d.apply_email) + '</a></p></div></div>';
      observe(el);
    });
  }

  function renderAbout() {
    load('about').then(function (d) {
      if (!d) return;
      var st = $('[data-about-story]');
      if (st) { st.innerHTML = (d.story || []).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join(''); }
      var h = $('[data-about-headline]'); if (h && d.headline) h.textContent = d.headline;
      var v = $('[data-values]');
      var cols = ['var(--marigold)', 'var(--cobalt)', 'var(--coral)', 'var(--mint)', 'var(--violet)'];
      if (v) v.innerHTML = (d.values || []).map(function (x, i) { return '<div class="value" data-fx="rise"><i style="--c:' + cols[i % cols.length] + '"></i><h3>' + esc(x.title) + '</h3><p>' + esc(x.text) + '</p></div>'; }).join('');
      var f = d.founder || {}, fb = $('[data-founder]');
      if (fb && f.name) {
        fb.hidden = false;
        fb.innerHTML = '<div class="founder" data-fx="zoom"><div class="ph"' + (f.photo ? ' style="background-image:url(\'' + esc(f.photo) + '\')"' : '') + '></div><div><h3>' + esc(f.name) + '</h3><p class="role">' + esc(f.role) + '</p><p style="margin:0;color:var(--slate)">' + esc(f.note) + '</p></div></div>';
      }
      observe(document);
    });
  }

  /* ---------- Contact form (Netlify Forms) ---------- */
  var form = $('form[name="contact"]');
  if (form) {
    var plan = new URLSearchParams(location.search).get('plan');
    if (plan) { var sel = $('select[name="plan"]', form); if (sel) { $$('option', sel).forEach(function (o) { if (o.value === plan) sel.value = plan; }); } }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = $('.status', form), btn = $('button[type="submit"]', form);
      status.textContent = ''; btn.disabled = true; btn.textContent = 'Sending...';
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(form)).toString() })
        .then(function (r) { if (!r.ok) throw new Error(r.status); form.classList.add('done'); })
        .catch(function () { status.textContent = 'Your message could not be sent. Please email us directly at the address on the right.'; btn.disabled = false; btn.textContent = 'Send message'; });
    });
  }

  /* ---------- Services page scrollspy ---------- */
  var svcNav = $('.svc-nav');
  if (svcNav && 'IntersectionObserver' in window) {
    var links = $$('a', svcNav);
    var spy = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + e.target.id;
          a.classList.toggle('active', on);
          if (on && a.scrollIntoView && svcNav.scrollWidth > svcNav.clientWidth) a.parentElement.scrollTo({ left: a.offsetLeft - 24, behavior: reduce ? 'auto' : 'smooth' });
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    $$('.svc-block').forEach(function (b) { spy.observe(b); });
  }

  /* ---------- Boot ---------- */
  $$('[data-work]').forEach(renderWork);
  $$('[data-plans]').forEach(renderPlans);
  $$('[data-faq]').forEach(renderFaq);
  $$('[data-quotes]').forEach(renderQuotes);
  $$('[data-industries]').forEach(renderIndustries);
  $$('[data-careers]').forEach(renderCareers);
  if (page === 'about') renderAbout();
  observe(document);
  if (!reduce && page === 'home') initReels();
})();
