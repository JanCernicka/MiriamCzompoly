/* /profil-vysledok: automatický profil pre tých, ktorí rozhovor nedostali.
   Poskladá sa zo šablón v profil-data.js podľa odpovedí z testu.
   „Pošli mi profil“ ide na /api/profil. 🔴 Ten je zatiaľ zapojený LEN na náhľade (TEST_REZIM=1),
   naostro vráti 503, kým nebude e-mail s profilom a séria tipov. */
(function () {
  "use strict";
  var P = window.PROFIL;
  if (!P) return;
  function $(s) { return document.querySelector(s); }
  var esc = P.esc;

  var o = P.zAdresy(location.search);
  if (!o) { location.replace("/profil#test"); return; }
  P.uloz(o);

  var pr = P.PROFILY[o.p], M = P.MIESTA[o.m], D = P.DOVODY[o.d];
  document.title = pr.nazov + " · tvoj pocitový profil domova";
  $("#nazov").textContent = pr.nazov;
  $("#text").textContent = pr.text;
  var f = $("#foto"); f.src = pr.foto; f.alt = "Realizácia Miriam Czompoly v duchu profilu " + pr.nazov;
  $("#paleta").innerHTML = pr.paleta.map(function (c) {
    return '<span class="farba"><i style="background:' + esc(c[1]) + '"></i>' + esc(c[0]) + "</span>";
  }).join("");
  $("#materialy").textContent = pr.materialy;
  $("#svetlo").textContent = pr.svetlo;
  $("#svetloVeta").textContent = P.SVETLO[o.s].veta;
  $("#zona").textContent = "Tvoja červená zóna: " + M.n.toLowerCase() + ", lebo " + D.veta;
  $("#kroky").innerHTML = D.kroky.map(function (k) { return "<li>" + esc(k) + "</li>"; }).join("");
  $("#nekupuj").textContent = pr.nekupuj;
  $("#most").textContent = "Profil ti ukáže smer. Neukáže ti, čo " + M.lok + " nechať, čo zmeniť a v akom poradí, aby si neprepálila peniaze. To robím na diagnostike.";
  $("#znova").href = "/profil?" + P.doAdresy(o) + "#test";

  /* ---------- pošli mi profil ---------- */
  var form = $("#emailForm"), btn = $("#poslat"), chyba = $("#chyba"), bezi = false;
  var pole = $("#email");
  pole.addEventListener("input", function () { pole.classList.remove("zle"); chyba.classList.remove("vidno"); });
  function povedz(t) { chyba.innerHTML = t; chyba.classList.add("vidno"); }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (bezi) return;
    var email = String(pole.value || "").trim();
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email)) { pole.classList.add("zle"); return povedz("Ten e-mail nevyzerá platne."); }
    bezi = true; btn.disabled = true; btn.textContent = "Posielam…";
    fetch("/api/profil", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email, odpovede: o }) })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (x) {
        if (!x || !x.ok) throw new Error("profil");
        var hotovo = $("#poslane");
        hotovo.innerHTML = "<p><b>Hotovo.</b> Profil ti príde na " + esc(email) + " do pár minút.</p>" +
          (x.test ? '<span class="nahlad">Náhľad: nič sa neuložilo a e-mail neodišiel.</span>' : "");
        form.hidden = true; hotovo.hidden = false;
        try { hotovo.focus({ preventScroll: true }); } catch (err) {}
      })
      .catch(function () {
        bezi = false; btn.disabled = false; btn.textContent = "Poslať profil";
        povedz("Profil sa nepodarilo poslať. Skús to prosím o chvíľu znova.");
      });
  });
})();
