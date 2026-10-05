/* Varianta A (/diagnostika): vlastný kalendár namiesto GHL widgetu (od 2. 10. 2026).
   GHL widget nevie po slovensky a tlačidlo v ňom sa nedá prepísať na
   „Rezervovať s povinnosťou platby“. Termíny aj zápis idú do toho istého
   GHL kalendára cez /api/sloty a /api/termin, rovnako ako na B.
   Logika je kópia diagnostika-b/dist/b/js/b.js, zmeny: stranka "a", bez pásu fotiek. */
(function () {
  "use strict";
  var TEL = "+421 918 819 906";
  var MAX_DNI = 5, MAX_CASOV = 8;

  function $(s) { return document.querySelector(s); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

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

  /* ---------- typ diagnostiky: u teba doma (290 €) alebo online (250 €), od 5. 10. 2026 ----------
     Online má vlastný kalendár (iné voľné časy) a nepýta adresu. */
  var typ = "osobne";
  var POZN = {
    osobne: "90 minút priamo v tvojom priestore + písomné zhrnutie. Do 25 km od Trnavy je cesta v cene, ďalej 0,50 € za km.",
    online: "90 minút online + písomné zhrnutie do troch dní. Fotky a pôdorys mi pošleš vopred, aby sme čas nestrácali obhliadkou."
  };
  function nastavTyp(novy) {
    typ = novy === "online" ? "online" : "osobne";
    Array.prototype.forEach.call(document.querySelectorAll(".typ[data-typ]"), function (b) {
      var je = b.getAttribute("data-typ") === typ;
      b.classList.toggle("on", je); b.setAttribute("aria-checked", je ? "true" : "false");
    });
    var a = document.getElementById("adresa"); if (a) a.hidden = typ === "online";
    var p = document.getElementById("typPozn"); if (p) p.textContent = POZN[typ];
  }
  Array.prototype.forEach.call(document.querySelectorAll(".typ[data-typ]"), function (b) {
    b.addEventListener("click", function () {
      if (b.getAttribute("data-typ") === typ) return;
      nastavTyp(b.getAttribute("data-typ")); vybranyCas = null; form.hidden = true; nacitaj();
    });
  });

  function nacitaj() {
    stav.hidden = false; stav.textContent = "Načítavam voľné termíny…";
    return fetch("/api/sloty?typ=" + typ).then(function (r) { return r.json(); }).then(function (o) {
      if (!o || !o.ok) throw new Error("sloty");
      dni = (o.days || []).filter(function (d) { return d.slots && d.slots.length; }).slice(0, MAX_DNI)
        .map(function (d) { return { date: d.date, slots: d.slots.slice(0, MAX_CASOV) }; });
      if (!dni.length) {
        stav.innerHTML = 'Na najbližšie dni je obsadené. Zavolaj mi prosím na <a href="tel:+421918819906">' + TEL + '</a>.';
        return;
      }
      stav.hidden = true;
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
    btn.textContent = "Rezervovať s povinnosťou platby";   // termín vidno na vybranom čase, platba (290 € alebo 250 €) nasleduje na /dakujem
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
    var d = { meno: hodnota("meno"), priezvisko: hodnota("priezvisko"), email: hodnota("email"), telefon: hodnota("telefon"),
              ulica: hodnota("ulica"), mesto: hodnota("mesto"), psc: hodnota("psc"), suhlas: hodnota("suhlas") };
    var zlyMail = !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(d.email);
    zle("meno", d.meno.length < 2); zle("priezvisko", d.priezvisko.length < 2); zle("email", zlyMail); zle("telefon", d.telefon.replace(/\D/g, "").length < 9);
    var osobne = typ !== "online";
    zle("ulica", osobne && (d.ulica.length < 3 || !/\d/.test(d.ulica))); zle("mesto", osobne && d.mesto.length < 2); zle("psc", osobne && d.psc.replace(/\D/g, "").length !== 5);
    if (d.meno.length < 2) return povedz("Napíš prosím meno.");
    if (d.priezvisko.length < 2) return povedz("Napíš prosím priezvisko, bude na faktúre.");
    if (zlyMail) return povedz("Ten e-mail nevyzerá platne.");
    if (d.telefon.replace(/\D/g, "").length < 9) return povedz("Telefónne číslo vyzerá krátko.");
    if (typ !== "online" && (d.ulica.length < 3 || !/\d/.test(d.ulica) || d.mesto.length < 2)) return povedz("Napíš prosím ulicu, číslo a mesto, kam mám prísť.");
    if (typ !== "online" && d.psc.replace(/\D/g, "").length !== 5) return povedz("PSČ má päť číslic, napríklad 917 01.");
    if (!d.suhlas) return povedz("Bez zaškrtnutia ti neviem poslať potvrdenie termínu.");

    bezi = true; btn.disabled = true; btn.textContent = "Rezervujem…";
    var telo = { start: vybranyCas, meno: d.meno, priezvisko: d.priezvisko, email: d.email, telefon: d.telefon,
                 ulica: d.ulica, mesto: d.mesto, psc: d.psc, typ: typ,
                 stranka: "a", ab: window.LIEVIK_AB || "a", sid: window.LIEVIK_SID || "" };
    fetch("/api/termin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(telo) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (o) { return { s: r.status, o: o }; }); })
      .then(function (x) {
        if (x.o && x.o.ok) {
          try {
            sessionStorage.setItem("mc_meno", d.meno);
            sessionStorage.setItem("mc_rezervacia", "1");   // meranie: až teraz sa /dakujem ráta ako rezervácia
            /* pre formulár FAPI na /dakujem (assets/js/platba.js na hlavnom webe) */
            sessionStorage.setItem("mc_platba", JSON.stringify({ meno: d.meno, priezvisko: d.priezvisko, email: d.email,
              telefon: d.telefon, ulica: d.ulica, mesto: d.mesto, psc: d.psc, kedy: kedy(vybranyCas) }));
          } catch (err) {}
          location.href = "/dakujem?typ=" + typ;
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
