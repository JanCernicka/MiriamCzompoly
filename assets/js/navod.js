/* Lišta „Nevieš, ako začať?“ na /diagnostika (A aj B), od 5. 10. 2026 (návrh 5, vybral Jano).
   Nenápadná lišta zdola (na počítači v rohu), stránka ostane vidieť a dá sa ďalej rolovať.
   Návod „Ako začať s interiérom“ na e-mail (/api/navod), na kliknutie pred a po (Jitka
   Lennerová) a odkaz „Radšej sa stretnime“ na kontakt.
   Ukáže sa raz za návštevu po 15 sekundách (rátá sa len čas, keď je karta otvorená) a nie
   vtedy, keď žena vypĺňa rezerváciu. Po zatvorení ostane v rohu malé tlačidlo „Návod zadarmo“,
   ktorým sa lišta otvorí znova. Po odoslaní e-mailu tlačidlo zmizne.
   Okno si samo vloží HTML, A aj B majú jeden <script>. Vzhľad: assets/css/navod.css */
(function () {
  "use strict";
  var SEKUND = 15, KLUC = "mc_navod";
  function stav() { try { return sessionStorage.getItem(KLUC); } catch (e) { return null; } }
  function uloz(v) { try { sessionStorage.setItem(KLUC, v); } catch (e) {} }
  if (stav() === "odoslane") return;

  var OBAL = "/assets/img/navod-obal.jpg";
  var lista = document.createElement("div");
  lista.className = "navod"; lista.id = "navod"; lista.hidden = true;
  lista.setAttribute("role", "dialog"); lista.setAttribute("aria-labelledby", "navodNadpis");
  lista.innerHTML =
    '<button type="button" class="navod-x" data-zavri aria-label="Zavrieť">×</button>' +
    '<div class="navod-hlava"><img class="navod-obal" src="' + OBAL + '" width="44" height="57" alt="Obálka návodu Ako začať s interiérom">' +
    '<div><b id="navodNadpis">Nevieš, ako začať?</b><p>Pošlem ti môj návod <i>Ako začať s interiérom, keď nevieš ako</i> na e-mail.</p></div></div>' +
    '<form class="navod-form" id="navodForm" novalidate>' +
    '<label class="navod-skryte" for="navodEmail">Tvoj e-mail</label>' +
    '<div class="navod-riadok"><input id="navodEmail" name="email" type="email" inputmode="email" autocomplete="email" placeholder="Tvoj e-mail" required>' +
    '<button class="navod-btn" type="submit" id="navodBtn">Pošli</button></div>' +
    '<input class="navod-pasca" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
    '<p class="chyba" id="navodChyba" role="alert"></p>' +
    '<p class="navod-pozn">Teraz ti príde len návod. Neskôr ti občas pošlem tip k bývaniu, odhlásiť sa môžeš jedným klikom. ' +
    '<a href="/gdpr" target="_blank" rel="noopener">Ochrana údajov</a></p>' +
    '</form>' +
    '<p class="navod-hotovo" id="navodHotovo" hidden><b>Hotovo.</b> Návod ti práve odišiel na <b id="navodKam"></b>. Ak ho do pár minút nevidíš, pozri sa aj do spamu.</p>' +
    '<button type="button" class="navod-pribeh-tl" id="navodPribehTl" aria-expanded="false" aria-controls="navodPribeh">Pozri, ako som pomohla Jitke</button>' +
    '<div class="navod-pribeh" id="navodPribeh" hidden>' +
    '<div class="navod-pp"><span><img src="/assets/img/realizacie/vidiecky-pred-2-maly.jpg" width="480" height="320" alt="Obývacia izba pred premenou" loading="lazy"><b>Pred</b></span>' +
    '<span><img src="/assets/img/realizacie/vidiecky-4-maly.jpg" width="480" height="320" alt="Tá istá obývacia izba po premene" loading="lazy"><b class="po">Po</b></span></div>' +
    '<p>Jitka sa sťahovala z domu do paneláku. Starý nábytok zostal a dostal okolo seba nový.</p>' +
    '<q>Perfektne zladila starý nábytok s novým. Napriek tomu, že sme sa presťahovali z domu do paneláku, cítime sa v ňom oveľa lepšie.</q>' +
    '<cite>Jitka Lennerová, Trnava</cite></div>' +
    '<a class="navod-stretnut" href="/#kontakt" data-stretnut>Radšej sa stretnime →</a>';
  document.body.appendChild(lista);

  // malé tlačidlo v rohu, ktorým sa lišta otvorí znova
  var znova = document.createElement("button");
  znova.type = "button"; znova.className = "navod-znova"; znova.hidden = true;
  znova.innerHTML = '<img src="' + OBAL + '" width="22" height="29" alt="">Návod zadarmo';
  document.body.appendChild(znova);

  var form = lista.querySelector("#navodForm"), email = lista.querySelector("#navodEmail");
  var chyba = lista.querySelector("#navodChyba"), btn = lista.querySelector("#navodBtn"), bezi = false;
  var pribehTl = lista.querySelector("#navodPribehTl"), pribeh = lista.querySelector("#navodPribeh");

  function rezervuje() {
    var f = document.getElementById("formular");
    if (!f || f.hidden) return false;
    if (f.contains(document.activeElement)) return true;
    return Array.prototype.some.call(f.querySelectorAll("input[type=text],input[type=email],input[type=tel]"), function (i) { return i.value.trim(); });
  }
  function otvor() {
    uloz("otvorene");
    znova.hidden = true;
    lista.hidden = false;
    document.documentElement.classList.add("navod-otvorene");
    requestAnimationFrame(function () { lista.classList.add("vidno"); });
  }
  function zavri() {
    lista.classList.remove("vidno");
    document.documentElement.classList.remove("navod-otvorene");
    setTimeout(function () { lista.hidden = true; }, 200);
    if (stav() !== "odoslane") { uloz("zavrete"); znova.hidden = false; }
  }

  if (stav() === "zavrete" || stav() === "otvorene") {
    znova.hidden = false;   // už ju v tejto návšteve videla: len tlačidlo, lišta sama nevyskočí
  } else {
    var ubehlo = 0, posledne = Date.now();
    var t = setInterval(function () {
      var teraz = Date.now();
      if (!document.hidden) ubehlo += teraz - posledne;
      posledne = teraz;
      if (ubehlo < SEKUND * 1000) return;
      if (rezervuje()) return;          // počká, kým dorezervuje alebo odíde z formulára
      clearInterval(t);
      if (!stav()) otvor();
    }, 500);
  }

  znova.addEventListener("click", otvor);
  Array.prototype.forEach.call(lista.querySelectorAll("[data-zavri]"), function (b) { b.addEventListener("click", zavri); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !lista.hidden) zavri(); });
  pribehTl.addEventListener("click", function () {
    var otvorit = pribeh.hidden;
    pribeh.hidden = !otvorit;
    pribehTl.setAttribute("aria-expanded", otvorit ? "true" : "false");
    pribehTl.textContent = otvorit ? "Skryť príbeh" : "Pozri, ako som pomohla Jitke";
  });
  email.addEventListener("input", function () { email.classList.remove("zle"); chyba.classList.remove("vidno"); });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (bezi) return;
    var d = { email: email.value.trim(), website: (form.querySelector("[name=website]") || {}).value || "" };
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(d.email)) {
      chyba.textContent = "Ten e-mail nevyzerá platne."; chyba.classList.add("vidno"); email.classList.add("zle"); email.focus(); return;
    }
    bezi = true; btn.disabled = true; btn.textContent = "…";
    fetch("/api/navod", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (o) {
        if (!o || !o.ok) throw new Error("navod");
        uloz("odoslane");
        form.hidden = true;
        lista.querySelector("#navodHotovo").hidden = false;
        lista.querySelector("#navodKam").textContent = d.email;
        /* 🔴 NIE „Lead": kampaň sa optimalizuje na Lead z rezervácie, návod by ju odviedol inam */
        try { if (window.fbq) window.fbq("trackCustom", "NavodAkoZacat"); } catch (err) {}
      })
      .catch(function () {
        bezi = false; btn.disabled = false; btn.textContent = "Pošli";
        chyba.textContent = "Nepodarilo sa to odoslať. Skús to prosím znova o chvíľu."; chyba.classList.add("vidno");
      });
  });
})();
