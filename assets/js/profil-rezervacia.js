/* /profil-rezervacia: kvalifikovaní z testu. Profil nedostanú, dostanú 20 minút s Miriam,
   ktorá im podľa odpovedí pripraví riešenie vopred.
   Kalendár ako na variante B (diagnostika-b/dist/b/js/b.js), voľné časy z /api/sloty?typ=rozhovor.
   Rezervácia ide na /api/rozhovor. 🔴 Ten je zatiaľ zapojený LEN na náhľade (TEST_REZIM=1),
   naostro vráti 503, kým sa s Miriam nedohodne kalendár a potvrdenie. */
(function () {
  "use strict";
  var P = window.PROFIL;
  if (!P) return;
  var TEL = "+421 918 819 906";
  var MAX_DNI = 5, MAX_CASOV = 8;

  function $(s) { return document.querySelector(s); }
  var esc = P.esc;

  /* ---------- odpovede z testu ---------- */
  var o = P.zAdresy(location.search);
  if (!o) { location.replace("/profil#test"); return; }
  P.uloz(o);

  var M = P.MIESTA[o.m];
  var riadky = [
    ["Pocit", P.POCITY[o.p].n], ["Miesto", M.n], ["Prečo", P.DOVODY[o.d].n],
    ["Svetlo", P.SVETLO[o.s].n], ["Začať", P.KEDY[o.k].n], ["Rozpočet", P.ROZPOCET[o.r].n]
  ];
  $("#odpovede").innerHTML = riadky.map(function (r) { return "<dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd>"; }).join("");
  $("#zmenit").href = "/profil?" + P.doAdresy(o) + "#test";
  $("#bod1").textContent = "Riešenie " + (o.m === "kut" ? "pre tvoj " : "pre tvoju ") + M.akuz;
  $("#bod2").textContent = "Aby si doma cítila " + P.POCITY[o.p].n.toLowerCase() + ". Vyberiem ich podľa svetla, ktoré máš.";
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

  function hodnota(meno) {
    var e = form.querySelector('[name="' + meno + '"]');
    return e ? (e.type === "checkbox" ? e.checked : String(e.value || "").trim()) : "";
  }
  function zle(meno, je) { var e = form.querySelector('[name="' + meno + '"]'); if (e) e.classList.toggle("zle", je); }
  function povedz(t) { chyba.innerHTML = t; chyba.classList.add("vidno"); }

  Array.prototype.forEach.call(form.querySelectorAll("input"), function (e) {
    e.addEventListener("input", function () { e.classList.remove("zle"); chyba.classList.remove("vidno"); });
  });

  function hotovo(d, test) {
    var h = $("#hotovo");
    h.innerHTML = "<h3>Hotovo, " + esc(d.meno) + "</h3>" +
      "<p>Hovor máme <b>" + esc(kedy(vybranyCas)) + "</b>. Potvrdenie ti príde e-mailom aj SMS.</p>" +
      "<p>Ak chceš, odpíš na potvrdenie 2 až 3 fotkami tej miestnosti. Pripravím sa lepšie.</p>" +
      "<p>Ak sa rozhodujete spolu s partnerom, príďte na hovor obaja.</p>" +
      (test ? '<span class="nahlad">Náhľad: rezervácia sa neuložila a nič neodišlo.</span>' : "");
    $("#kal").hidden = true;
    h.hidden = false;
    try { h.focus({ preventScroll: true }); } catch (e) {}
    h.scrollIntoView({ block: "center" });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (bezi || !vybranyCas) return;
    var d = { meno: hodnota("meno"), email: hodnota("email"), telefon: hodnota("telefon"), suhlas: hodnota("suhlas") };
    var zlyMail = !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(d.email);
    zle("meno", d.meno.length < 2); zle("email", zlyMail); zle("telefon", d.telefon.replace(/\D/g, "").length < 9);
    if (d.meno.length < 2) return povedz("Napíš prosím krstné meno.");
    if (zlyMail) return povedz("Ten e-mail nevyzerá platne.");
    if (d.telefon.replace(/\D/g, "").length < 9) return povedz("Telefónne číslo vyzerá krátko.");
    if (!d.suhlas) return povedz("Bez zaškrtnutia ti neviem poslať potvrdenie hovoru.");

    bezi = true; btn.disabled = true; btn.textContent = "Rezervujem…";
    var telo = { start: vybranyCas, meno: d.meno, email: d.email, telefon: d.telefon, odpovede: o };
    fetch("/api/rozhovor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(telo) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (x) { return { s: r.status, x: x }; }); })
      .then(function (v) {
        if (v.x && v.x.ok) { hotovo(d, !!v.x.test); return; }
        bezi = false;
        if (v.s === 409) { obnov(); povedz("Tento čas si práve niekto vzal. Vyber si prosím iný."); nacitaj(); return; }
        throw new Error("rozhovor");
      })
      .catch(function () {
        bezi = false; obnov();
        povedz('Rezerváciu sa nepodarilo dokončiť. Zavolaj mi prosím na <a href="tel:+421918819906">' + TEL + '</a>, čas dohodneme hneď.');
      });
  });

  nacitaj();
})();
