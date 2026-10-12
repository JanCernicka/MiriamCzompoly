/* Spoločné pre /api/profil a /api/rozhovor (lievik „Plán od Miriam“, od 12. 10. 2026).
   Otázky, skupiny aj texty plánu sa berú z TOHO ISTÉHO súboru ako na stránke
   (assets/js/profil-data.js), aby e-mail a stránka nikdy nehovorili niečo iné. */
import "../../assets/js/profil-data.js";

export const P = globalThis.PROFIL;
export const platneOdpovede = (o) => !!P && P.platne(o);

// GHL polia kontaktu (založené 12. 10. 2026), v e-mailoch workflowov ako {{contact.plan_…}}
export const POLIA = {
  odpovede:   "9O2Gvt0FaNwkO8X1dolm",   // contact.plan_odpovede
  odkaz:      "qzGHf2QZJwXHjvNvEqL3",   // contact.plan_odkaz
  rezervacia: "I5lNTOkqkDJJOBA3HJz6",   // contact.plan_rezervacia
  miestnost:  "nh06Ro5MqSH24hNcS3X5",   // contact.plan_miestnost („v tvojej obývačke“)
  verdikt:    "2cDuNow9OKXrehNJ7wOk",   // contact.plan_verdikt
  krok1:      "Eih0F77XZhQgQDTQMvVD",   // contact.plan_krok1
};

// Značky: plan-test každému, skupina podľa odpovedí, plan-hovor po rezervácii hovoru.
// Spúšťajú workflowy (sekvencie e-mailov), preto ich nemeniť bez úpravy workflowov.
export const ZNACKA = { vsetci: "plan-test", hovor: "plan-hovor",
                        horuci: "plan-horuci", vlazny: "plan-vlazny", ostatni: "plan-ostatni" };

export const WEB = "https://www.miriamczompoly.sk";

export function odkazy(base, o) {
  return { plan: base + P.planAdresa(o), rezervacia: base + "/profil-rezervacia?" + P.doAdresy(o) };
}

export function polia(base, o) {
  const M = P.MIESTA[o.m], D = P.PROBLEMY[o.d], l = odkazy(base, o);
  return [
    { id: POLIA.odpovede, field_value: P.suhrn(o) },
    { id: POLIA.odkaz, field_value: l.plan },
    { id: POLIA.rezervacia, field_value: l.rezervacia },
    { id: POLIA.miestnost, field_value: M.lok },
    { id: POLIA.verdikt, field_value: D.nazov },
    { id: POLIA.krok1, field_value: D.kroky[0] },
  ];
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const obal = (vnutro) => `<div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.55;color:#262019;max-width:560px">${vnutro}<p>Miriam</p></div>`;
const tlacidlo = (href, text) => `<p><a href="${esc(href)}" style="display:inline-block;background:#262019;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:bold">${esc(text)}</a></p>`;

/* E-mail s plánom: vlažným a ostatným hneď po teste. */
export function emailPlan(meno, o, base) {
  const M = P.MIESTA[o.m], D = P.PROBLEMY[o.d];
  return {
    predmet: `Tvoj plán od Miriam: ${D.nazov}`,
    html: obal(`<p>Ahoj ${esc(meno)},</p>
<p>${esc(M.oslovenie)}</p>
<p><b>${esc(D.nazov)}.</b> ${esc(D.uvod)}</p>
${tlacidlo(odkazy(base, o).plan, "Otvoriť môj plán")}
<p>V pláne máš 3 kroky na tento víkend. Ak chceš začať ešte dnes, začni prvým: ${esc(D.kroky[0])}</p>
<p>Ak by ti niečo nebolo jasné, stačí odpísať na tento e-mail, čítam každú správu.</p>`),
  };
}

/* ---------- čas v Bratislave, slovensky ---------- */
const ZONA = "Europe/Bratislava";
const DNI = { Mon: ["v pondelok", "v pondelok"], Tue: ["v utorok", "v utorok"], Wed: ["v stredu", "v stredu"],
              Thu: ["vo štvrtok", "vo stvrtok"], Fri: ["v piatok", "v piatok"], Sat: ["v sobotu", "v sobotu"], Sun: ["v nedeľu", "v nedelu"] };
function casti(ms) {
  return Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: ZONA, weekday: "short", day: "numeric",
    month: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
}
// „v utorok 13. 10. o 10:00“, pre SMS bez diakritiky „v utorok 13.10. o 10:00“
export function kedyText(ms, sms) {
  const c = casti(ms), d = (DNI[c.weekday] || ["", ""])[sms ? 1 : 0];
  return sms ? `${d} ${Number(c.day)}.${Number(c.month)}. o ${Number(c.hour)}:${c.minute}`
             : `${d} ${Number(c.day)}. ${Number(c.month)}. o ${Number(c.hour)}:${c.minute}`;
}

/* 🔴 SMS len GSM-7 bez diakritiky a najviac 160 znakov, inak ide ako viac správ (CLAUDE.md). */
export function gsm(text) {
  return String(text).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[€{}\[\]~|\\^]/g, "").replace(/[^\x20-\x7E\n]/g, "");
}
export function smsOk(text) { return text.length <= 160 && text === gsm(text); }

/* Potvrdenie hovoru zákazníčke: e-mail aj SMS. */
export function emailPotvrdenie(meno, o, ms, tel) {
  const M = P.MIESTA[o.m];
  return {
    predmet: `Hovor k tvojmu plánu ${kedyText(ms)}`,
    html: obal(`<p>Ahoj ${esc(meno)},</p>
<p>ďakujem, hovor máme <b>${esc(kedyText(ms))}</b>. Zavolám ti na číslo ${esc(tel)}, potrvá 10 minút.</p>
<p>Pred hovorom sa pozriem na tvoje odpovede a pripravím si, čo by som ${esc(M.lok)} riešila ako prvé. Ak chceš, odpíš mi na tento e-mail fotkou tej miestnosti, pripravím sa lepšie.</p>
<p>Ak ti čas nebude vyhovovať, odpíš mi a dohodneme iný.</p>`),
  };
}
export function smsPotvrdenie(ms) {
  return `Miriam Czompoly: hovor k tvojmu planu mame ${kedyText(ms, true)}. Zavolam ti na toto cislo. Ak ti cas nevyhovuje, odpis sem.`;
}

/* SMS pre Miriam: kto, kedy, číslo a odkaz na plán, nech si ho otvorí pred hovorom. */
export function smsMiriam(meno, tel, ms, o, base) {
  const plan = String(base || WEB).replace(/^https?:\/\/(www\.)?/, "") + P.planAdresa(o);
  const kedy = kedyText(ms, true).replace(/^vo? /, "");
  const s = (m, odkaz) => gsm(`HOVOR K PLANU ${kedy}: ${m}, ${tel}.` + (odkaz ? ` Plan: ${plan}` : ""));
  const m = gsm(meno).slice(0, 24);
  if (s(m, true).length <= 160) return s(m, true);
  return s(m, false).slice(0, 160);   // dlhá adresa (náhľad): bez odkazu, plán je v poznámke kontaktu
}

/* Poznámka ku kontaktu, nech Miriam v GHL vidí odpovede aj odkaz. */
export function poznamka(o, base, veta) {
  return `${veta}\nOdpovede: ${P.suhrn(o)}\nPlán: ${odkazy(base, o).plan}`;
}
