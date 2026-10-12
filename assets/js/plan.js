/* /plan: plán od Miriam, poskladaný z jej textov v profil-data.js podľa odpovedí
   (?m=&d=&n=&p=, termín a rozpočet plán nemenia). Bez platných odpovedí ide človek na test. */
(function () {
  "use strict";
  var P = window.PROFIL;
  if (!P) return;
  function $(s) { return document.querySelector(s); }
  var esc = P.esc;

  var o = P.zAdresy(location.search, P.PLAN_KLUCE);
  if (!o) { location.replace("/profil#formular"); return; }

  var M = P.MIESTA[o.m], D = P.PROBLEMY[o.d], N = P.NABYTOK[o.n], C = P.POCITY[o.p];
  document.title = D.nazov + " · tvoj plán od Miriam";
  $("#oslovenie").textContent = M.oslovenie;
  $("#verdikt").textContent = D.nazov;
  $("#uvod").textContent = D.uvod;
  $("#nabytok").textContent = N.veta;
  $("#kroky").innerHTML = D.kroky.map(function (k) { return "<li>" + esc(k) + "</li>"; }).join("");
  $("#pocitNadpis").textContent = "Pocit, ktorý chceš: " + C.n.toLowerCase();
  $("#pocit").textContent = C.odsek;
  var f = $("#foto"); f.src = M.foto; f.alt = M.veta;
  $("#fotoVeta").textContent = M.veta;
  $("#most").textContent = "Toto je smer. Čo " + M.lok + " konkrétne zmeniť, čo nechať a v akom poradí, aby si neprepálila peniaze, robím na diagnostike.";
})();
