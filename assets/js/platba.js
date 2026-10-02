/* Platba 249 € cez FAPI na /dakujem pre variantu B.
   Kalendár B pred presmerovaním uloží údaje do sessionStorage „mc_platba“,
   tu sa vpíšu do formulára FAPI, aby ich zákazníčka nepísala druhýkrát.
   FAPI sa vkladá priamo do stránky (nie iframe), polia majú mená
   email, phone, first_name, last_name, street, city, zip, country, notes.
   Overené 26. 9. 2026 na miriam-fapi-test.pages.dev/navrh. */
(function () {
  "use strict";
  var FAPI = "https://form.fapi.cz/script.php?id=33a88ecd-b33c-4a70-ab01-7f490ad088c0";
  var obal = document.getElementById("fapi");
  if (!obal) return;

  var u = null;
  try { u = JSON.parse(sessionStorage.getItem("mc_platba") || "null"); } catch (e) {}

  if (u && u.kedy) {
    var t = document.getElementById("platbaTermin");
    t.textContent = "Termín: " + u.kedy + (u.ulica ? ", " + u.ulica + ", " + u.mesto : "");
    t.hidden = false;
  }

  /* Bez údajov z kalendára ostane tlačidlo (ako na A), formulár sa nenačíta. */
  if (!u) return;
  var tl = document.getElementById("platbaTlacidlo");
  if (tl) tl.hidden = true;
  obal.hidden = false;
  var zaloha = document.getElementById("fapiZaloha");
  if (zaloha) zaloha.hidden = false;

  /* FAPI sa vloží hneď ZA svoj <script> (document.currentScript) */
  var s = document.createElement("script");
  s.src = FAPI; s.type = "text/javascript";
  obal.appendChild(s);

  /* 0907 777 555 -> +421907777555. FAPI inak číslo zamietne ako neplatné. */
  function medzinarodne(tel) {
    var c = String(tel || "").replace(/[^\d+]/g, "");
    if (/^00/.test(c)) return "+" + c.slice(2);
    if (/^0\d{9}$/.test(c)) return "+421" + c.slice(1);
    return c;
  }
  /* vpíše len do prázdneho poľa, takže opakovanie neprepíše, čo zákazníčka opravila */
  function vloz(meno, hodn) {
    var e = obal.querySelector('[name="' + meno + '"]');
    if (!e || !hodn || e.value === hodn || (e.value && meno !== "country")) return;
    var proto = e.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(e, hodn);
    ["input", "change", "blur"].forEach(function (typ) { e.dispatchEvent(new Event(typ, { bubbles: true })); });
  }
  function vypln() {
    vloz("country", "SK");
    vloz("email", u.email); vloz("phone", medzinarodne(u.telefon));
    vloz("first_name", u.meno); vloz("last_name", u.priezvisko);
    vloz("street", u.ulica); vloz("city", u.mesto); vloz("zip", u.psc);
    if (u.kedy) vloz("notes", "Termín diagnostiky: " + u.kedy);
  }
  /* 🔴 FAPI sa po načítaní ešte prekreslí (štát podľa IP) a zmaže telefón aj
     poznámku. Preto sa vpisuje viackrát, kým sa formulár neustáli. */
  var pokusy = 0;
  (function skus() {
    if (!obal.querySelector('[name="email"]')) { if (++pokusy < 75) setTimeout(skus, 200); return; }
    [300, 1000, 2000, 3500, 6000].forEach(function (ms) { setTimeout(vypln, ms); });
    setTimeout(function () { var p = document.getElementById("platbaVyplnene"); if (p) p.hidden = false; }, 300);
  })();
})();
