// Rechenlogik des Abi-Rechners.
// Diese Datei greift nicht auf die Oberfläche zu, damit sie für sich getestet werden kann.

const MIN_PUNKTE = 0;
const MAX_PUNKTE = 15;
const BESTE_NOTE = 1;
const SCHLECHTESTE_NOTE = 4;

// Erlaubt nur normale Dezimalzahlen mit Punkt oder Komma, z. B. "12", "-1" oder "1,6".
// Number() allein würde auch "0x0A" oder "1e1" annehmen.
function istDezimalzahl(text) {
  return /^-?\d+([.,]\d+)?$/.test(text);
}

// Prüft den Fachnamen. Gibt { ok: true, wert } oder { ok: false, fehler } zurück.
function pruefeName(eingabe) {
  const name = String(eingabe ?? "").trim();
  if (name === "") {
    return { ok: false, fehler: "Bitte einen Fachnamen eingeben." };
  }
  return { ok: true, wert: name };
}

// Prüft die Punkte. Erlaubt sind ganze Zahlen von 0 bis 15.
// Gibt { ok: true, wert } oder { ok: false, fehler } zurück.
function pruefePunkte(eingabe) {
  const text = String(eingabe ?? "").trim();
  if (text === "") {
    return { ok: false, fehler: "Bitte Punkte eingeben." };
  }
  if (!istDezimalzahl(text)) {
    return { ok: false, fehler: "Punkte müssen eine Zahl sein." };
  }
  const zahl = Number(text.replace(",", "."));
  if (zahl < MIN_PUNKTE) {
    return { ok: false, fehler: "Punkte dürfen nicht unter 0 liegen." };
  }
  if (zahl > MAX_PUNKTE) {
    return { ok: false, fehler: "Punkte dürfen nicht über 15 liegen." };
  }
  if (!Number.isInteger(zahl)) {
    return { ok: false, fehler: "Punkte müssen eine ganze Zahl sein." };
  }
  return { ok: true, wert: zahl };
}

// Prüft, ob es ein Fach mit diesem Namen schon gibt. Groß- und Kleinschreibung zählt nicht.
function istDoppelt(faecher, name) {
  const gesucht = name.trim().toLowerCase();
  return faecher.some((fach) => fach.name.trim().toLowerCase() === gesucht);
}

// Durchschnitt einer Liste von Fächern ({ name, punkte }).
// Gibt null zurück, wenn die Liste leer ist.
function durchschnitt(faecher) {
  if (faecher.length === 0) {
    return null;
  }
  const summe = faecher.reduce((acc, fach) => acc + fach.punkte, 0);
  return summe / faecher.length;
}

// Formatiert den Durchschnitt mit zwei Nachkommastellen und Komma, z. B. "12,00".
function formatiereSchnitt(wert) {
  if (wert === null) {
    return "–";
  }
  return wert.toFixed(2).replace(".", ",");
}

// Prüft die Zielnote. Erlaubt sind Noten von 1,0 bis 4,0, auch mit Nachkommastellen.
// Ein leeres Feld bedeutet „kein Ziel“ und gibt { ok: true, wert: null } zurück.
function pruefeZielNote(eingabe) {
  const text = String(eingabe ?? "").trim();
  if (text === "") {
    return { ok: true, wert: null };
  }
  if (!istDezimalzahl(text)) {
    return { ok: false, fehler: "Die Zielnote muss eine Zahl sein." };
  }
  const zahl = Number(text.replace(",", "."));
  if (zahl < BESTE_NOTE) {
    return { ok: false, fehler: "Die Zielnote darf nicht besser als 1,0 sein." };
  }
  if (zahl > SCHLECHTESTE_NOTE) {
    return { ok: false, fehler: "Schlechter als 4,0 bedeutet: Abitur nicht bestanden." };
  }
  return { ok: true, wert: zahl };
}

// Rundet auf zwei Nachkommastellen, damit z. B. 12,00 und 12 als gleich gelten.
function rundeAufHundertstel(wert) {
  return Math.round(wert * 100) / 100;
}

// Rechnet eine Note in einen Punkteschnitt um (Umkehrung der Abi-Formel), z. B. 1,6 → 12,2.
function noteZuPunkten(note) {
  return rundeAufHundertstel(17 - 3 * note);
}

// Vergleicht den Schnitt mit dem Ziel. Gibt null zurück, wenn einer der Werte fehlt.
// Sonst { erreicht, abstand }; abstand ist positiv, wenn der Schnitt über dem Ziel liegt.
function vergleicheMitZiel(schnitt, ziel) {
  if (schnitt === null || ziel === null) {
    return null;
  }
  const abstand = rundeAufHundertstel(rundeAufHundertstel(schnitt) - rundeAufHundertstel(ziel));
  return { erreicht: abstand >= 0, abstand };
}

// Text zum Vergleich, z. B. "1,00 Punkte unter Ziel" oder "Ziel genau erreicht".
function formatiereAbstand(vergleich) {
  if (vergleich === null) {
    return "";
  }
  if (vergleich.abstand === 0) {
    return "Ziel genau erreicht";
  }
  const betrag = formatiereSchnitt(Math.abs(vergleich.abstand));
  return vergleich.abstand < 0 ? `${betrag} Punkte unter Ziel` : `${betrag} Punkte über Ziel`;
}

const SPEICHER_SCHLUESSEL = "abi-rechner";

// Macht aus Fächern und Zielnote-Text den String, der im localStorage liegt.
function serialisiereZustand(faecher, zielText) {
  return JSON.stringify({ faecher, ziel: zielText });
}

// Liest den gespeicherten String. Bei fehlenden oder kaputten Daten kommt ein leerer Zustand zurück,
// ungültige Fächer und eine ungültige Zielnote werden verworfen. Gibt immer { faecher, ziel } zurück.
function ladeZustand(text) {
  const leer = { faecher: [], ziel: "" };
  let daten;
  try {
    daten = JSON.parse(text);
  } catch {
    return leer;
  }
  if (daten === null || typeof daten !== "object" || !Array.isArray(daten.faecher)) {
    return leer;
  }
  const faecher = [];
  for (const eintrag of daten.faecher) {
    if (
      eintrag === null ||
      typeof eintrag !== "object" ||
      typeof eintrag.name !== "string" ||
      typeof eintrag.punkte !== "number"
    ) {
      continue;
    }
    const name = pruefeName(eintrag.name);
    const punkte = pruefePunkte(eintrag.punkte);
    if (name.ok && punkte.ok) {
      faecher.push({ name: name.wert, punkte: punkte.wert });
    }
  }
  const ziel = typeof daten.ziel === "string" && pruefeZielNote(daten.ziel).ok ? daten.ziel : "";
  return { faecher, ziel };
}

// Für Tests außerhalb des Browsers (z. B. mit Node).
if (typeof module !== "undefined") {
  module.exports = {
    pruefeName,
    pruefePunkte,
    istDoppelt,
    durchschnitt,
    formatiereSchnitt,
    pruefeZielNote,
    noteZuPunkten,
    vergleicheMitZiel,
    formatiereAbstand,
    serialisiereZustand,
    ladeZustand,
  };
}
