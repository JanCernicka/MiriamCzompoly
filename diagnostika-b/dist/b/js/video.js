/* Video s pulzujúcim prekryvom. Doslova podľa GHLtool lievik/02_KOD.md.
   Načítava sa HNEĎ ZA videom, v samostatnom súbore, aby ho chyba v inom
   skripte (recenzie, kalendár) nemohla zhodiť. */
(function(){
  var v = document.getElementById("vsl"), b = document.getElementById("zvuk");
  if (!v || !b) return;
  var r1 = b.querySelector(".r1"), r2 = b.querySelector(".r2");

  /* 🔴 Prekryv sa smie schovať AŽ KEĎ video naozaj ide. */
  function bezi(){ return !v.paused && !v.ended && v.readyState > 2; }
  function popis(a, c){ if (r1) r1.textContent = a; if (r2) r2.textContent = c; }

  v.addEventListener("error", function(){
    v.controls = true;
    popis("Video sa nenačítalo", "Klepni na prehrávač a skús to znova");
  });

  var p0 = v.play();
  if (p0 && p0.then) {
    p0.then(function(){ popis("Video už beží", "Klepni a zapni zvuk"); })
      .catch(function(){ popis("Klepni a pusti video", "so zvukom, od začiatku"); });
  }

  /* 🔴 KLEPNUTIE PLATÍ NA CELOM VIDEU, nielen na prekryve. */
  var ram = v.parentElement;
  if (ram) ram.addEventListener("click", function(e){
    if (b.hidden) return;
    if (e.target === b || b.contains(e.target)) return;
    b.click();
  });

  b.addEventListener("click", function(){
    b.hidden = true;
    v.controls = true;
    v.muted = false;
    try { v.volume = 1; } catch (e) {}

    function pust(){
      var slub = v.play();
      if (slub && slub.catch) slub.catch(function(){ v.controls = true; });
    }

    /* 🔴 PORADIE NEMENIŤ. `currentTime = 0` začne pretáčanie a prehliadač kvôli
       nemu prebiehajúce `play()` zruší (AbortError). Najprv pretáčať, potom púšťať. */
    if (v.readyState >= 1 && v.currentTime > 0.1) {
      v.addEventListener("seeked", pust, { once: true });
      setTimeout(function(){ if (v.paused) pust(); }, 700);   // poistka
      try { v.currentTime = 0; } catch (e) { pust(); }
    } else {
      pust();
    }
  });

  v.addEventListener("volumechange", function(){ if (!v.muted && bezi()) b.hidden = true; });
})();
