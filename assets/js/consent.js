/* Súhlas s cookies.
   Meta Pixel sa načíta až po kliknutí na „Súhlasím". Bez voľby alebo po
   „Len nevyhnutné" sa nenačíta nič marketingové. Voľbu sa dá kedykoľvek
   zmeniť cez odkaz s atribútom data-cookie-settings (pätička, stránka GDPR). */
(function () {
  'use strict';

  var KEY = 'mc_cookie_consent';
  var PIXEL_ID = '2324280084711918';

  function getChoice() {
    try { return window.localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function saveChoice(value) {
    try { window.localStorage.setItem(KEY, value); } catch (e) { /* bez úložiska sa lišta ukáže znova */ }
  }

  function loadPixel() {
    if (window.fbq) return;
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  function closeBanner(el) {
    el.classList.remove('show');
    window.setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 320);
  }

  function showBanner() {
    if (document.getElementById('cookie-banner')) return;
    var el = document.createElement('div');
    el.id = 'cookie-banner';
    el.className = 'cookie-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Nastavenie cookies');
    el.innerHTML =
      '<p class="cb-title">Cookies</p>' +
      '<p class="cb-text">Web používa nevyhnutné cookies, aby fungoval. S tvojím súhlasom aj marketingové cookies od Meta (Facebook, Instagram), vďaka ktorým ti môžem ukázať relevantnú reklamu. ' +
      '<a href="gdpr.html#cookies">Viac o cookies</a></p>' +
      '<div class="cb-actions">' +
        '<button type="button" class="btn btn--outline btn--sm" data-consent="denied">Len nevyhnutné</button>' +
        '<button type="button" class="btn btn--primary btn--sm" data-consent="granted">Súhlasím</button>' +
      '</div>';
    document.body.appendChild(el);
    window.requestAnimationFrame(function () { el.classList.add('show'); });

    el.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-consent]') : null;
      if (!btn) return;
      var previous = getChoice();
      var choice = btn.getAttribute('data-consent');
      saveChoice(choice);
      closeBanner(el);
      if (choice === 'granted') {
        loadPixel();
      } else if (previous === 'granted') {
        /* pixel už beží v tejto stránke, zastaví ho až nové načítanie */
        window.location.reload();
      }
    });
  }

  var choice = getChoice();
  if (choice === 'granted') loadPixel();
  else if (choice !== 'denied') showBanner();

  document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('[data-cookie-settings]') : null;
    if (!link) return;
    e.preventDefault();
    showBanner();
  });
})();
