/* Meranie lievika „Plán od Miriam“ do D1, karta Lievik v konzole, pohľad Plán (3. 11. 2026, Jano:
   „skontroluj všetko napojené správne na konzolu“). Podľa GHLtool lievik/06_KONZOLA.md.
   Ten istý sid a tie isté kľúče v sessionStorage ako meranie diagnostiky (functions/_lib/lievik.js),
   takže kto z plánu prejde na /diagnostika, je tam ten istý človek s tou istou reklamou.
   🔴 Nový krok treba pridať aj do KROKY vo functions/_lib/lievik.js, do zberača
      (meranie/zberac/dist/_worker.js, KROKY_PLAN) a do konzoly (PLAN_POPIS), inak ho server zahodí.
   Bez cookies a bez osobných údajov: náhodné číslo návštevy, reklama z adresy, typ zariadenia.
   Náhľady (TEST_REZIM) server do D1 nezapisuje. */
(function () {
  "use strict";
  var poslane = {};
  function sid() {
    var s = sessionStorage.getItem("lievik_sid");
    if (!s) {
      s = ((window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random())
        .replace(/[^a-z0-9]/gi, "").slice(0, 32);
      sessionStorage.setItem("lievik_sid", s);
    }
    return s;
  }
  function drz(k, p) {
    var q = new URLSearchParams(location.search).get(p);
    if (q) sessionStorage.setItem("lievik_" + k, q);
    return sessionStorage.getItem("lievik_" + k) || "";
  }
  /* raz = krok sa za jednu návštevu stránky pošle najviac raz */
  window.PLAN_KROK = function (krok, meta, raz) {
    try {
      if (raz) { if (poslane[krok]) return; poslane[krok] = 1; }
      var telo = JSON.stringify({ sid: sid(), krok: krok, stranka: location.pathname,
        kreativa: drz("kreativa", "utm_content"), zdroj: drz("zdroj", "utm_source"),
        umiestnenie: drz("umiestnenie", "utm_term"), meta: meta == null ? null : String(meta) });
      /* text/plain zámerne: iný typ spustí preflight a beacon pri odchode nestihne */
      if (!(navigator.sendBeacon && navigator.sendBeacon("/api/krok", new Blob([telo], { type: "text/plain" }))))
        fetch("/api/krok", { method: "POST", body: telo, keepalive: true });
    } catch (e) { /* meranie nesmie pokaziť stránku */ }
  };
  try {
    if (window.top !== window.self) return;   // stránka v iframe (náhľad) sa nemeria
    /* na plan.* ukazuje „/“ stránku /profil (functions/_middleware.js) */
    var p = location.pathname.replace(/\.html$/, "").replace(/\/+$/, "");
    if (p === "/profil" || p === "") window.PLAN_KROK("plan-pristal", null, true);
    else if (p === "/profil-rezervacia") window.PLAN_KROK("plan-rezervacia-pristal", null, true);
    document.addEventListener("DOMContentLoaded", function () {
      var f = document.getElementById("planForm");
      if (!f) return;
      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (z) {
          for (var i = 0; i < z.length; i++) if (z[i].isIntersecting) {
            window.PLAN_KROK("plan-formular-videl", null, true); io.disconnect(); return;
          }
        });
        io.observe(document.getElementById("otazky") || f);
      }
      f.addEventListener("change", function () { window.PLAN_KROK("plan-formular-zacal", null, true); });
    });
  } catch (e) {}
})();
