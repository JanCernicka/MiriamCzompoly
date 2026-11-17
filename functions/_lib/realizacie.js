/* Správca realizácií (17. 11. 2026, Miriam: „fotky v realizáciách potrebujem spravovať sama, hlavne úvodné
   fotky jednotlivých realizácií a ich poradie“). Miriam to nastavuje na /sprava-realizacii, uloží sa to do D1
   a functions/index.js podľa toho upraví galériu na úvodnej stránke pri každom zobrazení. Statický index.html
   sa nemení: je to pôvodná podoba a keby čokoľvek zlyhalo, ukáže sa práve ona.

   Nastavenie (JSON, posledný riadok tabuľky):
     poradie: ["cs-stajnerka", ...]      poradie dlaždíc (každá ostáva vo svojej skupine Bývanie / Komerčné)
     skryte:  ["cs-redizajn", ...]       dlaždice, ktoré sa nezobrazia (okno ostáva, odkazy z e-mailov fungujú)
     obalky:  { "cs-vidiecky": "assets/img/realizacie/vidiecky-3.jpg" }   úvodná fotka dlaždice
     fotky:   { "cs-vidiecky": { poradie: [src, ...], skryte: [src, ...] } }   fotky v okne realizácie
   🔴 Na náhľadoch (TEST_REZIM) je iná tabuľka, lebo náhľad a www majú tú istú databázu. */

export const tabulka = (env) => (env.TEST_REZIM ? "realizacie_nastavenie_test" : "realizacie_nastavenie");

export async function zabezpecTabulku(env) {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS ${tabulka(env)} (id INTEGER PRIMARY KEY AUTOINCREMENT, kedy TEXT NOT NULL, nastavenie TEXT NOT NULL, poznamka TEXT)`).run();
}

export async function posledne(env) {
  const r = await env.DB.prepare(`SELECT id, kedy, nastavenie FROM ${tabulka(env)} ORDER BY id DESC LIMIT 1`).first();
  return r ? { id: r.id, kedy: r.kedy, nastavenie: JSON.parse(r.nastavenie) } : null;
}

const RE_SKUPINA = /<div class="gallery-group reveal">\n\s*<div class="gg-label"><h3>([^<]+)<\/h3><span class="gg-count">[^<]*<\/span><\/div>\n\s*<div class="gallery-grid">\n([\s\S]*?)\n {10}<\/div>\n {8}<\/div>/g;
const RE_DLAZDICA = / {12}<button class="tile" data-modal="(cs-[\w-]+)"[\s\S]*?<\/button>\n?/g;
const RE_OKNO = /<div class="modal" id="(cs-[\w-]+)"[\s\S]*?<div class="ba-gallery">\n([\s\S]*?)\n {10}<\/div>/g;
const RE_FOTKA = / {12}<button type="button" class="ba-shot" data-full="([^"]+)"[^>]*>(?:<span class="ba-tag (\w+)">[^<]*<\/span>)?<img src="([^"]+)" alt="([^"]*)"[^>]*\/><\/button>\n?/g;
const html_ = (s) => String(s).replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/* Čo je v statickom index.html: skupiny, dlaždice, fotky v oknách. */
export function zoznam(html) {
  const fotky = {};
  for (const m of html.matchAll(RE_OKNO)) {
    fotky[m[1]] = [...m[2].matchAll(RE_FOTKA)].map((f) => ({ src: f[3], velka: f[1], tag: f[2] || "", alt: html_(f[4]) }));
  }
  const skupiny = [];
  for (const m of html.matchAll(RE_SKUPINA)) {
    const dlazdice = [...m[2].matchAll(RE_DLAZDICA)].map((d) => {
      const blok = d[0];
      return {
        id: d[1],
        nazov: html_((blok.match(/<span class="tile-title">([^<]+)<\/span>/) || [])[1] || d[1]),
        obalka: (blok.match(/<img src="([^"]+)"/) || [])[1] || "",
        fotky: fotky[d[1]] || [],
      };
    });
    skupiny.push({ nazov: html_(m[1]), dlazdice });
  }
  return skupiny;
}

const tvar = (n) => (n === 1 ? "realizácia" : n >= 2 && n <= 4 ? "realizácie" : "realizácií");

/* Overí nastavenie proti tomu, čo je na webe. Vráti zoznam chýb (prázdny = v poriadku). */
export function over(skupiny, n) {
  const chyby = [], vsetky = new Map();
  for (const s of skupiny) for (const d of s.dlazdice) vsetky.set(d.id, d);
  if (!n || typeof n !== "object") return ["nastavenie chýba"];
  for (const id of n.poradie || []) if (!vsetky.has(id)) chyby.push(`neznáma realizácia ${id}`);
  for (const id of n.skryte || []) if (!vsetky.has(id)) chyby.push(`neznáma realizácia ${id}`);
  for (const s of skupiny) {
    if (!s.dlazdice.some((d) => !(n.skryte || []).includes(d.id))) chyby.push(`v skupine ${s.nazov} musí ostať aspoň jedna realizácia`);
  }
  for (const [id, src] of Object.entries(n.obalky || {})) {
    const d = vsetky.get(id);
    if (!d) { chyby.push(`neznáma realizácia ${id}`); continue; }
    if (src !== d.obalka && !d.fotky.some((f) => f.src === src)) chyby.push(`fotka ${src} nepatrí k ${d.nazov}`);
  }
  for (const [id, f] of Object.entries(n.fotky || {})) {
    const d = vsetky.get(id);
    if (!d) { chyby.push(`neznáma realizácia ${id}`); continue; }
    const srcs = new Set(d.fotky.map((x) => x.src));
    for (const src of [...(f.poradie || []), ...(f.skryte || [])]) if (!srcs.has(src)) chyby.push(`fotka ${src} nepatrí k ${d.nazov}`);
    if (d.fotky.length && d.fotky.every((x) => (f.skryte || []).includes(x.src))) chyby.push(`${d.nazov}: v okne musí ostať aspoň jedna fotka`);
  }
  return chyby;
}

function zorad(polozky, kluc, poradie) {
  const idx = new Map((poradie || []).map((k, i) => [k, i]));
  return polozky.map((p, i) => [p, idx.has(kluc(p)) ? idx.get(kluc(p)) : 1e6 + i]).sort((a, b) => a[1] - b[1]).map((x) => x[0]);
}

/* Upraví HTML úvodnej stránky podľa nastavenia. Čo nastavenie nespomína (napríklad realizácia pridaná
   neskôr v kóde), ostane na konci v pôvodnom poradí. */
export function uprav(html, n) {
  if (!n || typeof n !== "object") return html;
  const skryte = new Set(n.skryte || []), obalky = n.obalky || {}, nf = n.fotky || {};
  const altFotky = {};
  html = html.replace(RE_OKNO, (cele, id, vnutro) => {
    const fotky = [...vnutro.matchAll(RE_FOTKA)].map((f) => ({ blok: f[0].endsWith("\n") ? f[0] : f[0] + "\n", src: f[3], alt: f[4] }));
    altFotky[id] = Object.fromEntries(fotky.map((f) => [f.src, f.alt]));
    const nast = nf[id];
    if (!nast || !fotky.length) return cele;
    const sk = new Set(nast.skryte || []);
    let nove = zorad(fotky, (f) => f.src, nast.poradie).filter((f) => !sk.has(f.src));
    if (!nove.length) nove = fotky;
    return cele.replace(vnutro, nove.map((f) => f.blok).join("").replace(/\n$/, ""));
  });
  html = html.replace(RE_SKUPINA, (cele, nazov, vnutro) => {
    const dl = [...vnutro.matchAll(RE_DLAZDICA)].map((d) => ({ id: d[1], blok: d[0].endsWith("\n") ? d[0] : d[0] + "\n" }));
    let nove = zorad(dl, (d) => d.id, n.poradie).filter((d) => !skryte.has(d.id));
    if (!nove.length) nove = dl;
    const bloky = nove.map((d) => {
      const src = obalky[d.id];
      if (!src) return d.blok;
      const alt = (altFotky[d.id] || {})[src];
      return d.blok.replace(/<img src="[^"]+" alt="([^"]*)"/, (m, starAlt) => `<img src="${esc(src)}" alt="${alt != null ? alt : starAlt}"`);
    });
    return cele.replace(vnutro, bloky.join("").replace(/\n$/, ""))
      .replace(/<span class="gg-count">[^<]*<\/span>/, `<span class="gg-count">${nove.length} ${tvar(nove.length)}</span>`);
  });
  return html;
}
