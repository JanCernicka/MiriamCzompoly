-- Meranie lievika Miriam Czompoly. Tvar presne podľa GHLtool lievik/06_KONZOLA.md.
CREATE TABLE IF NOT EXISTS udalosti (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  cas         INTEGER NOT NULL,   -- Date.now(), milisekundy
  sid         TEXT    NOT NULL,   -- náhodné číslo návštevy, nie človek
  krok        TEXT    NOT NULL,   -- len z uzavretého zoznamu KROKY
  stranka     TEXT,
  kreativa    TEXT,               -- utm_content
  zdroj       TEXT,               -- utm_source
  zariadenie  TEXT,               -- mobil / tablet / desktop, samotný UA sa neukladá
  meta        TEXT,               -- napr. ktoré tlačidlo, koľko sekúnd
  umiestnenie TEXT,               -- utm_term
  varianta    TEXT                -- 'a' / 'b' pri A/B teste, inak NULL
);
CREATE INDEX IF NOT EXISTS idx_cas  ON udalosti (cas);
CREATE INDEX IF NOT EXISTS idx_sid  ON udalosti (sid);
CREATE INDEX IF NOT EXISTS idx_krok ON udalosti (krok, cas);
