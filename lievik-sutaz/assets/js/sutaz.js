/* Súťaž Miriam Czompoly: odpočet, video, dotazník.
   Dátumy sú na JEDNOM mieste: data-uzavierka a data-vyhlasenie na <html>.
   Po uzávierke stránka nezmizne, ale povie pravdu. */
(function () {
  'use strict';

  var root = document.documentElement;
  var UZAVIERKA = Date.parse(root.getAttribute('data-uzavierka') || '');
  var VYHLASENIE = Date.parse(root.getAttribute('data-vyhlasenie') || '');

  /* TESTOVANIE: data-test="1" na <html>. Formulár nič neodošle, len prejde na /dakujem. */
  var TEST = root.getAttribute('data-test') === '1';
  if (TEST) {
    var stitok = document.createElement('div');
    stitok.className = 'test-stitok';
    stitok.textContent = 'TEST: nič sa neodosiela';
    document.body.appendChild(stitok);
  }

  function jeUzavrete() { return !isNaN(UZAVIERKA) && Date.now() >= UZAVIERKA; }
  function dve(n) { return (n < 10 ? '0' : '') + n; }

  /* ---------- Odpočet v banneri ---------- */
  var banner = document.querySelector('[data-odpocet]');
  function tik() {
    if (!banner || isNaN(UZAVIERKA)) return;
    var text = banner.querySelector('.banner-text');
    var cas = banner.querySelector('.banner-cas');
    var zostava = UZAVIERKA - Date.now();
    if (zostava <= 0) {
      text.textContent = (!isNaN(VYHLASENIE) && Date.now() >= VYHLASENIE)
        ? 'Súťaž je uzavretá, výherca je vyhlásený.'
        : 'Súťaž je uzavretá. Výhercu vyhlásim vo štvrtok 15. 10. o 18:00.';
      cas.textContent = '';
      zavri();
      return true;
    }
    var s = Math.floor(zostava / 1000);
    var d = Math.floor(s / 86400); s -= d * 86400;
    var h = Math.floor(s / 3600); s -= h * 3600;
    var m = Math.floor(s / 60); s -= m * 60;
    cas.textContent = (d > 0 ? d + ' d ' : '') + dve(h) + ':' + dve(m) + ':' + dve(s);
  }
  if (banner) {
    if (!tik()) {
      var t = setInterval(function () { if (tik()) clearInterval(t); }, 1000);
    }
  }

  /* ---------- Po uzávierke: tlačidlá nevedú nikam ---------- */
  function zavri() {
    root.classList.add('je-uzavrete');
    document.querySelectorAll('[data-cta]').forEach(function (a) {
      a.setAttribute('aria-disabled', 'true');
      a.removeAttribute('href');
      a.textContent = 'Súťaž je uzavretá';
    });
    var odznak = document.querySelector('[data-odznak]');
    if (odznak) odznak.textContent = 'Prihlasovanie je uzavreté';
  }
  if (jeUzavrete()) zavri();

  /* ---------- Video: nič sa nesťahuje, kým človek neklikne ---------- */
  document.querySelectorAll('[data-vsl]').forEach(function (box) {
    var spust = box.querySelector('.vsl-spust');
    if (!spust) return;
    var src = (spust.getAttribute('data-src') || '').trim();
    if (!src) {
      console.warn('[sutaz] video nie je doplnené: data-src na .vsl-spust je prázdne');
    }
    spust.addEventListener('click', function () {
      if (!src) {
        box.classList.add('bez-videa');
        setTimeout(function () { box.classList.remove('bez-videa'); }, 2600);
        return;
      }
      var v = document.createElement('video');
      v.src = src;
      v.controls = true;
      v.autoplay = true;
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      box.innerHTML = '';
      box.appendChild(v);
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    });
  });

  /* ---------- Dotazník: 3 otázky, e-mail prvý ---------- */
  var form = document.querySelector('[data-dotaznik]');
  if (!form) return;

  var kroky = Array.prototype.slice.call(form.querySelectorAll('.krok'));
  var cislo = document.querySelector('[data-krok-cislo]');
  var postup = document.querySelector('.postup span');
  var chybaOdoslania = form.querySelector('.hlaska-chyby');
  var aktualny = 0;
  var PARAMS = new URLSearchParams(window.location.search);

  function ukaz(i) {
    aktualny = i;
    kroky.forEach(function (k, j) { k.classList.toggle('aktivny', j === i); });
    if (cislo) cislo.textContent = 'Otázka ' + (i + 1) + ' z ' + kroky.length;
    if (postup) postup.style.width = ((i + 1) / kroky.length * 100) + '%';
    var pole = kroky[i].querySelector('.pole');
    if (pole) setTimeout(function () { pole.focus(); }, 60);
  }

  function hodnota(name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el ? el.value.trim() : '';
  }

  var OVERENIE = {
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); },
    meno: function (v) { return v.length >= 2; },
    telefon: function (v) { return v.replace(/[^\d]/g, '').length >= 9; }
  };

  function over(krok) {
    var pole = krok.querySelector('.pole');
    var chyba = krok.querySelector('.chyba');
    var ok = OVERENIE[pole.name](pole.value.trim());
    pole.classList.toggle('zle', !ok);
    if (chyba) chyba.classList.toggle('vidno', !ok);
    if (!ok) pole.focus();
    return ok;
  }

  function posli(data) {
    if (TEST) {
      console.info('[sutaz] TEST, neodoslané:', data);
      return Promise.resolve({ ok: true, test: true });
    }
    data.website = hodnota('website');
    data.utm = {
      source: PARAMS.get('utm_source') || '',
      medium: PARAMS.get('utm_medium') || '',
      campaign: PARAMS.get('utm_campaign') || '',
      content: PARAMS.get('utm_content') || ''
    };
    return fetch('/api/sutaz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) {
      return r.json().catch(function () { return { ok: false, error: 'bad_response' }; });
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (jeUzavrete()) return;
    var krok = kroky[aktualny];
    if (!over(krok)) return;

    if (aktualny === 0) {
      // lead zachytený hneď po e-maile, aj keby ďalej nepokračovala
      posli({ krok: 'email', email: hodnota('email') }).catch(function () {});
    }

    if (aktualny < kroky.length - 1) { ukaz(aktualny + 1); return; }

    var btn = krok.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Odosielam…';
    chybaOdoslania.classList.remove('vidno');

    posli({ krok: 'hotovo', email: hodnota('email'), meno: hodnota('meno'), telefon: hodnota('telefon') })
      .then(function (res) {
        if (res && res.ok) {
          try { sessionStorage.setItem('sutaz_meno', hodnota('meno')); } catch (err) {}
          window.location.href = '/dakujem';
          return;
        }
        throw new Error((res && res.error) || 'unknown');
      })
      .catch(function (err) {
        btn.disabled = false;
        btn.innerHTML = 'Zapojiť sa do súťaže <span class="sipka" aria-hidden="true">→</span>';
        chybaOdoslania.textContent = String(err.message) === 'not_configured'
          ? 'Formulár ešte nie je napojený na GHL (vývojová verzia). Prihláška sa neuložila.'
          : 'Prihlášku sa nepodarilo odoslať. Skús to prosím znova, alebo napíš na dizajn@miriamczompoly.sk.';
        chybaOdoslania.classList.add('vidno');
      });
  });

  form.querySelectorAll('[data-spat]').forEach(function (b) {
    b.addEventListener('click', function () { if (aktualny > 0) ukaz(aktualny - 1); });
  });

  ukaz(0);
})();
