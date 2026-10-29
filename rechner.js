// Rechenlogik des Abi-Rechners.
// Diese Datei greift nicht auf die Oberfläche zu, damit sie für sich getestet werden kann.

const MIN_PUNKTE = 0;
const MAX_PUNKTE = 15;

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
  const zahl = Number(text.replace(",", "."));
  if (Number.isNaN(zahl)) {
    return { ok: false, fehler: "Punkte müssen eine Zahl sein." };
  }
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

// Für Tests außerhalb des Browsers (z. B. mit Node).
if (typeof module !== "undefined") {
  module.exports = { pruefeName, pruefePunkte, durchschnitt, formatiereSchnitt };
}
