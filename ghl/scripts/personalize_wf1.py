"""WF1 (lead magnet nurture): oslovenie krstnym menom.

Formular "5 chyb" uz krstne meno zbiera a je povinne. WF1 spusta VYLUCNE
odoslanie tohto formulara (jediny trigger, form_submission, form.id =
geA4rea6TYWIKcskupXQ), takze kazdy kontakt v tejto sekvencii meno ma.
Preto sa tu da `{{contact.first_name}}` pouzit bez fallbacku.

Pozor: to iste NEPLATI pre sekvencie, do ktorych sa da dostat tagom alebo
hromadne. Tam by prazdne meno spravilo "Ahoj ,".

Skript je idempotentny, uz oslovene e-maily preskoci.
"""
import os
import re
import sys
import time

sys.path.insert(0, "/home/user/GHLtool")
from cli_anything.gohighlevel.utils.ghl_internal_client import InternalGHLClient, TokenManager
from cli_anything.gohighlevel.utils import workflow_ops as wo

WF_ID = "71f69ec4-4dfc-4200-9a92-7253ed6ca1da"
FORM_ID = "geA4rea6TYWIKcskupXQ"

P_STYLE = ("margin:0 0 12px 0;line-height:1.75;font-size:16px;"
           "font-family:arial,helvetica,sans-serif;color:#000;")
GREETING = f'<p style="{P_STYLE}">Ahoj {{{{contact.first_name}}}},</p>'


def personalize(html: str) -> str:
    """Osloveny e-mail nechaj tak, inak doplnit meno na zaciatok."""
    if "contact.first_name" in html:
        return html
    # E1 uz oslovenie ma, len bez mena
    if re.search(r">\s*Ahoj\s*,\s*<", html):
        return re.sub(r">\s*Ahoj\s*,\s*<", ">Ahoj {{contact.first_name}},<", html, count=1)
    # ostatne zacinaju rovno textom, oslovenie im chyba uplne
    return GREETING + html


def fix_dashes(text: str) -> str:
    """CLAUDE.md: ciselne rozsahy obycajnym spojovnikom, dlhe pomlcky nikde."""
    return text.replace("—", ", ").replace("–", "-")


def main() -> None:
    c = InternalGHLClient(TokenManager(), os.environ["GHL_LOCATION_ID"])

    # poistka: personalizacia je bezpecna len ak sa sem neda dostat inak
    triggers = wo.read_triggers(c, WF_ID)
    assert len(triggers) == 1, f"ocakaval som 1 trigger, je ich {len(triggers)}"
    t = triggers[0]
    assert t.get("type") == "form_submission", f"trigger nie je formular: {t.get('type')}"
    assert FORM_ID in str(t.get("conditions")), "trigger neukazuje na formular 5 chyb"

    wf = wo.read_workflow(c, WF_ID)
    templates = wf["workflowData"]["templates"]

    changed = []
    for s in templates:
        if s.get("type") != "email":
            continue
        a = s["attributes"]
        before = (a.get("subject", ""), a.get("html", ""))
        a["subject"] = fix_dashes(a.get("subject", ""))
        for key in ("html", "body"):
            if key in a and a[key]:
                a[key] = fix_dashes(personalize(a[key]))
        if (a.get("subject", ""), a.get("html", "")) != before:
            changed.append(s["name"])

    if "--dry-run" in sys.argv:
        print("DRY RUN, zmenil by som:", changed)
        return

    loc = c.location_id
    c.request("PUT", f"/workflow/{loc}/{WF_ID}", {
        "name": wf.get("name"),
        "version": wf.get("version", 1),
        "workflowData": {"templates": templates},
    })

    # GHL cita z repliky, ktora sa nestiha, overenie musi skusat opakovane
    for _ in range(6):
        time.sleep(2)
        again = wo.read_workflow(c, WF_ID)["workflowData"]["templates"]
        mails = [s for s in again if s.get("type") == "email"]
        ok = all("contact.first_name" in s["attributes"]["html"] for s in mails)
        no_dash = not any("–" in s["attributes"]["html"] + s["attributes"]["subject"]
                          for s in mails)
        if ok and no_dash:
            print(f"hotovo: {len(mails)}/{len(mails)} e-mailov oslovuje menom, "
                  f"ziadne dlhe pomlcky")
            for s in mails:
                first = re.sub(r"<[^>]+>", "", s["attributes"]["html"])[:46]
                print(f"  {s['name']}: {first!r}")
            return
    raise SystemExit("POZOR: overenie neprebehlo, skontroluj workflow rucne")


if __name__ == "__main__":
    main()
