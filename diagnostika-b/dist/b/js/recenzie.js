/* 🔴 PRAVIDLO: sem ide LEN skutočná recenzia, doslovne z miriamczompoly.sk.
   Nič sa nedopisuje (zákon 108/2024, príloha bod 27).
   Formát: ["Meno", "celý text", "časť, ktorá sa zvýrazní"]
   Tretia položka musí byť DOSLOVNÝ výsek z druhej.
   🔴 Štítok je „Recenzia klienta", NIE „Recenzia na Googli": či sú tieto
   recenzie aj na Google profile, sme neoverili. */
window.RECENZIE = [
 ["Sebastián Farský",
  "Chcel som niečo s charakterom, moderné art deco, ale vkusne. Spravila presne to, čo som mal v hlave. Len ja som to nevedel takto pomenovať.",
  "Spravila presne to, čo som mal v hlave."],
 ["Iveta Pappová",
  "Cítila som sa ako u psychologičky pre priestor. Máš neskutočný cit, určite odporúčam.",
  "Cítila som sa ako u psychologičky pre priestor."],
 ["Hugo Štefánek",
  "Môj prvý byt. Návrh aj realizáciu som zveril do rúk dizajnérky a neľutujem ani euro.",
  "neľutujem ani euro."],
 ["Jitka Lennerová",
  "Perfektne zladila starý nábytok s novým. Napriek tomu, že sme sa presťahovali z domu do paneláku, cítime sa v ňom oveľa lepšie.",
  "Perfektne zladila starý nábytok s novým."],
 ["Danka Cziborová",
  "Náš byt má smer, charakter a jednoliaty štýl. Kvôli podlahovej krytine sme obvolali pol krajiny, aby mi ju nakoniec našla.",
  "Kvôli podlahovej krytine sme obvolali pol krajiny, aby mi ju nakoniec našla."],
 ["Andrea Križanová",
  "Byt je vzdušný, farebne a dizajnovo lahodiaci oku i duši. Splnenie požiadaviek nad moje očakávania.",
  "Splnenie požiadaviek nad moje očakávania."],
];

window.postavKarty = function (sel, kolko) {
  var kde = document.querySelector(sel);
  if (!kde) return;
  var R = (window.RECENZIE || []).slice(0, kolko || 3);
  function uniknut(s){
    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }
  R.forEach(function (r, i) {
    var meno = r[0], text = uniknut(r[1]), zvyraz = r[2] ? uniknut(r[2]) : "";
    if (zvyraz && text.indexOf(zvyraz) !== -1) {
      text = text.replace(zvyraz, "<mark>" + zvyraz + "</mark>");
    }
    var d = document.createElement("div");
    d.className = "gkarta";
    d.style.setProperty("--i", i);
    d.innerHTML =
      '<div class="ghlava">' +
        '<div class="gava">' + uniknut(meno.charAt(0)) + '</div>' +
        '<div><div class="gmeno">' + uniknut(meno) + '</div>' +
        '<div class="gzdroj">Recenzia klienta</div></div>' +
      '</div>' +
      '<div class="ghviezdy" aria-label="Hodnotenie 5 z 5">★★★★★</div>' +
      '<p class="gtext">' + text + '</p>';
    kde.appendChild(d);
  });
};
