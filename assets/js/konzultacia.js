/* /konzultacia-zdarma: ponuka po e-booku, uvítací hovor 15 min po telefóne (bez ceny).
   Meno a e-mail sú z formulára e-booku (sessionStorage „mc_ebook“), pýta sa len telefón.
   Kto sem príde bez nich, vyplní ich tu. */
(function () {
  "use strict";
  function $(id) { return document.getElementById(id); }
  var ZONA = "Europe/Bratislava";
  var SKRAT = { Sun: "ne", Mon: "po", Tue: "ut", Wed: "st", Thu: "št", Fri: "pi", Sat: "so" };
  var DLHE = { Sun: "v nedeľu", Mon: "v pondelok", Tue: "v utorok", Wed: "v stredu", Thu: "vo štvrtok", Fri: "v piatok", Sat: "v sobotu" };
  function casti(iso) {
    return new Intl.DateTimeFormat("en-GB", { timeZone: ZONA, weekday: "short", day: "numeric", month: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date(iso))
      .reduce(function (o, p) { o[p.type] = p.value; return o; }, {});
  }
  function cas(iso) { var c = casti(iso); return Number(c.hour) + ":" + c.minute; }
  function kedy(iso) { var c = casti(iso); return DLHE[c.weekday] + " " + Number(c.day) + ". " + Number(c.month) + ". o " + cas(iso); }

  var u = null;
  try { u = JSON.parse(sessionStorage.getItem("mc_ebook") || "null"); } catch (e) {}
  if (u && u.meno) {
    $("kzH1").textContent = u.meno.charAt(0).toUpperCase() + u.meno.slice(1) + ", tvoj e-book je pripravený.";
    $("kzKtoMeno").textContent = u.meno; $("kzKtoEmail").textContent = u.email; $("kzKto").hidden = false;
  } else {
    $("kzUdaje").hidden = false;
  }

  var dni = [], vybrany = null, bezi = false, btn = $("kzRezervovat"), chyba = $("kzChyba");
  function povedz(t) { chyba.textContent = t; chyba.classList.add("vidno"); }

  function nacitaj() {
    $("kzStav").hidden = false; $("kzStav").textContent = "Načítavam voľné termíny…";
    fetch("/api/konzultacia").then(function (r) { return r.json(); }).then(function (o) {
      if (!o || !o.ok) throw new Error("sloty");
      dni = o.days || [];
      if (!dni.length) { $("kzStav").textContent = "Na najbližšie dni je obsadené. Napíš mi na dizajn@miriamczompoly.sk."; return; }
      $("kzStav").hidden = true;
      $("kzDni").innerHTML = dni.map(function (d, i) {
        var c = casti(d.slots[0]);
        return '<button type="button" class="kz-den" data-i="' + i + '"><span class="d1">' + SKRAT[c.weekday] + '</span><span class="d2">' + Number(c.day) + ". " + Number(c.month) + ".</span></button>";
      }).join("");
      Array.prototype.forEach.call(document.querySelectorAll(".kz-den"), function (b) {
        b.addEventListener("click", function () { den(+b.getAttribute("data-i")); });
      });
      den(0);
    }).catch(function () {
      $("kzStav").hidden = false;
      $("kzStav").textContent = "Termíny sa nepodarilo načítať. Napíš mi na dizajn@miriamczompoly.sk.";
    });
  }
  function den(i) {
    vybrany = null; obnov();
    Array.prototype.forEach.call(document.querySelectorAll(".kz-den"), function (b, j) { b.classList.toggle("on", j === i); });
    $("kzSloty").innerHTML = dni[i].slots.map(function (iso) { return '<button type="button" class="kz-cas" data-iso="' + iso + '">' + cas(iso) + "</button>"; }).join("");
    Array.prototype.forEach.call(document.querySelectorAll(".kz-cas"), function (b) {
      b.addEventListener("click", function () {
        vybrany = b.getAttribute("data-iso");
        Array.prototype.forEach.call(document.querySelectorAll(".kz-cas"), function (x) { x.classList.toggle("on", x === b); });
        obnov();
      });
    });
  }
  function obnov() {
    chyba.classList.remove("vidno");
    btn.disabled = !vybrany;
    btn.textContent = vybrany ? "Rezervovať hovor " + kedy(vybrany) : "Vyber si čas";
  }

  btn.addEventListener("click", function () {
    if (bezi || !vybrany) return;
    var meno = u && u.meno, email = u && u.email;
    if (!u) {
      meno = $("kzMenoIn").value.trim(); email = $("kzEmailIn").value.trim();
      if (meno.length < 2) return povedz("Napíš prosím krstné meno.");
      if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email)) return povedz("Ten e-mail nevyzerá platne.");
    }
    var tel = $("kzTel").value.trim();
    if (tel.replace(/\D/g, "").length < 9) { $("kzTel").focus(); return povedz("Napíš prosím telefónne číslo, zavolám ti naň."); }
    bezi = true; btn.disabled = true; btn.textContent = "Rezervujem…";
    fetch("/api/konzultacia", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ start: vybrany, meno: meno, email: email, telefon: tel }) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (o) { return { s: r.status, o: o }; }); })
      .then(function (x) {
        bezi = false;
        if (x.o && x.o.ok) {
          $("kalendar").hidden = true; $("kzHotovo").hidden = false;
          $("kzHotovoKedy").textContent = "Zavolám ti " + kedy(vybrany) + ".";
          try { if (window.fbq) window.fbq("track", "Schedule"); } catch (e) {}
          $("kzHotovo").scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }
        if (x.s === 409) { povedz("Tento čas si práve niekto vzal. Vyber si prosím iný."); nacitaj(); return; }
        throw new Error("rezervacia");
      })
      .catch(function () { bezi = false; obnov(); povedz("Rezerváciu sa nepodarilo dokončiť. Napíš mi prosím na dizajn@miriamczompoly.sk."); });
  });

  nacitaj();
})();
