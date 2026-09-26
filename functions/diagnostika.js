/**
 * /diagnostika: adresa, kam mieri reklama. Rozdelí A/B a do oboch variant vstrekne
 * rovnaké meranie. Viď _lib/lievik.js.
 * 🔴 Keby čokoľvek zlyhalo, podá sa stránka A bez merania. Reklama nesmie
 *    skončiť na chybovej stránke kvôli meraniu.
 */
import { rozhodni, vstrekni, hlavicky, B_PREDVOLENA } from "./_lib/lievik.js";

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
    return hlavicky(o, r);
  } catch (e) {
    console.error("rozdeľovač zlyhal", String(e));
    return ctx.next();
  }
}

export const onRequestHead = (ctx) => ctx.next();
