/* Formulár na /profil (od 12. 10. 2026 celý na stránke, nie po krokoch): 6 otázok od Miriam,
   krstné meno a e-mail. Odpovede aj kontakt idú na /api/profil, ten vráti skupinu (PROFIL.skupina):
     horúci          → /profil-rezervacia, tam doplní už len telefón (meno a e-mail nesie sessionStorage)
     vlažný, ostatní → plán im odišiel e-mailom, idú na /diagnostika so zeleným pruhom hore
                       (functions/diagnostika.js, ?plan=odoslany). utm_source oddelí túto návštevu
                       v meraní od ľudí z reklamy na diagnostiku.
   Vzhľad otázok (13. 10. 2026, Jano: otázky splývali): každá otázka je karta a každá má svoj typ
   odpovedí. Miestnosť aj problém s ikonou (fotky miestností Jano nechcel, na každú miestnosť ich
   nemáme), nábytok ako stupnica, pocit s farbami nálady, termín a rozpočet ako zoznam. Texty odpovedí sa berú z profil-data.js, tu je len vzhľad. */
(function () {
  "use strict";
  var P = window.PROFIL;
  if (!P) return;
  var esc = P.esc;
  var form = document.getElementById("planForm"), otazky = document.getElementById("otazky");
  var chyba = document.getElementById("chyba"), poslat = document.getElementById("poslat");
  var bezi = false, n = P.OTAZKY.length;
  var plynulo = !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* ---------- vzhľad odpovedí ---------- */
  var TYP = { m: "ikona", d: "ikona", n: "stupnica", p: "nalada", k: "zoznam", r: "zoznam" };
  var IKONY = {
    // miestnosti
    obyvacka: '<path d="M4.5 11V8.6A2.6 2.6 0 0 1 7.1 6h9.8a2.6 2.6 0 0 1 2.6 2.6V11"/><path d="M3 12.6a1.6 1.6 0 0 1 3.2 0V15h11.6v-2.4a1.6 1.6 0 0 1 3.2 0V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M5.5 18v1.6M18.5 18v1.6"/>',
    spalna: '<path d="M3 19V6.5M21 19v-5.6a2.4 2.4 0 0 0-2.4-2.4H3"/><path d="M3 16h18"/><path d="M6 11V9.6A1.6 1.6 0 0 1 7.6 8h2.8A1.6 1.6 0 0 1 12 9.6V11"/>',
    kuchyna: '<path d="M5 11h14v4.5a3.5 3.5 0 0 1-3.5 3.5h-7A3.5 3.5 0 0 1 5 15.5z"/><path d="M3 11h2M19 11h2"/><path d="M9 4.5c-.8.8.8 1.7 0 2.5M12 4.5c-.8.8.8 1.7 0 2.5M15 4.5c-.8.8.8 1.7 0 2.5"/>',
    detska: '<circle cx="12" cy="13.2" r="6.2"/><path d="M7.4 9a2.3 2.3 0 1 1 2.4-2.9M16.6 9a2.3 2.3 0 1 0-2.4-2.9"/><ellipse cx="12" cy="15.4" rx="2.2" ry="1.7"/><path d="M9.6 11.6h.01M14.4 11.6h.01M12 14.9v.4"/>',
    predsien: '<path d="M10.3 7a1.8 1.8 0 1 1 2.6 1.6c-.5.3-.9.7-.9 1.3V11"/><path d="M12 11l-8.1 5.9a1 1 0 0 0 .6 1.8h15a1 1 0 0 0 .6-1.8z"/>',
    kut: '<rect x="5" y="5.5" width="14" height="9.5" rx="1.3"/><path d="M3 18.5h18M10 18.5l.6-1.5h2.8l.6 1.5"/>',
    kupelna: '<path d="M3 12h18v2.4a4.6 4.6 0 0 1-4.6 4.6H7.6A4.6 4.6 0 0 1 3 14.4z"/><path d="M6 12V6.4a2.2 2.2 0 0 1 4-1.3"/><path d="M8.6 7l2.4-1.6"/><path d="M7 19l-1 1.6M17 19l1 1.6"/>',
    // čo prekáža
    tma: '<path d="M19.5 14.6A7.6 7.6 0 1 1 9.4 4.5a6.1 6.1 0 0 0 10.1 10.1z"/>',
    neporiadok: '<rect x="3.5" y="12.5" width="7.5" height="7.5" rx="1"/><rect x="13" y="12.5" width="7.5" height="7.5" rx="1"/><rect x="8.2" y="4.5" width="7.5" height="7.5" rx="1"/>',
    stiesnene: '<path d="M4 4l5 5M9 5.5V9H5.5M20 4l-5 5M15 5.5V9h3.5M4 20l5-5M9 18.5V15H5.5M20 20l-5-5M15 18.5V15h3.5"/>',
    rozlozenie: '<rect x="3.5" y="3.5" width="17" height="17" rx="1.5"/><path d="M3.5 11.5H11V3.5M11 15.5v5M15 11.5h5.5"/>',
    nedokoncene: '<rect x="3.5" y="3.5" width="17" height="17" rx="2" stroke-dasharray="3.4 2.6"/><path d="M8 12.5l2.6 2.6L16 9.6"/>',
    nesedi: '<circle cx="9" cy="9.5" r="5.5"/><rect x="11.5" y="11.5" width="9" height="9" rx="1.2"/>'
  };
  // farby nálady, len ilustrácia pocitu (nie je to paleta z plánu)
  var NALADA = {
    pokoj: ["#d9cdb8", "#a7b3a0", "#8d8778"], hrejivost: ["#e3b98a", "#b5603f", "#4a3326"],
    utulno: ["#ecd8cc", "#c79a8a", "#7b6a5c"], veselost: ["#f2c94c", "#e07a5f", "#9cc9b3"],
    poriadok: ["#f2f1ec", "#d6bf98", "#5f6870"], luxus: ["#2f4a3f", "#b08d57", "#5b2a2e"]
  };

  function obsah(q, k) {
    var v = q.z[k], typ = TYP[q.k], nazov = '<span class="nazov">' + esc(v.n) + "</span>";
    if (typ === "ikona") return '<span class="vol vol-ikona"><span class="ikona" aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24">' + (IKONY[k] || "") + "</svg></span>" + nazov + "</span>";
    if (typ === "nalada") {
      var c = NALADA[k] || ["#ddd", "#bbb", "#999"];
      return '<span class="vol vol-nalada"><span class="farby" aria-hidden="true" style="--f1:' + c[0] + ";--f2:" + c[1] + ";--f3:" + c[2] + '"></span>' + nazov + "</span>";
    }
    if (typ === "stupnica") return '<span class="vol vol-stupnica">' + nazov + "</span>";
    return '<span class="vol vol-zoznam"><span class="kruzok" aria-hidden="true"></span>' + nazov + "</span>";
  }

  otazky.innerHTML = P.OTAZKY.map(function (q, i) {
    return '<fieldset class="otazka typ-' + TYP[q.k] + (q.k === "m" ? " miestnosti" : "") + '" data-k="' + q.k + '">' +
      '<legend><span class="poradie">Otázka ' + (i + 1) + " zo " + n + '</span><span class="text">' + esc(q.t) + "</span></legend>" +
      '<p class="otazka-chyba">Vyber jednu možnosť.</p>' +
      '<div class="moznosti">' + Object.keys(q.z).map(function (k) {
        return '<label class="moznost"><input type="radio" name="' + q.k + '" value="' + esc(k) + '">' + obsah(q, k) + "</label>";
      }).join("") + "</div></fieldset>";
  }).join("");

  /* ---------- postup ---------- */
  var postupText = document.getElementById("postupText"), postupPas = document.getElementById("postupPas");
  function zodpovedane() {
    return P.OTAZKY.filter(function (q) { return form.querySelector('input[name="' + q.k + '"]:checked'); }).length;
  }
  function obnovPostup() {
    var z = zodpovedane();
    if (postupText) postupText.textContent = z === n ? "Hotovo, ešte meno a e-mail" : "Zodpovedané " + z + " zo " + n;
    if (postupPas) postupPas.style.width = Math.round(z / n * 100) + "%";
    P.OTAZKY.forEach(function (q) {
      var f = form.querySelector('.otazka[data-k="' + q.k + '"]');
      f.classList.toggle("hotova", !!form.querySelector('input[name="' + q.k + '"]:checked'));
    });
  }

  // návrat z rezervácie („zmeniť odpovede“): predvyplniť
  try {
    var pred = P.zAdresy(location.search);
    if (pred) P.OTAZKY.forEach(function (q) {
      var r = form.querySelector('input[name="' + q.k + '"][value="' + pred[q.k] + '"]'); if (r) r.checked = true;
    });
    var k0 = JSON.parse(sessionStorage.getItem("mc_kontakt") || "null");
    if (k0) { form.meno.value = k0.meno || ""; form.email.value = k0.email || ""; }
  } catch (e) {}
  obnovPostup();

  function posun(el) {
    var y = el.getBoundingClientRect().top + window.pageYOffset - 104;   // pod lepkavý pruh a postup
    try { window.scrollTo({ top: y, behavior: plynulo ? "smooth" : "auto" }); } catch (e) { window.scrollTo(0, y); }
  }

  /* Po prvej odpovedi na otázku sa stránka posunie na ďalšiu, ktorá ešte nemá odpoveď.
     Pri zmene už zodpovedanej otázky sa nehýbe, aby človek neskákal po stránke. */
  form.addEventListener("change", function (e) {
    var f = e.target.closest && e.target.closest(".otazka");
    chyba.classList.remove("vidno");
    if (!f || e.target.type !== "radio") return;
    var bolaHotova = f.classList.contains("hotova");
    f.classList.remove("chyba-otazka");
    obnovPostup();
    if (bolaHotova) return;
    var dalsia = null, za = false;
    Array.prototype.forEach.call(form.querySelectorAll(".otazka"), function (x) {
      if (x === f) { za = true; return; }
      if (za && !dalsia && !x.classList.contains("hotova")) dalsia = x;
    });
    if (dalsia) setTimeout(function () { posun(dalsia); }, 260);
  });
  form.addEventListener("input", function (e) {
    if (e.target.classList) e.target.classList.remove("zle");
    chyba.classList.remove("vidno");
  });

  function povedz(t) { chyba.innerHTML = t; chyba.classList.add("vidno"); }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (bezi) return;
    var o = {}, prva = null;
    P.OTAZKY.forEach(function (q) {
      var r = form.querySelector('input[name="' + q.k + '"]:checked');
      var f = form.querySelector('.otazka[data-k="' + q.k + '"]');
      if (r) { o[q.k] = r.value; f.classList.remove("chyba-otazka"); }
      else { f.classList.add("chyba-otazka"); if (!prva) prva = f; }
    });
    if (prva) { povedz("Ešte chýba odpoveď pri niektorej otázke, je označená."); posun(prva); return; }
    var meno = String(form.meno.value || "").replace(/\s+/g, " ").trim();
    var email = String(form.email.value || "").trim();
    if (meno.length < 2) { form.meno.classList.add("zle"); povedz("Napíš prosím krstné meno."); posun(document.getElementById("kontaktKarta")); return; }
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email)) { form.email.classList.add("zle"); povedz("Ten e-mail nevyzerá platne."); posun(document.getElementById("kontaktKarta")); return; }

    bezi = true; poslat.disabled = true; poslat.textContent = "Chvíľku…";
    P.uloz(o);
    try { sessionStorage.setItem("mc_kontakt", JSON.stringify({ meno: meno, email: email })); } catch (err) {}
    fetch("/api/profil", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meno: meno, email: email, odpovede: o, website: form.website.value || "" }) })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (x) {
        if (!x || !x.ok) throw new Error("profil");
        var nahlad = x.test ? "&nahlad=1" : "";
        var skupina = x.skupina || P.skupina(o);
        /* Na poddoméne plan.* je len lievik, diagnostika a zvyšok webu sú na www. */
        var web = /^plan\./.test(location.hostname) ? "https://www.miriamczompoly.sk" : "";
        var ciel = skupina === "horuci" ? "/profil-rezervacia?" + P.doAdresy(o) + nahlad
          : web + "/diagnostika?plan=odoslany&utm_source=plan-od-miriam" + nahlad;
        /* Lead pre Meta, na ňu optimalizuje kampaň. Pixel beží len po súhlase s cookies (consent.js).
           Chvíľka čakania, aby udalosť odišla skôr, než stránka odíde. */
        var lead = !x.test && window.fbq;
        if (lead) window.fbq("track", "Lead", { content_name: "Plan od Miriam", skupina: skupina });
        setTimeout(function () { location.href = ciel; }, lead ? 400 : 0);
      })
      .catch(function () {
        bezi = false; poslat.disabled = false; poslat.textContent = "Získať môj plán";
        povedz('Niečo sa nepodarilo. Skús to prosím o chvíľu znova alebo mi zavolaj na <a href="tel:+421918819906">0918 819 906</a>.');
      });
  });

  try { P.recenzie("#kopa", 4); } catch (e) { /* zvyšok stránky beží ďalej */ }
})();
