/* Spoločné pre /api/rozhovor a /api/profil (lievik „Pocitový profil domova“, náhľad od 8. 10. 2026).
   Povolené odpovede z testu, musia sedieť s assets/js/profil-data.js. */
const DOVOLENE = {
  p: ["pokoj", "veselost", "hrejivost", "utulno", "luxus", "poriadok"],
  m: ["obyvacka", "spalna", "kuchyna", "detska", "predsien", "kut"],
  d: ["tma", "neporiadok", "chlad", "stiesnene", "nesedi", "nedokoncene"],
  s: ["slnko", "tma", "neviem"],
  k: ["hned", "3m", "rok", "inspiracia"],
  r: ["do600", "600-3000", "3000-8000", "8000plus", "neviem"],
};
export const platneOdpovede = (o) =>
  !!o && typeof o === "object" && Object.keys(DOVOLENE).every((k) => DOVOLENE[k].includes(o[k]));
