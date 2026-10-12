/**
 * /diagnostika: adresa, kam mieri reklama. Rozdelí A/B a do oboch variant vstrekne
 * rovnaké meranie. Viď _lib/lievik.js.
 * 🔴 Keby čokoľvek zlyhalo, podá sa stránka A bez merania. Reklama nesmie
 *    skončiť na chybovej stránke kvôli meraniu.
 */
import { rozhodni, vstrekni, hlavicky, B_PREDVOLENA } from "./_lib/lievik.js";

/* Zelený pruh hore pre ľudí z formulára „Plán od Miriam“ (/profil, 12. 10. 2026, Jano):
   vlažným a ostatným práve odišiel plán e-mailom a /diagnostika je ich ďalší krok.
   Spúšťa ho len ?plan=odoslany, takže ľudia z reklamy na diagnostiku stránku vidia ako doteraz.
   Ide do oboch variant (A aj B), lebo sa pridáva až do hotového HTML. */
async function pruhPlanu(odpoved, nahlad) {
  const typ = odpoved.headers.get("content-type") || "";
  if (!typ.includes("text/html")) return odpoved;
  const html = await odpoved.text();
  /* 🔴 Varianta A má hlavičku position:fixed na top:0, tá by pruh prekryla. Skript ju posunie
     pod pruh, kým je pruh vidieť (B hlavičku .site-header nemá, tam skript nerobí nič).
     Lišta „Nevieš, ako začať?“ (navod.js) sa vypne: človek práve dostal plán, druhý magnet by rušil. */
  const pruh = `<div id="planPruh" role="status" style="background:#2f6b4f;color:#ffffff;padding:12px 16px;text-align:center;` +
    `font:600 15px/1.45 Inter,system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;position:relative;z-index:101">` +
    `&#10003; Plán ti odišiel do e-mailu. Ešte neodchádzaj, nižšie je ďalší krok.` +
    (nahlad ? `<br><span style="font-weight:400;font-size:13px;opacity:.9">Náhľad: nič sa neuložilo a e-mail neodišiel.</span>` : "") +
    `</div><script>(function(){try{sessionStorage.setItem("mc_navod","odoslane")}catch(e){}` +
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
    if (url.searchParams.get("plan") === "odoslany") o = await pruhPlanu(o, url.searchParams.get("nahlad") === "1");
    return hlavicky(o, r);
  } catch (e) {
    console.error("rozdeľovač zlyhal", String(e));
    return ctx.next();
  }
}

export const onRequestHead = (ctx) => ctx.next();
