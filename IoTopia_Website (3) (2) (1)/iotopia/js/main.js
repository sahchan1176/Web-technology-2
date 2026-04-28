/* ============================================================
   IoTopia – main.js
   All interactive features for all 9 pages
   Author: IoTopia Project | 2025
   ============================================================ */

/* ── 1. Navigation ── */
(function initNav() {
  var toggle   = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Highlight the active page link by matching filename */
  var page = window.location.pathname.split('/').pop() || 'index.html';
  if (page === '') page = 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    if (a.getAttribute('href') === page) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
  });
})();

/* ── 2. Scroll-to-top button ── */
(function initScrollTop() {
  var btn = document.getElementById('scrollTop');
  if (!btn) return;
  window.addEventListener('scroll', function () {
    btn.classList.toggle('visible', window.scrollY > 380);
  }, { passive: true });
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ── 3. Scroll reveal ── */
function initReveal() {
  var elements = document.querySelectorAll('.reveal:not(.anim-up)');
  if (!elements.length) return;
  if (!('IntersectionObserver' in window)) {
    elements.forEach(function (el) { el.classList.add('anim-up'); });
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('anim-up');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });
  elements.forEach(function (el) { observer.observe(el); });
}

/* ── 4. Counter animation ── */
function initCounters() {
  var counters = document.querySelectorAll('.counter');
  if (!counters.length) return;
  if (!('IntersectionObserver' in window)) {
    counters.forEach(function (el) {
      el.textContent = el.getAttribute('data-target') + (el.getAttribute('data-suffix') || '');
    });
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el     = entry.target;
      var target = parseFloat(el.getAttribute('data-target')) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      var current = 0;
      var inc     = target / 60;
      var timer   = setInterval(function () {
        current += inc;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = Math.floor(current).toLocaleString() + suffix;
      }, 22);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(function (c) { observer.observe(c); });
}

/* ── 5. Typing effect (home page) ── */
function initTyping() {
  var el = document.getElementById('typingText');
  if (!el) return;
  var words = ['Smart Homes', 'Healthcare', 'Industry 4.0', 'Smart Cities', 'Agriculture', 'Education'];
  var wi = 0, ci = 0, deleting = false;
  function tick() {
    var word = words[wi];
    if (deleting) {
      ci--;
      el.textContent = word.substring(0, ci);
      if (ci <= 0) { deleting = false; wi = (wi + 1) % words.length; setTimeout(tick, 480); return; }
    } else {
      ci++;
      el.textContent = word.substring(0, ci);
      if (ci >= word.length) { deleting = true; setTimeout(tick, 1800); return; }
    }
    setTimeout(tick, deleting ? 55 : 95);
  }
  tick();
}

/* ── 6. FAQ Accordion ── */
function initFAQ() {
  var items = document.querySelectorAll('.faq-item');
  if (!items.length) return;
  items.forEach(function (item) {
    var question = item.querySelector('.faq-question');
    var answer   = item.querySelector('.faq-answer');
    var icon     = item.querySelector('.faq-icon');
    if (!question || !answer) return;

    function toggleItem() {
      var isOpen = item.classList.contains('open');
      /* Close all */
      items.forEach(function (other) {
        if (other.classList.contains('open')) {
          other.classList.remove('open');
          var a = other.querySelector('.faq-answer');
          var ic = other.querySelector('.faq-icon');
          var q  = other.querySelector('.faq-question');
          if (a)  { a.style.maxHeight = null; a.style.paddingBottom = '0'; }
          if (ic) { ic.textContent = '+'; }
          if (q)  { q.setAttribute('aria-expanded', 'false'); }
        }
      });
      /* Open this one if it was closed */
      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight     = (answer.scrollHeight + 28) + 'px';
        answer.style.paddingBottom = '20px';
        if (icon) icon.textContent = '\u2212';
        question.setAttribute('aria-expanded', 'true');
      }
    }

    question.addEventListener('click', toggleItem);
    question.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleItem(); }
    });
  });
}

/* ── 7. Contact form validation ── */
function initContactForm() {
  var form = document.getElementById('contactForm');
  if (!form) return;

  var fields = [
    { id: 'name',    errId: 'nameError',    msg: 'Please enter your full name (at least 2 characters).',  fn: function(v){ return v.trim().length >= 2; } },
    { id: 'email',   errId: 'emailError',   msg: 'Please enter a valid email address.',                    fn: function(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); } },
    { id: 'subject', errId: 'subjectError', msg: 'Please enter a subject (at least 4 characters).',        fn: function(v){ return v.trim().length >= 4; } },
    { id: 'message', errId: 'messageError', msg: 'Please write a message (at least 20 characters).',       fn: function(v){ return v.trim().length >= 20; } }
  ];

  fields.forEach(function (f) {
    var input = document.getElementById(f.id);
    var err   = document.getElementById(f.errId);
    if (!input) return;
    /* Show error on blur */
    input.addEventListener('blur', function () {
      var ok = f.fn(this.value);
      this.classList.toggle('input-error', !ok);
      if (err) { err.textContent = f.msg; err.classList.toggle('show', !ok); }
    });
    /* Clear error as user types */
    input.addEventListener('input', function () {
      if (this.classList.contains('input-error')) {
        var ok = f.fn(this.value);
        this.classList.toggle('input-error', !ok);
        if (err) err.classList.toggle('show', !ok);
      }
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var valid = true;

    fields.forEach(function (f) {
      var input = document.getElementById(f.id);
      var err   = document.getElementById(f.errId);
      if (!input) return;
      var ok = f.fn(input.value);
      input.classList.toggle('input-error', !ok);
      if (err) { err.textContent = f.msg; err.classList.toggle('show', !ok); }
      if (!ok) valid = false;
    });

    /* GDPR checkbox */
    var gdpr    = document.getElementById('gdpr');
    var gdprErr = document.getElementById('gdprError');
    if (gdpr && !gdpr.checked) {
      valid = false;
      if (gdprErr) { gdprErr.textContent = 'You must agree to the privacy policy to continue.'; gdprErr.classList.add('show'); }
    } else if (gdprErr) {
      gdprErr.classList.remove('show');
    }

    if (valid) {
      var btn  = form.querySelector('button[type="submit"]');
      var orig = btn.innerHTML;
      btn.innerHTML = '\u2713 Message Sent Successfully!';
      btn.style.background = 'var(--success)';
      btn.disabled = true;
      form.reset();
      form.querySelectorAll('.input-error').forEach(function(el){ el.classList.remove('input-error'); });
      form.querySelectorAll('.form-error.show').forEach(function(el){ el.classList.remove('show'); });
      setTimeout(function () {
        btn.innerHTML = orig;
        btn.style.background = '';
        btn.disabled = false;
      }, 4000);
    }
  });
}

/* ── 8. News cards (JS dynamically rendered) ── */
function initNewsCards() {
  var container = document.getElementById('newsGrid');
  if (!container) return;

  var articles = [
    { tag: 'Smart Home',   icon: '\uD83C\uDFE0', date: 'March 2026',     title: 'Matter Protocol Reaches 4,000+ Certified Devices',          summary: 'The smart home interoperability standard continues rapid adoption, with all major manufacturers now shipping Matter-compatible devices across every product category.' },
    { tag: 'Healthcare',   icon: '\u2764\uFE0F', date: 'February 2026',  title: 'AI-Powered IoT Wearables Detect Atrial Fibrillation Early',  summary: 'Research shows continuous IoT monitoring combined with machine learning can detect heart rhythm irregularities up to six hours before symptoms appear.' },
    { tag: 'Industry',     icon: '\uD83C\uDFED', date: 'February 2026',  title: 'Industrial IoT Market to Reach $1.1 Trillion by 2028',       summary: 'A new report highlights explosive IIoT growth as manufacturers seek efficiency gains through real-time machine monitoring and predictive maintenance.' },
    { tag: 'Security',     icon: '\uD83D\uDD12', date: 'January 2026',   title: 'EU Cyber Resilience Act Mandates IoT Security Standards',    summary: 'European manufacturers must comply with strict cybersecurity requirements for all connected devices sold in the EU, including mandatory regular security updates.' },
    { tag: 'Agriculture',  icon: '\uD83C\uDF31', date: 'January 2026',   title: 'Smart Irrigation Systems Cut Water Usage by 40%',             summary: 'IoT-based precision irrigation deployments across drought-prone regions demonstrate significant water savings while maintaining or improving crop yields.' },
    { tag: 'Connectivity', icon: '\uD83D\uDCE1', date: 'December 2025',  title: '5G-IoT Integration Unlocks Ultra-Low Latency Applications',  summary: 'The convergence of 5G networks and IoT sensors is enabling new real-time use cases in autonomous vehicles, remote surgery and industrial robotics.' }
  ];

  container.innerHTML = articles.map(function (a) {
    return (
      '<article class="card news-card reveal">' +
        '<div class="news-top">' +
          '<span class="news-icon" aria-hidden="true">' + a.icon + '</span>' +
          '<span class="news-tag">' + a.tag + '</span>' +
        '</div>' +
        '<div class="card-body">' +
          '<p class="news-date">' + a.date + '</p>' +
          '<h3>' + a.title + '</h3>' +
          '<p>' + a.summary + '</p>' +
          '<a href="news.html" class="news-more">Read more &#x2192;</a>' +
        '</div>' +
      '</article>'
    );
  }).join('');

  initReveal();
}

/* ── 9. Applications tab switcher ── */
window.showAppPanel = function (id, btn) {
  document.querySelectorAll('.app-panel').forEach(function (p) { p.classList.remove('active'); });
  document.querySelectorAll('.app-tab').forEach(function (b) {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  var panel = document.getElementById('panel-' + id);
  if (panel) {
    panel.classList.add('active');
    panel.querySelectorAll('.reveal').forEach(function (el) {
      if (!el.classList.contains('anim-up')) el.classList.add('anim-up');
    });
  }
  if (btn) { btn.classList.add('active'); btn.setAttribute('aria-selected', 'true'); }
};

/* ── 10. Tutorial sidebar switcher ── */
window.showTutorial = function (id, link) {
  document.querySelectorAll('.tut-panel').forEach(function (p) { p.classList.remove('active'); });
  document.querySelectorAll('.tut-nav-list a').forEach(function (a) {
    a.classList.remove('active');
    a.removeAttribute('aria-current');
  });
  var panel = document.getElementById('tut-' + id);
  if (panel) panel.classList.add('active');
  if (link) { link.classList.add('active'); link.setAttribute('aria-current', 'true'); }
};

/* ── 11. Filter buttons (news.html) ── */
function initFilterButtons() {
  var btns = document.querySelectorAll('.filter-btn');
  if (!btns.length) return;
  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      btns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
    });
  });
}

/* ── 12. FAQ category pills ── */
function initFAQFilters() {
  var cats = document.querySelectorAll('.faq-cat');
  if (!cats.length) return;
  cats.forEach(function (btn) {
    btn.addEventListener('click', function () {
      cats.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
    });
  });
}

/* ── 13. App tab keyboard ── */
function initAppTabKeyboard() {
  document.querySelectorAll('.app-tab').forEach(function (btn) {
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
    });
  });
}

/* ── Init all on DOM ready ── */
document.addEventListener('DOMContentLoaded', function () {
  initReveal();
  initCounters();
  initTyping();
  initFAQ();
  initContactForm();
  initNewsCards();
  initFilterButtons();
  initFAQFilters();
  initAppTabKeyboard();
});
