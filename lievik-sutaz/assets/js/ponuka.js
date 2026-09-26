/* Stránka po prihlásení do súťaže: jedna ponuka, diagnostika za polovicu, kalendár.
   Počet hodín ponuky je na JEDNOM mieste: data-ponuka-hodin na <html>.
   V testovacom režime (data-test="1") sa nič nenačíta zo servera ani neodošle. */
(function () {
  'use strict';

  var root = document.documentElement;
  var TEST = root.getAttribute('data-test') === '1';
  var HODIN = parseInt(root.getAttribute('data-ponuka-hodin'), 10) || 72;
  var TZ = 'Europe/Bratislava';
  var TELEFON = '+421 918 819 906';
  var MAX_DNI = 5, MAX_CASOV = 8;

  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function uloz(k) { try { return sessionStorage.getItem(k) || ''; } catch (e) { return ''; } }

  $$('[data-hodin]').forEach(function (el) { el.textContent = HODIN; });

  /* ---------- Lehota ponuky: od prihlásenia do súťaže ---------- */
  var od = NaN;
  try { od = parseInt(localStorage.getItem('sutaz_ponuka_od'), 10); } catch (e) {}
  if (isNaN(od)) {
    od = Date.now();
    try { localStorage.setItem('sutaz_ponuka_od', String(od)); } catch (e) {}
  }
  var KONIEC = od + HODIN * 3600 * 1000;
  function jeZavreta() { return Date.now() >= KONIEC; }

  function dve(n) { return (n < 10 ? '0' : '') + n; }

  // Časovač sa na stránke NEUKAZUJE (Jano 26. 9.), o lehote jej dajú vedieť SMS a e-mail.
  // Po 72 hodinách sa ponuka potichu zavrie, kontrola raz za minútu.
  function zavri() {
    $('[data-kal]').hidden = true;
    $('[data-kal-zavrete]').hidden = false;
  }
  if (jeZavreta()) zavri();
  else { var t = setInterval(function () { if (jeZavreta()) { zavri(); clearInterval(t); } }, 60000); }

  /* ---------- Skok na kalendár ---------- */
  $$('[data-skok]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      $('#kalendar').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ---------- Video: beží bez zvuku, klepnutie ho pustí od začiatku so zvukom ---------- */
  var vbox = $('[data-bonus-video]');
  if (vbox) {
    var src = (vbox.getAttribute('data-src') || '').trim();
    var zvuk = $('[data-zvuk]', vbox);
    if (!src) {
      console.warn('[ponuka] video nie je doplnené: data-src na [data-bonus-video] je prázdne');
      vbox.classList.add('bez-videa');
      $('[data-zvuk-nadpis]', vbox).textContent = 'Video pripravujem';
      $('[data-zvuk-pod]', vbox).textContent = 'Čoskoro tu bude';
      zvuk.disabled = true;
    } else {
      var v = document.createElement('video');
      v.muted = true; v.autoplay = true; v.loop = true; v.playsInline = true;
      v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
      v.preload = 'auto';
      v.poster = $('.bonus-plagat', vbox).getAttribute('src');
      v.src = src;
      vbox.insertBefore(v, zvuk);
      var p0 = v.play(); if (p0 && p0.catch) p0.catch(function () {});
      zvuk.addEventListener('click', function () {
        v.currentTime = 0; v.muted = false; v.loop = false; v.controls = true;
        var p = v.play(); if (p && p.catch) p.catch(function () {});
        zvuk.hidden = true;
      });
    }
  }

  /* ---------- Kalendár ---------- */
  var kal = $('[data-kal]');
  if (!kal) return;
  var dniEl = $('[data-kal-dni]'), casyEl = $('[data-kal-casy]'), stav = $('[data-kal-stav]');
  var btn = $('[data-rezervovat]'), chyba = $('[data-kal-chyba]');
  var adresa = $('[data-kal-adresa]'), kontakt = $('[data-kal-kontakt]');
  var dni = [], vybranyDen = 0, vybranyCas = null;
  var maKontakt = !!(uloz('sutaz_email') && uloz('sutaz_meno') && uloz('sutaz_telefon'));

  function datum(iso) { return iso.slice(0, 10); }
  function fmt(iso, opt) { return new Intl.DateTimeFormat('sk-SK', Object.assign({ timeZone: TZ }, opt)).format(new Date(iso)); }
  function dnesKey(posun) {
    var d = new Date(Date.now() + (posun || 0) * 86400000);
    return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d);
  }
  function nazovDna(iso) {
    var k = datum(iso);
    if (k === dnesKey(0)) return 'dnes';
    if (k === dnesKey(1)) return 'zajtra';
    var KEDY = { pondelok: 'v pondelok', utorok: 'v utorok', streda: 'v stredu', 'štvrtok': 'vo štvrtok',
                 piatok: 'v piatok', sobota: 'v sobotu', 'nedeľa': 'v nedeľu' };
    var den = fmt(iso, { weekday: 'long' });
    return (KEDY[den] || den) + ' ' + fmt(iso, { day: 'numeric', month: 'numeric' });
  }

  // posun Bratislavy voči UTC pre daný deň, napr. "+02:00"
  function posunTZ(d) {
    var s = new Intl.DateTimeFormat('en-US', { timeZone: TZ, timeZoneName: 'shortOffset' }).format(d);
    var m = s.match(/GMT([+-]\d+)/); var h = m ? parseInt(m[1], 10) : 1;
    return (h < 0 ? '-' : '+') + dve(Math.abs(h)) + ':00';
  }

  // TEST: termíny podľa skutočného nastavenia kalendára (pracovné dni 9:00 až 16:30), nič zo servera
  function testoveSloty() {
    var out = [];
    for (var i = 1; out.length < MAX_DNI && i < 20; i++) {
      var d = new Date(Date.now() + i * 86400000);
      var key = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d);
      var wd = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short' }).format(d);
      if (wd === 'Sat' || wd === 'Sun') continue;
      var off = posunTZ(d), sloty = [];
      for (var h = 9; h <= 16; h++) sloty.push(key + 'T' + dve(h) + ':00:00' + off);
      out.push({ date: key, slots: sloty });
    }
    return Promise.resolve({ ok: true, days: out });
  }

  function nacitaj() {
    stav.hidden = false;
    stav.textContent = 'Načítavam voľné termíny…';
    var p = TEST ? testoveSloty() : fetch('/api/sloty').then(function (r) { return r.json(); });
    return p.then(function (res) {
      if (!res || !res.ok) throw new Error((res && res.error) || 'sloty');
      dni = (res.days || []).filter(function (d) { return d.slots && d.slots.length; }).slice(0, MAX_DNI)
        .map(function (d) { return { date: d.date, slots: d.slots.slice(0, MAX_CASOV) }; });
      if (!dni.length) {
        stav.textContent = 'Na najbližšie dni je obsadené. Zavolaj mi prosím na ' + TELEFON + '.';
        return;
      }
      stav.hidden = true;
      vykresliDni(); vyberDen(0);
    }).catch(function () {
      stav.hidden = false;
      stav.innerHTML = 'Termíny sa nepodarilo načítať. Zavolaj mi prosím na <a href="tel:+421918819906">' + TELEFON + '</a>.';
    });
  }

  function vykresliDni() {
    dniEl.innerHTML = dni.map(function (d, i) {
      var iso = d.slots[0];
      var n = d.slots.length;
      return '<button type="button" role="tab" class="kal-den" data-i="' + i + '">' +
        '<span class="kd-den">' + esc(fmt(iso, { weekday: 'short' })) + '</span>' +
        '<span class="kd-datum">' + esc(fmt(iso, { day: 'numeric', month: 'numeric' })) + '</span>' +
        '<span class="kd-volne">' + n + (n === 1 ? ' čas' : (n < 5 ? ' časy' : ' časov')) + '</span></button>';
    }).join('');
    $$('.kal-den', dniEl).forEach(function (b) {
      b.addEventListener('click', function () { vyberDen(parseInt(b.getAttribute('data-i'), 10)); });
    });
  }

  function vyberDen(i) {
    vybranyDen = i; vybranyCas = null;   // prepnutie dňa zruší výber
    $$('.kal-den', dniEl).forEach(function (b, j) {
      b.classList.toggle('aktivny', j === i);
      b.setAttribute('aria-selected', j === i ? 'true' : 'false');
    });
    casyEl.innerHTML = dni[i].slots.map(function (iso) {
      return '<button type="button" class="kal-cas" data-iso="' + esc(iso) + '">' + esc(fmt(iso, { hour: 'numeric', minute: '2-digit' })) + '</button>';
    }).join('');
    $$('.kal-cas', casyEl).forEach(function (b) {
      b.addEventListener('click', function () {
        vybranyCas = b.getAttribute('data-iso');
        $$('.kal-cas', casyEl).forEach(function (x) { x.classList.toggle('vybrany', x === b); x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        obnovTlacidlo();
      });
    });
    obnovTlacidlo();
  }

  function obnovTlacidlo() {
    chyba.classList.remove('vidno');
    if (!vybranyCas) {
      btn.disabled = true; btn.textContent = 'Vyber si čas';
      adresa.hidden = true; kontakt.hidden = true;
      return;
    }
    btn.disabled = false;
    btn.innerHTML = 'Rezervovať ' + esc(nazovDna(vybranyCas)) + ' o ' + esc(fmt(vybranyCas, { hour: 'numeric', minute: '2-digit' })) + ' <span class="sipka" aria-hidden="true">→</span>';
    adresa.hidden = false;
    kontakt.hidden = maKontakt;
  }

  // chyba zmizne hneď, ako to človek opraví
  ['ulica', 'mesto', 'k-meno', 'k-email', 'k-telefon'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('input', function () {
      el.classList.remove('zle');
      var blok = el.closest('.kal-adresa');
      if (blok && !$('.pole.zle', blok)) $('.chyba', blok).classList.remove('vidno');
    });
  });

  function hodnota(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
  function oznac(id, zle) { var el = document.getElementById(id); if (el) el.classList.toggle('zle', zle); }

  btn.addEventListener('click', function () {
    if (!vybranyCas || jeZavreta()) return;
    var data = {
      start: vybranyCas,
      contactId: uloz('sutaz_contact'),
      meno: maKontakt ? uloz('sutaz_meno') : hodnota('k-meno'),
      email: maKontakt ? uloz('sutaz_email') : hodnota('k-email'),
      telefon: maKontakt ? uloz('sutaz_telefon') : hodnota('k-telefon'),
      ulica: hodnota('ulica'),
      mesto: hodnota('mesto')
    };
    var okKontakt = data.meno.length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email) && data.telefon.replace(/\D/g, '').length >= 9;
    var okAdresa = data.ulica.length >= 3 && /\d/.test(data.ulica) && data.mesto.length >= 2;
    if (!maKontakt) { oznac('k-meno', data.meno.length < 2); oznac('k-email', !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)); oznac('k-telefon', data.telefon.replace(/\D/g, '').length < 9); }
    $('[data-chyba-kontakt]').classList.toggle('vidno', !maKontakt && !okKontakt);
    oznac('ulica', !(data.ulica.length >= 3 && /\d/.test(data.ulica))); oznac('mesto', data.mesto.length < 2);
    $('[data-chyba-adresa]').classList.toggle('vidno', !okAdresa);
    if ((!maKontakt && !okKontakt) || !okAdresa) return;

    var popis = nazovDna(vybranyCas) + ' o ' + fmt(vybranyCas, { hour: 'numeric', minute: '2-digit' });
    btn.disabled = true; btn.textContent = 'Rezervujem…';
    chyba.classList.remove('vidno');

    var poziadavka = TEST
      ? (console.info('[ponuka] TEST, rezervácia neodoslaná:', data), Promise.resolve({ status: 200, body: { ok: true, test: true } }))
      : fetch('/api/sutaz-termin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
          .then(function (r) { return r.json().catch(function () { return {}; }).then(function (b) { return { status: r.status, body: b }; }); });

    poziadavka.then(function (res) {
      if (res.body && res.body.ok) {
        kal.hidden = true;
        $('[data-kal-hotovo]').hidden = false;
        $('[data-kal-hotovo-text]').textContent = 'Prídem ' + popis + ' na adresu ' + data.ulica + ', ' + data.mesto + '. Potvrdenie ti príde e-mailom a SMS.' + (res.body.test ? ' (TEST: nič sa neodoslalo.)' : '');
        $('[data-kal-hotovo]').scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      if (res.status === 409) {
        chyba.textContent = 'Tento čas si práve niekto vzal. Vyber si prosím iný.';
        chyba.classList.add('vidno');
        nacitaj();
        return;
      }
      throw new Error('rezervacia');
    }).catch(function () {
      chyba.innerHTML = 'Rezerváciu sa nepodarilo dokončiť. Zavolaj mi prosím na <a href="tel:+421918819906">' + TELEFON + '</a>, termín dohodneme hneď.';
      chyba.classList.add('vidno');
      obnovTlacidlo();
    });
  });

  if (!jeZavreta()) nacitaj();
})();
