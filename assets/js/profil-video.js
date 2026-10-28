/* Video na /profil a /profil-rezervacia (12. 10. 2026, zvuk 28. 10. 2026, Jano).
   Video sa pustí samo bez zvuku a cez neho je pulzujúci prekryv „Klikni a zapni zvuk“.
   Klik pustí video so zvukom od začiatku. Postavené podľa GHLtool lievik/02_KOD.md
   („Video s pulzujúcim prekryvom“), poznámky 🔴 odtiaľ platia aj tu.
   Kým v HTML nie je data-src, ostáva miesto s nápisom. */
(function () {
  "use strict";
  var IKONA = '<svg class="ikona" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';

  Array.prototype.forEach.call(document.querySelectorAll("[data-video]"), function (f) {
    var src = f.getAttribute("data-src"), poster = f.getAttribute("data-poster");
    if (!src) {
      if (poster) f.style.setProperty("--poster", "url('" + poster.replace(/'/g, "") + "')");
      f.classList.add("bez-videa");
      return;
    }

    /* muted a playsinline nie sú voliteľné: bez muted prehliadač autoplay odmietne,
       bez playsinline ho iOS otvorí na celú obrazovku a žena vypadne zo stránky */
    var v = document.createElement("video");
    v.muted = true; v.defaultMuted = true; v.autoplay = true; v.playsInline = true;
    v.setAttribute("muted", ""); v.setAttribute("autoplay", ""); v.setAttribute("playsinline", "");
    v.setAttribute("disablepictureinpicture", "");
    v.preload = "auto";
    if (poster) v.poster = poster;
    v.src = src;

    var b = document.createElement("button");
    b.type = "button";
    b.className = "zvuk";
    b.setAttribute("aria-label", "Zapnúť zvuk a pustiť video od začiatku");
    b.innerHTML = IKONA + '<span class="r1">Video už beží</span><span class="r2">Klikni a zapni zvuk</span>';

    f.innerHTML = "";
    f.appendChild(v);
    f.appendChild(b);

    var r1 = b.querySelector(".r1"), r2 = b.querySelector(".r2");
    function popis(a, c) { r1.textContent = a; r2.textContent = c; }
    function bezi() { return !v.paused && !v.ended && v.readyState > 2; }

    /* Keď sa súbor nedá prehrať, nenecháme čierny obdĺžnik. */
    v.addEventListener("error", function () {
      v.controls = true;
      popis("Video sa nenačítalo", "Klikni na prehrávač a skús to znova");
    });

    /* 🔴 Text „Video už beží“ len keď naozaj beží. Keď prehliadač autoplay odmietne,
       prekryv ponúkne pustenie od začiatku. */
    var p = v.play();
    if (p && p.then) {
      p.then(function () { popis("Video už beží", "Klikni a zapni zvuk"); })
       .catch(function () { popis("Klikni a pusti si video", "so zvukom, od začiatku"); });
    }

    /* 🔴 Klik platí na celom videu, nielen na prekryve (prekryv je o 20 % menší). */
    f.addEventListener("click", function (e) {
      if (b.hidden || e.target === b || b.contains(e.target)) return;
      b.click();
    });

    b.addEventListener("click", function () {
      b.hidden = true;
      v.controls = true;
      v.muted = false;
      try { v.volume = 1; } catch (e) {}
      function pust() {
        var s = v.play();
        if (s && s.catch) s.catch(function () { v.controls = true; });
      }
      /* 🔴 PORADIE NEMENIŤ: najprv pretočiť na začiatok, až potom púšťať. Skok na začiatok
         zruší rozbehnuté play() a jeho prísľub skončí chybou AbortError. */
      if (v.readyState >= 1 && v.currentTime > 0.1) {
        v.addEventListener("seeked", pust, { once: true });
        setTimeout(function () { if (v.paused) pust(); }, 700);   // poistka
        try { v.currentTime = 0; } catch (e) { pust(); }
      } else {
        pust();
      }
    });

    v.addEventListener("volumechange", function () { if (!v.muted && bezi()) b.hidden = true; });
  });
})();
