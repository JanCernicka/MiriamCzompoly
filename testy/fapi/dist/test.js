/* Testovacia stránka: ako by vyzerala platba FAPI na /diagnostika.
   Termíny sú UKÁŽKOVÉ a nič sa nerezervuje: žiadne volanie do GHL.
   Formulár FAPI je skutočný, jeho odoslanie by u Miriam založilo objednávku. */
(function () {
  "use strict";
  var V = document.body.getAttribute("data-v");
  var FAPI = "https://form.fapi.cz/script.php?id=33a88ecd-b33c-4a70-ab01-7f490ad088c0";
  function $(s, k) { return (k || document).querySelector(s); }
  function $$(s, k) { return Array.prototype.slice.call((k || document).querySelectorAll(s)); }

  /* ---------- ukážkové termíny: najbližších 5 pracovných dní ---------- */
  var DNI = ["ne", "po", "ut", "st", "št", "pi", "so"];
  var DNI_DLHE = ["v nedeľu", "v pondelok", "v utorok", "v stredu", "vo štvrtok", "v piatok", "v sobotu"];
  var CASY = ["9:00", "10:00", "11:00", "13:00", "14:00", "15:00"];
  var dni = [], d = new Date();
  while (dni.length < 5) {
    d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    dni.push({ d: d, casy: CASY.filter(function (_, i) { return (i + dni.length) % 3 !== 2; }) });
  }
  var vybranyDen = 0, vybranyCas = null;
  function popis(i, cas) { var x = dni[i].d; return DNI_DLHE[x.getDay()] + " " + x.getDate() + ". " + (x.getMonth() + 1) + ". o " + cas; }

  var dniEl = $("#dni"), slotyEl = $("#sloty"), btn = $("#rezervovat");
  function kresliDni() {
    dniEl.innerHTML = dni.map(function (x, i) {
      return '<button type="button" class="denP" data-i="' + i + '"><span class="d1">' + DNI[x.d.getDay()] +
        '</span><span class="d2">' + x.d.getDate() + ". " + (x.d.getMonth() + 1) + '.</span><span class="d3">' +
        x.casy.length + " časy</span></button>";
    }).join("");
    $$(".denP", dniEl).forEach(function (b) { b.onclick = function () { vyberDen(+b.getAttribute("data-i")); }; });
  }
  function vyberDen(i) {
    vybranyDen = i; vybranyCas = null;
    $$(".denP", dniEl).forEach(function (b, j) { b.classList.toggle("on", j === i); });
    slotyEl.innerHTML = dni[i].casy.map(function (c) { return '<button type="button" class="termin">' + c + "</button>"; }).join("");
    $$(".termin", slotyEl).forEach(function (b) {
      b.onclick = function () {
        vybranyCas = b.textContent;
        $$(".termin", slotyEl).forEach(function (x) { x.classList.toggle("vybrany", x === b); });
        $("#formular").hidden = false; obnov();
      };
    });
    obnov();
  }
  function obnov() {
    if (!btn) return;
    btn.disabled = !vybranyCas;
    btn.textContent = vybranyCas ? (V === "navrh" ? "Pokračovať na platbu" : "Rezervovať " + popis(vybranyDen, vybranyCas)) : "Vyber si čas";
  }
  kresliDni(); vyberDen(0);

  function hodnota(n) { var e = $('#formular [name="' + n + '"]'); return e ? (e.type === "checkbox" ? e.checked : e.value.trim()) : ""; }

  /* ---------- načítanie FAPI do pripraveného miesta ---------- */
  function nacitajFapi(kam) {
    var s = document.createElement("script");
    s.src = FAPI; s.type = "text/javascript";
    kam.appendChild(s);   // FAPI sa vloží hneď ZA svoj <script> (document.currentScript)
  }
  if (V === "vlozene" || V === "navrh") nacitajFapi($("#fapi"));

  /* ---------- predvyplnenie FAPI údajmi z nášho formulára ----------
     FAPI je vložené priamo do stránky (nie iframe), polia majú mená
     email, phone, first_name, last_name, street, city, zip, notes. */
  function vloz(meno, hodn) {
    var e = $('#fapi [name="' + meno + '"]');
    if (!e || !hodn) return false;
    var proto = e.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(e, hodn);
    ["input", "change", "blur"].forEach(function (t) { e.dispatchEvent(new Event(t, { bubbles: true })); });
    return true;
  }
  /* 0907 777 555 -> +421907777555. FAPI inak číslo zamietne ako neplatné. */
  function medzinarodne(t) {
    var c = t.replace(/[^\d+]/g, "");
    if (/^00/.test(c)) return "+" + c.slice(2);
    if (/^0\d{9}$/.test(c)) return "+421" + c.slice(1);
    return c;
  }
  function predvypln(udaje) {
    var pokusy = 0;
    (function skus() {
      if (!$('#fapi [name="email"]')) { if (++pokusy < 50) setTimeout(skus, 200); return; }
      Object.keys(udaje).forEach(function (k) { vloz(k, udaje[k]); });
    })();
  }

  /* ---------- odoslanie nášho formulára (NIČ sa neposiela) ---------- */
  $("#formular").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!vybranyCas) return;
    var kedy = popis(vybranyDen, vybranyCas);
    if (V === "navrh") {
      var chyba = $("#chyba");
      var u = { meno: hodnota("meno"), priezvisko: hodnota("priezvisko"), email: hodnota("email"), telefon: hodnota("telefon"),
                ulica: hodnota("ulica"), mesto: hodnota("mesto"), psc: hodnota("psc") };
      var chyba1 = !u.meno ? "Napíš prosím meno." : !u.priezvisko ? "Napíš prosím priezvisko, bude na faktúre." :
        !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(u.email) ? "Ten e-mail nevyzerá platne." :
        u.telefon.replace(/\D/g, "").length < 9 ? "Telefónne číslo vyzerá krátko." :
        (!u.ulica || !u.mesto || !u.psc) ? "Napíš prosím ulicu, mesto a PSČ, kam mám prísť." :
        !hodnota("suhlas") ? "Bez zaškrtnutia ti neviem poslať potvrdenie termínu." : "";
      if (chyba1) { chyba.textContent = chyba1; chyba.classList.add("vidno"); return; }
      chyba.classList.remove("vidno");
      $("#krok-udaje").hidden = true;
      $("#krok-termin").hidden = true;
      $("#krok-platba").hidden = false; $("#fapi").hidden = false;
      $$(".kroky li").forEach(function (li, i) { li.className = i < 2 ? "hotovo" : "on"; });
      $("#suhrnKedy").textContent = kedy.charAt(0).toUpperCase() + kedy.slice(1);
      $("#suhrnKde").textContent = u.ulica + ", " + u.mesto;
      predvypln({ country: "SK", email: u.email, phone: medzinarodne(u.telefon), first_name: u.meno, last_name: u.priezvisko,
                  street: u.ulica, city: u.mesto, zip: u.psc, notes: "Termín diagnostiky: " + kedy });
      $("#kalendar").scrollIntoView({ behavior: "smooth" });
      return;
    }
    // varianty 1 a 2: termín „rezervovaný“, platba je samostatne nižšie
    $("#kalHotovo").hidden = false;
    $("#kalHotovoKedy").textContent = kedy;
    $("#formular").hidden = true; slotyEl.hidden = true; dniEl.hidden = true;
  });
  var spat = $("#spat");
  if (spat) spat.onclick = function () {
    $("#krok-platba").hidden = true; $("#fapi").hidden = true; $("#krok-termin").hidden = false; $("#krok-udaje").hidden = false;
    $$(".kroky li").forEach(function (li, i) { li.className = i === 0 ? "on" : ""; });
  };
})();
