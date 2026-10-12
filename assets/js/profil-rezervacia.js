/* /profil-rezervacia: horúci z testu (chce začať do 3 mesiacov a má od 3 000 €).
   Plán jej Miriam odovzdá osobne na 10-minútovom hovore, Miriam volá.
   Kalendár ako na variante B (diagnostika-b/dist/b/js/b.js), voľné časy z /api/sloty?typ=rozhovor.
   Rezervácia ide na /api/rozhovor. Meno a e-mail sú predvyplnené z testu (sessionStorage „mc_kontakt“),
   stránka ale funguje aj bez nich, napríklad z odkazu v e-maile. */
(function () {
  "use strict";
  var P = window.PROFIL;
  if (!P) return;
  var TEL = "0918 819 906";
  var MAX_DNI = 5, MAX_CASOV = 16;

  function $(s) { return document.querySelector(s); }
  var esc = P.esc;

  /* ---------- odpovede z testu ---------- */
  var o = P.zAdresy(location.search);
  if (!o) { location.replace("/profil#test"); return; }
  P.uloz(o);

  var kontakt = {};
  try { kontakt = JSON.parse(sessionStorage.getItem("mc_kontakt") || "null") || {}; } catch (e) {}
  var M = P.MIESTA[o.m];
  $("#odpovede").innerHTML = P.OTAZKY.map(function (q) {
    var nazvy = { m: "Miestnosť", d: "Prekáža", n: "Ponechať", p: "Pocit", k: "Začať", r: "Rozpočet" };
    return "<dt>" + esc(nazvy[q.k]) + "</dt><dd>" + esc(q.z[o[q.k]].n) + "</dd>";
  }).join("");
  $("#zmenit").href = "/profil?" + P.doAdresy(o) + "#test";
  $("#bod1").textContent = "Čo by som " + M.lok + " riešila ako prvé";
  if (kontakt.meno) $("#sub").innerHTML = esc(kontakt.meno) + ", podľa tvojich odpovedí to so zmenou myslíš vážne. Preto ti plán nepošlem len e-mailom. Pozriem sa naň vopred a za 10 minút ti ho prejdem po telefóne. <strong>Zadarmo. Vyber si čas, zavolám ti ja.</strong>";
  try { P.recenzie("#kopa", 3); } catch (e) {}

  /* ---------- slovenský dátum si skladáme sami ----------
     🔴 toLocaleString("sk-SK") sa nedá spoľahnúť a časová zóna sa musí vynútiť. */
  var ZONA = "Europe/Bratislava";
  var DNI_SK = { Sun: "v nedeľu", Mon: "v pondelok", Tue: "v utorok", Wed: "v stredu", Thu: "vo štvrtok", Fri: "v piatok", Sat: "v sobotu" };
  var SKRAT = { Sun: "ne", Mon: "po", Tue: "ut", Wed: "st", Thu: "št", Fri: "pi", Sat: "so" };
  function casti(iso) {
    return new Intl.DateTimeFormat("en-GB", { timeZone: ZONA, weekday: "short", day: "numeric", month: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date(iso))
      .reduce(function (a, p) { a[p.type] = p.value; return a; }, {});
  }
  function den(iso) { return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA }).format(new Date(iso)); }
  function cas(iso) { var c = casti(iso); return Number(c.hour) + ":" + c.minute; }
  function kedy(iso) {
    var c = casti(iso);
    var dnes = den(new Date().toISOString()), zajtra = den(new Date(Date.now() + 86400000).toISOString());
    var d = den(iso);
    var slovo = d === dnes ? "dnes" : d === zajtra ? "zajtra" : (DNI_SK[c.weekday] + " " + Number(c.day) + ". " + Number(c.month) + ".");
    return slovo + " o " + cas(iso);
  }

  /* ---------- kalendár ---------- */
  var dniEl = $("#dni"), slotyEl = $("#sloty"), stav = $("#kalStav"), form = $("#formular");
  var btn = $("#rezervovat"), chyba = $("#chyba");
  var dni = [], vybranyCas = null, bezi = false;
  if (kontakt.meno) form.meno.value = kontakt.meno;
  if (kontakt.email) form.email.value = kontakt.email;

  function nacitaj() {
    stav.hidden = false; stav.textContent = "Načítavam voľné časy…";
    return fetch("/api/sloty?typ=rozhovor").then(function (r) { return r.json(); }).then(function (x) {
      if (!x || !x.ok) throw new Error("sloty");
      dni = (x.days || []).filter(function (d) { return d.slots && d.slots.length; }).slice(0, MAX_DNI)
        .map(function (d) { return { date: d.date, slots: d.slots.slice(0, MAX_CASOV) }; });
      if (!dni.length) {
        stav.innerHTML = 'Na najbližšie dni je obsadené. Zavolaj mi prosím na <a href="tel:+421918819906">' + TEL + '</a>.';
        return;
      }
      stav.hidden = true;
      var c0 = casti(dni[0].slots[0]);
      $("#najblizsi").textContent = SKRAT[c0.weekday] + " " + Number(c0.day) + ". " + Number(c0.month) + ". o " + cas(dni[0].slots[0]);
      kresliDni(); vyberDen(0);
    }).catch(function () {
      stav.hidden = false;
      stav.innerHTML = 'Časy sa nepodarilo načítať. Zavolaj mi prosím na <a href="tel:+421918819906">' + TEL + '</a>.';
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
    vybranyCas = null;   // prepnutie dňa zruší výber
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
    btn.textContent = "Rezervovať hovor zadarmo";
  }

  function hodnota(meno) { var e = form.querySelector('[name="' + meno + '"]'); return e ? String(e.value || "").trim() : ""; }
  function zle(meno, je) { var e = form.querySelector('[name="' + meno + '"]'); if (e) e.classList.toggle("zle", je); }
  function povedz(t) { chyba.innerHTML = t; chyba.classList.add("vidno"); }

  Array.prototype.forEach.call(form.querySelectorAll("input"), function (e) {
    e.addEventListener("input", function () { e.classList.remove("zle"); chyba.classList.remove("vidno"); });
  });

  function hotovo(d, test) {
    var h = $("#hotovo");
    h.innerHTML = "<h3>Hotovo, " + esc(d.meno) + "</h3>" +
      "<p>Zavolám ti <b>" + esc(kedy(vybranyCas)) + "</b> na číslo " + esc(d.telefon) + ". Potvrdenie ti príde SMS aj e-mailom.</p>" +
      "<p>Ak chceš, odpíš na potvrdzujúci e-mail fotkou tej miestnosti. Pripravím sa lepšie.</p>" +
      (test ? '<span class="nahlad">Náhľad: rezervácia sa neuložila a nič neodišlo.</span>' : "");
    $("#kal").hidden = true;
    h.hidden = false;
    try { h.focus({ preventScroll: true }); } catch (e) {}
    h.scrollIntoView({ block: "center" });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (bezi || !vybranyCas) return;
    var d = { meno: hodnota("meno").replace(/\s+/g, " "), email: hodnota("email"), telefon: hodnota("telefon") };
    var zlyMail = !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(d.email);
    var zlyTel = d.telefon.replace(/\D/g, "").length < 9;
    zle("meno", d.meno.length < 2); zle("email", zlyMail); zle("telefon", zlyTel);
    if (d.meno.length < 2) return povedz("Napíš prosím krstné meno.");
    if (zlyMail) return povedz("Ten e-mail nevyzerá platne.");
    if (zlyTel) return povedz("Telefónne číslo vyzerá krátko.");

    bezi = true; btn.disabled = true; btn.textContent = "Rezervujem…";
    try { sessionStorage.setItem("mc_kontakt", JSON.stringify({ meno: d.meno, email: d.email })); } catch (err) {}
    var telo = { start: vybranyCas, meno: d.meno, email: d.email, telefon: d.telefon, odpovede: o };
    fetch("/api/rozhovor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(telo) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (x) { return { s: r.status, x: x }; }); })
      .then(function (v) {
        if (v.x && v.x.ok) { hotovo(d, !!v.x.test); return; }
        bezi = false;
        if (v.s === 409) { obnov(); povedz("Tento čas si práve niekto vzal. Vyber si prosím iný."); nacitaj(); return; }
        if (v.x && v.x.error === "bad_phone") { obnov(); zle("telefon", true); povedz("Toto telefónne číslo nevyzerá správne. Skontroluj ho prosím."); return; }
        throw new Error("rozhovor");
      })
      .catch(function () {
        bezi = false; obnov();
        povedz('Rezerváciu sa nepodarilo dokončiť. Zavolaj mi prosím na <a href="tel:+421918819906">' + TEL + '</a>, čas dohodneme hneď.');
      });
  });

  nacitaj();
})();
