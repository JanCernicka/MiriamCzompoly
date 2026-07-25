/* =========================================================
   Miriam Czompoly — shared interactions
   Vanilla JS, no dependencies.
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Sticky header ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 24) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile navigation ---------- */
  var navToggle = document.querySelector('.nav-toggle');
  var body = document.body;
  function closeNav() {
    body.classList.remove('nav-open', 'no-scroll');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  }
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      var open = body.classList.toggle('nav-open');
      body.classList.toggle('no-scroll', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  document.querySelectorAll('.mobile-menu a').forEach(function (a) {
    a.addEventListener('click', closeNav);
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var panel = item.querySelector('.faq-a');
      var expanded = item.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        panel.style.height = panel.scrollHeight + 'px';
        requestAnimationFrame(function () { panel.style.height = '0px'; });
        item.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-expanded', 'false');
      } else {
        panel.style.height = panel.scrollHeight + 'px';
        item.setAttribute('aria-expanded', 'true');
        btn.setAttribute('aria-expanded', 'true');
        panel.addEventListener('transitionend', function te() {
          if (item.getAttribute('aria-expanded') === 'true') panel.style.height = 'auto';
          panel.removeEventListener('transitionend', te);
        });
      }
    });
  });

  /* ---------- Case-study modals ---------- */
  var overlay = document.querySelector('.modal-overlay');
  var lastFocus = null;

  function openModal(id) {
    if (!overlay) return;
    var target = document.getElementById(id);
    if (!target) return;
    overlay.querySelectorAll('.modal.active').forEach(function (m) { m.classList.remove('active'); });
    target.classList.add('active');
    overlay.classList.add('open');
    body.classList.add('no-scroll');
    lastFocus = document.activeElement;
    var closeBtn = target.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();
    overlay.scrollTop = 0;
  }
  function closeModal() {
    if (!overlay) return;
    overlay.classList.remove('open');
    body.classList.remove('no-scroll');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.querySelectorAll('[data-modal]').forEach(function (trigger) {
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      openModal(trigger.getAttribute('data-modal'));
    });
  });
  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
    overlay.querySelectorAll('.modal-close, [data-close-modal]').forEach(function (b) {
      b.addEventListener('click', closeModal);
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (overlay && overlay.classList.contains('open')) closeModal();
      if (body.classList.contains('nav-open')) closeNav();
    }
  });

  /* ---------- Forms: validation + fake submit ---------- */
  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  document.querySelectorAll('form[data-mock]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll('[required]').forEach(function (field) {
        var ok = field.value.trim() !== '' && (field.type !== 'email' || isEmail(field.value.trim()));
        field.classList.toggle('invalid', !ok);
        if (!ok) valid = false;
      });
      if (!valid) {
        var firstBad = form.querySelector('.invalid');
        if (firstBad) firstBad.focus();
        return;
      }
      form.classList.add('is-success');
      var success = form.querySelector('.form-success');
      if (success) {
        success.setAttribute('tabindex', '-1');
        success.focus();
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    form.querySelectorAll('.field').forEach(function (field) {
      field.addEventListener('input', function () {
        if (field.classList.contains('invalid')) {
          var ok = field.value.trim() !== '' && (field.type !== 'email' || isEmail(field.value.trim()));
          field.classList.toggle('invalid', !ok);
        }
      });
    });
  });

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Footer year ---------- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
