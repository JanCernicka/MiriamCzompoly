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

**4 hooky × 4 subhooky × 2 telá = 32 možných variantov.** Do prvej kampane sa
z nich vyberie desať. Telo sa nahráva **raz**, mení sa iba prvých päť až dvanásť sekúnd.

```
1. kolo (režim rýchly)     telo A + 4 dvojice hook/subhook   = 4 reklamy
                           telo B + 4 dvojice hook/subhook   = 4 reklamy
                           + 2 videá s referenciou klientky  = 10 reklám
2. kolo (o dva týždne)     pozri, ktoré hooky ťahajú, a nahraj k nim nové telo
```

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

## Prečo je elimination v každom tele iná

Playbook, príklad Garuda: *„Elimination musí trafiť tú námietku, ktorú má **táto**
cieľovka, nie univerzálnu."* Miriamina cieľovka má dve, a obe sú doslovne na jej webe.

| Telo | Námietka, ktorú zabíja | Odkiaľ vieme, že ju má |
|---|---|---|
| **A** | „nanúti mi svoj štýl" | jej vlastná veta v sekcii „Poznáš to?": *„Bojíš sa, že ti dizajnér nanúti svoj štýl namiesto tvojho."* |
| **B** | „bude to predajný hovor a zaplatím zbytočne" | jej vlastná FAQ: *„Prečo je konzultácia platená? Aby si dostala skutočnú hodnotu, nie predajný hovor."* |

Všimni si stavbu v oboch: **najprv dôvod, potom ubezpečenie.** Ubezpečenie bez dôvodu
je prázdne. V tele A je dôvod „nechodím s hotovou predstavou, hlavne sa pýtam",
až potom „nemusíš sa báť".

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
| **1** | telo A celé, plus všetky 4 hooky a 4 subhooky na tvár | 1 telo + 8 kúskov |
| **1** | zábery k telu A | 12 az 20 záberov |
| **2** | zábery k telu B, bez zvuku | 15 az 25 záberov |
| **2** | komentár k telu B, nahovorený mimo obraz | 1 stopa |
| **2** | 1 az 2 videá s referenciou klientky, ak je súhlas | 2 |

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
| 9 | referencia | bez hooku, hovorí klientka | `09_referencia-iveta.mp4` |
| 10 | referencia | druhá klientka | `10_referencia-2.mp4` |

🔴 Referencie len so **súhlasom so zverejnením**. Ak súhlas nie je, nahradia sa
dvojicami H1+S4 a H3+S1 zo zálohy.

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
- [x] 145 slov na 60 s, spočítané: 156 az 164 slov, teda 65 az 68 s
- [x] Napísané 4 hooky a 4 subhooky, nie jeden
- [x] Žiadne dlhé pomlčky
- [ ] 🔴 Miriam potvrdí **9 diagnostík mesačne** a vie ich ustrážiť
- [ ] 🔴 Miriam potvrdí, že **termíny vypisuje len na najbližší mesiac**
- [ ] 🔴 Miriam potvrdí **garanciu vrátenia peňazí** pri platbe vopred
- [ ] 🔴 Miriam potvrdí vetu z tela B: **„ak stačí presunúť tri veci, projekt ti ponúkať
      nebudem"**, a bude ju dodržiavať
- [ ] 🔴 Súhlas klientky, ak sa točí v jej byte alebo ide do referencie
