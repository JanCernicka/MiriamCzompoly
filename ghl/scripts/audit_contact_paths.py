"""Audit: kadial sa da na stranke ozvat a ci to naozaj skonci v GHL.

Kontroluje cely retaz, nie len ci stranka vrati 200:
  stranka -> embed -> formular/kalendar v GHL -> trigger -> workflow -> odkazy

Spusti: python3 audit_contact_paths.py [--base https://...]
"""
import os
import re
import sys
import subprocess

sys.path.insert(0, "/home/user/GHLtool")
from cli_anything.gohighlevel.utils.ghl_client import get
from cli_anything.gohighlevel.utils.ghl_internal_client import InternalGHLClient, TokenManager
from cli_anything.gohighlevel.utils.form_builder import FormBuilder
from cli_anything.gohighlevel.utils import workflow_ops as wo

BASE = "https://miriam-web-staging.pages.dev"
PAGES = ["index.html", "diagnostika.html", "5-chyb.html"]
FORM_ID = "geA4rea6TYWIKcskupXQ"
CAL_ID = "fUjAzOhv2VyiY3XTguPz"
WF1 = "71f69ec4-4dfc-4200-9a92-7253ed6ca1da"

OK, BAD, WARN = "  OK  ", " CHYBA", " POZOR"
findings: list[tuple[str, str]] = []


def check(level: str, msg: str) -> None:
    findings.append((level, msg))
    print(f"[{level}] {msg}")


def fetch(url: str) -> tuple[int, str]:
    """Cez curl, nie urllib: v tomto prostredi ide vsetok HTTPS cez proxy,
    ktoru urllib sam od seba nepouzije a kazda kontrola by vratila 0."""
    try:
        r = subprocess.run(
            ["curl", "-sSL", "--max-time", "30", "-w", "\n%{http_code}", url],
            capture_output=True, text=True, timeout=45)
        out = r.stdout.rsplit("\n", 1)
        return (int(out[-1]) if out[-1].strip().isdigit() else 0,
                out[0] if len(out) > 1 else "")
    except Exception as e:  # noqa: BLE001
        return 0, str(e)


def status_of(url: str) -> int:
    """Len navratovy kod, telo zahodime. Pri binarnych suboroch (PDF) sa telo
    neda spolahlivo dekodovat a kod by sa z neho nedal vytiahnut."""
    try:
        r = subprocess.run(
            ["curl", "-sSL", "--max-time", "30", "-o", "/dev/null",
             "-w", "%{http_code}", url],
            capture_output=True, text=True, timeout=45)
        return int(r.stdout.strip() or 0)
    except Exception:  # noqa: BLE001
        return 0


def main() -> None:
    base = BASE
    if "--base" in sys.argv:
        base = sys.argv[sys.argv.index("--base") + 1]

    print("=" * 68)
    print("1. STRANKY A EMBEDY")
    print("=" * 68)
    html = {}
    for p in PAGES:
        code, body = fetch(f"{base}/{p}")
        html[p] = body
        check(OK if code == 200 else BAD, f"{p} vracia {code}")

    # embed formulara + jeho script
    if FORM_ID in html["5-chyb.html"]:
        check(OK, f"5-chyb.html ma embed formulara {FORM_ID}")
    else:
        check(BAD, "5-chyb.html NEMA embed formulara")
    check(OK if "form_embed.js" in html["5-chyb.html"] else BAD,
          "5-chyb.html ma form_embed.js (bez neho sa iframe neprisposobi)")

    if CAL_ID in html["diagnostika.html"]:
        check(OK, f"diagnostika.html ma embed kalendara {CAL_ID}")
    else:
        check(BAD, "diagnostika.html NEMA embed kalendara")
    check(OK if "js/embed.js" in html["diagnostika.html"] else BAD,
          "diagnostika.html ma embed.js")

    # opt-in na domovskej stranke je len odovzdavka, nie zapis do GHL
    m = re.search(r'<form[^>]*action="([^"]+)"', html["index.html"])
    if m:
        check(WARN, f"opt-in na index.html neposiela do GHL, presmeruje na "
                    f"{m.group(1)} a e-mail predvyplni. Zapis robi az formular tam.")

    # mrtve odkazy
    for p in PAGES:
        dead = len(re.findall(r'href="#"', html[p]))
        if dead:
            check(WARN, f"{p}: {dead}x odkaz href=\"#\" (Blog, GDPR), nikam nevedie")

    # priamy kontakt
    direct = sum(len(re.findall(r"mailto:|tel:", html[p])) for p in PAGES)
    check(BAD if direct == 0 else OK,
          f"priamy kontakt (mailto/tel) na stranke: {direct}x")

    # pixel
    for p in PAGES:
        ev = re.findall(r"fbq\('track','([A-Za-z]+)'", html[p])
        check(OK if ev else WARN, f"{p}: pixel udalosti {ev or 'ziadne'}")

    print()
    print("=" * 68)
    print("2. FORMULAR V GHL")
    print("=" * 68)
    c = InternalGHLClient(TokenManager(), os.environ["GHL_LOCATION_ID"])
    frm = FormBuilder(c).read_form(FORM_ID)["form"]
    fd = frm["formData"]
    tags = [f.get("tag") for f in fd["form"]["fields"]]
    check(OK if not frm.get("deleted") else BAD,
          f"formular '{frm['name']}' existuje, deleted={frm.get('deleted')}")
    check(OK, f"polia: {tags}")
    for want in ("first_name", "email"):
        f = next((x for x in fd["form"]["fields"] if x.get("tag") == want), None)
        check(OK if f and f.get("required") else BAD,
              f"pole {want}: {'povinne' if f and f.get('required') else 'CHYBA alebo nie je povinne'}")
    check(WARN if not fd.get("emailNotifications") else OK,
          f"upozornenie na novy lead z formulara: {bool(fd.get('emailNotifications'))}")

    print()
    print("=" * 68)
    print("3. WORKFLOW WF1")
    print("=" * 68)
    trs = wo.read_triggers(c, WF1)
    for t in trs:
        points_here = FORM_ID in str(t.get("conditions"))
        check(OK if points_here else BAD,
              f"trigger '{t.get('name')}' typ={t.get('type')} ukazuje na spravny formular={points_here}")
        check(OK if t.get("active") else BAD,
              f"trigger je aktivny: {t.get('active')} "
              f"({'bezi' if t.get('active') else 'NEBEZI, workflow nie je publikovany'})")

    wf = wo.read_workflow(c, WF1)
    steps = wf["workflowData"]["templates"]
    kinds = [s.get("type") for s in steps]
    check(OK, f"krokov: {len(steps)} ({', '.join(sorted(set(kinds)))})")
    mails = [s for s in steps if s.get("type") == "email"]
    named = sum("contact.first_name" in s["attributes"]["html"] for s in mails)
    check(OK if named == len(mails) else WARN,
          f"e-mailov oslovujucich menom: {named}/{len(mails)}")
    check(WARN if "internal_notification" not in kinds else OK,
          "WF1 nema krok internal_notification, Miriam sa o novom lede nedozvie")

    # odkazy pouzite v e-mailoch
    used = set()
    for s in mails:
        used |= set(re.findall(r"custom_values\.([a-zA-Z0-9_]+)", s["attributes"]["html"]))
    cvs = {v["name"]: v.get("value", "") for v in
           (get("/locations/{}/customValues".format(os.environ["GHL_LOCATION_ID"]))
            or {}).get("customValues", [])}
    norm = {k.lower().replace(" ", "_"): v for k, v in cvs.items()}
    for key in sorted(used):
        val = norm.get(key)
        if not val:
            check(BAD, f"custom value '{key}' pouzity v e-maile NEEXISTUJE alebo je prazdny")
            continue
        if not val.startswith("http"):
            check(BAD, f"custom value '{key}' nie je URL: {val!r}")
            continue
        code = status_of(val)
        check(OK if code == 200 else BAD, f"custom value '{key}' -> {val} ({code})")

    print()
    print("=" * 68)
    print("4. KALENDARE")
    print("=" * 68)
    cals = get("/calendars/", {"locationId": os.environ["GHL_LOCATION_ID"]}).get("calendars", [])
    for cal in cals:
        if cal["id"] == CAL_ID:
            check(OK if cal.get("isActive") else BAD,
                  f"diagnostika '{cal['name']}' aktivny={cal.get('isActive')}")
        elif cal.get("isActive"):
            check(WARN, f"stary kalendar je stale aktivny a rezervovatelny: '{cal['name']}'")

    print()
    print("=" * 68)
    n_bad = sum(1 for lvl, _ in findings if lvl == BAD)
    n_warn = sum(1 for lvl, _ in findings if lvl == WARN)
    print(f"VYSLEDOK: {n_bad} chyb, {n_warn} upozorneni, "
          f"{len(findings) - n_bad - n_warn} v poriadku")
    print("=" * 68)


if __name__ == "__main__":
    main()
