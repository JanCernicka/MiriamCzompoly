"""Prebrandovanie GHL formulara "5 chyb" do vizualu webu Miriam Czompoly.

Formular sedi v iframe, takze CSS zo stranky sa don nedostane. Jedina cesta je
prepisat styling priamo vo formulari.
"""
import json, os, sys
sys.path.insert(0, "/home/user/GHLtool")
from cli_anything.gohighlevel.utils.ghl_internal_client import InternalGHLClient, TokenManager
from cli_anything.gohighlevel.utils.form_builder import FormBuilder

FORM_ID = "geA4rea6TYWIKcskupXQ"

# paleta webu (assets/css/style.css)
INK, INK_SOFT, LINE_2, PLACEHOLDER = "262019", "4C453B", "D8CBB4", "B3A892"
SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif"

c = InternalGHLClient(TokenManager(), os.environ["GHL_LOCATION_ID"])
fb = FormBuilder(c)
resp = fb.read_form(FORM_ID)
form = resp["form"]
fd = form["formData"]
frm = fd["form"]

before = len(frm["fields"])

# ---- 1. plocha formulara -------------------------------------------------
# Vonkajsia karta .optin-card uz dava ramik aj padding. Formular pridaval
# svoj vlastny (mobil: 60px hore, 40px po stranach), preto to bolo rozliezle.
frm["style"]["padding"] = {"top": 8, "bottom": 8, "left": 4, "right": 4,
                           "extraPaddingComputingProcessed": True}
frm["style"]["mobilePadding"] = {"top": 8, "bottom": 8, "left": 4, "right": 4,
                                 "extraPaddingComputingProcessed": True}
frm["style"]["fieldSpacing"] = 14

# ---- 2. pole ------------------------------------------------------------
fs = frm["fieldStyle"]
fs["border"] = {"border": 1, "color": LINE_2 + "FF", "radius": 8, "type": "solid"}
fs["fontColor"] = INK + "FF"
fs["labelColor"] = INK_SOFT + "FF"
fs["labelFontFamily"] = "Inter"
fs["labelFontSize"] = 13
fs["labelFontWeight"] = "600"
fs["mobileLabelColor"] = INK_SOFT + "FF"
fs["mobileLabelFontFamily"] = "Inter"
fs["mobilePlaceholderFontFamily"] = "Inter"
fs["placeholderColor"] = PLACEHOLDER + "FF"
fs["placeholderFontFamily"] = "Inter"
fs["placeholderFontSize"] = 15
fs["placeholderFontWeight"] = 400
fs["padding"] = {"top": 14, "bottom": 14, "left": 14, "right": 14}
fs["shortLabel"]["fontFamily"] = "Inter"
fs["shortLabel"]["color"] = INK_SOFT + "FF"
fs["shortLabel"]["mobileFontFamily"] = "Inter"

# ---- 3. nadpis a tlacidlo ------------------------------------------------
for f in frm["fields"]:
    if f.get("tag") == "header":
        f["color"] = "#" + INK
        # Stranka nad formularom uz nesie cely slub (H1 + odrazky). Formular
        # opakoval to iste dlhym nadpisom na styri riadky. Staci mikro-otazka.
        f["label"] = (
            '<h1 style="margin:0;color:#%s;font-weight:600;line-height:1.15;'
            'font-family:%s;"><span style="font-size:26px;">'
            "Kam ti ho mám poslať?"
            "</span></h1>" % (INK, SERIF)
        )
        f["placeholder"] = "Kam ti ho mám poslať?"
    elif f.get("tag") == "submit":
        # 60px padding po stranach tlacilo napis do troch riadkov
        f["padding"] = {"top": 17, "bottom": 17, "left": 24, "right": 24}
        f["radius"] = 50
        f["bgColor"] = INK + "FF"
        f["color"] = "FFFFFF"
        f["fontFamily"] = "Inter"
        f["fontSize"] = 16
        f["label"] = (
            '<p style="text-align:center;line-height:1.3;margin:0;"><strong>'
            '<span style="font-size:16px;letter-spacing:0.04em;">'
            "Poslať mi to zdarma</span></strong></p>"
        )

# ---- 4. potvrdenie po odoslani ------------------------------------------
frm["formAction"]["thankyouText"] = (
    '<p style="text-align:center;">E-book je na ceste. Pozri si schránku, '
    "vrátane priečinka Promo alebo Spam.</p>"
)
sms = frm["submitMessageStyle"]
sms["fontFamily"] = "Inter"
sms["color"] = INK
sms["fontSize"] = 16

if "--dry-run" in sys.argv:
    print("DRY RUN, neukladam.")
    print(json.dumps({"fields": before, "button": [f for f in frm["fields"] if f["tag"] == "submit"][0]},
                     ensure_ascii=False, indent=1)[:900])
    sys.exit(0)

fb.update_form(FORM_ID, form["name"], fd)

# ---- verifikacia: pole sa nesmu ticho stratit ---------------------------
again = fb.read_form(FORM_ID)["form"]["formData"]["form"]
after = len(again["fields"])
btn = [f for f in again["fields"] if f.get("tag") == "submit"][0]
print("polia pred/po:", before, "/", after)
print("tlacidlo padding:", btn["padding"], "radius:", btn["radius"], "bg:", btn["bgColor"])
print("padding formulara:", again["style"]["mobilePadding"])
assert after == before, "POZOR: formular stratil polia"
