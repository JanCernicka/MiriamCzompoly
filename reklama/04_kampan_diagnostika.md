# Meta kampaň: interiérová diagnostika 249 €

Náhľad na schválenie (copy, nastavenie, rozhodnutia): https://claude.ai/artifact/Wn4nwdF7iN2uHCjpBJUhtT
Text copy je v náhľade, tu ho zámerne neopakujem (CLAUDE.md: jedna kópia).

**Stav 25. 9. 2026 večer:** copy schválené, kampaň postavená, **všetko PAUSED**. Nespustené, čaká na testovaciu rezerváciu a Janovo „spusti“.

## Čo je v Mete (ad účet 1210955550121224)
- Kampaň `120250318272510477` „Miriam Czompoly: Leads - Diagnostika 249 - september 2026“, cieľ Leads, rozpočet na ad sete.
- Ad set `120250318289870477`: 15 €/deň, Trnava + 50 mi (80 km, max. čo Meta dovolí), bývajúci, bez AT/CZ/HU, ženy, vek 30-65 ako návrh, Advantage+ publikum a umiestnenia, OFFSITE_CONVERSIONS na pixel 2324280084711918 (konzultácia, Miriamin) s udalosťou LEAD, DSA Miriam Czompoly.
- 35 reklám (všetky videá z Drivu), identické schválené copy, headline „Interiérová diagnostika u teba doma 🏡“, tlačidlo Zistiť viac, odkaz /diagnostika s UTM, utm_content = názov reklamy (napr. `01_h1-slub_pokojny`). Stránka Poradňa tvojho bývania + IG miriamczompoly.design.
- Mapovanie videí na Meta video ID: 35 ks nahraných z Drivu cez verejný odkaz (Drive priečinok je zdieľaný „ktokoľvek s odkazom“, dá sa vypnúť).

## Meranie
- Kalendár `fUjAzOhv2VyiY3XTguPz`: po rezervácii presmeruje na https://www.miriamczompoly.sk/dakujem. Pozor: GHL API pri zápise chce pole `formSubmitRedirectURL`, číta `formSubmitRedirectUrl`, a PUT bez `formSubmitType` ho vráti na ThankYouMessage. Vždy posielať oboje a prečítať späť.
- `dakujem.html` má `data-fb-event="Lead"`, `consent.js` ho pošle len po súhlase s cookies. Otestované lokálne: bez súhlasu nič, po súhlase init + PageView + Lead.
- Kalendár: `slotBuffer` 270 min, takže po rezervácii je 5 h blokovaných (Janova požiadavka). Dĺžka termínu ostáva 30 min (Jano: neriešiť).
- /diagnostika: opravený embed kalendára (form_embed.js namiesto embed.js), predtým sa iframe nezväčšoval a časy aj formulár boli odrezané. Odstránené tlačidlo na api.leadconnectorhq.com.

## Otvorené
- Testovacia rezervácia: automat ju nespraví, GHL formulár má Cloudflare ochranu proti robotom. Treba ju spraviť ručne, potom overiť Lead v Events Manageri a zrušiť termín.
- Rezervačný formulár GHL je po anglicky (popisky, US vzor telefónu, povinný anglický súhlas s marketingom).
- Presmerovanie iframe na /dakujem: overiť pri ručnom teste, či sa stránka otvorí v celom okne.

## Zadanie od Jana
- jedno copy na všetky kreatívy, do Mety až po schválení
- odkaz https://www.miriamczompoly.sk/diagnostika
- 15 €/deň (zatiaľ), Trnava + 100 km, inšpirácia: kampaň „Leady na 15min konzultáciu Kampaň“
- performance goal: Maximize number of leads

## Fakty
- Ad účet 1210955550121224 (business Miriam Czompoly 883223954530210). Stránka 948130755047217 „Poradňa tvojho bývania“, IG 17841466487676511. Všetky staré reklamy bežali z nich.
- Pixely v ad účte: 2324280084711918 „konzultácia“ (business Miriam, web ho načíta cez consent.js po súhlase), 1635921510774833 „Miriam 15m konz“ (business 1158268182254703, stará kampaň). V júli Meta „konzultácia“ ako promoted_object odmietla, dnes je v ad účte vidieť.
- Za 7 dní nedostal ani jeden pixel Lead ani Schedule. Kalendár fUjAzOhv2VyiY3XTguPz (na /diagnostika) nemá pixelId, slotDuration 30 min, ďakovná správa je anglický default GHL.
- Meta dovolí okruh najviac 80 km. Návrh: Trnava + 80 km, vylúčiť AT, CZ, HU.
- Videá: Drive priečinok 1-dyaEuoLr2CPBIS5ovqi_yaCLHt2qEVa, 35 ks (pokojný 01-08, dynamický 09-15 bez hooku 2, rýchly 16-23, s hudbou 24-35), 209-315 MB, súkromné.
- Návrh 12 reklám: rýchly 16-23 + s hudbou 27, 24, 34, 31. Zvyšných 23 v zálohe.

## Janove rozhodnutia (25. 9.)
copy ok · pixel na stránku (/dakujem + Lead) · dĺžku termínu neriešiť, ale po rezervácii blokovať 5 h · všetky videá · Drive zdieľaný · testovacia rezervácia ok
