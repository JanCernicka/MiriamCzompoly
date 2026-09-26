/* Zdieľané recenzie lievika. Doslovne z miriamczompoly.sk, nič neprepisovať.
   `zvyraznit` je JEDNA veta, ktorá sa na stránke podčiarkne žltým.
   Stránka si vyberie sadu atribútom: <div class="karty-recenzii" data-recenzie="sutaz"></div> */
window.RECENZIE = {
  // súťažná stránka: námietky „nanúti mi svoj štýl“, „ja to nezvládnem vybaviť“, „vyhodím peniaze“
  sutaz: [
    {
      meno: 'Sebastián Farský',
      projekt: 'Byt Štajnerka, Trnava',
      text: 'Chcel som niečo s charakterom, moderné art deco, ale vkusne. Spravila presne to, čo som mal v hlave. Len ja som to nevedel takto pomenovať.',
      zvyraznit: 'Spravila presne to, čo som mal v hlave.'
    },
    {
      meno: 'Danka Cziborová',
      projekt: 'Byt, Komárno',
      text: 'Náš byt má smer, charakter a jednoliaty štýl. Kvôli podlahovej krytine sme obvolali pol krajiny, aby mi ju nakoniec našla.',
      zvyraznit: 'Kvôli podlahovej krytine sme obvolali pol krajiny, aby mi ju nakoniec našla.'
    },
    {
      meno: 'Hugo Štefánek',
      projekt: 'Garsónka, Hlohovec',
      text: 'Môj prvý byt. Návrh aj realizáciu som zveril do rúk dizajnérky a neľutujem ani euro.',
      zvyraznit: 'neľutujem ani euro.'
    }
  ],
  // stránka s ponukou diagnostiky
  ponuka: [
    {
      meno: 'Iveta Pappová',
      projekt: '',
      text: 'Cítila som sa ako u psychologičky pre priestor. Máš neskutočný cit, určite odporúčam.',
      zvyraznit: 'Cítila som sa ako u psychologičky pre priestor.'
    },
    {
      meno: 'Jitka Lennerová',
      projekt: 'Vidiecky byt, Trnava',
      text: 'Perfektne zladila starý nábytok s novým. Napriek tomu, že sme sa presťahovali z domu do paneláku, cítime sa v ňom oveľa lepšie.',
      zvyraznit: 'Perfektne zladila starý nábytok s novým.'
    },
    {
      meno: 'Sivokoví',
      projekt: '2-izbový byt Arboria, Trnava',
      text: 'Byt máme zariadený nadštandardne. Podľa realitnej maklérky patrí k najkrajším v komplexe.',
      zvyraznit: 'Podľa realitnej maklérky patrí k najkrajším v komplexe.'
    }
  ]
};

/* Vykreslí karty: prekrývajúce sa, striedavo naklonené, jedna veta zvýraznená. */
(function () {
  'use strict';
  function esc(t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  document.querySelectorAll('[data-recenzie]').forEach(function (box) {
    var sada = window.RECENZIE[box.getAttribute('data-recenzie')] || [];
    box.innerHTML = sada.map(function (r) {
      var text = esc(r.text);
      if (r.zvyraznit) text = text.replace(esc(r.zvyraznit), '<mark>' + esc(r.zvyraznit) + '</mark>');
      var inic = r.meno.split(' ').map(function (w) { return w.charAt(0); }).join('').slice(0, 2);
      return '<figure class="karta">' +
        '<figcaption><span class="avatar" aria-hidden="true">' + esc(inic) + '</span>' +
        '<span><b>' + esc(r.meno) + '</b>' + (r.projekt ? '<small>' + esc(r.projekt) + '</small>' : '') + '</span></figcaption>' +
        '<div class="hviezdy" aria-label="Hodnotenie 5 z 5">★★★★★</div>' +
        '<blockquote>„' + text + '“</blockquote></figure>';
    }).join('');
  });
})();
