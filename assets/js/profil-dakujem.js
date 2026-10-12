/* /profil-dakujem: vlažní a ostatní z testu. Plán im odišiel e-mailom (/api/profil),
   tu vidia len prvú vetu z neho a ponuku diagnostiky. Celý plán je na /plan (odkaz v e-maile). */
(function () {
  "use strict";
  var P = window.PROFIL;
  if (!P) return;
  function $(s) { return document.querySelector(s); }
  var esc = P.esc;

  var kontakt = {};
  try { kontakt = JSON.parse(sessionStorage.getItem("mc_kontakt") || "null") || {}; } catch (e) {}
  if (kontakt.email) {
    $("#komu").innerHTML = (kontakt.meno ? esc(kontakt.meno) + ", poslala" : "Poslala") + " som ho na <b>" + esc(kontakt.email) +
      "</b>. Ak ho do pár minút nevidíš, pozri priečinok Promo alebo Spam.";
  }

  var o = P.zAdresy(location.search, P.PLAN_KLUCE);
  if (o) {
    var D = P.PROBLEMY[o.d];
    $("#verdikt").textContent = D.nazov;
    $("#uvod").textContent = D.uvod;
    $("#ochutnavka").hidden = false;
    $("#most").textContent = "Plán ti ukáže smer. Čo " + P.MIESTA[o.m].lok + " konkrétne zmeniť, čo nechať a v akom poradí, aby si neprepálila peniaze, robím na diagnostike.";
  }
  if (/(?:^|[?&])nahlad=1(?:&|$)/.test(location.search)) $("#nahlad").hidden = false;
  try { P.recenzie("#kopa", 3); } catch (e) {}
})();
