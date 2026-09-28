# E-book a konzultácia zdarma po ňom (návrh, 28. 9. 2026)

**NIE JE naostro.** Vetva `claude/ebook-konzultacia`, náhľad https://ebook.miriam-web-staging.pages.dev/5-chyb
(náhľad má `TEST_REZIM=1`: kontakt, e-mail ani termín sa do GHL nezapíšu).

Postup (Jano): žena si stiahne e-book, pristane na „Ešte neodchádzaj“, konzultácia zadarmo
(„bežne ju účtujem“), pod tým kalendár, rezervácia jedným klikom bez písania údajov.

- `/5-chyb`: vlastný formulár (meno, e-mail, súhlas) namiesto GHL iframe `geA4rea6TYWIKcskupXQ`.
- `/api/ebook`: upsert kontaktu (zdroj ten istý ako mal GHL formulár), značka `ebook-5-chyb`,
  hneď e-mail s e-bookom cez GHL Conversations (text E1 zo step6d, bez pomlčiek a emoji).
- `/konzultacia-zdarma`: odkaz na PDF, ponuka, kalendár `ZSPaMWEuejcfthaFxKZt` (15 min, Google Meet),
  meno a e-mail zo `sessionStorage.mc_ebook`. Pixel: `CompleteRegistration` pri príchode, `Schedule`
  pri rezervácii (nie `Lead`, ten patrí kampani na diagnostiku).
- `/api/konzultacia`: GET voľné časy (celá a pol hodina), POST termín + značka `konzultacia-zdarma-ebook`.

## Prečo e-book nikomu neprišiel
WF1 „Lead magnet nurture (5 chýb)“ (`71f69ec4-…`) je postavený, ale nikdy nebol zapnutý
(`ghl/reports/FIXES-applied.md`: „stále draft, zámerne, čaká na ceny“). GHL formulár pritom
po odoslaní píše „E-book je na ceste“. Elena Serdahelyová (25. 9.) nedostala nič, nemá ani
konverzáciu. **Na ostrom webe to platí dodnes.**

Overené 28. 9.: e-mail E1 cez Conversations API na Janov testovací kontakt (team@shapelesai.com)
stav `delivered` (Mailgun). Odosielateľ je `dizajn+miriamczompoly.sk@lc.shapelesai.com`.

## Pred spustením
- Elene poslať e-book? (len s Janovým súhlasom)
- odosielateľ e-mailov: vlastná doména Miriam namiesto `lc.shapelesai.com`
- WF1 pri zapnutí spúšťať značkou `ebook-5-chyb` a začať od E2, inak príde e-book dvakrát;
  odkazy vo WF1 vedú na `miriam-web-staging.pages.dev`, prepísať na www
- staré zapnuté workflowy na kalendári konzultácie („WebStránka - Telefonická konzultácia
  potvrdenie termínu“, „Pripomienka termínu 2 hodiny a 10 minút pred“): skontrolovať texty
- dĺžka konzultácie: kalendár má 15 min, v skripte videa bolo 20
- „bežne ju účtujem“: koľko, ak to má na stránke zaznieť
- súhlas vo formulári spomína aj „občas tipy k bývaniu“ (kvôli WF1 E2 až E5), odsúhlasiť
