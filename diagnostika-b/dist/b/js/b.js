/* Varianta B: pás fotiek, kalendár a rezervácia.
   Po úspešnej rezervácii ide na /dakujem, tú istú stránku ako varianta A
   (tam GHL kalendár presmeruje). Testuje sa landing page, nie celý lievik. */
(function () {
  "use strict";
  var TEL = "+421 918 819 906";
  var MAX_DNI = 5, MAX_CASOV = 8;

  function $(s) { return document.querySelector(s); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  /* ---------- pás obrázkov: DVE rovnaké sady, posun o -50 % bez švu ---------- */
  var FOTKY = ["arboria1-2", "arboria2-3", "dievcenska-2", "garsonka-3", "komarno-3", "redizajn-po-2", "stajnerka-3", "starsia-pani-2", "vidiecky-3", "arboria1-3", "arboria2-4", "dievcenska-4", "garsonka-5", "komarno-po-2", "redizajn-po", "stajnerka-5", "starsia-pani-3", "vidiecky-5", "arboria1-5", "arboria2-6", "dievcenska-5", "garsonka-6", "stajnerka-6", "starsia-pani-5", "vidiecky-6", "arboria1-6", "arboria2-po", "garsonka-po-2", "stajnerka-po", "starsia-pani-6", "vidiecky-po-2", "arboria1-po"];
  try {
    var pas = $("#pas");
    if (pas) {
      var html = "";
      for (var k = 0; k < 2; k++) {
        FOTKY.forEach(function (f) {
          html += '<img src="/b/img/pas/' + f + '.jpg" width="252" height="189" loading="lazy" decoding="async" ' +
            (k ? 'alt="" aria-hidden="true"' : 'alt="Realizácia Miriam Czompoly"') + '>';
        });
      }
      pas.innerHTML = html;
    }
  } catch (e) {}

  /* ---------- slovenský dátum si skladáme sami ----------
     🔴 toLocaleString("sk-SK") sa nedá spoľahnúť a časová zóna sa musí vynútiť. */
  var ZONA = "Europe/Bratislava";
  var DNI_SK = { Sun: "v nedeľu", Mon: "v pondelok", Tue: "v utorok", Wed: "v stredu", Thu: "vo štvrtok", Fri: "v piatok", Sat: "v sobotu" };
  var SKRAT = { Sun: "ne", Mon: "po", Tue: "ut", Wed: "st", Thu: "št", Fri: "pi", Sat: "so" };
  function casti(iso) {
    return new Intl.DateTimeFormat("en-GB", { timeZone: ZONA, weekday: "short", day: "numeric", month: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date(iso))
      .reduce(function (o, p) { o[p.type] = p.value; return o; }, {});
  }
  function den(iso) { var c = casti(iso); return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA }).format(new Date(iso)); }
  function cas(iso) { var c = casti(iso); return Number(c.hour) + ":" + c.minute; }
  function kedy(iso) {
    var c = casti(iso);
    var dnes = new Intl.DateTimeFormat("en-CA", { timeZone: ZONA }).format(new Date());
    var zajtra = new Intl.DateTimeFormat("en-CA", { timeZone: ZONA }).format(new Date(Date.now() + 86400000));
    var d = den(iso);
    var slovo = d === dnes ? "dnes" : d === zajtra ? "zajtra" : (DNI_SK[c.weekday] + " " + Number(c.day) + ". " + Number(c.month) + ".");
    return slovo + " o " + cas(iso);
  }

  /* ---------- kalendár ---------- */
  var dniEl = $("#dni"), slotyEl = $("#sloty"), stav = $("#kalStav"), form = $("#formular");
  var btn = $("#rezervovat"), chyba = $("#chyba");
  var dni = [], vybranyDen = 0, vybranyCas = null, bezi = false;

  function nacitaj() {
    stav.hidden = false; stav.textContent = "Načítavam voľné termíny…";
    return fetch("/api/sloty").then(function (r) { return r.json(); }).then(function (o) {
      if (!o || !o.ok) throw new Error("sloty");
      dni = (o.days || []).filter(function (d) { return d.slots && d.slots.length; }).slice(0, MAX_DNI)
        .map(function (d) { return { date: d.date, slots: d.slots.slice(0, MAX_CASOV) }; });
      if (!dni.length) {
        stav.innerHTML = 'Na najbližšie dni je obsadené. Zavolaj mi prosím na <a href="tel:+421918819906">' + TEL + '</a>.';
        return;
      }
      stav.hidden = true;
      var n = $("#najblizsi"); if (n) { var c0 = casti(dni[0].slots[0]); n.textContent = SKRAT[c0.weekday] + " " + Number(c0.day) + ". " + Number(c0.month) + ". o " + cas(dni[0].slots[0]); }
      kresliDni(); vyberDen(0);
    }).catch(function () {
      stav.hidden = false;
      stav.innerHTML = 'Termíny sa nepodarilo načítať. Zavolaj mi prosím na <a href="tel:+421918819906">' + TEL + '</a>.';
    });
  }

  function kresliDni() {
    dniEl.innerHTML = dni.map(function (d, i) {
      var c = casti(d.slots[0]), n = d.slots.length;
      return '<button type="button" role="tab" class="denP" data-i="' + i + '">' +
        '<span class="d1">' + SKRAT[c.weekday] + '</span><span class="d2">' + Number(c.day) + '. ' + Number(c.month) + '.</span>' +
        '<span class="d3">' + n + (n === 1 ? " čas" : n < 5 ? " časy" : " časov") + '</span></button>';
    }).join("");
    Array.prototype.forEach.call(dniEl.querySelectorAll(".denP"), function (b) {
      b.addEventListener("click", function () { vyberDen(+b.getAttribute("data-i")); });
    });
  }

  function vyberDen(i) {
    vybranyDen = i; vybranyCas = null;   // prepnutie dňa zruší výber
    Array.prototype.forEach.call(dniEl.querySelectorAll(".denP"), function (b, j) {
      b.classList.toggle("on", j === i); b.setAttribute("aria-selected", j === i ? "true" : "false");
    });
    slotyEl.innerHTML = dni[i].slots.map(function (iso) {
      return '<button type="button" class="termin" data-iso="' + esc(iso) + '">' + cas(iso) + '</button>';
    }).join("");
    Array.prototype.forEach.call(slotyEl.querySelectorAll(".termin"), function (b) {
      b.addEventListener("click", function () {
        vybranyCas = b.getAttribute("data-iso");
        Array.prototype.forEach.call(slotyEl.querySelectorAll(".termin"), function (x) {
          x.classList.toggle("vybrany", x === b); x.setAttribute("aria-pressed", x === b ? "true" : "false");
        });
        obnov();
        form.hidden = false;
      });
    });
    obnov();
  }

  function obnov() {
    chyba.classList.remove("vidno");
    if (!vybranyCas) { btn.disabled = true; btn.textContent = "Vyber si čas"; return; }
    btn.disabled = false;
    btn.textContent = "Rezervovať " + kedy(vybranyCas);
  }

  function hodnota(meno) {
    var e = form.querySelector('[name="' + meno + '"]');
    if (!e && meno === "suhlas") e = form.querySelector('input[type="checkbox"]');
    return e ? (e.type === "checkbox" ? e.checked : String(e.value || "").trim()) : "";
  }
  function zle(meno, je) { var e = form.querySelector('[name="' + meno + '"]'); if (e) e.classList.toggle("zle", je); }
  function povedz(t) { chyba.innerHTML = t; chyba.classList.add("vidno"); }

  Array.prototype.forEach.call(form.querySelectorAll("input"), function (e) {
    e.addEventListener("input", function () { e.classList.remove("zle"); chyba.classList.remove("vidno"); });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (bezi || !vybranyCas) return;
    var d = { meno: hodnota("meno"), email: hodnota("email"), telefon: hodnota("telefon"),
              ulica: hodnota("ulica"), mesto: hodnota("mesto"), suhlas: hodnota("suhlas") };
    var zlyMail = !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(d.email);
    zle("meno", d.meno.length < 2); zle("email", zlyMail); zle("telefon", d.telefon.replace(/\D/g, "").length < 9);
    zle("ulica", d.ulica.length < 3 || !/\d/.test(d.ulica)); zle("mesto", d.mesto.length < 2);
    if (d.meno.length < 2) return povedz("Napíš prosím krstné meno.");
    if (zlyMail) return povedz("Ten e-mail nevyzerá platne.");
    if (d.telefon.replace(/\D/g, "").length < 9) return povedz("Telefónne číslo vyzerá krátko.");
    if (d.ulica.length < 3 || !/\d/.test(d.ulica) || d.mesto.length < 2) return povedz("Napíš prosím ulicu, číslo a mesto, kam mám prísť.");
    if (!d.suhlas) return povedz("Bez zaškrtnutia ti neviem poslať potvrdenie termínu.");

    bezi = true; btn.disabled = true; btn.textContent = "Rezervujem…";
    var telo = { start: vybranyCas, meno: d.meno, email: d.email, telefon: d.telefon, ulica: d.ulica, mesto: d.mesto,
                 ab: window.LIEVIK_AB || "b", sid: window.LIEVIK_SID || "" };
    fetch("/api/termin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(telo) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (o) { return { s: r.status, o: o }; }); })
      .then(function (x) {
        if (x.o && x.o.ok) {
          try { sessionStorage.setItem("mc_meno", d.meno); } catch (err) {}
          location.href = "/dakujem";
          return;
        }
        bezi = false;
        if (x.s === 409) { povedz("Tento čas si práve niekto vzal. Vyber si prosím iný."); nacitaj(); return; }
        throw new Error("termin");
      })
      .catch(function () {
        bezi = false; obnov();
        povedz('Rezerváciu sa nepodarilo dokončiť. Zavolaj mi prosím na <a href="tel:+421918819906">' + TEL + '</a>, termín dohodneme hneď.');
      });
  });

  nacitaj();
})();
