# Oprava AI bota a správ uvítacieho hovoru (30. 9. 2026)

Rozbor a návrhy: https://claude.ai/artifact/2kUvAwyaoN7ku8nfbPjsL7 (Jano schválil, s úpravami nižšie).
Spúšťač: Maria Berentesova 29. 9. cez chat bota, správy s anglickým dátumom, dvakrát, po termíne.

## Čo je zmenené naostro
- **Bot „test 2“** `hAQDQQamNw8ZNAiR0u7W` (Live Chat, autopilot): nové personality/goal/instructions
  (fakty: Trnava a okolie, uvítací hovor 15 min po telefóne zadarmo, diagnostika 249 €, balíky zo
  `sluzby.html`, garancie, zákazy: videohovor, iné mestá). Zmazaná akcia „Trigger Workflow 1“
  `2en0OOQ5v84WkbGUJ1iX` (spúšťala workflowy druhýkrát). Záloha pôvodného bota bola v scratchpade sedenia.
- **Kalendár** `ZSPaMWEuejcfthaFxKZt`: rezervácia najskôr o 2 hodiny.
  🔴 PUT na kalendár vynuloval neposlané polia (dĺžka 15→30, pracovné hodiny preč, formulár
  RedirectURL→ThankYouMessage). Vrátené: 15 min, po až pi 9:00 až 17:00, RedirectURL na `/podakovanie`.
- **Slovenský dátum**: polia kontaktu `contact.termn_text` (`wWfDGAz4QwNT9c3y14b1`) a `contact.termn_sms`
  (`2mt8Kgsi5jRS0wHThCQr`), plní ich `functions/api/ghl/termin.js` (webhook z workflowu,
  kľúč v Cloudflare `GHL_WEBHOOK_KLUC`). Overené testovacím workflowom (zmazaný): e-mail prišiel
  s „v piatok 2. 10. o 16:45“.
- **„WebStránka - Telefonická konzultácia potvrdenie termínu“** `8ca1a216-…` v12: webhook → 1 min →
  SMS a e-mail (nová šablóna `6abd0de57919774ef20c63e9`) so slovenským dátumom, upozornenia pre Miriam
  so slovenským dátumom, 24 h vetva „ešte si nepotvrdila“ zmazaná (13 krokov).
- **„Pripomienka termínu 2 hodiny a 10 minút pred“** `ee28a197-…` v16: čakanie na pracovný čas zmenené
  na „kedykoľvek“, texty bez zmeny.
- **WF3** `e8120656-…` v17: po 2 min webhook → 1 min, SMS a e-mail so slovenským dátumom, meno ostáva
  (Jano), SMS pre Miriam so slovenským dátumom.

## Pozor
- Polia termínu sú na kontakte jedny: keď má žena naraz hovor aj diagnostiku, platí posledná rezervácia.
- Kroky vo workflowoch majú `parentKey` predchádzajúceho kroku, GHL ho kontroluje (400 inak).
