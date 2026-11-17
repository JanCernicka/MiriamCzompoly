/* Správca realizácií (17. 11. 2026, Miriam: „fotky v realizáciách potrebujem spravovať sama, hlavne úvodné
   fotky jednotlivých realizácií a ich poradie“). Miriam to nastavuje na /sprava-realizacii, uloží sa to do D1
   a functions/index.js podľa toho upraví galériu na úvodnej stránke pri každom zobrazení. Statický index.html
   sa nemení: je to pôvodná podoba a keby čokoľvek zlyhalo, ukáže sa práve ona.

   Nastavenie (JSON, posledný riadok tabuľky):
     poradie: ["cs-stajnerka", ...]      poradie dlaždíc (každá ostáva vo svojej skupine Bývanie / Komerčné)
     skryte:  ["cs-redizajn", ...]       dlaždice, ktoré sa nezobrazia (okno ostáva, odkazy z e-mailov fungujú)
     obalky:  { "cs-vidiecky": "assets/img/realizacie/vidiecky-3.jpg" }   úvodná fotka dlaždice
     fotky:   { "cs-vidiecky": { poradie: [src, ...], skryte: [src, ...] } }   fotky v okne realizácie
     nove:    [{ id: "cs-n-…", skupina: "Bývanie", nazov, nadpis, typ, popis, recenzia, meno, fotky: [{ id, tag, alt }] }]
              nové realizácie nahraté v správcovi (17. 11. 2026, Jano: „nech sa tam dajú aj uploadovať nové realizácie“)
     pridane: { "cs-vidiecky": [{ id, tag, alt }] }   fotky nahraté k realizácii, ktorá je v kóde
   Nahraté fotky sú v D1 (realizacie_fotky) ako dva JPEG: <id>-v (veľká, na zväčšenie) a <id>-m (menšia, na dlaždicu
   a do okna), zmenšené už v prehliadači. Podáva ich functions/foto-realizacie/[subor].js.
   Nové realizácie sú súčasťou nastavenia, takže aj ony majú verzie a dajú sa vrátiť.
   🔴 Na náhľadoch (TEST_REZIM) je iná tabuľka, lebo náhľad a www majú tú istú databázu. */

export const tabulka = (env) => (env.TEST_REZIM ? "realizacie_nastavenie_test" : "realizacie_nastavenie");

export async function zabezpecTabulku(env) {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS ${tabulka(env)} (id INTEGER PRIMARY KEY AUTOINCREMENT, kedy TEXT NOT NULL, nastavenie TEXT NOT NULL, poznamka TEXT)`).run();
}

export const tabulkaFotiek = (env) => (env.TEST_REZIM ? "realizacie_fotky_test" : "realizacie_fotky");
export async function zabezpecFotky(env) {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS ${tabulkaFotiek(env)} (id TEXT PRIMARY KEY, data BLOB NOT NULL, kedy TEXT NOT NULL)`).run();
}
export const fotkaUrl = (id, velka) => `/foto-realizacie/${id}-${velka ? "v" : "m"}.jpg`;
export const RE_ID_FOTKY = /^[a-z0-9]{8,24}$/;
const RE_ID_NOVEJ = /^cs-n-[a-z0-9]{6,16}$/;

export async function posledne(env) {
  const r = await env.DB.prepare(`SELECT id, kedy, nastavenie FROM ${tabulka(env)} ORDER BY id DESC LIMIT 1`).first();
  return r ? { id: r.id, kedy: r.kedy, nastavenie: JSON.parse(r.nastavenie) } : null;
}

const RE_SKUPINA = /<div class="gallery-group reveal">\n\s*<div class="gg-label"><h3>([^<]+)<\/h3><span class="gg-count">[^<]*<\/span><\/div>\n\s*<div class="gallery-grid">\n([\s\S]*?)\n {10}<\/div>\n {8}<\/div>/g;
const RE_DLAZDICA = / {12}<button class="tile" data-modal="(cs-[\w-]+)"[\s\S]*?<\/button>\n?/g;
const RE_OKNO = /<div class="modal" id="(cs-[\w-]+)"[\s\S]*?<div class="ba-gallery">\n([\s\S]*?)\n {10}<\/div>/g;
const RE_FOTKA = / {12}<button type="button" class="ba-shot" data-full="([^"]+)"[^>]*>(?:<span class="ba-tag (\w+)">[^<]*<\/span>)?<img src="([^"]+)" alt="([^"]*)"[^>]*\/><\/button>\n?/g;
const html_ = (s) => String(s).replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const bezUvodzoviek = (s) => String(s || "").trim().replace(/^[„“"']+|[“”"']+$/g, "").trim();

/* HTML pre nahraté fotky a nové realizácie v rovnakom tvare ako v index.html, aby ich ďalej spracovali
   tie isté regexy (poradie, skrytie, úvodná fotka) a main.js (okno, zväčšenie). Všetok text sa escapuje. */
function shot(f) {
  const alt = esc(f.alt || ""), t = f.tag === "pred" ? "pred" : "po";
  return `            <button type="button" class="ba-shot" data-full="${fotkaUrl(f.id, true)}" aria-label="Zväčšiť: ${alt}"><span class="ba-tag ${t}">${t === "pred" ? "Pred" : "Po"}</span><img src="${fotkaUrl(f.id)}" alt="${alt}" loading="lazy" decoding="async" /></button>\n`;
}
const ZAVRIET = '<button class="modal-close" aria-label="Zavrieť"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg></button>';
function okno(r) {
  const rec = bezUvodzoviek(r.recenzia);
  const citat = rec ? `\n        <div class="modal-quote"><blockquote>„${esc(rec)}“</blockquote><cite>${esc(r.meno ? `${r.meno}, ${r.nadpis}` : r.nadpis)}</cite></div>` : "";
  return `    <div class="modal" id="${r.id}" role="dialog" aria-modal="true" aria-labelledby="${r.id}-t">
      ${ZAVRIET}
      <div class="modal-head">
        <span class="eyebrow">${esc(r.typ || "Realizácia")}</span>
        <h3 id="${r.id}-t">${esc(r.nadpis)}</h3>
      </div>
      <div class="modal-body">
        <div class="modal-ba">
          <div class="ba-gallery">
${r.fotky.map(shot).join("").replace(/\n$/, "")}
          </div>
${r.popis ? `          <p class="ba-caption">${esc(r.popis)}</p>\n` : ""}        </div>${citat}
        <div class="modal-cta">
          <a href="interierova-diagnostika.html" class="btn btn--primary">Chcem takú premenu <span class="arrow" aria-hidden="true">→</span></a>
        </div>
      </div>
    </div>

`;
}
function dlazdica(r) {
  const ob = r.fotky.find((f) => f.tag !== "pred") || r.fotky[0];
  return `            <button class="tile" data-modal="${r.id}" aria-label="Otvoriť príbeh: ${esc(r.nazov)}">
              <div class="ph has-img"><img src="${fotkaUrl(ob.id)}" alt="${esc(ob.alt || r.nazov)}" loading="lazy" /></div>
              <span class="tile-overlay"><span class="tile-title">${esc(r.nazov)}</span><span class="tile-cta">Pozrieť príbeh <span aria-hidden="true">→</span></span></span>
            </button>\n`;
}

/* Vloží do HTML nové realizácie (dlaždica na začiatok skupiny, okno do .modal-overlay) a fotky nahraté
   k realizáciám z kódu (na koniec ich galérie). Poradie, skrytie a úvodnú fotku potom rieši uprav(). */
export function pridajNove(html, n) {
  if (!n || typeof n !== "object") return html;
  const pridane = n.pridane && typeof n.pridane === "object" ? n.pridane : {};
  const nove = Array.isArray(n.nove) ? n.nove.filter((r) => r && RE_ID_NOVEJ.test(r.id) && Array.isArray(r.fotky) && r.fotky.length) : [];
  html = html.replace(RE_OKNO, (cele, id, vnutro) => {
    const p = pridane[id];
    if (!Array.isArray(p) || !p.length) return cele;
    return cele.replace(vnutro, () => vnutro + "\n" + p.map(shot).join("").replace(/\n$/, ""));
  });
  if (!nove.length) return html;
  html = html.replace('<div class="modal-overlay" role="presentation">\n', (m) => m + "\n" + nove.map(okno).join(""));
  html = html.replace(RE_SKUPINA, (cele, nazov, vnutro) => {
    const tu = nove.filter((r) => r.skupina === html_(nazov));
    return tu.length ? cele.replace(vnutro, () => tu.map(dlazdica).join("") + vnutro) : cele;
  });
  return html;
}

/* Overí nové realizácie a pridané fotky (texty, dĺžky, id). Či fotky naozaj sú v D1, overí API. */
export function overNove(skupiny, n) {
  const chyby = [], staticke = new Set(), nazvySkupin = skupiny.map((s) => s.nazov);
  for (const s of skupiny) for (const d of s.dlazdice) staticke.add(d.id);
  const text = (v, max, co, povinne) => {
    const t = String(v == null ? "" : v).trim();
    if (povinne && !t) chyby.push(`chýba ${co}`);
    if (t.length > max) chyby.push(`${co} je dlhší ako ${max} znakov`);
    return t;
  };
  const fotky = (zoz, kde) => {
    if (!Array.isArray(zoz)) { chyby.push(`${kde}: fotky chýbajú`); return; }
    if (zoz.length > 40) chyby.push(`${kde}: najviac 40 fotiek`);
    for (const f of zoz) {
      if (!f || !RE_ID_FOTKY.test(f.id)) chyby.push(`${kde}: neplatná fotka`);
      else if (f.tag !== "pred" && f.tag !== "po") chyby.push(`${kde}: fotka musí byť Pred alebo Po`);
      text(f && f.alt, 200, `${kde}: popis fotky`);
    }
  };
  const nove = n.nove == null ? [] : n.nove;
  if (!Array.isArray(nove)) return ["nové realizácie majú zlý tvar"];
  if (nove.length > 60) chyby.push("najviac 60 nových realizácií");
  const ids = new Set();
  for (const r of nove) {
    if (!r || !RE_ID_NOVEJ.test(r.id) || staticke.has(r.id) || ids.has(r.id)) { chyby.push("nová realizácia má neplatné id"); continue; }
    ids.add(r.id);
    const kde = text(r.nazov, 60, "názov na dlaždici", true) || "nová realizácia";
    if (!nazvySkupin.includes(r.skupina)) chyby.push(`${kde}: neznáma skupina`);
    text(r.nadpis, 100, `${kde}: nadpis v okne`, true);
    text(r.typ, 80, `${kde}: typ práce`); text(r.popis, 400, `${kde}: popis`);
    text(r.recenzia, 800, `${kde}: recenzia`); text(r.meno, 80, `${kde}: meno klienta`);
    fotky(r.fotky, kde);
    if (Array.isArray(r.fotky) && !r.fotky.length) chyby.push(`${kde}: pridaj aspoň jednu fotku`);
  }
  for (const [id, zoz] of Object.entries(n.pridane || {})) {
    if (!staticke.has(id)) { chyby.push(`fotky k neznámej realizácii ${id}`); continue; }
    fotky(zoz, id);
  }
  return chyby;
}
export function idFotiek(n) {
  const v = [];
  for (const r of (Array.isArray(n.nove) ? n.nove : [])) for (const f of r.fotky || []) v.push(f.id);
  for (const zoz of Object.values(n.pridane || {})) for (const f of zoz || []) v.push(f.id);
  return [...new Set(v)];
}

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
  html = pridajNove(html, n);
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
    return cele.replace(vnutro, () => nove.map((f) => f.blok).join("").replace(/\n$/, ""));
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
    return cele.replace(vnutro, () => bloky.join("").replace(/\n$/, ""))
      .replace(/<span class="gg-count">[^<]*<\/span>/, `<span class="gg-count">${nove.length} ${tvar(nove.length)}</span>`);
  });
  return html;
}
