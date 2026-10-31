// Rechenlogik des Abi-Rechners.
// Diese Datei greift nicht auf die Oberfläche zu, damit sie für sich getestet werden kann.
// Alle pruefe-Funktionen geben { ok: true, wert } oder { ok: false, fehler } zurück.

const SPEICHER_SCHLUESSEL = "abi-rechner";

const abgelehnt = (fehler) => ({ ok: false, fehler });

function rundeAufHundertstel(wert) {
  return Math.round(wert * 100) / 100;
}

// Liest eine Zahl mit Punkt oder Komma. Gibt null bei leerer Eingabe und NaN bei keiner Zahl zurück.
// Die Regex, weil Number() allein auch "0x0A" oder "1e1" annehmen würde.
function leseZahl(eingabe) {
  const text = String(eingabe ?? "").trim();
  if (text === "") return null;
  return /^-?\d+([.,]\d+)?$/.test(text) ? Number(text.replace(",", ".")) : NaN;
}

// Mit der Liste faecher wird auch ein schon vorhandenes Fach abgelehnt, egal in welcher Schreibweise.
function pruefeName(eingabe, faecher = []) {
  const name = String(eingabe ?? "").trim();
  if (name === "") return abgelehnt("Bitte einen Fachnamen eingeben.");
  const gibtEsSchon = faecher.some((fach) => fach.name.toLowerCase() === name.toLowerCase());
  if (gibtEsSchon) return abgelehnt("Dieses Fach gibt es schon.");
  return { ok: true, wert: name };
}

function pruefePunkte(eingabe) {
  const zahl = leseZahl(eingabe);
  if (zahl === null) return abgelehnt("Bitte Punkte eingeben.");
  if (Number.isNaN(zahl)) return abgelehnt("Punkte müssen eine Zahl sein.");
  if (zahl < 0) return abgelehnt("Punkte dürfen nicht unter 0 liegen.");
  if (zahl > 15) return abgelehnt("Punkte dürfen nicht über 15 liegen.");
  if (!Number.isInteger(zahl)) return abgelehnt("Punkte müssen eine ganze Zahl sein.");
  return { ok: true, wert: zahl };
}

// Ein leeres Feld bedeutet „kein Ziel“ und ergibt wert null.
function pruefeZielNote(eingabe) {
  const zahl = leseZahl(eingabe);
  if (zahl === null) return { ok: true, wert: null };
  if (Number.isNaN(zahl)) return abgelehnt("Die Zielnote muss eine Zahl sein.");
  if (zahl < 1) return abgelehnt("Die Zielnote darf nicht besser als 1,0 sein.");
  if (zahl > 4) return abgelehnt("Schlechter als 4,0 bedeutet: Abitur nicht bestanden.");
  return { ok: true, wert: zahl };
}

// Gibt null zurück, wenn die Liste leer ist.
function durchschnitt(faecher) {
  if (faecher.length === 0) return null;
  return faecher.reduce((summe, fach) => summe + fach.punkte, 0) / faecher.length;
}

// Zwei Nachkommastellen mit Komma, z. B. "12,00"; ohne Wert ein Strich.
function formatiereSchnitt(wert) {
  return wert === null ? "–" : wert.toFixed(2).replace(".", ",");
}

// Text unter dem Zielfeld, z. B. "Note 1,6 = 12,20 Punkte · 0,30 Punkte über Ziel".
// erreicht ist null, solange es nichts zu vergleichen gibt.
function zielStatus(schnitt, zielEingabe) {
  const ziel = pruefeZielNote(zielEingabe);
  if (!ziel.ok) return { text: ziel.fehler, erreicht: null };
  if (ziel.wert === null) return { text: "", erreicht: null };
  const zielPunkte = rundeAufHundertstel(17 - 3 * ziel.wert); // Umkehrung der Abi-Formel
  const text = `Note ${String(ziel.wert).replace(".", ",")} = ${formatiereSchnitt(zielPunkte)} Punkte`;
  if (schnitt === null) return { text, erreicht: null };
  // Gerundet vergleichen, damit der angezeigte Schnitt und der Abstand zusammenpassen.
  const abstand = rundeAufHundertstel(rundeAufHundertstel(schnitt) - zielPunkte);
  const betrag = formatiereSchnitt(Math.abs(abstand));
  const vergleich = abstand === 0 ? "Ziel genau erreicht" : `${betrag} Punkte ${abstand < 0 ? "unter" : "über"} Ziel`;
  return { text: `${text} · ${vergleich}`, erreicht: abstand >= 0 };
}

// Liest den gespeicherten String { faecher, ziel }. Fehlende oder kaputte Daten ergeben einen leeren Zustand,
// ungültige oder doppelte Fächer und eine ungültige Zielnote werden verworfen.
function ladeZustand(text) {
  let daten;
  try {
    daten = JSON.parse(text);
  } catch {} // kaputtes JSON: daten bleibt undefined und ergibt unten den leeren Zustand
  if (!Array.isArray(daten?.faecher)) return { faecher: [], ziel: "" };
  const faecher = [];
  for (const eintrag of daten.faecher) {
    if (typeof eintrag?.name !== "string" || typeof eintrag?.punkte !== "number") continue;
    const name = pruefeName(eintrag.name, faecher);
    const punkte = pruefePunkte(eintrag.punkte);
    if (name.ok && punkte.ok) faecher.push({ name: name.wert, punkte: punkte.wert });
  }
  const ziel = typeof daten.ziel === "string" && pruefeZielNote(daten.ziel).ok ? daten.ziel : "";
  return { faecher, ziel };
}

// Für Tests mit Node.
if (typeof module !== "undefined") {
  module.exports = { pruefeName, pruefePunkte, pruefeZielNote, durchschnitt, formatiereSchnitt, zielStatus, ladeZustand };
}
