/* Dáta a výstup magnetu „Pred veľkou zmenou“ (návrh B, 12. 11. 2026). Spoločné pre /pred-zmenou,
   /pred-zmenou-poradie a /pred-zmenou-hovor. Obsah verzií a pravidlá teploty sú z Miriaminho PDF z 8. 11. 2026. */
(function (root) {
  "use strict";
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
    /* Otázky doslova z Miriaminho PDF „Lead magnet: pred veľkou zmenou“ (8. 11. 2026). */
  var OTAZKY = [
    { k: "situacia", t: "Čo práve riešiš?", z: {
      a: "Kupujem alebo preberám nový byt či dom (novostavba)",
      b: "Kúpila som starší byt alebo dom a idem ho prerobiť",
      c: "Sťahujem sa a veľa vecí si beriem so sebou",
      d: "Zariaďujem byt na prenájom",
      jedna: "Chcem zmeniť len jednu miestnosť" } },
    { k: "kedy", t: "Kedy to potrebuješ mať hotové?", z: { do3: "Do 3 mesiacov", m36: "O 3 až 6 mesiacov", neskor: "Neskôr alebo zatiaľ neviem" } },
    { k: "hotove", t: "Čo už máš rozhodnuté?", z: { nic: "Zatiaľ nič", rozvody: "Rozloženie miestností, elektriku a rozvody", kuchyna: "Aj kuchyňu a kúpeľňu", nabytok: "Zostáva už len nábytok a doplnky" } },
    { k: "rozpocet", t: "Koľko chceš do toho investovať? (bez ceny bytu)", z: { do5: "Do 5 000 €", r5_15: "5 000 až 15 000 €", r15_40: "15 000 až 40 000 €", nad40: "Nad 40 000 €", neviem: "Zatiaľ neviem" } },
    { k: "kde", t: "Kde sa byt alebo dom nachádza?", text: "mesto alebo obec" }
  ];

  /* Obsah verzií z jej PDF. Kroky, ktoré podľa otázky 3 už má za sebou: NÁVRH (Jano/Miriam potvrdia). */
  var VERZIE = {
    a: { nazov: "Novostavba", hlavna: "Elektrika skôr než nábytok.",
      kroky: ["Ujasni si, ako budeš každú miestnosť používať: kde sa pracuje, kde je televízor, kde sa spí.",
        "Podľa toho rozhodni o zásuvkách, vypínačoch a svetlách. Klientske zmeny majú u developera termín.",
        "Kuchyňa: rozmery, spotrebiče, prívody vody a elektriky.",
        "Podlahy, dvere, obklady.",
        "Nábytok až nakoniec."],
      chyby: ["Zásuvky podľa štandardu developera.", "Kuchyňa navrhnutá bez ohľadu na zvyšok bytu.", "Nábytok kúpený pred zameraním."],
      hotove: { rozvody: [0, 1], kuchyna: [0, 1, 2], nabytok: [0, 1, 2, 3] },
      pribeh: { nadpis: "Byt Štajnerka, Trnava", text: "Z hrubej stavby až po hotový byt.",
        pred: ["/assets/img/realizacie/stajnerka-pred-2.jpg", "Obytná miestnosť v hrubej stavbe"],
        po: ["/assets/img/realizacie/stajnerka-po.jpg", "Obývacia a jedálenská časť po premene"] } },
    b: { nazov: "Prerobenie staršieho bytu alebo domu", hlavna: "Rozloženie miestností skôr než obklady.",
      kroky: ["Spíš si, čo ti v byte dnes prekáža.",
        "Rozhodni, či sa búra alebo presúva, ešte pred oslovením majstrov.",
        "Elektrika, voda a kúrenie podľa nového rozloženia.",
        "Kuchyňa a kúpeľňa, majú najdlhšie dodacie lehoty.",
        "Povrchy a nábytok."],
      chyby: ["Majster robí bez plánu podľa seba.", "Obklady vybrané v predajni bez celku.", "Rozpočet bez rezervy."],
      hotove: { rozvody: [1, 2], kuchyna: [1, 2, 3], nabytok: [0, 1, 2, 3] },
      pribeh: { nadpis: "Byt pre staršiu pani, Trnava", text: "Pôvodná kuchyňa a kuchyňa po prerobení.",
        pred: ["/assets/img/realizacie/starsia-pani-pred-3.jpg", "Pôvodná kuchyňa pred premenou"],
        po: ["/assets/img/realizacie/starsia-pani-3.jpg", "Kuchyňa a pohľad do obývacej izby"] } },
    c: { nazov: "Sťahovanie", hlavna: "Najprv zmerať, potom sťahovať.",
      kroky: ["Spíš si zoznam vecí, ktoré chceš zobrať.",
        "Zmeraj ich a zakresli do pôdorysu nového bytu.",
        "Rozhodni, čo necháš alebo predáš, ešte pred sťahovaním.",
        "Svetlá a garníže pred nasťahovaním.",
        "Dokúpiť až po nasťahovaní."],
      chyby: ["Sťahovať všetko a vyhadzovať až potom.", "Kupovať nové pred zmeraním.", "Nechávať staré veci „zatiaľ“."],
      hotove: {},
      pribeh: { nadpis: "Vidiecky byt, Trnava", text: "Starý nábytok zostal a dostal okolo seba nový.",
        pred: ["/assets/img/realizacie/vidiecky-pred.jpg", "Obývacia izba pred premenou"],
        po: ["/assets/img/realizacie/vidiecky-po.jpg", "Tá istá obývacia izba po premene"] } },
    d: { nazov: "Investičný byt", hlavna: "Zariaďuješ pre nájomníka, nie pre seba.",
      kroky: ["Urči, komu budeš prenajímať a za koľko.",
        "Rozloženie a úložný priestor podľa toho.",
        "Odolné materiály, ktoré vydržia striedanie nájomníkov.",
        "Zariadenie s rozpočtom podľa toho, koľko má byt zarábať.",
        "Priprav byt tak, aby dobre vyzeral na fotkách do inzerátu."],
      chyby: ["Zariaďovať podľa svojho vkusu.", "Lacné veci, ktoré sa o rok menia.", "Málo úložného priestoru."],
      hotove: { rozvody: [1], kuchyna: [1, 2], nabytok: [1, 2] },
      /* 🔴 overiť s Miriam, či garsónka v Hlohovci bola byt na prenájom; inak vymeniť */
      pribeh: { nadpis: "Garsónka, Hlohovec", text: "Jeden priestor, v ktorom je spanie, kuchyňa aj pracovné miesto.",
        pred: ["/assets/img/realizacie/garsonka-po.jpg", "Spanie a kuchynská linka v jednom priestore"],
        po: ["/assets/img/realizacie/garsonka-5.jpg", "Pracovné miesto pri okne"] } }
  };

  /* Veta podľa otázky 2. Prvá je z PDF, ďalšie dve sú NÁVRH. */
  var CAS = { do3: "Do 3 mesiacov stihneš kroky 1 až 3. Na tie sa sústreď teraz.",
    m36: "Máš čas na všetkých päť krokov. Prvé dva rozhodni ešte tento mesiac.",
    neskor: "Kým nemáš termín, urob aspoň prvý krok. Ten ti nikto nevezme." };

  /* Teplota podľa PDF: horúci, horúci aj tak, vlažní, studení. */
  function teplota(o) {
    var r = o.rozpocet, nad15 = r === "r15_40" || r === "nad40";
    if (r === "nad40" || (r === "r15_40" && o.kedy === "do3")) return "horuca";
    if (nad15 && o.hotove === "nic") return "horuca";
    if (r === "r5_15" || nad15) return "vlazna";
    return "studena";
  }


  /* Poradie krokov ako HTML: hlavná veta, veta o čase, päť krokov (hotové označené), tri chyby, príbeh klientky. */
  function poradieHTML(o, meno) {
    var v = VERZIE[o.situacia], hotove = v.hotove[o.hotove] || [];
    var kroky = v.kroky.map(function (t, i) {
      return hotove.indexOf(i) >= 0 ? '<li class="hotovo">' + esc(t) + "<small>Toto už máš za sebou.</small></li>" : "<li>" + esc(t) + "</li>";
    }).join("");
    return '<span class="vys-stitok">' + esc(meno) + ", tvoje poradie krokov · " + esc(v.nazov) + "</span>" +
      '<h1 class="vys-hlavna">' + esc(v.hlavna) + "</h1>" +
      '<p class="vys-cas">' + esc(CAS[o.kedy]) + "</p>" +
      '<ol class="vys-kroky">' + kroky + "</ol>" +
      '<div class="vys-chyby"><h3>Tri najdrahšie chyby</h3><ul>' + v.chyby.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + "</ul></div>" +
      '<div class="vys-pribeh"><h3>Ako to riešila klientka v podobnej situácii</h3><p><b>' + esc(v.pribeh.nadpis) + "</b>. " + esc(v.pribeh.text) + "</p>" +
      '<div class="pred-po"><figure><img src="' + v.pribeh.pred[0] + '" alt="' + esc(v.pribeh.pred[1]) + '" loading="lazy"><figcaption>' + esc(v.pribeh.pred[1]) + "</figcaption></figure>" +
      '<figure><img src="' + v.pribeh.po[0] + '" alt="' + esc(v.pribeh.po[1]) + '" loading="lazy"><figcaption>' + esc(v.pribeh.po[1]) + "</figcaption></figure></div></div>";
  }
  function ulozene() { try { var u = JSON.parse(sessionStorage.getItem("pz") || "null"); return u && u.o && VERZIE[u.o.situacia] ? u : null; } catch (e) { return null; } }
  root.PZ = { OTAZKY: OTAZKY, VERZIE: VERZIE, CAS: CAS, teplota: teplota, esc: esc, poradieHTML: poradieHTML, ulozene: ulozene };
})(typeof globalThis !== "undefined" ? globalThis : window);
