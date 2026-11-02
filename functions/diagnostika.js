/**
 * /diagnostika: adresa, kam mieri reklama. Rozdelí A/B a do oboch variant vstrekne
 * rovnaké meranie. Viď _lib/lievik.js.
 * 🔴 Keby čokoľvek zlyhalo, podá sa stránka A bez merania. Reklama nesmie
 *    skončiť na chybovej stránke kvôli meraniu.
 */
import { rozhodni, vstrekni, hlavicky, B_PREDVOLENA } from "./_lib/lievik.js";
import { kedyText } from "./_lib/profil.js";

/* Zelený pruh hore pre ľudí z lievika „Plán od Miriam“ (/profil). Pre oboch je /diagnostika ďalší krok:
   - ?plan=odoslany: vlažným a ostatným práve odišiel plán e-mailom (12. 10. 2026, Jano),
     pruh pripomenie spam, lebo e-maily zatiaľ idú z agentúrnej domény (2. 11. 2026, Jano);
   - ?hovor=rezervovany: horúci si práve rezervovali hovor (2. 11. 2026, Jano), ?kedy= je čas v ms.
   Bez týchto parametrov stránka ostáva, ako bola, takže ľudia z reklamy na diagnostiku nič nevidia.
   Ide do oboch variant (A aj B), lebo sa pridáva až do hotového HTML.
   🔴 E-mail ani telefón nikdy do adresy: adresu stránky dostáva Meta pixel. E-mail doplní skript
      zo sessionStorage („mc_kontakt“), na poddoméne plan.* ho nenájde a ostane „do e-mailu“. */
const DEN = 864e5;
/* 🔴 Stránka diagnostiky farbí <strong> tmavou, na zelenom pruhu by bol nečitateľný. */
const B = "color:#ffffff;font-weight:700";
function textPruhu(url) {
  const q = url.searchParams;
  const nahlad = (t) => q.get("nahlad") === "1"
    ? `<br><span style="font-weight:400;font-size:13px;opacity:.9">Náhľad: ${t}.</span>` : "";
  const dalej = `<br><strong style="${B}">Ešte neodchádzaj</strong>, nižšie je ďalší krok. &#8595;`;
  if (q.get("hovor") === "rezervovany") {
    const ms = Number(q.get("kedy"));
    const ok = Number.isFinite(ms) && ms > Date.now() - DEN && ms < Date.now() + 30 * DEN;
    return `<strong style="${B}">&#10003; Tvoj termín je rezervovaný.</strong>` + (ok ? ` Zavolám ti ${kedyText(ms)}.` : "") +
      ` Potvrdenie ti príde SMS aj e-mailom.` + dalej + nahlad("rezervácia sa neuložila a nič neodišlo");
  }
  if (q.get("plan") === "odoslany") {
    return `<strong style="${B}">&#10003; Plán ti odišiel <span id="planMail" style="overflow-wrap:anywhere">do e-mailu</span>.</strong>` +
      ` Ak ho do pár minút nevidíš, pozri aj do spamu.` + dalej + nahlad("nič sa neuložilo a e-mail neodišiel");
  }
  return "";
}

async function pruhPlanu(odpoved, text) {
  const typ = odpoved.headers.get("content-type") || "";
  if (!typ.includes("text/html")) return odpoved;
  const html = await odpoved.text();
  /* 🔴 Varianta A má hlavičku position:fixed na top:0, tá by pruh prekryla. Skript ju posunie
     pod pruh, kým je pruh vidieť (B hlavičku .site-header nemá, tam skript nerobí nič).
     Lišta „Nevieš, ako začať?“ (navod.js) sa vypne: človek práve dostal plán, druhý magnet by rušil. */
  const pruh = `<div id="planPruh" role="status" style="background:#2f6b4f;color:#ffffff;padding:12px 16px;text-align:center;` +
    `font:400 15px/1.45 Inter,system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;position:relative;z-index:101">` +
    text + `</div><script>(function(){try{sessionStorage.setItem("mc_navod","odoslane")}catch(e){}` +
    `try{var k=JSON.parse(sessionStorage.getItem("mc_kontakt")||"null"),m=document.getElementById("planMail");` +
    `if(k&&k.email&&m)m.textContent="na "+k.email}catch(e){}` +
    `var p=document.getElementById("planPruh");function f(){var h=document.querySelector(".site-header");` +
    `if(h&&getComputedStyle(h).position==="fixed")h.style.top=Math.max(0,p.getBoundingClientRect().bottom)+"px"}` +
    `addEventListener("scroll",f,{passive:true});addEventListener("resize",f);addEventListener("DOMContentLoaded",f);f()})()<\/script>`;
  const nove = /<body[^>]*>/i.test(html) ? html.replace(/<body[^>]*>/i, (m) => m + pruh) : pruh + html;
  return new Response(nove, { status: odpoved.status, headers: odpoved.headers });
}

async function varianta(ctx, r) {
  const { request, env } = ctx;
  const url = new URL(request.url);
  if (r.v === "b") {
    /* 🔴 `x-mc-most` je POVINNÁ, projekt B inak presmeruje späť (stráž proti
       tomu, aby sa jeho adresa dostala do reklamy). Bez nej by B z testu
       ticho vypadla. `redirect: manual`: nikdy nejdeme za presmerovaním B. */
    const ciel = new URL("/" + url.search, env.VARIANTA_B || B_PREDVOLENA);
    const h = new Headers(request.headers);
    h.set("x-mc-most", "1");
    h.delete("host");
    const o = await fetch(new Request(ciel.toString(), { method: "GET", headers: h, redirect: "manual" }));
    if (o.ok) return o;
    // B neodpovedala: radšej A než chyba (a zapíše sa ako A)
    r.v = "a";
  }
  return ctx.next();
}

export async function onRequestGet(ctx) {
  try {
    const url = new URL(ctx.request.url);
    const r = rozhodni(url, ctx.request, ctx.env);
    let o = await varianta(ctx, r);
    o = await vstrekni(o, r.v);
    const text = textPruhu(url);
    if (text) o = await pruhPlanu(o, text);
    return hlavicky(o, r);
  } catch (e) {
    console.error("rozdeľovač zlyhal", String(e));
    return ctx.next();
  }
}

export const onRequestHead = (ctx) => ctx.next();
