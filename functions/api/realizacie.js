/* POST /api/realizacie: správca realizácií (/sprava-realizacii), 17. 11. 2026.
   Heslo SPRAVA_HESLO (to isté ako do konzoly), náhradne STAT_HESLO. Akcie:
     { heslo, akcia: "nacitaj" }                      realizácie zo statického index.html, posledné nastavenie, história
     { heslo, akcia: "uloz", nastavenie, poznamka }    overí a uloží novú verziu, hneď platí na www
     { heslo, akcia: "vrat", verzia }                 znova uloží staršiu verziu (verzia 0 = pôvodné poradie z kódu)
   Každé uloženie je nový riadok, nič sa neprepisuje, takže sa dá vrátiť ku ktorejkoľvek verzii. */
import { tabulka, zabezpecTabulku, posledne, zoznam, over } from "../_lib/realizacie.js";

const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const KLUCE = ["poradie", "skryte", "obalky", "fotky"];

function cisti(n) {
  const o = {};
  for (const k of KLUCE) if (n && n[k] != null) o[k] = n[k];
  if (o.poradie && !Array.isArray(o.poradie)) delete o.poradie;
  if (o.skryte && !Array.isArray(o.skryte)) delete o.skryte;
  return o;
}

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch { return json({ ok: false, chyba: "Zlá požiadavka." }, 400); }
  const HESLO = env.SPRAVA_HESLO || env.STAT_HESLO;
  if (!HESLO || !env.DB) return json({ ok: false, chyba: "Správca nie je nastavený." }, 500);
  if (String(b.heslo || "") !== HESLO) {
    await new Promise((r) => setTimeout(r, 800));
    return json({ ok: false, chyba: "Nesprávne heslo." }, 401);
  }
  const statika = await env.ASSETS.fetch(new Request(new URL("/", request.url)));
  const skupiny = zoznam(await statika.text());
  if (!skupiny.length) return json({ ok: false, chyba: "Galériu na webe sa nepodarilo prečítať." }, 500);
  await zabezpecTabulku(env);
  const T = tabulka(env), teraz = new Date().toISOString();

  if (b.akcia === "uloz" || b.akcia === "vrat") {
    let n, poznamka;
    if (b.akcia === "uloz") {
      n = cisti(b.nastavenie); poznamka = String(b.poznamka || "").slice(0, 200) || "uložené zo správcu";
    } else if (Number(b.verzia) === 0) {
      n = {}; poznamka = "vrátené pôvodné poradie";
    } else {
      const r = await env.DB.prepare(`SELECT nastavenie FROM ${T} WHERE id = ?`).bind(Number(b.verzia)).first();
      if (!r) return json({ ok: false, chyba: "Taká verzia neexistuje." }, 404);
      n = JSON.parse(r.nastavenie); poznamka = `vrátená verzia č. ${Number(b.verzia)}`;
    }
    const chyby = Object.keys(n).length ? over(skupiny, n) : [];
    if (chyby.length) return json({ ok: false, chyba: chyby.join(". ") + "." }, 400);
    await env.DB.prepare(`INSERT INTO ${T} (kedy, nastavenie, poznamka) VALUES (?, ?, ?)`).bind(teraz, JSON.stringify(n), poznamka).run();
  }

  const p = await posledne(env);   // 🔴 čítať späť, nie veriť zápisu
  const verzie = (await env.DB.prepare(`SELECT id, kedy, poznamka FROM ${T} ORDER BY id DESC LIMIT 15`).all()).results || [];
  return json({ ok: true, skupiny, nastavenie: p ? p.nastavenie : {}, verzia: p ? p.id : 0, verzie, test: !!env.TEST_REZIM });
}
