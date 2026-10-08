/* Test na stránke /profil: jedna otázka na obrazovku, klik = ďalšia otázka.
   Po poslednej odpovedi rozhodne PROFIL.rozhodni(), kam človek ide:
     rozhovor → /profil-rezervacia (kvalifikovaní, profil nedostanú, dostanú rozhovor)
     profil   → /profil-vysledok   (ostatní, profil automaticky)
   Kontakt sa v teste nepýta. Kvalifikovaní ho dajú pri rezervácii, ostatní pri „pošli mi profil“. */
(function () {
  "use strict";
  var P = window.PROFIL;
  if (!P) return;

  var test = document.getElementById("test"), telo = document.getElementById("telo");
  var krok = document.getElementById("krok"), otazka = document.getElementById("otazka");
  var dlazdice = document.getElementById("dlazdice"), postup = document.getElementById("postup");
  var spat = document.getElementById("spat"), zavriet = document.getElementById("zavriet");
  var Q = P.OTAZKY, n = Q.length;
  var odp = {}, i = 0, otvoril = null, ide = false;

  // „Zmeniť odpovede“ z rezervácie alebo výsledku: predvyplniť, nech netreba klikať odznova
  try { var pred = P.zAdresy(location.search); if (pred) odp = pred; } catch (e) {}

  function kresli() {
    var q = Q[i];
    krok.textContent = "Otázka " + (i + 1) + " zo " + n;
    postup.style.width = Math.round(i / n * 100) + "%";
    otazka.textContent = q.t;
    spat.disabled = i === 0;
    dlazdice.className = "dlazdice" + (q.k === "s" || q.k === "r" ? " siroke" : "");
    dlazdice.innerHTML = Object.keys(q.z).map(function (k) {
      var v = q.z[k], on = odp[q.k] === k;
      return '<button type="button" class="dlazdica' + (on ? " on" : "") + '" data-k="' + P.esc(k) + '" aria-pressed="' + (on ? "true" : "false") + '">' +
        "<b>" + P.esc(v.n) + "</b>" + (v.h ? "<span>" + P.esc(v.h) + "</span>" : "") + "</button>";
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
      if (i < n - 1) { i++; kresli(); } else { hotovo(); }
    }, 200);
  }

  function hotovo() {
    postup.style.width = "100%";
    spat.disabled = true;
    telo.hidden = true;
    document.getElementById("vyhodnocujem").hidden = false;
    P.uloz(odp);
    var kam = P.rozhodni(odp) === "rozhovor" ? "/profil-rezervacia?" : "/profil-vysledok?";
    setTimeout(function () { location.href = kam + P.doAdresy(odp); }, 900);
  }

  function otvor(od) {
    otvoril = od || null;
    i = 0;
    telo.hidden = false;
    document.getElementById("vyhodnocujem").hidden = true;
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
  spat.addEventListener("click", function () { if (i > 0) { i--; kresli(); } });
  zavriet.addEventListener("click", zatvor);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !test.hidden) zatvor(); });

  try { P.recenzie("#kopa", 4); } catch (e) { /* zvyšok stránky beží ďalej */ }
  if (location.hash === "#test") otvor(null);
})();
