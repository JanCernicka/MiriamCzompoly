/**
 * /dakujem: SPOLOČNÁ stránka pre A aj B (testuje sa landing, nie celý lievik).
 * Variantu nerozhoduje, len ju prečíta z cookie alebo ?ab=, a vstrekne meranie.
 * Príchod sem je krok „termin-rezervovany": A sem presmeruje GHL kalendár,
 * B sem pošle vlastný kalendár, oboch až po úspešnej rezervácii.
 */
import { citajCookie, vstrekni, COOKIE } from "./_lib/lievik.js";

export async function onRequestGet(ctx) {
  try {
    const url = new URL(ctx.request.url);
    const p = (url.searchParams.get("ab") || "").toLowerCase();
    const c = citajCookie(ctx.request, COOKIE);
    const v = p === "a" || p === "b" ? p : (c === "a" || c === "b" ? c : null);
    const o = await vstrekni(await ctx.next(), v);
    const h = new Headers(o.headers);
    h.set("Cache-Control", "no-store");
    h.append("Vary", "Cookie");
    return new Response(o.body, { status: o.status, headers: h });
  } catch (e) {
    console.error("dakujem meranie zlyhalo", String(e));
    return ctx.next();
  }
}
