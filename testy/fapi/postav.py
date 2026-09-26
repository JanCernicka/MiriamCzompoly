# Poskladá tri testovacie stránky zo spoločnej hlavičky. Spustiť: python3 postav.py
HLAVA = """<!DOCTYPE html>
<html lang="sk"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{titul} · test platby FAPI</title>
<meta name="robots" content="noindex, nofollow">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/b.css"><link rel="stylesheet" href="/test.css">
</head>
<body data-v="{v}">
<div class="testpruh"><div class="obal">
  <b>Testovacia stránka, nie ostrý web.</b> Termíny sú ukážkové a nič sa nerezervuje.
  Formulár FAPI je skutočný: <b>neklikaj „Objednávam“</b>, u Miriam by vznikla objednávka.
  <nav class="prepinac">
    <a href="/vlozene"{on1}>1. Vložené</a><a href="/tlacidlo"{on2}>2. Tlačidlo</a><a href="/navrh"{on3}>3. V kalendári</a>
  </nav>
</div></div>
<main>
<section class="hero" style="padding-bottom:8px"><div class="obal">
  <h1 style="font-size:28px">{nadpis}</h1>
  <p class="sub">{podnadpis}</p>
</div></section>
"""
PATA = """</main>
<script src="/test.js"></script>
</body></html>
"""
DNI_SLOTY = """<div class="dni" id="dni" role="tablist" aria-label="Deň"></div>
        <div class="sloty" id="sloty"></div>"""
POLE = lambda i, l, t="text", ac="", ph="": f"""<div class="pole"><label for="{i}">{l}</label><input id="{i}" name="{i}" type="{t}"{f' autocomplete="{ac}"' if ac else ''}{f' placeholder="{ph}"' if ph else ''}></div>"""
SUHLAS = """<label class="suhlas"><input name="suhlas" type="checkbox"><span>Áno, môžeš mi písať. Pošlem ti len potvrdenie termínu a dve pripomienky pred ním.</span></label>"""

KAL_B = f"""<section class="sekcia svetla" id="kalendar"><div class="obal">
  <h2>Vyber si čas, kedy k tebe prídem</h2>
  <p class="uvod">Pracovné dni. Diagnostika trvá 90 minút a je u teba doma.</p>
  <div class="kal" data-kalendar>
    {DNI_SLOTY}
    <form class="formular" id="formular" novalidate hidden>
      {POLE("meno","Krstné meno",ac="given-name")}
      {POLE("email","E-mail","email","email")}
      {POLE("telefon","Telefón","tel","tel","0907 777 555")}
      {POLE("ulica","Kde bude diagnostika? Ulica a číslo",ac="street-address")}
      {POLE("mesto","Mesto",ac="address-level2")}
      {SUHLAS}
      <button class="btn" type="submit" id="rezervovat">Vyber si čas</button>
    </form>
    <div class="suhrn" id="kalHotovo" hidden>
      <div class="r1">✓ Termín rezervovaný (ukážka)</div>
      <div class="r2" id="kalHotovoKedy"></div>
      <div class="r3">{{po_rezervacii}}</div>
    </div>
  </div>
</div></section>
"""

stranky = {
 "vlozene": dict(titul="1. Vložené", nadpis="1. Formulár FAPI vložený na stránku",
   podnadpis="Tak, ako to poslala Miriam: kód FAPI vložený ako samostatná časť pod kalendárom. Človek si najprv vyberie termín, potom nižšie vyplní objednávku.",
   telo=KAL_B.replace("{po_rezervacii}", "Teraz ešte vyplň objednávku nižšie, bez nej termín nie je záväzný.") + """
<section class="sekcia" id="platba"><div class="obal">
  <h2>Záväzná objednávka diagnostiky</h2>
  <p class="uvod">Po odoslaní ti príde faktúra s platobnými údajmi.</p>
  <div class="fapi-obal" id="fapi"></div>
  <p class="poznamka"><b>Všimni si:</b> meno, e-mail, telefón aj adresu človek píše druhýkrát, raz v kalendári a raz tu. Formulár FAPI má na mobile asi 1 350 px, teda skoro dve obrazovky navyše.</p>
</div></section>
"""),
 "tlacidlo": dict(titul="2. Tlačidlo", nadpis="2. Tlačidlo, ktoré vedie na FAPI",
   podnadpis="Na stránke je len tlačidlo. Klik otvorí objednávku na stránke FAPI v novej karte, človek odíde z nášho webu.",
   telo=KAL_B.replace("{po_rezervacii}", "Teraz ešte zaplať diagnostiku tlačidlom nižšie.") + """
<section class="sekcia" id="platba"><div class="obal">
  <h2>Zaplatenie diagnostiky</h2>
  <div class="suhrn">
    <div class="r2">Interiérová diagnostika u teba doma</div>
    <div class="r3">90 minút, analýza, akčný plán, zoznam „čo prestať kupovať“</div>
    <div class="cena-riadok"><span>Cena</span><b>249&nbsp;€</b></div>
  </div>
  <a class="btn von" href="https://form.fapi.cz/?id=33a88ecd-b33c-4a70-ab01-7f490ad088c0" target="_blank" rel="noopener">Zaplatiť 249 €</a>
  <p class="poznamka"><b>Všimni si:</b> na stránke FAPI človek znova vypĺňa meno, e-mail, telefón a adresu. Naše meranie a pixel ho tam už nevidia, takže nevieme, či zaplatil.</p>
</div></section>
"""),
 "navrh": dict(titul="3. V kalendári", nadpis="3. Návrh: platba ako posledný krok kalendára",
   podnadpis="Všetko v jednej karte: termín, údaje, platba. Údaje sa do FAPI vpíšu samy, človek už len skontroluje a klikne. Pri objednávke je aj termín, aby Miriam videla, ku ktorému patrí.",
   telo=f"""<section class="sekcia svetla" id="kalendar"><div class="obal">
  <h2>Vyber si čas, kedy k tebe prídem</h2>
  <p class="uvod">Pracovné dni. Diagnostika trvá 90 minút a je u teba doma.</p>
  <ol class="kroky"><li class="on">1. Termín</li><li>2. Údaje</li><li>3. Platba</li></ol>
  <div class="kal" data-kalendar>
    <div id="krok-termin">{DNI_SLOTY}</div>
    <form class="formular" id="formular" novalidate hidden>
      <div id="krok-udaje">
      <div class="dvojica">{POLE("meno","Meno",ac="given-name")}{POLE("priezvisko","Priezvisko",ac="family-name")}</div>
      {POLE("email","E-mail","email","email")}
      {POLE("telefon","Telefón","tel","tel","0907 777 555")}
      {POLE("ulica","Kde bude diagnostika? Ulica a číslo",ac="street-address")}
      <div class="dvojica">{POLE("mesto","Mesto",ac="address-level2")}{POLE("psc","PSČ",ac="postal-code")}</div>
      {SUHLAS}
      <p class="chyba" id="chyba" role="alert"></p>
      <button class="btn" type="submit" id="rezervovat">Vyber si čas</button>
      </div>
    </form>
    <div id="krok-platba" hidden>
      <div class="suhrn">
        <div class="r1">✓ Termín držím pre teba</div>
        <div class="r2" id="suhrnKedy"></div>
        <div class="r3" id="suhrnKde"></div>
        <div class="cena-riadok"><span>Interiérová diagnostika</span><b>249&nbsp;€</b></div>
      </div>
      <p style="font-size:14.5px;margin:0 0 4px">Tvoje údaje sú už vpísané, skontroluj ich a potvrď objednávku. <a href="#" id="spat" onclick="return false">Zmeniť termín</a></p>
    </div>
    <div class="fapi-obal" id="fapi" hidden></div>
  </div>
  <p class="poznamka"><b>Ako by to fungovalo naostro:</b> termín sa v GHL založí hneď po kroku 2 (ako dnes na B), FAPI potom pošle faktúru. Človek teda údaje píše raz a z nášho webu neodchádza.</p>
</div></section>
"""),
}
for v, s in stranky.items():
    html = HLAVA.format(v=v, titul=s["titul"], nadpis=s["nadpis"], podnadpis=s["podnadpis"],
                        on1=' class="on"' if v=="vlozene" else "", on2=' class="on"' if v=="tlacidlo" else "", on3=' class="on"' if v=="navrh" else "")
    open(f"dist/{v}.html", "w").write(html + s["telo"] + PATA)
open("dist/index.html","w").write('<!DOCTYPE html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/vlozene"><meta name="robots" content="noindex">')
print("hotovo")
