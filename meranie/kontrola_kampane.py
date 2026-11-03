"""Priebežná kontrola kampane „Plán od Miriam“ (od 3. 11. 2026, Jano: „priebežne monitoruj, či všetko
funguje, či nie sú tam žiadne chyby“). LEN ČÍTA, nič nezapisuje do GHL, D1 ani Mety.

Meta (doručovanie, chyby reklám) sa kontroluje zvlášť cez Facebook Ads MCP v sedení, tu nie.

Spustenie (tajomstvá len z premenných prostredia, nikdy do súboru ani do repa):
  GHL_API_KEY=... GHL_LOCATION_ID=... KONZOLA_HESLO=... /usr/bin/python3 meranie/kontrola_kampane.py [--hodin 6]
  CLOUDFLARE_API_TOKEN a CLOUDFLARE_ACCOUNT_ID sú v prostredí sedenia.

Bez --hodin počíta od resetu štatistiky (3. 11. 2026 09:09 UTC).
Výpis nemá mená, e-maily ani telefóny ľudí, len koniec id kontaktu, skupinu a reklamu.
"""
import os, sys, re, json, datetime as dt
import requests

RESET_MS = 1793696940000            # 3. 11. 2026 09:09 UTC, PLAN_OD v zberači
D1_ID = "3c5a6ea9-b2f0-46b5-ae7a-2b6061882ed9"
WEB = "https://www.miriamczompoly.sk"
KONZOLA = "https://miriam.shapelesai.sk"
API = "https://services.leadconnectorhq.com"
SKUPINY = ("plan-hovor", "plan-horuci", "plan-vlazny", "plan-ostatni")
TESTOVACIE = {"76LuqqtLjgAoHQtUlaH3", "z297q1TbLHIBHZ31S0Il"}   # Jano, nie lead z reklamy
ZLE = {"failed", "undelivered", "bounced", "rejected", "error"}

chyby, varovania = [], []
def zle(t): chyby.append(t); print("  🔴 " + t)
def pozor(t): varovania.append(t); print("  ⚠️  " + t)
def ok(t): print("  ✅ " + t)

hodin = None
if "--hodin" in sys.argv: hodin = float(sys.argv[sys.argv.index("--hodin") + 1])
od_ms = max(RESET_MS, int((dt.datetime.now(dt.timezone.utc).timestamp() - hodin * 3600) * 1000)) if hodin else RESET_MS
od_iso = dt.datetime.fromtimestamp(od_ms / 1000, dt.timezone.utc).isoformat()
miestne = lambda ms: (dt.datetime.fromtimestamp(ms / 1000, dt.timezone.utc) + dt.timedelta(hours=1)).strftime("%d. %m. %H:%M")
print(f"Kontrola od {miestne(od_ms)} (miestny čas), teraz {miestne(dt.datetime.now(dt.timezone.utc).timestamp() * 1000)}\n")

# ── 1. web ─────────────────────────────────────────────────────────────
print("== Web")
UA = {"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile Safari/604.1"}
for cesta, znak in [("/profil?utm_source=kontrola", "plan-meranie.js"), ("/profil-rezervacia", "plan-meranie.js"),
                    ("/diagnostika", "<html"), ("/assets/js/plan-meranie.js", "PLAN_KROK"),
                    ("/assets/js/profil-formular.js", "/api/profil")]:
    try:
        r = requests.get(WEB + cesta, headers=UA, timeout=30)
        (ok if r.status_code == 200 and znak in r.text else zle)(f"{cesta} HTTP {r.status_code}" + ("" if znak in r.text else f", chýba {znak}"))
    except Exception as e: zle(f"{cesta} nedostupná: {e}")
# funkcia merania beží: robot (python-requests) dostane ok bez zápisu
try:
    r = requests.post(WEB + "/api/krok", data=json.dumps({"sid": "kontrola", "krok": "plan-pristal", "stranka": "/profil"}), timeout=30)
    (ok if r.ok and '"robot":true' in r.text.replace(" ", "") else zle)(f"/api/krok odpovedá: {r.status_code} {r.text[:60]}")
except Exception as e: zle(f"/api/krok nedostupné: {e}")

# ── 2. D1: čo zapísalo meranie ─────────────────────────────────────────
print("\n== Meranie (D1)")
def d1(sql, params=()):
    r = requests.post(f"https://api.cloudflare.com/client/v4/accounts/{os.environ['CLOUDFLARE_ACCOUNT_ID']}/d1/database/{D1_ID}/query",
                      headers={"Authorization": f"Bearer {os.environ['CLOUDFLARE_API_TOKEN']}"}, json={"sql": sql, "params": list(params)}, timeout=60)
    d = r.json()
    if not d.get("success"): raise RuntimeError(str(d.get("errors"))[:200])
    return d["result"][0]["results"]
kroky = {}
try:
    for x in d1("SELECT krok, COUNT(DISTINCT sid) ludi, COUNT(*) n FROM udalosti WHERE cas >= ? GROUP BY krok", (od_ms,)):
        kroky[x["krok"]] = x["ludi"]
    poradie = ["plan-pristal", "plan-video-zvuk", "plan-video-polovica", "plan-formular-videl", "plan-formular-zacal",
               "plan-odoslal", "plan-rezervacia-pristal", "plan-hovor-rezervovany", "pristal", "kalendar-videl", "termin-rezervovany"]
    print("  " + " | ".join(f"{k} {kroky.get(k, 0)}" for k in poradie))
    rek = d1("SELECT IFNULL(kreativa,'(bez utm)') k, COUNT(DISTINCT sid) ludi, COUNT(DISTINCT CASE WHEN krok='plan-odoslal' THEN sid END) odoslali "
             "FROM udalosti WHERE cas >= ? AND krok IN ('plan-pristal','plan-odoslal') GROUP BY k ORDER BY ludi DESC LIMIT 25", (od_ms,))
    for x in rek: print(f"     {x['k'][:48]:48} ľudí {x['ludi']:4}  odoslali {x['odoslali']}")
    zar = d1("SELECT IFNULL(zariadenie,'?') z, COUNT(DISTINCT sid) ludi FROM udalosti WHERE cas >= ? AND krok='plan-pristal' GROUP BY z", (od_ms,))
    print("  zariadenia: " + ", ".join(f"{x['z']} {x['ludi']}" for x in zar))
    posl = d1("SELECT MAX(cas) m FROM udalosti")[0]["m"]
    print(f"  posledný zápis: {miestne(posl) if posl else 'žiadny'}")
    # odoslali, ale nevideli formulár = beacon sa stratil skôr (nie chyba, len signál)
    if kroky.get("plan-odoslal", 0) > kroky.get("plan-formular-videl", 0): pozor("viac odoslaní než ľudí, čo videli otázky")
except Exception as e: zle(f"D1 sa nedá čítať: {e}")

# ── 3. konzola ─────────────────────────────────────────────────────────
print("\n== Konzola")
if os.environ.get("KONZOLA_HESLO"):
    try:
        d = requests.post(KONZOLA + "/api/lievik", json={"heslo": os.environ["KONZOLA_HESLO"], "verzia": "plan"}, timeout=60).json()
        k = {x["krok"]: x["ludi"] for x in d.get("lievik", [])}
        if not d.get("ok") or d.get("cast") != "plan": zle(f"konzola nevrátila pohľad Plán: {str(d)[:120]}")
        elif od_ms == RESET_MS and k.get("plan-pristal") != kroky.get("plan-pristal", 0):
            pozor(f"konzola {k.get('plan-pristal')} ľudí, D1 {kroky.get('plan-pristal', 0)} (mohli pribudnúť medzi dotazmi)")
        else: ok(f"pohľad Plán od {d.get('od')}: prišlo {k.get('plan-pristal')}, odoslalo {k.get('plan-odoslal')}, hovor {k.get('plan-hovor-rezervovany')}")
    except Exception as e: zle(f"konzola nedostupná: {e}")
else: print("  (bez KONZOLA_HESLO, preskočené)")

# ── 4. GHL: nové kontakty z plánu a čo im odišlo ───────────────────────
print("\n== GHL kontakty z plánu")
H = {"Authorization": f"Bearer {os.environ['GHL_API_KEY']}", "Version": "2021-07-28", "Accept": "application/json"}
H4 = {**H, "Version": "2021-04-15"}
LOC = os.environ["GHL_LOCATION_ID"]
polia = {}
try:
    for f in requests.get(f"{API}/locations/{LOC}/customFields", headers=H, timeout=30).json().get("customFields", []):
        if str(f.get("fieldKey", "")).startswith("contact.plan_"): polia[f["id"]] = f["fieldKey"].replace("contact.", "")
except Exception as e: pozor(f"polia sa nedajú načítať: {e}")

def spravy(cid):
    out = []
    for k in requests.get(f"{API}/conversations/search", headers=H4, params={"locationId": LOC, "contactId": cid}, timeout=30).json().get("conversations", []):
        ms = (requests.get(f"{API}/conversations/{k['id']}/messages", headers=H4, params={"limit": 60}, timeout=30).json().get("messages") or {}).get("messages", [])
        out += [m for m in ms if not str(m.get("messageType", "")).startswith("TYPE_ACTIVITY")]
    return sorted(out, key=lambda m: m.get("dateAdded", ""))

kontakty = []
try:
    r = requests.post(f"{API}/contacts/search", headers=H, json={"locationId": LOC, "pageLimit": 100,
        "filters": [{"field": "tags", "operator": "contains", "value": "plan-test"}],
        "sort": [{"field": "dateUpdated", "direction": "desc"}]}, timeout=30).json()
    for c in r.get("contacts", []):
        if c["id"] in TESTOVACIE: continue
        if str(c.get("dateUpdated") or c.get("dateAdded") or "") < od_iso[:19]: continue
        kontakty.append(c)
except Exception as e: zle(f"GHL hľadanie kontaktov zlyhalo: {e}")

teraz = dt.datetime.now(dt.timezone.utc)
for c in kontakty:
    cid = c["id"]; tagy = c.get("tags") or []
    sk = next((t.replace("plan-", "") for t in SKUPINY if t in tagy), "?")
    novy = str(c.get("dateAdded", "")) >= od_iso[:19]
    hodnoty = {polia.get(f.get("id")): f.get("value") for f in (c.get("customFields") or []) if f.get("id") in polia}
    notes = requests.get(f"{API}/contacts/{cid}/notes", headers=H, timeout=30).json().get("notes", [])
    reklama = next((m.group(1) for n in notes for m in [re.search(r"Reklama: ([^\s(]+)", n.get("body") or "")] if m), None)
    zdroj = reklama or next(("bez utm" for n in notes if "Zdroj:" in (n.get("body") or "")), "bez poznámky")
    ms = spravy(cid)
    von = [m for m in ms if m.get("direction") == "outbound"]
    zle_ms = [m for m in von if str(m.get("status", "")).lower() in ZLE]
    mail = sum(1 for m in von if "EMAIL" in str(m.get("messageType")))
    sms = sum(1 for m in von if "SMS" in str(m.get("messageType")))
    prisiel = dt.datetime.fromisoformat(str(c.get("dateAdded")).replace("Z", "+00:00"))
    print(f"  …{cid[-6:]} {'nový' if novy else 'starší'} skupina={sk:8} reklama={zdroj[:40]:40} pole plan_odkaz={'áno' if hodnoty.get('plan_odkaz') else 'NIE'} "
          f"von: e-mail {mail}, SMS {sms}, prichádzajúce {sum(1 for m in ms if m.get('direction') == 'inbound')}")
    if not hodnoty.get("plan_odkaz"): zle(f"…{cid[-6:]}: chýba plan_odkaz (plán sa neuložil)")
    if sk == "?": zle(f"…{cid[-6:]}: nemá značku skupiny, sekvencia sa nespustí")
    if sk in ("vlazny", "ostatni") and mail == 0 and (teraz - prisiel).total_seconds() > 900:
        zle(f"…{cid[-6:]}: {sk} a po 15 min žiadny e-mail s plánom")
    if sk == "hovor":
        ap = requests.get(f"{API}/contacts/{cid}/appointments", headers=H, timeout=30).json().get("events", [])
        if not ap: pozor(f"…{cid[-6:]}: značka hovor, ale žiadny termín")
        elif sms == 0 and (teraz - prisiel).total_seconds() > 900: zle(f"…{cid[-6:]}: hovor rezervovaný, po 15 min žiadna SMS")
    for m in zle_ms:
        zle(f"…{cid[-6:]}: {m.get('messageType')} {m.get('status')} {m.get('dateAdded','')[:16]} {str(m.get('error') or (m.get('meta') or {}).get('error') or '')[:80]}")
print(f"  spolu {len(kontakty)} kontaktov z plánu v období" + (f", meranie ukazuje {kroky.get('plan-odoslal', 0)} odoslaní" if kroky else ""))
if kroky and od_ms == RESET_MS and abs(len([c for c in kontakty if str(c.get('dateAdded','')) >= od_iso[:19]]) - kroky.get("plan-odoslal", 0)) > max(2, kroky.get("plan-odoslal", 0) * 0.3):
    pozor("počet nových kontaktov a odoslaní v meraní sa výrazne líši (beacon alebo /api/profil?)")

# ── 5. GHL: každá nedoručená správa v účte za obdobie ──────────────────
print("\n== Nedoručené správy v celom účte")
try:
    konv = requests.get(f"{API}/conversations/search", headers=H4, params={"locationId": LOC, "limit": 100, "sort": "desc", "sortBy": "last_message_date"}, timeout=30).json().get("conversations", [])
    n_von, n_zle = 0, 0
    for k in konv:
        if (k.get("lastMessageDate") or 0) < od_ms: continue
        ms = (requests.get(f"{API}/conversations/{k['id']}/messages", headers=H4, params={"limit": 40}, timeout=30).json().get("messages") or {}).get("messages", [])
        for m in ms:
            if (m.get("dateAdded") or "") < od_iso[:19] or m.get("direction") != "outbound" or str(m.get("messageType", "")).startswith("TYPE_ACTIVITY"): continue
            n_von += 1
            if str(m.get("status", "")).lower() in ZLE:
                n_zle += 1; zle(f"kontakt …{str(k.get('contactId'))[-6:]}: {m.get('messageType')} {m.get('status')} {m.get('dateAdded','')[:16]}")
    (ok if n_zle == 0 else pozor)(f"odchádzajúcich správ {n_von}, nedoručených {n_zle}")
except Exception as e: zle(f"konverzácie sa nedajú čítať: {e}")

print(f"\nVÝSLEDOK: {len(chyby)} chýb, {len(varovania)} upozornení")
