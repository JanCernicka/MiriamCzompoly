/* Vyskakovacie okno „Nevieš, ako začať?“ na /diagnostika (A aj B), od 5. 10. 2026.
   Pred a po (Jitka Lennerová), návod „Ako začať s interiérom“ na e-mail (/api/navod)
   a tlačidlo „Chcem sa s tebou stretnúť“ na kontakt.
   Ukáže sa raz za návštevu po 15 sekundách na stránke (rátá sa len čas, keď je karta
   otvorená). Neukáže sa, kým žena vypĺňa rezerváciu. Okno si samo vloží HTML, aby
   A aj B mali to isté a stačil jeden <script>. Vzhľad: assets/css/navod.css */
(function () {
  "use strict";
  var SEKUND = 15, KLUC = "mc_navod";
  function stav() { try { return sessionStorage.getItem(KLUC); } catch (e) { return null; } }
  function uloz(v) { try { sessionStorage.setItem(KLUC, v); } catch (e) {} }
  if (stav()) return;

  var okno = document.createElement("div");
  okno.className = "navod"; okno.id = "navod"; okno.hidden = true;
  okno.setAttribute("role", "dialog"); okno.setAttribute("aria-modal", "true"); okno.setAttribute("aria-labelledby", "navodNadpis");
  okno.innerHTML =
    '<div class="navod-karta">' +
    '<button type="button" class="navod-x" data-zavri aria-label="Zavrieť">×</button>' +
    '<h2 id="navodNadpis">Nevieš, ako začať?</h2>' +
    '<figure class="navod-pp"><div class="navod-pp-fotky">' +
    '<span><img src="/assets/img/realizacie/vidiecky-pred-2-maly.jpg" width="480" height="320" alt="Obývacia izba pred premenou"><b>Pred</b></span>' +
    '<span><img src="/assets/img/realizacie/vidiecky-4-maly.jpg" width="480" height="320" alt="Tá istá obývacia izba po premene"><b class="po">Po</b></span>' +
    '</div><figcaption>Jitka sa sťahovala z domu do paneláku. Starý nábytok zostal a dostal okolo seba nový. ' +
    '<q>Perfektne zladila starý nábytok s novým. Napriek tomu, že sme sa presťahovali z domu do paneláku, cítime sa v ňom oveľa lepšie.</q> ' +
    '<cite>Jitka Lennerová, Trnava</cite></figcaption></figure>' +
    '<p>Pozri sa na môj návod <b>Ako začať s interiérom, keď nevieš ako</b>. Pošlem ti ho na e-mail.</p>' +
    '<form class="navod-form" id="navodForm" novalidate>' +
    '<div class="pole"><label for="navodEmail">Tvoj e-mail</label>' +
    '<input id="navodEmail" name="email" type="email" inputmode="email" autocomplete="email" required></div>' +
    '<input class="navod-pasca" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
    '<p class="chyba" id="navodChyba" role="alert"></p>' +
    '<button class="navod-btn" type="submit" id="navodBtn">Pošli mi návod</button>' +
    '<p class="navod-pozn">Pošlem ti len návod. Viac o <a href="/gdpr" target="_blank" rel="noopener">ochrane údajov</a>.</p>' +
    '</form>' +
    '<div class="navod-hotovo" id="navodHotovo" hidden><p><b>Hotovo.</b> Návod ti práve odišiel na <b id="navodKam"></b>. Ak ho do pár minút nevidíš, pozri sa aj do spamu.</p></div>' +
    '<a class="navod-stretnut" href="/#kontakt" data-stretnut>Chcem sa s tebou stretnúť</a>' +
    '</div>';
  document.body.appendChild(okno);

  var form = okno.querySelector("#navodForm"), email = okno.querySelector("#navodEmail");
  var chyba = okno.querySelector("#navodChyba"), btn = okno.querySelector("#navodBtn"), predtym = null, bezi = false;

  /* vypĺňa rezerváciu? potom ju nerušíme */
  function rezervuje() {
    var f = document.getElementById("formular");
    if (!f || f.hidden) return false;
    if (f.contains(document.activeElement)) return true;
    return Array.prototype.some.call(f.querySelectorAll("input[type=text],input[type=email],input[type=tel]"), function (i) { return i.value.trim(); });
  }
  var ubehlo = 0, posledne = Date.now();
  var t = setInterval(function () {
    var teraz = Date.now();
    if (!document.hidden) ubehlo += teraz - posledne;
    posledne = teraz;
    if (ubehlo < SEKUND * 1000) return;
    clearInterval(t);
    if (!stav() && !rezervuje()) otvor();
  }, 500);

  function otvor() {
    uloz("ukazane");
    predtym = document.activeElement;
    okno.hidden = false;
    document.documentElement.classList.add("navod-otvorene");
    requestAnimationFrame(function () { okno.classList.add("vidno"); });
  }
  function zavri() {
    okno.classList.remove("vidno");
    document.documentElement.classList.remove("navod-otvorene");
    setTimeout(function () { okno.hidden = true; }, 200);
    if (predtym && predtym.focus) predtym.focus();
  }
  Array.prototype.forEach.call(okno.querySelectorAll("[data-zavri]"), function (b) { b.addEventListener("click", zavri); });
  okno.addEventListener("click", function (e) { if (e.target === okno) zavri(); });
  okno.querySelector("[data-stretnut]").addEventListener("click", function () { uloz("stretnutie"); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !okno.hidden) zavri(); });
  email.addEventListener("input", function () { email.classList.remove("zle"); chyba.classList.remove("vidno"); });
  function povedz(t) { chyba.textContent = t; chyba.classList.add("vidno"); email.classList.add("zle"); email.focus(); }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (bezi) return;
    var d = { email: email.value.trim(), website: (form.querySelector("[name=website]") || {}).value || "" };
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(d.email)) return povedz("Ten e-mail nevyzerá platne.");
    bezi = true; btn.disabled = true; btn.textContent = "Posielam…";
    fetch("/api/navod", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (o) {
        if (!o || !o.ok) throw new Error("navod");
        uloz("odoslane");
        form.hidden = true;
        okno.querySelector("#navodHotovo").hidden = false;
        okno.querySelector("#navodKam").textContent = d.email;
        /* 🔴 NIE „Lead": kampaň sa optimalizuje na Lead z rezervácie, návod by ju odviedol inam */
        try { if (window.fbq) window.fbq("trackCustom", "NavodAkoZacat"); } catch (err) {}
      })
      .catch(function () {
        bezi = false; btn.disabled = false; btn.textContent = "Pošli mi návod";
        chyba.textContent = "Nepodarilo sa to odoslať. Skús to prosím znova o chvíľu.";
        chyba.classList.add("vidno");
      });
  });
})();
