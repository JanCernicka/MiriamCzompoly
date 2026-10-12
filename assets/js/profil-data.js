/* Lievik „Plán od Miriam“ (/profil), od 12. 10. 2026 podľa Miriam.
   Spoločné dáta pre stránky /profil (test), /profil-rezervacia (horúci), /profil-dakujem (ostatní)
   a /plan (plán, odkaz z e-mailu). Ten istý súbor číta aj server (functions/_lib/profil.js),
   preto tu nesmie byť nič, čo pri načítaní siaha na window alebo document.

   🔴 Otázky, odpovede a všetky texty plánu napísala Miriam (12. 10. 2026). Nič v nich
   nedopisovať bez nej. Naše sú len fotky realizácií a vety pod nimi (z popisov na webe).

   Odpovede sa nesú v adrese (?m=&d=&n=&p=&k=&r=) aj v sessionStorage („mc_profil“),
   aby stránky fungovali aj pri zablokovanom úložisku a plán sa dal poslať odkazom. */
(function (root) {
  "use strict";

  var FOTO = "/assets/img/realizacie/";

  // n: na dlaždici, oslovenie: prvý riadok plánu, lok: „v tvojej …“
  var MIESTA = {
    obyvacka: { n: "Obývačka", oslovenie: "Tvoja obývačka: tu je, čo by som riešila ako prvé.", lok: "v tvojej obývačke",
                foto: FOTO + "vidiecky-4.jpg", veta: "Jitkin byt v Trnave. Starý nábytok ostal a dostal okolo seba nový." },
    spalna:   { n: "Spálňa", oslovenie: "Tvoja spálňa: tu je, čo by som riešila ako prvé.", lok: "v tvojej spálni",
                foto: FOTO + "stajnerka-3.jpg", veta: "Spálňa v byte Štajnerka v Trnave: tapeta za posteľou a dve lampy pri posteli." },
    kuchyna:  { n: "Kuchyňa a jedáleň", oslovenie: "Tvoja kuchyňa a jedáleň: tu je, čo by som riešila ako prvé.", lok: "v tvojej kuchyni a jedálni",
                foto: FOTO + "vidiecky-6.jpg", veta: "Kuchyňa v Jitkinom byte v Trnave: drevená pracovná doska a otvorené police." },
    detska:   { n: "Detská", oslovenie: "Tvoja detská izba: tu je, čo by som riešila ako prvé.", lok: "v tvojej detskej izbe",
                foto: FOTO + "dievcenska-po.jpg", veta: "Dievčenská izba v podkroví. Pôvodné kreslo majiteľky v nej zostalo." },
    predsien: { n: "Predsieň", oslovenie: "Tvoja predsieň: tu je, čo by som riešila ako prvé.", lok: "v tvojej predsieni",
                foto: FOTO + "arboria2-6.jpg", veta: "Predsieň v byte Arboria v Trnave: všetko je schované vo vstavanej skrini." },
    kut:      { n: "Pracovný kút", oslovenie: "Tvoj pracovný kút: tu je, čo by som riešila ako prvé.", lok: "v tvojom pracovnom kúte",
                foto: FOTO + "starsia-pani-3.jpg", veta: "Byt pre staršiu pani v Trnave: pracovný stolík pri okne a police nad ním." },
    kupelna:  { n: "Kúpeľňa a WC", oslovenie: "Tvoja kúpeľňa: tu je, čo by som riešila ako prvé.", lok: "v tvojej kúpeľni",
                foto: FOTO + "stajnerka-6.jpg", veta: "Kúpeľňa v byte Štajnerka v Trnave: mramorový obklad, sprchový kút a WC." }
  };

  // otázka 2: verdikt, úvod a 3 kroky na tento víkend
  var PROBLEMY = {
    tma:         { n: "Je tam tma", nazov: "Najprv svetlo",
                   uvod: "Skôr než kúpiš čokoľvek nové, vyrieš svetlo. Tmavá miestnosť sa novým nábytkom nezjasní.",
                   kroky: ["Večer nesvieť len stropným svetlom, postav lampu do najtmavšieho rohu.",
                           "Vymeň studené žiarovky za teplé.",
                           "Zrkadlo vedľa okna alebo oproti nemu rozptýli denné svetlo."] },
    neporiadok:  { n: "Neporiadok a málo úložného priestoru", nazov: "Najprv zisti, čo treba uložiť",
                   uvod: "Skôr než kúpiš skrinky, zisti, čo v nich vôbec má byť.",
                   kroky: ["Vyber jednu plochu a nechaj na nej len tri veci.",
                           "Čo používaš denne, daj do jedného košíka tam, kde to používaš.",
                           "Čo si rok nepoužila, odlož do krabice mimo izby a o mesiac rozhodni."] },
    stiesnene:   { n: "Je to stiesnené", nazov: "Najprv uvoľni priestor",
                   uvod: "Stiesnenosť sa často nerieši väčším priestorom, ale menším počtom vecí v ceste.",
                   kroky: ["Vynes jeden kus nábytku, ktorý len prekáža v ceste.",
                           "Zaves záclony čo najvyššie a nechaj ich siahať po zem.",
                           "Uvoľni podlahu, nech je na zemi čo najmenej vecí."] },
    rozlozenie:  { n: "Nefunguje rozloženie", nazov: "Najprv rozloženie, nie nový nábytok",
                   uvod: "Nový nábytok zlé rozloženie nezachráni, len ho zdraží.",
                   kroky: ["Týždeň si všímaj, kde obchádzaš, kopeš alebo sa niečo nedá otvoriť.",
                           "Presuň jeden veľký kus nábytku tak, aby sa dalo prejsť bez obchádzania.",
                           "Nič nekupuj, kým nové rozloženie nevyskúšaš aspoň týždeň."] },
    nedokoncene: { n: "Je to nedokončené", nazov: "Dotiahni detaily, nekupuj veľké veci",
                   uvod: "Pocit nedokončenosti zvyčajne nespôsobuje chýbajúci nábytok, ale chýbajúce detaily.",
                   kroky: ["Odlož veci, ktoré tam nepatria, aby bolo vidieť, čo naozaj chýba.",
                           "Doplň textil, ktorý chýba (záclony, vankúše, koberec).",
                           "Na jednu stenu daj jednu vec vo výške očí (obraz, polica, zrkadlo)."] },
    nesedi:      { n: "Nesedí to k sebe", nazov: "Najprv zjednoť farby a materiály",
                   uvod: "Keď to nesedí, väčšinou je v miestnosti príliš veľa farieb a materiálov, nie príliš málo.",
                   kroky: ["Vyber 2 až 3 farby, ktoré sa tam opakujú, a ostatné odlož.",
                           "Zjednoť kovové detaily (kľučky, lampy, rámy) do jednej farby.",
                           "Zjednoť drevo na jeden odtieň alebo ho vyvaž textilom."] }
  };

  // otázka 3: veta pod verdiktom
  var NABYTOK = {
    vsetko:  { n: "Všetko", veta: "S nábytkom, ktorý máš, sa dá veľa zmeniť. Nič nové nekupuj, kým nevyskúšaš kroky nižšie." },
    vacsinu: { n: "Väčšinu", veta: "Väčšinu nábytku si nechaj. Čo chceš vymeniť, rozhodni až po krokoch nižšie, vtedy uvidíš, čo naozaj chýba." },
    par:     { n: "Len pár kúskov", veta: "Nábytok, ktorý ostane, ťa nebude obmedzovať. Skôr než kúpiš nový, urob kroky nižšie, podľa nich vyberieš, čo a kam." },
    nic:     { n: "Nič", veta: "Pred nákupom nového nábytku urob kroky nižšie. Uvidíš z nich, aký nábytok potrebuješ a kam ho dať." },
    neviem:  { n: "Neviem", veta: "Zatiaľ nič nekupuj. Urob kroky nižšie a všimni si, čo v miestnosti používaš a čo nie, potom sa rozhodni, čo ostane." }
  };

  // otázka 4: odsek o pocite
  var POCITY = {
    pokoj:     { n: "Pokoj",     odsek: "Chceš sa doma upokojiť. Drž sa mäkkého svetla, málo vecí na očiach a prírodných materiálov: ľan, svetlé drevo, vlna." },
    hrejivost: { n: "Hrejivosť", odsek: "Chceš sa zabaliť a zostať doma. Teplé tóny, viditeľné drevo a svetlo nízko, viac zdrojov svetla v priestore namiesto stropného." },
    utulno:    { n: "Útulno",    odsek: "Chceš miesto, kde sa dá pohodlne zastaviť. Vrstvy textilu, mäkké tvary, kútik na sedenie a viac malých zdrojov svetla." },
    veselost:  { n: "Veselosť",  odsek: "Chceš doma energiu. Svetlý základ, jedna až dve výraznejšie farby, rastliny a čo najviac denného svetla." },
    poriadok:  { n: "Poriadok",  odsek: "Potrebuješ, aby malo všetko svoje miesto. Zatvorené úložné priestory, jednotná paleta a málo druhov materiálov." },
    luxus:     { n: "Luxus",     odsek: "Chceš, aby domov pôsobil ako dobrý hotel. Hlboké tóny, menej kúskov, ale kvalitných, a detaily z kovu." }
  };

  var KEDY = {
    hned:       { n: "Hneď" },
    "3m":       { n: "Do 3 mesiacov" },
    rok:        { n: "Tento rok" },
    inspiracia: { n: "Zatiaľ sa len inšpirujem" }
  };

  var ROZPOCET = {
    do600:       { n: "Do 600 €" },
    "600-3000":  { n: "600 až 3 000 €" },
    "3000-8000": { n: "3 000 až 8 000 €" },
    "8000plus":  { n: "Nad 8 000 €" },
    neviem:      { n: "Zatiaľ neviem" }
  };

  // poradie otázok v teste (Miriam); k = kľúč v adrese
  var OTAZKY = [
    { k: "m", t: "Ktorú miestnosť chceš riešiť?", z: MIESTA },
    { k: "d", t: "Čo ti v nej prekáža najviac?", z: PROBLEMY },
    { k: "n", t: "Čo z vybavenia chceš určite ponechať?", z: NABYTOK },
    { k: "p", t: "Ako sa tam chceš cítiť?", z: POCITY },
    { k: "k", t: "Kedy chceš začať?", z: KEDY },
    { k: "r", t: "Koľko si ochotná dať do zmeny?", z: ROZPOCET }
  ];
  // plán stojí len na prvých štyroch, termín a rozpočet rozhodujú, kam človek ide
  var PLAN_KLUCE = ["m", "d", "n", "p"];

  /* Skupiny podľa Miriam (12. 10. 2026):
       horúci  = chce začať hneď alebo do 3 mesiacov A ZÁROVEŇ má od 3 000 €
                 → 10-minútový hovor, na ktorom jej Miriam plán odovzdá osobne
       vlažný  = platí len jedna z tých dvoch podmienok → plán e-mailom, ponuka diagnostiky, rýchlejšie e-maily
       ostatní = ani jedna → plán e-mailom, ponuka diagnostiky, pomalšie e-maily */
  function skupina(o) {
    var skoro = o.k === "hned" || o.k === "3m";
    var rozpocet = o.r === "3000-8000" || o.r === "8000plus";
    if (skoro && rozpocet) return "horuci";
    if (skoro || rozpocet) return "vlazny";
    return "ostatni";
  }

  function ma(z, v) { return typeof v === "string" && Object.prototype.hasOwnProperty.call(z, v); }
  function platne(o, len) {
    if (!o || typeof o !== "object") return false;
    for (var i = 0; i < OTAZKY.length; i++) {
      var q = OTAZKY[i];
      if (len && len.indexOf(q.k) === -1) continue;
      if (!ma(q.z, o[q.k])) return false;
    }
    return true;
  }
  function platnyPlan(o) { return platne(o, PLAN_KLUCE); }

  // ?m=..&d=.. → odpovede; bez platnej adresy skúsi sessionStorage. len = PLAN_KLUCE pre /plan
  function zAdresy(search, len) {
    var o = {}, p = new URLSearchParams(search || "");
    OTAZKY.forEach(function (q) { var v = p.get(q.k); if (v) o[q.k] = v; });
    if (platne(o, len)) return o;
    try { var s = JSON.parse(sessionStorage.getItem("mc_profil") || "null"); if (platne(s, len)) return s; } catch (e) {}
    return null;
  }
  function doAdresy(o, len) {
    return OTAZKY.filter(function (q) { return !len || len.indexOf(q.k) !== -1; })
      .map(function (q) { return q.k + "=" + encodeURIComponent(o[q.k]); }).join("&");
  }
  function planAdresa(o) { return "/plan?" + doAdresy(o, PLAN_KLUCE); }
  function uloz(o) { try { sessionStorage.setItem("mc_profil", JSON.stringify(o)); } catch (e) {} }

  // odpovede jedným riadkom, do GHL aj do súhrnu na stránke
  function suhrn(o) {
    return OTAZKY.map(function (q) { return q.z[o[q.k]] ? q.z[o[q.k]].n : ""; }).filter(Boolean).join(" · ");
  }

  /* 🔴 Len skutočné recenzie, doslovne z miriamczompoly.sk (rovnaké ako na variante B,
     diagnostika-b/dist/b/js/recenzie.js). Nič sa nedopisuje (zákon 108/2024, príloha bod 27).
     Tretia položka je doslovný výsek, ktorý sa zvýrazní. */
  var RECENZIE = [
    ["Iveta Pappová", "Cítila som sa ako u psychologičky pre priestor. Máš neskutočný cit, určite odporúčam.",
     "Cítila som sa ako u psychologičky pre priestor."],
    ["Jitka Lennerová", "Perfektne zladila starý nábytok s novým. Napriek tomu, že sme sa presťahovali z domu do paneláku, cítime sa v ňom oveľa lepšie.",
     "cítime sa v ňom oveľa lepšie."],
    ["Andrea Križanová", "Byt je vzdušný, farebne a dizajnovo lahodiaci oku i duši. Splnenie požiadaviek nad moje očakávania.",
     "lahodiaci oku i duši."],
    ["Danka Cziborová", "Náš byt má smer, charakter a jednoliaty štýl. Kvôli podlahovej krytine sme obvolali pol krajiny, aby mi ju nakoniec našla.",
     "Náš byt má smer, charakter a jednoliaty štýl."]
  ];

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  function recenzie(sel, kolko) {
    var kde = document.querySelector(sel);
    if (!kde) return;
    kde.innerHTML = RECENZIE.slice(0, kolko || 4).map(function (r, i) {
      var t = esc(r[1]), z = esc(r[2]);
      if (t.indexOf(z) !== -1) t = t.replace(z, "<mark>" + z + "</mark>");
      return '<figure class="gkarta" style="--i:' + i + '"><div class="ghlava"><span class="gava" aria-hidden="true">' +
        esc(r[0].charAt(0)) + '</span><div><div class="gmeno">' + esc(r[0]) + '</div><div class="gzdroj">Recenzia klienta</div></div></div>' +
        '<div class="ghviezdy" aria-label="5 z 5">★★★★★</div><blockquote class="gtext">' + t + '</blockquote></figure>';
    }).join("");
  }

  root.PROFIL = {
    MIESTA: MIESTA, PROBLEMY: PROBLEMY, NABYTOK: NABYTOK, POCITY: POCITY, KEDY: KEDY, ROZPOCET: ROZPOCET,
    OTAZKY: OTAZKY, PLAN_KLUCE: PLAN_KLUCE, skupina: skupina, platne: platne, platnyPlan: platnyPlan,
    zAdresy: zAdresy, doAdresy: doAdresy, planAdresa: planAdresa, uloz: uloz, suhrn: suhrn,
    recenzie: recenzie, esc: esc
  };
})(typeof globalThis !== "undefined" ? globalThis : window);
