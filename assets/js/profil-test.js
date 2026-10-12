/* Test na stránke /profil: jedna otázka na obrazovku, klik = ďalšia otázka, na konci meno a e-mail.
   Odpovede aj kontakt idú na /api/profil, ten vráti skupinu (PROFIL.skupina, pravidlo od Miriam):
     horúci         → /profil-rezervacia (plán jej Miriam odovzdá osobne na 10-minútovom hovore)
     vlažný, ostatní → /profil-dakujem   (plán odišiel e-mailom, pod ním ponuka diagnostiky)
   E-mail sa pýta pred výsledkom (Miriam), takže kontakt máme od každého, aj od horúcich,
   ktorí si hovor nakoniec nerezervujú. */
(function () {
  "use strict";
  var P = window.PROFIL;
  if (!P) return;

  var test = document.getElementById("test"), telo = document.getElementById("telo");
  var krok = document.getElementById("krok"), otazka = document.getElementById("otazka");
  var dlazdice = document.getElementById("dlazdice"), postup = document.getElementById("postup");
  var spat = document.getElementById("spat"), zavriet = document.getElementById("zavriet");
  var kontakt = document.getElementById("kontakt"), form = document.getElementById("kontaktForm");
  var chyba = document.getElementById("chyba"), poslat = document.getElementById("poslat");
  var vyhodnocujem = document.getElementById("vyhodnocujem");
  var Q = P.OTAZKY, n = Q.length;
  var odp = {}, i = 0, otvoril = null, ide = false, bezi = false;

  // „Zmeniť odpovede“ z ďalších stránok: predvyplniť, nech netreba klikať odznova
  try { var pred = P.zAdresy(location.search); if (pred) odp = pred; } catch (e) {}
  try {
    var k0 = JSON.parse(sessionStorage.getItem("mc_kontakt") || "null");
    if (k0) { form.meno.value = k0.meno || ""; form.email.value = k0.email || ""; }
  } catch (e) {}

  function ukaz(co) {
    telo.hidden = co !== "otazka";
    kontakt.hidden = co !== "kontakt";
    vyhodnocujem.hidden = co !== "cakam";
  }

  function kresli() {
    var q = Q[i];
    ukaz("otazka");
    krok.textContent = "Otázka " + (i + 1) + " zo " + n;
    postup.style.width = Math.round(i / (n + 1) * 100) + "%";
    otazka.textContent = q.t;
    spat.disabled = i === 0;
    dlazdice.className = "dlazdice" + (q.k === "k" || q.k === "r" ? " siroke" : "");
    dlazdice.innerHTML = Object.keys(q.z).map(function (k) {
      var v = q.z[k], on = odp[q.k] === k;
      return '<button type="button" class="dlazdica' + (on ? " on" : "") + '" data-k="' + P.esc(k) + '" aria-pressed="' + (on ? "true" : "false") + '">' +
        "<b>" + P.esc(v.n) + "</b></button>";
    }).join("");
    Array.prototype.forEach.call(dlazdice.querySelectorAll(".dlazdica"), function (b) {
      b.addEventListener("click", function () { vyber(b); });
    });
    try { otazka.focus({ preventScroll: true }); } catch (e) { otazka.focus(); }
    test.scrollTop = 0;
  }

  function vyber(b) {
    if (ide) return;
    odp[Q[i].k] = b.getAttribute("data-k");
    Array.prototype.forEach.call(dlazdice.querySelectorAll(".dlazdica"), function (x) {
      x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b ? "true" : "false");
    });
    ide = true;
    setTimeout(function () {
      ide = false;
      if (i < n - 1) { i++; kresli(); } else { naKontakt(); }
    }, 200);
  }

  function naKontakt() {
    i = n;
    P.uloz(odp);
    postup.style.width = Math.round(n / (n + 1) * 100) + "%";
    spat.disabled = false;
    ukaz("kontakt");
    chyba.classList.remove("vidno");
    try { document.getElementById("kontaktNadpis").focus({ preventScroll: true }); } catch (e) {}
    test.scrollTop = 0;
  }

  function povedz(t) { chyba.innerHTML = t; chyba.classList.add("vidno"); }
  Array.prototype.forEach.call(form.querySelectorAll("input"), function (e) {
    e.addEventListener("input", function () { e.classList.remove("zle"); chyba.classList.remove("vidno"); });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (bezi) return;
    var meno = String(form.meno.value || "").replace(/\s+/g, " ").trim();
    var email = String(form.email.value || "").trim();
    var zlyMail = !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email);
    form.meno.classList.toggle("zle", meno.length < 2);
    form.email.classList.toggle("zle", zlyMail);
    if (meno.length < 2) return povedz("Napíš prosím krstné meno.");
    if (zlyMail) return povedz("Ten e-mail nevyzerá platne.");
    if (!P.platne(odp)) { i = 0; kresli(); return; }

    bezi = true; poslat.disabled = true; poslat.textContent = "Posielam…";
    try { sessionStorage.setItem("mc_kontakt", JSON.stringify({ meno: meno, email: email })); } catch (err) {}
    fetch("/api/profil", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meno: meno, email: email, odpovede: odp, website: form.website.value || "" }) })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (x) {
        if (!x || !x.ok) throw new Error("profil");
        ukaz("cakam");
        postup.style.width = "100%";
        spat.disabled = true;
        var sk = x.skupina || P.skupina(odp);
        var kam = sk === "horuci" ? "/profil-rezervacia?" : "/profil-dakujem?";
        setTimeout(function () { location.href = kam + P.doAdresy(odp) + (x.test ? "&nahlad=1" : ""); }, 700);
      })
      .catch(function () {
        bezi = false; poslat.disabled = false; poslat.textContent = "Chcem svoj plán";
        povedz('Plán sa nepodarilo odoslať. Skús to prosím o chvíľu znova alebo mi zavolaj na <a href="tel:+421918819906">0918 819 906</a>.');
      });
  });

  function otvor(od) {
    otvoril = od || null;
    i = 0;
    test.hidden = false;
    document.documentElement.style.overflow = "hidden";
    kresli();
  }

  function zatvor() {
    test.hidden = true;
    document.documentElement.style.overflow = "";
    if (otvoril) try { otvoril.focus(); } catch (e) {}
    if (location.hash === "#test") try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-test]"), function (b) {
    b.addEventListener("click", function () { otvor(b); });
  });
  spat.addEventListener("click", function () { if (bezi) return; if (i > 0) { i--; kresli(); } });
  zavriet.addEventListener("click", zatvor);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !test.hidden) zatvor(); });

  try { P.recenzie("#kopa", 4); } catch (e) { /* zvyšok stránky beží ďalej */ }
  if (location.hash === "#test") otvor(null);
})();
