/* Lievik „Plán od Miriam“ (/profil), od 12. 10. 2026 podľa Miriam.
   Spoločné dáta pre stránky /profil (formulár), /profil-rezervacia (horúci) a /plan (plán, odkaz
   z e-mailu). Vlažní a ostatní idú po formulári na /diagnostika so zeleným pruhom. Ten istý súbor číta aj server (functions/_lib/profil.js),
   preto tu nesmie byť nič, čo pri načítaní siaha na window alebo document.

   🔴 Otázky, odpovede a všetky texty plánu napísala Miriam (12. 10. 2026). Nič v nich
   nedopisovať bez nej. Vety pod fotkami realizácií napísala Miriam 6. 11. 2026 (stránka /kontrola-planu-cu9r5c).

   Odpovede sa nesú v adrese (?m=&d=&n=&p=&k=&r=) aj v sessionStorage („mc_profil“),
   aby stránky fungovali aj pri zablokovanom úložisku a plán sa dal poslať odkazom. */
(function (root) {
  "use strict";

  var FOTO = "/assets/img/realizacie/";

  // n: na dlaždici, oslovenie: prvý riadok plánu, lok: „v tvojej …“
  // pred/po: Miriamina realizácia v pláne (13. 10. 2026, Jano: pred aj po). Dvojice sú z toho istého
  // bytu a podľa popisov na webe tá istá miestnosť. Detskú, predsieň a celú fotku kúpeľne poslala Miriam
  // 16. 10. (miriam-*.jpg). 6. 11. Miriam: „nie pracovný kút ale pracovňa“, prvá veta „V tvojej … by som ako prvé
  // riešila toto:“ a pod fotkami jej vlastný popis realizácie. Kľúč kut v adrese ostáva kvôli odoslaným odkazom.
  // Pracovňa: pred = izba s regálmi a ružovými závesmi (Vidiecky byt IMG_8485), po = modrá sedačka (vidiecky-po).
  // Kuchyňa: Miriam chce iný záber pred (polica na čelnej stene, nie hodiny), zatiaľ sa nenašiel.
  // vysoke: fotky sú na výšku, v pláne sa ukážu 3:4 namiesto 4:3, aby sa neorezali.
  var MIESTA = {
    obyvacka: { n: "Obývačka", oslovenie: "V tvojej obývačke by som ako prvé riešila toto:", lok: "v tvojej obývačke",
                pred: FOTO + "vidiecky-pred-2.jpg", po: FOTO + "vidiecky-4.jpg",
                veta: "Klientka sa prisťahovala z domu a chcela vidiecky štýl, do paneláku som ho preniesla len jemne, aby sedel k mestskému bytu." },
    spalna:   { n: "Spálňa", oslovenie: "V tvojej spálni by som ako prvé riešila toto:", lok: "v tvojej spálni",
                pred: FOTO + "vidiecky-pred-3.jpg", po: FOTO + "vidiecky-po-2.jpg",
                // 🔴 Miriam 6. 11.: „pred má byť fotka s ružovou spálňou“ a k nej veta „Ružové steny s borovicovým nábytkom
                // pôsobili ťažko a príliš teplo. Masívna posteľ aj nábytok ostali, zmenila sa farba stien, textil, záclony a svetlá.“
                // Fotka sa nenašla (Drive, Gmail, GHL médiá), preto zatiaľ stará veta, nech nepíše o ružových stenách pod bielymi.
                veta: "Jitkina spálňa v Trnave pred premenou a po nej." },
    kuchyna:  { n: "Kuchyňa a jedáleň", oslovenie: "V tvojej kuchyni a jedálni by som ako prvé riešila toto:", lok: "v tvojej kuchyni a jedálni",
                pred: FOTO + "starsia-pani-pred-3.jpg", po: FOTO + "starsia-pani-4.jpg",
                veta: "Pôvodne pôsobila úzka a dlhá. Zrušila som zbytočnú murovanú špajzu a navrhla linku tak, aby vznikla moderná a praktická kuchyňa a ostalo miesto aj na malý stôl ako predtým." },
    detska:   { n: "Detská", oslovenie: "V tvojej detskej izbe by som ako prvé riešila toto:", lok: "v tvojej detskej izbe",
                pred: FOTO + "miriam-detska-pred.jpg", po: FOTO + "miriam-detska-po.jpg", vysoke: true,
                veta: "Vysoký strop je skvelo využitý na trvalé spanie, čím sa dole uvoľnil priestor, kde by inak bola posteľ. Celý priestor pod schodiskom je využitý na úložné priestory." },
    predsien: { n: "Predsieň", oslovenie: "V tvojej predsieni by som ako prvé riešila toto:", lok: "v tvojej predsieni",
                pred: FOTO + "miriam-predsien-pred.jpg", po: FOTO + "miriam-predsien-po.jpg", vysoke: true,
                veta: "Pôvodne studená chodba dostala krásny dizajn. Použila som starý šijací stôl z pivnice, zrkadlo dostalo správnu výšku a bez krásneho koberca by to nebolo ono." },
    kut:      { n: "Pracovňa", oslovenie: "V tvojej pracovni by som ako prvé riešila toto:", lok: "v tvojej pracovni",
                pred: FOTO + "vidiecky-pracovna-pred.jpg", po: FOTO + "vidiecky-po.jpg",
                veta: "Kto povedal, že pracovný stôl musí byť nalepený na okne?" },
    kupelna:  { n: "Kúpeľňa a WC", oslovenie: "V tvojej kúpeľni by som ako prvé riešila toto:", lok: "v tvojej kúpeľni",
                pred: FOTO + "starsia-pani-pred.jpg", po: FOTO + "miriam-kupelna-po.jpg",
                veta: "Byt som robila v modernom retro štýle pre staršiu pani, aby mala spojenie s časmi minulými. Preto je tu aj namiesto sklenenej zásteny sprchový záves." }
  };

  // otázka 2: verdikt, úvod a 3 kroky na tento víkend
  var PROBLEMY = {
    tma:         { n: "Je tam tma", nazov: "Najprv svetlo",
                   uvod: "Skôr než kúpiš čokoľvek nové, vyrieš svetlo. Tmavá miestnosť sa novým nábytkom nezjasní.",
                   kroky: ["Večer nesvieť len stropným svetlom, postav lampu do najtmavšieho rohu. Ak lampu nemáš, stačí aj lacné bezdrôtové LED svietidlo.",
                           "Vymeň studené žiarovky za silnejšie neutrálne. Teplé by tmavú miestnosť stmavili, ak nie sú naozaj silné. Neutrálne ju rozjasnia a svetlo bude aj tak mäkšie ako zo studených.",
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

  // otázka 4: odsek o pocite (odseky prepísala Miriam 6. 11. 2026; veselosť premenovala na ľahkosť,
  // kľúč veselost v adrese ostáva, aby fungovali už odoslané odkazy na plán)
  var POCITY = {
    pokoj:     { n: "Pokoj",     odsek: "Chceš sa doma upokojiť. Mäkké svetlo, málo vecí na očiach a prírodné materiály ako ľan, svetlé drevo a vlna. Teplé žiarovky, ale naozaj silné, a ak sa dá, stmievateľné." },
    hrejivost: { n: "Hrejivosť", odsek: "Chceš, aby domov pôsobil hrejivo po celý rok. Teplé tóny ako béžová, karamelová alebo terakota, viditeľné drevo a ratan." },
    utulno:    { n: "Útulno",    odsek: "Chceš domov, kde sa hneď uvoľníš. Vrstvy textilu, mäkké tvary, pohodlné miesto na sedenie, viac malých zdrojov teplého svetla a niekoľko osobných vecí na očiach, napríklad knihy alebo fotky." },
    veselost:  { n: "Ľahkosť",   odsek: "Chceš, aby ťa doma nič neťažilo. Veľa denného svetla, svetlé farby, ľahké záclony a nábytok na nožičkách, aby bolo vidieť podlahu. K tomu pár farebných kúskov, pri ktorých sa usmeješ." },
    poriadok:  { n: "Poriadok",  odsek: "Chceš, aby malo všetko svoje miesto a upratať ti trvalo pár minút. Viac zatvorených skriniek ako otvorených políc, jednotné farby a materiály a voľné plochy, na ktorých nič neleží." },
    luxus:     { n: "Luxus",     odsek: "Chceš, aby domov pôsobil ako dobrý hotel. Menej kúskov, ale kvalitných, materiály príjemné na dotyk ako zamat, vlna alebo kameň, premyslené svetlo a nič, čo pôsobí lacno." }
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

  /* Skupiny podľa Miriam (12. 10. 2026), zmenené 5. 11. 2026 (Jano):
       horúci  = má od 3 000 € (kedykoľvek chce začať: „pri takom rozpočte nezáleží, kedy chcú začať“),
                 ALEBO chce začať hneď a má 600 až 3 000 € (len „hneď“, nie „do 3 mesiacov“)
                 → 10-minútový hovor, na ktorom jej Miriam plán odovzdá osobne
       vlažný  = chce začať hneď alebo do 3 mesiacov, ale nie je horúci
                 → plán e-mailom, ponuka diagnostiky, rýchlejšie e-maily
       ostatní = ani jedno → plán e-mailom, ponuka diagnostiky, pomalšie e-maily
     🔴 Skupinu počíta server (functions/api/profil.js číta tento súbor) a stránka ide podľa odpovede,
        takže zmena platí hneď po nasadení aj pre prehliadač so starou verziou súboru. */
  function skupina(o) {
    var skoro = o.k === "hned" || o.k === "3m";
    var rozpocet = o.r === "3000-8000" || o.r === "8000plus";
    if (rozpocet) return "horuci";
    if (o.k === "hned" && o.r === "600-3000") return "horuci";
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

  /* Ďalšie skutočné recenzie z miriamczompoly.sk (sekcia Recenzie na úvode), doslovne, s projektom.
     Ležia v pozadí za štyrmi prednými a vidno z nich len kúsky zhora a z bokov,
     aby bolo jasné, že recenzií je viac (Jano, 28. 10. 2026). */
  var RECENZIE_POZADIE = [
    ["Sebastián Farský", "Byt Štajnerka", "Chcel som niečo s charakterom, moderné art deco, ale vkusne. Spravila presne to, čo som mal v hlave."],
    ["Tomáš Segul", "Arboria, 1-izbový byt", "Dizajnérka sa nebála farieb. Pôvodne som sa tmavohnedej steny bál, ale nakoniec je to super."],
    ["Hlavatí", "Byt pre staršiu pani, Trnava", "Vždy keď prídem k mame do bytu, mám radosť z výsledku. Je to pekný, útulný, moderný bytík, kde sa mama cíti dobre."],
    ["Hugo Štefánek", "Garsónka Hlohovec", "Môj prvý byt. Návrh aj realizáciu som zveril do rúk dizajnérky a neľutujem ani euro."],
    ["Tatiana Lániková", "Podkrovie, dievčenská izba", "Každý máme nejaký vkus, ale len dizajnér vie, ako z toho urobiť čarovné miesto pre oddych."],
    ["Sivokoví", "Arboria, 2-izbový byt", "Byt máme zariadený nadštandardne. Podľa realitnej maklérky patrí k najkrajším v komplexe."],
    ["Miriam Gašparíková", "Kaderníctvo Špačince", "Jej kreativita, profesionálny prístup a rýchla reakcia ma naozaj ohromili. Určite ju odporúčam."],
    ["Novotní", "Motorest Bučany", "Dostávame obdiv od zákazníkov. Vracajú sa nielen kvôli našej kuchyni, ale aj kvôli pôsobivému interiéru."]
  ];

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  function recenzie(sel, kolko) {
    var kde = document.querySelector(sel);
    if (!kde) return;
    var zadne = RECENZIE_POZADIE.map(function (r, i) {
      return '<figure class="gkarta gkarta--zadna z' + (i + 1) + '"><div class="ghlava"><span class="gava">' + esc(r[0].charAt(0)) +
        '</span><div><div class="gmeno">' + esc(r[0]) + '</div><div class="gzdroj">' + esc(r[1]) + '</div></div></div>' +
        '<div class="ghviezdy">★★★★★</div><blockquote class="gtext">' + esc(r[2]) + '</blockquote></figure>';
    }).join("");
    kde.innerHTML = '<div class="kopa-zadne" aria-hidden="true">' + zadne + '</div>' +
      RECENZIE.slice(0, kolko || 4).map(function (r, i) {
      var t = esc(r[1]), z = esc(r[2]);
      if (t.indexOf(z) !== -1) t = t.replace(z, "<mark>" + z + "</mark>");
      return '<figure class="gkarta" style="--i:' + i + '"><div class="ghlava"><span class="gava" aria-hidden="true">' +
        esc(r[0].charAt(0)) + '</span><div><div class="gmeno">' + esc(r[0]) + '</div><div class="gzdroj">Recenzia klientky</div></div></div>' +
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
