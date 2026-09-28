/* Formulár e-booku na /5-chyb: zapíše kontakt cez /api/ebook a pošle ženu
   na /konzultacia-zdarma. Meno a e-mail nechá v sessionStorage „mc_ebook“,
   aby ich tam nemusela písať druhýkrát. */
(function () {
  "use strict";
  var f = document.getElementById("ebookForm");
  if (!f) return;
  var meno = document.getElementById("ebMeno"), email = document.getElementById("ebEmail");
  var suhlas = document.getElementById("ebSuhlas"), chyba = document.getElementById("ebChyba");
  var btn = document.getElementById("ebTlacidlo"), bezi = false;

  /* kto prišiel z opt-inu na domovskej stránke, má e-mail v URL */
  var z = new URLSearchParams(location.search).get("email");
  if (z && z.indexOf("@") > 0) email.value = z;

  function povedz(t, pole) {
    chyba.textContent = t; chyba.classList.add("vidno");
    if (pole) { pole.classList.add("zle"); pole.focus(); }
  }
  [meno, email].forEach(function (e) { e.addEventListener("input", function () { e.classList.remove("zle"); chyba.classList.remove("vidno"); }); });

  f.addEventListener("submit", function (e) {
    e.preventDefault();
    if (bezi) return;
    var d = { meno: meno.value.trim(), email: email.value.trim(), suhlas: suhlas.checked };
    if (d.meno.length < 2) return povedz("Napíš prosím krstné meno.", meno);
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(d.email)) return povedz("Ten e-mail nevyzerá platne.", email);
    if (!d.suhlas) return povedz("Bez zaškrtnutia ti e-book neviem poslať.");
    bezi = true; btn.disabled = true; btn.firstChild.nodeValue = "Posielam… ";
    fetch("/api/ebook", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (o) {
        if (!o || !o.ok) throw new Error("ebook");
        try { sessionStorage.setItem("mc_ebook", JSON.stringify({ meno: d.meno, email: d.email })); } catch (err) {}
        location.href = "/konzultacia-zdarma";
      })
      .catch(function () {
        bezi = false; btn.disabled = false; btn.firstChild.nodeValue = "Chcem e-book zdarma ";
        povedz("Nepodarilo sa to odoslať. Skús to prosím znova o chvíľu.");
      });
  });
})();
