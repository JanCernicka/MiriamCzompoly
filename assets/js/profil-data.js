/* Lievik „Pocitový profil domova“ (náhľad od 8. 10. 2026, zatiaľ nie naostro).
   Spoločné dáta pre /profil (test), /profil-rezervacia (kvalifikovaní) a /profil-vysledok (ostatní).

   🔴 Texty profilov, palety a kroky sú NÁŠ PRVÝ NÁVRH. Pred spustením ich musí prepísať
   alebo schváliť Miriam. Fotky sú jej skutočné realizácie, priradenie k pocitom je naše.

   Odpovede sa nesú v adrese (?p=&m=&d=&s=&k=&r=) aj v sessionStorage („mc_profil“),
   aby výsledok fungoval aj pri zablokovanom úložisku a dal sa poslať odkazom. */
(function () {
  "use strict";

  var POCITY = {
    pokoj:     { n: "Pokoj",     h: "chcem si vydýchnuť" },
    veselost:  { n: "Veselosť",  h: "chcem sa domov tešiť" },
    hrejivost: { n: "Hrejivosť", h: "teplo aj keď je zima" },
    utulno:    { n: "Útulno",    h: "zabaliť sa do deky" },
    luxus:     { n: "Luxus",     h: "ako v dobrom hoteli" },
    poriadok:  { n: "Poriadok",  h: "všetko na svojom mieste" }
  };

  // n: na dlaždici, akuz: „riešenie pre tvoju …“, lok: „čo … nechať“
  var MIESTA = {
    obyvacka: { n: "Obývačka",          akuz: "obývačku",          lok: "v tvojej obývačke" },
    spalna:   { n: "Spálňa",            akuz: "spálňu",            lok: "v tvojej spálni" },
    kuchyna:  { n: "Kuchyňa a jedáleň", akuz: "kuchyňu a jedáleň", lok: "v tvojej kuchyni a jedálni" },
    detska:   { n: "Detská",            akuz: "detskú",            lok: "v tvojej detskej" },
    predsien: { n: "Predsieň",          akuz: "predsieň",          lok: "v tvojej predsieni" },
    kut:      { n: "Pracovný kút",      akuz: "pracovný kút",      lok: "v tvojom pracovnom kúte" }
  };

  var DOVODY = {
    tma:         { n: "Je tam tma",         veta: "je tam tma",
                   kroky: ["Postav lampu do najtmavšieho rohu a večer nesvieť len stropným svetlom.",
                           "Vymeň studené žiarovky za teplé.",
                           "Zaves zrkadlo vedľa okna alebo oproti nemu, rozptýli denné svetlo."] },
    neporiadok:  { n: "Neporiadok",          veta: "je tam neporiadok",
                   kroky: ["Vyber jednu plochu a nechaj na nej len tri veci.",
                           "Čo používaš denne, daj do jedného košíka tam, kde to používaš.",
                           "Čo si rok nepoužila, odlož do krabice mimo izby a o mesiac rozhodni."] },
    chlad:       { n: "Je tam chladno",     veta: "je tam chladno",
                   kroky: ["Pridaj textil: deku, vankúše, koberec aspoň pod predné nohy sedačky.",
                           "Večer sviet nižšie, lampami namiesto stropu.",
                           "Prines do izby drevo alebo rastlinu."] },
    stiesnene:   { n: "Je to stiesnené",    veta: "je to stiesnené",
                   kroky: ["Vynes jeden kus nábytku, ktorý len prekáža v ceste.",
                           "Zaves záclony čo najvyššie a nechaj ich siahať po zem.",
                           "Uvoľni podlahu, nech je na zemi čo najmenej vecí."] },
    nesedi:      { n: "Nesedí to k sebe",   veta: "nesedí to k sebe",
                   kroky: ["Vyber tri farby, ktoré v izbe už sú, a drobnosti v iných farbách odlož.",
                           "Jednu z nich zopakuj aspoň trikrát: vankúš, váza, obraz.",
                           "Daj všade žiarovky rovnakého tónu."] },
    nedokoncene: { n: "Je to nedokončené",  veta: "je to nedokončené",
                   kroky: ["Spíš, čo v izbe čaká, a vyber jednu vec, ktorú dokončíš tento víkend.",
                           "Zaves, čo stojí opreté o stenu: obrazy, police.",
                           "Kým nie je hotová elektrika, chýbajúce svetlo nahraď lampou."] }
  };

  var SVETLO = {
    slnko:  { n: "Veľa slnka",     veta: "Tvoja miestnosť má veľa slnka, znesie aj tmavšie a sýtejšie tóny z palety." },
    tma:    { n: "Skôr tma",       veta: "Tvoja miestnosť je tmavšia. Steny drž v najsvetlejších tónoch palety, tmavšie farby nechaj na textil a doplnky." },
    neviem: { n: "Neviem posúdiť", veta: "Farbu na stenu si najprv vyskúšaj na vzorke a pozri ju ráno aj večer, svetlo ju veľmi mení." }
  };

  var KEDY = {
    hned:       { n: "Hneď" },
    "3m":       { n: "Do 3 mesiacov" },
    rok:        { n: "Tento rok" },
    inspiracia: { n: "Zatiaľ sa len inšpirujem" }
  };

  // rozpätia určil Jano 8. 10. 2026
  var ROZPOCET = {
    do600:       { n: "Do 600 €",         h: "radšej si to urobím sama" },
    "600-3000":  { n: "600 až 3 000 €" },
    "3000-8000": { n: "3 000 až 8 000 €" },
    "8000plus":  { n: "Viac ako 8 000 €", h: "hľadám prémiovú prerábku na kľúč" },
    neviem:      { n: "Zatiaľ neviem" }
  };

  var FOTO = "/assets/img/realizacie/";
  var PROFILY = {
    pokoj: { nazov: "Pokojný prístav",
      text: "Doma potrebuješ vydýchnuť. Priestor nemusí byť prázdny, len na teba nesmie kričať: málo vecí na očiach, mäkké svetlo a materiály, ktoré chceš chytiť do ruky.",
      paleta: [["Ovsená", "#d9cdb8"], ["Šalviová", "#a7b3a0"], ["Teplá sivá", "#9a948a"], ["Piesková", "#c8b49a"], ["Orech", "#5a4636"]],
      materialy: "ľan, svetlé drevo, vlna", svetlo: "viac zdrojov v rôznych výškach, teplé, nič nesvieti do očí",
      nekupuj: "drobné dekorácie do políc", foto: FOTO + "arboria1-po.jpg" },
    veselost: { nazov: "Svieže ráno",
      text: "Chceš sa domov tešiť. Svetlý základ, jedna alebo dve odvážne farby, rastliny a veci, ktoré ťa rozosmejú.",
      paleta: [["Mliečna", "#f3efe6"], ["Šafranová", "#e0a526"], ["Koralová", "#e07a5f"], ["Mätová", "#9cc9b3"], ["Atramentová", "#2f4b6e"]],
      materialy: "lakované drevo, keramika, bavlna so vzorom", svetlo: "čo najviac denného svetla, večer neutrálne biele",
      nekupuj: "ďalšie farebné drobnosti, stačia dve výrazné farby", foto: FOTO + "dievcenska-po.jpg" },
    hrejivost: { nazov: "Teplé ohnisko",
      text: "Potrebuješ teplo, aj keď je vonku zima. Teplé tóny, drevo, ktoré vidno, a svetlo nízko, ako pri ohni.",
      paleta: [["Krémová", "#efe3cf"], ["Karamelová", "#c08a52"], ["Terakota", "#b5603f"], ["Olivová", "#7d7a4f"], ["Čokoládová", "#4a3326"]],
      materialy: "masívne drevo, vlna, koža alebo semiš", svetlo: "veľmi teplé, nízko, lampy a sviečky",
      nekupuj: "studené biele svietidlá a lesklé povrchy", foto: FOTO + "vidiecky-4.jpg" },
    utulno: { nazov: "Mäkké hniezdo",
      text: "Chceš sa zabaliť do deky a nikam nechodiť. Vrstvy textilu, mäkké tvary a kútik, kde sa dá čítať.",
      paleta: [["Smotanová", "#f1e8da"], ["Púdrová", "#e3c9bd"], ["Machová", "#8a8f6a"], ["Šedohnedá", "#8c7b6b"], ["Slivková", "#5e3f4a"]],
      materialy: "bouclé, pletené textílie, ratan", svetlo: "viac malých zdrojov, stmievače",
      nekupuj: "veľké lesklé kusy nábytku do malej izby", foto: FOTO + "redizajn-po.jpg" },
    luxus: { nazov: "Tichý luxus",
      text: "Chceš, aby domov pôsobil ako dobrý hotel. Hlboké tóny, málo kúskov, ale kvalitných, a detaily z kovu.",
      paleta: [["Kamenná", "#d8d2c8"], ["Grafitová", "#3d3f42"], ["Hlboká zelená", "#2f4a3f"], ["Mosadz", "#b08d57"], ["Bordová", "#5b2a2e"]],
      materialy: "zamat, kameň, mosadz", svetlo: "vo vrstvách, s nasvietením obrazov a materiálov",
      nekupuj: "veľa lacných dekorácií namiesto jedného kvalitného kúsku", foto: FOTO + "stajnerka-po.jpg" },
    poriadok: { nazov: "Čistá hlava",
      text: "Potrebuješ, aby malo všetko svoje miesto. Zatvorené úložné priestory, jednotná paleta a málo druhov materiálov.",
      paleta: [["Čistá biela", "#f5f4f0"], ["Svetlý dub", "#d6bf98"], ["Holubia", "#b9b8b3"], ["Bridlicová", "#5f6870"], ["Čierna", "#22201e"]],
      materialy: "matné fronty, svetlé drevo, kov", svetlo: "rovnomerné, aj v skriniach a nad pracovnými plochami",
      nekupuj: "otvorené police a úložné boxy, kým nie je jasné, čo kam patrí", foto: FOTO + "arboria2-4.jpg" }
  };

  // poradie otázok v teste; k = kľúč v adrese
  var OTAZKY = [
    { k: "p", t: "Ako sa chceš cítiť, keď prídeš domov?", z: POCITY },
    { k: "m", t: "Ktoré miesto doma najradšej obchádzaš?", z: MIESTA },
    { k: "d", t: "Prečo sa tam necítiš dobre?", z: DOVODY },
    { k: "s", t: "Koľko svetla tam je cez deň?", z: SVETLO },
    { k: "k", t: "Kedy chceš so zmenou začať?", z: KEDY },
    { k: "r", t: "Koľko si zhruba pripravená dať do zmeny?", z: ROZPOCET }
  ];

  /* Kto ide na rezerváciu rozhovoru a kto dostane profil automaticky.
     Hranicu určí Miriam podľa toho, koľko rozhovorov týždenne zvládne.
       len sa inšpiruje alebo do 600 €  → profil
       hneď alebo do 3 mesiacov         → rozhovor
       tento rok a od 3 000 €           → rozhovor (veľké projekty sa plánujú dopredu)
       inak                             → profil */
  function rozhodni(o) {
    if (o.k === "inspiracia" || o.r === "do600") return "profil";
    if (o.k === "hned" || o.k === "3m") return "rozhovor";
    if (o.k === "rok" && (o.r === "3000-8000" || o.r === "8000plus")) return "rozhovor";
    return "profil";
  }

  function platne(o) {
    if (!o) return false;
    for (var i = 0; i < OTAZKY.length; i++) {
      var q = OTAZKY[i];
      if (!o[q.k] || !Object.prototype.hasOwnProperty.call(q.z, o[q.k])) return false;
    }
    return true;
  }

  function zAdresy(search) {
    var o = {}, p = new URLSearchParams(search || "");
    OTAZKY.forEach(function (q) { var v = p.get(q.k); if (v) o[q.k] = v; });
    if (platne(o)) return o;
    try { var s = JSON.parse(sessionStorage.getItem("mc_profil") || "null"); if (platne(s)) return s; } catch (e) {}
    return null;
  }

  function doAdresy(o) {
    return OTAZKY.map(function (q) { return q.k + "=" + encodeURIComponent(o[q.k]); }).join("&");
  }

  function uloz(o) { try { sessionStorage.setItem("mc_profil", JSON.stringify(o)); } catch (e) {} }

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

  window.PROFIL = {
    POCITY: POCITY, MIESTA: MIESTA, DOVODY: DOVODY, SVETLO: SVETLO, KEDY: KEDY, ROZPOCET: ROZPOCET,
    PROFILY: PROFILY, OTAZKY: OTAZKY, rozhodni: rozhodni, platne: platne, zAdresy: zAdresy,
    doAdresy: doAdresy, uloz: uloz, recenzie: recenzie, esc: esc
  };
})();
