/* Spoločné pre /api/zmena, /api/zmena-hovor a /api/zmena-zaujem: kampaň „Pred veľkou zmenou“
   (magnet „Tvoje poradie krokov“, naostro od 16. 11. 2026, Jano: „už to normálne daj do GHL“).
   Otázky, verzie aj pravidlá teploty sa berú z TOHO ISTÉHO súboru ako na stránke
   (assets/js/pred-zmenou-data.js), aby e-mail a stránka nikdy nehovorili niečo iné. */
import "../../assets/js/pred-zmenou-data.js";

export const PZ = globalThis.PZ;

// GHL polia kontaktu (založené 16. 11. 2026), v e-mailoch workflowov ako {{contact.pz_…}}
export const POLIA = {
  odkaz:    "qW4QXYnFiL3fJq2ni92B",   // contact.pz_odkaz, celé poradie krokov
  krok1:    "iTeVqN2I38Ljj6PIIVcp",   // contact.pz_krok1, prvý krok, ktorý ešte nemá za sebou (E2)
  hlavna:   "FSQstNSDfYqsb9XfMG9P",   // contact.pz_hlavna, hlavná veta verzie
  odpovede: "OvNHrbaad07dn9G93kvo",   // contact.pz_odpovede, súhrn odpovedí
};

/* Značky. 🔴 Spúšťajú workflowy, nemeniť bez úpravy workflowov:
   pz-<teplota>-<verzia> spúšťa sekvenciu (12 workflowov „Pred zmenou: …“),
   pz-zaujem a pz-zaujem-<teplota>-<verzia> e-mail Z1 a sekvenciu bez E5 (api/zmena-zaujem.js),
   pz-hovor zastaví všetky sekvencie. pz-lead a pz-<teplota> sú len na triedenie. */
export const TEPLOTA = { horuca: "horuci", vlazna: "vlazny", studena: "studeny" };
export const NAZOV_TEPLOTY = { horuca: "horúca", vlazna: "vlažná", studena: "studená" };
export const ZNACKA = { vsetci: "pz-lead", hovor: "pz-hovor", zaujem: "pz-zaujem" };
export function znacky(o) {
  const t = TEPLOTA[PZ.teplota(o)];
  return [ZNACKA.vsetci, `pz-${t}`, `pz-${t}-${o.situacia}`];
}

export const WEB = "https://www.miriamczompoly.sk";
export const odkazPoradie = (base, o, meno) => `${base}/pred-zmenou-poradie?${PZ.doAdresy(o, meno)}`;

export function polia(base, o, meno) {
  const v = PZ.VERZIE[o.situacia];
  return [
    { id: POLIA.odkaz, field_value: odkazPoradie(base, o, meno) },
    { id: POLIA.krok1, field_value: PZ.prvyKrok(o) },
    { id: POLIA.hlavna, field_value: v.hlavna },
    { id: POLIA.odpovede, field_value: PZ.suhrn(o) },
  ];
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const obal = (vnutro) => `<div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.55;color:#262019;max-width:560px">${vnutro}<p>Miriam</p></div>`;
const tlacidlo = (href, text) => `<p><a href="${esc(href)}" style="display:inline-block;background:#262019;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:bold">${esc(text)}</a></p>`;

/* E1 hneď po otázkach, všetkým (aj horúcim). Text je Miriamin z jej PDF zo 16. 11. 2026, doslova. */
export function emailE1(meno, o, base) {
  const v = PZ.VERZIE[o.situacia];
  return {
    predmet: `Tvoje poradie krokov: ${v.hlavna}`,
    html: obal(`<p>Ahoj ${esc(meno)},</p>
<p>posielam ti <b>Tvoje poradie krokov</b>, aby si ho mala po ruke.</p>
<p>Ako prvé: <b>${esc(v.hlavna)}</b></p>
<p>Nájdeš v ňom päť rozhodnutí v poradí, v akom majú prísť, tri najdrahšie chyby v tvojej situácii a byt klientky, ktorá bola tam, kde si teraz ty.</p>
${tlacidlo(odkazPoradie(base, o, meno), "Otvoriť Tvoje poradie krokov")}
<p>Čím skôr začneš, tým viac ušetríš. Kým nie sú hotové rozvody a objednaná kuchyňa, dá sa zmeniť takmer všetko bez búrania.</p>`),
  };
}

/* Poznámka ku kontaktu, nech Miriam v GHL vidí odpovede aj odkaz. */
export function poznamka(o, base, meno, veta) {
  return `${veta}\n${PZ.suhrn(o)}\nPoradie krokov: ${odkazPoradie(base, o, meno)}`;
}

/* Odkiaľ prišla: utm_content je meno reklamy v Mete (rovnako ako pri pláne). */
const cisty = (v, max) => String(v || "").replace(/\s+/g, " ").trim().slice(0, max);
export function odkial(u) {
  const x = u && typeof u === "object" ? u : {};
  const v = (k) => cisty(x[k], 100).replace(/[<>]/g, "");
  const zdroj = [v("utm_source"), v("utm_medium"), v("utm_campaign")].filter(Boolean).join(" / ");
  if (v("utm_content")) return `Reklama: ${v("utm_content")}` + (zdroj ? ` (${zdroj})` : "") + ".";
  return zdroj ? `Zdroj: ${zdroj}.` : "Zdroj: bez UTM, teda nie z tlačidla reklamy.";
}
