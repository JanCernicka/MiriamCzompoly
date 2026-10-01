/* Vyskakovacie okno „Nie si si istá? Zavolám ti do 24 hodín“ na /dispozicia.
   Ukáže sa raz za návštevu, keď je žena na stránke 15 sekúnd (počíta sa len čas, keď je
   karta naozaj otvorená). Neukáže sa, ak práve vypĺňa rezerváciu alebo už rezervovala. */
(function () {
  "use strict";
  var SEKUND = 15, KLUC = "mc_zavolaj";
  var okno = document.getElementById("zavolaj");
  if (!okno) return;
  function stav() { try { return sessionStorage.getItem(KLUC); } catch (e) { return null; } }
  function uloz(v) { try { sessionStorage.setItem(KLUC, v); } catch (e) {} }
  if (stav()) return;

  var form = document.getElementById("zavolajForm"), chyba = document.getElementById("zavolajChyba");
  var meno = document.getElementById("zavolajMeno"), tel = document.getElementById("zavolajTel");
  var btn = document.getElementById("zavolajBtn"), predtym = null, bezi = false;

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
    document.documentElement.classList.add("zavolaj-otvorene");
    requestAnimationFrame(function () { okno.classList.add("vidno"); });
    setTimeout(function () { meno.focus(); }, 250);
  }
  function zavri() {
    okno.classList.remove("vidno");
    document.documentElement.classList.remove("zavolaj-otvorene");
    setTimeout(function () { okno.hidden = true; }, 200);
    if (predtym && predtym.focus) predtym.focus();
  }
  Array.prototype.forEach.call(okno.querySelectorAll("[data-zavri]"), function (b) { b.addEventListener("click", zavri); });
  okno.addEventListener("click", function (e) { if (e.target === okno) zavri(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !okno.hidden) zavri(); });

  [meno, tel].forEach(function (i) { i.addEventListener("input", function () { i.classList.remove("zle"); chyba.classList.remove("vidno"); }); });
  function povedz(t, pole) { chyba.textContent = t; chyba.classList.add("vidno"); if (pole) { pole.classList.add("zle"); pole.focus(); } }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (bezi) return;
    var d = { meno: meno.value.trim(), telefon: tel.value.trim(), website: (form.querySelector("[name=website]") || {}).value || "" };
    if (d.meno.length < 2) return povedz("Napíš prosím krstné meno.", meno);
    if (d.telefon.replace(/\D/g, "").length < 9) return povedz("Telefónne číslo vyzerá krátko.", tel);
    bezi = true; btn.disabled = true; btn.textContent = "Posielam…";
    fetch("/api/zavolaj", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (o) {
        if (!o || !o.ok) throw new Error("zavolaj");
        uloz("odoslane");
        form.hidden = true;
        document.getElementById("zavolajHotovo").hidden = false;
        document.getElementById("zavolajHotovoMeno").textContent = d.meno;
        try { if (window.fbq) window.fbq("track", "Contact"); } catch (err) {}
      })
      .catch(function () {
        bezi = false; btn.disabled = false; btn.textContent = "Zavolaj mi";
        povedz("Nepodarilo sa to odoslať. Skús to prosím znova, alebo mi zavolaj na +421 918 819 906.");
      });
  });
})();
