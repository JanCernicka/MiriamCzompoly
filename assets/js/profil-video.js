/* Horizontálne video na /profil a /profil-rezervacia (12. 10. 2026).
   Kým Miriam video nenatočí, je tam miesto s nápisom. Keď bude, stačí v HTML doplniť
   data-src (mp4, napríklad z GHL médií ako na /diagnostika) a voliteľne data-poster. */
(function () {
  "use strict";
  Array.prototype.forEach.call(document.querySelectorAll("[data-video]"), function (f) {
    var src = f.getAttribute("data-src"), poster = f.getAttribute("data-poster");
    if (!src) {
      if (poster) f.style.setProperty("--poster", "url('" + poster.replace(/'/g, "") + "')");
      f.classList.add("bez-videa");
      return;
    }
    var v = document.createElement("video");
    v.controls = true; v.playsInline = true; v.preload = "metadata";
    v.setAttribute("playsinline", "");
    if (poster) v.poster = poster;
    v.src = src;
    f.innerHTML = "";
    f.appendChild(v);
  });
})();
