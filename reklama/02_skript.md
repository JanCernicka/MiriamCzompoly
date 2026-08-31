# Skripty do reklamných videí

Postavené na desaťblokovej kostre z `playbook/03_kreativa/SKRIPT_SABLONA.md`
a na piatich rozobratých príkladoch v `playbook/03_kreativa/priklady/`.

> ⚠️ **Toto je prepis oproti predošlej verzii.** Predtým som písal skripty v šesťtaktovej
> kostre hook, problém, riešenie, dôkaz, ponuka, CTA. **Tá kostra nie je z playbooku.**
> Chýbali v nej štyri bloky, ktoré má reálne bežiaca reklama: **elimination, guarantee,
> time limit a druhé CTA.** Playbook meria, že práve elimination a guarantee vynecháva
> AI najčastejšie, a práve tie robia rozdiel medzi reklamou a letákom.

| Parameter | Hodnota |
|---|---|
| Dĺžka | 45 až 75 s, tu **65 až 68 s** |
| Tempo | 145 hovorených slov na 60 s |
| Formát | 9:16 na výšku, 1080x1920, 30 fps |
| Titulky | napevno, v strede alebo v spodnej tretine, nikdy pri dolnom okraji |
| Strih | rez každé 2,5 až 5 s, teda 12 až 26 záberov za minútu |
| Do kampane | minimálne 10 videí, všetky v jednom ad sete |

---

## Čo dostaneš z jedného natáčania

**Štyri telá.** A a B sa kombinujú so štyrmi voľnými dvojicami hook a subhook,
C a D majú vlastný pevný hook. Telo sa nahráva **raz**, mení sa iba prvých päť
až dvanásť sekúnd.

| Telo | Model | Hooky | Variantov |
|---|---|---|---|
| **A** „Poradie" | vlastné, hovoriaca hlava | 4 voľné dvojice | 4 |
| **B** „Nechodím ti nič predať" | vlastné, komentár nad zábermi | 4 voľné dvojice | 4 |
| **C** „Bez búrania" | tepelné čerpadlá, Dream + Fear | H5 + S5, pevné | 1 |
| **D** „Kreslo" | Eblaka + vizuálny hook | H6 + S6, pevné | 1 |

```
1. kolo (režim rýchly)     telo A + 4 dvojice hook/subhook   = 4 reklamy
                           telo B + 4 dvojice hook/subhook   = 4 reklamy
                           telo C a telo D                   = 2 reklamy
                                                             = 10 reklám
2. kolo (o dva týždne)     pozri, ktoré hooky ťahajú, a nahraj k nim nové telo
```

➡️ **Referencie klientok tým vypadli z prvého kola.** Sú lepšie ako záloha do druhého
kola, keď už bude jasné, ktorý uhol ťahá, a keď bude vybavený súhlas so zverejnením.

⚠️ **Nezostávaj navždy v rýchlom režime.** Ak je desať reklám na 90 % identických,
algoritmus nemá z čoho vyberať a rozdiely medzi nimi budú šum, nie signál.

---

## Formát: obe telá sa točia inak, a to zámerne

Playbook pozná tri formáty. Používame dva, jeden na telo, aby sa videá naozaj líšili.

| | Telo A | Telo B |
|---|---|---|
| **Formát** | B: hovoriaca hlava plus zábery | A: komentár nad zábermi, bez tváre |
| **Kde** | v priestore, ktorý nefunguje | strih z interiérových záberov |
| **Prečo tak** | pri službe, kde púšťaš cudzieho človeka do bytu, musí byť vidieť tvár | ukáže priestory, ktoré tvár neukáže, a nahovorí sa kedykoľvek |
| **Oblečenie** | sveter | (nie je vidieť) |

Formát A je v playbooku predvolená voľba a je najrýchlejší na výrobu variantov.
Formát B je tu preto, že **Miriam predáva dôveru**: žena si má do bytu na deväťdesiat
minút pustiť cudzieho človeka. Tvár to rieši lepšie než akýkoľvek záber.

---

# HOOK: štyri možnosti

Jedna veta. Každá útočí na iný typ diváčky, nie sú to preformulovania tej istej vety.

| # | Hook | Typ | Slov |
|---|---|---|---|
| **H1** | „Domov, do ktorého sa tešíš vrátiť. Začni tým, čo ti v ňom naozaj prekáža." | **sľub výsledku** (Dream) | 14 |
| **H2** | „Dizajnérka nie je náklad navyše. Je to spôsob, ako prestať kupovať veci dvakrát." | **prevrátenie námietky o cene** | 13 |
| **H3** | „Máš doma pekné veci a domov to aj tak nie je? Problém nie je vo veciach." | **symptóm a jeho príčina** (Fear) | 16 |
| **H4** | „Ak sa vo vlastnom byte necítiš doma, nie je to tvoja chyba." | **ubezpečenie** | 12 |
| **H5** | „Vedela si, že domov sa dá zmeniť na nepoznanie aj bez rekonštrukcie?" | **Dream**, viazaný na telo C | 12 |
| **H6** | „Áno, toto kreslo tu stojí len preto, že sa nezmestilo nikam inam." | **vizuálny komentár**, viazaný na telo D | 12 |

⚠️ **H5 a H6 sú viazané na svoje telo, nekombinuj ich voľne.** H5 sľubuje „bez
rekonštrukcie" a to musí telo splniť, čo robí len telo C. H6 je vizuálny a funguje iba
vtedy, keď je to kreslo naozaj v zábere.

---

# SUBHOOK: štyri možnosti

Jedna až dve vety. **Prehĺbi to, čo hook otvoril.** Ak je hook sľub, subhook je strach,
a naopak.

| # | Subhook | Typ | Slov |
|---|---|---|---|
| **S1** | „Koľkokrát si už niečo kúpila v nádeji, že to pomôže? A koľko z toho dnes stojí tam, kde si to nechcela?" | **eskalácia, dve otázky za sebou** | 21 |
| **S2** | „Predstav si, že za jedno popoludnie vieš, čo zmeniť ako prvé, a prestaneš míňať na veci, ktoré to nespravia." | **sľub** | 19 |
| **S3** | „Sedačka, okolo ktorej sa chodí bokom. Svetlo uprostred stropu namiesto nad stolom. Skriňa, do ktorej sa nezmestí polovica vecí." | **konkrétne symptómy** | 19 |
| **S4** | „Nie je to o vkuse ani o peniazoch. Len ti nikto nepovedal, v akom poradí sa priestor skladá." | **prevrátenie viny** | 18 |
| **S5** | „Alebo to odkladáš, lebo sa bojíš, že to bude znamenať búranie, prach a mesiace v neporiadku?" | **Fear po Dream hooku** | 16 |
| **S6** | „Koľko takých vecí máš doma ty? A koľko z nich si kupovala s úplne inou predstavou?" | **otázka na stratu** | 16 |

🔴 **S5 je najdôležitejší prírastok.** Playbook aj tvoj rozbor čerpadiel ukazujú, že
najsilnejší pár je **Dream hook a hneď za ním Fear subhook**: sľub otvorí a strach
okamžite zatvorí únikovú cestu „veď to ešte počká". Prvé štyri dvojice, ktoré som
napísal, boli sľub plus sľub alebo symptóm plus symptóm. To je slabšie.

---

## Ktorý hook s ktorým subhookom

⚠️ **Nepáruj náhodne.** Hook a subhook musia ísť po sebe logicky. Hook o cene sa páruje
so subhookom o zbytočne minutých peniazoch, hook o symptóme so subhookom o symptómoch.

| Dvojica | Prečo dáva zmysel | Do 1. kola |
|---|---|---|
| **H1 + S2** | sľub otvorí, sľub prehĺbi a doplní o „ako prvé" | ✅ |
| **H2 + S1** | cena otvorí, subhook ukáže, koľko už minula zle | ✅ |
| **H3 + S3** | symptóm otvorí, tri konkrétne symptómy prehĺbia | ✅ |
| **H4 + S4** | ubezpečenie otvorí, subhook povie, kto za to teda môže | ✅ |
| H1 + S4 | funguje, sľub a potom zbavenie viny | záloha |
| H3 + S1 | funguje, symptóm a potom minuté peniaze | záloha |
| ❌ H2 + S3 | cena a potom zoznam symptómov, nenadväzuje | nie |
| ❌ H4 + S1 | „nie je to tvoja chyba" a hneď „koľkokrát si už kúpila" znie ako výčitka | nie |

---

# TELO A: „Poradie"

**Formát B, hovoriaca hlava plus zábery. 126 slov, s hookom a subhookom 65 až 67 s.**

> **[OFFER]** 41 slov
> Práve teraz robím interiérovú diagnostiku. Prídem k tebe domov na deväťdesiat minút
> a odídeš s tromi vecami: kde je skutočný problém, čo riešiť ako prvé a čo prestať
> kupovať. A ešte predtým ti zdarma pošlem päť najdrahších chýb pri zariaďovaní domova.
>
> **[ELIMINATION]** 23 slov
> U mňa sa nemusíš báť, že ti nanútim cudzí štýl. Nechodím s hotovou predstavou.
> Tých deväťdesiat minút sa hlavne pýtam, ako reálne žiješ.
>
> **[GUARANTEE]** 16 slov
> A ak neodídeš s jasnom, čo ďalej, povedz mi to na mieste a peniaze ti vrátim.
>
> **[BONUS]** 14 slov
> Navyše, ak sa rozhodneš pre návrh, celých dvestoštyridsaťdeväť eur ti z ceny projektu
> odpočítam.
>
> **[CTA 1]** 7 slov
> Klikni a rezervuj si diagnostiku ešte dnes.
>
> **[TIME LIMIT]** 7 slov
> Termíny vypisujem vždy len na najbližší mesiac.
>
> **[SCARCITY]** 6 slov
> Chodím osobne, takže mesačne stihnem deväť.
>
> **[CTA 2]** 12 slov
> Tak nečakaj, klikni na tlačidlo pod týmto videom a vyber si termín.

### Zábery k telu A

| Blok | Čo je v obraze |
|---|---|
| OFFER | Miriam vchádza do dverí bytu, zúva sa, obzerá sa po miestnosti |
| ELIMINATION | sedí s klientkou pri stole, počúva, robí si poznámky |
| GUARANTEE | detail poznámkového bloku s ručne písaným zoznamom |
| BONUS | detail obrazovky s PDF, alebo listovanie vytlačeným |
| CTA 1 | znova tvár do kamery |
| TIME LIMIT + SCARCITY | detail kalendára s termínmi |
| CTA 2 | tvár do kamery, ruka ukazuje nadol |

---

# TELO B: „Nechodím ti nič predať"

**Formát A, komentár nad zábermi, bez tváre. 129 slov, s hookom a subhookom 66 až 68 s.**

> **[OFFER]** 36 slov
> Práve teraz robím interiérovú diagnostiku. Deväťdesiat minút u teba doma. Pomenujeme,
> čo v priestore nefunguje a prečo, a odídeš s poradím krokov, nie s pocitom. K tomu ti
> zdarma pošlem päť najdrahších chýb pri zariaďovaní domova.
>
> **[ELIMINATION]** 31 slov
> A nemusíš sa báť, že ti prídem niečo predať. Niekedy stačí presunúť tri veci, ktoré už
> doma máš. Ak to bude tvoj prípad, poviem ti to a projekt ti ponúkať nebudem.
>
> **[GUARANTEE]** 14 slov
> Navyše máš u mňa garanciu. Ak neodídeš s jasnom, čo ďalej, peniaze ti vrátim.
>
> **[BONUS]** 14 slov
> A ak sa pre projekt rozhodneš, celých dvestoštyridsaťdeväť eur ti z jeho ceny odpočítam.
>
> **[CTA 1]** 6 slov
> Klikni a rezervuj si svoj termín.
>
> **[TIME LIMIT]** 7 slov
> Termíny vypisujem vždy len na najbližší mesiac.
>
> **[SCARCITY]** 9 slov
> Chodím k ženám osobne, takže mesačne stihnem deväť diagnostík.
>
> **[CTA 2]** 12 slov
> Tak nečakaj, klikni na tlačidlo pod týmto videom a vyber si termín.

### Zábery k telu B

Potrebných je 15 až 25 krátkych záberov, rez každé 2,5 až 5 sekundy.

| Blok | Čo je v obraze |
|---|---|
| OFFER | pomalé prejazdy po miestnosti, detaily: kľučka, okno, roh sedačky |
| ELIMINATION | ruky presúvajú kreslo, lampu, obraz. **Toto je najdôležitejší záber celého videa**, doslova ukazuje „stačí presunúť tri veci" |
| GUARANTEE | podanie ruky, alebo zatvorenie poznámkového bloku |
| BONUS | pôdorys na stole, ceruzka, vzorkovník |
| CTA a scarcity | kalendár, mobil s otvoreným formulárom |

---

# TELO C: „Bez búrania"

**Model: tepelné čerpadlá. Dream hook a Fear subhook, offer ako trojica, žiadny bonus,
garancia je záruka. 127 slov, spolu 155 slov, 64 s.**

> **[HOOK, Dream]** 12 slov
> Vedela si, že domov sa dá zmeniť na nepoznanie aj bez rekonštrukcie?
>
> **[SUBHOOK, Fear]** 16 slov
> Alebo to odkladáš, lebo sa bojíš, že to bude znamenať búranie, prach a mesiace
> v neporiadku?
>
> **[OFFER]** 38 slov
> Práve teraz robím interiérovú diagnostiku. Prídem k tebe domov a dostaneš tri veci:
> prejdenie celého priestoru, plán priorít a zoznam, čo prestať kupovať. A päť
> najdrahších chýb pri zariaďovaní domova ti pošlem zdarma ešte predtým, než sa uvidíme.
>
> **[ELIMINATION]** 24 slov
> U mňa sa nemusíš báť, že to skončí veľkou prestavbou. Väčšina vecí, ktoré ťa doma
> unavujú, sa dá vyriešiť poradím a rozmiestnením, nie búraním.
>
> **[GUARANTEE]** 22 slov
> Navyše u mňa máš garanciu funkčného priestoru. Ak po realizácii nebude fungovať tak,
> ako sme si ho nadefinovali, pracujem ďalej bez doplatku.
>
> **[CTA 1]** 12 slov
> Klikni na tlačidlo pod týmto videom a rezervuj si diagnostiku ešte dnes.
>
> **[TIME LIMIT]** 7 slov
> Termíny vypisujem vždy len na najbližší mesiac.
>
> **[SCARCITY]** 11 slov
> Ponuka platí len pre deväť klientok mesačne, chodím k nim osobne.
>
> **[CTA 2]** 13 slov
> Tak načo čakať? Klikni na tlačidlo pod týmto videom a vyber si termín.

### Čo je z čerpadiel prevzaté

| Prvok | U čerpadiel | U Miriam |
|---|---|---|
| **Dream hook, Fear subhook** | „Vedeli ste, že vaše kúrenie môže byť lacné a zároveň štýlové?" a hneď „Bojíte sa, že váš starý kotol dá čoskoro výpoveď?" | sľub bez rekonštrukcie, a hneď strach z búrania |
| **Offer ako trojica** | „obhliadnutie, nacenenie a špecifikáciu" | „prejdenie priestoru, plán priorít a zoznam, čo prestať kupovať" |
| **Guarantee je záruka, nie vrátenie peňazí** | „záruku nielen na zariadenie, ale aj na inštaláciu, až 5 rokov" | **garancia funkčného priestoru**, jej druhá garancia z webu, ktorú sme doteraz v žiadnom skripte nepoužili |
| **Žiadny bonus** | čerpadlá ho nemajú | ani toto telo ho nemá, aby sa líšilo od ostatných |
| **Formulka „pod týmto videom" už v CTA 1** | áno, v oboch CTA | áno |
| **Scarcity ako čistá kapacita** | „len pre 5 klientov týždenne" | „len pre deväť klientok mesačne" |

🔴 **Dream a Fear tesne za sebou je najsilnejší pár, aký v príkladoch je.** Sľub otvorí,
strach hneď zatvorí únikovú cestu „veď to ešte počká". Predošlé dvojice hook plus
subhook boli sľub plus sľub, čo je slabšie.

### Zábery k telu C

| Blok | Čo je v obraze |
|---|---|
| HOOK | miestnosť pred a po, rovnaký záber, iné rozmiestnenie |
| SUBHOOK | krátky záber rozbúranej steny, prach, fólie. Toto je strach, ktorý hneď vyvrátime |
| OFFER | Miriam prechádza priestorom, ukazuje rukou, píše do bloku |
| ELIMINATION | ruky presúvajú kreslo a lampu, žiadne náradie |
| GUARANTEE | hotová miestnosť, pomalý prejazd |
| CTA, time limit, scarcity | kalendár, mobil s formulárom |

---

# TELO D: „Kreslo, ktoré tu stojí len preto"

**Model: Eblaka plus vizuálny hook z Kaštieľa Hanus. Offer a bonus v jednom dychu,
elimination rieši hanbu, nie peniaze. 120 slov, spolu 148 slov, 61 s.**

> **[HOOK, vizuálny komentár]** 12 slov
> Áno, toto kreslo tu stojí len preto, že sa nezmestilo nikam inam.
>
> **[SUBHOOK, otázka na stratu]** 16 slov
> Koľko takých vecí máš doma ty? A koľko z nich si kupovala s úplne inou predstavou?
>
> **[OFFER + BONUS]** 36 slov
> Práve teraz robím interiérovú diagnostiku. Prídem k tebe domov na deväťdesiat minút
> a odídeš s plánom, čo riešiť ako prvé, a navyše, ak sa rozhodneš pre návrh odo mňa,
> celých dvestoštyridsaťdeväť eur ti z ceny odpočítam.
>
> **[ELIMINATION]** 29 slov
> A nemusíš sa báť, že to musíš najprv upratať. Ja k tebe idem presne preto, aby som
> videla, ako to u teba naozaj vyzerá. Uprataný byt mi nepovie nič.
>
> **[GUARANTEE]** 23 slov
> Máš u mňa garanciu: ak z tých deväťdesiatich minút neodídeš s jasnom, čo ďalej,
> povedz mi to na mieste a peniaze ti vrátim.
>
> **[CTA 1]** 8 slov
> Klikni a rezervuj si svoj termín ešte dnes.
>
> **[TIME LIMIT]** 7 slov
> Termíny vypisujem vždy len na najbližší mesiac.
>
> **[SCARCITY]** 4 slová
> Stihnem deväť diagnostík mesačne.
>
> **[CTA 2]** 13 slov
> Tak nečakaj, klikni na tlačidlo pod týmto videom a rezervuj si diagnostiku teraz.

### Čo je z Eblaky prevzaté

| Prvok | U Eblaky | U Miriam |
|---|---|---|
| **Offer a bonus v jednom dychu, spojené slovom „navyše"** | „skontrolujeme vaše okná zdarma a navyše, pri kompletnej renovácii vám vyrobíme dva kusy sietí" | „odídeš s plánom, a navyše, ak sa rozhodneš pre návrh, 249 € ti odpočítam" |
| **Bonus visí na väčšej zákazke, nie na prvom kroku** | siete až pri kompletnej renovácii | odpočet až pri projekte |
| **Krátke CTA 1, plná formulka až v CTA 2** | „Kliknite a rezervujte si termín" | „Klikni a rezervuj si svoj termín" |
| **Vizuálny hook** | z Kaštieľa Hanus: „Áno, toto vyrastalo na našich pasienkoch." | „Áno, toto kreslo tu stojí len preto, že sa nezmestilo nikam inam." |

🔴 **Elimination v tomto tele nerieši peniaze ani štýl, ale hanbu.** Playbook to hovorí
na príklade Garudy: *elimination musí trafiť tú námietku, ktorú má **táto** cieľovka.*
Pri službe, kde si žena púšťa cudzieho človeka do svojho neupratého bytu, je najväčšia
brzda **„veď to u mňa teraz vyzerá hrozne"**, nie cena. Túto vetu nehovorí nikto,
a pritom je to presne to, čo ženu zastaví tesne pred kliknutím.

### Zábery k telu D

Vizuálny hook musí byť **naozaj vizuálny**: kamera je pri tom kresle, Miriam naň ukazuje.

| Blok | Čo je v obraze |
|---|---|
| HOOK | detail kresla v rohu, kam nepatrí. Kamera príde k nemu |
| SUBHOOK | rýchly sled troch podobných vecí v byte |
| OFFER + BONUS | Miriam pri stole, pôdorys, ceruzka |
| ELIMINATION | bežný, neupratený obývací priestor. **Zámerne bez štylizácie** |
| GUARANTEE | podanie ruky |
| CTA, time limit, scarcity | kalendár, mobil |

⚠️ Záber k eliminaton musí byť **reálny neporiadok so súhlasom majiteľky**, nie
naaranžovaný. Naaranžovaný neporiadok je vidieť a celú vetu to zabije.

---

## Prečo je elimination v každom tele iná

Playbook, príklad Garuda: *„Elimination musí trafiť tú námietku, ktorú má **táto**
cieľovka, nie univerzálnu."* Miriamina cieľovka má dve, a obe sú doslovne na jej webe.

| Telo | Námietka, ktorú zabíja | Odkiaľ vieme, že ju má |
|---|---|---|
| **A** | „nanúti mi svoj štýl" | jej vlastná veta v sekcii „Poznáš to?": *„Bojíš sa, že ti dizajnér nanúti svoj štýl namiesto tvojho."* |
| **B** | „bude to predajný hovor a zaplatím zbytočne" | jej vlastná FAQ: *„Prečo je konzultácia platená? Aby si dostala skutočnú hodnotu, nie predajný hovor."* |
| **C** | „skončí to veľkou prestavbou, na ktorú nemám" | jej vlastná veta: *„bojíš sa, že opäť minieš a nepomôže to"*, plus bežná predstava, že dizajnér znamená rekonštrukciu |
| **D** | „veď to u mňa teraz vyzerá hrozne" | nie je na webe, je to **brzda špecifická pre návštevu doma**. Nikto ju nehovorí nahlas a pritom zastaví ženu tesne pred kliknutím. |

Všimni si stavbu vo všetkých štyroch: **najprv dôvod, potom ubezpečenie.** Ubezpečenie
bez dôvodu je prázdne. V tele A je dôvod „nechodím s hotovou predstavou, hlavne sa
pýtam", až potom „nemusíš sa báť". V tele C je dôvod „väčšina vecí sa dá vyriešiť
poradím a rozmiestnením", až potom „nemusíš sa báť prestavby".

🔴 **Elimination v tele B sa dobrovoľne pripravuje o zákazku:** *„ak stačí presunúť tri
veci, poviem ti to a projekt ti ponúkať nebudem."* Presne to robí Eblaka, keď povie,
že niektoré tesnenia netreba meniť. Je to najsilnejšia veta v celom skripte
a **Miriam ju musí naozaj dodržať**, inak je to klamstvo.

---

## Odchýlky od playbookovej šablóny, a prečo

| Šablóna hovorí | U nás | Prečo |
|---|---|---|
| OFFER je **prvý krok zdarma** | prvý krok je **platený, 249 €** | Celá stratégia stojí na tom, že sa nepredáva bezplatná konzultácia. Slovo „zdarma" v bloku ostáva, ale visí na PDF a na odpočte, presne ako Garuda vešia posturálnu analýzu zdarma na rezerváciu prvého cvičenia. |
| BONUS naviaž na väčšiu zákazku | odpočet 249 € pri projekte | Presne tak. PDF dostane každý, odpočet len tá, ktorá pokračuje projektom. Bonus tak neznižuje hodnotu diagnostiky. |
| vykanie vo všetkých príkladoch | **tykanie** | Rozhoduje zavedený hlas klientky. Miriam tyká na webe, v e-mailoch aj na Instagrame. |
| SCARCITY „prvých 50 klientov" | **„mesačne stihnem deväť"** | Playbook to hovorí priamo: okrúhla päťdesiatka je formulka, ktorú má skoro každý a nikto ju nedodržiava. Deväť je reálna kapacita, lebo diagnostika je 90 minút na mieste. |
| TIME LIMIT „do konca mesiaca" | **„termíny vypisujem len na najbližší mesiac"** | Garuda bežala 261 dní s „prvých 50 klientov". To je prešlý deadline v živej reklame. Naša formulácia je **politika, nie dátum**, takže platí stále a nemusí sa prepisovať. |

---

# Plán natáčania

Dva natáčacie dni. Telo sa nahráva raz, hooky a subhooky zvlášť.

| Deň | Čo sa točí | Koľko |
|---|---|---|
| **1** | telo A celé, plus hooky H1 az H4 a subhooky S1 az S4 na tvár | 1 telo + 8 kúskov |
| **1** | telo C celé, aj s hookom H5 a subhookom S5 | 1 telo |
| **1** | zábery k telám A a C: príchod, sedenie s klientkou, presúvanie kresla, hotová miestnosť | 20 az 30 záberov |
| **2** | zábery k telu D, vrátane **kresla v rohu** a neupratanej izby | 15 az 20 záberov |
| **2** | zábery k telu B, bez zvuku | 15 az 25 záberov |
| **2** | komentáre k telám B a D, nahovorené mimo obraz | 2 stopy |

⚠️ **Telo C potrebuje záber „pred a po" tej istej miestnosti** s iným rozmiestnením.
Ak taký nemáme, hook H5 sľubuje niečo, čo video neukáže, a telo C sa nepoužije.

### Desať reklám do prvého kola

| # | Telo | Hook + subhook | Súbor |
|---|---|---|---|
| 1 | A | H1 + S2 | `01_A_slub.mp4` |
| 2 | A | H2 + S1 | `02_A_cena.mp4` |
| 3 | A | H3 + S3 | `03_A_symptom.mp4` |
| 4 | A | H4 + S4 | `04_A_ubezpecenie.mp4` |
| 5 | B | H1 + S2 | `05_B_slub.mp4` |
| 6 | B | H2 + S1 | `06_B_cena.mp4` |
| 7 | B | H3 + S3 | `07_B_symptom.mp4` |
| 8 | B | H4 + S4 | `08_B_ubezpecenie.mp4` |
| 9 | **C** | H5 + S5, Dream a Fear | `09_C_bez-burania.mp4` |
| 10 | **D** | H6 + S6, vizuálny | `10_D_kreslo.mp4` |

Zálohy, ak niektoré video nevyjde: dvojice **H1+S4** a **H3+S1** na telo A alebo B.

---

## Pravidlá natáčania

| Vec | Ako |
|---|---|
| **Zvuk** | Najdôležitejšie zo všetkého. Klopový mikrofón, alebo natáčaj v tichu. V prázdnej izbe je ozvena, treba to skúsiť vopred. |
| **Svetlo** | Oknom do tváre. Nikdy okno za chrbtom. |
| **Prvý záber** | Musí sa hýbať. Hook je pár vety a obrazu, mení sa oboje naraz. |
| **Ukáž, o čom hovoríš** | Keď hovorí o sedačke, kamera je pri sedačke. Toto je najväčšia výhoda tohto segmentu. |
| **Strih** | Rez každé 2,5 az 5 s. |
| **Titulky** | Napevno, veľké, v strede alebo v spodnej tretine. Nikdy pri dolnom okraji, tam ich prekryje rozhranie. |
| **Nečítať z papiera** | Skript sa naučí, nepredčíta. Zaváhania znejú autenticky. |

⚠️ **Nesnaž sa o 15-sekundové video.** V meranej vzorke playbooku nebolo ani jedno
pod 30 s a najdlhšie bežiace reklamy mali 66 az 82 s. Toto nie je zábavný obsah,
je to predajný text, ktorý potrebuje čas na ponuku, garanciu aj výzvu.

---

## Čo Meta odmietne

- text cez viac než zhruba 20 % plochy videa
- hudba bez licencie
- záber, kde je vidieť tvár človeka, ktorý nedal súhlas
- **oslovenie ženy jej domnelou vlastnosťou.** Nikdy „ty, čo nevieš zariadiť byt".
  Vždy cez pocit alebo cieľ, presne ako to má copy.

⚠️ **Diagnóza sa nesmie zmeniť na obviňovanie.** Vždy „nie je to tvoja chyba, len ti to
nikto nepovedal". Kto sa cíti obvinený, neklikne.

🔴 **V žiadnom videu nesmie zaznieť „konzultácia zadarmo".** V staršom natočenom videu
to podľa auditu zaznelo a bije sa to s platenou diagnostikou. Také video sa nepoužije.

---

## ✅ Kontrola pred odovzdaním skriptu

- [x] Má 10 blokov v správnom poradí
- [x] **CTA je tam dvakrát**
- [x] Elimination je tam a má dôvod, nielen ubezpečenie
- [x] Druhé CTA obsahuje doslova „klikni na tlačidlo pod týmto videom"
- [x] Scarcity je reálna kapacita, nie okrúhle číslo
- [x] Time limit je politika, nie dátum, ktorý prejde počas kampane
- [x] 145 slov na 60 s, spočítané: 148 az 164 slov, teda 61 az 68 s
- [x] Napísané 6 hookov a 6 subhookov, nie jeden
- [x] Aspoň jedno telo má **Dream hook a hneď za ním Fear subhook** (telo C)
- [x] Aspoň jedno telo má **offer ako trojicu** (telo C)
- [x] Aspoň jedno telo má garanciu ako **záruku**, nie ako vrátenie peňazí (telo C)
- [x] Žiadne dlhé pomlčky
- [ ] 🔴 Miriam potvrdí **9 diagnostík mesačne** a vie ich ustrážiť
- [ ] 🔴 Miriam potvrdí, že **termíny vypisuje len na najbližší mesiac**
- [ ] 🔴 Miriam potvrdí **garanciu vrátenia peňazí** pri platbe vopred
- [ ] 🔴 Miriam potvrdí vetu z tela B: **„ak stačí presunúť tri veci, projekt ti ponúkať
      nebudem"**, a bude ju dodržiavať
- [ ] 🔴 Miriam potvrdí **garanciu funkčného priestoru** v tele C v tomto znení
- [ ] 🔴 Miriam potvrdí vetu z tela D: **„nemusíš to najprv upratať"**, a naozaj tak
      bude na diagnostiku chodiť
- [ ] 🔴 Súhlas klientky, ak sa točí v jej byte, hlavne pri zábere neupratanej izby
      v tele D a pri zábere „pred a po" v tele C
