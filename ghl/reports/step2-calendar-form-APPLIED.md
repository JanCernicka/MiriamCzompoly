# KROK 2 (build) — Kalendár + Formulár: APLIKOVANÉ v živom účte

_Účet `o86atLjsdR9IoUTWgYna`. Použité nové nástroje: `calendar_builder.py` (public API), `form_builder.py` (interné API, Firebase)._

## ✅ Kalendár „Interiérová diagnostika“
- **ID:** `fUjAzOhv2VyiY3XTguPz`
- 90 min sloty, **aktívny**, dostupnosť **Po–Pia 9–17**, auto-confirm.
- Team member: Miriam (`hSQHxikFZUetHZUYqJZO`).
- Booking URL: `https://api.leadconnectorhq.com/widget/booking/fUjAzOhv2VyiY3XTguPz`
  → zapísané do custom value **„Link kalendár diagnostika“** (ťahá sa do webu/e-mailov). Toto je aj trigger pre WF3 (Pred diagnostikou).

## ✅ Formulár „Formulár – 5 chýb (lead magnet)“
- **ID:** `geA4rea6TYWIKcskupXQ`
- Polia (4, overené): H1 „Stiahni si zdarma: 5 najdrahších chýb vo tvojom byte“ · Meno (`first_name`) · E-mail · tlačidlo „Poslať mi to zdarma“.
- Nízkofrikčný opt-in (len meno+e-mail). → spúšťa WF1 (Lead magnet nurture).

## Poznámky
- 2 staré duplicitné kalendáre „Bezplatná konzultácia…“ (15 min) som **nechal aktívne** — sú napojené na súčasný živý web/workflowy. Retirujeme ich pri go-live nového funnelu (deaktivovať `isActive=false`, needeletovať kvôli histórii).
- **Limity (viď §3.7):** platobná brána na výber 249 € pri rezervácii = manuál v GHL UI; potvrdzovacie e-maily/SMS z kalendára závisia od e-mail domény / SMS čísla.
- Rollback: `DELETE /calendars/fUjAzOhv2VyiY3XTguPz`, `DELETE /forms/geA4rea6TYWIKcskupXQ`.

## Vendored nástroje (aby branch bežal)
Do `cli_anything/gohighlevel/utils/` pridané z vetvy `dazzling-goldberg-bozha0`: `calendar_builder.py`, `form_builder.py`, `form_default_settings.json`, `pipeline_builder.py`, novší `ghl_internal_client.py`.
