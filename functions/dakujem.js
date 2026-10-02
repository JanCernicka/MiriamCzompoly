/**
 * /dakujem: SPOLOČNÁ stránka pre A aj B (testuje sa landing, nie celý lievik).
 * Variantu nerozhoduje, len ju prečíta z cookie alebo ?ab=, a vstrekne meranie.
 * Príchod sem je krok „termin-rezervovany": A sem presmeruje GHL kalendár,
 * B sem pošle vlastný kalendár, oboch až po úspešnej rezervácii.
 *
 * PLATBA 249 € cez FAPI, pod nadpisom, podľa varianty:
 *   A (aj bez varianty): tlačidlo, objednávka FAPI sa otvorí v novom okne
 *   B: formulár FAPI priamo v stránke, predvyplnený z kalendára B (assets/js/platba.js).
 *      Keď údaje z kalendára nie sú (B naostro ich zatiaľ neukladá), ostane tlačidlo ako na A,
 *      aby zákazníčka nepísala všetko do prázdneho formulára.
 */
import { citajCookie, vstrekni, COOKIE } from "./_lib/lievik.js";

const FAPI_ODKAZ = "https://form.fapi.cz/?id=33a88ecd-b33c-4a70-ab01-7f490ad088c0";
const STYL = `<style>
.platba{margin:1.6rem 0 2rem;padding:1.25rem 1.3rem;border:1.5px solid var(--ink,#262019);border-radius:14px;background:#fff}
.platba .platba-krok{font-size:.78rem;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:#7E6441;margin:0 0 .35rem}
.platba h2{margin:0 0 .5rem}
.platba p{margin:0 0 .9rem}
.platba .platba-cena{display:flex;justify-content:space-between;align-items:baseline;border-top:1px solid #E4D9C6;padding-top:.7rem;margin-bottom:1rem}
.platba .platba-cena b{font-size:1.35rem}
.platba .platba-termin{font-weight:700}
.platba .platba-pozn{font-size:.9rem;color:#6F6557;margin:.8rem 0 0}
</style>`;

function blokA() {
  return `${STYL}<div class="platba" id="platba" data-v="a">
  <p class="platba-krok">Posledný krok</p>
  <h2>Zaplať diagnostiku</h2>
  <div class="platba-cena"><span>Interiérová diagnostika, 90 minút u teba doma</span><b>249&nbsp;€</b></div>
  <a class="btn btn--primary" href="${FAPI_ODKAZ}" target="_blank" rel="noopener" data-platba>Zaplatiť 249 € <span class="arrow">→</span></a>
  <p class="platba-pozn">Objednávka sa otvorí v novom okne. Po odoslaní ti príde e-mailom faktúra s údajmi na prevod.</p>
</div>`;
}
function blokB() {
  return `${STYL}<div class="platba" id="platba" data-v="b">
  <p class="platba-krok">Posledný krok</p>
  <h2>Zaplať diagnostiku</h2>
  <p class="platba-termin" id="platbaTermin" hidden></p>
  <div class="platba-cena"><span>Interiérová diagnostika, 90 minút u teba doma</span><b>249&nbsp;€</b></div>
  <p id="platbaVyplnene" hidden>Tvoje údaje sú už vpísané. Skontroluj ich a potvrď objednávku, faktúra s údajmi na prevod ti príde e-mailom.</p>
  <div id="fapi" hidden></div>
  <p class="platba-pozn" id="fapiZaloha" hidden>Ak sa formulár nezobrazí, <a href="${FAPI_ODKAZ}" target="_blank" rel="noopener">otvor objednávku tu</a>.</p>
  <div id="platbaTlacidlo">
  <a class="btn btn--primary" href="${FAPI_ODKAZ}" target="_blank" rel="noopener" data-platba>Zaplatiť 249 € <span class="arrow">→</span></a>
  <p class="platba-pozn">Objednávka sa otvorí v novom okne. Po odoslaní ti príde e-mailom faktúra s údajmi na prevod.</p>
  </div>
</div><script src="/assets/js/platba.js" defer></script>`;
}

export async function onRequestGet(ctx) {
  try {
    const url = new URL(ctx.request.url);
    const p = (url.searchParams.get("ab") || "").toLowerCase();
    const c = citajCookie(ctx.request, COOKIE);
    const v = p === "a" || p === "b" ? p : (c === "a" || c === "b" ? c : null);
    let r = await ctx.next();
    try {
      const blok = v === "b" ? blokB() : blokA();
      r = new HTMLRewriter().on("article.legal h1", { element(e) { e.after(blok, { html: true }); } }).transform(r);
    } catch (e) { console.error("dakujem platba zlyhala", String(e)); }
    const o = await vstrekni(r, v);
    const h = new Headers(o.headers);
    h.set("Cache-Control", "no-store");
    h.append("Vary", "Cookie");
    return new Response(o.body, { status: o.status, headers: h });
  } catch (e) {
    console.error("dakujem meranie zlyhalo", String(e));
    return ctx.next();
  }
}
