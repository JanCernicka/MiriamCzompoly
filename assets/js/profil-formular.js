/* Formulár na /profil (od 12. 10. 2026 celý na stránke, nie po krokoch): 6 otázok od Miriam,
   krstné meno a e-mail. Odpovede aj kontakt idú na /api/profil, ten vráti skupinu (PROFIL.skupina):
     horúci          → /profil-rezervacia, tam doplní už len telefón (meno a e-mail nesie sessionStorage)
     vlažný, ostatní → plán im odišiel e-mailom, idú na /diagnostika so zeleným pruhom hore
                       (functions/diagnostika.js, ?plan=odoslany). utm_source oddelí túto návštevu
                       v meraní od ľudí z reklamy na diagnostiku. */
(function () {
  "use strict";
  var P = window.PROFIL;
  if (!P) return;
  var esc = P.esc;
  var form = document.getElementById("planForm"), otazky = document.getElementById("otazky");
  var chyba = document.getElementById("chyba"), poslat = document.getElementById("poslat");
  var bezi = false;

  // otázky z profil-data.js, aby stránka, e-mail a server mali jeden zdroj
  otazky.innerHTML = P.OTAZKY.map(function (q, i) {
    var siroke = q.k === "k" || q.k === "r";
    return '<fieldset class="otazka" data-k="' + q.k + '"><legend><span class="cislo">' + (i + 1) + "</span>" + esc(q.t) + "</legend>" +
      '<div class="moznosti' + (siroke ? " siroke" : "") + '">' +
      Object.keys(q.z).map(function (k) {
        return '<label class="moznost"><input type="radio" name="' + q.k + '" value="' + esc(k) + '"><span>' + esc(q.z[k].n) + "</span></label>";
      }).join("") + "</div></fieldset>";
  }).join("");

  // návrat z rezervácie („zmeniť odpovede“): predvyplniť
  try {
    var pred = P.zAdresy(location.search);
    if (pred) P.OTAZKY.forEach(function (q) {
      var r = form.querySelector('input[name="' + q.k + '"][value="' + pred[q.k] + '"]'); if (r) r.checked = true;
    });
    var k0 = JSON.parse(sessionStorage.getItem("mc_kontakt") || "null");
    if (k0) { form.meno.value = k0.meno || ""; form.email.value = k0.email || ""; }
  } catch (e) {}

  function povedz(t) { chyba.innerHTML = t; chyba.classList.add("vidno"); }
  form.addEventListener("change", function (e) {
    var f = e.target.closest && e.target.closest(".otazka");
    if (f) f.classList.remove("chyba-otazka");
    chyba.classList.remove("vidno");
  });
  form.addEventListener("input", function (e) { if (e.target.classList) e.target.classList.remove("zle"); chyba.classList.remove("vidno"); });

  function ukaz(el) {
    try { el.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) { el.scrollIntoView(); }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (bezi) return;
    var o = {}, chyba1 = null;
    P.OTAZKY.forEach(function (q) {
      var r = form.querySelector('input[name="' + q.k + '"]:checked');
      var f = form.querySelector('.otazka[data-k="' + q.k + '"]');
      if (r) { o[q.k] = r.value; f.classList.remove("chyba-otazka"); }
      else { f.classList.add("chyba-otazka"); if (!chyba1) chyba1 = f; }
    });
    if (chyba1) { povedz("Vyber prosím odpoveď pri každej otázke."); ukaz(chyba1); return; }
    var meno = String(form.meno.value || "").replace(/\s+/g, " ").trim();
    var email = String(form.email.value || "").trim();
    if (meno.length < 2) { form.meno.classList.add("zle"); povedz("Napíš prosím krstné meno."); ukaz(form.meno); return; }
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email)) { form.email.classList.add("zle"); povedz("Ten e-mail nevyzerá platne."); ukaz(form.email); return; }

    bezi = true; poslat.disabled = true; poslat.textContent = "Posielam…";
    P.uloz(o);
    try { sessionStorage.setItem("mc_kontakt", JSON.stringify({ meno: meno, email: email })); } catch (err) {}
    fetch("/api/profil", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meno: meno, email: email, odpovede: o, website: form.website.value || "" }) })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (x) {
        if (!x || !x.ok) throw new Error("profil");
        var nahlad = x.test ? "&nahlad=1" : "";
        if ((x.skupina || P.skupina(o)) === "horuci") location.href = "/profil-rezervacia?" + P.doAdresy(o) + nahlad;
        else location.href = "/diagnostika?plan=odoslany&utm_source=plan-od-miriam" + nahlad;
      })
      .catch(function () {
        bezi = false; poslat.disabled = false; poslat.textContent = "Poslať mi plán";
        povedz('Plán sa nepodarilo odoslať. Skús to prosím o chvíľu znova alebo mi zavolaj na <a href="tel:+421918819906">0918 819 906</a>.');
      });
  });

  try { P.recenzie("#kopa", 4); } catch (e) { /* zvyšok stránky beží ďalej */ }
})();
